'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [modo, setModo] = useState('link'); // link | password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  async function handleSubmitLink(e) {
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

  async function handleSubmitPassword(e) {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setStatus('error');
      setErrorMsg(error.message === 'Invalid login credentials' ? 'Mail o contraseña incorrectos.' : error.message);
      return;
    }
    router.push('/');
    router.refresh();
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
              {modo === 'link' ? 'Te mandamos un link para entrar, sin contraseña.' : 'Entrá con el mail y la contraseña que te dieron.'}
            </p>
          </div>

          {modo === 'link' && status === 'sent' ? (
            <div className="note">
              <strong>Listo, revisá tu email.</strong>
              <p style={{ margin: '6px 0 0' }}>
                Te mandamos un link a <strong>{email}</strong>. Abrilo desde este mismo dispositivo para entrar.
              </p>
            </div>
          ) : modo === 'link' ? (
            <form onSubmit={handleSubmitLink} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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
          ) : (
            <form onSubmit={handleSubmitPassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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
              <label className="field">
                Contraseña
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </label>
              {status === 'error' && <p className="small" style={{ color: 'var(--red)', margin: 0 }}>{errorMsg}</p>}
              <button type="submit" className="btn full" disabled={status === 'sending'}>
                {status === 'sending' ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          )}

          <button
            type="button"
            className="linkbtn"
            style={{ alignSelf: 'center' }}
            onClick={() => {
              setModo(modo === 'link' ? 'password' : 'link');
              setStatus('idle');
              setErrorMsg('');
            }}
          >
            {modo === 'link' ? '¿Tenés usuario y contraseña? Entrar así' : '¿Preferís el link por mail? Entrar así'}
          </button>
        </div>
      </div>
    </main>
  );
}
