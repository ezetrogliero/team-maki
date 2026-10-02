import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { ordenarPorScore } from '@/lib/scoring';
import { hoyFecha } from '@/lib/fecha';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import WeekStrip from '@/components/WeekStrip';

export default async function Ranking({ params }) {
  const { fecha } = await params;
  const { user, profile } = await requireUser();
  if (profile?.rol !== 'coach' && !profile?.onboarded) redirect('/alumno/onboarding');

  const rol = profile?.rol === 'coach' ? 'coach' : 'alumno';
  const hoy = hoyFecha();

  const supabase = await createClient();
  const { data: dia } = await supabase
    .from('dias')
    .select('id, contenido')
    .eq('fecha', fecha)
    .maybeSingle();

  const volverHref = profile?.rol === 'coach' ? `/coach/dia/${fecha}` : `/alumno/dia/${fecha}`;

  if (!dia) {
    return (
      <Page fecha={fecha} volverHref={volverHref} rol={rol} hoy={hoy}>
        <Empty texto="Todavía no hay programación para este día." />
      </Page>
    );
  }

  const { data: resultados } = await supabase
    .from('resultados')
    .select('alumno_id, wod, ausente, profiles(nombre)')
    .eq('dia_id', dia.id);

  const yoCargue = resultados?.some((r) => r.alumno_id === user.id);

  if (profile?.rol !== 'coach' && !yoCargue) {
    return (
      <Page fecha={fecha} volverHref={volverHref} rol={rol} hoy={hoy}>
        <Empty texto="Todavía no cargaste tus resultados de hoy. Cargalos primero para desbloquear el ranking del día.">
          <Link href={volverHref} className="btn">Ir a cargar mis resultados</Link>
        </Empty>
      </Page>
    );
  }

  const wods = dia.contenido?.wods || [];

  return (
    <Page fecha={fecha} volverHref={volverHref} rol={rol} hoy={hoy}>
      {wods.map((w, wi) => {
        const ordenados = ordenarPorScore(resultados || [], wi);
        const descripcion = (w.items || [])
          .map((it) => `${it.q}${unidadTexto(it.u)} ${it.ex}`.trim())
          .filter(Boolean)
          .join(' · ');
        return (
          <section className="block" key={wi}>
            <div className="bh">
              <span className="plate blue" aria-hidden="true" />
              <h3>{w.name || (wods.length > 1 ? `WOD ${wi + 1}` : 'WOD del día')}</h3>
              <span className="pill">{wodLabel(w)}</span>
            </div>
            {descripcion && <p className="small muted" style={{ margin: 0 }}>{descripcion}</p>}
            {w.type === 'EMOM' ? (
              <p className="small muted" style={{ margin: 0 }}>
                Los EMOM no tienen ranking: el tiempo y las reps son iguales para todos.
              </p>
            ) : ordenados.length === 0 ? (
              <p className="small muted" style={{ margin: 0 }}>Todavía nadie cargó este WOD.</p>
            ) : (
              <ul className="rank">
                {ordenados.map((r, i) => {
                  const incompleto = r.wod[wi]?.completo === false || (r.wod[wi]?.modo === 'tiempo' && r.wod[wi]?.valor <= 0);
                  return (
                    <li
                      key={r.alumno_id}
                      className={`${!incompleto && i === 0 ? 'p1' : !incompleto && i === 1 ? 'p2' : !incompleto && i === 2 ? 'p3' : ''} ${r.alumno_id === user.id ? 'me' : ''}`}
                    >
                      <span className="pos">{incompleto ? '—' : `${i + 1}°`}</span>
                      <span>{r.profiles?.nombre || '—'}</span>
                      <span className="res">{incompleto ? 'No completó' : r.wod[wi]?.texto}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        );
      })}
    </Page>
  );
}

function Page({ fecha, volverHref, rol, hoy, children }) {
  return (
    <div className="shell" style={{ paddingBottom: 84 }}>
      <Header />
      <Link href={volverHref} className="back small linkbtn">← Volver al día</Link>
      <WeekStrip fecha={fecha} basePath="/ranking" />
      {children}
      <BottomNav rol={rol} hoy={hoy} />
    </div>
  );
}

function Empty({ texto, children }) {
  return (
    <div className="empty">
      <span>{texto}</span>
      {children}
    </div>
  );
}

function unidadTexto(u) {
  if (u === 'm') return ' m';
  if (u === 'cal') return ' cal';
  if (u === 'seg') return ' seg';
  return '';
}

function wodLabel(w) {
  return `${w.type}${w.time ? ` · ${w.time} min` : ''}`;
}
