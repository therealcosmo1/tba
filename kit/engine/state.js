import { PLAYER } from './world.js';

// Bump when the state shape changes; older autosaves and saves are then ignored.
export const STATE_VERSION = 5;

const INITIAL_FLAGS = ['open', 'locked', 'worn', 'on', 'hidden'];

export function newState(content, seed = 1) {
  const loc = {};
  const flags = {};
  for (const [id, o] of Object.entries(content.objects)) {
    if (o.kind === 'room') continue;
    loc[id] = o.in ?? null;
    for (const f of INITIAL_FLAGS) if (o[f]) (flags[id] ??= {})[f] = true;
  }
  return {
    v: STATE_VERSION,
    loc,
    flags,
    vars: {},        // answers from the start screen (e.g. name, house), and story variables
    started: false,  // set once the start screen has been answered
    turn: 0,
    seed: seed >>> 0,
    visited: [loc[PLAYER]],
    near: content.startNear ?? null,
    it: null,        // last object referred to, for "it"/"them"
    last: null,      // last command's words, for "again"
    pending: null,   // half-finished command waiting for an answer
    convo: null,     // { npc, node } while in a conversation
    talked: {},      // npc id -> times a conversation was started
    seen: {},        // "npc:node" -> true once that line has been shown
    fired: {},       // event id -> times it has fired
    texts: {},       // variable-text counters ({once}, {cycle}...) -> times shown
    timers: [],      // [{ event, left }]: events waiting some turns (the "later" effect)
    followers: [],   // actors who go wherever the player goes
    ended: false,    // set by an endGame effect
  };
}
