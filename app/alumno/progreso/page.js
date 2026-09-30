import { requireAlumno } from '@/lib/auth';
import { LIFTS } from '@/components/dayEditorHelpers';
import { cargarPlanilla } from '@/lib/planilla';
import Planilla from '@/components/Planilla';

export default async function MiProgreso() {
  const { user, profile } = await requireAlumno();
  const datos = await cargarPlanilla(user.id);

  return (
    <Planilla
      nombre={profile?.nombre}
      subtitulo="Mi progreso"
      lifts={LIFTS}
      {...datos}
      mostrarComentarios
      coach={false}
    />
  );
}
