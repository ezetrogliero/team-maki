'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function guardarRM(fecha, lift, valorKgInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'No estás logueado.' };
  if (!lift) return { error: 'Este bloque no tiene un ejercicio de RM asociado.' };

  const valor = Number(String(valorKgInput).replace(',', '.'));
  if (!valor || valor <= 0) return { error: 'Ingresá un peso válido en kg.' };

  const { data: actual } = await supabase
    .from('rms')
    .select('valor_kg')
    .eq('alumno_id', user.id)
    .eq('lift', lift)
    .maybeSingle();

  if (actual && Number(actual.valor_kg) >= valor) {
    return { ok: true, actualizado: false, valor_kg: Number(actual.valor_kg) };
  }

  const { error } = await supabase
    .from('rms')
    .upsert(
      { alumno_id: user.id, lift, valor_kg: valor, updated_at: new Date().toISOString() },
      { onConflict: 'alumno_id,lift' }
    );

  if (error) return { error: error.message };

  revalidatePath(`/alumno/dia/${fecha}`);
  return { ok: true, actualizado: true, valor_kg: valor };
}
