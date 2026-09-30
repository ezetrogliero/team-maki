import { createClient } from '@/lib/supabase/server';
import { LIFTS } from '@/components/dayEditorHelpers';
import { ordenarPorScore } from '@/lib/scoring';

function wodLabel(w) {
  return `${w.type}${w.time ? ` · ${w.time} min` : ''}`;
}

// Carga todo lo que necesita la "planilla" de un alumno (Mi progreso / planilla del coach),
// exactamente como lo arma planillaView() en la maqueta: RM + historial, WODs con puesto,
// benchmarks y comentarios. Se usa tanto desde /alumno/progreso como desde /coach/alumnos/[id].
export async function cargarPlanilla(alumnoId) {
  const supabase = await createClient();

  const [{ data: rmsData }, { data: historialData }, { data: resultados }] = await Promise.all([
    supabase.from('rms').select('lift, valor_kg').eq('alumno_id', alumnoId),
    supabase
      .from('rm_historial')
      .select('ejercicio, valor_kg, fecha')
      .eq('alumno_id', alumnoId)
      .order('fecha'),
    supabase
      .from('resultados')
      .select('id, dia_id, wod, nota, ausente, dias(fecha, contenido)')
      .eq('alumno_id', alumnoId)
      .order('fecha', { foreignTable: 'dias', ascending: false })
      .limit(60),
  ]);

  const misRMs = Object.fromEntries((rmsData || []).map((r) => [r.lift, Number(r.valor_kg)]));

  const rmHistorial = {};
  LIFTS.forEach((l) => (rmHistorial[l] = []));
  (historialData || []).forEach((h) => {
    (rmHistorial[h.ejercicio] ||= []).push({ fecha: h.fecha, valor: Number(h.valor_kg) });
  });
  Object.keys(rmHistorial).forEach((l) => rmHistorial[l].sort((a, b) => (a.fecha < b.fecha ? -1 : 1)));

  const dias = (resultados || []).filter((r) => r.dias);

  // Para el "Puesto" de cada WOD necesitamos ver los resultados de todos ese día.
  const diaIds = [...new Set(dias.map((r) => r.dia_id))];
  const todosPorDia = {};
  if (diaIds.length) {
    const { data: todos } = await supabase
      .from('resultados')
      .select('dia_id, alumno_id, wod')
      .in('dia_id', diaIds);
    (todos || []).forEach((r) => {
      (todosPorDia[r.dia_id] ||= []).push(r);
    });
  }

  const wodRows = dias
    .map((r) => {
      const wods = r.dias.contenido?.wods || [];
      const items = r.ausente
        ? []
        : wods
            .map((w, wi) => {
              const score = r.wod?.[wi];
              let puesto = '—';
              if (score && w.type !== 'EMOM') {
                const ranking = ordenarPorScore(todosPorDia[r.dia_id] || [], wi);
                const idx = ranking.findIndex((x) => x.alumno_id === alumnoId);
                if (idx >= 0) puesto = `${idx + 1}° de ${ranking.length}`;
              }
              return {
                nombre: w.name || (wods.length > 1 ? `WOD ${wi + 1}` : wodLabel(w)),
                bench: !!w.bench,
                texto: score?.texto || '—',
                puesto,
              };
            })
            .filter(Boolean);
      return {
        fecha: r.dias.fecha,
        ausente: r.ausente,
        items,
        contenido: r.dias.contenido,
        nota: r.nota,
      };
    })
    .sort((a, b) => (a.fecha < b.fecha ? 1 : -1));

  // Benchmarks: nombres de WOD marcados "Benchmark" en cualquier día programado.
  const bnames = new Set();
  dias.forEach((r) => (r.dias.contenido?.wods || []).forEach((w) => {
    if (w.bench && w.name) bnames.add(w.name);
  }));
  const benchmarks = [...bnames].map((nombre) => {
    const hist = [];
    dias.forEach((r) => {
      if (r.ausente) return;
      (r.dias.contenido?.wods || []).forEach((w, wi) => {
        if (w.bench && w.name === nombre) {
          const score = r.wod?.[wi];
          if (score?.modo === 'tiempo') hist.push({ fecha: r.dias.fecha, segundos: score.valor });
        }
      });
    });
    hist.sort((a, b) => (a.fecha < b.fecha ? -1 : 1));
    return { nombre, hist };
  });

  const comentarios = dias
    .filter((r) => r.nota)
    .map((r) => ({ fecha: r.dias.fecha, texto: r.nota }))
    .sort((a, b) => (a.fecha < b.fecha ? 1 : -1));

  const cargados = LIFTS.filter((l) => misRMs[l] != null).length;

  return { misRMs, rmHistorial, wodRows, benchmarks, comentarios, cargados };
}
