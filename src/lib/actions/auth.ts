'use server';

import { createClient } from '@/lib/supabase/server';

export async function toggleUserActiveAction(userId: string, isActive: boolean) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };
  
  const { error } = await supabase
    .from('users')
    .update({ is_active: isActive })
    .eq('id', userId);
  
  if (error) return { success: false, error: error.message };
  return { success: true };
}


