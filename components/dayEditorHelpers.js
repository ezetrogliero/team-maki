const TPL = {
  core: () => ({ type: 'Rounds', rounds: '2', items: [] }),
  fuerza: () => ({ name: '', unit: '%', sets: [{ s: '', r: '', c: '' }] }),
  wod: () => ({ type: 'For time', time: '', name: '', bench: false, descanso: '', items: [] }),
};

const WOD_TYPES = ['For time', 'AMRAP', 'EMOM', 'A completar'];

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export { TPL, WOD_TYPES, uid };
