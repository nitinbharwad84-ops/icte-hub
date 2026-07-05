import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            const cookieOpts = {
              ...options,
              httpOnly: true,
              sameSite: 'lax' as const,
              secure: process.env.NODE_ENV === 'production',
              path: '/',
            };
            supabaseResponse.cookies.set(name, value, cookieOpts);
          });
        },
      },
    }
  );

  try {
    const { data: { user } } = await supabase.auth.getUser();
    const path = request.nextUrl.pathname;

    const publicPaths = ['/tracking', '/colleges', '/check-status', '/partner-with-us', '/privacy', '/terms', '/disclaimer'];
    const isPublic = path === '/' || publicPaths.some(p => path.startsWith(p));
    if (isPublic) return supabaseResponse;

    if (path === '/login') {
      if (!user) return supabaseResponse;

      let profile;
      try {
        const { data } = await supabase.from('users').select('role,must_change_password').eq('id', user.id).single();
        profile = data;
      } catch {
        profile = null;
      }

      const dashPath = `/${profile?.role || 'telecaller'}`;
      if (profile?.must_change_password) return NextResponse.redirect(new URL(`${dashPath}?change_password=true`, request.url));
      return NextResponse.redirect(new URL(dashPath, request.url));
    }

    if (!user) return NextResponse.redirect(new URL('/login', request.url));

    let profile;
    try {
      const { data } = await supabase.from('users').select('role,must_change_password,is_active').eq('id', user.id).single();
      profile = data;
    } catch {
      profile = null;
    }

    if (!profile || !profile.is_active) {
      try {
        await supabase.auth.signOut();
      } catch {
        // signOut failed, still redirect to login
      }
      if (profile && !profile.is_active) {
        return NextResponse.redirect(new URL('/login?reason=deactivated', request.url));
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (path === '/change-password') {
      return NextResponse.redirect(new URL(`/${profile.role || 'telecaller'}`, request.url));
    }

    const role = profile.role;
    if (path.startsWith('/owner') && role !== 'owner') return NextResponse.redirect(new URL(`/${role}`, request.url));
    if (path.startsWith('/admin') && !['admin', 'owner'].includes(role)) return NextResponse.redirect(new URL(`/${role}`, request.url));
    if (path.startsWith('/telecaller') && role !== 'telecaller') return NextResponse.redirect(new URL(`/${role}`, request.url));

    return supabaseResponse;
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};