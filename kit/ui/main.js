import baked from '../content.js';
import { buildGame } from '../engine/story.js';
import { Session, STATE_VERSION } from '../engine/session.js';
import { storage as siteStorage, scoped } from './storage.js';

// ?preview plays the story the editor stored (unsaved edits included); &start=<room>
// starts it there. Otherwise this is the built game.
const params = new URLSearchParams(location.search);
const previewStory = params.has('preview') ? siteStorage.get('preview') : null;
const startRoom = params.get('start');
const content = previewStory
  ? buildGame(startRoom ? { ...previewStory, game: { ...previewStory.game, start: { room: startRoom } } } : previewStory)
  : baked;
const hash = (s) => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0; return h.toString(36); };
// A preview's progress belongs to that exact version of the story and start.
const storage = scoped(previewStory ? `preview-${hash(JSON.stringify(previewStory) + startRoom)}` : `game-${content.title}`);
import { renderMap } from './map.js';
import { renderInventory } from './inventory.js';
import { debugPanel } from './debug.js';

const MAX_LOG = 400;
const MAX_HISTORY = 100;

const $ = (id) => document.getElementById(id);
const logEl = $('log');
const form = $('command');
const input = $('input');

let log = [];
let history = [];
let historyIndex = 0;
let draft = '';
// This playthrough's answers and commands, which the editor can turn into a walkthrough.
let playthrough = null;

// ?debug=1 (the editor's Play button) adds the debug panel.
let debug = null;
function setUpDebug() {
  if (!params.has('debug') || debug) return;
  debug = debugPanel(session, content, (note) => {
    if (note) print([{ text: note, cls: 'meta' }]);
    refresh();
    save();
  });
  document.querySelector('.side').append(debug.panel);
}

// The page's own labels, from the game's messages.
function setLabels() {
  $('setup-form').querySelector('button[type="submit"]').textContent = session.msg('begin');
  $('map-heading').textContent = session.msg('mapHeading');
  $('inv-heading').textContent = session.msg('inventoryHeading');
}

// Resume the last session if there is one; otherwise show the start screen.
const autosave = storage.get('autosave');
let session;
if (autosave?.state?.v === STATE_VERSION && autosave.state.started) {
  session = new Session(content, { storage, state: autosave.state });
  history = autosave.history ?? [];
  playthrough = autosave.playthrough ?? null;
  print(autosave.log ?? [], { live: false });
  print([session.meta('welcomeBack')]);
  if (session.state.convo) print([session.meta('stillTalking')]);
  historyIndex = history.length;
  refresh();
} else {
  session = new Session(content, { storage });
  showSetup();
}
setLabels();
setUpDebug();
if (content.title) document.title = content.title;

function showSetup() {
  $('app').hidden = true;
  $('setup').hidden = false;
  $('setup-title').textContent = content.title;
  if (content.title) document.title = content.title;
  $('setup-intro').replaceChildren(
    ...(content.intro ?? []).map((line) => {
      const p = document.createElement('p');
      p.textContent = line;
      return p;
    }),
  );
  // One text field per start-screen question from the game settings.
  $('setup-fields').replaceChildren(...(content.questions ?? []).flatMap((q, i) => {
    const label = document.createElement('label');
    label.htmlFor = `setup-q${i}`;
    label.textContent = q.label || q.var;
    const field = document.createElement('input');
    Object.assign(field, { id: `setup-q${i}`, name: q.var, type: 'text', maxLength: 40, required: true });
    return [label, field];
  }));
  $('setup-fields').hidden = !content.questions?.length;
  $('setup-error').textContent = '';
  $('setup-form').reset();
  ($('setup-q0') ?? $('setup-form').querySelector('button')).focus();
}

$('setup-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const answers = {};
  for (const [i, q] of (content.questions ?? []).entries()) {
    const field = $(`setup-q${i}`);
    const value = field.value.trim().replace(/\s+/g, ' ');
    if (!value) {
      $('setup-error').textContent = session.msg('answerNeeded', { question: (q.label || q.var).toLowerCase() });
      field.focus();
      return;
    }
    answers[q.var] = value;
  }
  $('setup').hidden = true;
  $('app').hidden = false;
  log = [];
  logEl.replaceChildren();
  print(session.begin(answers));
  playthrough = { answers, commands: [] };
  refresh();
  save();
  input.focus();
});

