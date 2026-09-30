import Link from 'next/link';
import { requireAlumno } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { LIFTS } from '@/components/dayEditorHelpers';
import { formatoKg } from '@/lib/rm';
import RMInput from '@/components/RMInput';

export default async function MiProgreso() {
  const { user, profile } = await requireAlumno();
  const supabase = await createClient();

  const [{ data: rmsData }, { data: resultados }] = await Promise.all([
    supabase.from('rms').select('lift, valor_kg').eq('alumno_id', user.id),
    supabase
      .from('resultados')
      .select('wod, nota, ausente, dias(fecha, contenido)')
      .eq('alumno_id', user.id)
      .order('fecha', { foreignTable: 'dias', ascending: false })
      .limit(30),
  ]);

  const misRMs = Object.fromEntries((rmsData || []).map((r) => [r.lift, Number(r.valor_kg)]));
  const historial = (resultados || []).filter((r) => r.dias);

  return (
    <>
      <div className="phead" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
        <h2>Mi progreso</h2>
        <p className="small muted" style={{ margin: 0 }}>{profile?.nombre}</p>
      </div>

      <section className="block">
        <div className="bh">
          <span className="plate red" aria-hidden="true" />
          <h3>Mis RM</h3>
        </div>
        <ul className="rows">
          {LIFTS.map((lift) => (
            <li key={lift} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <span>{lift}</span>
                <b>{misRMs[lift] != null ? `${formatoKg(misRMs[lift])} kg` : 'Sin cargar'}</b>
              </div>
              {misRMs[lift] == null && <RMInput lift={lift} />}
            </li>
          ))}
        </ul>
      </section>

      <section className="block">
        <div className="bh">
          <span className="plate blue" aria-hidden="true" />
          <h3>Mis entrenamientos</h3>
        </div>
        {historial.length === 0 ? (
          <p className="small muted" style={{ margin: 0 }}>
            Todavía no cargaste ningún resultado. A medida que vayas entrenando, acá vas a ver tu historial completo.
          </p>
        ) : (
          <ul className="rows" style={{ gap: 2 }}>
            {historial.map((r, i) => {
              const wods = r.dias.contenido?.wods || [];
              return (
                <li key={i} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{r.dias.fecha}</span>
                    <Link href={`/ranking/${r.dias.fecha}`} className="small linkbtn">Ver ranking →</Link>
                  </div>
                  {r.ausente ? (
                    <span className="small muted">Ausente</span>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
                      {(r.wod || []).map((score, wi) => (
                        <div key={wi} className="small muted" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                          <span>{wods.length > 1 ? `WOD ${wi + 1}` : 'WOD'}{wods[wi]?.name ? ` · ${wods[wi].name}` : ''}</span>
                          <b style={{ color: 'var(--ink)' }}>{score?.texto}</b>
                        </div>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
