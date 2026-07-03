import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { TelecallerLayoutClient } from './TelecallerLayoutClient';

export default async function TelecallerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: profile } = await supabase.from('users').select('name, role').eq('id', user.id).single();
  if (!profile || profile.role !== 'telecaller') redirect('/login');
  
  return <TelecallerLayoutClient profile={profile}>{children}</TelecallerLayoutClient>;
}
