'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function getAdminsAction() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized', data: [] };

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'owner') {
    return { success: false, error: 'Unauthorized', data: [] };
  }

  const adminClient = createAdminClient();
  const { data: authData, error: authError } = await adminClient.auth.admin.listUsers();
  if (authError) return { success: false, error: authError.message, data: [] };

  const adminAuthUsers = authData.users.filter(u =>
    u.user_metadata?.role === 'admin'
  );

  const adminIds = adminAuthUsers.map(u => u.id);

  let publicUsersMap = new Map<string, { is_active: boolean; name: string }>();
  if (adminIds.length > 0) {
    const { data: publicUsers } = await supabase
      .from('users')
      .select('id, is_active, name')
      .in('id', adminIds);
    (publicUsers || []).forEach(u => publicUsersMap.set(u.id, u));
  }

  const admins = adminAuthUsers.map(au => ({
    id: au.id,
    name: publicUsersMap.get(au.id)?.name || au.user_metadata?.name || '',
    email: au.email || '',
    is_active: publicUsersMap.get(au.id)?.is_active ?? true,
    created_at: au.created_at,
    last_sign_in_at: au.last_sign_in_at ?? null,
  }));

  return { success: true, data: admins };
}

export async function createAdminAction(name: string, email: string, password: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'owner') {
    return { success: false, error: 'Unauthorized' };
  }

  const adminClient = createAdminClient();
  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role: 'admin', created_by: user.id },
  });

  if (error) return { success: false, error: error.message };
  return { success: true, userId: data.user.id, tempPassword: password };
}

export async function toggleAdminActiveAction(userId: string, isActive: boolean) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'owner') {
    return { success: false, error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('users')
    .update({ is_active: isActive })
    .eq('id', userId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function resetAdminPasswordAction(userId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'owner') {
    return { success: false, error: 'Unauthorized' };
  }

  const tempPassword = crypto.randomUUID().slice(0, 12) + 'Aa1!';

  const adminClient = createAdminClient();
  const { error } = await adminClient.auth.admin.updateUserById(userId, {
    password: tempPassword,
  });

  if (error) return { success: false, error: error.message };

  const { error: updateError } = await supabase.from('users').update({ must_change_password: true }).eq('id', userId);
  if (updateError) return { success: false, error: updateError.message };

  return { success: true, tempPassword };
}

export async function deleteAdminAction(userId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'owner') {
    return { success: false, error: 'Unauthorized' };
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient.auth.admin.deleteUser(userId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function getInternalUsersAction(search?: string, roleFilter?: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized', data: [] };

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'owner') {
    return { success: false, error: 'Unauthorized', data: [] };
  }

  const adminClient = createAdminClient();
  const { data: authData, error: authError } = await adminClient.auth.admin.listUsers();
  if (authError) return { success: false, error: authError.message, data: [] };

  let filteredAuthUsers = authData.users.filter(u =>
    u.user_metadata?.role === 'admin' || u.user_metadata?.role === 'telecaller'
  );

  if (roleFilter && roleFilter !== 'all') {
    filteredAuthUsers = filteredAuthUsers.filter(u => u.user_metadata?.role === roleFilter);
  }

  const ids = filteredAuthUsers.map(u => u.id);

  let publicUsersMap = new Map<string, { is_active: boolean; name: string }>();
  if (ids.length > 0) {
    const { data: publicUsers } = await supabase
      .from('users')
      .select('id, is_active, name')
      .in('id', ids);
    (publicUsers || []).forEach(u => publicUsersMap.set(u.id, u));
  }

  const { data: lastActivityData } = await supabase
    .from('audit_logs')
    .select('user_id, created_at')
    .in('user_id', ids)
    .order('created_at', { ascending: false });

  const lastActivityMap = new Map<string, string>();
  const seen = new Set<string>();
  (lastActivityData || []).forEach(log => {
    if (!seen.has(log.user_id)) {
      seen.add(log.user_id);
      lastActivityMap.set(log.user_id, log.created_at);
    }
  });

  let users = filteredAuthUsers.map(au => ({
    id: au.id,
    name: publicUsersMap.get(au.id)?.name || au.user_metadata?.name || '',
    email: au.email || '',
    role: au.user_metadata?.role || '',
    is_active: publicUsersMap.get(au.id)?.is_active ?? true,
    last_activity: lastActivityMap.get(au.id) || null,
    created_at: au.created_at,
  }));

  if (search) {
    const q = search.toLowerCase();
    users = users.filter(u =>
      u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }

  return { success: true, data: users };
}

export async function getUserProfileAction(userId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized', data: null };

  const { data: profile } = await supabase
    .from('users')
    .select('name, email, role, is_active')
    .eq('id', userId)
    .single();

  if (!profile) return { success: false, error: 'User not found', data: null };

  return { success: true, data: profile };
}

export async function getUserAuditLogsAction(
  userId: string,
  page: number = 1,
  pageSize: number = 50,
  actionFilter?: string,
  entityFilter?: string
) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized', data: [], count: 0 };

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'owner') {
    return { success: false, error: 'Unauthorized', data: [], count: 0 };
  }

  let query = supabase
    .from('audit_logs')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (actionFilter) {
    query = query.eq('action', actionFilter);
  }

  if (entityFilter) {
    query = query.eq('target_entity', entityFilter);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) return { success: false, error: error.message, data: [], count: 0 };
  return { success: true, data: data || [], count: count || 0 };
}
