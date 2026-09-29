import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import AlumnoRow from '@/components/AlumnoRow';

export default async function Alumnos() {
  const { profile } = await requireUser();
  if (profile?.rol !== 'coach') redirect('/alumno');

  const supabase = await createClient();
  const { data: perfiles } = await supabase
    .from('profiles')
    .select('id, nombre, rol, activo, email')
    .order('nombre');

  return (
    <div className="shell">
      <Link href="/coach" className="back small linkbtn">← Volver</Link>
      <div className="phead" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
        <h2>Alumnos</h2>
        <p className="small muted" style={{ margin: 0 }}>
          Se suman solos a esta lista la primera vez que entran a{' '}
          <strong>team-maki.vercel.app</strong> con su email. Vos solo tenés que renombrarlos.
        </p>
      </div>

      <div className="alist">
        {(!perfiles || perfiles.length === 0) && (
          <p className="small muted">Todavía no entró nadie.</p>
        )}
        {perfiles?.map((p) => (
          <AlumnoRow key={p.id} p={p} />
        ))}
      </div>
    </div>
  );
}
