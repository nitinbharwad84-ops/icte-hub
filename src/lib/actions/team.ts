'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function createTelecallerAction(name: string, email: string, phone: string) {
  const supabase = await createClient();

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

  const tempPassword = crypto.randomUUID().slice(0, 12) + 'Aa1!';

  const adminClient = createAdminClient();
  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { name, role: 'telecaller', phone, created_by: user.id },
  });

  if (error) return { success: false, error: error.message };
  return { success: true, userId: data.user.id, tempPassword };
}

export async function getTelecallersAction() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized', data: [] };

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['owner', 'admin'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized', data: [] };
  }

  const adminClient = createAdminClient();
  const { data: authData, error: authError } = await adminClient.auth.admin.listUsers();
  if (authError) return { success: false, error: authError.message, data: [] };

  const telecallerAuthUsers = authData.users.filter(u =>
    u.user_metadata?.role === 'telecaller'
  );

  const telecallerIds = telecallerAuthUsers.map(u => u.id);

  let publicUsersMap = new Map<string, { is_active: boolean }>();
  if (telecallerIds.length > 0) {
    const { data: publicUsers } = await supabase
      .from('users')
      .select('id, is_active')
      .in('id', telecallerIds);
    (publicUsers || []).forEach(u => publicUsersMap.set(u.id, u));
  }

  const { data: leadCounts } = await supabase
    .from('leads')
    .select('assigned_telecaller_id');

  const countMap = new Map<string, number>();
  leadCounts?.forEach(l => {
    if (l.assigned_telecaller_id) {
      countMap.set(l.assigned_telecaller_id, (countMap.get(l.assigned_telecaller_id) || 0) + 1);
    }
  });

  const telecallers = telecallerAuthUsers.map(au => ({
    id: au.id,
    name: au.user_metadata?.name || '',
    email: au.email || '',
    phone: au.user_metadata?.phone || '',
    is_active: publicUsersMap.get(au.id)?.is_active ?? true,
    leads_count: countMap.get(au.id) || 0,
    created_at: au.created_at,
    last_sign_in_at: au.last_sign_in_at ?? null,
  }));

  return { success: true, data: telecallers };
}
