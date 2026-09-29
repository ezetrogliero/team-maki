function BlockHead({ color, name, meta }) {
  return (
    <div className="bh">
      <span className={`plate ${color}`} aria-hidden="true" />
      <h3>{name}</h3>
      {meta && <span className="pill">{meta}</span>}
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

function ListBlock({ color, name, data }) {
  if (!data || !data.items || data.items.length === 0) return null;
  return (
    <section className="block">
      <BlockHead color={color} name={name} meta={typeMeta(data)} />
      <ul className="rows">
        {data.items.map((it, i) => (
          <li key={i}>
            <span>{it.ex}</span>
            <b>{it.val}</b>
          </li>
        ))}
      </ul>
    </section>
  );
}

function FuerzaBlock({ bloques }) {
  if (!bloques || bloques.length === 0) return null;
  return (
    <section className="block">
      <BlockHead color="red" name="Fuerza" />
      {bloques.map((b, bi) => (
        <div className="ex" key={bi}>
          <div className="exh">
            <h4>{b.name}</h4>
            {b.rm && <span className="chip rm">RM</span>}
          </div>
          <div className="tw">
            <table>
              <thead>
                <tr><th>Series × reps</th><th className="num">Carga</th></tr>
              </thead>
              <tbody>
                {b.sets.map((s, si) => (
                  <tr key={si}>
                    <td>{s.s} × {s.r}</td>
                    <td className="num big">{s.c}{b.unit === '%' ? '%' : ' kg'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </section>
  );
}

function wodLabel(w) {
  const u = w.type === 'EMOM' ? 'min' : 'min';
  return `${w.type}${w.time ? ` · ${w.time} ${u}` : ''}`;
}

function unidadTexto(u) {
  if (u === 'm') return ' m';
  if (u === 'cal') return ' cal';
  if (u === 'seg') return ' seg';
  return '';
}

function formatPeso(w) {
  if (!w) return '';
  // Si el coach ya escribió la unidad (ej: "40/30 kg"), se respeta tal cual.
  return /[a-zA-Z]/.test(w) ? w : `${w} kg`;
}

function WodsBlock({ wods }) {
  if (!wods || wods.length === 0) return null;
  return (
    <>
      {wods.map((w, wi) => {
        const label = wods.length > 1 ? `WOD ${wi + 1}` : 'WOD';
        return (
          <div key={wi}>
            {wi > 0 && w.descanso && (
              <div className="restdiv">Descanso · {w.descanso} min</div>
            )}
            <section className="block">
              <BlockHead color="blue" name={label} meta={wodLabel(w)} />
              {w.bench && <span className="chip rm" style={{ alignSelf: 'flex-start' }}>Benchmark</span>}
              {w.name && <p className="wodname">{w.name}</p>}
              <ul className="wrows">
                {w.items.map((it, ii) => (
                  <li key={ii}>
                    <span className="q">
                      {w.type === 'EMOM' && <small>Min {ii + 1}</small>}
                      {it.q}{unidadTexto(it.u)}
                    </span>
                    <span>{it.ex}</span>
                    <span className="w">{formatPeso(it.w)}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        );
      })}
    </>
  );
}

export default function DayView({ contenido, nota }) {
  if (!contenido) {
    return (
      <div className="empty">
        <span>Todavía no hay programación cargada para este día.</span>
      </div>
    );
  }
  return (
    <div className="wodexp">
      <ListBlock color="green" name="Core" data={contenido.core} />
      <ListBlock color="yellow" name="Warm up" data={contenido.warm} />
      <FuerzaBlock bloques={contenido.fuerza} />
      <WodsBlock wods={contenido.wods} />
      {nota && (
        <div className="note coachnote">
          <div className="small muted" style={{ marginBottom: 4, fontWeight: 700 }}>Nota de la coach</div>
          <p style={{ margin: 0 }}>{nota}</p>
        </div>
      )}
    </div>
  );
}
