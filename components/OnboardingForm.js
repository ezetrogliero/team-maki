'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { completarOnboarding } from '@/app/alumno/onboarding/actions';
import { LIFTS } from './dayEditorHelpers';

export default function OnboardingForm({ nombreInicial }) {
  const [nombre, setNombre] = useState(nombreInicial || '');
  const [rms, setRms] = useState({});
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState('');
  const router = useRouter();

  function setRM(lift, valor) {
    setRms((prev) => ({ ...prev, [lift]: valor }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    startTransition(async () => {
      setMsg('');
      const res = await completarOnboarding(nombre, rms);
      if (res.error) {
        setMsg(`Error: ${res.error}`);
        return;
      }
      router.push('/alumno');
    });
  }

  return (
    <form onSubmit={handleSubmit} className="login">
      <div>
        <h2>¡Bienvenido/a!</h2>
        <p className="sub" style={{ margin: '4px 0 0' }}>
          Antes de ver el entrenamiento contanos tu nombre y, si ya lo sabés, tu RM en los
          levantamientos principales. Los que no sepas los dejás en blanco y los cargás más
          adelante cuando la coach programe un día de RM.
        </p>
      </div>

      <label className="field">
        Tu nombre
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          placeholder="Nombre y apellido"
        />
      </label>

      <div>
        <div
          className="small muted"
          style={{ fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.04em' }}
        >
          Tu RM (opcional, en kg)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {LIFTS.map((l) => (
            <div className="edrow" key={l} style={{ gridTemplateColumns: '1fr 90px' }}>
              <span className="small" style={{ alignSelf: 'center' }}>{l}</span>
              <input
                inputMode="decimal"
                value={rms[l] || ''}
                onChange={(e) => setRM(l, e.target.value)}
                placeholder="kg"
              />
            </div>
          ))}
        </div>
      </div>

      {msg && <p className="small" style={{ color: 'var(--red)', margin: 0 }}>{msg}</p>}

      <button type="submit" className="btn full" disabled={pending}>
        {pending ? 'Guardando...' : 'Empezar'}
      </button>
    </form>
  );
}
