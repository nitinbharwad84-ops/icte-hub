'use server';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createCollegeAction(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from('colleges').insert({
    name: formData.get('name'),
    city: formData.get('city'),
    state: formData.get('state'),
    type: formData.get('type'),
    established_year: formData.get('established_year') ? Number(formData.get('established_year')) : null,
    website: formData.get('website'),
    description: formData.get('description'),
    status: formData.get('status') || 'active',
  });
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/colleges');
  return { success: true };
}

export async function updateCollegeAction(id: string, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from('colleges').update({
    name: formData.get('name'),
    city: formData.get('city'),
    state: formData.get('state'),
    type: formData.get('type'),
    established_year: formData.get('established_year') ? Number(formData.get('established_year')) : null,
    website: formData.get('website'),
    description: formData.get('description'),
    status: formData.get('status'),
  }).eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/colleges');
  return { success: true };
}

export async function deleteCollegeAction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('colleges').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/colleges');
  return { success: true };
}

