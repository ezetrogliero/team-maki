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
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div className="brand" style={{ justifyContent: 'center', marginBottom: 18 }}>
          <img src="/logo.png" alt="Team Maki" className="brandmark" />
          <span className="logo">TEAM <span>MAKI</span></span>
        </div>

        <div className="login">
          <div>
            <h2>Ingresar</h2>
            <p className="sub" style={{ margin: '4px 0 0' }}>
              Te mandamos un link para entrar, sin contraseña.
            </p>
          </div>

          {status === 'sent' ? (
            <div className="note">
              <strong>Listo, revisá tu email.</strong>
              <p style={{ margin: '6px 0 0' }}>
                Te mandamos un link a <strong>{email}</strong>. Abrilo desde este mismo dispositivo para entrar.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <label className="field">
                Email
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                />
              </label>
              {status === 'error' && <p className="small" style={{ color: 'var(--red)', margin: 0 }}>{errorMsg}</p>}
              <button type="submit" className="btn full" disabled={status === 'sending'}>
                {status === 'sending' ? 'Enviando...' : 'Enviarme el link'}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
