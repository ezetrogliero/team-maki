import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { semanaDe, sumarDias, diaDelMes, hoyFecha } from '@/lib/fecha';

const DN = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];

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
    <section className="week">
      <div className="weekhead">
        <Link href={`${basePath}/${semanaAnterior}`} className="arrow" aria-label="Semana anterior" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</Link>
        <h2>Semana</h2>
        <Link href={`${basePath}/${semanaSiguiente}`} className="arrow" aria-label="Semana siguiente" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</Link>
      </div>
      <div className="days">
        {dias.map((d, i) => {
          const activo = d === fecha;
          const esHoy = d === hoy;
          return (
            <Link
              key={d}
              href={`${basePath}/${d}`}
              className={`dbtn${conProgramacion.has(d) ? ' has' : ''}`}
              aria-pressed={activo}
            >
              {esHoy && <span className="today">Hoy</span>}
              <span className="dn">{DN[i]}</span>
              <span className="dd">{diaDelMes(d)}</span>
              <span className="dot" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
