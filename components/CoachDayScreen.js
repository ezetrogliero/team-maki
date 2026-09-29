'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DayView from './DayView';
import DayEditor from './DayEditor';

export default function CoachDayScreen({ fecha, contenido, notaCoach }) {
  const tieneDia = !!contenido;
  const [editing, setEditing] = useState(!tieneDia);
  const router = useRouter();

  function handleSaved() {
    setEditing(false);
    router.refresh();
  }

  if (editing) {
    const initial = tieneDia ? { ...contenido, nota: notaCoach || '' } : null;
    return (
      <div>
        <div className="phead" style={{ marginBottom: 10 }}>
          <h3 style={{ margin: 0 }}>{tieneDia ? 'Editar día' : 'Armar entrenamiento'}</h3>
          {tieneDia && (
            <button type="button" className="btn ghost sm" onClick={() => setEditing(false)}>
              Cancelar
            </button>
          )}
        </div>
        <DayEditor fecha={fecha} initial={initial} onSaved={handleSaved} />
      </div>
    );
  }

  return (
    <div>
      <div className="btnrow" style={{ marginBottom: 10 }}>
        <button type="button" className="btn sm" onClick={() => setEditing(true)}>
          Editar día
        </button>
      </div>
      <DayView contenido={contenido} nota={notaCoach} />
    </div>
  );
}
