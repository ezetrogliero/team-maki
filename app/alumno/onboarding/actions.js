'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function completarOnboarding(nombre, rms) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'No estás logueado.' };

  const nombreLimpio = (nombre || '').trim();
  if (!nombreLimpio) return { error: 'Ingresá tu nombre.' };

  const { error: errPerfil } = await supabase
    .from('profiles')
    .update({ nombre: nombreLimpio, onboarded: true })
    .eq('id', user.id);
  if (errPerfil) return { error: errPerfil.message };

  const filas = Object.entries(rms || {})
    .map(([lift, valor]) => ({ lift, valor: Number(String(valor).replace(',', '.')) }))
    .filter((f) => f.valor > 0)
    .map((f) => ({
      alumno_id: user.id,
      lift: f.lift,
      valor_kg: f.valor,
      updated_at: new Date().toISOString(),
    }));

  if (filas.length > 0) {
    const { error: errRM } = await supabase
      .from('rms')
      .upsert(filas, { onConflict: 'alumno_id,lift' });
    if (errRM) return { error: errRM.message };
  }

  revalidatePath('/alumno');
  revalidatePath('/coach/alumnos');
  return { ok: true };
}
