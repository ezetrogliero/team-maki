import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import CoachDayScreen from '@/components/CoachDayScreen';
import WeekStrip from '@/components/WeekStrip';

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

  return (
    <>
      <WeekStrip fecha={fecha} basePath="/coach/dia" />

      <div className="phead" style={{ justifyContent: 'center', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <h2>{fecha}</h2>
      </div>

      <CoachDayScreen fecha={fecha} contenido={dia?.contenido || null} notaCoach={dia?.nota_coach || ''} />

      {dia && (
        <Link href={`/ranking/${fecha}`} className="btn ghost full">
          Ver ranking / resultados de este día →
        </Link>
      )}
    </>
  );
}
