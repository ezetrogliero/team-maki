import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

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

  const [{ data: rms }, { data: resultados }] = await Promise.all([
    supabase.from('rms').select('lift, valor_kg, updated_at').eq('alumno_id', id).order('lift'),
    supabase
      .from('resultados')
      .select('wod, nota, ausente, dias(fecha, contenido)')
      .eq('alumno_id', id)
      .order('fecha', { foreignTable: 'dias', ascending: false })
      .limit(30),
  ]);

  return (
    <>
      <Link href="/coach/alumnos" className="back small linkbtn">← Volver a alumnos</Link>

      <div className="phead" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
        <h2>{alumno.nombre}</h2>
        <p className="small muted" style={{ margin: 0 }}>
          {alumno.email}
          {!alumno.activo && ' · Desactivado'}
          {!alumno.onboarded && ' · Todavía no completó el onboarding'}
        </p>
      </div>

      <section className="block">
        <div className="bh">
          <span className="plate red" aria-hidden="true" />
          <h3>RM actuales</h3>
        </div>
        {!rms || rms.length === 0 ? (
          <p className="small muted" style={{ margin: 0 }}>Todavía no cargó ningún RM.</p>
        ) : (
          <ul className="rows">
            {rms.map((r) => (
              <li key={r.lift}>
                <span>{r.lift}</span>
                <b>{Number(r.valor_kg)} kg</b>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="block">
        <div className="bh">
          <span className="plate blue" aria-hidden="true" />
          <h3>Resultados cargados</h3>
        </div>
        {!resultados || resultados.length === 0 ? (
          <p className="small muted" style={{ margin: 0 }}>Todavía no cargó ningún resultado.</p>
        ) : (
          <ul className="rows" style={{ gap: 2 }}>
            {resultados
              .filter((r) => r.dias)
              .map((r, i) => {
                const wods = r.dias.contenido?.wods || [];
                return (
                  <li key={i} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
                    <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{r.dias.fecha}</span>
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
                        {r.nota && <p className="small muted" style={{ margin: '2px 0 0' }}>“{r.nota}”</p>}
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
