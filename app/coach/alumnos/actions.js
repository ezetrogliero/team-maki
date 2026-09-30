'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth';

export async function actualizarAlumno(id, patch) {
  const supabase = await createClient();
  const { error } = await supabase.from('profiles').update(patch).eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/coach/alumnos');
  revalidatePath(`/coach/alumnos/${id}`);
  return { ok: true };
}

// La coach corrige o carga a mano el RM de un alumno (ej: cuando el alumno no lo sabe cargar solo).
export async function corregirRM(alumnoId, lift, valorKgInput) {
  const { profile } = await requireUser();
  if (profile?.rol !== 'coach') return { error: 'No autorizado.' };

  const valor = Number(String(valorKgInput).replace(',', '.'));
  if (!valor || valor <= 0) return { error: 'Ingresá un peso válido en kg.' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('rms')
    .upsert(
      { alumno_id: alumnoId, lift, valor_kg: valor, updated_at: new Date().toISOString() },
      { onConflict: 'alumno_id,lift' }
    );
  if (error) return { error: error.message };

  await supabase.from('rm_historial').insert({
    alumno_id: alumnoId,
    ejercicio: lift,
    valor_kg: valor,
    fecha: new Date().toISOString().slice(0, 10),
  });

  revalidatePath(`/coach/alumnos/${alumnoId}`);
  revalidatePath('/coach/alumnos');
  return { ok: true, valor_kg: valor };
}
