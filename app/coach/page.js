import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { hoyFecha } from '@/lib/fecha';

export default async function CoachHome() {
  const { user, profile } = await requireUser();
  if (profile?.rol !== 'coach') redirect('/alumno');

  const hoy = hoyFecha();

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
          <div className="brand">
            <img src="/logo.png" alt="Team Maki" className="brandmark" />
            <h1 className="logo" style={{ fontSize: 24 }}>
              TEAM <span>MAKI</span>
            </h1>
          </div>
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
            marginBottom: 16,
          }}
        >
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: 14 }}>Sesión de coach</p>
          <p style={{ margin: '4px 0 16px', fontSize: 18, fontWeight: 700 }}>
            {profile?.nombre || user.email}
          </p>

          <Link
            href={`/coach/dia/${hoy}`}
            style={{
              display: 'inline-block',
              padding: '12px 20px',
              borderRadius: 8,
              background: 'var(--ink)',
              color: 'var(--ink-inv)',
              fontWeight: 700,
              fontSize: 15,
              textDecoration: 'none',
            }}
          >
            Programar el día de hoy →
          </Link>
        </div>

        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: 14,
            padding: 20,
          }}
        >
          <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700 }}>Alumnos</p>
          <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--muted)' }}>
            Ver y renombrar a los alumnos que ya entraron a la app.
          </p>
          <Link href="/coach/alumnos" style={{ fontSize: 14, color: 'var(--blue)', fontWeight: 600 }}>
            Ir al listado →
          </Link>
        </div>
      </div>
    </main>
  );
}
