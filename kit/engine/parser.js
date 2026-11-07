import { DIRS } from './grammar.js';
import { scope } from './scope.js';
import { PLAYER } from './world.js';

const STOP_WORDS = new Set(['the', 'a', 'an', 'some', 'please']);
const PRONOUNS = new Set(['it', 'them', 'him', 'her']);

// "take lamp then n. drop it" -> ["take lamp", "n", "drop it"]
export function splitCommands(input) {
  return input.toLowerCase().split(/[.;!?]+|\bthen\b/).map((s) => s.trim()).filter(Boolean);
}

export function tokenize(s) {
  return s
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/,/g, ' and ')
    .replace(/[^a-z0-9#\s-]/g, ' ')
    .split(/\s+/)
    .filter((x) => x && !STOP_WORDS.has(x));
}

export function vocabOf(o) {
  return o.words;
}

// Match a grammar line against the words. Noun-phrase slots take the shortest run of
// words that lets the rest of the line match. A [topic] slot takes any words at all
// (ASK X ABOUT ...) and isn't looked up. Returns the slots, or null.
function matchLine(tokens, words) {
  const slots = [];
  const rec = (ti, wi) => {
    if (ti === tokens.length) return wi === words.length;
    const t = tokens[ti];
    if (t[0] !== '[') return words[wi] === t && rec(ti + 1, wi + 1);
    const type = t.slice(1, -1);
    if (type === 'dir') {
      if (!(words[wi] in DIRS)) return false;
      slots.push({ type, words: [words[wi]], start: wi, end: wi + 1 });
      if (rec(ti + 1, wi + 1)) return true;
      slots.pop();
      return false;
    }
    for (let end = wi + 1; end <= words.length; end++) {
      slots.push({ type, words: words.slice(wi, end), start: wi, end });
      if (rec(ti + 1, end)) return true;
      slots.pop();
    }
    return false;
  };
  return rec(0, 0) ? slots : null;
}

export function matchesAnyLine(content, words) {
  return content.lines.some((line) => matchLine(line.tokens, words));
}

// Returns a command { action, dobjs, dobj, iobj, dir, multi } or an error
// { error, ... } that step.js turns into a message (and maybe a pending question).
export function parse(w, words) {
  const matches = [];
  for (const line of w.content.lines) {
    const slots = matchLine(line.tokens, words);
    if (slots) matches.push({ line, slots });
  }
  if (!matches.length) return noMatch(w, words);
  matches.sort((a, b) => b.line.literals - a.line.literals);
  const inScope = scope(w);
  let firstError = null;
  for (const m of matches) {
    const r = resolve(w, m, inScope);
    if (!r.error) return r;
    firstError ??= r;
  }
  return firstError;
}

function noMatch(w, words) {
  const unknown = words.find((x) => x[0] !== '#' && !w.content.vocab.has(x));
  if (unknown) return { error: 'unknownWord', word: unknown };
  if (!w.content.verbWords.has(words[0])) return { error: 'notVerb' };
  // "x" or "look at" with nothing after it: ask for the missing noun.
  for (const line of w.content.lines) {
    const t = line.tokens;
    if (words.length < t.length && words.every((x, i) => t[i] === x) && t[words.length][0] === '[') {
      return { error: 'missing', action: line.action, slotType: t[words.length].slice(1, -1), words };
    }
  }
  return { error: 'notUnderstood' };
}

function resolve(w, m, inScope) {
  const cmd = { action: m.line.action };
  const nounSlots = [];
  for (const s of m.slots) {
    if (s.type === 'dir') {
      cmd.dir = DIRS[s.words[0]];
      continue;
    }
    if (s.type === 'topic') {
      cmd.topic = s.words.join(' ');
      continue;
    }
    const r = resolveNounPhrase(w, s.words, s.type, inScope, cmd.action);
    if (r.error) return { ...r, start: s.start, end: s.end };
    nounSlots.push({ ...r, type: s.type });
  }
  const [d, i] = nounSlots;
  if (d) {
    cmd.dobjs = d.ids;
    cmd.dobj = d.ids[0];
    cmd.multi = d.all || d.ids.length > 1;
  }
  if (i) cmd.iobj = i.ids[0];
  // "take all from table": only what's actually on the table.
  if (d?.all && cmd.iobj) {
    cmd.dobjs = cmd.dobjs.filter((id) => w.parent(id) === cmd.iobj);
    if (!cmd.dobjs.length) return { error: 'nothingFor', action: cmd.action };
    cmd.dobj = cmd.dobjs[0];
  }
  return cmd;
}

function resolveNounPhrase(w, words, type, inScope, action) {
  const multi = type === 'objs' || type === 'heldobjs';
  if (words.length === 1 && words[0][0] === '#') return { ids: [words[0].slice(1)] };
  if (words.length === 1 && PRONOUNS.has(words[0])) {
    const it = w.state.it;
    return it && inScope.includes(it) ? { ids: [it] } : { error: 'noIt' };
  }
  if (multi && (words[0] === 'all' || words[0] === 'everything')) {
    let except = [];
    const k = words.findIndex((x) => x === 'except' || x === 'but');
    if (k > 0) {
      const r = resolveList(w, words.slice(k + 1), type, inScope, action);
      if (r.error) return r;
      except = r.ids;
    }
    const ids = inScope.filter((id) => allowedForAll(w, id, action) && !except.includes(id));
    return ids.length ? { ids, all: true } : { error: 'nothingFor', action };
  }
  if (multi && words.includes('and')) return resolveList(w, words, type, inScope, action);
  return resolveSingle(w, words, type, inScope, action);
}

function resolveList(w, words, type, inScope, action) {
  const ids = [];
  let part = [];
  for (const x of [...words, 'and']) {
    if (x !== 'and') { part.push(x); continue; }
    if (!part.length) continue;
    const r = resolveSingle(w, part, type, inScope, action);
    if (r.error) return r;
    for (const id of r.ids) if (!ids.includes(id)) ids.push(id);
    part = [];
  }
  return ids.length ? { ids } : { error: 'notUnderstood' };
}

function resolveSingle(w, words, type, inScope, action) {
  const unknown = words.find((x) => !w.content.vocab.has(x));
  if (unknown) return { error: 'unknownWord', word: unknown };
  let cands = inScope.filter((id) => {
    const v = vocabOf(w.obj(id));
    return words.every((x) => v.has(x));
  });
  if (!cands.length) return { error: 'notHere' };
  // Narrow ties: the last word is usually the noun ("flower" the lily, not the flower table)...
  const narrow = (keep) => {
    if (cands.length > 1) {
      const kept = cands.filter(keep);
      if (kept.length) cands = kept;
    }
  };
  const head = words.at(-1);
  narrow((id) => w.obj(id).names?.includes(head));
  // ...then by what makes sense for the action.
  if (type === 'held' || type === 'heldobjs') narrow((id) => w.carried(id));
  if (action === 'take') narrow((id) => !w.carried(id));
  if (cands.length > 1) return { error: 'ambiguous', cands };
  return { ids: cands };
}

function allowedForAll(w, id, action) {
  const o = w.obj(id);
  if (id === PLAYER || o.kind === 'room') return false;
  if (action === 'drop') return w.held(id) && !w.is(id, 'worn');
  if (action === 'take') return !w.carried(id) && !o.scenery && !o.fixed && !o.animate;
  return false;
}
