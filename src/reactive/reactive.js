import { track, trigger } from './effect';

const PROXY_MAP = new WeakMap();
const IS_PROXY = Symbol('IS_PROXY');
const ITERATE_KEY = Symbol('ITERATE_KEY');

const HANDLER = {
  get(data, key, proxy) {
    if (key === IS_PROXY) return true;
    const value = Reflect.get(data, key, proxy);
    track(data, 'get', key, value);
    return reactive(value);
  },

  set(data, key, value, proxy) {
    const oldValue = data[key];
    const hasKey = Reflect.has(data, key);
    const oldLength = Reflect.get(data, 'length');
    const ret = Reflect.set(data, key, value, proxy);
    
    if (!Object.is(oldValue, value)) {
      trigger(data, hasKey ? 'set' : 'add', key, value);
      if (Array.isArray(data) && !hasKey) {
        trigger(data, 'set', 'length', data.length, oldLength);
      }
    }

    return ret;
  },

  deleteProperty(data, key) {
    const type = 'delete';
    const value = undefined;
    const oldValue = data[key];
    const hasKey = Reflect.has(data, key);
    const ret = Reflect.deleteProperty(data, key);
    
    hasKey && trigger(data, type, key, value, oldValue);

    return ret;
  },

  has(data, key) {
    const ret = Reflect.has(data, key);
    track(data, 'has', key);
    return ret;
  },

  ownsKey(data) {
    const ret = Reflect.ownKeys(data);
    track(data, 'iterate', ITERATE_KEY);
    return ret;
  }
};

export default function reactive(data) {
  if (!data || typeof data !== 'object') return data;
  if (data[IS_PROXY]) return data;
  if (PROXY_MAP.has(data)) return PROXY_MAP.get(data);

  const proxy = new Proxy(data, HANDLER);
  PROXY_MAP.set(data, proxy);
  return proxy;
}