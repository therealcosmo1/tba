// Story data written by the editor (game/story.js): game settings, locations, doors
// and passages, objects, actors and events, plus the small condition/effect language shared by events,
// conversation options and object reactions.
//
// Verbs (story.verbs): the game's own commands. { name, patterns: ['pull [thing]',
// 'yank [thing]'], reply, distant, rules: [{ when, effects, instead, once }] }.
// Patterns use [thing] for something in reach and [carried] for something held; the
// first is "the thing", a second is "the other". Their action id is `v:<id>`, which
// object reactions use too. A verb's rules run after the thing's reactions.
//
// Object reactions: { action, when, effects, instead, once } on an object run when the
// player does `action` to it and the conditions hold. `instead` replaces the usual
// result; `once` makes it happen only the first time.
//
// Conditions (all must be true):
//   { type: 'var', name, op: 'is'|'isNot'|'atLeast'|'atMost', value }
//   { type: 'turn', op, value }
//   { type: 'inRoom', room }          { type: 'has', item }
//   { type: 'talkedTo', actor }       { type: 'seenNode', actor, node }
//   { type: 'eventFired', event }     { type: 'thingIn', thing, where }   ('' = nowhere)
//   { type: 'doorIs', thing, state: 'open'|'closed'|'locked'|'unlocked' }
//
// Effects (run in order):
//   { type: 'say', text }             { type: 'setVar', name, value }
//   { type: 'addVar', name, value }   { type: 'move', thing, to }         ('' = nowhere)
//   { type: 'startConversation', actor }   { type: 'endConversation' }
//   { type: 'fireEvent', event }      { type: 'command', text }
//   { type: 'endGame', text }         { type: 'setDoor', thing, state }   (as doorIs, plus hidden/shown)
//   { type: 'setSwitch', thing, state: 'on'|'off' }
//   { type: 'later', event, turns }   { type: 'cancelLater', event }    (an event N turns from now)
//   { type: 'follow', actor }         { type: 'stopFollowing', actor }  (goes where the player goes)
//
// More conditions: { type: 'thingIs' | 'otherIs', thing } (the thing the command is about,
// or its second thing), { type: 'switchIs', thing, state }. Any condition can have
// `not: true`.
//
// Effects that change what happens next (conversations, commands) are returned as
// signals so the turn loop can act on them in the right order.

import { formatText } from './messages.js';

export const VERB = 'v:';
const SLOTS = { thing: 'obj', carried: 'held' };

