import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

// Devuelve el usuario logueado + su perfil (nombre, rol). Si no hay sesión, manda a /login.
export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  let profile = await leerPerfil(supabase, user.id);

  // Red de seguridad: si por algún motivo el trigger de la base no corrió,
  // creamos el perfil acá para que la app no se rompa.
  if (!profile) {
    const nombre = user.email ? user.email.split('@')[0] : 'Alumno';
    await supabase
      .from('profiles')
      .upsert({ id: user.id, nombre, rol: 'alumno' }, { onConflict: 'id', ignoreDuplicates: true });
    // Volvemos a leer siempre (en vez de confiar en lo que devolvió el insert):
    // si el perfil ya existía (conflicto), acá sí traemos su rol real.
    profile = await leerPerfil(supabase, user.id);
  }

  return { user, profile };
}

// Igual que requireUser, pero además exige rol alumno y que ya haya
// completado el onboarding (nombre + RM iniciales). Si no, lo manda ahí.
export async function requireAlumno() {
  const { user, profile } = await requireUser();
  if (profile?.rol === 'coach') redirect('/coach');
  if (!profile?.onboarded) redirect('/alumno/onboarding');
  return { user, profile };
}

async function leerPerfil(supabase, userId, intentos = 3) {
  for (let i = 0; i < intentos; i++) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, nombre, rol, activo, onboarded')
      .eq('id', userId)
      .maybeSingle();
    if (data) return data;
    if (error) console.error('Error leyendo perfil:', error.message);
    if (i < intentos - 1) await new Promise((r) => setTimeout(r, 200));
  }
  return null;
}
