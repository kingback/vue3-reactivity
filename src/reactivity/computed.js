import { effect, track, trigger } from './effect';
import { TRACK_TYPES, TRIGGER_TYPES } from './constants';

class Computed {
  constructor({ getter, setter }) {
    this._dirty = true;
    this._getter = getter;
    this._setter = setter;

    this._effect = effect(this._getter, {
      lazy: true,
      scheduler: () => {
        if (!this._dirty) {
          this._dirty = true;
          trigger(this, TRIGGER_TYPES.SET, 'value');
        }
      }
    });
  }

  get value() {
    if (this._dirty) {
      this._value = this._effect();
      this._dirty = false;
    }
    track(this, TRACK_TYPES.GET, 'value');
    return this._value;
  }

  set value(v) {
    if (this._setter) {
      this._setter(v);
    }
  }
}

export default function computed(options) {
  if (typeof options === 'function') {
    options = { getter: options };
  }

  return new Computed(options);
}