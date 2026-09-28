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

  const input = {
    padding: '8px 10px',
    borderRadius: 8,
    border: '1px solid var(--line)',
    background: 'var(--bg)',
    color: 'var(--ink)',
    fontSize: 14,
  };
  const btn = {
    padding: '6px 10px',
    borderRadius: 6,
    border: '1px solid var(--line)',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: 13,
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 0',
        borderBottom: '1px solid var(--line)',
        opacity: p.activo ? 1 : 0.5,
        flexWrap: 'wrap',
      }}
    >
      <input style={{ ...input, flex: 1, minWidth: 140 }} value={nombre} onChange={(e) => setNombre(e.target.value)} />
      <span style={{ fontSize: 13, color: 'var(--muted)', minWidth: 160 }}>{p.email}</span>
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase',
          padding: '3px 8px',
          borderRadius: 999,
          background: p.rol === 'coach' ? 'var(--gold)' : 'var(--surface2)',
          color: p.rol === 'coach' ? 'var(--ink)' : 'var(--muted)',
        }}
      >
        {p.rol}
      </span>
      <button type="button" style={btn} disabled={pending} onClick={guardarNombre}>
        {saved ? 'Guardado ✓' : 'Guardar nombre'}
      </button>
      <button type="button" style={btn} disabled={pending} onClick={toggleActivo}>
        {p.activo ? 'Desactivar' : 'Activar'}
      </button>
      <button type="button" style={btn} disabled={pending} onClick={toggleRol}>
        Hacer {p.rol === 'coach' ? 'alumno' : 'coach'}
      </button>
    </div>
  );
}
