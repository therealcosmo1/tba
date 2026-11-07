import { World, PLAYER } from './world.js';
import { scope } from './scope.js';

// A read-only snapshot of state for the UI (map, inventory, status line).
export function buildView(content, state) {
  const w = new World(content, state);
  const room = w.obj(w.room);
  const items = (id) =>
    w.children(id).map((c) => ({
      id: c,
      name: w.name(c),
      worn: w.is(c, 'worn'),
      on: !!w.obj(c).switchable && w.is(c, 'on') ? (w.obj(c).light ? 'lit' : 'on') : null,
      contents: w.canSeeInside(c) ? items(c) : [],
    }));
  const near = state.near;
  const shapes = w.shapes();
  const nearShape = shapes.find((s) => s.obj === near && s.stand);
  return {
    roomName: room.title ?? room.name,
    turn: state.turn,
    map: room.map ? { w: room.map.w, h: room.map.h, shapes } : null,
    near,
    nearName: near ? w.the(near) : null,
    stand: nearShape?.stand ?? null,
    inventory: items(PLAYER),
    // Names of what the player can refer to now, for clickable words in the transcript.
    visible: scope(w).filter((id) => id !== PLAYER && w.obj(id).kind !== 'room').map((id) => w.name(id)),
    isOpen: (id) => w.is(id, 'open'),
    name: (id) => w.name(id),
  };
}
