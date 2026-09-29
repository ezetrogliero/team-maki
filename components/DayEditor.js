'use client';

import { useState, useTransition } from 'react';
import { saveDia } from '@/app/coach/dia/actions';
import { TPL, WOD_TYPES, ROUNDS_TYPES } from './dayEditorHelpers';

function BlockHead({ color, name, children }) {
  return (
    <div className="bh">
      <span className={`plate ${color}`} aria-hidden="true" />
      <h3>{name}</h3>
      {children}
    </div>
  );
}

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
  const tipo = data.type || 'Rounds';
  return (
    <section className="edsec">
      <BlockHead color={color} name={title}>
        <span className="pill" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <select value={tipo} onChange={(e) => onChange({ ...data, type: e.target.value })} aria-label={`Tipo de ${title}`}>
            {ROUNDS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          {tipo === 'Rounds' && (
            <input
              style={{ width: 46 }}
              value={data.rounds}
              onChange={(e) => onChange({ ...data, rounds: e.target.value })}
              placeholder="2"
              aria-label="Vueltas"
            />
          )}
        </span>
      </BlockHead>
      <div className="colh" style={{ gridTemplateColumns: '1fr 110px 34px' }}>
        <span>Ejercicio</span><span>Reps / tiempo</span><span></span>
      </div>
      {items.map((it, i) => (
        <div className="edrow two" key={i}>
          <input value={it.ex} onChange={(e) => setItem(i, { ex: e.target.value })} placeholder="Ej: Hollow rock" aria-label="Ejercicio" />
          <input value={it.val} onChange={(e) => setItem(i, { val: e.target.value })} placeholder={tipo.startsWith('Tabata') ? '—' : '15 / 30 seg'} aria-label="Reps o tiempo" />
          <button type="button" className="x" onClick={() => delItem(i)} aria-label="Quitar">×</button>
        </div>
      ))}
      <button type="button" className="add" onClick={addItem}>+ Ejercicio</button>
    </section>
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
    <section className="edsec">
      <BlockHead color="red" name="Fuerza" />
      {bloques.map((b, bi) => (
        <div className="fzed" key={bi}>
          <div className="edrow" style={{ gridTemplateColumns: '1fr 90px 34px' }}>
            <input
              value={b.name}
              onChange={(e) => setBloque(bi, { name: e.target.value })}
              placeholder="Ejercicio (ej: Push Press)"
              aria-label="Ejercicio de fuerza"
            />
            <select value={b.unit} onChange={(e) => setBloque(bi, { unit: e.target.value })} aria-label="Unidad">
              <option value="%">% RM</option>
              <option value="kg">kg</option>
            </select>
            <button type="button" className="x" onClick={() => delBloque(bi)} aria-label="Quitar ejercicio">×</button>
          </div>
          <label className="check">
            <input type="checkbox" checked={!!b.rm} onChange={(e) => setBloque(bi, { rm: e.target.checked })} />
            Día de RM (si el alumno supera su máximo, se le actualiza solo)
          </label>
          <div className="colh" style={{ gridTemplateColumns: 'repeat(3,1fr) 34px' }}>
            <span>Series</span><span>Reps</span><span>{b.unit === '%' ? '% (30–110)' : 'Kg (H/M)'}</span><span></span>
          </div>
          {b.sets.map((s, si) => (
            <div className="edrow set" key={si}>
              <input value={s.s} onChange={(e) => setSet(bi, si, { s: e.target.value })} aria-label="Series" />
              <input value={s.r} onChange={(e) => setSet(bi, si, { r: e.target.value })} aria-label="Reps" />
              <input
                value={s.c}
                onChange={(e) => setSet(bi, si, { c: e.target.value })}
                placeholder={b.unit === '%' ? '70' : '40/30'}
                aria-label="Carga"
              />
              <button type="button" className="x" onClick={() => delSet(bi, si)} aria-label="Quitar serie">×</button>
            </div>
          ))}
          <button type="button" className="add" onClick={() => addSet(bi)}>+ Serie</button>
        </div>
      ))}
      <button type="button" className="add" onClick={addBloque}>+ Otro ejercicio de fuerza</button>
    </section>
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
    <section className="edsec">
      <BlockHead color="blue" name={`WOD${wods.length > 1 ? 'S' : ''}`} />
      {wods.map((w, wi) => (
        <div className="fzed" key={wi}>
          {wi > 0 && (
            <label className="field">
              Descanso antes de este WOD (min)
              <input
                style={{ maxWidth: 80 }}
                value={w.descanso}
                onChange={(e) => setWod(wi, { descanso: e.target.value })}
              />
            </label>
          )}
          <div className="inline">
            <label className="field">
              Tipo
              <select value={w.type} onChange={(e) => setWod(wi, { type: e.target.value })}>
                {WOD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <label className="field">
              Min.
              <input style={{ maxWidth: 80 }} value={w.time} onChange={(e) => setWod(wi, { time: e.target.value })} />
            </label>
            <label className="field" style={{ flex: 1, minWidth: 140 }}>
              Nombre (ej: Fran, opcional)
              <input value={w.name} onChange={(e) => setWod(wi, { name: e.target.value })} />
            </label>
            <label className="check">
              <input type="checkbox" checked={!!w.bench} disabled={!w.name} onChange={(e) => setWod(wi, { bench: e.target.checked })} />
              Benchmark
            </label>
            {wods.length > 1 && (
              <button type="button" className="x" style={{ alignSelf: 'flex-end' }} onClick={() => delWod(wi)} aria-label="Quitar este WOD">×</button>
            )}
          </div>
          <div className="colh" style={{ gridTemplateColumns: '70px 78px 1fr 34px' }}>
            <span>Cant.</span><span>Unidad</span><span>Ejercicio y peso</span><span></span>
          </div>
          {w.items.map((it, ii) => (
            <div className="edrow wod" key={ii}>
              <input value={it.q} onChange={(e) => setItem(wi, ii, { q: e.target.value })} placeholder="21-15-9" aria-label="Cantidad" />
              <select value={it.u} onChange={(e) => setItem(wi, ii, { u: e.target.value })} aria-label="Unidad">
                <option value="reps">reps</option>
                <option value="m">mts</option>
                <option value="cal">cal</option>
                <option value="seg">seg</option>
              </select>
              <input value={it.ex} onChange={(e) => setItem(wi, ii, { ex: e.target.value })} placeholder="Ejercicio" aria-label="Ejercicio" />
              <button type="button" className="x" onClick={() => delItem(wi, ii)} aria-label="Quitar">×</button>
              <input
                className="w2"
                value={it.w}
                onChange={(e) => setItem(wi, ii, { w: e.target.value })}
                placeholder="Peso H/M, ej: 43/30 kg (opcional)"
                aria-label="Peso"
              />
            </div>
          ))}
          <button type="button" className="add" onClick={() => addItem(wi)}>+ Ejercicio</button>
        </div>
      ))}
      <button type="button" className="add" onClick={addWod}>+ Agregar otro WOD (con descanso al medio)</button>
    </section>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <RoundsBlock title="Core" color="green" data={data.core} onChange={(core) => setData({ ...data, core })} />
      <RoundsBlock title="Warm up" color="yellow" data={data.warm} onChange={(warm) => setData({ ...data, warm })} />
      <FuerzaBlock bloques={data.fuerza} onChange={(fuerza) => setData({ ...data, fuerza })} />
      <WodsBlock wods={data.wods} onChange={(wods) => setData({ ...data, wods })} />

      <section className="edsec">
        <label className="field">
          Mensaje de la coach para el día (lo ven todos, opcional)
          <textarea value={data.nota} onChange={(e) => setData({ ...data, nota: e.target.value })} />
        </label>
      </section>

      <div className="edbar" style={{ position: 'static' }}>
        <button type="button" className="btn" onClick={handleSave} disabled={pending}>
          {pending ? 'Guardando...' : 'Guardar día'}
        </button>
        {msg && (
          <span className="small" style={{ color: msg.startsWith('Error') ? 'var(--red)' : 'var(--good)', alignSelf: 'center' }}>
            {msg}
          </span>
        )}
      </div>
    </div>
  );
}
