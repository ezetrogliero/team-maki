import Link from 'next/link';
import { requireAlumno } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import DayView from '@/components/DayView';
import ResultForm from '@/components/ResultForm';
import WeekStrip from '@/components/WeekStrip';
import Header from '@/components/Header';

export default async function AlumnoDia({ params }) {
  const { fecha } = await params;
  const { user } = await requireAlumno();

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

  let misRMs = {};
  if (dia?.contenido?.fuerza?.length > 0) {
    const { data: rms } = await supabase
      .from('rms')
      .select('lift, valor_kg')
      .eq('alumno_id', user.id);
    misRMs = Object.fromEntries((rms || []).map((r) => [r.lift, Number(r.valor_kg)]));
  }

  return (
    <div className="shell">
      <Header />
      <WeekStrip fecha={fecha} basePath="/alumno/dia" />
      <p className="sub" style={{ textAlign: 'center', fontWeight: 700, color: 'var(--ink)', margin: 0 }}>{fecha}</p>

      <DayView contenido={dia?.contenido} nota={dia?.nota_coach} modo="alumno" misRMs={misRMs} fecha={fecha} />

      {dia?.contenido?.wods?.length > 0 && (
        <ResultForm fecha={fecha} wods={dia.contenido.wods} existente={miResultado} />
      )}

      {dia && (
        <Link href={`/ranking/${fecha}`} className="btn ghost full">
          Ver ranking del día →
        </Link>
      )}
    </div>
  );
}
