import { PLAYER } from './world.js';

// Everything the player can currently refer to: themselves, what they carry,
// the room's contents (looking into supporters and open containers), the room itself,
// the room's globals (doors shared with a neighbour) and anything in rooms it overlooks.
// Overlooked things can be examined but not touched; see World.distant.
export function scope(w) {
  const out = [];
  const seen = new Set();
  const add = (id) => {
    if (seen.has(id) || w.is(id, 'hidden')) return;
    seen.add(id);
    out.push(id);
    if (id !== PLAYER && w.canSeeInside(id)) for (const c of w.children(id)) add(c);
  };
  add(PLAYER);
  for (const c of w.children(PLAYER)) add(c);
  const room = w.obj(w.room);
  // In the dark only the ways out (and anything shining) can be found.
  const lit = w.isLit();
  for (const c of w.children(w.room)) if (lit || w.obj(c).kind === 'passage' || w.shining(c)) add(c);
  add(w.room);
  for (const g of room.globals ?? []) add(g);
  if (!lit) return out;
  for (const r of room.overlooks ?? []) {
    add(r);
    for (const c of w.children(r)) add(c);
  }
  return out;
}
