// Content checks that don't need a playthrough: every reference points at something real.
// Used by the test runner and, live, by the story editor.
import { MESSAGES } from '../engine/messages.js';
import { ACTIONS } from '../engine/actions.js';
import { verbPattern } from '../engine/story.js';
import { textProblems } from '../engine/text.js';

export function lint(content) {
  const problems = [];
  for (const key of Object.keys(content.messages ?? {})) {
    if (!(key in MESSAGES)) problems.push(`messages: "${key}" isn't one of the built-in messages`);
  }
  const objects = content.objects;
  const exists = (id) => id in objects;
  for (const [id, o] of Object.entries(objects)) {
    if (!o.name) problems.push(`${id}: has no name`);
    if (o.kind !== 'room' && !o.names?.length) problems.push(`${id}: has no nouns, so the player can't refer to it`);
    if (o.in && !exists(o.in)) problems.push(`${id}: is in "${o.in}", which doesn't exist`);
    if (o.becomes && !exists(o.becomes)) problems.push(`${id}: becomes "${o.becomes}", which doesn't exist`);
    if (o.key && !exists(o.key)) problems.push(`${id}: key "${o.key}" doesn't exist`);
    for (const [dir, exit] of Object.entries(o.exits ?? {})) {
      const to = typeof exit === 'string' ? exit : exit.to;
      if (to && !exists(to)) problems.push(`${id}: exit ${dir} leads to "${to}", which doesn't exist`);
      if (exit.door && !exists(exit.door)) problems.push(`${id}: exit ${dir} uses door "${exit.door}", which doesn't exist`);
    }
    for (const [from, to] of Object.entries(o.leadsTo ?? {})) {
      if (!exists(from) || !exists(to)) problems.push(`${id}: leadsTo ${from} -> ${to} names a room that doesn't exist`);
    }
    for (const r of [...(o.globals ?? []), ...(o.overlooks ?? [])]) {
      if (!exists(r)) problems.push(`${id}: globals/overlooks refers to "${r}", which doesn't exist`);
    }
    if (o.conversation) problems.push(...lintConversation(content, id, o.conversation));
    for (const r of o.reactions ?? []) {
      if (!r.action) problems.push(`${id}: a reaction has no action chosen`);
      else if (!(r.action in ACTIONS) && !(r.action in (content.verbs ?? {}))) problems.push(`${id}: a reaction is to "${r.action}", which isn't a verb`);
      problems.push(...lintRules(content, `${id} reaction to ${r.action || '?'}`, r.when, r.effects));
    }
    for (const s of o.map?.shapes ?? []) {
      if (s.obj && !exists(s.obj)) problems.push(`${id}: map shape refers to "${s.obj}", which doesn't exist`);
    }
  }
  problems.push(...lintPassages(content));
  for (const [action, v] of Object.entries(content.verbs ?? {})) {
    const label = `verb ${v.name || v.id}`;
    const patterns = v.patterns ?? [];
    if (!patterns.some((p) => verbPattern(p).tokens)) problems.push(`${label}: has no patterns, so the player can't use it`);
    for (const p of patterns) {
      const r = verbPattern(p);
      if (r.error) problems.push(`${label}: the pattern "${p}" ${r.error}`);
    }
    (v.rules ?? []).forEach((r, i) => problems.push(...lintRules(content, `${label} rule ${i + 1}`, r.when, r.effects)));
  }
  for (const [id, ev] of Object.entries(content.events ?? {})) {
    problems.push(...lintRules(content, `event ${id}`, ev.when, ev.effects));
  }
  // An event that waits to be triggered needs something that triggers it.
  const triggered = new Set();
  const walk = (v) => {
    if (Array.isArray(v)) return v.forEach(walk);
    if (!v || typeof v !== 'object') return;
    if (v.type === 'fireEvent' || v.type === 'later') triggered.add(v.event);
    Object.values(v).forEach(walk);
  };
  walk([objects, content.events, content.verbs]);
  for (const [id, ev] of Object.entries(content.events ?? {})) {
    if (ev.onlyTriggered && !triggered.has(id)) problems.push(`event ${ev.name || id}: happens only when triggered, but no reply, reaction or event triggers it`);
  }
  const walks = content.story?.walkthroughs ?? {};
  for (const [id, w] of Object.entries(walks)) {
    const label = `walkthrough ${w.name || id}`;
    if (w.from && !walks[w.from]) problems.push(`${label}: starts after "${w.from}", which doesn't exist`);
    if (!(w.steps ?? []).some((s) => s.command?.trim())) problems.push(`${label}: has no commands`);
  }
  // Variable text that won't work: an {if} without {/if}, a {cycle} with one choice...
  const NOT_TEXT = new Set(['notes', 'patterns', 'walkthroughs', 'layout', 'areas', 'areaOf']);
  const walkText = (v, path) => {
    if (typeof v === 'string') { for (const p of textProblems(v)) problems.push(`${path}: ${p}`); return; }
    if (!v || typeof v !== 'object') return;
    for (const [k, x] of Object.entries(v)) if (!NOT_TEXT.has(k)) walkText(x, Array.isArray(v) ? `${path}[${Number(k) + 1}]` : path ? `${path}.${k}` : k);
  };
  walkText(content.story ?? {}, '');
  if (!objects.player?.in) problems.push('player: has no starting room');
  else if (objects[objects.player.in]?.kind !== 'room') problems.push(`game: the start location "${objects.player.in}" doesn't exist`);
  if (content.startNear && !(content.startNear in objects)) problems.push(`game: the player starts by "${content.startNear}", which doesn't exist`);
  for (const q of content.questions ?? []) if (!q.var) problems.push('game: a start-screen question has no variable name');
  return problems;
}

