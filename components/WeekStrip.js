import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { semanaDe, sumarDias, nombreDiaCorto, diaDelMes, hoyFecha } from '@/lib/fecha';

export default async function WeekStrip({ fecha, basePath }) {
  const dias = semanaDe(fecha);
  const hoy = hoyFecha();

  const supabase = await createClient();
  const { data: cargados } = await supabase
    .from('dias')
    .select('fecha')
    .gte('fecha', dias[0])
    .lte('fecha', dias[6]);
  const conProgramacion = new Set((cargados || []).map((d) => d.fecha));

  const semanaAnterior = sumarDias(dias[0], -7);
  const semanaSiguiente = sumarDias(dias[0], 7);

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--line)',
        borderRadius: 12,
        padding: '12px 8px',
        marginBottom: 20,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px 10px' }}>
        <Link href={`${basePath}/${semanaAnterior}`} style={{ fontSize: 18, color: 'var(--muted)', textDecoration: 'none' }}>‹</Link>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em' }}>
          Semana
        </span>
        <Link href={`${basePath}/${semanaSiguiente}`} style={{ fontSize: 18, color: 'var(--muted)', textDecoration: 'none' }}>›</Link>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {dias.map((d) => {
          const activo = d === fecha;
          const esHoy = d === hoy;
          return (
            <Link
              key={d}
              href={`${basePath}/${d}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                padding: '8px 2px 6px',
                borderRadius: 8,
                textDecoration: 'none',
                background: activo ? 'var(--ink)' : 'transparent',
                color: activo ? 'var(--ink-inv)' : 'var(--ink)',
              }}
            >
              <span style={{ fontSize: 10, fontWeight: 700, color: activo ? 'var(--gold)' : 'var(--muted)' }}>
                {esHoy ? 'HOY' : nombreDiaCorto(d)}
              </span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 15, fontWeight: 700 }}>{diaDelMes(d)}</span>
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 999,
                  background: conProgramacion.has(d) ? 'var(--gold)' : 'transparent',
                }}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
