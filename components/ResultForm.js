'use client';

import { useState, useTransition } from 'react';
import { guardarResultado } from '@/app/alumno/dia/[fecha]/actions';
import { esPorTiempo, armarScore, segundosATiempo } from '@/lib/scoring';

const box = {
  background: 'var(--surface)',
  border: '1px solid var(--line)',
  borderRadius: 12,
  padding: 16,
  marginBottom: 16,
};
const titleStyle = { fontSize: 13, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 10 };
const input = {
  padding: '8px 10px',
  borderRadius: 8,
  border: '1px solid var(--line)',
  background: 'var(--bg)',
  color: 'var(--ink)',
  fontSize: 14,
};

export default function ResultForm({ fecha, wods, existente }) {
  const [inputs, setInputs] = useState(() =>
    wods.map((w, wi) => {
      const prev = existente?.[wi];
      if (esPorTiempo(w.type)) {
        return { tiempo: prev ? segundosATiempo(prev.valor) : '' };
      }
      return {
        rondas: prev ? String(Math.floor(prev.valor / 100000)) : '',
        reps: prev ? String(prev.valor % 100000) : '',
      };
    })
  );
  const [nota, setNota] = useState('');
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState('');

  function setInput(i, patch) {
    setInputs(inputs.map((v, idx) => (idx === i ? { ...v, ...patch } : v)));
  }

  function handleSubmit() {
    const scores = wods.map((w, wi) => armarScore(w.type, inputs[wi]));
    if (scores.some((s) => s === null)) {
      setMsg('Error: completá el resultado de todos los WODs (formato de tiempo: mm:ss).');
      return;
    }
    startTransition(async () => {
      const res = await guardarResultado(fecha, scores, nota);
      setMsg(res.error ? `Error: ${res.error}` : '¡Guardado! Ya podés ver el ranking del día.');
    });
  }

  return (
    <div style={box}>
      <div style={titleStyle}>Cargar mis resultados</div>
      {wods.map((w, wi) => (
        <div key={wi} style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 13, marginBottom: 6 }}>
            {wods.length > 1 ? `WOD ${wi + 1}` : 'WOD'}{w.name ? ` · ${w.name}` : ''} ({w.type})
          </div>
          {esPorTiempo(w.type) ? (
            <input
              style={{ ...input, width: 100 }}
              placeholder="mm:ss"
              value={inputs[wi].tiempo}
              onChange={(e) => setInput(wi, { tiempo: e.target.value })}
            />
          ) : (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                style={{ ...input, width: 70 }}
                placeholder="Rondas"
                value={inputs[wi].rondas}
                onChange={(e) => setInput(wi, { rondas: e.target.value })}
              />
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>+</span>
              <input
                style={{ ...input, width: 70 }}
                placeholder="Reps"
                value={inputs[wi].reps}
                onChange={(e) => setInput(wi, { reps: e.target.value })}
              />
            </div>
          )}
        </div>
      ))}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 13, marginBottom: 6 }}>Nota (opcional)</div>
        <textarea
          style={{ ...input, width: '100%', minHeight: 50, resize: 'vertical' }}
          value={nota}
          onChange={(e) => setNota(e.target.value)}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={pending}
          style={{
            padding: '10px 18px',
            borderRadius: 8,
            border: 'none',
            background: 'var(--ink)',
            color: 'var(--ink-inv)',
            fontWeight: 700,
            fontSize: 14,
            cursor: pending ? 'default' : 'pointer',
            opacity: pending ? 0.7 : 1,
          }}
        >
          {pending ? 'Guardando...' : existente ? 'Actualizar resultado' : 'Guardar resultado'}
        </button>
        {msg && (
          <span style={{ fontSize: 13, color: msg.startsWith('Error') ? 'var(--red)' : 'var(--good)' }}>{msg}</span>
        )}
      </div>
    </div>
  );
}