// A verb pattern as the parser's grammar tokens, or an error message.
export function verbPattern(text) {
  const words = String(text ?? '').trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return { error: 'is empty' };
  if (words[0].startsWith('[')) return { error: 'must start with a word, not a [slot]' };
  const tokens = [];
  let slots = 0;
  for (const word of words) {
    const slot = word.match(/^\[(\w+)\]$/)?.[1];
    if (slot) {
      if (!SLOTS[slot]) return { error: `uses [${slot}]: only [thing] and [carried] are allowed` };
      if (++slots > 2) return { error: 'has more than two [slots]' };
      tokens.push(`[${SLOTS[slot]}]`);
    } else if (/[^a-z0-9'-]/.test(word)) {
      return { error: `has "${word}": use plain words and [thing] or [carried]` };
    } else tokens.push(word);
  }
  return { tokens: tokens.join(' ') };
}

function verbGrammar(verbs = {}) {
  return Object.entries(verbs).map(([id, v]) => [VERB + id,
    (v.patterns ?? []).map(verbPattern).filter((p) => p.tokens).map((p) => p.tokens)]).filter(([, p]) => p.length);
}

// One of the game's own verbs, run like a built-in action: its rules, then its reply.
export function verbAction(content, action) {
  const v = content.verbs?.[action];
  if (!v) return null;
  const first = verbPattern(v.patterns?.find((p) => verbPattern(p).tokens) ?? '').tokens ?? '';
  return {
    verb: first.split(' ').filter((t) => t[0] !== '[').slice(0, 2).join(' ') || v.name || 'do',
    distant: !!v.distant,
    run(w, cmd) {
      const signals = {};
      let instead = false;
      // As with reactions: decide which rules apply first, then run them.
      const due = (v.rules ?? []).map((r, i) => [r, `${action}#${i}`])
        .filter(([r, key]) => !(r.once && w.state.fired[key]) && check(w, r.when));
      for (const [r, key] of due) {
        if (r.once) w.state.fired[key] = 1;
        apply(w, r.effects, signals);
        if (r.instead) instead = true;
      }
      if (!instead && !w.state.ended) {
        const params = { thing: cmd.dobj ? w.the(cmd.dobj) : '', other: cmd.iobj ? w.the(cmd.iobj) : '' };
        w.say(v.reply?.trim() ? w.text(formatText(v.reply, params)) : w.msg('ownVerb', params));
      }
      return signals;
    },
  };
}

export const OPPOSITE = { n: 's', s: 'n', e: 'w', w: 'e', ne: 'sw', sw: 'ne', nw: 'se', se: 'nw', u: 'd', d: 'u', in: 'out', out: 'in' };
const WALL_FOR_DIR = { n: 'n', s: 's', e: 'e', w: 'w', ne: 'e', se: 'e', nw: 'w', sw: 'w' };
const PASSAGE_KINDS = {
  door: { name: 'door', names: ['door'] },
  passage: { name: 'passage', names: ['passage', 'way', 'corridor', 'opening'] },
  stairs: { name: 'stairs', names: ['stairs', 'staircase', 'steps'] },
  archway: { name: 'archway', names: ['archway', 'arch', 'doorway'] },
};
const NOT_CONNECTED = "TODO: this doesn't lead anywhere yet.";

// Merges the editor's story into the hand-written objects. Rooms that gain exits, doors
// or map shapes are copied first, so `base` is never modified.
export function applyStory(base, story) {
  const objects = { ...base };
  const copied = new Set();
  const own = (id) => {
    if (!copied.has(id)) {
      const r = objects[id];
      objects[id] = { ...r, exits: { ...r.exits }, globals: [...(r.globals ?? [])], map: r.map && { ...r.map, shapes: [...r.map.shapes] } };
      copied.add(id);
    }
    return objects[id];
  };

  for (const [id, l] of Object.entries(story.locations ?? {})) {
    objects[id] = locationObject(id, l);
    copied.add(id);
  }

  // The player, from the game settings. Fixtures without settings bring their own.
  const game = story.game;
  if (game) {
    objects.player = {
      name: 'yourself',
      proper: true,
      names: game.player?.nouns?.length ? game.player.nouns : ['me', 'myself', 'self', 'yourself'],
      in: game.start?.room || null,
      desc: game.player?.description || undefined,
    };
  }

  for (const [pid, p] of Object.entries(story.passages ?? {})) {
    const here = p.a ?? {};
    const there = p.b?.room ? p.b : null;
    if (!objects[here.room]) continue; // lint reports it
    const kind = PASSAGE_KINDS[p.kind] ? p.kind : 'door';
    const prior = p.existing ? objects[p.existing] : null;
    const id = prior ? p.existing : pid;
    const isDoor = prior ? !!prior.openable : kind === 'door';
    objects[id] = {
      ...(prior ?? {
        kind: 'passage',
        passageKind: kind,
        name: p.name || PASSAGE_KINDS[kind].name,
        names: p.nouns?.length ? p.nouns : PASSAGE_KINDS[kind].names,
        adj: p.adjectives ?? [],
        desc: here.description || there?.description
          ? (wd) => (wd.room === there?.room ? there.description : here.description) || p.description || undefined
          : p.description || undefined,
        in: here.room,
        scenery: true,
        openable: isDoor,
        key: p.key || undefined,
      }),
      // A one-way passage used from the wrong side shows `blocked` too (see travel()).
      enter: there ? (p.oneWay ? { msg: p.blocked || undefined } : null) : { msg: p.blocked || NOT_CONNECTED },
      climb: undefined,
      leadsTo: there ? { [here.room]: there.room, ...(p.oneWay ? {} : { [there.room]: here.room }) } : undefined,
      hidden: p.hidden || undefined,
      locked: p.locked ?? prior?.locked,
      open: p.open ?? prior?.open,
    };
    const sides = [[here, true]];
    if (there && objects[there.room]) sides.push([there, false]);
    for (const [side, isHome] of sides) {
      const room = own(side.room);
      for (const dir of [side.dir, ...(side.also ?? [])]) if (dir) room.exits[dir] = { door: id };
      if (!isHome) room.globals.push(id);
      const wall = side.wall || WALL_FOR_DIR[side.dir];
      const alreadyDrawn = room.map?.shapes.some((s) => s.obj === id);
      if (!room.map || alreadyDrawn) continue;
      const box = side.box;
      if (kind === 'stairs' && !prior && box && Number.isFinite(box.x) && Number.isFinite(box.y)) {
        // A flight of stairs drawn inside the room; the player stands just below it.
        const bw = box.w || 20;
        const bh = box.h || 10;
        room.map.shapes.push({ type: 'stairs', obj: id, x: box.x, y: box.y, w: bw, h: bh, stand: { x: box.x + bw / 2, y: box.y + bh + 4 } });
      } else if (wall) {
        const type = isDoor ? 'door' : kind === 'archway' && !prior ? 'entrance' : 'passage';
        room.map.shapes.push(passageShape(room.map, id, type, wall, side.pos ?? 50, side.len));
      }
    }
  }

  const made = storyObjects(story);
  // A location's details: things its description mentions, with their own text.
  for (const [id, l] of Object.entries(story.locations ?? {})) {
    (l.details ?? []).forEach((d, i) => {
      const nouns = (d.nouns ?? []).filter(Boolean);
      if (!nouns.length) return;
      made[`${id}~${i + 1}`] = compact({ name: d.name || nouns[0], names: nouns, adj: d.adjectives ?? [], desc: d.description || undefined, in: id, scenery: true, fixed: d.fixedText || true, detail: true });
    });
  }
  // Things present in several locations (sky, walls, music) are shared like doors.
  for (const [id, t] of Object.entries(made)) {
    for (const r of t.alsoIn ?? []) if (objects[r]?.kind === 'room' && r !== t.in) own(r).globals.push(id);
  }
  for (const [id, t] of Object.entries(story.objects ?? {})) {
    if (!t.shape || objects[t.in]?.kind !== 'room') continue;
    const room = own(t.in);
    if (room.map) room.map.shapes.push(thingShape(id, t.shape));
  }
  return { ...objects, ...made };
}

// A table or other piece of furniture on a room's map. The player stands just below it.
export function thingShape(id, s) {
  const w = s.w ?? 12;
  const h = s.h ?? 6;
  return { type: 'table', obj: id, round: s.round || undefined, x: s.x, y: s.y, w, h, stand: { x: s.x + w / 2, y: s.y + h + 4 } };
}

// A location from the editor as a world room: its map (floor, balcony railings, faint
// views of other places), refused directions and background messages.
function locationObject(id, l) {
  const w = l.size?.w || 60;
  const h = l.size?.h || 40;
  const f = l.floor;
  const floor = f && [f.x, f.y, f.w, f.h].every(Number.isFinite) ? f : { x: 4, y: 4, w: w - 8, h: h - 8 };
  const shapes = [l.style === 'balcony'
    ? { type: 'balcony', ...floor, wall: l.wallSide || 'w' }
    : { type: 'room', ...floor }];
  for (const v of l.views ?? []) {
    if (v.room && [v.x, v.y, v.w, v.h].every(Number.isFinite)) shapes.push({ type: 'far', obj: v.room, x: v.x, y: v.y, w: v.w, h: v.h });
  }
  const exits = {};
  for (const [dir, msg] of Object.entries(l.refuse ?? {})) exits[dir] = { msg: msg || "You can't go that way." };
  const lines = (l.ambient?.lines ?? []).filter(Boolean);
  const chance = (l.ambient?.chance ?? 20) / 100;
  return {
    kind: 'room',
    title: l.title || id,
    name: l.name || (l.title || id).toLowerCase(),
    names: l.nouns ?? [],
    adj: l.adjectives ?? [],
    desc: l.description || undefined,
    smell: l.smell || undefined,
    listen: l.listen || undefined,
    overlooks: l.overlooks?.length ? l.overlooks : undefined,
    listExits: l.listExits !== false,
    dark: l.dark || undefined,
    darkText: l.dark ? l.darkText : undefined,
    lookDir: l.look && Object.keys(l.look).length ? l.look : undefined,
    entryNear: l.arriveNear || undefined,
    exits,
    globals: [],
    map: { w, h, shapes },
    // Each turn, a chance of one background line picked at random.
    eachTurn: lines.length
      ? (wd) => { if (wd.random() < chance) wd.say(wd.text(lines[Math.floor(wd.random() * lines.length)]), 'ambient'); }
      : undefined,
  };
}

// Everything the game needs, from the editor's story: kit/content.js is just this.
export function buildGame(story) {
  const game = story.game ?? {};
  return {
    title: game.title || 'Untitled',
    intro: (game.intro ?? '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean),
    questions: game.questions ?? [],
    status: game.status || undefined,
    startNear: game.start?.near || null,
    objects: applyStory({}, story),
    events: story.events ?? {},
    messages: game.messages ?? {},
    grammar: verbGrammar(story.verbs),
    verbs: Object.fromEntries(Object.entries(story.verbs ?? {}).map(([id, v]) => [VERB + id, { ...v, id }])),
    story,
    baseObjects: {},
  };
}

// A door or opening on one wall of a room's map, `pos` percent of the way along it.
export function passageShape(map, id, type, wall, pos, width) {
  const r = map.shapes.find((s) => s.type === 'room' || s.type === 'balcony') ?? { x: 4, y: 4, w: map.w - 8, h: map.h - 8 };
  const len = width || 8;
  const t = Math.min(100, Math.max(0, pos)) / 100;
  if (wall === 'w' || wall === 'e') {
    const x = wall === 'w' ? r.x : r.x + r.w;
    const y = r.y + t * r.h;
    return { type, obj: id, side: wall, x, y: y - len / 2, len, stand: { x: x + (wall === 'w' ? 6 : -6), y } };
  }
  const y = wall === 'n' ? r.y : r.y + r.h;
  const x = r.x + t * r.w;
  return { type, obj: id, side: wall, x: x - len / 2, y, len, stand: { x, y: y + (wall === 'n' ? 6 : -6) } };
}

const compact = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== '' && v !== false));
const articleOf = (a) => (a === 'none' ? { proper: true } : a ? { article: a, ...(a === 'some' && { plural: true }) } : {});

