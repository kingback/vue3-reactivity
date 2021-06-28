import { IS_EFFECT, EFFECTS_MAP, EFFECT_STACK, TRACKING_STACK, ASYNC_EFFECTS } from './constants';
import { isEffect } from './utils';

function getActiveEffect() {
  return EFFECT_STACK[EFFECT_STACK.length - 1];
}

function getEffects(target, key, set) {
  set && !EFFECTS_MAP.has(target) && EFFECTS_MAP.set(target, {});
  const map = EFFECTS_MAP.get(target);
  return map ? (map[key] || (set ? (map[key] = []) : null)) : null;
}

function createEffect(fn, options) {
  const effect = () => {
    if (!effect.active) {
      return options.scheduler ? undefined : fn();
    }

    enableTracking();
    EFFECT_STACK.push(effect);

    const res = fn();

    EFFECT_STACK.pop();
    resetTracking();

    return res;
  };

  if (options.async) {
    options.scheduler = runAsyncEffects;
  }

  return Object.assign(effect, {
    [IS_EFFECT]: true,
    active: true,
    deps: [],
    options
  });
}

export function isTracking() {
  return TRACKING_STACK[TRACKING_STACK.length - 1];
}

export function enableTracking() {
  TRACKING_STACK.push(true);
}

export function resetTracking() {
  TRACKING_STACK.pop();
}

export function track(target, type, key) {
  if (!isTracking()) return; // TODO array symbo

  const activeEffect = getActiveEffect();
  const effects = activeEffect && getEffects(target, key, true);

  if (!effects || effects.includes(activeEffect)) return;

  const payload = { effect, target, key, type };
  activeEffect.options.onTrack && activeEffect.options.onTrack(payload);

  effects.push(activeEffect);
  activeEffect.deps.push(effects);
}

export function trigger(target, type, key, value, oldValue) {
  const effects = getEffects(target, key);

  if (!effects || !effects.length) return;
  
  effects.concat().forEach(effect => {
    const payload = { effect, target, key, type, value, oldValue };
    effect.options.onTrigger && effect.options.onTrigger(payload);

    if (effect.options.scheduler) {
      effect.options.scheduler(effect);
    } else {
      effect();
    }
  });
}

export function effect(fn, { lazy, ...options } = {}) {
  const runner = createEffect(fn, options);
  !lazy && runner();
  return runner;
}

function runAsyncEffects(effect) {
  if (!ASYNC_EFFECTS.includes(effect)) {
    ASYNC_EFFECTS.push(effect);
  }

  if (!ASYNC_EFFECTS.isRunning) {
    ASYNC_EFFECTS.isRunning = true;
    Promise.resolve().then(() => {
      let effect;
      while ((effect = ASYNC_EFFECTS.shift())) {
        effect();
      }
      delete ASYNC_EFFECTS.isRunning;
    });
  }
}

export function stop(effect) {
  if (isEffect(effect) && effect.active) {
    if (effect.deps) { // cleanup
      while (effect.deps.length) {
        const effects = effect.deps.pop();
        const i = effects.indexOf(effect);
        i > -1 && effects.splice(i, 1);
      }
    }
    
    const index = ASYNC_EFFECTS.indexOf(effect);
    index > -1 && ASYNC_EFFECTS.splice(index, 1);

    effect.options.onStop && effect.options.onStop();
    effect.active = false;
  }
}