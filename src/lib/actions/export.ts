'use server';
import { createClient } from '@/lib/supabase/server';

export async function exportLeadsCsvAction() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('leads')
    .select('name, phone, email, status, created_at')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  const headers = 'Name,Phone,Email,Status,Created';
  const rows = data.map(l => `${l.name},${l.phone},${l.email || ''},${l.status},${l.created_at}`);
  return [headers, ...rows].join('\n');
}

export async function exportPartnerInquiriesCsvAction() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('partner_inquiries')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  const headers = 'College Name,Contact Person,Phone,Email,Status,Created';
  const rows = data.map(l => `${l.college_name},${l.contact_person || ''},${l.phone || ''},${l.email || ''},${l.status || 'new'},${l.created_at}`);
  return [headers, ...rows].join('\n');
}
