// Convierte "8:32" -> 512 segundos. Devuelve null si no es válido.
export function tiempoASegundos(mmss) {
  if (!mmss) return null;
  const m = String(mmss).trim().match(/^(\d{1,3}):([0-5]\d)$/);
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
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

// Ordena resultados de un WOD: mejor primero.
export function ordenarPorScore(resultados, wi) {
  return [...resultados]
    .filter((r) => r.wod && r.wod[wi])
    .sort((a, b) => {
      const sa = a.wod[wi];
      const sb = b.wod[wi];
      if (sa.modo === 'tiempo') return sa.valor - sb.valor; // menor primero
      return sb.valor - sa.valor; // mayor primero
    });
}
