import { redirect, notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { LIFTS } from '@/components/dayEditorHelpers';
import { cargarPlanilla } from '@/lib/planilla';
import Planilla from '@/components/Planilla';

export default async function ProgresoAlumno({ params }) {
  const { id } = await params;
  const { profile } = await requireUser();
  if (profile?.rol !== 'coach') redirect('/alumno');

  const supabase = await createClient();
  const { data: alumno } = await supabase
    .from('profiles')
    .select('id, nombre, email, rol, activo, onboarded')
    .eq('id', id)
    .maybeSingle();

  if (!alumno) notFound();

  const datos = await cargarPlanilla(id);

  return (
    <Planilla
      nombre={alumno.nombre}
      subtitulo={`Planilla del alumno${!alumno.onboarded ? ' · todavía no completó el onboarding' : ''}`}
      backHref="/coach/alumnos"
      lifts={LIFTS}
      {...datos}
      mostrarComentarios
      coach
      activo={alumno.activo}
      alumnoId={id}
    />
  );
}
