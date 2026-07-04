'use server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

// See also: getInternalUsersAction (owner.ts) for similar functionality

const PartnerInquirySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^\d{10,15}$/, 'Invalid phone number'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  college_name: z.string().min(1, 'College name is required'),
  institution_type: z.string().min(1, 'Type is required'),
  message: z.string().optional().default(''),
  city: z.string().optional().default(''),
});

export async function createPartnerInquiry(_prevState: { success: boolean; error?: string }, formData: FormData) {
  try {
    const raw = Object.fromEntries(formData.entries());
    const parsed = PartnerInquirySchema.safeParse(raw);
    if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

    const supabase = await createClient();
    const { error } = await supabase.from('partner_inquiries').insert({
      college_name: parsed.data.college_name,
      contact_person: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email || null,
      message: parsed.data.message || null,
      city: parsed.data.city || null,
      institution_type: parsed.data.institution_type,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'An error occurred' };
  }
}

