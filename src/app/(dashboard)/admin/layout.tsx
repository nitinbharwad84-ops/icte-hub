import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AdminLayoutClient } from './AdminLayoutClient';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('name, email, role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) redirect('/login');
  if (!['admin', 'owner'].includes(profile.role)) redirect('/login');

  return (
    <AdminLayoutClient user={profile}>
      {children}
    </AdminLayoutClient>
  );
}
