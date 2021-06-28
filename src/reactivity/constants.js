export const EFFECT_STACK = [];
export const TRACKING_STACK = [];
export const ASYNC_EFFECTS = [];

export const TARGETS_MAP = new WeakMap();
export const EFFECTS_MAP = new WeakMap();

export const RAW = Symbol('raw');
export const ITERATE_KEY = '__REACTIVE_ITERATE_KEY__';

export const IS_EFFECT = Symbol('isEffect');
export const IS_REACTIVE = Symbol('isReactive');

export const TRACK_TYPES = {
  HAS: 'has',
  GET: 'get',
  ITERATE: 'iterate'
};

export const TRIGGER_TYPES = {
  ADD: 'add',
  SET: 'set',
  DELETE: 'delete'
};