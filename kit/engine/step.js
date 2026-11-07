import { World } from './world.js';
import { ACTIONS } from './actions.js';
import { cap, listJoin } from './text.js';
import { splitCommands, tokenize, parse, vocabOf, matchesAnyLine } from './parser.js';
import { startConversation, endConversation, conversationInput } from './conversation.js';
import { runEvents, react, verbAction } from './story.js';

// Actions that can reach things in an overlooked room; everything else needs to touch.
const AT_A_DISTANCE = new Set(['examine', 'look']);
// Examining or walking up to someone with a conversation starts it.
const STARTS_CONVERSATION = new Set(['examine', 'approach', 'talk']);

// The engine's one entry point: (content, state, input) -> { state, output, tookTurn }.
// Never mutates `prev`, has no DOM access, so it runs the same in the browser and in Node.
export function step(content, prev, input) {
  const state = structuredClone(prev);
  const w = new World(content, state);
  const commands = splitCommands(input);
  if (!commands.length) w.say(w.msg('empty'), 'error');
  let tookTurn = false;
  for (const raw of commands) {
    const result = runCommand(w, raw);
    if (result === 'turn') tookTurn = true;
    if (result === 'error') break; // don't run the rest of a chain after a misunderstanding
  }
  return { state, output: w.out, tookTurn };
}

// `nested` is set when an effect runs a command: it happens inside the current turn.
function runCommand(w, raw, nested = false) {
  const st = w.state;
  if (st.ended) {
    w.say(w.msg('ended'), 'meta');
    return 'error';
  }
  let words = tokenize(raw);
  if (!words.length) return 'none';

  if (st.convo) {
    const r = conversationInput(w, words);
    if (r?.done === 'error') return 'error';
    if (r) return nested ? (handleSignals(w, r.signals), 'turn') : finishTurn(w, r.signals);
  }

  if (words.length === 1 && (words[0] === 'again' || words[0] === 'g')) {
    if (!st.last) {
      w.say(w.msg('nothingToRepeat'), 'error');
      return 'error';
    }
    words = st.last;
  } else if (st.pending) {
    const answer = answerPending(w, words);
    if (answer.ask) return 'error';
    words = answer.words;
  }
  st.pending = null;

  const cmd = parse(w, words);
  if (cmd.error) {
    reportError(w, cmd, words);
    return 'error';
  }
  if (!nested) st.last = words;
  execute(w, cmd);
  if (actionOf(w, cmd.action).meta) return 'meta';
  return nested ? 'turn' : finishTurn(w);
}

function finishTurn(w, signals) {
  handleSignals(w, signals);
  if (w.state.ended) return 'turn';
  w.state.turn++;
  w.obj(w.room).eachTurn?.(w);
  w.content.eachTurn?.(w);
  handleSignals(w, runEvents(w));
  return 'turn';
}

// Act on what effects asked for: end or start a conversation, or run a command.
function handleSignals(w, s) {
  if (!s) return;
  if (s.end && w.state.convo) endConversation(w);
  if (w.state.ended) return;
  if (s.start) {
    w.state.convo = null;
    handleSignals(w, startConversation(w, s.start));
  }
  if (s.command) {
    w.depth = (w.depth ?? 0) + 1;
    if (w.depth > 5) throw new Error(`Commands run by effects are nested too deeply ("${s.command}")`);
    runCommand(w, s.command, true);
    w.depth--;
  }
}

// The player is answering "Which do you mean...?" or "What do you want to examine?".
// Either splice the answer into the old command, or treat it as a new command.
function answerPending(w, words) {
  const p = w.state.pending;
  if (p.kind === 'ambiguous') {
    const reply = words.filter((x) => x !== 'one' && x !== 'ones');
    const narrowed = reply.length
      ? p.cands.filter((id) => { const v = vocabOf(w.obj(id)); return reply.every((x) => v.has(x)); })
      : [];
    if (narrowed.length === 1) {
      return { words: [...p.words.slice(0, p.start), `#${narrowed[0]}`, ...p.words.slice(p.end)] };
    }
    if (narrowed.length > 1) {
      w.state.pending = { ...p, cands: narrowed };
      w.say(w.msg('ambiguous', { options: listJoin(narrowed.map((id) => w.the(id)), 'or') }), 'parser');
      return { ask: true };
    }
    return { words };
  }
  if (p.kind === 'missing' && !matchesAnyLine(w.content, words)) {
    return { words: [...p.words, ...words] };
  }
  return { words };
}

