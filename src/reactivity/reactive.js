import { createHandle } from './handle';
import { getProxy, setProxy, canBeReactive, isReactive } from './utils';

export function reactive(target, options = {}) {
  if (!canBeReactive(target)) {
    console.warn(`value cannot be made reactive: ${String(target)}`);
    return target;
  }

  if (isReactive(target)) {
    return target;
  }

  if (getProxy(target)) {
    return getProxy(target);
  }

  return setProxy(target, new Proxy(target, createHandle(options)));
}

export function shallowReactive(target, options) {
  return reactive(target, { ...options, shallow: true });
}