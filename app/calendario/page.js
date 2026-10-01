import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { hoyFecha, mesActual, sumarMeses, celdasDelMes } from '@/lib/fecha';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const DOW = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export default async function Calendario({ searchParams }) {
  const sp = await searchParams;
  const { profile } = await requireUser();
  const hoy = hoyFecha();
  const mes = sp?.mes && /^\d{4}-\d{2}$/.test(sp.mes) ? sp.mes : mesActual();
  const [y, m] = mes.split('-').map(Number);

  const celdas = celdasDelMes(mes);
  const fechas = celdas.filter(Boolean);

  const supabase = await createClient();
  const { data: programados } = await supabase
    .from('dias')
    .select('fecha')
    .gte('fecha', fechas[0])
    .lte('fecha', fechas[fechas.length - 1]);
  const conProgramacion = new Set((programados || []).map((d) => d.fecha));

  const volverHref = profile?.rol === 'coach' ? `/coach/dia/${hoy}` : `/alumno/dia/${hoy}`;
  const mesAnterior = sumarMeses(mes, -1);
  const mesSiguiente = sumarMeses(mes, 1);

  return (
    <>
      <Link href={volverHref} className="btn ghost sm back">‹ Semana</Link>
      <section className="sect">
        <div className="weekhead">
          <Link
            href={`/calendario?mes=${mesAnterior}`}
            className="arrow"
            aria-label="Mes anterior"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ‹
          </Link>
          <h2>{MESES[m - 1]}<span>{y}</span></h2>
          <Link
            href={`/calendario?mes=${mesSiguiente}`}
            className="arrow"
            aria-label="Mes siguiente"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ›
          </Link>
        </div>
        <div className="calgrid dow">
          {DOW.map((d, i) => <span key={i}>{d}</span>)}
        </div>
        <div className="calgrid">
          {celdas.map((fecha, i) =>
            fecha ? (
              <Link
                key={fecha}
                href={`/ranking/${fecha}`}
                className={`calcell${conProgramacion.has(fecha) ? ' has' : ''}${fecha === hoy ? ' today' : ''}`}
              >
                {Number(fecha.slice(8, 10))}
                {conProgramacion.has(fecha) && <span className="dot" />}
              </Link>
            ) : (
              <span key={i} />
            )
          )}
        </div>
        <p className="small muted" style={{ margin: 0 }}>
          Tocá un día para ver qué entrenamiento fue y las posiciones.
        </p>
      </section>
    </>
  );
}
