'use server';

import { z } from 'zod';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const leadRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(50, '15 m'),
  analytics: true,
});

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
  const ip = (await headers()).get('x-forwarded-for') ?? 'unknown';
  const { success } = await leadRatelimit.limit(ip);
  if (!success) return { error: 'Too many attempts. Try again later.', success: false };

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

export async function updateLeadStatusAction(leadId: string, status: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('leads')
    .update({ status })
    .eq('id', leadId);
  if (error) throw new Error(error.message);
  return { success: true };
}

export async function assignTelecallerAction(leadId: string, telecallerId: string | null) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('leads')
    .update({ assigned_telecaller_id: telecallerId })
    .eq('id', leadId);
  if (error) throw new Error(error.message);
  return { success: true };
}

export async function getCallHistoryAction(leadId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('call_logs')
    .select('*')
    .eq('lead_id', leadId)
    .order('call_date', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function checkLeadStatus(_prevState: { found: boolean; submitted: boolean }, formData: FormData) {
  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;

  const supabase = await createClient();
  const { data } = await supabase
    .from('leads')
    .select('name, status, interested_college_ids, created_at')
    .ilike('name', name)
    .eq('phone', phone);

  if (!data || data.length === 0) return { found: false, submitted: true };
  return { found: true, leads: data, submitted: true };
}
