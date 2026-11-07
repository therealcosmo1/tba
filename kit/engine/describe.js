import { PLAYER } from './world.js';
import { listJoin } from './text.js';

const DIR_NAMES = {
  n: 'north', s: 'south', e: 'east', w: 'west', ne: 'northeast', nw: 'northwest', se: 'southeast', sw: 'southwest',
  u: 'up', d: 'down', in: 'in', out: 'out',
};

export function describeRoom(w) {
  const id = w.room;
  const room = w.obj(id);
  w.say(room.title ?? room.name, 'room-title');
  if (!w.isLit()) {
    w.say(w.text(room.darkText) || w.msg('dark'));
    if (room.listExits) describeExits(w);
    return;
  }
  w.say(w.text(room.desc));
  const here = w.children(id).filter((c) => c !== PLAYER);
  const loose = here.filter((c) => !w.obj(c).scenery);
  if (loose.length) w.say(w.msg('alsoHere', { list: listJoin(loose.map((c) => w.a(c))) }));
  for (const c of here) describeContents(w, c, true);
  for (const r of room.overlooks ?? []) describeOverlook(w, r);
  if (room.listExits) describeExits(w);
}

// "Ways out: the oak door (north) and the passage (east)." For editor-made locations.
export function describeExits(w) {
  const room = w.obj(w.room);
  const ways = [];
  // One-way passages aren't a way out from their far side.
  const seen = new Set([...Object.values(room.exits ?? {}).map((x) => x.door), ...(room.globals ?? [])]
    .filter((id) => id && w.obj(id).leadsTo && !w.obj(id).leadsTo[w.room]));
  for (const [dir, exit] of Object.entries(room.exits ?? {})) {
    if (!exit.door || seen.has(exit.door) || w.is(exit.door, 'hidden')) continue;
    seen.add(exit.door);
    ways.push(`${w.the(exit.door)} (${DIR_NAMES[dir] ?? dir})`);
  }
  for (const id of [...w.children(w.room), ...(room.globals ?? [])]) {
    if (!seen.has(id) && w.obj(id).kind === 'passage' && !w.is(id, 'hidden')) ways.push(w.the(id));
  }
  if (ways.length) w.say(w.msg('waysOut', { list: listJoin(ways) }));
}

// What's visible in a room this one overlooks (across a gap, below a gallery...).
export function describeOverlook(w, roomId, examining = false) {
  const items = w.children(roomId).filter((c) => c !== PLAYER && !w.obj(c).scenery);
  if (items.length) {
    w.say(w.msg('overlookThings', { place: w.the(roomId), list: listJoin(items.map((c) => w.a(c))) }));
  } else if (examining) {
    w.say(w.msg('overlookEmpty', { place: w.the(roomId) }));
  } else {
    w.say(w.msg('overlookPlace', { place: w.the(roomId) }));
  }
}

// "On the wine table is a glass of wine." Returns false if there was nothing to list.
export function describeContents(w, id, inRoomListing = false) {
  if (!w.canSeeInside(id)) return false;
  const o = w.obj(id);
  if (inRoomListing && o.listContents === false) return false;
  const items = w.children(id).filter((c) => !w.obj(c).scenery);
  if (!items.length) return false;
  w.say(w.msg('contents', { prep: o.supporter ? 'on' : 'in', thing: w.the(id), isAre: items.length > 1 || w.obj(items[0]).plural ? 'are' : 'is', list: listJoin(items.map((c) => w.a(c))) }));
  return true;
}
