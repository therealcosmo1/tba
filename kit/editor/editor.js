// Story editor: locations with their doors and passages, objects (with map shapes and
// reactions), actors (with placement and conversations) and events. Reads and writes game/story.js through kit/tools/serve.mjs.
const baseObjects = {}; // hand-written objects: none any more, the whole game is story data
import { applyStory, buildGame, OPPOSITE, VERB, verbPattern } from '../engine/story.js';
import { MESSAGES, MESSAGE_GROUPS } from '../engine/messages.js';
import { runWalkthrough } from '../engine/walkthrough.js';
import { storyFlow, where as whereIs } from './flow.js';
import { storage as siteStorage } from '../ui/storage.js';
import { cap, listJoin, TEXT_DIRECTIVES } from '../engine/text.js';
import { lint } from '../tests/lint.mjs';
import { renderMap } from '../ui/map.js';
import { CONDITIONS, EFFECTS, DIRECTIONS, WALLS, PASSAGE_KINDS, REACTION_ACTIONS } from './schema.js';
import { h, field, textInput, numberInput, select, checkbox, listInput } from './dom.js';
import { ruleEditor } from './rules.js';
import { drawGraph, layout } from './graph.js';
import { drawAtlas } from './atlas.js';

const $ = (id) => document.getElementById(id);

let story = null;
let version = null; // of game/story.js when loaded or last saved; the server refuses stale saves
let dirty = false;
let onDisk = ''; // the story as last loaded or saved, to tell whether there is anything to write
let sel = { tab: 'actors', id: null, node: null, passage: null };
try { sel = { ...sel, ...JSON.parse(localStorage.getItem('yuriful-tba:editor') ?? '{}') }; } catch {}

// The whole world as the game will see it: hand-written objects plus the story.
const world = () => applyStory(baseObjects, story);
const roomTitle = (id) => { const o = world()[id]; return o ? o.title ?? o.name : id; };

const ctx = {
  rooms: () => Object.entries(world()).filter(([, o]) => o.kind === 'room').map(([id, o]) => ({ id, label: o.title ?? o.name })),
  actors: () => Object.entries(story.actors).map(([id, a]) => ({ id, label: a.name ? `${a.name} (${id})` : id })),
  events: () => Object.entries(story.events).map(([id, e]) => ({ id, label: e.name ? `${e.name} (${id})` : id })),
  things: () => Object.entries(world())
    .filter(([id, o]) => o.kind !== 'room' && id !== 'player' && !o.detail)
    .map(([id, o]) => ({ id, label: `${o.name} (${id})${o.kind === 'actor' ? ', actor' : ''}` })),
  doors: () => Object.entries(world()).filter(([, o]) => o.openable || o.kind === 'passage').map(([id, o]) => ({ id, label: `${o.name} (${id})` })),
  switches: () => Object.entries(world()).filter(([, o]) => o.switchable).map(([id, o]) => ({ id, label: `${o.name} (${id})` })),
  places: () => [
    { id: '', label: 'nowhere (out of the game)' },
    { id: 'player', label: "the player's inventory" },
    ...ctx.rooms().map((r) => ({ ...r, label: `room: ${r.label}` })),
    ...ctx.things(),
  ],
  nodesOf: (actorId) => Object.keys(story.actors[actorId]?.conversation?.nodes ?? {}).map((id) => ({ id, label: id })),
};

// "{pname} and {phouse} are filled in." Names the variables of the Game tab's
// start-screen questions, so the hint follows any renaming.
function answersHint() {
  const vars = (story.game?.questions ?? []).map((q) => q.var).filter(Boolean).map((v) => `{${v}}`);
  if (!vars.length) return 'Start-screen answers can be used as {variable}.';
  return `${listJoin(vars)} ${vars.length > 1 ? 'are' : 'is'} filled in from the start screen.`;
}

// ---- loading and saving -------------------------------------------------------

// Which story file is open: 'story' (game/story.js, the main one) or another
// game/<name>.story.js. Remembered per browser.
let storyName = (() => { try { return localStorage.getItem('yuriful-tba:editor-story') || 'story'; } catch { return 'story'; } })();
let stories = [];

async function loadStoryList() {
  try {
    stories = await (await fetch('/api/stories', { cache: 'no-store' })).json();
  } catch {
    stories = [];
  }
  const pick = $('story-select');
  pick.replaceChildren(
    ...stories.map((s) => h('option', { value: s.name }, `${s.title}${s.main ? ' (main)' : ''}`)),
    h('option', { value: ':new' }, '+ New story…'),
    h('option', { value: ':saveas' }, 'Save as…'));
  pick.value = storyName;
}

async function openStory(name) {
  if (dirty && !window.confirm('This story has unsaved changes. Open another one and lose them?')) {
    $('story-select').value = storyName;
    return;
  }
  storyName = name;
  try { localStorage.setItem('yuriful-tba:editor-story', name); } catch {}
  dirty = false;
  sel = { tab: sel.tab, id: null, node: null, passage: null };
  await load();
  await loadStoryList();
}

const askName = (question, suggestion = '') => {
  const raw = window.prompt(`${question}\nLowercase letters, digits and dashes, e.g. my-second-game.`, suggestion);
  if (raw === null) return null;
  const name = raw.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
  if (!name || name === 'story') { window.alert('Choose another name.'); return null; }
  return name;
};

// Writes `data` as a new story file, then opens it.
async function createStory(name, data) {
  const res = await fetch('/api/story', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, story: data, create: true }) });
  const body = await res.json();
  if (!body.ok) { window.alert(body.message); return; }
  dirty = false;
  await openStory(body.name);
  setStatus(`Saved as ${body.name}. Its page is ${body.page}.`);
}

$('story-select').addEventListener('change', async (e) => {
  const v = e.target.value;
  e.target.value = storyName;
  if (v === ':new') {
    const name = askName('Name of the new story file:');
    if (!name) return;
    if (dirty && !window.confirm('This story has unsaved changes. Start a new one and lose them?')) return;
    const { default: starter } = await import('../starter/story.js');
    return createStory(name, structuredClone(starter));
  }
  if (v === ':saveas') {
    if (pending()) commit();
    const name = askName('Save this story as a new file called:', `${storyName === 'story' ? 'my-story' : storyName}-copy`);
    if (name) return createStory(name, story);
    return;
  }
  if (v && v !== storyName) openStory(v);
});

// Play: the story as it is in the editor, saved or not, in a new tab.
function play(start) {
  if (pending()) commit();
  siteStorage.set('preview', story);
  window.open(`../dev.html?preview=1&debug=1${start ? `&start=${encodeURIComponent(start)}` : ''}`, '_blank', 'noopener');
}
$('play').addEventListener('click', () => play());

