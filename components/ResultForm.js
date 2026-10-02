'use client';

import { useState, useTransition } from 'react';
import { guardarResultado } from '@/app/alumno/dia/[fecha]/actions';
import { esPorTiempo, armarScore, segundosATiempo, formatTiempoVivo } from '@/lib/scoring';

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
  const [noCompleto, setNoCompleto] = useState(() => wods.map((w, wi) => existente?.[wi]?.completo === false));
  const [nota, setNota] = useState('');
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState('');

  function setInput(i, patch) {
    setInputs(inputs.map((v, idx) => (idx === i ? { ...v, ...patch } : v)));
  }

  function toggleNoCompleto(i) {
    setNoCompleto(noCompleto.map((v, idx) => (idx === i ? !v : v)));
  }

  function handleSubmit() {
    const scores = wods.map((w, wi) => {
      if (noCompleto[wi]) {
        return { modo: esPorTiempo(w.type) ? 'tiempo' : 'rondas', valor: -1, texto: 'No completó', completo: false };
      }
      return armarScore(w.type, inputs[wi]);
    });
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
        <div className="score" key={wi} style={{ marginBottom: 10, flexWrap: 'wrap' }}>
          <span className="small muted" style={{ flexBasis: '100%' }}>
            {wods.length > 1 ? `WOD ${wi + 1}` : 'WOD'}{w.name ? ` · ${w.name}` : ''} ({w.type})
          </span>

          {noCompleto[wi] ? (
            <span className="small muted" style={{ flex: 1 }}>No vas a cargar tiempo/rondas para este WOD.</span>
          ) : esPorTiempo(w.type) ? (
            <label className="field">
              Tiempo (mm:ss)
              <input
                style={{ width: 100 }}
                placeholder="mm:ss"
                inputMode="numeric"
                pattern="[0-9]*"
                value={inputs[wi].tiempo}
                onChange={(e) => setInput(wi, { tiempo: formatTiempoVivo(e.target.value) })}
              />
            </label>
          ) : (
            <>
              <label className="field">
                Rondas
                <input
                  style={{ width: 70 }}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={inputs[wi].rondas}
                  onChange={(e) => setInput(wi, { rondas: e.target.value.replace(/\D/g, '') })}
                />
              </label>
              <label className="field">
                Reps
                <input
                  style={{ width: 70 }}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={inputs[wi].reps}
                  onChange={(e) => setInput(wi, { reps: e.target.value.replace(/\D/g, '') })}
                />
              </label>
            </>
          )}

          <button
            type="button"
            className="btn sm ghost"
            style={{ marginLeft: 'auto' }}
            onClick={() => toggleNoCompleto(wi)}
          >
            {noCompleto[wi] ? 'Sí lo completé ✕' : 'No completé el WOD'}
          </button>
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
