import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { hoyFecha } from '@/lib/fecha';

export default async function AlumnoHome() {
  const { profile } = await requireUser();
  if (profile?.rol === 'coach') redirect('/coach');
  redirect(`/alumno/dia/${hoyFecha()}`);
}