async function load() {
  try {
    const res = await fetch(`/api/story?name=${encodeURIComponent(storyName)}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`${res.status}`);
    ({ story, version } = await res.json());
    if (!story) {
      storyName = 'story';
      return load();
    }
    story.objects ??= {};
    story.locations ??= {};
    story.areas ??= {};
    story.areaOf ??= {};
    story.passages ??= {};
    story.verbs ??= {};
    story.walkthroughs ??= {};
    story.layout ??= {};
    story.game ??= { title: '', intro: '', questions: [], start: {}, player: {} };
    onDisk = JSON.stringify(story);
  } catch {
    $('main').replaceChildren(h('div', { class: 'empty-state' },
      h('h2', {}, "Can't reach the editor server"),
      h('p', {}, 'The editor runs on your own computer: start it from the project folder with npm start, then reload this page. It does not work on the published site.')));
    return;
  }
  if (!story.actors[sel.id] && !story.events[sel.id] && !story.verbs[sel.id] && !story.walkthroughs[sel.id] && !story.objects[sel.id] && !story.areas[sel.id] && world()[sel.id]?.kind !== 'room') sel = { tab: sel.tab, id: null, node: null, passage: null };
  setStatus('No unsaved changes');
  resetHistory();
  renderAll();
  opened();
}

async function save() {
  if (pending()) commit();
  setStatus('Saving…');
  try {
    const res = await fetch('/api/story', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: storyName, story, version }) });
    const body = await res.json();
    if (!body.ok) throw new Error(body.message);
    version = body.version;
    onDisk = JSON.stringify(story);
    dirty = false;
    renderItemBar();
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const walks = Object.keys(story.walkthroughs ?? {});
    const failing = walks.filter((wid) => !runWalk(wid).ok);
    const walkNote = !walks.length ? '' : failing.length
      ? ` ${failing.length} of ${walks.length} walkthroughs fail: ${failing.map((wid) => story.walkthroughs[wid].name || wid).join(', ')}.`
      : ` All ${walks.length} walkthroughs pass.`;
    if (sel.tab === 'walkthroughs') { renderList(); renderMain(); }
    setStatus(body.build.ok ? `Saved at ${time}. ${body.page} rebuilt.${walkNote}` : `Saved at ${time}, but the build failed: ${body.build.message}`, body.build.ok && !failing.length ? '' : 'error');
    return body.build.ok;
  } catch (err) {
    setStatus(`Not saved: ${err.message}`, 'error');
    return false;
  }
}

// ---- publishing ------------------------------------------------------------------
//
// Only offered when the project is a git repository. The server runs the tests and
// makes a "Game:" commit of game/story.js and index.html, then pushes it if there's a remote.

async function setUpPublish() {
  try {
    const info = await (await fetch('/api/publish', { cache: 'no-store' })).json();
    const button = $('publish');
    button.hidden = !info.git;
    if (!info.remote) button.title = 'Save, run the tests, and commit the game as a Game: commit (no GitHub remote yet, so it is not pushed)';
  } catch {}
}

async function publish() {
  const message = window.prompt('What changed in the game? (for the commit message)', 'Update the game');
  if (message === null) return;
  if ((dirty || pending()) && !(await save())) return;
  setStatus('Publishing: running the tests…');
  $('publish').disabled = true;
  try {
    const body = await (await fetch('/api/publish', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message }) })).json();
    const [first, ...rest] = body.message.split('\n');
    setStatus(body.ok ? first : `Not published: ${first}`, body.ok ? '' : 'error');
    if (!body.ok && rest.length) window.alert(body.message);
  } catch (err) {
    setStatus(`Not published: ${err.message}`, 'error');
  } finally {
    $('publish').disabled = false;
  }
}

function setStatus(text, cls = '') {
  const el = $('status');
  el.textContent = text;
  el.className = `save-status ${cls}`;
}

// ---- undo -----------------------------------------------------------------------
//
// Every edit is recorded; edits less than a second apart (typing) count as one step.
// Text boxes keep their own undo while you're typing in them.
let undoStack = [];
let redoStack = [];
let lastSnap = null;
let lastEdit = 0;

function resetHistory() {
  undoStack = [];
  redoStack = [];
  lastSnap = JSON.stringify(story);
  updateUndoButtons();
}

function recordEdit() {
  const snap = JSON.stringify(story);
  if (snap === lastSnap) return;
  const now = Date.now();
  if (now - lastEdit > 1000 || !undoStack.length) {
    undoStack.push(lastSnap);
    if (undoStack.length > 200) undoStack.shift();
  }
  redoStack = [];
  lastSnap = snap;
  lastEdit = now;
  updateUndoButtons();
}

function stepHistory(from, to) {
  if (!from.length) return;
  to.push(JSON.stringify(story));
  story = JSON.parse(from.pop());
  lastSnap = JSON.stringify(story);
  lastEdit = 0;
  markDirty();
  renderAll();
  updateUndoButtons();
}
const undo = () => stepHistory(undoStack, redoStack);
const redo = () => stepHistory(redoStack, undoStack);

function updateUndoButtons() {
  $('undo').disabled = !undoStack.length;
  $('redo').disabled = !redoStack.length;
}

function changed({ graph = false, list = true, inspector = false, main = false } = {}) {
  recordEdit();
  markDirty();
  if (list) renderList();
  renderProblems();
  if (main) renderMain();
  else if (graph) renderGraph();
  if (inspector) renderInspector();
  renderItemBar();
}

// ---- saving one item -----------------------------------------------------------
//
// Edits change `story` as you type. Each item (object, actor, event, location, area) also
// has its own Save: it accepts the edits made since the item was opened, and redraws
// every list, map and check. Revert puts them back. Leaving an item with edits not saved
// asks first. The main Save writes everything to game/story.js.

let checkpoint = null; // the story as it was when the open item was opened or last saved
const withoutLayout = ({ layout, ...rest }) => rest; // dragging the atlas isn't an item edit
// Forms fill in some defaults as they draw (an empty list of rules, a position for each
// conversation line), so the checkpoint is taken once the item is fully on the page:
// opening an item is never an edit. The graph and atlas are drawn by the observer at the
// bottom of this file, whose callback is queued before this one.
function opened() {
  queueMicrotask(() => {
    checkpoint = structuredClone(story);
    renderItemBar();
  });
}
const pending = () => !!checkpoint && JSON.stringify(withoutLayout(story)) !== JSON.stringify(withoutLayout(checkpoint));

// What is open: { kind, name }, or null.
function openItem() {
  const id = sel.id;
  if (sel.tab === 'game') return { kind: 'settings', name: 'game settings', label: 'the game settings' };
  if (!id) return null;
  if (sel.tab === 'objects' && story.objects[id]) return { kind: 'object', name: story.objects[id].name || id };
  if (sel.tab === 'actors' && story.actors[id]) return { kind: 'actor', name: story.actors[id].name || id };
  if (sel.tab === 'events' && story.events[id]) return { kind: 'event', name: story.events[id].name || id };
  if (sel.tab === 'verbs' && story.verbs[id]) return { kind: 'verb', name: story.verbs[id].name || id };
  if (sel.tab === 'walkthroughs' && story.walkthroughs[id]) return { kind: 'walkthrough', name: story.walkthroughs[id].name || id };
  if (sel.tab === 'locations' && story.areas[id]) return { kind: 'area', name: story.areas[id].name || id };
  if (sel.tab === 'locations' && world()[id]?.kind === 'room') return { kind: 'location', name: roomTitle(id) };
  return null;
}

function commit() {
  checkpoint = structuredClone(story);
  const scroll = $('main').scrollTop;
  renderAll();
  $('main').scrollTop = scroll;
}

function revert() {
  story = { ...structuredClone(checkpoint), layout: story.layout };
  markDirty();
  renderAll();
}

// Whether there is anything for the main Save to write.
function markDirty() {
  dirty = JSON.stringify(story) !== onDisk;
  if (dirty) setStatus('Unsaved changes', 'dirty');
  else if ($('status').classList.contains('dirty')) setStatus('No unsaved changes');
}

// Runs `then` once the open item has no edits left unsaved, asking first if it has.
function settle(then) {
  if (!pending()) return then();
  const item = openItem();
  const what = item ? `${item.kind} "${item.name}"` : 'this item';
  $('settle')?.remove();
  const box = h('div', { class: 'confirm', id: 'settle', role: 'alertdialog', 'aria-label': 'Unsaved changes' },
    h('p', {}, `You have edits to ${what} that aren't saved.`),
    h('button', { type: 'button', class: 'primary', onclick: () => { box.remove(); commit(); then(); } }, `Save ${item?.kind ?? 'item'}`),
    h('button', { type: 'button', class: 'danger', onclick: () => { box.remove(); revert(); then(); } }, 'Discard edits'),
    h('button', { type: 'button', onclick: () => box.remove() }, 'Keep editing'));
  $('main').prepend(box);
  $('main').scrollTop = 0;
  box.querySelector('button').focus();
}

// The bar at the top of an item's form with its own Save and Revert.
function renderItemBar() {
  const bar = $('item-bar');
  if (!bar) return;
  const item = openItem();
  const has = pending();
  bar.classList.toggle('pending', has);
  bar.replaceChildren(
    h('span', { class: 'item-bar-text' }, has
      ? `Edits to ${item.label ?? `this ${item.kind}`} aren't saved yet.`
      : `${cap(item.label ?? `this ${item.kind}`)} ${item.label ? 'are' : 'is'} saved in the editor.${dirty ? ' Use the main Save to write to the game.' : ''}`),
    h('button', { type: 'button', disabled: !has, onclick: revert }, 'Revert'),
    h('button', { type: 'button', class: 'primary', disabled: !has, onclick: commit, title: 'Save this item (⌘↵ / Ctrl+Enter)' }, `Save ${item.kind}`));
}

function select_(next) {
  const leaving = ('tab' in next && next.tab !== sel.tab) || ('id' in next && next.id !== sel.id);
  if (leaving && pending()) return settle(() => select_(next));
  sel = { ...sel, ...next };
  try { localStorage.setItem('yuriful-tba:editor', JSON.stringify(sel)); } catch {}
  renderAll();
  if (leaving) opened();
}

// Creating, deleting and renaming take effect at once, like saving the item. Call this
// after the change and before selecting what comes next.
function accept() {
  checkpoint = structuredClone(story);
}

// ---- collapsing ----------------------------------------------------------------

// Which groups, sections and cards are folded, remembered in this browser by key.
let folds = {};
try { folds = JSON.parse(localStorage.getItem('yuriful-tba:editor-folds') ?? '{}'); } catch {}

function rememberFold(key, open) {
  folds[key] = open;
  try { localStorage.setItem('yuriful-tba:editor-folds', JSON.stringify(folds)); } catch {}
}

// A collapsible block. Buttons and fields inside the summary still work without toggling it.
function fold(key, summary, body, { open = true, cls = '' } = {}) {
  const el = h('details', { class: `fold ${cls}`, 'data-key': key }, h('summary', {}, summary), body);
  el.open = folds[key] ?? open;
  el.addEventListener('toggle', () => rememberFold(key, el.open));
  return el;
}

// Sidebar groups: [{ key, label, items: [element] }]. Empty groups are left out.
function groupedList(groups) {
  return groups.filter((g) => g.items.length).map((g) =>
    fold(`list:${sel.tab}:${g.key}`, [h('span', { class: 'group-name' }, g.label), h('span', { class: 'group-count' }, String(g.items.length))], h('div', { class: 'list' }, g.items), { cls: 'group' }));
}

function setAllFolds(root, open) {
  for (const d of root.querySelectorAll('details.fold')) {
    d.open = open;
    rememberFold(d.dataset.key, open);
  }
}

// ---- ids and renaming -------------------------------------------------------

const ID_RE = /^[A-Za-z][A-Za-z0-9_]*$/;

function freshId(prefix, taken) {
  let n = 1;
  while (`${prefix}${n}` in taken) n++;
  return `${prefix}${n}`;
}

// Replace references to an actor/thing or event id everywhere in the story.
function renameRefs(keys, oldId, newId) {
  const walk = (v) => {
    if (Array.isArray(v)) return v.forEach(walk);
    if (!v || typeof v !== 'object') return;
    for (const [k, x] of Object.entries(v)) {
      if (keys.includes(k) && x === oldId) v[k] = newId;
      else walk(x);
    }
  };
  walk(story);
}

function renameKey(obj, oldKey, newKey) {
  const entries = Object.entries(obj).map(([k, v]) => [k === oldKey ? newKey : k, v]);
  for (const k of Object.keys(obj)) delete obj[k];
  Object.assign(obj, Object.fromEntries(entries));
}

function idField(current, collection, onRename) {
  const input = h('input', { type: 'text', autocomplete: 'off', spellcheck: 'false' });
  input.value = current;
  const hint = h('p', { class: 'hint' }, 'Used to refer to this in events. Letters, digits and _ only.');
  input.addEventListener('change', () => {
    const next = input.value.trim();
    if (next === current) return;
    if (!ID_RE.test(next) || next in collection || next in baseObjects || next in world()) {
      hint.textContent = `"${next}" can't be used: it must start with a letter, use only letters, digits and _, and not already exist.`;
      hint.classList.add('error');
      input.value = current;
      return;
    }
    onRename(next);
  });
  input.id = 'id-field';
  return h('div', { class: 'field' }, h('label', { for: input.id }, 'ID'), input, hint);
}

// ---- rendering ----------------------------------------------------------------

function renderAll() {
  for (const b of document.querySelectorAll('[data-tab]')) b.setAttribute('aria-pressed', String(b.dataset.tab === sel.tab));
  $('new').textContent = { actors: '+ New actor', objects: '+ New object', locations: '+ New location', events: '+ New event', verbs: '+ New verb', walkthroughs: '+ New walkthrough' }[sel.tab] ?? '';
  $('new').hidden = sel.tab === 'game' || sel.tab === 'flow';
  $('list-tools').hidden = ['events', 'verbs', 'walkthroughs', 'game', 'flow'].includes(sel.tab);
  $('new-area').hidden = sel.tab !== 'locations';
  renderList();
  renderProblems();
  renderMain();
  renderInspector();
  renderVarList();
}

function renderList() {
  if (sel.tab === 'game') return $('list').replaceChildren(h('p', { class: 'muted' }, 'The title, introduction, start-screen questions, where the player starts, and the player.'));
  if (sel.tab === 'locations') return renderLocationList();
  if (sel.tab === 'objects') return renderObjectList();
  if (sel.tab === 'walkthroughs') return renderWalkthroughList();
  if (sel.tab === 'flow') return $('list').replaceChildren(h('p', { class: 'muted' }, 'Every variable: what sets it and what checks it. Every event: what triggers it.'));
  const items = Object.entries({ actors: story.actors, events: story.events, verbs: story.verbs }[sel.tab] ?? {});
  const list = $('list');
  if (!items.length) {
    list.replaceChildren(h('p', { class: 'muted' }, { actors: 'No actors yet.', events: 'No events yet.', verbs: "No verbs of the game's own yet. The built-in ones (take, open, talk to...) are always there." }[sel.tab]));
    return;
  }
  const button = ([id, x]) =>
    h('button', {
      type: 'button',
      class: `item${sel.id === id ? ' selected' : ''}`,
      onclick: () => select_({ id, node: null }),
    },
    h('span', { class: 'item-name' }, x.name || id),
    h('span', { class: 'item-meta' },
      id,
      sel.tab === 'actors' && !x.place?.room && h('span', { class: 'badge warn' }, 'not placed'),
      sel.tab === 'actors' && x.notes && h('span', { class: 'badge' }, 'notes'),
      sel.tab === 'events' && x.once === false && h('span', { class: 'badge' }, 'repeats'),
      sel.tab === 'verbs' && (x.patterns?.[0] ? h('span', { class: 'badge' }, x.patterns[0]) : h('span', { class: 'badge warn' }, 'no patterns'))));
  if (sel.tab === 'events' || sel.tab === 'verbs') return list.replaceChildren(...items.map(button));
  list.replaceChildren(...groupedList(byRoom(items, ([, a]) => a.place?.room, 'Not placed yet').map((g) => ({ ...g, items: g.items.map(button) }))));
}

// Groups [id, x] entries by the room roomOf(entry) returns, in the order rooms are listed.
function byRoom(entries, roomOf, noRoom) {
  const rooms = ctx.rooms();
  const groups = [...rooms.map((r) => ({ key: r.id, label: r.label, items: [] })), { key: 'player', label: 'Carried', items: [] }, { key: '', label: noRoom, items: [] }];
  for (const e of entries) {
    const r = roomOf(e) ?? '';
    (groups.find((g) => g.key === r) ?? groups.at(-1)).items.push(e);
  }
  return groups;
}

// The game as it would be built from the story being edited (for lint and previews).
function assembled() {
  return { ...buildGame(story), baseObjects };
}

function renderProblems() {
  const problems = lint(assembled()).filter((p) => !p.startsWith('player:'));
  $('problems-count').textContent = problems.length ? `(${problems.length})` : '';
  $('problems').replaceChildren(...(problems.length
    ? problems.map((p) => h('li', {}, p))
    : [h('li', { class: 'muted' }, 'No problems found.')]));
}

function renderVarList() {
  const names = new Set(['name', 'house']);
  const walk = (v) => {
    if (Array.isArray(v)) return v.forEach(walk);
    if (!v || typeof v !== 'object') return;
    if (['var', 'setVar', 'addVar'].includes(v.type) && v.name) names.add(v.name);
    Object.values(v).forEach(walk);
  };
  walk(story);
  $('var-names').replaceChildren(...[...names].sort().map((n) => h('option', { value: n })));
}

function renderMain() {
  renderMainBody();
  if (openItem()) {
    $('main').prepend(h('div', { class: 'item-bar', id: 'item-bar', role: 'region', 'aria-label': 'Save this item' }));
    renderItemBar();
  }
}

function renderMainBody() {
  const main = $('main');
  if (sel.tab === 'game') return main.replaceChildren(...gameForm().filter(Boolean));
  if (sel.tab === 'flow') return main.replaceChildren(...flowView());
  if (sel.tab === 'actors' && story.actors[sel.id]) return main.replaceChildren(...actorForm(sel.id).filter(Boolean));
  if (sel.tab === 'events' && story.events[sel.id]) return main.replaceChildren(...eventForm(sel.id).filter(Boolean));
  if (sel.tab === 'verbs' && story.verbs[sel.id]) return main.replaceChildren(...verbForm(sel.id).filter(Boolean));
  if (sel.tab === 'walkthroughs' && story.walkthroughs[sel.id]) return main.replaceChildren(...walkthroughForm(sel.id).filter(Boolean));
  if (sel.tab === 'locations') return main.replaceChildren(...locationsMain().filter(Boolean));
  if (sel.tab === 'objects' && story.objects[sel.id]) return main.replaceChildren(...objectForm(sel.id).filter(Boolean));
  if (sel.tab === 'objects') {
    return main.replaceChildren(h('div', { class: 'empty-state' },
      h('h2', {}, 'Objects'),
      h('p', {}, 'Objects are the things in the game: furniture, items, keys, traps. Choose one on the left, or create a new one. Doors and passages are under Locations.')));
  }
  const [title, text] = {
    actors: ['Actors', 'Actors are the people and groups in the game. Choose one on the left, or create a new one.'],
    verbs: ['Verbs', "The game's own commands, like PULL LEVER or PRAY, on top of the built-in ones (take, open, talk to...). Each has the patterns players type, a reply, and rules for what else happens. Choose one on the left, or create a new one."],
    walkthroughs: ['Walkthroughs', "Playthroughs that are replayed to check the game still works: each step is a command, with text its reply must or mustn't contain. Press Play, play a while, then make one with + New walkthrough and \"Add my last playthrough\". Run all checks them; npm test and Publish run them too."],
  }[sel.tab] ?? ['Events', 'Events make things happen when conditions are met: at a certain turn, after a conversation, when the player goes somewhere. Choose one on the left, or create a new one.'];
  main.replaceChildren(h('div', { class: 'empty-state' }, h('h2', {}, title), h('p', {}, text)));
}

// ---- actors -------------------------------------------------------------------

function actorForm(id) {
  const a = story.actors[id];
  const set = (key, opts) => (v) => { a[key] = v; changed(opts); };
  a.place ??= null;

  const mapSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  mapSvg.classList.add('map', 'place-map');
  const spotText = h('p', { class: 'hint' });
  const drawPlaceMap = () => {
    const objs = world();
    const room = objs[a.place?.room];
    if (!room?.map) {
      mapSvg.replaceChildren();
      mapSvg.setAttribute('viewBox', '0 0 100 8');
      spotText.textContent = a.place?.room ? 'This room has no map.' : 'Choose a room to place them on its map.';
      return;
    }
    const shapes = [...room.map.shapes];
    for (const [otherId, other] of Object.entries(story.actors)) {
      if (other.place?.room === a.place.room && Number.isFinite(other.place.x)) {
        shapes.push({ type: other.marker ?? 'group', obj: otherId, x: other.place.x, y: other.place.y, faint: otherId !== id });
      }
    }
    const names = Object.fromEntries(Object.entries(objs).map(([k, o]) => [k, o.name]));
    renderMap(mapSvg, h('p'), {
      map: { w: room.map.w, h: room.map.h, shapes },
      near: id,
      isOpen: (x) => !!objs[x]?.open,
      name: (x) => names[x] ?? x,
      stand: null,
    }, () => {});
    spotText.textContent = Number.isFinite(a.place.x)
      ? `Standing at ${a.place.x}, ${a.place.y}. Click the map to move them.`
      : 'Click the map to choose where they stand.';
  };
  mapSvg.addEventListener('click', (e) => {
    if (!a.place?.room || !world()[a.place.room]?.map) return;
    const pt = mapSvg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const p = pt.matrixTransform(mapSvg.getScreenCTM().inverse());
    a.place.x = Math.round(p.x);
    a.place.y = Math.round(p.y);
    changed();
    drawPlaceMap();
  });

  const roomSelect = select(ctx.rooms(), a.place?.room, (room) => {
    a.place = room ? { room } : null;
    changed();
    drawPlaceMap();
  }, { blank: 'not placed yet' });

  queueMicrotask(drawPlaceMap);

  const conv = a.conversation;
  return [
    h('header', { class: 'form-head' },
      h('h2', {}, a.name || id),
      h('button', { type: 'button', class: 'danger', onclick: () => deleteActor(id) }, 'Delete actor')),
    fold('actor:details', h('h3', {}, 'Details'), h('section', { class: 'form-grid' },
      h('div', { class: 'col' },
        field('Name', textInput(a.name, set('name'), { placeholder: 'how the game refers to them' }), 'Shown in the game, e.g. "the guests by the wine table".'),
        field('Article', select([
          { id: 'the', label: 'the (the guests…)' },
          { id: 'a', label: 'a (a footman)' },
          { id: 'an', label: 'an' },
          { id: 'some', label: 'some' },
          { id: 'none', label: 'none: a proper name' },
        ], a.article ?? 'the', set('article'))),
        field('Words players can use', listInput(a.nouns, set('nouns'), 'group, guests'), 'Nouns, separated by commas.'),
        field('Describing words', listInput(a.adjectives, set('adjectives'), 'wine, older'), 'Adjectives, to tell similar actors apart.'),
        field('Description', textInput(a.description, set('description'), { multiline: true, rows: 4 }), `What the player sees when they examine them. ${answersHint()}`),
        checkbox('Already mentioned in the room description', a.scenery, (v) => { if (v) a.scenery = true; else delete a.scenery; changed(); }),
        h('p', { class: 'hint' }, 'If ticked, the room doesn\'t also list them as "You can also see…".'),
        a.conversation ? null : field('When talked to', textInput(a.talk, set('talk'), { multiline: true, rows: 2 }), 'Their answer when they have no conversation. Leave empty for the default.'),
        field('When following the player', textInput(a.followText, (v) => { if (v) a.followText = v; else delete a.followText; changed({ list: false }); }, { multiline: true, rows: 2, placeholder: '{Person} follows you.' }), 'Shown each time they follow the player somewhere (see the "follow" effect). Use {once}…{/once} to say it only the first time.'),
        idField(id, story.actors, (next) => renameActor(id, next))),
      h('div', { class: 'col' },
        field('Room', roomSelect),
        field('Map marker', select([{ id: 'group', label: 'group' }, { id: 'person', label: 'single person' }], a.marker ?? 'group', (v) => { a.marker = v; changed(); drawPlaceMap(); })),
        mapSvg,
        spotText,
        field('Notes for Claude', textInput(a.notes, set('notes', { list: true }), { multiline: true, plain: true, rows: 3, placeholder: 'e.g. place them near the stairs; they should follow the player after the dance' }), "Anything you'd like me to build or place. I read this when you tell me you've saved.")))),
    h('section', { class: 'conversation' },
      h('header', { class: 'section-head' },
        h('h3', {}, 'Conversation'),
        conv
          ? h('div', { class: 'tools' },
            h('button', { type: 'button', onclick: () => addNode(a) }, '+ Line'),
            h('button', { type: 'button', onclick: () => { layout(conv, true); changed({ graph: true, list: false }); } }, 'Tidy layout'),
            h('button', { type: 'button', onclick: () => select_({ node: null }) }, 'Conversation settings'))
          : h('button', { type: 'button', onclick: () => { a.conversation = { start: 'start', nodes: { start: { say: '', options: [] } } }; changed({ main: true }); select_({ node: 'start' }); } }, 'Add a conversation')),
      conv
        ? h('div', { class: 'graph-wrap', id: 'graph' })
        : h('p', { class: 'muted' }, 'They have no conversation. Examining or approaching them only shows their description.')),
  ];
}

function renderGraph() {
  if (sel.tab === 'locations') return renderAtlas();
  const wrap = $('graph');
  const conv = story.actors[sel.id]?.conversation;
  if (!wrap || !conv) return;
  drawGraph(wrap, conv, {
    selected: sel.node,
    onSelect: (node) => select_({ node }),
    onMoved: () => changed({ list: false }),
  });
}

function addNode(a, from) {
  const conv = a.conversation;
  const id = freshId('line', conv.nodes);
  const origin = from ? conv.nodes[from]?.pos : null;
  conv.nodes[id] = { say: '', options: [], pos: origin ? { x: origin.x + 290, y: origin.y } : undefined };
  changed({ graph: true });
  select_({ node: id });
  return id;
}

function renameActor(oldId, newId) {
  renameKey(story.actors, oldId, newId);
  renameRefs(['actor', 'thing'], oldId, newId);
  accept();
  changed({ main: true });
  select_({ id: newId });
}

function deleteActor(id) {
  const a = story.actors[id];
  const confirmBox = h('div', { class: 'confirm' },
    h('p', {}, `Delete ${a.name || id} and their conversation? Events that mention them will show up under Problems.`),
    h('button', { type: 'button', class: 'danger', onclick: () => { delete story.actors[id]; accept(); changed(); select_({ id: null, node: null }); } }, 'Delete'),
    h('button', { type: 'button', onclick: () => confirmBox.remove() }, 'Keep'));
  $('main').prepend(confirmBox);
}

// ---- conversation inspector --------------------------------------------------

function renderInspector() {
  const panel = $('inspector');
  if (sel.tab === 'locations') return panel.replaceChildren(...locationInspector().filter(Boolean));
  if (sel.tab === 'objects') return panel.replaceChildren(...objectInspector().filter(Boolean));
  if (sel.tab === 'game') return panel.replaceChildren(h('p', { class: 'muted' }, 'Press Play at the top to see the start screen. Start a new game there (RESTART) to see changes to it.'));
  const a = sel.tab === 'actors' && story.actors[sel.id];
  const conv = a?.conversation;
  if (!conv) {
    panel.replaceChildren(h('p', { class: 'muted' }, { actors: 'Select a line in the conversation to edit it.', verbs: 'Verbs are edited in the middle panel. To make one thing react to a verb, add a reaction on that object.', walkthroughs: 'Play the game (Play, at the top), then make a walkthrough from it: + New walkthrough, then "Add my last playthrough". Run it after changing the story to check that path still works. npm test and Publish run them all.' }[sel.tab] ?? 'Events are edited in the middle panel.'));
    return;
  }
  if (!sel.node || !conv.nodes[sel.node]) return panel.replaceChildren(...conversationSettings(a, conv).filter(Boolean));
  panel.replaceChildren(...nodeEditor(a, conv, sel.node).filter(Boolean));
}

function conversationSettings(a, conv) {
  const lines = Object.keys(conv.nodes).map((id) => ({ id, label: id }));
  return [
    h('h3', {}, 'Conversation settings'),
    field('Starts with', select(lines, conv.start, (v) => { conv.start = v; changed({ graph: true }); })),
    field('When rejoining, start with', select(lines, conv.again, (v) => { if (v) conv.again = v; else delete conv.again; changed({ graph: true }); }, { blank: 'the same line' })),
    field('When the player leaves', textInput(conv.leave, (v) => { conv.leave = v; changed({ list: false }); }, { multiline: true, rows: 2, placeholder: 'You excuse yourself from …' }), 'Leave empty for the default.'),
    h('p', { class: 'hint' }, 'Every line automatically offers "Leave the conversation." as its last reply.'),
    h('button', { type: 'button', class: 'danger', onclick: () => { delete a.conversation; changed({ main: true }); renderInspector(); } }, 'Remove conversation'),
  ];
}

function nodeEditor(a, conv, nodeId) {
  const node = conv.nodes[nodeId];
  node.options ??= [];
  const lines = () => Object.keys(conv.nodes).map((id) => ({ id, label: id }));

  const renameNode = (next) => {
    renameKey(conv.nodes, nodeId, next);
    for (const n of Object.values(conv.nodes)) for (const o of n.options ?? []) if (o.go === nodeId) o.go = next;
    if (conv.start === nodeId) conv.start = next;
    if (conv.again === nodeId) conv.again = next;
    const actorId = sel.id;
    const walk = (v) => {
      if (Array.isArray(v)) return v.forEach(walk);
      if (!v || typeof v !== 'object') return;
      if (v.type === 'seenNode' && v.actor === actorId && v.node === nodeId) v.node = next;
      Object.values(v).forEach(walk);
    };
    walk(story);
    sel.node = next;
    changed({ graph: true, inspector: true });
  };

  const optionEditor = (o, i) => {
    o.when ??= [];
    o.effects ??= [];
    const goSelect = select(
      [...lines(), { id: '__new', label: '+ a new line…' }],
      o.go,
      (v) => {
        if (v === '__new') {
          const created = freshId('line', conv.nodes);
          conv.nodes[created] = { say: '', options: [], pos: node.pos ? { x: node.pos.x + 290, y: node.pos.y + i * 60 } : undefined };
          o.go = created;
        } else if (v) o.go = v;
        else delete o.go;
        if (o.go) delete o.end;
        changed({ graph: true, inspector: true });
      },
      { blank: 'stays on this line' });
    const move = (d) => {
      const j = i + d;
      if (j < 0 || j >= node.options.length) return;
      [node.options[i], node.options[j]] = [node.options[j], node.options[i]];
      changed({ graph: true, inspector: true });
    };
    return fold(`reply:${sel.id}:${nodeId}:${i}`, [
      h('strong', {}, `Reply ${i + 1}`),
      h('span', { class: 'fold-peek' }, o.text || ''),
      h('button', { type: 'button', class: 'icon', title: 'Move up', 'aria-label': 'Move up', onclick: () => move(-1) }, '↑'),
      h('button', { type: 'button', class: 'icon', title: 'Move down', 'aria-label': 'Move down', onclick: () => move(1) }, '↓'),
      h('button', { type: 'button', class: 'icon', title: 'Delete reply', 'aria-label': 'Delete reply', onclick: () => { node.options.splice(i, 1); changed({ graph: true, inspector: true }); } }, '×'),
    ], h('div', { class: 'fold-body' },
      field('Reply text', textInput(o.text, (v) => { o.text = v; changed({ graph: true, list: false }); }, { multiline: true, rows: 2 })),
      o.end ? null : field('Leads to', goSelect),
      checkbox('Ends the conversation', o.end, (v) => { if (v) { o.end = true; delete o.go; } else delete o.end; changed({ graph: true, inspector: true }); }),
      h('div', { class: 'sub' }, h('h4', {}, 'Only offer this reply when'),
        ruleEditor({ list: o.when, schema: CONDITIONS, ctx, onChange: () => changed({ graph: true, list: false }), addLabel: '+ add a condition' })),
      h('div', { class: 'sub' }, h('h4', {}, 'When chosen, also'),
        ruleEditor({ list: o.effects, schema: EFFECTS, ctx, onChange: () => changed({ graph: true, list: false }), addLabel: '+ add an effect' }))), { cls: 'option' });
  };

  node.effects ??= [];
  return [
    h('div', { class: 'inspector-head' },
      h('h3', {}, `Line: ${nodeId}`),
      h('button', { type: 'button', onclick: () => select_({ node: null }) }, 'Close')),
    idField(nodeId, conv.nodes, renameNode),
    h('div', { class: 'row' },
      conv.start === nodeId
        ? h('span', { class: 'badge start' }, 'starting line')
        : h('button', { type: 'button', onclick: () => { conv.start = nodeId; changed({ graph: true, inspector: true }); } }, 'Make this the starting line'),
      h('button', { type: 'button', onclick: () => { if (conv.again === nodeId) delete conv.again; else conv.again = nodeId; changed({ graph: true, inspector: true }); } },
        conv.again === nodeId ? 'Stop using when rejoining' : 'Use when rejoining')),
    field('What they say', textInput(node.say, (v) => { node.say = v; changed({ graph: true, list: false }); }, { multiline: true, rows: 4 }), answersHint()),
    h('div', { class: 'sub' }, h('h4', {}, 'When this line is reached, also'),
      ruleEditor({ list: node.effects, schema: EFFECTS, ctx, onChange: () => changed({ graph: true, list: false }), addLabel: '+ add an effect' })),
    h('h3', {}, 'Replies'),
    ...node.options.map(optionEditor),
    h('button', { type: 'button', onclick: () => { node.options.push({ text: '' }); changed({ graph: true, inspector: true }); } }, '+ Add reply'),
    conv.start === nodeId ? null : h('button', {
      type: 'button',
      class: 'danger',
      onclick: () => { delete conv.nodes[nodeId]; if (conv.again === nodeId) delete conv.again; sel.node = null; changed({ graph: true, inspector: true }); },
    }, 'Delete this line'),
  ];
}

// ---- events -------------------------------------------------------------------

function eventForm(id) {
  const ev = story.events[id];
  ev.when ??= [];
  ev.effects ??= [];
  const triggeredBy = [];
  const walk = (v, where) => {
    if (Array.isArray(v)) return v.forEach((x) => walk(x, where));
    if (!v || typeof v !== 'object') return;
    if (v.type === 'fireEvent' && v.event === id) triggeredBy.push(where);
    Object.values(v).forEach((x) => walk(x, where));
  };
  for (const [aid, a] of Object.entries(story.actors)) walk(a.conversation, `${a.name || aid}'s conversation`);
  for (const [oid, o] of Object.entries(story.objects)) walk(o.reactions, `${o.name || oid}'s reactions`);
  for (const [eid, e] of Object.entries(story.events)) if (eid !== id) walk(e.effects, `event ${e.name || eid}`);

  return [
    h('header', { class: 'form-head' },
      h('h2', {}, ev.name || id),
      h('button', {
        type: 'button', class: 'danger',
        onclick: () => { delete story.events[id]; accept(); changed(); select_({ id: null }); },
      }, 'Delete event')),
    h('section', { class: 'form-grid' },
      h('div', { class: 'col' },
        field('Name', textInput(ev.name, (v) => { ev.name = v; changed(); }, { placeholder: 'a label for you' })),
        idField(id, story.events, (next) => { renameKey(story.events, id, next); renameRefs(['event'], id, next); accept(); changed({ main: true }); select_({ id: next }); })),
      h('div', { class: 'col' },
        checkbox('Happens only when triggered by a reply, reaction or another event', !!ev.onlyTriggered, (v) => { if (v) ev.onlyTriggered = true; else delete ev.onlyTriggered; changed({ main: true }); }),
        ev.onlyTriggered ? null : checkbox('Happens only once', ev.once !== false, (v) => { if (v) delete ev.once; else ev.once = false; changed(); }),
        h('p', { class: 'hint' }, ev.onlyTriggered
          ? 'It happens each time something triggers it, without checking conditions.'
          : 'Events are checked at the end of every turn. A repeating event happens on every turn its conditions are true.'),
        field('Notes for Claude', textInput(ev.notes, (v) => { ev.notes = v; changed({ list: false }); }, { multiline: true, plain: true, rows: 3 })))),
    ev.onlyTriggered && !ev.when.length ? null : h('section', { class: 'rules-section' },
      h('h3', {}, 'When all of these are true'),
      ev.onlyTriggered ? h('p', { class: 'hint error' }, "These aren't checked while it happens only when triggered.") : null,
      ev.when.length || ev.onlyTriggered ? null : h('p', { class: 'hint' }, 'No conditions: it happens at the end of the first turn, unless another event or a reply triggers it first.'),
      ruleEditor({ list: ev.when, schema: CONDITIONS, ctx, onChange: () => changed({ list: false }), addLabel: '+ add a condition' })),
    h('section', { class: 'rules-section' },
      h('h3', {}, 'Then'),
      ruleEditor({ list: ev.effects, schema: EFFECTS, ctx, onChange: () => changed({ list: false }), addLabel: '+ add an effect' })),
    triggeredBy.length ? h('p', { class: 'hint' }, `${ev.onlyTriggered ? 'Triggered' : 'Also triggered'} by: ${[...new Set(triggeredBy)].join(', ')}.`) : null,
  ];
}

// ---- verbs --------------------------------------------------------------------

function verbForm(id) {
  const v = story.verbs[id];
  v.patterns ??= [];
  v.rules ??= [];
  const usedBy = Object.entries(story.objects)
    .filter(([, o]) => (o.reactions ?? []).some((r) => r.action === VERB + id))
    .map(([oid, o]) => o.name || oid);
  const errors = h('div', {});
  const showErrors = () => errors.replaceChildren(...v.patterns.map((p) => [p, verbPattern(p).error]).filter(([, e]) => e)
    .map(([p, e]) => h('p', { class: 'hint error' }, `"${p}" ${e}.`)));
  showErrors();
  const rename = (next) => {
    renameKey(story.verbs, id, next);
    for (const o of Object.values(story.objects)) for (const r of o.reactions ?? []) if (r.action === VERB + id) r.action = VERB + next;
    accept();
    changed({ main: true });
    select_({ id: next });
  };
  return [
    h('header', { class: 'form-head' },
      h('h2', {}, v.name || id),
      h('button', {
        type: 'button', class: 'danger',
        onclick: () => { delete story.verbs[id]; accept(); changed(); select_({ id: null }); },
      }, 'Delete verb')),
    h('section', { class: 'form-grid' },
      h('div', { class: 'col' },
        field('Name', textInput(v.name, (x) => { v.name = x; changed(); }, { placeholder: 'a label for you' })),
        idField(id, story.verbs, rename),
        field('What the player types', textInput(v.patterns.join('\n'), (x) => {
          v.patterns = x.split('\n').map((p) => p.trim()).filter(Boolean);
          showErrors();
          changed();
        }, { multiline: true, plain: true, rows: 4, placeholder: 'one pattern per line' }),
        'One way of saying it per line. [thing] is something here; [carried] is something the player holds. A second slot is "the other", e.g. a pattern with [thing] then [carried]. Your verbs win over built-in ones that match the same words.'),
        errors),
      h('div', { class: 'col' },
        field('Reply', textInput(v.reply, (x) => { v.reply = x; changed({ list: false }); }, { multiline: true, rows: 3, placeholder: 'Nothing happens.' }),
          `What the game says when nothing else takes over. {thing} and {other} are filled in ({Thing} to start a sentence). ${answersHint()}`),
        checkbox('Works on things only seen from here (across the way)', !!v.distant, (x) => { if (x) v.distant = true; else delete v.distant; changed({ list: false }); }),
        field('Notes for Claude', textInput(v.notes, (x) => { v.notes = x; changed({ list: false }); }, { multiline: true, plain: true, rows: 3 })),
        h('p', { class: 'hint' }, usedBy.length
          ? `Objects with a reaction to it: ${usedBy.join(', ')}. Their reactions happen first.`
          : 'To make a particular object respond, add a reaction to that object and choose this verb.'))),
    h('section', { class: 'rules-section' },
      h('h3', {}, 'Rules'),
      h('p', { class: 'hint' }, 'Things that happen whenever the verb is used and the conditions are true, wherever the player is, after any reaction of the thing itself. Useful for verbs without a thing, like praying in a particular place.'),
      ...v.rules.map((r, i) => verbRuleCard(v, r, i)),
      h('button', { type: 'button', class: 'add-rule', onclick: () => { v.rules.push({ when: [], effects: [] }); changed({ main: true, list: false }); } }, '+ add a rule')),
  ];
}

function verbRuleCard(v, r, i) {
  r.when ??= [];
  r.effects ??= [];
  const update = (opts = { list: false }) => changed(opts);
  return fold(`verbrule:${sel.id}:${i}`, [
    h('strong', {}, `Rule ${i + 1}`),
    h('button', {
      type: 'button', class: 'icon', title: 'Delete rule', 'aria-label': 'Delete rule',
      onclick: () => { v.rules.splice(i, 1); changed({ main: true, list: false }); },
    }, '×'),
  ], h('div', { class: 'fold-body' },
    h('div', { class: 'sub' }, h('h4', {}, 'Only if'),
      ruleEditor({ list: r.when, schema: CONDITIONS, ctx, onChange: update, addLabel: '+ add a condition' })),
    h('div', { class: 'sub' }, h('h4', {}, 'Then'),
      ruleEditor({ list: r.effects, schema: EFFECTS, ctx, onChange: update, addLabel: '+ add an effect' })),
    h('div', { class: 'row' },
      checkbox('Instead of the reply', r.instead, (x) => { if (x) r.instead = true; else delete r.instead; update(); }),
      checkbox('Only the first time', r.once, (x) => { if (x) r.once = true; else delete r.once; update(); }))), { cls: 'option' });
}

// ---- find and replace -----------------------------------------------------------
//
// Searches every bit of text in the story (descriptions, dialogue, effects, ids used as
// values). Results replace the sidebar list until the box is cleared.

function findMatches(text) {
  const needle = text.toLowerCase();
  const found = [];
  const walk = (x, path) => {
    if (typeof x === 'string') {
      const at = x.toLowerCase().indexOf(needle);
      if (at >= 0) found.push({ path, snippet: `${at > 30 ? '…' : ''}${x.slice(Math.max(0, at - 30), at + needle.length + 40)}${x.length > at + needle.length + 40 ? '…' : ''}` });
      return;
    }
    if (Array.isArray(x)) return x.forEach((y, i) => walk(y, [...path, i]));
    if (x && typeof x === 'object') for (const [k, y] of Object.entries(x)) if (k !== 'layout' && k !== 'pos') walk(y, [...path, k]);
  };
  walk(story, []);
  // Ids themselves (object, actor, event... keys).
  for (const coll of ['objects', 'actors', 'events', 'verbs', 'locations', 'passages', 'walkthroughs']) {
    for (const id of Object.keys(story[coll] ?? {})) if (id.toLowerCase().includes(needle)) found.push({ path: [coll, id], snippet: `id: ${id}` });
  }
  return found;
}

// Where a path into the story is edited: { tab, id }.
function placeOf(path) {
  const [coll, id] = path;
  if (coll === 'passages') return { tab: 'locations', id: story.passages[id]?.a?.room ?? null, passage: id };
  if (coll === 'game') return { tab: 'game', id: null };
  return { tab: { areas: 'locations', areaOf: 'locations' }[coll] ?? coll, id };
}

function renderFind() {
  const text = $('find').value.trim();
  if (text.length < 2) return renderList();
  const found = findMatches(text);
  const replaceBox = h('input', { type: 'text', placeholder: 'replace with…', class: 'find-replace' });
  $('list').replaceChildren(
    h('div', { class: 'find-head' },
      h('strong', {}, `${found.length} found`),
      h('button', { type: 'button', onclick: () => { $('find').value = ''; renderList(); } }, 'Clear')),
    h('div', { class: 'row' }, replaceBox, h('button', { type: 'button', onclick: () => replaceAll(text, replaceBox.value) }, 'Replace all')),
    h('p', { class: 'hint' }, 'Replaces in text only (not ids). Undo takes it back.'),
    ...found.slice(0, 200).map((f) => h('button', {
      type: 'button', class: 'item find-hit',
      onclick: () => { const p = placeOf(f.path); select_({ tab: p.tab, id: p.id, node: null, ...(p.passage && { passage: p.passage }) }); renderFind(); },
    }, h('span', { class: 'item-name' }, whereIs(story, f.path)), h('span', { class: 'item-meta' }, f.snippet))));
}

// Keys whose values are ids, settings or names of variables, never text to replace.
const ID_KEYS = new Set(['type', 'op', 'thing', 'item', 'actor', 'event', 'room', 'where', 'to', 'go', 'start', 'again', 'node', 'key', 'becomes', 'in', 'door', 'existing', 'action', 'dir', 'also', 'wall', 'marker', 'kind', 'state', 'article', 'style', 'wallSide', 'arriveNear', 'near', 'overlooks', 'alsoIn', 'areaOf', 'parent', 'from', 'var', 'value', 'answers', 'nouns', 'adjectives', 'patterns', 'command']);

function replaceAll(text, replacement) {
  if (!text) return;
  let count = 0;
  const lower = text.toLowerCase();
  const walk = (x) => {
    if (Array.isArray(x)) return x.forEach((y, i) => { if (typeof y === 'string') x[i] = swap(y); else walk(y); });
    if (!x || typeof x !== 'object') return;
    for (const [k, y] of Object.entries(x)) {
      if (k === 'layout' || ID_KEYS.has(k) || (k === 'name' && ['var', 'setVar', 'addVar'].includes(x.type))) continue;
      if (typeof y === 'string') x[k] = swap(y);
      else walk(y);
    }
  };
  const swap = (s) => {
    if (!s.toLowerCase().includes(lower)) return s;
    const re = new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    return s.replace(re, () => { count++; return replacement; });
  };
  walk(story);
  changed({ main: true, list: false, inspector: true });
  setStatus(`Replaced ${count} time${count === 1 ? '' : 's'}. Undo takes it back.`, 'dirty');
  renderFind();
}

$('find').addEventListener('input', renderFind);

// ---- story flow ---------------------------------------------------------------

function flowView() {
  const { vars, events } = storyFlow(story);
  const list = (items) => (items.length ? h('ul', { class: 'flow-list' }, items.map((x) => h('li', {}, x))) : h('span', { class: 'badge warn' }, 'nothing'));
  const varRows = Object.entries(vars).sort(([a], [b]) => a.localeCompare(b)).map(([name, x]) => h('tr', { class: !x.sets.length || !x.checks.length ? 'flow-warn' : '' },
    h('td', {}, h('code', {}, name), !x.sets.length ? h('p', { class: 'hint error' }, 'Checked, but nothing sets it.') : !x.checks.length ? h('p', { class: 'hint' }, 'Set, but nothing checks it.') : null),
    h('td', {}, list(x.sets)),
    h('td', {}, list(x.checks))));
  const eventRows = Object.entries(events).map(([id, x]) => {
    const ev = story.events[id];
    const own = !ev.onlyTriggered;
    return h('tr', { class: ev.onlyTriggered && !x.by.length ? 'flow-warn' : '' },
      h('td', {}, h('a', { href: '#', onclick: (e) => { e.preventDefault(); select_({ tab: 'events', id, node: null }); } }, ev.name || id)),
      h('td', {}, own ? h('span', { class: 'badge' }, 'checks its own conditions each turn') : null, x.by.length ? list(x.by) : own ? null : h('span', { class: 'badge warn' }, 'nothing triggers it')));
  });
  return [
    h('header', { class: 'form-head' }, h('h2', {}, 'Story flow')),
    h('p', { class: 'hint' }, 'Where each variable is set (effects, replies, the start screen) and where it is checked (conditions, and {if …} or {name} in any text). A variable that is checked but never set is usually a mistake.'),
    h('section', { class: 'rules-section' }, h('h3', {}, 'Variables'),
      Object.keys(vars).length ? h('table', { class: 'flow' }, h('tr', {}, h('th', {}, 'Variable'), h('th', {}, 'Set by'), h('th', {}, 'Checked by')), ...varRows) : h('p', { class: 'muted' }, 'No variables yet.')),
    h('section', { class: 'rules-section' }, h('h3', {}, 'Events'),
      eventRows.length ? h('table', { class: 'flow' }, h('tr', {}, h('th', {}, 'Event'), h('th', {}, 'Happens')), ...eventRows) : h('p', { class: 'muted' }, 'No events yet.')),
  ];
}

// ---- walkthroughs -------------------------------------------------------------
//
// The game's own tests (engine/walkthrough.js): commands to replay, with text each reply
// must or mustn't contain. Results are kept per walkthrough until the story changes.

const walkResults = {};
const runWalk = (id) => { walkResults[id] = { ...runWalkthrough(assembled(), id), at: JSON.stringify(story) }; return walkResults[id]; };
const lastRun = (id) => (walkResults[id]?.at === JSON.stringify(story) ? walkResults[id] : null);

function renderWalkthroughList() {
  const items = Object.entries(story.walkthroughs);
  const list = $('list');
  const runAll = h('button', { type: 'button', onclick: () => { for (const id of Object.keys(story.walkthroughs)) runWalk(id); renderList(); renderMain(); } }, 'Run all');
  if (!items.length) return list.replaceChildren(h('p', { class: 'muted' }, 'No walkthroughs yet.'));
  list.replaceChildren(runAll, ...items.map(([id, w]) => {
    const r = lastRun(id);
    return h('button', { type: 'button', class: `item${sel.id === id ? ' selected' : ''}`, onclick: () => select_({ id, node: null }) },
      h('span', { class: 'item-name' }, w.name || id),
      h('span', { class: 'item-meta' }, id,
        w.from && h('span', { class: 'badge' }, `after ${story.walkthroughs[w.from]?.name || w.from}`),
        r && h('span', { class: `badge${r.ok ? '' : ' warn'}` }, r.ok ? 'passes' : 'fails')));
  }));
}

function walkthroughForm(id) {
  const w = story.walkthroughs[id];
  w.steps ??= [];
  const result = lastRun(id);
  const others = Object.entries(story.walkthroughs).filter(([x]) => x !== id).map(([x, o]) => ({ id: x, label: o.name || x }));
  const lines = (list) => (list ?? []).join('\n');
  const toList = (text) => text.split('\n').map((t) => t.trim()).filter(Boolean);
  const edit = (fn) => (v) => { fn(v); changed({ list: false }); };
  const rename = (next) => {
    renameKey(story.walkthroughs, id, next);
    for (const o of Object.values(story.walkthroughs)) if (o.from === id) o.from = next;
    accept();
    changed({ main: true });
    select_({ id: next });
  };
  const importPlaythrough = () => {
    const p = siteStorage.get('last-playthrough');
    if (!p?.commands?.length) {
      window.alert('No playthrough found. Press Play, start a game and type some commands, then try again (in this browser).');
      return;
    }
    if (p.start) {
      window.alert('The last playthrough started from a location ("Play from here"), not the start of the game, so it can\'t be replayed as a walkthrough. Press Play and play from the beginning.');
      return;
    }
    if (p.title !== story.game?.title && !window.confirm(`The last playthrough was of "${p.title}", not this story. Add it anyway?`)) return;
    if (!Object.keys(w.answers ?? {}).length && Object.keys(p.answers ?? {}).length) w.answers = { ...p.answers };
    w.steps.push(...p.commands.map((command) => ({ command })));
    changed({ main: true });
  };
  // Re-record: the last playthrough's commands replace these steps (keeping no checks).
  const rerecord = () => {
    if (w.steps.length && !window.confirm('Replace all the steps, and their checks, with your last playthrough?')) return;
    w.steps = [];
    importPlaythrough();
  };
  const ownOffset = result ? result.steps.filter((s) => s.inherited).length : 0;
  const stepRow = (s, i) => {
    const r = result?.steps[ownOffset + i];
    return h('div', { class: `walk-step${r?.failures.length ? ' failed' : ''}` },
      h('div', { class: 'walk-step-head' },
        h('span', { class: 'walk-num' }, String(i + 1)),
        textInput(s.command, edit((v) => { s.command = v; }), { placeholder: 'a command, e.g. look', plain: true }),
        h('button', { type: 'button', class: 'icon', title: 'Remove step', 'aria-label': 'Remove step', onclick: () => { w.steps.splice(i, 1); changed({ main: true, list: false }); } }, '×')),
      h('div', { class: 'row' },
        field('Reply must say', textInput(lines(s.expect), edit((v) => { s.expect = toList(v); if (!s.expect.length) delete s.expect; }), { multiline: true, plain: true, rows: 2, placeholder: 'one bit of text per line' })),
        field("Reply mustn't say", textInput(lines(s.reject), edit((v) => { s.reject = toList(v); if (!s.reject.length) delete s.reject; }), { multiline: true, plain: true, rows: 2 }))),
      fold(`walkcheck:${id}:${i}`, [h('span', { class: 'label' }, 'Afterwards, these must be true'), s.check?.length ? h('span', { class: 'group-count' }, String(s.check.length)) : null],
        (() => {
          const checks = s.check ?? [];
          return ruleEditor({ list: checks, schema: CONDITIONS, ctx, onChange: () => { if (checks.length) s.check = checks; else delete s.check; changed({ list: false }); }, addLabel: '+ add a check (a variable, where something is...)' });
        })(), { open: !!s.check?.length }),
      r ? h('div', { class: 'walk-output' },
        r.failures.map((f) => h('p', { class: 'hint error' }, `The reply ${f}.`)),
        h('pre', {}, r.output || '(no reply)'),
        r.output ? h('button', { type: 'button', onclick: () => { (s.expect ??= []).push(r.output.split('\n').find((x) => x.trim()).trim()); changed({ main: true, list: false }); } }, '+ Must say its first line') : null) : null);
  };
  return [
    h('header', { class: 'form-head' },
      h('h2', {}, w.name || id),
      h('button', { type: 'button', class: 'primary', onclick: () => { runWalk(id); renderList(); renderMain(); } }, 'Run'),
      h('button', { type: 'button', class: 'danger', onclick: () => { delete story.walkthroughs[id]; accept(); changed(); select_({ id: null }); } }, 'Delete walkthrough')),
    h('section', { class: 'form-grid' },
      h('div', { class: 'col' },
        field('Name', textInput(w.name, edit((v) => { w.name = v; }), { placeholder: 'e.g. getting past the gate' })),
        idField(id, story.walkthroughs, rename),
        field('Starts after', select(others, w.from ?? '', (v) => { if (v) w.from = v; else delete w.from; changed({ main: true }); }, { blank: 'the start of the game' }),
          "Replays that walkthrough's commands first (without checking them), so several endings can share an opening.")),
      h('div', { class: 'col' },
        h('div', { class: 'field' },
          h('span', { class: 'label' }, 'Start-screen answers'),
          ...(story.game.questions ?? []).map((q) => field(q.label || q.var, textInput(w.answers?.[q.var] ?? '', edit((v) => {
            w.answers ??= {};
            if (v.trim()) w.answers[q.var] = v.trim(); else delete w.answers[q.var];
            if (!Object.keys(w.answers).length) delete w.answers;
          }), { placeholder: 'Test' })))),
        h('p', { class: 'hint' }, 'npm test and Publish replay every walkthrough, and stop if a reply no longer says what it must.'))),
    result ? h('p', { class: result.ok ? 'hint' : 'hint error' }, result.error ? `Couldn't run: ${result.error}` : result.ok ? 'Passed.' : `Failed: ${result.steps.filter((s) => s.failures.length).length} step(s) didn't reply as expected.`) : null,
    result?.start ? h('details', { class: 'fold' }, h('summary', {}, 'Start of the game'), h('pre', { class: 'walk-start' }, result.start)) : null,
    h('section', { class: 'rules-section' },
      h('h3', {}, 'Steps'),
      w.steps.length ? null : h('p', { class: 'hint' }, 'Add commands one by one, or play the game and bring that playthrough in.'),
      ...w.steps.map(stepRow),
      h('div', { class: 'row' },
        h('button', { type: 'button', class: 'add-rule', onclick: () => { w.steps.push({ command: '' }); changed({ main: true, list: false }); } }, '+ add a step'),
        h('button', { type: 'button', onclick: importPlaythrough }, 'Add my last playthrough'),
        w.steps.length ? h('button', { type: 'button', onclick: rerecord }, 'Re-record from my last playthrough') : null)),
  ];
}

// ---- locations, doors and passages -------------------------------------------

const passagesTouching = (room) => Object.entries(story.passages).filter(([, p]) => p.a?.room === room || p.b?.room === room);

function renderLocationList() {
  const objs = world();
  const rooms = Object.entries(objs).filter(([, o]) => o.kind === 'room');
  const roomButton = ([id, o]) => {
    const loose = passagesTouching(id).some(([, p]) => !p.b?.room);
    return h('button', {
      type: 'button',
      class: `item${sel.id === id ? ' selected' : ''}`,
      onclick: () => select_({ id, passage: null }),
    },
    h('span', { class: 'item-name' }, o.title ?? o.name),
    h('span', { class: 'item-meta' },
      id,
      id in story.locations ? null : h('span', { class: 'badge' }, 'in code'),
      loose ? h('span', { class: 'badge warn' }, 'not connected') : null,
      story.locations[id]?.notes ? h('span', { class: 'badge' }, 'notes') : null));
  };
  const branch = (aid) => [
    ...childAreas(aid).map(([sid, a]) => fold(`list:locations:area:${sid}`, [
      h('button', { type: 'button', class: `area-name${sel.id === sid ? ' selected' : ''}`, onclick: () => select_({ id: sid, passage: null }) }, a.name || sid),
      h('span', { class: 'group-count' }, String(rooms.filter(([id]) => isWithin(areaOfRoom(id), sid)).length)),
    ], h('div', { class: 'list' }, branch(sid)), { cls: 'group area' })),
    ...rooms.filter(([id]) => areaOfRoom(id) === aid).map(roomButton),
  ];
  $('list').replaceChildren(...branch(''));
}

function renderAtlas() {
  const wrap = $('atlas');
  if (!wrap) return;
  drawAtlas(wrap, world(), story, {
    selected: sel.id,
    start: baseObjects.player?.in,
    onSelect: (id) => select_({ id, passage: null }),
    onMoved: () => changed({ list: false }),
  });
}

// ---- areas: nested groups of locations, for organising the editor only ----------

// The area a room is filed under ('' for none, or if its area was deleted).
const areaOfRoom = (room) => (story.areas[story.areaOf[room]] ? story.areaOf[room] : '');
const parentOf = (aid) => (story.areas[story.areas[aid]?.parent] ? story.areas[aid].parent : '');
const childAreas = (aid) => Object.entries(story.areas).filter(([sid]) => parentOf(sid) === aid);

// Whether area `aid` is `ancestor` or inside it.
function isWithin(aid, ancestor) {
  for (let x = aid, i = 0; x && i < 50; x = parentOf(x), i++) if (x === ancestor) return true;
  return false;
}

function areaPath(aid) {
  const names = [];
  for (let x = aid, i = 0; x && i < 50; x = parentOf(x), i++) names.unshift(story.areas[x].name || x);
  return names.join(' › ');
}

// Areas to choose from, leaving out `except` and everything inside it.
const areaChoices = (except) => Object.keys(story.areas)
  .filter((aid) => !except || !isWithin(aid, except))
  .map((aid) => ({ id: aid, label: areaPath(aid) }))
  .sort((x, y) => x.label.localeCompare(y.label));

// The area to put something new in: the selected area, or the selected location's.
const currentArea = () => (story.areas[sel.id] ? sel.id : areaOfRoom(sel.id));

function addArea() {
  settle(() => {
    const id = freshId('area', { ...world(), ...story.areas });
    story.areas[id] = { name: '', parent: sel.tab === 'locations' ? currentArea() : '' };
    rememberFold(`list:locations:area:${id}`, true);
    accept();
    changed();
    select_({ tab: 'locations', id, passage: null });
  });
}

function deleteArea(aid) {
  const up = parentOf(aid);
  for (const [room, a] of Object.entries(story.areaOf)) {
    if (a !== aid) continue;
    if (up) story.areaOf[room] = up;
    else delete story.areaOf[room];
  }
  for (const [sid] of childAreas(aid)) story.areas[sid].parent = up;
  delete story.areas[aid];
  accept();
  changed({ graph: true });
  select_({ id: null, passage: null });
}

function areaForm(aid) {
  const a = story.areas[aid];
  const rooms = ctx.rooms().filter((r) => areaOfRoom(r.id) === aid);
  const subs = childAreas(aid);
  return [
    h('header', { class: 'form-head' },
      h('h2', {}, a.name || aid),
      h('button', { type: 'button', class: 'danger', onclick: () => deleteArea(aid) }, 'Delete area')),
    h('p', { class: 'hint' }, 'Areas group locations in the editor, and can sit inside other areas. They don\'t change the game. Deleting one keeps its locations, moving them up a level.'),
    h('section', { class: 'form-grid' },
      h('div', { class: 'col' },
        field('Name', textInput(a.name, (v) => { a.name = v; changed({ graph: true }); }, { placeholder: 'e.g. ground floor' })),
        field('Inside', select(areaChoices(aid), parentOf(aid), (v) => { a.parent = v; changed({ graph: true }); }, { blank: 'nothing: a top-level area' }))),
      h('div', { class: 'col' },
        h('div', { class: 'field' },
          h('span', { class: 'label' }, 'In this area'),
          subs.length || rooms.length
            ? h('div', { class: 'row' },
              subs.map(([sid, s2]) => h('button', { type: 'button', onclick: () => select_({ id: sid }) }, `${s2.name || sid} (area)`)),
              rooms.map((r) => h('button', { type: 'button', onclick: () => select_({ id: r.id }) }, r.label)))
            : h('p', { class: 'muted' }, 'Nothing yet. Choose this area on a location, or add one here.')),
        h('div', { class: 'row' },
          h('button', { type: 'button', onclick: () => settle(() => addLocation(true)) }, '+ Location here'),
          h('button', { type: 'button', onclick: addArea }, '+ Area inside this one')))),
  ];
}

function addLocation(selectIt) {
  const id = freshId('location', { ...world(), ...story.areas });
  story.locations[id] = { title: '', name: '', nouns: [], adjectives: [], description: '', size: { w: 60, h: 40 }, notes: '' };
  if (currentArea()) story.areaOf[id] = currentArea();
  if (selectIt) {
    accept();
    changed();
    select_({ tab: 'locations', id, passage: null });
  }
  return id;
}

function renameLocation(oldId, newId) {
  renameKey(story.locations, oldId, newId);
  renameRefs(['room', 'to', 'where', 'in'], oldId, newId);
  for (const l of Object.values(story.locations)) l.overlooks = l.overlooks?.map((r) => (r === oldId ? newId : r));
  if (story.layout[oldId]) renameKey(story.layout, oldId, newId);
  if (story.areaOf[oldId]) renameKey(story.areaOf, oldId, newId);
  accept();
  changed({ main: true });
  select_({ id: newId });
}

function deleteLocation(id) {
  const confirmBox = h('div', { class: 'confirm' },
    h('p', {}, `Delete ${roomTitle(id)}? Doors and passages that only it has are deleted, ones shared with another location stay there unconnected, and actors and objects here are taken out of the game.`),
    h('button', {
      type: 'button',
      class: 'danger',
      onclick: () => {
        delete story.locations[id];
        delete story.layout[id];
        delete story.areaOf[id];
        for (const [pid, p] of Object.entries(story.passages)) {
          if (p.b?.room === id) p.b = null;
          else if (p.a?.room === id && p.b?.room) { [p.a, p.b] = [p.b, null]; delete p.oneWay; }
          else if (p.a?.room === id) delete story.passages[pid];
        }
        for (const a of Object.values(story.actors)) if (a.place?.room === id) a.place = null;
        for (const t of Object.values(story.objects)) if (t.in === id) { t.in = ''; delete t.shape; }
        for (const l of Object.values(story.locations)) l.overlooks = l.overlooks?.filter((r) => r !== id);
        accept();
        changed();
        select_({ id: null, passage: null });
      },
    }, 'Delete'),
    h('button', { type: 'button', onclick: () => confirmBox.remove() }, 'Keep'));
  $('main').prepend(confirmBox);
}

// Hand-written doors, stairs and openings in this room that don't lead anywhere yet.
function existingChoices(room) {
  const used = new Set(Object.values(story.passages).map((p) => p.existing).filter(Boolean));
  return Object.entries(baseObjects)
    .filter(([id, o]) => o.in === room && !used.has(id) && !o.leadsTo && (o.openable || o.climb || o.enter))
    .map(([id, o]) => ({ id, label: `${o.name} (${id})` }));
}

function addPassage(room, { kind = 'door', existing } = {}) {
  const id = freshId('passage', { ...story.passages, ...world() });
  const prior = existing && baseObjects[existing];
  // Keep the direction the hand-written exit already uses for this door, if any.
  const dir = prior && Object.entries(baseObjects[room]?.exits ?? {}).find(([, e]) => e.door === existing)?.[0];
  story.passages[id] = {
    kind: prior ? (prior.openable ? 'door' : 'passage') : kind,
    ...(existing && { existing }),
    name: '',
    nouns: [],
    adjectives: [],
    description: '',
    a: { room, ...(dir && { dir }), pos: 50 },
    b: null,
  };
  changed({ main: true, inspector: true });
  select_({ passage: id });
}

function locationsMain() {
  const objs = world();
  const atlas = fold('locations:atlas', [
    h('h3', {}, 'All locations'),
    h('button', { type: 'button', onclick: () => { story.layout = {}; changed({ main: true, list: false }); } }, 'Tidy layout'),
  ], h('section', { class: 'atlas-section' },
    h('div', { class: 'atlas-wrap', id: 'atlas' }),
    h('p', { class: 'hint' }, 'Drag locations to arrange them. Lines are the ways between them, labelled with the direction you leave in. Zoom with the buttons, a trackpad pinch or Ctrl/Cmd + scroll.')));
  // Drawn while folded, the atlas can't measure its boxes, so draw it again on opening.
  atlas.addEventListener('toggle', () => { if (atlas.open) renderAtlas(); });
  if (story.areas[sel.id]) return [atlas, ...areaForm(sel.id)];
  if (!sel.id || objs[sel.id]?.kind !== 'room') {
    return [atlas, h('p', { class: 'muted' }, 'Choose a location on the map or in the list, or create a new one.')];
  }
  return [atlas, ...locationForm(sel.id, objs)];
}

function locationForm(id, objs) {
  const l = story.locations[id];
  const o = objs[id];
  const others = ctx.rooms().filter((r) => r.id !== id);
  const edit = (fn, opts = { list: false }) => (v) => { fn(v); changed(opts); };

  const details = l
    ? fold('location:details', h('h3', {}, 'Details'), h('section', { class: 'form-grid' },
      h('div', { class: 'col' },
        field('Title', textInput(l.title, edit((v) => { l.title = v; }, { graph: true })), 'The heading shown when the player arrives.'),
        field('Called in sentences', textInput(l.name, edit((v) => { l.name = v; }), { placeholder: (l.title || id).toLowerCase() }), 'For example "the long gallery". Leave empty to use the title.'),
        field('Words players can use', listInput(l.nouns, edit((v) => { l.nouns = v; }), 'gallery, room')),
        field('Describing words', listInput(l.adjectives, edit((v) => { l.adjectives = v; }), 'long, upper')),
        field('Description', textInput(l.description, edit((v) => { l.description = v; }), { multiline: true, rows: 5 }), answersHint()),
        idField(id, { ...story.locations, ...story.actors, ...story.passages }, (next) => renameLocation(id, next))),
      h('div', { class: 'col' },
        checkbox('List the ways out after the description', l.listExits !== false, edit((v) => { if (v) delete l.listExits; else l.listExits = false; })),
        h('div', { class: 'field' },
          h('span', { class: 'label' }, 'Can see into'),
          ...others.map((r) => checkbox(r.label, l.overlooks?.includes(r.id), edit((v) => {
            l.overlooks = v ? [...(l.overlooks ?? []), r.id] : (l.overlooks ?? []).filter((x) => x !== r.id);
          }))),
          h('p', { class: 'hint' }, 'The player can examine what is in these places from here, but not touch it.')),
        field('Notes for Claude', textInput(l.notes, edit((v) => { l.notes = v; }, {}), { multiline: true, plain: true, rows: 3, placeholder: 'e.g. add tables like the hall; this should be dark until a lamp is lit' })))))
    : h('p', { class: 'hint' }, 'This location is written in code, so its description and map are changed there. You can still add doors and passages to it, or connect the ones it already has.');

  const choices = existingChoices(id);
  const touching = passagesTouching(id);
  const passages = fold('location:passages', [
    h('h3', {}, 'Doors and passages'),
    h('span', { class: 'group-count' }, String(touching.length)),
    h('div', { class: 'tools' }, PASSAGE_KINDS.map((k) => h('button', { type: 'button', onclick: () => addPassage(id, { kind: k.id }) }, `+ ${cap(k.label)}`))),
  ], h('section', { class: 'passages' },
    choices.length
      ? field('Connect one that is already here', select(choices, '', (v) => { if (v) addPassage(id, { existing: v }); }, { blank: 'choose a door, stairs or opening written in code' }))
      : null,
    touching.length ? touching.map(([pid, p]) => passageCard(pid, p, id, objs)) : h('p', { class: 'muted' }, 'No doors or passages added here yet.')));

  const things = Object.entries(story.objects).filter(([, t]) => t.in === id);
  const here = fold('location:objects', [
    h('h3', {}, 'Objects here'),
    h('span', { class: 'group-count' }, String(things.length)),
    h('button', { type: 'button', onclick: () => addObject(id) }, '+ Object'),
  ], h('section', { class: 'passages' },
    things.length
      ? h('div', { class: 'row' }, things.map(([tid, t]) => h('button', { type: 'button', onclick: () => select_({ tab: 'objects', id: tid }) }, t.name || tid)))
      : h('p', { class: 'muted' }, 'No objects here yet.')));

  return [
    h('header', { class: 'form-head' },
      h('h2', {}, o.title ?? o.name),
      h('button', { type: 'button', onclick: () => play(id), title: 'Play the story from here, unsaved edits included' }, 'Play from here'),
      l ? h('button', { type: 'button', class: 'danger', onclick: () => deleteLocation(id) }, 'Delete location') : h('span', { class: 'badge' }, 'written in code')),
    field('Area', select(areaChoices(), areaOfRoom(id), (v) => {
      if (v) story.areaOf[id] = v;
      else delete story.areaOf[id];
      changed({ graph: true });
    }, { blank: 'none' }), 'Make areas with "+ New area" on the left.'),
    details,
    ...(l ? locationExtras(id, l) : []),
    passages,
    here,
  ];
}

// Unconnected passages in a room that another passage could join up with.
const looseIn = (room, except) => Object.entries(story.passages)
  .filter(([qid, q]) => qid !== except && q.a?.room === room && !q.b?.room && !q.existing);

// Makes `room`'s end of the passage the `a` end, so it can be re-pointed or disconnected
// from either room. One-way passages keep going from `a` to `b`.
function makeHome(p, room) {
  if (p.a?.room === room || !p.b) return;
  [p.a, p.b] = [p.b, p.a];
  delete p.oneWay;
}

// Hand-written rooms that name this passage in an exit or on their map.
const usedInCode = (pid) => Object.values(baseObjects).some((o) =>
  Object.values(o.exits ?? {}).some((e) => e.door === pid) || o.map?.shapes?.some((sh) => sh.obj === pid));

// Point a passage at another location ('' disconnects it). "join:<id>" joins it up with
// an unconnected passage there, making one passage with an end in each room. The one
// hand-written rooms refer to is kept; the other is removed.
function connectPassage(pid, room, target) {
  const p = story.passages[pid];
  makeHome(p, room);
  if (!target) {
    p.b = null;
    delete p.oneWay;
    return;
  }
  if (target.startsWith('join:')) {
    const qid = target.slice(5);
    const q = story.passages[qid];
    const [keepId, dropId] = usedInCode(qid) && !usedInCode(pid) ? [qid, pid] : [pid, qid];
    const keep = story.passages[keepId];
    const drop = story.passages[dropId];
    const { room: there, ...end } = drop.a;
    keep.b = { ...end, room: there };
    for (const key of ['name', 'description']) if (!keep[key] && drop[key]) keep[key] = drop[key];
    if (!keep.nouns?.length && drop.nouns?.length) keep.nouns = drop.nouns;
    if (!keep.adjectives?.length && drop.adjectives?.length) keep.adjectives = drop.adjectives;
    delete keep.blocked;
    delete story.passages[dropId];
    renameRefs(['thing', 'item', 'key'], dropId, keepId);
    if (sel.passage === dropId) sel.passage = keepId;
    return;
  }
  if (target === '__new') target = addLocation(false);
  const keep = p.b?.room === target ? p.b : { pos: 50 };
  p.b = { ...keep, room: target };
  if (!p.b.dir && p.a.dir) p.b.dir = OPPOSITE[p.a.dir];
}

function passageCard(pid, p, room, objs) {
  const isHome = p.a?.room === room;
  const here = isHome ? p.a : p.b;
  const far = isHome ? p.b : p.a;
  const farRoom = far?.room;
  const obj = objs[p.existing || pid];
  const connected = !!p.b?.room;
  const selected = sel.passage === pid;
  const update = (opts) => changed({ list: false, graph: true, inspector: true, ...opts });

  const dirSelect = (s) => select(DIRECTIONS, s.dir, (v) => { if (v) s.dir = v; else delete s.dir; update(); }, { blank: 'none: the player enters it by name' });
  const wallSelect = (s) => select(WALLS, s.wall, (v) => { if (v) s.wall = v; else delete s.wall; update(); }, { blank: 'from the direction' });
  const posInput = (s) => {
    const r = h('input', { type: 'range', min: 0, max: 100, step: 1 });
    r.value = s.pos ?? 50;
    r.addEventListener('input', () => { s.pos = Number(r.value); update(); });
    return r;
  };
  const targets = [];
  for (const r of ctx.rooms().filter((x) => x.id !== room)) {
    targets.push({ id: r.id, label: r.id === farRoom ? r.label : `${r.label} (a new opening there)` });
    if (r.id === farRoom) continue;
    for (const [qid, q] of looseIn(r.id, pid)) {
      targets.push({ id: `join:${qid}`, label: `${r.label}: join up with ${objs[qid]?.name || q.name || q.kind}` });
    }
  }
  targets.push({ id: '__new', label: '+ a new location…' });
  const leadsTo = select(targets, farRoom, (v) => {
    connectPassage(pid, room, v);
    update({ main: true, list: true });
  }, { blank: 'nowhere: disconnect it' });
  // One-way passages go from the a end to the b end; choosing the other way swaps the ends.
  const ways = connected ? [
    { id: '', label: 'both ways' },
    { id: room, label: `only from ${roomTitle(room)} to ${roomTitle(farRoom)}` },
    { id: farRoom, label: `only from ${roomTitle(farRoom)} to ${roomTitle(room)}` },
  ] : [];
  const waySelect = () => select(ways, p.oneWay ? p.a.room : '', (v) => {
    if (!v) delete p.oneWay;
    else {
      if (p.a.room !== v) [p.a, p.b] = [p.b, p.a];
      p.oneWay = true;
    }
    update({ main: true });
  });

  // Folded by default, so a room with many doors stays short; the one being placed is open.
  const foldKey = `passage:${pid}:${room}`;
  if (selected) rememberFold(foldKey, true);
  return fold(foldKey, [
    h('strong', {}, obj?.name || p.name || p.kind),
    h('span', { class: 'badge' }, p.existing ? 'written in code' : p.kind),
    connected ? h('span', { class: 'fold-peek' }, `to ${roomTitle(farRoom)}`) : h('span', { class: 'badge warn' }, 'not connected'),
    h('button', { type: 'button', onclick: () => select_({ passage: selected ? null : pid }) }, selected ? 'Done placing' : 'Place on map'),
    h('button', {
      type: 'button', class: 'icon', title: 'Delete it from both locations', 'aria-label': 'Delete it from both locations',
      onclick: () => { delete story.passages[pid]; if (sel.passage === pid) sel.passage = null; update({ main: true, list: true }); },
    }, '×'),
  ], h('div', { class: 'fold-body' },
    p.existing ? null : [
      h('div', { class: 'row' },
        field('Kind', select(PASSAGE_KINDS, p.kind, (v) => { p.kind = v; update({ main: true }); })),
        field('Name', textInput(p.name, (v) => { p.name = v; update({ inspector: false }); }, { placeholder: p.kind }))),
      field('Words players can use', listInput(p.nouns, (v) => { p.nouns = v; update({ inspector: false }); }, 'leave empty for the usual words')),
      field('Describing words', listInput(p.adjectives, (v) => { p.adjectives = v; update({ inspector: false }); }, 'oak, narrow')),
      field('Description', textInput(p.description, (v) => { p.description = v; update({ inspector: false, graph: false }); }, { multiline: true, rows: 2 }), 'From both sides, unless a side has its own below.'),
      checkbox('Hidden until an effect shows it (a secret door)', !!p.hidden, (v) => { if (v) p.hidden = true; else delete p.hidden; update({ inspector: false }); }),
    ],
    h('h4', {}, `In ${roomTitle(room)}`),
    h('div', { class: 'row' },
      field('Direction from here', dirSelect(here)),
      field('On the map', wallSelect(here))),
    field('Position along the wall', posInput(here)),
    p.existing ? null : sideDescription(here, room, update),
    endExtras(p, here),
    field('Leads to', leadsTo, connected ? null : 'Connecting it here also adds it to the other location.'),
    connected ? [
      h('h4', {}, `In ${roomTitle(farRoom)}`),
      h('div', { class: 'row' },
        field(`Direction back from ${roomTitle(farRoom)}`, dirSelect(far)),
        field('On that map', wallSelect(far))),
      field('Position along that wall', posInput(far)),
      p.existing ? null : sideDescription(far, farRoom, update),
      endExtras(p, far),
      field('Can be used', waySelect()),
      p.oneWay ? field(`When the player tries to go from ${roomTitle(p.b.room)} to ${roomTitle(p.a.room)}`,
        textInput(p.blocked, (v) => { p.blocked = v; update({ inspector: false, graph: false }); }, { multiline: true, rows: 2, placeholder: "You can't go that way." }),
        'Shown when it is used the wrong way.') : null,
    ] : field('When the player tries to go through', textInput(p.blocked, (v) => { p.blocked = v; update({ inspector: false, graph: false }); }, { multiline: true, rows: 2, placeholder: "TODO: this doesn't lead anywhere yet." }), 'Shown while it leads nowhere.'),
    obj?.openable ? h('div', { class: 'row' },
      checkbox('Starts locked', p.locked ?? obj.locked, (v) => { p.locked = v; update({ inspector: false }); }),
      checkbox('Starts open', p.open ?? obj.open, (v) => { p.open = v; update(); })) : null,
    obj?.openable && !p.existing
      ? field('Unlocked with', select(ctx.things().filter((t) => t.id !== pid), p.key, (v) => { if (v) p.key = v; else delete p.key; update({ inspector: false }); }, { blank: 'no key: only events can unlock it' }))
      : null), { open: false, cls: `passage-card${selected ? ' selected' : ''}` });
}

// A passage's description as seen from one end, overriding the shared one.
function sideDescription(side, room, update) {
  return field(`Seen from ${roomTitle(room)}`, textInput(side.description, (v) => { if (v.trim()) side.description = v; else delete side.description; update({ inspector: false, graph: false }); }, { multiline: true, rows: 2, placeholder: 'the shared description' }));
}

// The selected location's map. With a door or passage selected, clicking a wall places it.
function locationInspector() {
  const objs = world();
  const room = objs[sel.id];
  if (room?.kind !== 'room') return [h('p', { class: 'muted' }, 'Choose a location to see its map.')];
  if (!room.map) return [h('h3', {}, room.title ?? room.name), h('p', { class: 'muted' }, 'This location has no map.')];
  const p = story.passages[sel.passage];
  const side = p && (p.a?.room === sel.id ? p.a : p.b?.room === sel.id ? p.b : null);
  const drawnInCode = p?.existing && p.a?.room === sel.id && baseObjects[sel.id]?.map?.shapes.some((s) => s.obj === p.existing);

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.classList.add('map', 'place-map');
  const shapes = [...room.map.shapes];
  for (const [aid, a] of Object.entries(story.actors)) {
    if (a.place?.room === sel.id && Number.isFinite(a.place.x)) shapes.push({ type: a.marker ?? 'group', obj: aid, x: a.place.x, y: a.place.y });
  }
  renderMap(svg, h('p'), {
    map: { w: room.map.w, h: room.map.h, shapes },
    near: p ? p.existing || sel.passage : null,
    isOpen: (x) => !!objs[x]?.open,
    name: (x) => objs[x]?.name ?? x,
    stand: null,
  }, () => {});
  if (side && !drawnInCode) {
    svg.addEventListener('click', (e) => {
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const q = pt.matrixTransform(svg.getScreenCTM().inverse());
      const r = room.map.shapes.find((s) => s.type === 'room' || s.type === 'balcony') ?? { x: 4, y: 4, w: room.map.w - 8, h: room.map.h - 8 };
      const dist = { w: Math.abs(q.x - r.x), e: Math.abs(q.x - r.x - r.w), n: Math.abs(q.y - r.y), s: Math.abs(q.y - r.y - r.h) };
      const wall = Object.entries(dist).sort((x, y) => x[1] - y[1])[0][0];
      const along = wall === 'n' || wall === 's' ? (q.x - r.x) / r.w : (q.y - r.y) / r.h;
      side.wall = wall;
      side.pos = Math.round(Math.min(1, Math.max(0, along)) * 100);
      changed({ list: false, main: true, inspector: true });
    });
  }
  const name = p && (objs[p.existing || sel.passage]?.name || p.name || p.kind);
  return [
    h('h3', {}, room.title ?? room.name),
    svg,
    h('p', { class: 'hint' }, !p
      ? 'Choose "Place on map" on a door or passage, then click a wall here to put it there.'
      : drawnInCode
        ? `${cap(name)} is drawn on this map in code.`
        : side
          ? `Click a wall to place ${name}.`
          : `${cap(name)} isn't in this location.`),
  ];
}

// ---- objects ------------------------------------------------------------------

function whereLabel(where) {
  if (!where) return 'nowhere';
  if (where === 'player') return 'carried';
  const o = world()[where];
  if (!o) return `in ${where} (missing)`;
  if (o.kind === 'room') return `in ${o.title ?? o.name}`;
  return `${o.supporter ? 'on' : 'in'} ${o.name}`;
}

function renderObjectList() {
  const items = Object.entries(story.objects);
  const list = $('list');
  if (!items.length) return list.replaceChildren(h('p', { class: 'muted' }, 'No objects yet.'));
  const button = ([id, t]) =>
    h('button', {
      type: 'button',
      class: `item${sel.id === id ? ' selected' : ''}`,
      onclick: () => select_({ id }),
    },
    h('span', { class: 'item-name' }, t.name || id),
    h('span', { class: 'item-meta' },
      whereLabel(t.in),
      t.reactions?.length ? h('span', { class: 'badge' }, 'reacts') : null,
      t.notes ? h('span', { class: 'badge' }, 'notes') : null));
  // Things on a table or in a box are grouped with the room the table is in.
  const roomOf = ([, t]) => {
    let where = t.in;
    for (let i = 0; i < 20 && story.objects[where]; i++) where = story.objects[where].in;
    return where;
  };
  list.replaceChildren(...groupedList(byRoom(items, roomOf, 'Nowhere (not in the game yet)').map((g) => ({ ...g, items: g.items.map(button) }))));
}

function addObject(where = '') {
  settle(() => {
    const id = freshId('object', world());
    story.objects[id] = { name: '', article: '', nouns: [], adjectives: [], description: '', in: where, notes: '' };
    accept();
    changed();
    select_({ tab: 'objects', id });
  });
}

function renameObject(oldId, newId) {
  renameKey(story.objects, oldId, newId);
  renameRefs(['thing', 'item', 'in', 'key', 'becomes', 'where', 'to'], oldId, newId);
  accept();
  changed({ main: true });
  select_({ id: newId });
}

function deleteObject(id) {
  const t = story.objects[id];
  const confirmBox = h('div', { class: 'confirm' },
    h('p', {}, `Delete ${t.name || id}? Anything on or in it is left where it stood. Events that mention it will show up under Problems.`),
    h('button', {
      type: 'button',
      class: 'danger',
      onclick: () => {
        for (const other of Object.values(story.objects)) if (other.in === id) other.in = t.in;
        delete story.objects[id];
        accept();
        changed();
        select_({ id: null });
      },
    }, 'Delete'),
    h('button', { type: 'button', onclick: () => confirmBox.remove() }, 'Keep'));
  $('main').prepend(confirmBox);
}

function objectForm(id) {
  const t = story.objects[id];
  const objs = world();
  const set = (key, opts) => (v) => {
    if (v === '' || v === false || v === undefined) delete t[key];
    else t[key] = v;
    changed(opts);
  };
  const flag = (key, label, opts = { main: true }) => checkbox(label, t[key], set(key, opts));
  const text = (key, label, hint, placeholder) => field(label, textInput(t[key], set(key, { list: false }), { multiline: true, rows: 2, placeholder }), hint);
  const inRoom = objs[t.in]?.kind === 'room';
  const otherThings = ctx.things().filter((x) => x.id !== id);
  const places = ctx.places().filter((p) => p.id !== id);

  const shapeKind = !t.shape ? '' : t.shape.round ? 'oval' : 'rect';
  const shapeControls = inRoom ? [
    field('On the map', select([{ id: 'rect', label: 'a rectangle (table, chest, bed…)' }, { id: 'oval', label: 'an oval (round table…)' }], shapeKind, (v) => {
      if (!v) delete t.shape;
      else {
        const room = objs[t.in].map;
        t.shape = { x: t.shape?.x ?? Math.round((room?.w ?? 60) / 2 - 6), y: t.shape?.y ?? Math.round((room?.h ?? 40) / 2 - 3), w: t.shape?.w ?? 12, h: t.shape?.h ?? 6 };
        if (v === 'oval') t.shape.round = true;
      }
      changed({ main: true, inspector: true });
    }, { blank: 'not drawn' }), 'Drawn things can be clicked on the map, and the player stands by them.'),
    t.shape ? h('div', { class: 'row' },
      field('Width', numberInput(t.shape.w, (v) => { t.shape.w = v ?? 12; changed({ list: false, inspector: true }); })),
      field('Height', numberInput(t.shape.h, (v) => { t.shape.h = v ?? 6; changed({ list: false, inspector: true }); }))) : null,
    t.shape ? h('p', { class: 'hint' }, 'Click the map on the right to move it.') : null,
  ] : [];

  const becomes = field('Afterwards it becomes', select(otherThings, t.becomes, set('becomes', { list: false }), { blank: 'nothing: it is used up' }), 'For example an empty glass. Make that object too, starting nowhere.');
  const reactions = t.reactions ?? [];

  return [
    h('header', { class: 'form-head' },
      h('h2', {}, t.name || id),
      h('button', { type: 'button', class: 'danger', onclick: () => deleteObject(id) }, 'Delete object')),
    h('section', { class: 'form-grid' },
      h('div', { class: 'col' },
        field('Name', textInput(t.name, set('name'), { placeholder: 'e.g. brass key' }), 'Shown in the game, e.g. "You can also see a brass key here."'),
        field('Article', select([
          { id: '', label: 'a / an (worked out from the name)' },
          { id: 'some', label: 'some (some candles)' },
          { id: 'the', label: 'the' },
          { id: 'none', label: 'none: a proper name' },
        ], t.article ?? '', set('article', { list: false }))),
        field('Words players can use', listInput(t.nouns, set('nouns', { list: false }), 'key, brass'), 'Nouns, separated by commas.'),
        field('Describing words', listInput(t.adjectives, set('adjectives', { list: false }), 'brass, small'), 'Adjectives, to tell similar things apart.'),
        field('Description', textInput(t.description, set('description', { list: false }), { multiline: true, rows: 4 }), `What the player sees when they examine it. ${answersHint()}`),
        idField(id, story.objects, (next) => renameObject(id, next))),
      h('div', { class: 'col' },
        field('Starts', select(places, t.in ?? '', (v) => {
          t.in = v;
          if (objs[v]?.kind !== 'room') delete t.shape;
          changed({ main: true, inspector: true });
        })),
        ...shapeControls,
        field('Notes for Claude', textInput(t.notes, set('notes'), { multiline: true, plain: true, rows: 3, placeholder: 'e.g. this should only appear after the dance' }), "Anything you'd like me to build. I read this when you tell me you've saved."))),
    fold('object:flags', h('h3', {}, 'What it is'), h('section', { class: 'rules-section' },
      h('div', { class: 'flags' },
        h('div', { class: 'col' },
          flag('scenery', 'Already mentioned in the room description', { list: false }),
          h('p', { class: 'hint' }, 'If ticked, the room doesn\'t also list it as "You can also see…".'),
          flag('fixed', "Can't be picked up"),
          t.fixed ? text('fixedText', 'When the player tries', 'Leave empty for "That\'s not something you can pick up."') : null,
          flag('supporter', 'Things can be put on it (a table, a shelf)'),
          flag('container', 'Things can be put in it (a box, a drawer)'),
          t.container && t.openable ? flag('transparent', 'You can see inside while it is closed', { list: false }) : null,
          flag('openable', 'Opens and closes'),
          t.openable ? h('div', { class: 'sub' },
            flag('open', 'Starts open', { list: false }),
            flag('locked', 'Starts locked', { main: true }),
            t.locked || t.key ? field('Unlocked with', select(otherThings, t.key, set('key', { list: false }), { blank: 'no key: only events can unlock it' })) : null) : null),
        h('div', { class: 'col' },
          flag('wearable', 'Can be worn'),
          t.wearable ? h('div', { class: 'sub' },
            flag('worn', 'Starts worn (put it in the player\'s inventory)', { list: false }),
            text('wornText', 'When put on', 'Leave empty for "You put on …".')) : null,
          flag('edible', 'Can be eaten'),
          t.edible ? h('div', { class: 'sub' }, text('eatenText', 'When eaten', 'Leave empty for "You eat …".'), becomes) : null,
          flag('drinkable', 'Can be drunk'),
          t.drinkable ? h('div', { class: 'sub' }, text('drunkText', 'When drunk', 'Leave empty for "You drink …".'), t.edible ? null : becomes) : null,
          flag('light', 'Gives light (in dark places), while on if it has a switch', { list: false }),
          flag('switchable', 'Switches on and off (a lamp, a machine)'),
          t.switchable ? h('div', { class: 'sub' },
            flag('on', 'Starts on', { list: false }),
            text('onText', 'Examined while on', 'Shown after its description. Leave empty for "The … is on."'),
            text('offText', 'Examined while off', 'Leave empty for "The … is off."'),
            text('switchOnText', 'When switched on', 'Leave empty for "You turn on …".'),
            text('switchOffText', 'When switched off', 'Leave empty for "You turn off …".')) : null,
          h('div', { class: 'field' },
            h('span', { class: 'label' }, 'Also present in'),
            h('div', { class: 'checks' }, ctx.rooms().filter((r) => r.id !== t.in).map((r) => checkbox(r.label, (t.alsoIn ?? []).includes(r.id), (v) => {
              const set_ = new Set(t.alsoIn ?? []);
              if (v) set_.add(r.id); else set_.delete(r.id);
              if (set_.size) t.alsoIn = [...set_]; else delete t.alsoIn;
              changed({ list: false });
            }))),
            h('p', { class: 'hint' }, 'For things that are everywhere in an area, like the sky or music. They can\'t be picked up.')))))),
    fold('object:senses', h('h3', {}, 'Senses'), h('section', { class: 'rules-section' },
      h('div', { class: 'form-grid' },
        h('div', { class: 'col' },
          text('readText', 'Reading it', 'If it has writing on it. Leave empty and READ shows the description.'),
          text('touch', 'Touching it')),
        h('div', { class: 'col' },
          text('smell', 'Smelling it'),
          text('listen', 'Listening to it'))))),
    fold('object:reactions', [
      h('h3', {}, 'Reactions'),
      h('span', { class: 'group-count' }, String(reactions.length)),
      h('button', { type: 'button', onclick: () => { (t.reactions ??= []).push({ action: 'take', when: [], effects: [] }); rememberFold('object:reactions', true); changed({ main: true }); } }, '+ Reaction'),
    ], h('section', { class: 'rules-section' },
      h('p', { class: 'hint' }, 'Make things happen when the player does something to it: a trap that springs when it is picked up, a note that sets a variable when read.'),
      ...reactions.map((r, i) => reactionCard(t, r, i)))),
  ];
}

// The built-in actions plus the game's own verbs that take a thing.
function reactionActions() {
  const own = Object.entries(story.verbs)
    .filter(([, v]) => (v.patterns ?? []).some((p) => /\[(thing|carried)\]/.test(p)))
    .map(([id, v]) => ({ id: VERB + id, label: `${v.name || id} (one of your verbs)` }));
  return [...REACTION_ACTIONS, ...own];
}

function reactionCard(t, r, i) {
  r.when ??= [];
  r.effects ??= [];
  const update = (opts = { list: false }) => changed(opts);
  const action = reactionActions().find((x) => x.id === r.action)?.label ?? '';
  return fold(`reaction:${sel.id}:${i}`, [
    h('strong', {}, `Reaction ${i + 1}`),
    h('span', { class: 'fold-peek' }, `when the player ${action}`),
    h('button', {
      type: 'button', class: 'icon', title: 'Delete reaction', 'aria-label': 'Delete reaction',
      onclick: () => { t.reactions.splice(i, 1); if (!t.reactions.length) delete t.reactions; changed({ main: true }); },
    }, '×'),
  ], h('div', { class: 'fold-body' },
    field('When the player', select(reactionActions(), r.action, (v) => { r.action = v; update({ list: false, main: true }); })),
    h('div', { class: 'sub' }, h('h4', {}, 'Only if'),
      ruleEditor({ list: r.when, schema: CONDITIONS, ctx, onChange: update, addLabel: '+ add a condition' })),
    h('div', { class: 'sub' }, h('h4', {}, 'Then'),
      ruleEditor({ list: r.effects, schema: EFFECTS, ctx, onChange: update, addLabel: '+ add an effect' })),
    h('div', { class: 'row' },
      checkbox('Instead of the usual result', r.instead, (v) => { if (v) r.instead = true; else delete r.instead; update(); }),
      checkbox('Only the first time', r.once, (v) => { if (v) r.once = true; else delete r.once; update(); })),
    h('p', { class: 'hint' }, 'Without "instead", the effects happen first and then the usual result (for example "Taken.").')), { cls: 'option' });
}

// The map of the room the selected object is in. Clicking moves its shape there.
function objectInspector() {
  const t = story.objects[sel.id];
  if (!t) return [h('p', { class: 'muted' }, 'Choose an object to see where it is.')];
  const objs = world();
  const room = objs[t.in];
  if (room?.kind !== 'room') return [h('p', { class: 'muted' }, `It starts ${whereLabel(t.in)}, so it isn't drawn on a map.`)];
  if (!room.map) return [h('h3', {}, room.title ?? room.name), h('p', { class: 'muted' }, 'This location has no map.')];

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.classList.add('map', 'place-map');
  const shapes = [...room.map.shapes];
  for (const [aid, a] of Object.entries(story.actors)) {
    if (a.place?.room === t.in && Number.isFinite(a.place.x)) shapes.push({ type: a.marker ?? 'group', obj: aid, x: a.place.x, y: a.place.y, faint: true });
  }
  renderMap(svg, h('p'), {
    map: { w: room.map.w, h: room.map.h, shapes },
    near: sel.id,
    isOpen: (x) => !!objs[x]?.open,
    name: (x) => objs[x]?.name ?? x,
    stand: null,
  }, () => {});
  if (t.shape) {
    svg.addEventListener('click', (e) => {
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const q = pt.matrixTransform(svg.getScreenCTM().inverse());
      t.shape.x = Math.round(q.x - t.shape.w / 2);
      t.shape.y = Math.round(q.y - t.shape.h / 2);
      changed({ list: false, inspector: true });
    });
  }
  return [
    h('h3', {}, room.title ?? room.name),
    svg,
    h('p', { class: 'hint' }, t.shape
      ? `Click the map to move ${t.name || sel.id}.`
      : 'Not drawn on the map. Choose a shape under "On the map" to draw it.'),
  ];
}

// ---- game settings --------------------------------------------------------------

// Things the player can stand next to on a location's map: drawn objects, doors, stairs.
function standChoices(room) {
  const objs = world();
  return (objs[room]?.map?.shapes ?? [])
    .filter((sh) => sh.obj && sh.stand && objs[sh.obj])
    .map((sh) => ({ id: sh.obj, label: `${objs[sh.obj].name} (${sh.obj})` }));
}

function gameForm() {
  const g = story.game;
  g.start ??= {};
  g.player ??= {};
  g.questions ??= [];
  const edit = (fn, opts = { list: false }) => (v) => { fn(v); changed(opts); };
  const question = (q, i) => h('div', { class: 'rule' },
    textInput(q.label, edit((v) => { q.label = v; }), { placeholder: 'shown to the player, e.g. Your name' }),
    textInput(q.var, edit((v) => { q.var = v.trim(); }), { placeholder: 'variable, e.g. name', list: 'var-names' }),
    h('button', { type: 'button', class: 'icon', title: 'Remove question', 'aria-label': 'Remove question', onclick: () => { g.questions.splice(i, 1); changed({ main: true }); } }, '×'));
  return [
    h('header', { class: 'form-head' }, h('h2', {}, 'Game settings')),
    fold('game:start', h('h3', {}, 'Start screen'), h('section', { class: 'form-grid' },
      h('div', { class: 'col' },
        field('Title', textInput(g.title, edit((v) => { g.title = v; })), 'Shown on the start screen.'),
        field('Introduction', textInput(g.intro, edit((v) => { g.intro = v; }), { multiline: true, rows: 8 }), 'Shown before play begins. Leave a blank line between paragraphs.'),
        field('Status line', textInput(g.status, edit((v) => { if (v.trim()) g.status = v; else delete g.status; }), { placeholder: 'e.g. {name} · Reputation: {rep}' }), 'Shown at the top of the page during play, updated every turn. Leave empty to show the start-screen answers.')),
      h('div', { class: 'col' },
        h('div', { class: 'field' },
          h('span', { class: 'label' }, 'Questions'),
          h('div', { class: 'rules' }, g.questions.map(question)),
          h('button', { type: 'button', class: 'add-rule', onclick: () => { g.questions.push({ label: '', var: '' }); changed({ main: true }); } }, '+ Add a question'),
          h('p', { class: 'hint' }, 'Each answer is kept in its variable, so text anywhere can use it in braces, e.g. {variable}. The status bar shows the answers. With no questions, the start screen just has a Begin button.'))))),
    fold('game:begin', h('h3', {}, 'Where the player starts'), h('section', { class: 'form-grid' },
      h('div', { class: 'col' },
        field('Location', select(ctx.rooms(), g.start.room, edit((v) => { g.start.room = v; if (!standChoices(v).some((c) => c.id === g.start.near)) delete g.start.near; }, { main: true }), { blank: 'choose a location' }))),
      h('div', { class: 'col' },
        field('Standing next to', select(standChoices(g.start.room), g.start.near, edit((v) => { if (v) g.start.near = v; else delete g.start.near; }), { blank: 'nothing in particular' }), 'Where the marker is on the map at the start.')))),
    fold('game:player', h('h3', {}, 'The player'), h('section', { class: 'form-grid' },
      h('div', { class: 'col' },
        field('Description', textInput(g.player.description, edit((v) => { g.player.description = v; }), { multiline: true, rows: 3 }), `What EXAMINE ME shows. ${answersHint()}`)),
      h('div', { class: 'col' },
        field('Words for the player', listInput(g.player.nouns, edit((v) => { g.player.nouns = v; }), 'me, myself, self, yourself'), 'Leave empty for me, myself, self and yourself.')))),
    messagesSection(g, edit),
  ];
}

// Every built-in message (engine/messages.js), grouped. An empty box keeps the default,
// which is shown greyed out in it; anything typed replaces it in this game.
function messagesSection(g, edit) {
  const custom = () => Object.keys(g.messages ?? {}).filter((k) => k in MESSAGES).length;
  const count = h('span', { class: 'group-count' }, custom() ? `${custom()} changed` : '');
  const set = (key) => edit((v) => {
    if (v.trim()) (g.messages ??= {})[key] = v;
    else if (g.messages) {
      delete g.messages[key];
      if (!Object.keys(g.messages).length) delete g.messages;
    }
    count.textContent = custom() ? `${custom()} changed` : '';
  });
  const row = ([key, m]) => {
    const multiline = m.text.includes('\n') || m.text.length > 70;
    const params = m.params.length ? `Fills in ${m.params.map((p) => `{${p}}`).join(' ')}.` : undefined;
    return field(m.about, textInput(g.messages?.[key] ?? '', set(key), { multiline, rows: multiline ? Math.min(8, m.text.split('\n').length + 1) : 2, placeholder: m.text }),
      params);
  };
  const groups = MESSAGE_GROUPS.map((group) => {
    const items = Object.entries(MESSAGES).filter(([, m]) => m.group === group);
    return fold(`game:messages:${group}`, h('h4', {}, group), h('section', { class: 'messages' }, items.map(row)), { open: false });
  });
  return fold('game:messages', [h('h3', {}, 'Messages'), count], h('div', {},
    h('p', { class: 'hint' }, `Everything the game says on its own: replies to commands, standard sentences, saving, and the page's labels. Leave a box empty to keep the default shown in it. Placeholders like {thing} start with a capital ({Thing}) to begin a sentence. ${answersHint()}`),
    ...groups), { open: false });
}

// ---- location extras -----------------------------------------------------------

// Directions typed as words or short forms ("out, north" or "out, n") <-> ids.
function dirsInput(values, onInput, placeholder) {
  const toId = (w) => DIRECTIONS.find((d) => d.id === w || d.label === w)?.id;
  const label = (id) => DIRECTIONS.find((d) => d.id === id)?.label ?? id;
  return listInput((values ?? []).map(label), (words) => onInput(words.map(toId).filter(Boolean)), placeholder);
}

function locationExtras(id, l) {
  const edit = (fn, opts = { list: false }) => (v) => { fn(v); changed(opts); };
  const mapEdit = (fn) => edit(fn, { list: false, inspector: true });
  const refused = Object.entries(l.refuse ?? {});
  const free = DIRECTIONS.filter((d) => !(d.id in (l.refuse ?? {})));
  const num = (obj, key, fallback) => numberInput(obj?.[key] ?? fallback, mapEdit((v) => { obj[key] = v; }));

  const atmosphere = fold('location:atmosphere', h('h3', {}, 'Senses and atmosphere'), h('section', { class: 'form-grid' },
    h('div', { class: 'col' },
      field('Smell', textInput(l.smell, edit((v) => { l.smell = v; }), { multiline: true, rows: 2 }), 'What SMELL shows here.'),
      field('Sounds', textInput(l.listen, edit((v) => { l.listen = v; }), { multiline: true, rows: 2 }), 'What LISTEN shows here.'),
      field('Background messages', textInput((l.ambient?.lines ?? []).join('\n'), edit((v) => { l.ambient = { ...l.ambient, lines: v.split('\n').map((x) => x.trim()).filter(Boolean) }; }), { multiline: true, rows: 4 }), 'One per line. Each turn here may show one at random.'),
      field('Chance each turn (%)', numberInput(l.ambient?.chance ?? 20, edit((v) => { l.ambient = { ...l.ambient, chance: v ?? 20 }; }))),
      checkbox('Dark: the player needs a light to see here', !!l.dark, (v) => { if (v) l.dark = true; else { delete l.dark; delete l.darkText; } changed({ main: true, list: false }); }),
      l.dark ? field('In the dark', textInput(l.darkText, edit((v) => { l.darkText = v; }), { multiline: true, rows: 2, placeholder: "It is pitch dark. You can't see a thing." }), 'Shown instead of the description while there is no light. Things that give light are set on the Objects tab.') : null),
    h('div', { class: 'col' },
      field('Player arrives next to', select(standChoices(id), l.arriveNear, edit((v) => { if (v) l.arriveNear = v; else delete l.arriveNear; }), { blank: 'nothing in particular' }), 'Where the marker starts when they arrive other than through a door drawn on this map.'),
      h('div', { class: 'field' },
        h('span', { class: 'label' }, 'Directions that are refused'),
        h('div', { class: 'rules' }, refused.map(([dir, msg]) => h('div', { class: 'rule' },
          h('span', { class: 'rule-type' }, DIRECTIONS.find((d) => d.id === dir)?.label ?? dir),
          textInput(msg, edit((v) => { l.refuse[dir] = v; }), { multiline: true, rows: 2, placeholder: "You can't go that way." }),
          h('button', { type: 'button', class: 'icon', title: 'Remove', 'aria-label': 'Remove', onclick: () => { delete l.refuse[dir]; if (!Object.keys(l.refuse).length) delete l.refuse; changed({ main: true, list: false }); } }, '×')))),
        select(free, '', (v) => { if (v) { (l.refuse ??= {})[v] = ''; changed({ main: true, list: false }); } }, { blank: '+ refuse a direction with a message' }),
        h('p', { class: 'hint' }, 'For directions with no door or passage, e.g. "There are two doors in the west wall…". A door or passage going the same way takes priority.')),
      h('div', { class: 'field' },
        h('span', { class: 'label' }, 'Looking in a direction'),
        h('div', { class: 'rules' }, Object.entries(l.look ?? {}).map(([dir, text]) => h('div', { class: 'rule' },
          h('span', { class: 'rule-type' }, DIRECTIONS.find((d) => d.id === dir)?.label ?? dir),
          textInput(text, edit((v) => { l.look[dir] = v; }), { multiline: true, rows: 2, placeholder: 'What LOOK in that direction shows' }),
          h('button', { type: 'button', class: 'icon', title: 'Remove', 'aria-label': 'Remove', onclick: () => { delete l.look[dir]; if (!Object.keys(l.look).length) delete l.look; changed({ main: true, list: false }); } }, '×')))),
        select(DIRECTIONS.filter((d) => !(d.id in (l.look ?? {}))), '', (v) => { if (v) { (l.look ??= {})[v] = ''; changed({ main: true, list: false }); } }, { blank: '+ add what LOOK in a direction shows' }),
        h('p', { class: 'hint' }, 'Without one, LOOK NORTH names the way out that way, or says there\'s nothing special.')))));

  const details = l.details ?? [];
  const detailsFold = fold('location:mentions', [h('h3', {}, 'Things the description mentions'), h('span', { class: 'group-count' }, String(details.length))], h('section', { class: 'rules-section' },
    h('p', { class: 'hint' }, 'Things the description mentions that players may want to look at: the sky, a window, a far-off tower. Each gets the words players can use and what EXAMINE shows. They can\'t be picked up. For anything more, make an object.'),
    ...details.map((d, i) => h('div', { class: 'rule detail-row' },
      listInput(d.nouns, (v) => { d.nouns = v; changed({ list: false }); }, 'words, e.g. tower, lighthouse'),
      textInput(d.description, (v) => { d.description = v; changed({ list: false }); }, { multiline: true, rows: 2, placeholder: 'What EXAMINE shows' }),
      h('button', { type: 'button', class: 'icon', title: 'Remove', 'aria-label': 'Remove', onclick: () => { details.splice(i, 1); if (!details.length) delete l.details; changed({ main: true, list: false }); } }, '×'))),
    h('button', { type: 'button', class: 'add-rule', onclick: () => { (l.details ??= []).push({ nouns: [], description: '' }); rememberFold('location:mentions', true); changed({ main: true, list: false }); } }, '+ add a thing the description mentions')));

  const map = fold('location:map', h('h3', {}, 'Map'), h('section', { class: 'form-grid' },
    h('div', { class: 'col' },
      h('div', { class: 'row' },
        field('Map width', numberInput(l.size?.w ?? 60, mapEdit((v) => { l.size = { ...l.size, w: v }; }))),
        field('Map height', numberInput(l.size?.h ?? 40, mapEdit((v) => { l.size = { ...l.size, h: v }; })))),
      field('Floor', select([{ id: 'room', label: 'a room with walls' }, { id: 'balcony', label: 'a balcony: one wall, railings round the rest' }], l.style ?? 'room', mapEdit((v) => { if (v === 'balcony') l.style = v; else delete l.style; }))),
      l.style === 'balcony' ? field('Wall on the', select(WALLS, l.wallSide ?? 'w', mapEdit((v) => { l.wallSide = v; }))) : null,
      checkbox('Floor covers only part of the map', !!l.floor, (v) => {
        if (v) l.floor = { x: 4, y: 4, w: (l.size?.w ?? 60) - 8, h: Math.round(((l.size?.h ?? 40) - 8) / 2) };
        else delete l.floor;
        changed({ main: true, list: false, inspector: true });
      }),
      l.floor ? h('div', { class: 'row' },
        field('Floor x', num(l.floor, 'x', 4)), field('y', num(l.floor, 'y', 4)),
        field('width', num(l.floor, 'w', 40)), field('height', num(l.floor, 'h', 20))) : null),
    h('div', { class: 'col' },
      h('div', { class: 'field' },
        h('span', { class: 'label' }, 'Other locations drawn faintly'),
        h('div', { class: 'rules' }, (l.views ?? []).map((v, i) => h('div', { class: 'rule' },
          select(ctx.rooms().filter((r) => r.id !== id), v.room, mapEdit((x) => { v.room = x; }), { blank: 'choose a location' }),
          field('x', num(v, 'x', 4)), field('y', num(v, 'y', 4)), field('w', num(v, 'w', 20)), field('h', num(v, 'h', 10)),
          h('button', { type: 'button', class: 'icon', title: 'Remove', 'aria-label': 'Remove', onclick: () => { l.views.splice(i, 1); if (!l.views.length) delete l.views; changed({ main: true, list: false, inspector: true }); } }, '×')))),
        h('button', { type: 'button', class: 'add-rule', onclick: () => { (l.views ??= []).push({ room: '', x: 4, y: 4, w: 20, h: 10 }); changed({ main: true, list: false, inspector: true }); } }, '+ Draw another location'),
        h('p', { class: 'hint' }, 'For places seen from here, like a balcony across the way. Locations that see each other should share coordinates so actors line up.')))));

  return [atmosphere, detailsFold, map];
}

// Extra settings for one end of a passage: more directions, the opening's width, and
// for stairs, where the staircase is drawn.
function endExtras(p, end) {
  const update = (opts) => changed({ list: false, graph: true, inspector: true, ...opts });
  const num = (key, fallback) => numberInput(end.box?.[key] ?? fallback, (v) => { end.box = { ...end.box, [key]: v }; update(); });
  return [
    h('div', { class: 'row' },
      field('Also reached by', dirsInput(end.also, (v) => { if (v.length) end.also = v; else delete end.also; update({ inspector: false }); }, 'e.g. out, in')),
      p.kind === 'stairs' && end.box ? null : field('Width on the map', numberInput(end.len ?? 8, (v) => { if (v && v !== 8) end.len = v; else delete end.len; update(); }))),
    p.kind === 'stairs' && !p.existing ? checkbox('Draw a staircase inside the room', !!end.box, (v) => {
      if (v) end.box = { x: 30, y: 5, w: 40, h: 15 };
      else delete end.box;
      update({ main: true });
    }) : null,
    p.kind === 'stairs' && end.box ? h('div', { class: 'row' },
      field('x', num('x', 30)), field('y', num('y', 5)), field('width', num('w', 40)), field('height', num('h', 15))) : null,
  ];
}

// ---- wiring -------------------------------------------------------------------

for (const b of document.querySelectorAll('[data-tab]')) {
  b.addEventListener('click', () => select_({ tab: b.dataset.tab, id: null, node: null }));
}

$('new').addEventListener('click', () => settle(() => {
  if (sel.tab === 'locations') {
    addLocation(true);
  } else if (sel.tab === 'objects') {
    addObject();
  } else if (sel.tab === 'actors') {
    const id = freshId('actor', world());
    story.actors[id] = { name: '', article: 'the', nouns: [], adjectives: [], description: '', marker: 'person', place: null, notes: '', conversation: null };
    accept();
    changed();
    select_({ id, node: null });
  } else if (sel.tab === 'walkthroughs') {
    const id = freshId('walk', story.walkthroughs);
    story.walkthroughs[id] = { name: '', steps: [] };
    accept();
    changed();
    select_({ id, node: null });
  } else if (sel.tab === 'verbs') {
    const id = freshId('verb', story.verbs);
    story.verbs[id] = { name: '', notes: '', patterns: [], reply: '', rules: [] };
    accept();
    changed();
    select_({ id, node: null });
  } else {
    const id = freshId('event', story.events);
    story.events[id] = { name: '', notes: '', when: [], effects: [] };
    accept();
    changed();
    select_({ id, node: null });
  }
}));

$('new-area').addEventListener('click', addArea);
$('fold-all').addEventListener('click', () => setAllFolds($('list'), false));
$('unfold-all').addEventListener('click', () => setAllFolds($('list'), true));

// Insert menu for variable text ({if}, {either}, {once}...): goes into the game-text
// box that last had focus, at the cursor.
let textTarget = null;
document.addEventListener('focusin', (e) => {
  const el = e.target;
  const isText = (el.tagName === 'TEXTAREA' || (el.tagName === 'INPUT' && el.type === 'text')) && !el.dataset.plain && el.id !== 'id-field';
  if (isText) textTarget = el;
  else if (el.id !== 'insert-text') textTarget = null;
  $('insert-text').disabled = !textTarget;
});
$('insert-text').replaceChildren(
  h('option', { value: '' }, 'Insert…'),
  ...TEXT_DIRECTIVES.map((d, i) => h('option', { value: String(i), title: d.about }, `${d.insert}  ${d.about}`)));
$('insert-text').addEventListener('change', (e) => {
  const d = TEXT_DIRECTIVES[Number(e.target.value)];
  e.target.value = '';
  if (!d || !textTarget?.isConnected) return;
  const el = textTarget;
  const [from, to] = [el.selectionStart ?? el.value.length, el.selectionEnd ?? el.value.length];
  // Selected text goes inside a block ({if v}selection{/if}).
  const chosen = el.value.slice(from, to);
  const snippet = chosen && d.insert.includes('…') ? d.insert.replace('…', chosen).replace('…', '') : d.insert;
  el.value = el.value.slice(0, from) + snippet + el.value.slice(to);
  el.focus();
  el.setSelectionRange(from + snippet.length, from + snippet.length);
  el.dispatchEvent(new Event('input'));
});

$('save').addEventListener('click', save);
$('undo').addEventListener('click', undo);
$('redo').addEventListener('click', redo);
document.addEventListener('keydown', (e) => {
  const inText = e.target.closest?.('input, textarea, select, [contenteditable]');
  if (inText || !(e.metaKey || e.ctrlKey)) return;
  const key = e.key.toLowerCase();
  if (key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
  else if ((key === 'z' && e.shiftKey) || key === 'y') { e.preventDefault(); redo(); }
});
$('publish').addEventListener('click', publish);
document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 's') {
    e.preventDefault();
    save();
  }
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && pending()) {
    e.preventDefault();
    commit();
  }
});
window.addEventListener('beforeunload', (e) => {
  if (dirty) e.preventDefault();
});

// The graph needs the form in the page before it can measure cards.
const observer = new MutationObserver(() => {
  for (const [id, draw] of [['graph', renderGraph], ['atlas', renderAtlas]]) {
    const wrap = $(id);
    if (wrap && !wrap.dataset.drawn) {
      wrap.dataset.drawn = '1';
      draw();
    }
  }
});
observer.observe($('main'), { childList: true, subtree: true });

load();
loadStoryList();
setUpPublish();
