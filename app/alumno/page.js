import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';

export default async function AlumnoHome() {
  const { user, profile } = await requireUser();
  if (profile?.rol === 'coach') redirect('/coach');

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', padding: 24 }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
          }}
        >
          <h1 style={{ fontFamily: 'var(--display)', fontSize: 28, margin: 0 }}>
            TEAM <span style={{ color: 'var(--gold)' }}>MAKI</span>
          </h1>
          <form action="/logout" method="post">
            <button
              type="submit"
              style={{
                background: 'transparent',
                border: '1px solid var(--line)',
                borderRadius: 8,
                padding: '8px 14px',
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              Salir
            </button>
          </form>
        </header>

        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: 14,
            padding: 24,
          }}
        >
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: 14 }}>
            Sesión de alumno activa
          </p>
          <p style={{ margin: '4px 0 0', fontSize: 18, fontWeight: 700 }}>
            {profile?.nombre || user.email}
          </p>
          <p style={{ marginTop: 16, fontSize: 14, color: 'var(--muted)' }}>
            El login ya funciona de punta a punta. Acá va a ir la programación del día y
            la carga de resultados.
          </p>
        </div>
      </div>
    </main>
  );
}
