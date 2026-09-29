import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { ordenarPorScore } from '@/lib/scoring';

export default async function Ranking({ params }) {
  const { fecha } = await params;
  const { user, profile } = await requireUser();

  const supabase = await createClient();
  const { data: dia } = await supabase
    .from('dias')
    .select('id, contenido')
    .eq('fecha', fecha)
    .maybeSingle();

  const volverHref = profile?.rol === 'coach' ? `/coach/dia/${fecha}` : `/alumno/dia/${fecha}`;

  if (!dia) {
    return (
      <Page fecha={fecha} volverHref={volverHref}>
        <Empty texto="Todavía no hay programación para este día." />
      </Page>
    );
  }

  const { data: resultados } = await supabase
    .from('resultados')
    .select('alumno_id, wod, profiles(nombre)')
    .eq('dia_id', dia.id);

  const yoCargue = resultados?.some((r) => r.alumno_id === user.id);

  if (profile?.rol !== 'coach' && !yoCargue) {
    return (
      <Page fecha={fecha} volverHref={volverHref}>
        <Empty texto="Todavía no cargaste tus resultados de hoy. Cargalos primero para desbloquear el ranking del día.">
          <Link href={volverHref} className="btn">Ir a cargar mis resultados</Link>
        </Empty>
      </Page>
    );
  }

  const wods = dia.contenido?.wods || [];

  return (
    <Page fecha={fecha} volverHref={volverHref}>
      {wods.map((w, wi) => {
        const ordenados = ordenarPorScore(resultados || [], wi);
        return (
          <section className="block" key={wi}>
            <div className="bh">
              <span className="plate blue" aria-hidden="true" />
              <h3>{wods.length > 1 ? `WOD ${wi + 1}` : 'Ranking'}</h3>
              {w.name && <span className="pill">{w.name}</span>}
            </div>
            {ordenados.length === 0 ? (
              <p className="small muted" style={{ margin: 0 }}>Todavía nadie cargó este WOD.</p>
            ) : (
              <ul className="rank">
                {ordenados.map((r, i) => (
                  <li key={r.alumno_id} className={`${i === 0 ? 'p1' : i === 1 ? 'p2' : i === 2 ? 'p3' : ''} ${r.alumno_id === user.id ? 'me' : ''}`}>
                    <span className="pos">{i + 1}°</span>
                    <span>{r.profiles?.nombre || '—'}</span>
                    <span className="res">{r.wod[wi]?.texto}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </Page>
  );
}

function Page({ fecha, volverHref, children }) {
  return (
    <div className="shell">
      <Link href={volverHref} className="back small linkbtn">← Volver al día</Link>
      <div className="phead">
        <h2>Ranking</h2>
        <span className="sub">{fecha}</span>
      </div>
      {children}
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
