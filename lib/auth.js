import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

// Devuelve el usuario logueado + su perfil (nombre, rol). Si no hay sesión, manda a /login.
export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  let { data: profile } = await supabase
    .from('profiles')
    .select('id, nombre, rol, activo')
    .eq('id', user.id)
    .maybeSingle();

  // Red de seguridad: si por algún motivo el trigger de la base no corrió,
  // creamos el perfil acá para que la app no se rompa.
  if (!profile) {
    const nombre = user.email ? user.email.split('@')[0] : 'Alumno';
    const { data: created } = await supabase
      .from('profiles')
      .insert({ id: user.id, nombre, rol: 'alumno' })
      .select('id, nombre, rol, activo')
      .maybeSingle();
    profile = created;
  }

  return { user, profile };
}
