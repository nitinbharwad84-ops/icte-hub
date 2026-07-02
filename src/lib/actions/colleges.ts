'use server';

import { createClient } from '@/lib/supabase/server';

export async function createPartnerInquiry(_prevState: { success: boolean; error?: string }, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from('partner_inquiries').insert({
    college_name: formData.get('college_name'),
    contact_person: formData.get('contact_person'),
    phone: formData.get('phone'),
    email: formData.get('email'),
    message: formData.get('message'),
  });
  if (error) return { success: false, error: error.message };
  return { success: true };
}
