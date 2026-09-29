'use client';

import { useState, useTransition } from 'react';
import { guardarRM } from '@/app/alumno/dia/[fecha]/rmActions';

export default function RMInput({ fecha, lift }) {
  const [valor, setValor] = useState('');
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState('');

  function handleSave() {
    startTransition(async () => {
      setMsg('');
      const res = await guardarRM(fecha, lift, valor);
      if (res.error) {
        setMsg(`Error: ${res.error}`);
        return;
      }
      setMsg(
        res.actualizado
          ? '¡Nuevo RM guardado!'
          : 'Ya tenías un RM igual o mayor cargado, no se cambió.'
      );
      setValor('');
    });
  }

  return (
    <label className="field">
      Lo que levantaste hoy (kg)
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          inputMode="decimal"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder="ej: 82.5"
        />
        <button type="button" className="btn sm" disabled={pending || !valor} onClick={handleSave}>
          {pending ? '...' : 'Guardar'}
        </button>
      </div>
      {msg && (
        <span className="small" style={{ color: msg.startsWith('Error') ? 'var(--red)' : 'var(--good)' }}>
          {msg}
        </span>
      )}
    </label>
  );
}
