'use server';

import { z } from 'zod';

const LeadSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  college_ids: z.array(z.string()).optional(),
  course_id: z.string().optional(),
  message: z.string().optional(),
});

type LeadInput = z.infer<typeof LeadSchema>;

export async function createLeadAction(data: LeadInput) {
  const parsed = LeadSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors, success: false };
  }

  try {
    // TODO: Integrate with Supabase backend
    return { success: true, message: 'Inquiry submitted successfully!' };
  } catch {
    return { error: 'Something went wrong. Please try again.', success: false };
  }
}
