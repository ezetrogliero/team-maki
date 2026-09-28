'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setStatus('error');
      setErrorMsg(error.message);
      return;
    }
    setStatus('sent');
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'var(--bg)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 380,
          background: 'var(--surface)',
          border: '1px solid var(--line)',
          borderRadius: 16,
          padding: 32,
        }}
      >
        <div className="brand" style={{ marginBottom: 4 }}>
          <img src="/logo.png" alt="Team Maki" className="brandmark" />
          <h1 className="logo">
            TEAM <span>MAKI</span>
          </h1>
        </div>
        <p style={{ color: 'var(--muted)', margin: '0 0 24px', fontSize: 14 }}>
          Ingresá con tu email. Te mandamos un link para entrar, sin contraseña.
        </p>

        {status === 'sent' ? (
          <div
            style={{
              background: 'var(--surface2)',
              border: '1px solid var(--line)',
              borderRadius: 10,
              padding: 16,
              fontSize: 14,
            }}
          >
            <strong>Listo, revisá tu email.</strong>
            <br />
            Te mandamos un link a <strong>{email}</strong>. Abrilo desde este mismo
            dispositivo para entrar.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label
              htmlFor="email"
              style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid var(--line)',
                background: 'var(--bg)',
                color: 'var(--ink)',
                fontSize: 15,
                marginBottom: 16,
              }}
            />
            {status === 'error' && (
              <p style={{ color: 'var(--red)', fontSize: 13, marginTop: -8, marginBottom: 16 }}>
                {errorMsg}
              </p>
            )}
            <button
              type="submit"
              disabled={status === 'sending'}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 8,
                border: 'none',
                background: 'var(--ink)',
                color: 'var(--ink-inv)',
                fontWeight: 700,
                fontSize: 15,
                cursor: status === 'sending' ? 'default' : 'pointer',
                opacity: status === 'sending' ? 0.7 : 1,
              }}
            >
              {status === 'sending' ? 'Enviando...' : 'Enviarme el link'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
