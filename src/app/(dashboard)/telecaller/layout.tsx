import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { TelecallerLayoutClient } from './TelecallerLayoutClient';

export default async function TelecallerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: profile, error: profileError } = await supabase.from('users').select('name, role').eq('id', user.id).single();
  if (profileError || !profile) redirect('/login');
  if (profile.role !== 'telecaller') redirect('/' + profile.role);
  
  return <TelecallerLayoutClient profile={profile}>{children}</TelecallerLayoutClient>;
}
