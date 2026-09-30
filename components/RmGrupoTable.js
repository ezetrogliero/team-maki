'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { corregirRM } from '@/app/coach/alumnos/actions';
import { formatoKg } from '@/lib/rm';

export default function RmGrupoTable({ alumnos, lifts }) {
  const [lift, setLift] = useState(lifts[0]);
  const [valores, setValores] = useState({});
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const conRM = alumnos.filter((a) => a.rms[lift] != null).length;

  function guardar(id) {
    const v = valores[id];
    if (!v) return;
    startTransition(async () => {
      await corregirRM(id, lift, v);
      router.refresh();
    });
  }

  return (
    <>
      <div className="phead">
        <h2>RMs del grupo</h2>
        <span className="small muted">{conRM} de {alumnos.length} con RM</span>
      </div>
      <select className="bigsel" value={lift} onChange={(e) => setLift(e.target.value)} aria-label="Ejercicio">
        {lifts.map((l) => (
          <option key={l} value={l}>{l}</option>
        ))}
      </select>
      <div className="card klist" key={lift}>
        {alumnos.length === 0 && <p className="small muted" style={{ margin: 0 }}>No hay alumnos activos.</p>}
        {alumnos.map((a) => (
          <div className="krow" key={a.id}>
            <label htmlFor={`g-${a.id}`}>{a.nombre}</label>
            <span className="kin">
              <input
                id={`g-${a.id}`}
                inputMode="decimal"
                defaultValue={a.rms[lift] != null ? formatoKg(a.rms[lift]) : ''}
                placeholder="—"
                disabled={pending}
                onChange={(e) => setValores((v) => ({ ...v, [a.id]: e.target.value }))}
                onBlur={() => guardar(a.id)}
              />
              kg
            </span>
          </div>
        ))}
      </div>
      <p className="small muted" style={{ margin: 0 }}>
        Para corregir un número, tocalo y escribí el nuevo. Queda guardado como un punto más en la progresión del alumno.
      </p>
    </>
  );
}