// Turns editor objects and actors into world objects.
export function storyObjects(story) {
  const out = {};
  for (const [id, t] of Object.entries(story.objects ?? {})) {
    out[id] = compact({
      name: t.name || id,
      ...articleOf(t.article),
      names: t.nouns ?? [],
      adj: t.adjectives ?? [],
      desc: t.description,
      in: t.in || null,
      scenery: t.scenery,
      fixed: t.fixed ? t.fixedText || true : t.alsoIn?.length ? true : undefined,
      supporter: t.supporter,
      container: t.container,
      transparent: t.container && t.transparent,
      openable: t.openable,
      open: t.openable && t.open,
      locked: t.openable && t.locked,
      key: t.openable ? t.key : undefined,
      wearable: t.wearable,
      worn: t.wearable && t.worn,
      wornMsg: t.wearable ? t.wornText : undefined,
      edible: t.edible,
      eaten: t.edible ? t.eatenText : undefined,
      drinkable: t.drinkable,
      drunk: t.drinkable ? t.drunkText : undefined,
      becomes: t.edible || t.drinkable ? t.becomes : undefined,
      switchable: t.switchable,
      on: t.switchable && t.on,
      onText: t.switchable ? t.onText : undefined,
      offText: t.switchable ? t.offText : undefined,
      switchOnText: t.switchable ? t.switchOnText : undefined,
      switchOffText: t.switchable ? t.switchOffText : undefined,
      alsoIn: t.alsoIn?.length ? t.alsoIn : undefined,
      light: t.light || undefined,
      text: t.readText,
      smell: t.smell,
      listen: t.listen,
      touch: t.touch,
      reactions: t.reactions?.length ? t.reactions : undefined,
    });
    out[id].in = t.in || null;
  }
  for (const [id, a] of Object.entries(story.actors ?? {})) {
    const spot = a.place?.room && Number.isFinite(a.place.x) && Number.isFinite(a.place.y) ? a.place : null;
    out[id] = {
      kind: 'actor',
      name: a.name || id,
      proper: a.article === 'none',
      article: a.article === 'none' ? undefined : a.article ?? 'the',
      names: a.nouns ?? [],
      adj: a.adjectives ?? [],
      desc: a.description || undefined,
      in: a.place?.room || null,
      animate: true,
      scenery: a.scenery || undefined,
      talk: a.talk || undefined,
      followText: a.followText ?? undefined,
      mapSpot: spot && { room: spot.room, x: spot.x, y: spot.y, marker: a.marker ?? 'group' },
      conversation: a.conversation && Object.keys(a.conversation.nodes ?? {}).length ? a.conversation : undefined,
    };
  }
  return out;
}

