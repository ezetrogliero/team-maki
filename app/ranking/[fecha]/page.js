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
          <Link
            href={volverHref}
            style={{
              display: 'inline-block',
              marginTop: 12,
              padding: '10px 16px',
              borderRadius: 8,
              background: 'var(--ink)',
              color: 'var(--ink-inv)',
              fontWeight: 700,
              fontSize: 14,
              textDecoration: 'none',
            }}
          >
            Ir a cargar mis resultados
          </Link>
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
          <div
            key={wi}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 10 }}>
              {wods.length > 1 ? `WOD ${wi + 1}` : 'Ranking'}{w.name ? ` · ${w.name}` : ''}
            </div>
            {ordenados.length === 0 && (
              <p style={{ color: 'var(--muted)', fontSize: 14, margin: 0 }}>Todavía nadie cargó este WOD.</p>
            )}
            {ordenados.map((r, i) => (
              <div
                key={r.alumno_id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  borderBottom: i === ordenados.length - 1 ? 'none' : '1px solid var(--line)',
                  fontWeight: r.alumno_id === user.id ? 700 : 400,
                }}
              >
                <span>
                  <span style={{ fontFamily: 'var(--mono)', color: 'var(--gold)', marginRight: 8 }}>{i + 1}°</span>
                  {r.profiles?.nombre || '—'}
                </span>
                <span style={{ fontFamily: 'var(--mono)' }}>{r.wod[wi]?.texto}</span>
              </div>
            ))}
          </div>
        );
      })}
    </Page>
  );
}

function Page({ fecha, volverHref, children }) {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', padding: 24 }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ marginBottom: 16 }}>
          <Link href={volverHref} style={{ fontSize: 13, color: 'var(--muted)' }}>← Volver al día</Link>
        </div>
        <h1 style={{ fontFamily: 'var(--display)', fontSize: 26, margin: '0 0 20px' }}>
          Ranking · {fecha}
        </h1>
        {children}
      </div>
    </main>
  );
}

function Empty({ texto, children }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
      <p style={{ margin: 0, fontSize: 14 }}>{texto}</p>
      {children}
    </div>
  );
}
