'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatoKg, formatoFecha } from '@/lib/rm';
import { segundosATiempo } from '@/lib/scoring';
import { corregirRM, actualizarAlumno } from '@/app/coach/alumnos/actions';
import RMChart from './RMChart';
import DayView from './DayView';

// Pantalla de "planilla" de un alumno: la misma estructura tanto para "Mi progreso" (alumno)
// como para la vista del coach sobre un alumno puntual, igual que planillaView() en la maqueta.
export default function Planilla({
  nombre,
  subtitulo,
  backHref,
  lifts,
  misRMs,
  rmHistorial,
  wodRows,
  benchmarks,
  comentarios,
  cargados,
  frows = [],
  mostrarComentarios = true,
  coach = false,
  activo = true,
  alumnoId,
}) {
  const [lift, setLift] = useState(lifts[0]);
  const [expandido, setExpandido] = useState(null);

  const valor = misRMs[lift];
  const pts = rmHistorial[lift] || [];
  const primero = pts[0]?.valor;
  const delta = valor != null && primero != null ? valor - primero : 0;

  return (
    <>
      {backHref && (
        <Link href={backHref} className="btn ghost sm back">‹ Alumnos</Link>
      )}
      <div className="phead">
        <h2>{nombre}</h2>
        <span className="small muted">
          {subtitulo}
          {coach && !activo ? ' · de baja' : ''}
        </span>
      </div>

      <section className="sect">
        <h3>Progresión de fuerza</h3>
        <span className="small muted">{cargados} de {lifts.length} RM cargados</span>
        <select className="bigsel" value={lift} onChange={(e) => setLift(e.target.value)} aria-label="Ejercicio">
          {lifts.map((l) => (
            <option key={l} value={l}>
              {l} — {misRMs[l] != null ? `${formatoKg(misRMs[l])} kg` : 'sin cargar'}
            </option>
          ))}
        </select>
        <RmHero lift={lift} valor={valor} pts={pts} delta={delta} coach={coach} alumnoId={alumnoId} />
      </section>

      <section className="sect">
        <h3>Benchmarks</h3>
        {benchmarks.length === 0 ? (
          <p className="small muted" style={{ margin: 0 }}>Todavía no hay benchmarks marcados.</p>
        ) : (
          benchmarks.map((b) => <BenchmarkCard key={b.nombre} b={b} />)
        )}
      </section>

      <section className="sect">
        <h3>WODs</h3>
        <span className="small muted">Tocá un día para ver cómo estaba armado</span>
        <div className="card tw">
          <table>
            <thead>
              <tr>
                <th>Día</th>
                <th>WOD</th>
                <th className="num">Resultado</th>
                <th className="num">Puesto</th>
              </tr>
            </thead>
            <tbody>
              {wodRows.length === 0 && (
                <tr><td colSpan={4} className="muted">Sin resultados.</td></tr>
              )}
              {wodRows.map((row) => (
                <WodRows key={row.fecha} row={row} expandido={expandido} setExpandido={setExpandido} />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="sect">
        <h3>Fuerza: peso máximo usado</h3>
        <span className="small muted">Calculado según el % del RM (o el kg fijo) que programó la coach cada día</span>
        <div className="card tw">
          <table>
            <thead>
              <tr>
                <th>Día</th>
                <th>Ejercicio</th>
                <th className="num">Series</th>
                <th className="num">Máx.</th>
              </tr>
            </thead>
            <tbody>
              {frows.length === 0 ? (
                <tr><td colSpan={4} className="muted">Sin cargas.</td></tr>
              ) : (
                frows.map((f, i) => (
                  <tr key={i}>
                    <td>{formatoFecha(f.fecha)}</td>
                    <td>{f.ejercicio}</td>
                    <td className="num">{f.series}</td>
                    <td className="num big">{formatoKg(f.maximo)} kg</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {mostrarComentarios && (
        <section className="sect">
          <h3>{coach ? 'Comentarios del alumno' : 'Mis comentarios'}</h3>
          <div className="comments">
            {comentarios.length === 0 ? (
              <p className="small muted" style={{ margin: 0 }}>Sin comentarios.</p>
            ) : (
              comentarios.map((c, i) => (
                <div className="note" key={i}>
                  <div className="who">{formatoFecha(c.fecha)}</div>
                  <div>{c.texto}</div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {coach && <EstadoAlumno alumnoId={alumnoId} activo={activo} />}
    </>
  );
}

function RmHero({ lift, valor, pts, delta, coach, alumnoId }) {
  const router = useRouter();
  const [corrigiendo, setCorrigiendo] = useState('');
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState('');

  async function guardar() {
    if (!corrigiendo) return;
    setPending(true);
    setMsg('');
    const res = await corregirRM(alumnoId, lift, corrigiendo);
    setPending(false);
    if (res?.error) {
      setMsg(res.error);
    } else {
      setMsg('Guardado ✓');
      setCorrigiendo('');
      router.refresh();
    }
  }

  return (
    <div className="rmhero">
      <div className="rmtop">
        <div>
          <div className="small muted">RM actual de {lift}</div>
          <div className="bigv">
            {valor != null ? formatoKg(valor) : '—'}
            <small>{valor != null ? 'kg' : ''}</small>
          </div>
        </div>
        {delta > 0 ? (
          <span className="delta">+{formatoKg(delta)} kg desde {formatoFecha(pts[0].fecha)}</span>
        ) : valor != null ? (
          <span className="small muted">Sin cambios todavía</span>
        ) : (
          <span className="small muted">Sin cargar</span>
        )}
      </div>
      {pts.length > 0 && (
        <div className="chartbox">
          <RMChart pts={pts} />
        </div>
      )}
      {coach && (
        <div className="fix">
          <label className="field">
            Corregir RM (kg)
            <input
              className="num"
              inputMode="decimal"
              value={corrigiendo}
              onChange={(e) => setCorrigiendo(e.target.value)}
              placeholder={valor != null ? formatoKg(valor) : ''}
            />
          </label>
          <button type="button" className="btn sm" disabled={pending} onClick={guardar}>
            {pending ? 'Guardando…' : 'Guardar'}
          </button>
          {msg && <span className="small muted">{msg}</span>}
        </div>
      )}
    </div>
  );
}

function BenchmarkCard({ b }) {
  if (b.hist.length === 0) {
    return (
      <div className="card bench">
        <strong>{b.nombre}</strong>
        <span className="small muted">Todavía sin tiempo</span>
      </div>
    );
  }
  const last = b.hist[b.hist.length - 1].segundos;
  const prev = b.hist.length > 1 ? b.hist[b.hist.length - 2].segundos : null;
  const diff = prev != null ? last - prev : null;
  return (
    <div className="card bench">
      <strong>{b.nombre}</strong>
      <span className="small">
        {b.hist.map((h, i) => (
          <span key={i}>
            {i > 0 && ' → '}
            {formatoFecha(h.fecha)} <b>{segundosATiempo(h.segundos)}</b>
          </span>
        ))}
      </span>
      {diff != null && (
        <span className={`chip ${diff < 0 ? 'good' : 'warn'}`}>
          {diff < 0 ? '−' : '+'}{segundosATiempo(Math.abs(diff))}
        </span>
      )}
    </div>
  );
}

function WodRows({ row, expandido, setExpandido }) {
  const key = row.fecha;
  const abierto = expandido === key;
  const toggle = () => setExpandido(abierto ? null : key);

  if (row.ausente) {
    return (
      <>
        <tr className="wodrow" onClick={toggle}>
          <td>{formatoFecha(row.fecha)}</td>
          <td className="muted">Ausente</td>
          <td className="num muted" colSpan={2}>—</td>
        </tr>
        {abierto && (
          <tr><td colSpan={4} style={{ padding: 0 }}><DayView contenido={row.contenido} nota={row.nota} modo="coach" /></td></tr>
        )}
      </>
    );
  }

  if (row.items.length === 0) {
    return (
      <tr>
        <td>{formatoFecha(row.fecha)}</td>
        <td className="muted" colSpan={3}>Sin resultado cargado.</td>
      </tr>
    );
  }

  return (
    <>
      {row.items.map((it, wi) => (
        <tr key={wi} className="wodrow" onClick={toggle}>
          <td>{wi === 0 ? formatoFecha(row.fecha) : ''}</td>
          <td>
            {it.nombre}
            {it.bench && <span className="chip rm" style={{ marginLeft: 6, verticalAlign: 'middle' }}>B</span>}
          </td>
          <td className="num big">{it.texto}</td>
          <td className="num muted">{it.puesto}</td>
        </tr>
      ))}
      {abierto && (
        <tr><td colSpan={4} style={{ padding: 0 }}><DayView contenido={row.contenido} nota={row.nota} modo="coach" /></td></tr>
      )}
    </>
  );
}

function EstadoAlumno({ alumnoId, activo }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function toggle() {
    setPending(true);
    await actualizarAlumno(alumnoId, { activo: !activo });
    setPending(false);
    router.refresh();
  }

  return (
    <section className="sect">
      <h3>Estado</h3>
      <div className="banner">
        <span>{activo ? 'Activo' : 'Dado de baja. No puede entrar, pero su historial queda guardado.'}</span>
        <button type="button" className="btn ghost sm" disabled={pending} onClick={toggle}>
          {activo ? 'Dar de baja' : 'Reactivar'}
        </button>
      </div>
    </section>
  );
}
