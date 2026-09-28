'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function saveDia(fecha, contenido) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'No estás logueado.' };

  const { nota, ...resto } = contenido;

  const { error } = await supabase
    .from('dias')
    .upsert(
      { fecha, contenido: resto, nota_coach: nota || null },
      { onConflict: 'fecha' }
    );

  if (error) return { error: error.message };

  revalidatePath(`/coach/dia/${fecha}`);
  revalidatePath(`/alumno`);
  return { ok: true };
}
