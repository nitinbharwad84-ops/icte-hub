'use server';

import { z } from 'zod';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

let ratelimit: Ratelimit | null = null;
try {
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(50, '15 m'),
  });
} catch {}

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
  if (ratelimit) {
    const ip = (await headers()).get('x-forwarded-for') ?? 'unknown';
    const { success } = await ratelimit.limit(ip);
    if (!success) return { error: 'Too many requests. Try again later.', success: false };
  }

  const parsed = LeadSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors, success: false };
  }

  const supabase = await createClient();

  const { error } = await supabase.from('leads').insert({
    name: parsed.data.name,
    phone: parsed.data.phone,
    email: parsed.data.email || null,
    interested_college_ids: parsed.data.college_ids?.length ? parsed.data.college_ids : [],
    course_id: parsed.data.course_id || null,
    message: parsed.data.message || null,
    source: 'direct',
  });

  if (error) return { error: error.message, success: false };
  revalidatePath('/admin');
  return { success: true, message: 'Inquiry submitted successfully!' };
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
