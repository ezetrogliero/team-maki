'use client';

import { useState, useTransition } from 'react';
import { guardarResultado } from '@/app/alumno/dia/[fecha]/actions';
import { esPorTiempo, armarScore, segundosATiempo } from '@/lib/scoring';

export default function ResultForm({ fecha, wods, fuerza = [], existente, fuerzaExistente }) {
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
  const [hechos, setHechos] = useState(() => ({ ...(fuerzaExistente || {}) }));
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
      const res = await guardarResultado(fecha, scores, nota, hechos);
      setMsg(res.error ? `Error: ${res.error}` : '¡Guardado! Ya podés ver el ranking del día.');
    });
  }

  return (
    <section className="block">
      <div className="bh">
        <span className="plate blue" aria-hidden="true" />
        <h3>Cargar mis resultados</h3>
      </div>

      {fuerza.length > 0 && (
        <div className="ex" style={{ marginBottom: 10 }}>
          <div className="exh"><h4>Fuerza — cuánto hiciste</h4></div>
          <div className="small muted" style={{ marginBottom: 4 }}>
            Opcional. Sirve para llevar el registro de tus pesos máximos usados por serie.
          </div>
          {fuerza.map((f, fi) => (
            <div key={fi} style={{ marginBottom: 8 }}>
              <div className="small" style={{ fontWeight: 700, marginBottom: 4 }}>{f.name}</div>
              <div className="tw">
                <table>
                  <thead>
                    <tr>
                      <th>Series × reps</th>
                      <th className="num">Carga</th>
                      <th className="num">Hiciste</th>
                    </tr>
                  </thead>
                  <tbody>
                    {f.sets.map((s, si) => {
                      const key = `${fi}-${si}`;
                      return (
                        <tr key={si}>
                          <td>{s.s} × {s.r}</td>
                          <td className="num">{s.c}{f.unit === '%' ? '%' : ' kg'}</td>
                          <td className="num">
                            <input
                              className="num"
                              inputMode="decimal"
                              placeholder="kg"
                              aria-label={`Peso que hiciste en ${s.s} × ${s.r} de ${f.name}`}
                              value={hechos[key] ?? ''}
                              onChange={(e) => setHechos((h) => ({ ...h, [key]: e.target.value }))}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

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
