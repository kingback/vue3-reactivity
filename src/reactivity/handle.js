import { TRACK_TYPES, TRIGGER_TYPES, IS_REACTIVE, RAW, ITERATE_KEY } from './constants';
import { hasOwn, canBeReactive, isTrackable, isReactive, getProxy, isIterateKey } from './utils';
import { track, trigger } from './effect';
import { reactive } from './reactive';

export function createHandle(options = {}) {
  return {

    // obj[key]
    // arr[index]
    // arr.indexOf(val);
    // arr.lastIndexOf(val);
    // arr.includes(val);
    // arr.concat()
    // arr.slice()

    // TODO arr.find/some/forEach/every 
    get(target, key, receiver) {
      if (key === RAW) return target;
      if (key === IS_REACTIVE) return true;

      const value = Reflect.get(target, key, receiver);
      if (!isTrackable(value))  return value;
      
      track(target, TRACK_TYPES.GET, key);
      
      if (options.shallow) return value; // shallow reactive
      if (isReactive(value)) return value; // isProxy object
      if (getProxy(value)) return getProxy(value); // raw data but hasProxy
      if (canBeReactive(value)) return reactive(value, options); // raw data, lazy reactive

      return value;
    },

    // obj[key] = val
    // arr[key] = val
    // arr.push(val);
    // arr.pop();
    // arr.shift()
    // arr.unshift(val)
    // arr.length = len
    set(target, key, value, receiver) {
      const oldValue = target[key];
      const isArray = Array.isArray(target);
      const oldTarget = isArray && target.concat();
      const hasKey = isArray && isIterateKey(key) ? (Number(key) < oldTarget.length) : hasOwn(target, key);
      const ret = Reflect.set(target, key, value, receiver);

      if (ret) {
        if (!hasKey) {
          trigger(target, TRIGGER_TYPES.ADD, key, value);
          trigger(target, TRIGGER_TYPES.ADD, ITERATE_KEY);
          options.onUpdate && options.onUpdate({ type: 'add', target, receiver, key, value });

          // list = [0];
          // list[1] = 1; length: 1 => 2
          isArray && trigger(target, TRIGGER_TYPES.SET, 'length', target.length, oldTarget.length);
        } else if (!Object.is(oldValue, value)) {
          trigger(target, TRIGGER_TYPES.SET, key, value, oldValue);
          options.onUpdate && options.onUpdate({ type: 'set', target, receiver, key, value, oldValue });
          
          // list = [0]
          // list.length = 0; DELETE 0
          // list.length = 2; ADD 1
          if (isArray && key === 'length' && oldTarget.length !== target.length) {
            let min = Math.min(oldTarget.length, target.length);
            const max = Math.max(oldTarget.length, target.length);
            const type = oldTarget.length > target.length ? TRIGGER_TYPES.DELETE : TRIGGER_TYPES.ADD;

            while (min < max) trigger(target, type, min++, target[value], oldTarget[value]);
          }
        }
      }

      return ret;
    },

    deleteProperty(target, key, receiver) {
      const value = undefined;
      const oldValue = target[key];
      const hasKey = hasOwn(target, key);
      const ret = Reflect.deleteProperty(target, key);
      
      if (ret && hasKey) {
        trigger(target, TRIGGER_TYPES.DELETE, key, value, oldValue);
        trigger(target, TRIGGER_TYPES.DELETE, ITERATE_KEY);
        options.onUpdate && options.onUpdate({ type: 'delete', target, receiver, key, value, oldValue });
      }

      return ret;
    },

    // key in object
    has(target, key) {
      const ret = Reflect.has(target, key);

      if (typeof key !== 'symbol') {
        track(target, TRACK_TYPES.HAS, key);
      }

      return ret;
    },

    // Object.keys(object);
    // for (let k in object)
    ownKeys(target) {
      const ret = Reflect.ownKeys(target);
      track(target, TRACK_TYPES.ITERATE, ITERATE_KEY);
      return ret;
    }
  }
}