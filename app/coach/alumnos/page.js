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
    <main style={{ minHeight: '100vh', background: 'var(--bg)', padding: 24 }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ marginBottom: 16 }}>
          <Link href="/coach" style={{ fontSize: 13, color: 'var(--muted)' }}>
            ← Volver
          </Link>
        </div>
        <h1 style={{ fontFamily: 'var(--display)', fontSize: 26, margin: '0 0 4px' }}>
          Alumnos
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 14, margin: '0 0 20px' }}>
          Se suman solos a esta lista la primera vez que entran a{' '}
          <strong>team-maki.vercel.app</strong> con su email. Vos solo tenés que
          renombrarlos.
        </p>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, padding: 20 }}>
          {(!perfiles || perfiles.length === 0) && (
            <p style={{ color: 'var(--muted)', fontSize: 14 }}>Todavía no entró nadie.</p>
          )}
          {perfiles?.map((p) => (
            <AlumnoRow key={p.id} p={p} />
          ))}
        </div>
      </div>
    </main>
  );
}
