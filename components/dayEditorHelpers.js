const TPL = {
  core: () => ({ type: 'Rounds', rounds: '2', items: [] }),
  fuerza: () => ({ name: '', unit: '%', rm: false, sets: [{ s: '', r: '', c: '' }] }),
  wod: () => ({ type: 'For time', time: '', name: '', bench: false, descanso: '', items: [] }),
};

const WOD_TYPES = ['For time', 'AMRAP', 'EMOM', 'A completar'];
const ROUNDS_TYPES = ['Rounds', 'Tabata', 'Tabata x2', 'A completar'];

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export { TPL, WOD_TYPES, ROUNDS_TYPES, uid };