const truthy = (v) => v !== undefined && v !== null && v !== false && v !== '' && v !== 0;

function compare(actual, op = 'is', expected) {
  switch (op) {
    case 'is': return typeof expected === 'boolean' ? truthy(actual) === expected : actual === expected;
    case 'isNot': return typeof expected === 'boolean' ? truthy(actual) !== expected : actual !== expected;
    case 'atLeast': return Number(actual ?? 0) >= Number(expected);
    case 'atMost': return Number(actual ?? 0) <= Number(expected);
    default: return false;
  }
}

const CHECKS = {
  var: (w, c) => compare(w.state.vars[c.name], c.op, c.value),
  turn: (w, c) => compare(w.state.turn, c.op ?? 'atLeast', c.value),
  inRoom: (w, c) => w.room === c.room,
  has: (w, c) => !!c.item && w.carried(c.item),
  talkedTo: (w, c) => (w.state.talked[c.actor] ?? 0) > 0,
  seenNode: (w, c) => !!w.state.seen[`${c.actor}:${c.node}`],
  eventFired: (w, c) => !!w.state.fired[c.event],
  thingIn: (w, c) => w.parent(c.thing) === (c.where || null),
  thingIs: (w, c) => !!c.thing && w.cmd?.dobj === c.thing,
  otherIs: (w, c) => !!c.thing && w.cmd?.iobj === c.thing,
  switchIs: (w, c) => w.is(c.thing, 'on') === (c.state !== 'off'),
  doorIs: (w, c) => ({
    open: w.is(c.thing, 'open'),
    closed: !w.is(c.thing, 'open'),
    locked: w.is(c.thing, 'locked'),
    unlocked: !w.is(c.thing, 'locked'),
    hidden: w.is(c.thing, 'hidden'),
    shown: !w.is(c.thing, 'hidden'),
  })[c.state] ?? false,
};

