import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import DayEditor from '@/components/DayEditor';
import WeekStrip from '@/components/WeekStrip';
import Header from '@/components/Header';

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
    <div className="shell">
      <Header />
      <Link href="/coach" className="back small linkbtn">← Volver</Link>
      <WeekStrip fecha={fecha} basePath="/coach/dia" />

      <div className="phead" style={{ justifyContent: 'center', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <h2>{fecha}</h2>
        <p className="small muted" style={{ margin: 0 }}>
          {dia ? 'Ya hay una programación para este día. La podés editar.' : 'Todavía no hay nada cargado para este día.'}
        </p>
      </div>

      <DayEditor fecha={fecha} initial={initial} />

      {dia && (
        <Link href={`/ranking/${fecha}`} className="btn ghost full">
          Ver ranking / resultados de este día →
        </Link>
      )}
    </div>
  );
}
