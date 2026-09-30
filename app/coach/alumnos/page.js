import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { hoyFecha } from '@/lib/fecha';
import { LIFTS } from '@/components/dayEditorHelpers';
import AlumnoRow from '@/components/AlumnoRow';

export default async function Alumnos() {
  const { profile } = await requireUser();
  if (profile?.rol !== 'coach') redirect('/alumno');

  const supabase = await createClient();
  const hoy = hoyFecha();

  const [{ data: perfiles }, { data: diaHoy }, { data: rmsData }] = await Promise.all([
    supabase.from('profiles').select('id, nombre, rol, activo, email').order('nombre'),
    supabase.from('dias').select('id, contenido').eq('fecha', hoy).maybeSingle(),
    supabase.from('rms').select('alumno_id, lift'),
  ]);

  let resultadosHoy = [];
  if (diaHoy) {
    const { data } = await supabase
      .from('resultados')
      .select('alumno_id, wod, ausente')
      .eq('dia_id', diaHoy.id);
    resultadosHoy = data || [];
  }

  const rmCounts = {};
  (rmsData || []).forEach((r) => {
    rmCounts[r.alumno_id] = (rmCounts[r.alumno_id] || 0) + 1;
  });

  const wodsHoy = diaHoy?.contenido?.wods || [];
  const wodHoyNombre = wodsHoy[0]?.name || (wodsHoy.length ? 'WOD' : null);

  const estadosHoy = {};
  resultadosHoy.forEach((r) => {
    estadosHoy[r.alumno_id] = r.ausente ? { ausente: true } : { score: r.wod?.[0]?.texto };
  });

  const activos = (perfiles || []).filter((p) => p.activo);

  return (
    <>
      <div className="phead" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
        <h2>Alumnos</h2>
        <p className="small muted" style={{ margin: 0 }}>
          {activos.length} activos · se suman solos a esta lista la primera vez que entran a{' '}
          <strong>team-maki.vercel.app</strong> con su email.
        </p>
      </div>

      <Link href="/coach/alumnos/rms" className="btn ghost">RMs del grupo por ejercicio</Link>

      <div className="alist">
        {(!perfiles || perfiles.length === 0) && (
          <p className="small muted">Todavía no entró nadie.</p>
        )}
        {perfiles?.map((p) => (
          <AlumnoRow
            key={p.id}
            p={p}
            rmCount={rmCounts[p.id] || 0}
            totalLifts={LIFTS.length}
            estadoHoy={estadosHoy[p.id]}
            wodHoyNombre={wodHoyNombre}
          />
        ))}
      </div>
    </>
  );
}
