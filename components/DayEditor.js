'use client';

import { useState, useTransition } from 'react';
import { saveDia } from '@/app/coach/dia/actions';
import { TPL, WOD_TYPES, ROUNDS_TYPES, uid } from './dayEditorHelpers';

const box = {
  background: 'var(--surface)',
  border: '1px solid var(--line)',
  borderRadius: 12,
  padding: 16,
  marginBottom: 16,
};
const label = { fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em' };
const input = {
  padding: '8px 10px',
  borderRadius: 8,
  border: '1px solid var(--line)',
  background: 'var(--bg)',
  color: 'var(--ink)',
  fontSize: 14,
  width: '100%',
};
const smallBtn = {
  padding: '6px 10px',
  borderRadius: 6,
  border: '1px solid var(--line)',
  background: 'transparent',
  cursor: 'pointer',
  fontSize: 13,
};
const rmBtn = { ...smallBtn, color: 'var(--red)', borderColor: 'var(--red)' };

function RoundsBlock({ title, color, data, onChange }) {
  const items = data.items || [];
  function setItem(i, patch) {
    const next = items.map((it, idx) => (idx === i ? { ...it, ...patch } : it));
    onChange({ ...data, items: next });
  }
  function addItem() {
    onChange({ ...data, items: [...items, { ex: '', val: '' }] });
  }
  function delItem(i) {
    onChange({ ...data, items: items.filter((_, idx) => idx !== i) });
  }
  return (
    <div style={box}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className={`plate ${color}`} />
          <span style={{ ...label, fontSize: 14 }}>{title}</span>
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <select
            style={{ ...input, width: 'auto' }}
            value={data.type || 'Rounds'}
            onChange={(e) => onChange({ ...data, type: e.target.value })}
          >
            {ROUNDS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          {(data.type || 'Rounds') === 'Rounds' && (
            <>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>Vueltas</span>
              <input
                style={{ ...input, width: 56 }}
                value={data.rounds}
                onChange={(e) => onChange({ ...data, rounds: e.target.value })}
              />
            </>
          )}
        </div>
      </div>
      {items.map((it, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
          <input
            style={input}
            placeholder="Ejercicio"
            value={it.ex}
            onChange={(e) => setItem(i, { ex: e.target.value })}
          />
          <input
            style={{ ...input, maxWidth: 140 }}
            placeholder="Cantidad"
            value={it.val}
            onChange={(e) => setItem(i, { val: e.target.value })}
          />
          <button type="button" style={rmBtn} onClick={() => delItem(i)}>×</button>
        </div>
      ))}
      <button type="button" style={smallBtn} onClick={addItem}>+ Agregar ejercicio</button>
    </div>
  );
}

function FuerzaBlock({ bloques, onChange }) {
  function setBloque(i, patch) {
    onChange(bloques.map((b, idx) => (idx === i ? { ...b, ...patch } : b)));
  }
  function setSet(bi, si, patch) {
    const b = bloques[bi];
    const sets = b.sets.map((s, idx) => (idx === si ? { ...s, ...patch } : s));
    setBloque(bi, { sets });
  }
  function addBloque() {
    onChange([...bloques, TPL.fuerza()]);
  }
  function delBloque(i) {
    onChange(bloques.filter((_, idx) => idx !== i));
  }
  function addSet(bi) {
    const b = bloques[bi];
    setBloque(bi, { sets: [...b.sets, { s: '', r: '', c: '' }] });
  }
  function delSet(bi, si) {
    const b = bloques[bi];
    setBloque(bi, { sets: b.sets.filter((_, idx) => idx !== si) });
  }

  return (
    <div style={box}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span className="plate red" />
        <span style={{ ...label, fontSize: 14 }}>Fuerza</span>
      </div>
      {bloques.map((b, bi) => (
        <div key={bi} style={{ border: '1px solid var(--line)', borderRadius: 10, padding: 12, marginBottom: 10 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input
              style={input}
              placeholder="Ejercicio (ej: Push Press)"
              value={b.name}
              onChange={(e) => setBloque(bi, { name: e.target.value })}
            />
            <select
              style={{ ...input, maxWidth: 90 }}
              value={b.unit}
              onChange={(e) => setBloque(bi, { unit: e.target.value })}
            >
              <option value="%">% RM</option>
              <option value="kg">kg</option>
            </select>
            <button type="button" style={rmBtn} onClick={() => delBloque(bi)}>×</button>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, marginBottom: 8 }}>
            <input type="checkbox" checked={!!b.rm} onChange={(e) => setBloque(bi, { rm: e.target.checked })} />
            Día de RM (si el alumno supera su máximo, se le actualiza solo)
          </label>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>Series / Reps / Carga</div>
          {b.sets.map((s, si) => (
            <div key={si} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
              <input style={{ ...input, maxWidth: 70 }} placeholder="Series" value={s.s} onChange={(e) => setSet(bi, si, { s: e.target.value })} />
              <input style={{ ...input, maxWidth: 70 }} placeholder="Reps" value={s.r} onChange={(e) => setSet(bi, si, { r: e.target.value })} />
              <input style={{ ...input, maxWidth: 90 }} placeholder={b.unit === '%' ? '% RM' : 'kg'} value={s.c} onChange={(e) => setSet(bi, si, { c: e.target.value })} />
              <button type="button" style={rmBtn} onClick={() => delSet(bi, si)}>×</button>
            </div>
          ))}
          <button type="button" style={smallBtn} onClick={() => addSet(bi)}>+ Agregar serie</button>
        </div>
      ))}
      <button type="button" style={smallBtn} onClick={addBloque}>+ Agregar ejercicio de fuerza</button>
    </div>
  );
}

function WodsBlock({ wods, onChange }) {
  function setWod(i, patch) {
    onChange(wods.map((w, idx) => (idx === i ? { ...w, ...patch } : w)));
  }
  function setItem(wi, ii, patch) {
    const w = wods[wi];
    const items = w.items.map((it, idx) => (idx === ii ? { ...it, ...patch } : it));
    setWod(wi, { items });
  }
  function addWod() {
    const nuevo = TPL.wod();
    if (wods.length > 0) nuevo.descanso = '3';
    onChange([...wods, nuevo]);
  }
  function delWod(i) {
    onChange(wods.filter((_, idx) => idx !== i));
  }
  function addItem(wi) {
    const w = wods[wi];
    setWod(wi, { items: [...w.items, { q: '', u: 'reps', ex: '', w: '' }] });
  }
  function delItem(wi, ii) {
    const w = wods[wi];
    setWod(wi, { items: w.items.filter((_, idx) => idx !== ii) });
  }

  return (
    <div style={box}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span className="plate blue" />
        <span style={{ ...label, fontSize: 14 }}>WOD{wods.length > 1 ? 'S' : ''}</span>
      </div>
      {wods.map((w, wi) => (
        <div key={wi} style={{ border: '1px solid var(--line)', borderRadius: 10, padding: 12, marginBottom: 10 }}>
          {wi > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, color: 'var(--muted)', fontSize: 13 }}>
              <span>Descanso antes de este WOD (min):</span>
              <input
                style={{ ...input, maxWidth: 60 }}
                value={w.descanso}
                onChange={(e) => setWod(wi, { descanso: e.target.value })}
              />
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            <select style={{ ...input, maxWidth: 140 }} value={w.type} onChange={(e) => setWod(wi, { type: e.target.value })}>
              {WOD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <input style={{ ...input, maxWidth: 90 }} placeholder="Min." value={w.time} onChange={(e) => setWod(wi, { time: e.target.value })} />
            <input style={{ ...input, flex: 1, minWidth: 120 }} placeholder="Nombre (ej: Fran, opcional)" value={w.name} onChange={(e) => setWod(wi, { name: e.target.value })} />
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <input type="checkbox" checked={!!w.bench} disabled={!w.name} onChange={(e) => setWod(wi, { bench: e.target.checked })} />
              Benchmark
            </label>
            {wods.length > 1 && (
              <button type="button" style={rmBtn} onClick={() => delWod(wi)}>× Quitar WOD</button>
            )}
          </div>
          {w.items.map((it, ii) => (
            <div
              key={ii}
              style={{
                border: '1px solid var(--line)',
                borderRadius: 8,
                padding: 8,
                marginBottom: 6,
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              <div style={{ display: 'flex', gap: 6 }}>
                <input style={{ ...input, width: 60, flex: 'none' }} placeholder="Cant." value={it.q} onChange={(e) => setItem(wi, ii, { q: e.target.value })} />
                <select style={{ ...input, width: 80, flex: 'none' }} value={it.u} onChange={(e) => setItem(wi, ii, { u: e.target.value })}>
                  <option value="reps">reps</option>
                  <option value="m">m</option>
                  <option value="cal">cal</option>
                </select>
                <input style={{ ...input, flex: 1, minWidth: 0 }} placeholder="Ejercicio" value={it.ex} onChange={(e) => setItem(wi, ii, { ex: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <input style={{ ...input, flex: 1 }} placeholder="Peso (opcional)" value={it.w} onChange={(e) => setItem(wi, ii, { w: e.target.value })} />
                <button type="button" style={{ ...rmBtn, flex: 'none' }} onClick={() => delItem(wi, ii)}>× Quitar</button>
              </div>
            </div>
          ))}
          <button type="button" style={smallBtn} onClick={() => addItem(wi)}>+ Agregar movimiento</button>
        </div>
      ))}
      <button type="button" style={smallBtn} onClick={addWod}>+ Agregar otro WOD (con descanso al medio)</button>
    </div>
  );
}

export default function DayEditor({ fecha, initial }) {
  const [data, setData] = useState(
    initial || {
      core: TPL.core(),
      warm: TPL.core(),
      fuerza: [],
      wods: [TPL.wod()],
      nota: '',
    }
  );
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState('');

  function handleSave() {
    startTransition(async () => {
      setMsg('');
      const res = await saveDia(fecha, data);
      setMsg(res.error ? `Error: ${res.error}` : 'Guardado.');
    });
  }

  return (
    <div>
      <RoundsBlock title="Core" color="green" data={data.core} onChange={(core) => setData({ ...data, core })} />
      <RoundsBlock title="Warm up" color="yellow" data={data.warm} onChange={(warm) => setData({ ...data, warm })} />
      <FuerzaBlock bloques={data.fuerza} onChange={(fuerza) => setData({ ...data, fuerza })} />
      <WodsBlock wods={data.wods} onChange={(wods) => setData({ ...data, wods })} />

      <div style={box}>
        <div style={{ ...label, marginBottom: 8 }}>Nota para los alumnos (opcional)</div>
        <textarea
          style={{ ...input, minHeight: 70, resize: 'vertical' }}
          value={data.nota}
          onChange={(e) => setData({ ...data, nota: e.target.value })}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          type="button"
          onClick={handleSave}
          disabled={pending}
          style={{
            padding: '12px 20px',
            borderRadius: 8,
            border: 'none',
            background: 'var(--ink)',
            color: 'var(--ink-inv)',
            fontWeight: 700,
            fontSize: 15,
            cursor: pending ? 'default' : 'pointer',
            opacity: pending ? 0.7 : 1,
          }}
        >
          {pending ? 'Guardando...' : 'Guardar día'}
        </button>
        {msg && <span style={{ fontSize: 14, color: msg.startsWith('Error') ? 'var(--red)' : 'var(--good)' }}>{msg}</span>}
      </div>
    </div>
  );
}
