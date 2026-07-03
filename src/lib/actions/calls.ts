'use server';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function logCallAction(leadId: string, outcome: string, notes: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('call_logs').insert({
    lead_id: leadId,
    outcome,
    notes,
  });
  if (error) throw new Error(error.message);
  revalidatePath('/admin');
  revalidatePath('/telecaller');
  return { success: true };
}

export async function getCallLogsAction(leadId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('call_logs')
    .select('*')
    .eq('lead_id', leadId)
    .order('call_date', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}