function save() {
  storage.set('autosave', { state: session.state, log: log.slice(-MAX_LOG), history, playthrough });
  if (playthrough) siteStorage.set('last-playthrough', { ...playthrough, title: content.title, start: startRoom });
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const cmd = input.value;
  input.value = '';
  run(cmd);
});

function run(cmd) {
  if (cmd.trim()) {
    playthrough?.commands.push(cmd.trim());
    history.push(cmd);
    if (history.length > MAX_HISTORY) history.shift();
  }
  historyIndex = history.length;
  draft = '';
  print([{ text: `> ${cmd}`, cls: 'echo' }]);
  const result = session.send(cmd);
  if (result.reset) {
    storage.remove('autosave');
    showSetup();
    return;
  }
  print(result.output);
  refresh();
  save();
}

// Up/down arrows walk through command history, keeping whatever was half-typed.
input.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (historyIndex === history.length) draft = input.value;
    if (historyIndex > 0) input.value = history[--historyIndex];
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (historyIndex < history.length) {
      historyIndex++;
      input.value = historyIndex === history.length ? draft : history[historyIndex];
    }
  } else {
    return;
  }
  requestAnimationFrame(() => input.setSelectionRange(input.value.length, input.value.length));
});

// Clicking the transcript returns focus to the command line, unless the player is selecting text.
logEl.addEventListener('mouseup', () => {
  if (!window.getSelection()?.toString()) input.focus();
});

// Conversation options in the latest output can be clicked; older ones go inert.
function retireChoices() {
  for (const el of logEl.querySelectorAll('.choice.live')) {
    el.classList.remove('live');
    el.removeAttribute('role');
    el.removeAttribute('tabindex');
  }
}

function print(entries, { live = true } = {}) {
  retireChoices();
  for (const entry of entries) {
    log.push(entry);
    const p = document.createElement('p');
    p.className = entry.cls ? `entry ${entry.cls}` : 'entry';
    if (live && !entry.choice && entry.cls !== 'echo') linkWords(p, entry.text);
    else p.textContent = entry.text;
    if (entry.choice && live) {
      p.classList.add('live');
      p.setAttribute('role', 'button');
      p.tabIndex = 0;
      const choose = () => p.classList.contains('live') && run(String(entry.choice));
      p.addEventListener('click', choose);
      p.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          choose();
        }
      });
    }
    logEl.append(p);
  }
  while (log.length > MAX_LOG) {
    log.shift();
    logEl.firstElementChild.remove();
  }
  logEl.scrollTop = logEl.scrollHeight;
}

// Names of things the player can see become clickable in the transcript, like the map.
function linkWords(p, text) {
  const names = [...new Set(session.view().visible)].filter((n) => n && n.length > 2).sort((a, b) => b.length - a.length);
  if (!names.length) { p.textContent = text; return; }
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`\\b(${names.map(esc).join('|')})\\b`, 'gi');
  let last = 0;
  for (const m of text.matchAll(re)) {
    if (m.index > last) p.append(text.slice(last, m.index));
    const word = document.createElement('span');
    word.className = 'word';
    word.textContent = m[0];
    word.setAttribute('role', 'button');
    word.tabIndex = -1;
    const name = names.find((n) => n.toLowerCase() === m[0].toLowerCase()) ?? m[0];
    word.addEventListener('click', () => pick(name));
    p.append(word);
    last = m.index + m[0].length;
  }
  if (last < text.length) p.append(text.slice(last));
}

// Put a word into the command line: replace a finished command, or append to a half-typed one.
function pick(name) {
  const current = input.value.trim();
  input.value = current && !current.endsWith(name) ? `${current} ${name}` : `examine ${name}`;
  input.focus();
}

function refresh() {
  const view = session.view();
  $('status-room').textContent = view.roomName;
  $('status-who').textContent = session.statusLine() ?? (content.questions ?? []).map((q) => session.state.vars[q.var]).filter(Boolean).join(' · ');
  $('status-turn').textContent = session.msg('turn', { count: view.turn });
  renderMap($('map'), $('map-caption'), view, pick, {
    noMap: session.msg('noMap'),
    by: (thing) => session.msg('byThing', { thing }),
  });
  renderInventory($('inventory'), view.inventory, pick, { empty: session.msg('inventoryEmpty') });
  debug?.draw();
}
