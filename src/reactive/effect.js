const EFFECT_STACK = [];
const EFFECT_MAP = new WeakMap();
// map = { [data]: { key: [effect, effect] } }

export function track(data, type, key) {
  // console.log('track', ...arguments);
  const currentEffect = EFFECT_STACK[EFFECT_STACK.length - 1];
  if (!currentEffect) return;
  if (!EFFECT_MAP.has(data)) EFFECT_MAP.set(data, {});
  const effects = EFFECT_MAP.get(data);
  if (!effects[key]) effects[key] = [];
  if (!effects[key].includes(currentEffect)) {
    effects[key].push(currentEffect);
    currentEffect.deps.push(effects[key]);
  }
}

export function trigger(data, type, key, value, oldValue) {
  console.log('trigger', ...arguments);
  const effects = EFFECT_MAP.get(data);
  if (!effects || !effects[key] || !effects[key].length) return;
  effects[key].forEach(effect => effect());
}

export function stop(effect) {
  if (!effect || !effect.active || !effect.deps) return;
  while (effect.deps.length) {
    const effects = effect.deps.pop();
    const i = effects.indexOf(effect);
    i > -1 && effects.splice(i, 1);
  }
  effect.active = false;
}

function createEffect(fn) {
  const effect = () => {
    EFFECT_STACK.push(effect);
    fn();
    EFFECT_STACK.pop(effect);
    return effect;
  };

  effect.deps = [];
  effect.active = true;

  return effect;
}

export default function effect(fn) {
  return createEffect(fn)();
}