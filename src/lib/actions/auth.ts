'use server';

import { createClient } from '@/lib/supabase/server';

export async function toggleUserActiveAction(userId: string, isActive: boolean) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
  if (!profile || !['admin', 'owner'].includes(profile.role)) {
    return { success: false, error: 'Not authorized — only admins and owners can manage users' };
  }

  const { error } = await supabase
    .from('users')
    .update({ is_active: isActive })
    .eq('id', userId);
  
  if (error) return { success: false, error: error.message };
  return { success: true };
}


