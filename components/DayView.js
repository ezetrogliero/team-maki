const box = {
  background: 'var(--surface)',
  border: '1px solid var(--line)',
  borderRadius: 12,
  padding: 16,
  marginBottom: 16,
};
const row = { display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--line)', fontSize: 14 };

function BlockHead({ color, title, meta }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
      <span className={`plate ${color}`} />
      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{title}</h3>
      {meta && (
        <span
          style={{
            marginLeft: 'auto',
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--muted)',
            background: 'var(--surface2)',
            borderRadius: 999,
            padding: '2px 8px',
          }}
        >
          {meta}
        </span>
      )}
    </div>
  );
}

function typeMeta(b) {
  if (b.type === 'Rounds') return `${b.rounds || '?'} rounds`;
  if (b.type === 'Tabata') return 'Tabata · 8 × 20″/10″';
  if (b.type === 'Tabata x2') return 'Tabata x2';
  if (b.type === 'A completar') return 'A completar · sin tiempo';
  return b.type;
}

function RoundsView({ title, color, data }) {
  if (!data || !data.items || data.items.length === 0) return null;
  return (
    <div style={box}>
      <BlockHead color={color} title={title} meta={typeMeta(data)} />
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
      <BlockHead color="red" title="Fuerza" />
      {bloques.map((b, bi) => (
        <div key={bi} style={{ marginBottom: bi === bloques.length - 1 ? 0 : 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>{b.name}</span>
            {b.rm && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: 'var(--ink)',
                  background: 'var(--gold)',
                  borderRadius: 999,
                  padding: '1px 7px',
                }}
              >
                RM
              </span>
            )}
          </div>
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
            <BlockHead
              color="blue"
              title={wods.length > 1 ? `WOD ${wi + 1}${w.name ? ` · ${w.name}` : ''}` : w.name || 'WOD'}
              meta={`${w.type}${w.time ? ` · ${w.time} min` : ''}`}
            />
            {w.bench && (
              <span
                style={{
                  display: 'inline-block',
                  fontSize: 10,
                  fontWeight: 700,
                  color: 'var(--ink)',
                  background: 'var(--gold)',
                  borderRadius: 999,
                  padding: '2px 8px',
                  marginBottom: 8,
                }}
              >
                BENCHMARK
              </span>
            )}
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
      <RoundsView title="Core" color="green" data={contenido.core} />
      <RoundsView title="Warm up" color="yellow" data={contenido.warm} />
      <FuerzaView bloques={contenido.fuerza} />
      <WodsView wods={contenido.wods} />
      {nota && (
        <div style={{ ...box, background: 'var(--surface2)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8 }}>
            Nota de la coach
          </div>
          <p style={{ margin: 0, fontSize: 14 }}>{nota}</p>
        </div>
      )}
    </div>
  );
}
