// Helpers para el cálculo de kilos a partir del RM (récord máximo) de cada alumno.

export function redondear25(v) {
  if (v == null || Number.isNaN(v)) return null;
  return Math.round(v / 2.5) * 2.5;
}

export function formatoKg(v) {
  if (v == null || Number.isNaN(v)) return '';
  const n = Number(v);
  const s = Number.isInteger(n) ? String(n) : n.toFixed(1).replace(/\.0$/, '');
  return s.replace('.', ',');
}

// Fecha corta tipo "21 sep", igual que en la maqueta.
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
export function formatoFecha(iso) {
  if (!iso) return '';
  const [, m, d] = iso.split('-');
  return `${Number(d)} ${MESES[Number(m) - 1]}`;
}

// El ejercicio contra el que se calcula el % de un bloque de fuerza:
// el nombre mismo si es un levantamiento principal, o el "RM base" elegido si es un accesorio.
export function liftDe(bloque) {
  return bloque.acc ? bloque.base : bloque.name;
}