// `conds` may be a list of conditions, a function of the world, or empty (always true).
export function check(w, conds) {
  if (!conds) return true;
  if (typeof conds === 'function') return !!conds(w);
  // `not` on a condition turns it round ("the player does NOT carry the lamp").
  return conds.every((c) => (CHECKS[c.type]?.(w, c) ?? false) !== !!c.not);
}

export function apply(w, effects, signals = {}) {
  for (const e of effects ?? []) {
    switch (e.type) {
      case 'say': w.say(w.text(e.text)); break;
      case 'setVar': w.state.vars[e.name] = e.value; break;
      case 'addVar': w.state.vars[e.name] = Number(w.state.vars[e.name] ?? 0) + Number(e.value ?? 1); break;
      case 'move': w.move(e.thing, e.to || null); break;
      case 'startConversation': signals.start = e.actor; break;
      case 'endConversation': signals.end = true; break;
      case 'fireEvent': fire(w, e.event, signals); break;
      case 'command': signals.command = e.text; break;
      case 'setDoor':
        if (e.state === 'open' || e.state === 'closed') w.set(e.thing, 'open', e.state === 'open');
        if (e.state === 'locked' || e.state === 'unlocked') w.set(e.thing, 'locked', e.state === 'locked');
        if (e.state === 'locked') w.set(e.thing, 'open', false);
        if (e.state === 'hidden' || e.state === 'shown') w.set(e.thing, 'hidden', e.state === 'hidden');
        break;
      case 'setSwitch': w.set(e.thing, 'on', e.state !== 'off'); break;
      // "After N turns": the event happens at the end of the Nth turn from now
      // (scheduled during a command, that command's own turn doesn't count).
      case 'later':
        (w.state.timers ??= []).push({ event: e.event, left: Math.max(1, Math.round(Number(e.turns) || 1)) + (w.endOfTurn ? 0 : 1) });
        break;
      case 'follow': if (!(w.state.followers ??= []).includes(e.actor)) w.state.followers.push(e.actor); break;
      case 'stopFollowing': w.state.followers = (w.state.followers ?? []).filter((a) => a !== e.actor); break;
      case 'cancelLater': w.state.timers = (w.state.timers ?? []).filter((t) => t.event !== e.event); break;
      case 'endGame':
        w.state.ended = true;
        w.say(w.text(e.text), 'ending');
        w.say(w.msg('ended'), 'meta');
        break;
      default: throw new Error(`Unknown effect type "${e.type}"`);
    }
  }
  return signals;
}

