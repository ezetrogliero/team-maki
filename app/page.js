import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';

export default async function Home() {
  const { profile } = await requireUser();
  if (profile?.rol === 'coach') redirect('/coach');
  redirect(profile?.onboarded ? '/alumno' : '/alumno/onboarding');
}
