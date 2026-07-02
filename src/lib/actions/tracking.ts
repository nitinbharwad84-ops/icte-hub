'use server';

import { createClient } from '@/lib/supabase/server';

export async function trackVisitorAction(sessionId: string, action: string, payload: Record<string, unknown>) {
  const supabase = await createClient();

  // Check if session exists
  const { data: existing } = await supabase
    .from('visitors')
    .select('id, viewed_colleges, mode_filters_used')
    .eq('session_id', sessionId)
    .single();

  if (existing) {
    const updates: Record<string, unknown> = { last_seen_at: new Date().toISOString() };

    if (action === 'view_college') {
      const viewed = (existing.viewed_colleges as Array<Record<string, unknown>>) || [];
      const existingIdx = viewed.findIndex((v: Record<string, unknown>) => v.college_id === payload.college_id);
      if (existingIdx >= 0) {
        viewed[existingIdx] = { ...viewed[existingIdx], count: ((viewed[existingIdx].count as number) || 0) + 1, last_viewed: new Date().toISOString() };
      } else {
        viewed.push({ college_id: payload.college_id, college_name: payload.college_name, count: 1, last_viewed: new Date().toISOString() });
      }
      updates.viewed_colleges = viewed;
    }

    if (action === 'filter_change') {
      const modes = (existing.mode_filters_used as string[]) || [];
      if (payload.mode && !modes.includes(payload.mode as string)) {
        updates.mode_filters_used = [...modes, payload.mode];
      }
    }

    if (action === 'converted') {
      updates.converted_to_lead_id = payload.lead_id;
    }

    await supabase.from('visitors').update(updates).eq('session_id', sessionId);
  } else {
    const insert: Record<string, unknown> = {
      session_id: sessionId,
      first_seen_at: new Date().toISOString(),
      last_seen_at: new Date().toISOString(),
    };

    if (action === 'view_college') {
      insert.viewed_colleges = [{ college_id: payload.college_id, college_name: payload.college_name, count: 1, last_viewed: new Date().toISOString() }];
    }
    if (action === 'filter_change' && payload.mode) {
      insert.mode_filters_used = [payload.mode];
    }

    await supabase.from('visitors').insert(insert);
  }

  return { success: true };
}

export async function exportCsvAction(table: string, filters?: Record<string, unknown>) {
  const supabase = await createClient();
  
  let query = supabase.from(table).select('*');
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) query = query.eq(key, value);
    });
  }
  
  const { data, error } = await query;
  if (error || !data) return { success: false, error: error?.message };
  
  // Convert to CSV
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => 
    Object.values(row).map(val => 
      typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
    ).join(',')
  ).join('\n');
  
  return { success: true, csv: `${headers}\n${rows}` };
}
