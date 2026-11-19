// Versiones alternativas de un día: la coach puede armar una fuerza distinta
// (y opcionalmente sin WOD) para alumnos puntuales, por ejemplo por una lesión.
// Se guardan dentro de contenido.variantes: [{ id, nombre, alumnos: [ids], sinWod, fuerza }].

export function varianteDe(contenido, alumnoId) {
  if (!contenido || !alumnoId) return null;
  return (contenido.variantes || []).find((v) => (v.alumnos || []).includes(alumnoId)) || null;
}

// Devuelve el día tal como lo ve ese alumno: si tiene versión alternativa, se reemplaza
// la fuerza (y se sacan los WODs si la versión es "sin WOD"). Si no, queda igual.
export function contenidoParaAlumno(contenido, alumnoId) {
  const v = varianteDe(contenido, alumnoId);
  if (!v) return contenido;
  return {
    ...contenido,
    fuerza: v.fuerza || [],
    wods: v.sinWod ? [] : contenido.wods,
    variante: { nombre: v.nombre, sinWod: !!v.sinWod },
  };
}
