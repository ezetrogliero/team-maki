'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { actualizarAlumno } from '@/app/coach/alumnos/actions';

function chipEstado(p, estadoHoy) {
  if (!p.activo) return <span className="chip">De baja</span>;
  if (estadoHoy?.ausente) return <span className="chip">Ausente hoy</span>;
  if (estadoHoy) return <span className="chip good">Cargó hoy</span>;
  return <span className="chip warn">Sin cargar hoy</span>;
}

export default function AlumnoRow({ p, rmCount, totalLifts, estadoHoy, wodHoyNombre }) {
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
        {p.rol !== 'coach' && chipEstado(p, estadoHoy)}
      </div>
      {p.rol !== 'coach' && totalLifts != null && (
        <span className="s">
          {rmCount} de {totalLifts} RM cargados
          {estadoHoy?.score ? ` · ${wodHoyNombre || 'WOD'} ${estadoHoy.score}` : ''}
        </span>
      )}
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
        {p.rol !== 'coach' && (
          <Link href={`/coach/alumnos/${p.id}`} className="btn sm ghost">
            Ver progreso →
          </Link>
        )}
      </div>
    </div>
  );
}
