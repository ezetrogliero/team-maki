'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function actualizarAlumno(id, patch) {
  const supabase = await createClient();
  const { error } = await supabase.from('profiles').update(patch).eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/coach/alumnos');
  return { ok: true };
}
