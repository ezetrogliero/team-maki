'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function guardarResultado(fecha, scores, nota) {
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
      wod: scores,
      nota: nota || null,
    },
    { onConflict: 'dia_id,alumno_id' }
  );

  if (error) return { error: error.message };

  revalidatePath(`/alumno/dia/${fecha}`);
  revalidatePath(`/ranking/${fecha}`);
  return { ok: true };
}