// Editor doors and passages: both ends exist, and no two ways out share a direction.
// Needs content.story (the raw editor data) and content.baseObjects (hand-written ones).
function lintPassages(content) {
  const problems = [];
  const passages = content.story?.passages ?? {};
  const objects = content.objects;
  const base = content.baseObjects ?? {};
  const used = {};
  for (const [id, p] of Object.entries(passages)) {
    const label = `passage ${p.name || p.existing || id}`;
    if (!objects[p.a?.room]) { problems.push(`${label}: its location "${p.a?.room ?? ''}" doesn't exist`); continue; }
    if (p.b?.room && objects[p.b.room]?.kind !== 'room') problems.push(`${label}: leads to "${p.b.room}", which isn't a location`);
    if (p.b?.room === p.a.room) problems.push(`${label}: leads back into the same location`);
    if (p.existing && objects[p.existing]?.in !== p.a.room) problems.push(`${label}: "${p.existing}" isn't in ${p.a.room}`);
    for (const side of [p.a, p.b]) {
      if (!side?.room || !side.dir) continue;
      const key = `${side.room}:${side.dir}`;
      if (used[key]) problems.push(`${side.room}: two ways out go ${side.dir} (${used[key]} and ${label})`);
      used[key] = label;
      const handWritten = base[side.room]?.exits?.[side.dir];
      if (handWritten && handWritten.door !== (p.existing || id)) {
        problems.push(`${side.room}: ${label} replaces the hand-written ${side.dir} exit`);
      }
    }
  }
  return problems;
}

// Every option leads somewhere real, and every line can be reached from the start.
function lintConversation(content, id, conv) {
  const problems = [];
  const nodes = conv.nodes ?? {};
  for (const key of ['start', 'again']) {
    if (conv[key] && !nodes[conv[key]]) problems.push(`${id}: conversation ${key} line "${conv[key]}" doesn't exist`);
  }
  if (!conv.start) problems.push(`${id}: conversation has no starting line`);
  const reached = new Set();
  const walk = (n) => {
    if (!nodes[n] || reached.has(n)) return;
    reached.add(n);
    for (const o of nodes[n].options ?? []) if (o.go) walk(o.go);
  };
  walk(conv.start);
  walk(conv.again);
  for (const [name, node] of Object.entries(nodes)) {
    if (!reached.has(name)) problems.push(`${id}: conversation line "${name}" can't be reached`);
    problems.push(...lintRules(content, `${id} line "${name}"`, null, node.effects));
    for (const o of node.options ?? []) {
      if (o.go && !nodes[o.go]) problems.push(`${id}: reply "${o.text}" in "${name}" goes to missing line "${o.go}"`);
      problems.push(...lintRules(content, `${id} reply "${o.text}"`, o.when, o.effects));
    }
  }
  return problems;
}

// Conditions and effects refer to things, rooms, actors, events and lines that exist.
function lintRules(content, where, conds, effects) {
  const problems = [];
  const objects = content.objects;
  const need = (value, ok, what) => {
    if (!value) problems.push(`${where}: a ${what} hasn't been chosen`);
    else if (!ok(value)) problems.push(`${where}: ${what} "${value}" doesn't exist`);
  };
  const isRoom = (id) => objects[id]?.kind === 'room';
  const isThing = (id) => id in objects && objects[id].kind !== 'room';
  const isActor = (id) => objects[id]?.kind === 'actor';
  const isEvent = (id) => id in (content.events ?? {});
  const isPlace = (id) => id === 'player' || id in objects;
  for (const c of Array.isArray(conds) ? conds : []) {
    if (c.type === 'var' && !c.name) problems.push(`${where}: a variable condition has no name`);
    if (c.type === 'inRoom') need(c.room, isRoom, 'room');
    if (c.type === 'has') need(c.item, isThing, 'thing');
    if (c.type === 'talkedTo') need(c.actor, isActor, 'actor');
    if (c.type === 'seenNode') {
      need(c.actor, isActor, 'actor');
      if (isActor(c.actor)) need(c.node, (n) => n in (objects[c.actor].conversation?.nodes ?? {}), 'line');
    }
    if (c.type === 'eventFired') need(c.event, isEvent, 'event');
    if (c.type === 'thingIs' || c.type === 'otherIs' || c.type === 'switchIs') need(c.thing, isThing, 'thing');
    if (c.type === 'thingIn') {
      need(c.thing, isThing, 'thing');
      if (c.where && !isPlace(c.where)) problems.push(`${where}: place "${c.where}" doesn't exist`);
    }
  }
  for (const e of effects ?? []) {
    if ((e.type === 'setVar' || e.type === 'addVar') && !e.name) problems.push(`${where}: a variable effect has no name`);
    if (e.type === 'move') {
      need(e.thing, isThing, 'thing');
      if (e.to && !isPlace(e.to)) problems.push(`${where}: place "${e.to}" doesn't exist`);
    }
    if (e.type === 'startConversation') {
      need(e.actor, isActor, 'actor');
      if (isActor(e.actor) && !objects[e.actor].conversation) problems.push(`${where}: ${e.actor} has no conversation to start`);
    }
    if (['fireEvent', 'later', 'cancelLater'].includes(e.type)) need(e.event, isEvent, 'event');
    if (e.type === 'follow' || e.type === 'stopFollowing') need(e.actor, isActor, 'actor');
    if (e.type === 'setSwitch') need(e.thing, isThing, 'thing');
    if (e.type === 'command' && !e.text) problems.push(`${where}: a command effect is empty`);
  }
  return problems;
}
