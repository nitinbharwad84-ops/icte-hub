'use server';

import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const authRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, '15 m'),
  analytics: true,
});

export async function createUserAction(formData: FormData) {
  const ip = (await headers()).get('x-forwarded-for') ?? 'unknown';
  const { success } = await authRatelimit.limit(ip);
  if (!success) return { success: false, error: 'Too many attempts. Try again later.' };
  const supabase = await createClient();
  
  // Check caller is owner or admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };
  
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();
  
  if (!profile || !['owner', 'admin'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string;

  // Admin can only create telecaller accounts
  if (profile.role === 'admin' && role !== 'telecaller') {
    return { success: false, error: 'Admins can only create telecaller accounts' };
  }

  const adminClient = createAdminClient();
  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role, created_by: user.id },
  });

  if (error) return { success: false, error: error.message };
  return { success: true, userId: data.user.id };
}

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

export async function resetUserPasswordAction(userId: string, newPassword: string) {
  const supabase = await createClient();
  
  // Only owner can reset passwords
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };
  
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();
  
  if (!profile || profile.role !== 'owner') {
    return { success: false, error: 'Only the owner can reset passwords' };
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient.auth.admin.updateUserById(userId, {
    password: newPassword,
  });

  if (error) return { success: false, error: error.message };

  // Set must_change_password to true
  await supabase.from('users').update({ must_change_password: true }).eq('id', userId);
  
  return { success: true };
}
