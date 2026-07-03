import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            const cookieOpts = {
              ...options,
              httpOnly: true,
              sameSite: 'lax' as const,
              secure: process.env.NODE_ENV === 'production',
              path: '/',
            };
            cookieStore.set(name, value, cookieOpts);
          });
        },
      },
    }
  );
}
