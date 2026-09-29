import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import OnboardingForm from '@/components/OnboardingForm';

export default async function Onboarding() {
  const { profile } = await requireUser();
  if (profile?.rol === 'coach') redirect('/coach');
  if (profile?.onboarded) redirect('/alumno');

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div className="brand" style={{ justifyContent: 'center', marginBottom: 18 }}>
          <img src="/logo.png" alt="Team Maki" className="brandmark" />
          <span className="logo">TEAM <span>MAKI</span></span>
        </div>
        <OnboardingForm nombreInicial={profile?.nombre || ''} />
      </div>
    </main>
  );
}
