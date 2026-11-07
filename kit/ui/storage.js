// localStorage can be missing or throw (private windows, blocked storage); never let that break the game.
const PREFIX = 'yuriful-tba:';

// Saves and autosaves are kept per game (`scoped`), so two games on one site don't mix.
export function scoped(ns) {
  const key = (k) => `${ns}:${k}`;
  return {
    get: (k) => storage.get(key(k)),
    set: (k, v) => storage.set(key(k), v),
    remove: (k) => storage.remove(key(k)),
  };
}

export const storage = {
  get(key) {
    try {
      const v = localStorage.getItem(PREFIX + key);
      return v ? JSON.parse(v) : null;
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(PREFIX + key);
    } catch {}
  },
};
