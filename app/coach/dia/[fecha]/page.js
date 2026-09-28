import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { sumarDias, hoyFecha } from '@/lib/fecha';
import DayEditor from '@/components/DayEditor';

export default async function EditarDia({ params }) {
  const { fecha } = await params;
  const { profile } = await requireUser();
  if (profile?.rol !== 'coach') redirect('/alumno');

  const supabase = await createClient();
  const { data: dia } = await supabase
    .from('dias')
    .select('contenido, nota_coach')
    .eq('fecha', fecha)
    .maybeSingle();

  const initial = dia
    ? { ...dia.contenido, nota: dia.nota_coach || '' }
    : null;

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', padding: 24 }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ marginBottom: 16 }}>
          <Link href="/coach" style={{ fontSize: 13, color: 'var(--muted)' }}>
            ← Volver
          </Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <Link href={`/coach/dia/${sumarDias(fecha, -1)}`} style={{ fontSize: 13, color: 'var(--muted)' }}>← Anterior</Link>
          <h1 style={{ fontFamily: 'var(--display)', fontSize: 26, margin: 0 }}>
            {fecha}{fecha === hoyFecha() ? ' · HOY' : ''}
          </h1>
          <Link href={`/coach/dia/${sumarDias(fecha, 1)}`} style={{ fontSize: 13, color: 'var(--muted)' }}>Siguiente →</Link>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: 14, margin: '8px 0 20px', textAlign: 'center' }}>
          {dia ? 'Ya hay una programación para este día. La podés editar.' : 'Todavía no hay nada cargado para este día.'}
        </p>
        <DayEditor fecha={fecha} initial={initial} />

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
              marginTop: 16,
            }}
          >
            Ver ranking / resultados de este día →
          </Link>
        )}
      </div>
    </main>
  );
}
