import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { LIFTS } from '@/components/dayEditorHelpers';
import RmGrupoTable from '@/components/RmGrupoTable';

export default async function RMsGrupo() {
  const { profile } = await requireUser();
  if (profile?.rol !== 'coach') redirect('/alumno');

  const supabase = await createClient();
  const [{ data: perfiles }, { data: rmsData }] = await Promise.all([
    supabase.from('profiles').select('id, nombre').eq('rol', 'alumno').eq('activo', true).order('nombre'),
    supabase.from('rms').select('alumno_id, lift, valor_kg'),
  ]);

  const rmsPorAlumno = {};
  (rmsData || []).forEach((r) => {
    (rmsPorAlumno[r.alumno_id] ||= {})[r.lift] = Number(r.valor_kg);
  });

  const alumnos = (perfiles || []).map((p) => ({ id: p.id, nombre: p.nombre, rms: rmsPorAlumno[p.id] || {} }));

  return (
    <>
      <Link href="/coach/alumnos" className="btn ghost sm back">‹ Alumnos</Link>
      <RmGrupoTable alumnos={alumnos} lifts={LIFTS} />
    </>
  );
}
