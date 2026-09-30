'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function completarOnboarding(nombre, rms) {
  try {
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
    if (errPerfil) {
      console.error('Error guardando perfil en onboarding:', errPerfil.message);
      return { error: `No se pudo guardar tu nombre (${errPerfil.message}). Avisale a la coach.` };
    }

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
      if (errRM) {
        console.error('Error guardando RM en onboarding:', errRM.message);
        return { error: `Tu nombre se guardó, pero hubo un error con el RM (${errRM.message}). Podés cargarlo después.` };
      }

      const hoy = new Date().toISOString().slice(0, 10);
      await supabase.from('rm_historial').insert(
        filas.map((f) => ({ alumno_id: user.id, ejercicio: f.lift, valor_kg: f.valor_kg, fecha: hoy }))
      );
    }

    revalidatePath('/alumno');
    revalidatePath('/coach/alumnos');
    return { ok: true };
  } catch (err) {
    console.error('Error inesperado en completarOnboarding:', err);
    return { error: 'Ocurrió un error inesperado. Probá de nuevo en unos segundos.' };
  }
}