function fire(w, id, signals) {
  const ev = w.content.events?.[id];
  if (!ev) throw new Error(`Unknown event "${id}"`);
  w.state.fired[id] = (w.state.fired[id] ?? 0) + 1;
  apply(w, ev.effects, signals);
}

// Runs the reactions an object has to the action the player is doing to it. Returns
// whether one replaced the usual result, plus any signals from its effects.
export function react(w, id, action) {
  const signals = {};
  let instead = false;
  // Which reactions apply is decided before any of them runs, so one reaction's
  // effects can't set off another in the same go.
  const due = (w.obj(id).reactions ?? []).map((r, i) => [r, `${id}#${i}`])
    .filter(([r, key]) => r.action === action && !(r.once && w.state.fired[key]) && check(w, r.when));
  for (const [r, key] of due) {
    if (r.once) w.state.fired[key] = 1;
    apply(w, r.effects, signals);
    if (r.instead) instead = true;
  }
  return { instead, signals };
}

// Called at the end of every turn. Each event runs at most once per turn, and
// only once ever unless `once` is false. `onlyTriggered` events are skipped: they run
// only from a fireEvent effect.
export function runEvents(w) {
  const signals = {};
  w.endOfTurn = true;
  const timers = w.state.timers ?? [];
  for (const t of timers) t.left--;
  w.state.timers = timers.filter((t) => t.left > 0);
  for (const t of timers.filter((x) => x.left <= 0)) fire(w, t.event, signals);
  for (const [id, ev] of Object.entries(w.content.events ?? {})) {
    if (ev.onlyTriggered || (ev.once !== false && w.state.fired[id])) continue;
    if (!check(w, ev.when)) continue;
    fire(w, id, signals);
  }
  w.endOfTurn = false;
  return signals;
}
