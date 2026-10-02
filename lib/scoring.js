// Convierte "8:32" -> 512 segundos. Devuelve null si no es válido.
// Acepta también "8:5" (segundos sin el cero adelante) para no trabar
// la carga rápida con teclado numérico.
export function tiempoASegundos(mmss) {
  if (!mmss) return null;
  const m = String(mmss).trim().match(/^(\d{1,3}):([0-5]?\d)$/);
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

// Va formateando en vivo lo que el alumno tapea con el teclado numérico,
// sin que tenga que escribir ":". Ej: tapear 8, 3, 2 -> "8:32".
export function formatTiempoVivo(raw) {
  const digits = String(raw).replace(/\D/g, '').slice(0, 6);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `0:${digits}`;
  const seg = digits.slice(-2);
  const min = String(parseInt(digits.slice(0, -2), 10));
  return `${min}:${seg}`;
}

export function segundosATiempo(seg) {
  if (seg == null) return '';
  const m = Math.floor(seg / 60);
  const s = seg % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// Determina si un WOD se mide por tiempo (menor = mejor) o por rondas/reps (mayor = mejor)
export function esPorTiempo(tipo) {
  return tipo === 'For time' || tipo === 'A completar';
}

// Arma el objeto de puntaje guardable para un WOD, a partir del input del alumno.
export function armarScore(tipo, input) {
  if (esPorTiempo(tipo)) {
    const seg = tiempoASegundos(input.tiempo);
    if (seg == null) return null;
    return { modo: 'tiempo', valor: seg, texto: segundosATiempo(seg) };
  }
  const rondas = parseInt(input.rondas, 10);
  const reps = parseInt(input.reps || '0', 10);
  if (isNaN(rondas)) return null;
  return {
    modo: 'rondas',
    valor: rondas * 100000 + (isNaN(reps) ? 0 : reps),
    texto: reps ? `${rondas} rondas + ${reps} reps` : `${rondas} rondas`,
  };
}

// Ordena resultados de un WOD: mejor primero. Los que no completaron el WOD
// (marcados explícitamente, o con 00:00 cargado por error) van siempre al final.
export function ordenarPorScore(resultados, wi) {
  const conScore = [...resultados].filter((r) => r.wod && r.wod[wi]);

  const completos = [];
  const incompletos = [];
  conScore.forEach((r) => {
    const s = r.wod[wi];
    const noCompleto = s.completo === false || (s.modo === 'tiempo' && s.valor <= 0);
    (noCompleto ? incompletos : completos).push(r);
  });

  completos.sort((a, b) => {
    const sa = a.wod[wi];
    const sb = b.wod[wi];
    if (sa.modo === 'tiempo') return sa.valor - sb.valor; // menor primero
    return sb.valor - sa.valor; // mayor primero
  });

  return [...completos, ...incompletos];
}
