import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { OwnerLayoutClient } from './OwnerLayoutClient';

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users')
    .select('name, email, role')
    .eq('id', user.id)
    .single();

  if (!profile) redirect('/login');
  if (profile.role !== 'owner') redirect('/admin');

  return (
    <OwnerLayoutClient user={profile}>
      {children}
    </OwnerLayoutClient>
  );
}
