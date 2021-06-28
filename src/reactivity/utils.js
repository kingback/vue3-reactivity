import { RAW, TARGETS_MAP, IS_EFFECT, IS_REACTIVE } from "./constants";

export function typeOf(v) {
  if (typeof v === 'undefined') {
    return 'undefined';
  } else if (v === null) {
    return 'null';
  } else {
    return Object.prototype.toString.call(v).slice(8, -1).toLowerCase();
  }
}

export function hasOwn(v, k) {
  return !!(v && v.hasOwnProperty && v.hasOwnProperty(k));
}

export function isObject(v) {
  return v !== null && typeof v === 'object';
}

export function isIterateKey(v) {
  return typeof v === 'string' && v !== 'NaN' && v[0] !== '-' && ('' + parseInt(v, 10) === v);
}

export function isEffect(v) {
  return !!(v && v[IS_EFFECT]);
}

export function isReactive(v) {
  return !!(v && v[IS_REACTIVE]);
}

export function isTrackable(v) {
  return typeof v !== 'function' && typeof v !== 'symbol';
}

export function canBeReactive(v) {
  return (typeOf(v) === 'object' || Array.isArray(v)) && Object.isExtensible(v);
}

export function toRaw(v) {
  return isReactive(v) ? v[RAW] : v;
}

export function getProxy(target) {
  return TARGETS_MAP.get(target);
}

export function setProxy(target, proxy) {
  TARGETS_MAP.set(target, proxy);
  return proxy;
}