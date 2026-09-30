'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { marcarAusente, desmarcarAusente } from '@/app/alumno/dia/[fecha]/actions';

export default function Asistencia({ fecha, ausente }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function toggle() {
    startTransition(async () => {
      if (ausente) await desmarcarAusente(fecha);
      else await marcarAusente(fecha);
      router.refresh();
    });
  }

  if (ausente) {
    return (
      <div className="banner">
        <span>
          <strong>Marcaste ausente este día.</strong>
          <br />
          <span className="small muted">No aparecés en el ranking ni como pendiente.</span>
        </span>
        <button type="button" className="btn ghost sm" disabled={pending} onClick={toggle}>
          {pending ? '...' : 'Deshacer'}
        </button>
      </div>
    );
  }

  return (
    <div className="btnrow">
      <span className="small muted">¿No viniste hoy?</span>
      <button type="button" className="btn ghost sm" disabled={pending} onClick={toggle}>
        {pending ? '...' : 'Marcar ausente'}
      </button>
    </div>
  );
}