function reportError(w, err, words) {
  switch (err.error) {
    case 'unknownWord': return w.say(w.msg('unknownWord', { word: err.word }), 'error');
    case 'notVerb': return w.say(w.msg('notVerb'), 'error');
    case 'notHere': return w.say(w.msg('notHere'), 'error');
    case 'noIt': return w.say(w.msg('noIt'), 'error');
    case 'nothingFor': return w.say(w.msg(err.action === 'drop' ? 'nothingToDrop' : 'nothingToTake'), 'error');
    case 'ambiguous':
      w.state.pending = { kind: 'ambiguous', words, start: err.start, end: err.end, cands: err.cands };
      return w.say(w.msg('ambiguous', { options: listJoin(err.cands.map((id) => w.the(id)), 'or') }), 'parser');
    case 'missing': {
      w.state.pending = { kind: 'missing', words };
      if (err.slotType === 'dir') return w.say(w.msg('missingDir'), 'parser');
      const typed = words.join(' ');
      return w.say(w.msg('missing', { verb: typed.length > 2 ? typed : actionOf(w, err.action).verb }), 'parser');
    }
    default: return w.say(w.msg('notUnderstood'), 'error');
  }
}

// A built-in action, or one of the game's own verbs.
const actionOf = (w, id) => ACTIONS[id] ?? verbAction(w.content, id);

function execute(w, cmd) {
  if (!cmd.multi) {
    perform(w, cmd);
    if (cmd.dobj && cmd.dobj !== w.room) w.state.it = cmd.dobj;
    return;
  }
  // "take all": one line per object, prefixed with its name.
  for (const id of cmd.dobjs) {
    const mark = w.out.length;
    perform(w, { ...cmd, dobj: id });
    if (w.out.length > mark) w.out[mark].text = `${cap(w.name(id))}: ${w.out[mark].text}`;
  }
  w.state.it = cmd.dobjs.at(-1);
}

// Room, then object, then target object get a chance to handle the action first.
// A handler returns true to replace the default, or prints something and returns
// false to let the default carry on.
function perform(w, cmd) {
  const action = actionOf(w, cmd.action);
  if (!AT_A_DISTANCE.has(cmd.action) && !action.distant && [cmd.dobj, cmd.iobj].some((id) => id && w.distant(id))) {
    return w.say(w.msg('tooFar'));
  }
  const room = w.obj(w.room);
  const startRoom = w.room;
  const outerCmd = w.cmd;
  w.cmd = cmd; // for conditions about the thing being used
  const target = [cmd.iobj, cmd.dobj].find((id) => id && !w.carried(id) && !w.distant(id) && w.anchor(id));
  const handled =
    room.before?.[cmd.action]?.(w, cmd) ||
    (cmd.dobj && w.obj(cmd.dobj).on?.[cmd.action]?.(w, cmd)) ||
    (cmd.iobj && w.obj(cmd.iobj).onTarget?.[cmd.action]?.(w, cmd));
  // Editor reactions run before the usual result, and can replace it.
  const reaction = !handled && cmd.dobj ? react(w, cmd.dobj, cmd.action) : null;
  const own = !handled && !reaction?.instead && !w.state.ended ? action.run(w, cmd) : null;
  handleSignals(w, reaction?.signals);
  handleSignals(w, own);
  if (target && w.room === startRoom) w.state.near = w.anchor(target) ?? w.state.near;
  const npc = cmd.dobj && w.obj(cmd.dobj);
  if (STARTS_CONVERSATION.has(cmd.action) && npc?.conversation && !w.distant(cmd.dobj) && !w.state.convo) {
    handleSignals(w, startConversation(w, cmd.dobj));
  }
  w.cmd = outerCmd;
}
