import { redirect } from 'next/navigation';
import { requireAlumno } from '@/lib/auth';
import { hoyFecha } from '@/lib/fecha';

export default async function AlumnoHome() {
  await requireAlumno();
  redirect(`/alumno/dia/${hoyFecha()}`);
}
