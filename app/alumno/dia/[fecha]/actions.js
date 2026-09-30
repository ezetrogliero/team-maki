'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function guardarResultado(fecha, scores, nota, fuerza) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'No estás logueado.' };

  const { data: dia, error: diaError } = await supabase
    .from('dias')
    .select('id')
    .eq('fecha', fecha)
    .maybeSingle();

  if (diaError || !dia) return { error: 'Todavía no hay programación cargada para este día.' };

  const { error } = await supabase.from('resultados').upsert(
    {
      dia_id: dia.id,
      alumno_id: user.id,
      wod: scores.length ? scores : null,
      fuerza: fuerza && Object.keys(fuerza).length ? fuerza : null,
      nota: nota || null,
    },
    { onConflict: 'dia_id,alumno_id' }
  );

  if (error) return { error: error.message };

  revalidatePath(`/alumno/dia/${fecha}`);
  revalidatePath(`/ranking/${fecha}`);
  revalidatePath('/alumno/progreso');
  return { ok: true };
}

export async function marcarAusente(fecha) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'No estás logueado.' };

  const { data: dia, error: diaError } = await supabase
    .from('dias')
    .select('id')
    .eq('fecha', fecha)
    .maybeSingle();
  if (diaError || !dia) return { error: 'Todavía no hay programación cargada para este día.' };

  const { error } = await supabase.from('resultados').upsert(
    { dia_id: dia.id, alumno_id: user.id, ausente: true, wod: null },
    { onConflict: 'dia_id,alumno_id' }
  );
  if (error) return { error: error.message };

  revalidatePath(`/alumno/dia/${fecha}`);
  revalidatePath(`/ranking/${fecha}`);
  return { ok: true };
}

export async function desmarcarAusente(fecha) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'No estás logueado.' };

  const { data: dia } = await supabase.from('dias').select('id').eq('fecha', fecha).maybeSingle();
  if (!dia) return { error: 'No se encontró el día.' };

  const { error } = await supabase
    .from('resultados')
    .delete()
    .eq('dia_id', dia.id)
    .eq('alumno_id', user.id);
  if (error) return { error: error.message };

  revalidatePath(`/alumno/dia/${fecha}`);
  revalidatePath(`/ranking/${fecha}`);
  return { ok: true };
}
