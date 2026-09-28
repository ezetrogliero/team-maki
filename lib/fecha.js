export function hoyFecha() {
  // Fecha de hoy en la zona horaria de Argentina, formato YYYY-MM-DD
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Argentina/Salta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return fmt.format(new Date());
}

export function sumarDias(fechaISO, dias) {
  const [y, m, d] = fechaISO.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + dias);
  return dt.toISOString().slice(0, 10);
}

const DIAS_CORTO = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];

// Devuelve las 7 fechas (lunes a domingo) de la semana que contiene fechaISO
export function semanaDe(fechaISO) {
  const [y, m, d] = fechaISO.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const diaSemana = dt.getUTCDay(); // 0=domingo
  const offsetALunes = diaSemana === 0 ? -6 : 1 - diaSemana;
  const lunes = sumarDias(fechaISO, offsetALunes);
  return Array.from({ length: 7 }, (_, i) => sumarDias(lunes, i));
}

export function nombreDiaCorto(fechaISO) {
  const [y, m, d] = fechaISO.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return DIAS_CORTO[dt.getUTCDay()];
}

export function diaDelMes(fechaISO) {
  return parseInt(fechaISO.slice(8, 10), 10);
}
