const LIFTS = [
  'Deadlift', 'Bench Press', 'Back Squat', 'Front Squat', 'Clean',
  'Clean and Jerk', 'Squat Clean', 'Snatch', 'Squat Snatch',
  'Shoulder Press', 'Push Press', 'Jerk', 'Split Jerk',
];

const TPL = {
  core: () => ({ type: 'Rounds', rounds: '2', items: [] }),
  fuerza: () => ({ name: '', acc: false, base: '', unit: '%', rm: false, sets: [{ s: '', r: '', c: '' }] }),
  wod: () => ({ type: 'For time', time: '', name: '', bench: false, descanso: '', items: [] }),
};

const WOD_TYPES = ['For time', 'AMRAP', 'EMOM', 'A completar'];
const ROUNDS_TYPES = ['Rounds', 'Tabata', 'Tabata x2', 'A completar'];

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

// Normaliza bloques de fuerza guardados antes de que existiera el campo "acc",
// infiriendo si es un levantamiento principal (de la lista LIFTS) o un accesorio.
function normalizarFuerza(b) {
  const acc = typeof b.acc === 'boolean' ? b.acc : !LIFTS.includes(b.name);
  return { base: '', ...b, acc };
}

export { TPL, WOD_TYPES, ROUNDS_TYPES, LIFTS, uid, normalizarFuerza };
