const box = {
  background: 'var(--surface)',
  border: '1px solid var(--line)',
  borderRadius: 12,
  padding: 16,
  marginBottom: 16,
};
const titleStyle = { fontSize: 13, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 10 };
const row = { display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--line)', fontSize: 14 };

function RoundsView({ title, data }) {
  if (!data || !data.items || data.items.length === 0) return null;
  return (
    <div style={box}>
      <div style={titleStyle}>{title} · {data.rounds} vueltas</div>
      {data.items.map((it, i) => (
        <div key={i} style={{ ...row, borderBottom: i === data.items.length - 1 ? 'none' : row.borderBottom }}>
          <span>{it.ex}</span>
          <span style={{ fontFamily: 'var(--mono)', color: 'var(--muted)' }}>{it.val}</span>
        </div>
      ))}
    </div>
  );
}

function FuerzaView({ bloques }) {
  if (!bloques || bloques.length === 0) return null;
  return (
    <div style={box}>
      <div style={titleStyle}>Fuerza</div>
      {bloques.map((b, bi) => (
        <div key={bi} style={{ marginBottom: bi === bloques.length - 1 ? 0 : 12 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{b.name}</div>
          {b.sets.map((s, si) => (
            <div key={si} style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--muted)' }}>
              {s.s} x {s.r} @ {s.c}{b.unit}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function WodsView({ wods }) {
  if (!wods || wods.length === 0) return null;
  return (
    <>
      {wods.map((w, wi) => (
        <div key={wi}>
          {wi > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: 'var(--muted)',
                fontSize: 12,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '.06em',
                margin: '4px 2px',
              }}
            >
              <span style={{ flex: 1, height: 1, background: 'var(--line)' }} />
              Descanso · {w.descanso} min
              <span style={{ flex: 1, height: 1, background: 'var(--line)' }} />
            </div>
          )}
          <div style={box}>
            <div style={titleStyle}>
              {wods.length > 1 ? `WOD ${wi + 1} · ` : ''}
              {w.name ? `${w.name} · ` : ''}
              {w.type}
              {w.time ? ` · ${w.time} min` : ''}
              {w.bench ? ' · Benchmark' : ''}
            </div>
            {w.items.map((it, ii) => (
              <div key={ii} style={{ ...row, borderBottom: ii === w.items.length - 1 ? 'none' : row.borderBottom }}>
                <span>{it.ex}</span>
                <span style={{ fontFamily: 'var(--mono)', color: 'var(--muted)' }}>
                  {it.q} {it.u}{it.w ? ` · ${it.w}` : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

export default function DayView({ contenido, nota }) {
  if (!contenido) {
    return (
      <div style={box}>
        <p style={{ margin: 0, color: 'var(--muted)', fontSize: 14 }}>
          Todavía no hay programación cargada para este día.
        </p>
      </div>
    );
  }
  return (
    <div>
      <RoundsView title="Core" data={contenido.core} />
      <RoundsView title="Warm up" data={contenido.warm} />
      <FuerzaView bloques={contenido.fuerza} />
      <WodsView wods={contenido.wods} />
      {nota && (
        <div style={{ ...box, background: 'var(--surface2)' }}>
          <div style={titleStyle}>Nota de la coach</div>
          <p style={{ margin: 0, fontSize: 14 }}>{nota}</p>
        </div>
      )}
    </div>
  );
}
