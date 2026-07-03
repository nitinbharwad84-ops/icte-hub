'use server';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createInstituteCourseAction(formData: { name: string; duration?: string; fees?: number }) {
  const supabase = await createClient();
  const { error } = await supabase.from('institute_courses').insert(formData);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/institute-courses');
  return { success: true };
}

export async function updateInstituteCourseAction(id: string, formData: { name: string; duration?: string; fees?: number }) {
  const supabase = await createClient();
  const { error } = await supabase.from('institute_courses').update(formData).eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/institute-courses');
  return { success: true };
}

export async function deleteInstituteCourseAction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('institute_courses').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/institute-courses');
  return { success: true };
}
