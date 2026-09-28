import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { sumarDias, hoyFecha } from '@/lib/fecha';
import DayView from '@/components/DayView';
import ResultForm from '@/components/ResultForm';

export default async function AlumnoDia({ params }) {
  const { fecha } = await params;
  const { user, profile } = await requireUser();
  if (profile?.rol === 'coach') redirect('/coach');

  const supabase = await createClient();
  const { data: dia } = await supabase
    .from('dias')
    .select('id, contenido, nota_coach')
    .eq('fecha', fecha)
    .maybeSingle();

  let miResultado = null;
  if (dia) {
    const { data } = await supabase
      .from('resultados')
      .select('wod')
      .eq('dia_id', dia.id)
      .eq('alumno_id', user.id)
      .maybeSingle();
    miResultado = data?.wod || null;
  }

  const hoy = hoyFecha();
  const anterior = sumarDias(fecha, -1);
  const siguiente = sumarDias(fecha, 1);

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', padding: 24 }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <div className="brand">
            <img src="/logo.png" alt="Team Maki" className="brandmark" />
            <h1 className="logo" style={{ fontSize: 24 }}>
              TEAM <span>MAKI</span>
            </h1>
          </div>
          <form action="/logout" method="post">
            <button
              type="submit"
              style={{
                background: 'transparent',
                border: '1px solid var(--line)',
                borderRadius: 8,
                padding: '8px 14px',
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              Salir
            </button>
          </form>
        </header>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <Link href={`/alumno/dia/${anterior}`} style={{ fontSize: 14, color: 'var(--muted)' }}>← Anterior</Link>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{fecha}</div>
            {fecha === hoy && <div style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 700 }}>HOY</div>}
          </div>
          <Link href={`/alumno/dia/${siguiente}`} style={{ fontSize: 14, color: 'var(--muted)' }}>Siguiente →</Link>
        </div>

        <DayView contenido={dia?.contenido} nota={dia?.nota_coach} />

        {dia?.contenido?.wods?.length > 0 && (
          <ResultForm fecha={fecha} wods={dia.contenido.wods} existente={miResultado} />
        )}

        {dia && (
          <Link
            href={`/ranking/${fecha}`}
            style={{
              display: 'block',
              textAlign: 'center',
              padding: '12px 16px',
              borderRadius: 10,
              border: '1px solid var(--line)',
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
              color: 'var(--ink)',
            }}
          >
            Ver ranking del día →
          </Link>
        )}
      </div>
    </main>
  );
}
