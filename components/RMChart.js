import { formatoKg, formatoFecha } from '@/lib/rm';

// Gráfico de línea de la evolución del RM, portado 1:1 del algoritmo chart() de la maqueta.
export default function RMChart({ pts }) {
  if (!pts || pts.length === 0) return null;

  const W = 340, H = 160, pl = 42, pr = 16, pt = 22, pb = 28;
  const vs = pts.map((p) => p.valor);
  let mn = Math.min(...vs);
  let mx = Math.max(...vs);
  if (mx - mn < 10) {
    const c = (mx + mn) / 2;
    mn = c - 5;
    mx = c + 5;
  }
  mn = Math.floor(mn / 5) * 5;
  mx = Math.ceil(mx / 5) * 5;

  const x = (i) => pl + (pts.length === 1 ? (W - pl - pr) / 2 : (i * (W - pl - pr)) / (pts.length - 1));
  const y = (v) => pt + (H - pt - pb) * (1 - (v - mn) / (mx - mn));
  const ticks = [mn, (mn + mx) / 2, mx];

  const linePath = pts.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.valor).toFixed(1)}`).join('');
  const areaPath = `${linePath}L${x(pts.length - 1).toFixed(1)},${H - pb}L${x(0).toFixed(1)},${H - pb}Z`;
  const last = pts.length - 1;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Evolución del RM">
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={pl} x2={W - pr} y1={y(t)} y2={y(t)} stroke="var(--line)" strokeWidth="1" />
          <text x={pl - 6} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--muted)">
            {formatoKg(t)}
          </text>
        </g>
      ))}
      {pts.length > 1 && (
        <>
          <path d={areaPath} fill="var(--red)" fillOpacity=".12" />
          <path d={linePath} fill="none" stroke="var(--red)" strokeWidth="2.5" strokeLinejoin="round" />
        </>
      )}
      {pts.map((p, i) => (
        <g key={i}>
          <circle
            cx={x(i)}
            cy={y(p.valor)}
            r={i === last ? 5 : 3}
            fill={i === last ? 'var(--red)' : 'var(--surface)'}
            stroke="var(--red)"
            strokeWidth="2"
          />
          <text x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="var(--muted)">
            {formatoFecha(p.fecha)}
          </text>
        </g>
      ))}
    </svg>
  );
}
