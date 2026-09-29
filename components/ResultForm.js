'use client';

import { useState, useTransition } from 'react';
import { guardarResultado } from '@/app/alumno/dia/[fecha]/actions';
import { esPorTiempo, armarScore, segundosATiempo } from '@/lib/scoring';

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
    <section className="block">
      <div className="bh">
        <span className="plate blue" aria-hidden="true" />
        <h3>Cargar mis resultados</h3>
      </div>

      {wods.map((w, wi) => (
        <div className="score" key={wi} style={{ marginBottom: 10 }}>
          <span className="small muted" style={{ flexBasis: '100%' }}>
            {wods.length > 1 ? `WOD ${wi + 1}` : 'WOD'}{w.name ? ` · ${w.name}` : ''} ({w.type})
          </span>
          {esPorTiempo(w.type) ? (
            <label className="field">
              Tiempo (mm:ss)
              <input
                style={{ width: 100 }}
                placeholder="mm:ss"
                value={inputs[wi].tiempo}
                onChange={(e) => setInput(wi, { tiempo: e.target.value })}
              />
            </label>
          ) : (
            <>
              <label className="field">
                Rondas
                <input
                  style={{ width: 70 }}
                  value={inputs[wi].rondas}
                  onChange={(e) => setInput(wi, { rondas: e.target.value })}
                />
              </label>
              <label className="field">
                Reps
                <input
                  style={{ width: 70 }}
                  value={inputs[wi].reps}
                  onChange={(e) => setInput(wi, { reps: e.target.value })}
                />
              </label>
            </>
          )}
        </div>
      ))}

      <label className="field" style={{ marginBottom: 12 }}>
        Nota (opcional)
        <textarea value={nota} onChange={(e) => setNota(e.target.value)} style={{ minHeight: 50, resize: 'vertical' }} />
      </label>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button type="button" className="btn" onClick={handleSubmit} disabled={pending}>
          {pending ? 'Guardando...' : existente ? 'Actualizar resultado' : 'Guardar resultado'}
        </button>
        {msg && (
          <span className="small" style={{ color: msg.startsWith('Error') ? 'var(--red)' : 'var(--good)' }}>
            {msg}
          </span>
        )}
      </div>
    </section>
  );
}
