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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  const publicPaths = ['/colleges', '/check-status', '/partner-with-us', '/privacy', '/terms', '/disclaimer'];
  const isPublic = path === '/' || publicPaths.some(p => path.startsWith(p));
  if (isPublic) return supabaseResponse;

  if (path === '/login') {
    if (!user) return supabaseResponse;
    const { data: profile } = await supabase.from('users').select('role,must_change_password').eq('id', user.id).single();
    if (profile?.must_change_password) return NextResponse.redirect(new URL('/change-password', request.url));
    return NextResponse.redirect(new URL(`/${profile?.role || 'telecaller'}`, request.url));
  }

  if (!user) return NextResponse.redirect(new URL('/login', request.url));
  const { data: profile } = await supabase.from('users').select('role,must_change_password,is_active').eq('id', user.id).single();

  if (!profile || !profile.is_active) {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (profile.must_change_password && path !== '/change-password') {
    return NextResponse.redirect(new URL('/change-password', request.url));
  }
  if (path === '/change-password') return supabaseResponse;

  const role = profile.role;
  if (path.startsWith('/owner') && role !== 'owner') return NextResponse.redirect(new URL(`/${role}`, request.url));
  if (path.startsWith('/admin') && !['admin', 'owner'].includes(role)) return NextResponse.redirect(new URL(`/${role}`, request.url));
  if (path.startsWith('/telecaller') && role !== 'telecaller') return NextResponse.redirect(new URL(`/${role}`, request.url));

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
