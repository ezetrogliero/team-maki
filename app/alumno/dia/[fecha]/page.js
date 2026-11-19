import Link from 'next/link';
import { requireAlumno } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import DayView from '@/components/DayView';
import ResultForm from '@/components/ResultForm';
import Asistencia from '@/components/Asistencia';
import WeekStrip from '@/components/WeekStrip';
import { contenidoParaAlumno } from '@/lib/variantes';

export default async function AlumnoDia({ params }) {
  const { fecha } = await params;
  const { user } = await requireAlumno();

  const supabase = await createClient();
  const { data: dia } = await supabase
    .from('dias')
    .select('id, contenido, nota_coach')
    .eq('fecha', fecha)
    .maybeSingle();

  const contenido = dia ? contenidoParaAlumno(dia.contenido, user.id) : null;

  let miResultado = null;
  let yoAusente = false;
  if (dia) {
    const { data } = await supabase
      .from('resultados')
      .select('wod, ausente')
      .eq('dia_id', dia.id)
      .eq('alumno_id', user.id)
      .maybeSingle();
    miResultado = data?.wod || null;
    yoAusente = !!data?.ausente;
  }

  let misRMs = {};
  if (contenido?.fuerza?.length > 0) {
    const { data: rms } = await supabase
      .from('rms')
      .select('lift, valor_kg')
      .eq('alumno_id', user.id);
    misRMs = Object.fromEntries((rms || []).map((r) => [r.lift, Number(r.valor_kg)]));
  }

  return (
    <>
      <WeekStrip fecha={fecha} basePath="/alumno/dia" />
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <p className="sub" style={{ fontWeight: 700, color: 'var(--ink)', margin: 0 }}>{fecha}</p>
        <Link href="/calendario" className="small linkbtn">Calendario →</Link>
      </div>

      {contenido?.variante && (
        <div className="banner" style={{ borderColor: 'var(--blue)' }}>
          <span>
            <strong>Hoy tenés versión alternativa</strong>
            <br />
            <span className="small muted">{contenido.variante.nombre || 'Versión alternativa'} · armada por tu coach</span>
          </span>
        </div>
      )}

      <DayView contenido={contenido} nota={dia?.nota_coach} modo="alumno" misRMs={misRMs} fecha={fecha} />

      {contenido?.variante?.sinWod && (
        <div className="note">Hoy no tenés WOD. No aparecés como pendiente ni en el ranking.</div>
      )}

      {contenido?.wods?.length > 0 && (
        yoAusente ? (
          <Asistencia fecha={fecha} ausente />
        ) : (
          <>
            <ResultForm fecha={fecha} wods={contenido.wods} existente={miResultado} />
            {!miResultado && <Asistencia fecha={fecha} ausente={false} />}
          </>
        )
      )}

      {dia && (
        <Link href={`/ranking/${fecha}`} className="btn ghost full">
          Ver ranking del día →
        </Link>
      )}
    </>
  );
}
