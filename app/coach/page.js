import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { hoyFecha } from '@/lib/fecha';

export default async function CoachHome() {
  const { user, profile } = await requireUser();
  if (profile?.rol !== 'coach') redirect('/alumno');

  const hoy = hoyFecha();

  return (
    <>
      <section className="block">
        <p className="small muted" style={{ margin: 0 }}>Sesión de coach</p>
        <p style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700 }}>{profile?.nombre || user.email}</p>
        <Link href={`/coach/dia/${hoy}`} className="btn full">
          Programar el día de hoy →
        </Link>
      </section>

      <section className="block">
        <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700 }}>Alumnos</p>
        <p className="small muted" style={{ margin: '0 0 4px' }}>
          Ver y renombrar a los alumnos que ya entraron a la app.
        </p>
        <Link href="/coach/alumnos" className="linkbtn">Ir al listado →</Link>
      </section>
    </>
  );
}
