'use client';

import { useState, useTransition } from 'react';
import { actualizarAlumno } from '@/app/coach/alumnos/actions';

export default function AlumnoRow({ p }) {
  const [nombre, setNombre] = useState(p.nombre);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function guardarNombre() {
    startTransition(async () => {
      await actualizarAlumno(p.id, { nombre });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    });
  }

  function toggleActivo() {
    startTransition(async () => {
      await actualizarAlumno(p.id, { activo: !p.activo });
    });
  }

  function toggleRol() {
    const nuevo = p.rol === 'coach' ? 'alumno' : 'coach';
    if (!confirm(`¿Seguro que querés que ${p.nombre} sea "${nuevo}"?`)) return;
    startTransition(async () => {
      await actualizarAlumno(p.id, { rol: nuevo });
    });
  }

  return (
    <div className={`arow${p.activo ? '' : ' off'}`}>
      <div className="n" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          style={{ flex: 1, minWidth: 100, padding: '6px 8px', border: '1px solid var(--line)', borderRadius: 6, background: 'var(--surface2)' }}
        />
        <span className={`chip${p.rol === 'coach' ? ' rm' : ''}`}>{p.rol}</span>
      </div>
      <span className="s">{p.email}</span>
      <div className="s" style={{ gridColumn: '1/-1', display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
        <button type="button" className="btn sm ghost" disabled={pending} onClick={guardarNombre}>
          {saved ? 'Guardado ✓' : 'Guardar nombre'}
        </button>
        <button type="button" className="btn sm ghost" disabled={pending} onClick={toggleActivo}>
          {p.activo ? 'Desactivar' : 'Activar'}
        </button>
        <button type="button" className="btn sm ghost" disabled={pending} onClick={toggleRol}>
          Hacer {p.rol === 'coach' ? 'alumno' : 'coach'}
        </button>
      </div>
    </div>
  );
}
