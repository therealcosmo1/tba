import { nextRandom } from './rng.js';
import { message } from './messages.js';
import { expandText } from './text.js';

export const PLAYER = 'player';

// A thin wrapper over (content, state) that actions and content handlers use.
// Content is static definitions; state is plain JSON and the only thing that changes.
export class World {
  constructor(content, state) {
    this.content = content;
    this.state = state;
    this.out = [];
  }

  obj(id) {
    const o = this.content.objects[id];
    if (!o) throw new Error(`Unknown object "${id}"`);
    return o;
  }

  get room() { return this.state.loc[PLAYER]; }

  parent(id) { return this.state.loc[id] ?? null; }
  children(id) { return Object.keys(this.state.loc).filter((k) => this.state.loc[k] === id); }
  move(id, to) { this.state.loc[id] = to; }
  remove(id) { this.state.loc[id] = null; }

  roomOf(id) {
    let p = id;
    while (p && this.obj(p).kind !== 'room') p = this.parent(p);
    return p;
  }

  // Visible but out of reach: things in a room this one overlooks.
  distant(id) {
    if (id === PLAYER || this.carried(id)) return false;
    if (this.obj(this.room).globals?.includes(id)) return false;
    return this.roomOf(id) !== this.room;
  }

  held(id) { return this.parent(id) === PLAYER; }
  carried(id) {
    for (let p = this.parent(id); p; p = this.parent(p)) if (p === PLAYER) return true;
    return false;
  }

  is(id, flag) { return !!this.state.flags[id]?.[flag]; }
  set(id, flag, value = true) { (this.state.flags[id] ??= {})[flag] = value; }

  // Whether a thing gives light now: a light source that is on (or has no switch).
  shining(id) {
    const o = this.obj(id);
    return !!o.light && (!o.switchable || this.is(id, 'on'));
  }

  // A dark location is lit only by a shining thing carried by the player or in the room.
  isLit(roomId = this.room) {
    if (!this.obj(roomId).dark) return true;
    const carried = (id) => this.carried(id);
    return Object.keys(this.content.objects).some((id) => this.shining(id) && (carried(id) || this.roomOf(id) === roomId));
  }

  canSeeInside(id) {
    const o = this.obj(id);
    if (o.supporter) return true;
    return !!o.container && (o.transparent || !o.openable || this.is(id, 'open'));
  }

  // The room's map shapes plus markers for actors standing in it. Actors in rooms this
  // one overlooks are drawn faintly; overlooking rooms share one coordinate frame.
  shapes(roomId = this.room) {
    const room = this.obj(roomId);
    const marker = (o, faint) => ({
      type: o.mapSpot.marker, obj: o.id, x: o.mapSpot.x, y: o.mapSpot.y, faint,
      stand: faint ? undefined : { x: o.mapSpot.x + 5, y: o.mapSpot.y + 3 },
    });
    const actorsIn = (r) => Object.values(this.content.objects)
      .filter((o) => o.mapSpot?.room === r && this.parent(o.id) === r);
    return [
      ...(room.map?.shapes ?? []).filter((s) => !s.obj || !this.is(s.obj, 'hidden')),
      ...actorsIn(roomId).map((o) => marker(o, false)),
      ...(room.overlooks ?? []).flatMap((r) => actorsIn(r).map((o) => marker(o, true))),
    ];
  }

  // The object on the current room's map that `id` sits at (itself, or a table it's on).
  anchor(id) {
    const shapes = this.shapes();
    for (let p = id; p && p !== this.room; p = this.parent(p)) {
      if (shapes.some((s) => s.obj === p)) return p;
    }
    return null;
  }

  name(id) { return this.obj(id).name; }
  // A name that already starts with "the" ("The Duke") gets no second article.
  the(id) {
    const o = this.obj(id);
    return o.proper || /^the\s/i.test(o.name) ? o.name : `the ${o.name}`;
  }
  a(id) {
    const o = this.obj(id);
    if (o.proper || /^the\s/i.test(o.name)) return o.name;
    const article = o.article ?? (/^[aeiou]/i.test(o.name) ? 'an' : 'a');
    return article ? `${article} ${o.name}` : o.name;
  }

  // Content strings may be plain text or functions of the world. Text is expanded by
  // expandText (text.js): {variables}, {if}, {either}, {cycle}, {once} and so on.
  text(v) {
    const s = typeof v === 'function' ? v(this) : v;
    return expandText(s, {
      vars: this.state.vars,
      random: () => this.random(),
      count: (id) => {
        const texts = (this.state.texts ??= {});
        const seen = texts[id] ?? 0;
        texts[id] = seen + 1;
        return seen;
      },
    });
  }

  // A built-in message (engine/messages.js), with the game's override if it has one.
  msg(key, params) {
    return this.text(message(this.content.messages, key, params));
  }

  say(text, cls, extra) {
    if (text) this.out.push({ text, ...(cls && { cls }), ...extra });
  }

  random() { return nextRandom(this.state); }
}
