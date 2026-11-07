// Menu conversations. An NPC's `conversation` is a small graph, usually written in the
// story editor (game/story.js):
//
//   conversation: {
//     start: 'hello',          // first node
//     again: 'welcomeBack',    // optional: node used when rejoining
//     leave: 'You bow out.',   // optional: text when the player leaves
//     nodes: {
//       hello: {
//         say: 'Text the NPC says',
//         effects: [...],      // optional: run when this line is reached (see story.js)
//         options: [
//           { text: 'A reply', go: 'nextNode' },
//           { text: 'A reply that ends it', end: true },
//           { text: 'Shown only sometimes', go: 'x', when: [conditions] },
//           { text: 'Does something', effects: [{ type: 'setVar', name: 'flattered', value: true }] },
//         ],
//         noLeave: true,       // optional: hide the automatic "Leave" option
//       },
//     },
//   }
//
// An option with no `go` and no `end` keeps the conversation on the same line.
// While a conversation is open the player can type or click an option number, type
// LEAVE, or type any normal command, which steps them out of the conversation first.
import { check, apply } from './story.js';

const LEAVE_WORDS = new Set(['leave', 'bye', 'goodbye', 'farewell']);

export function startConversation(w, npc) {
  const conv = w.obj(npc).conversation;
  const seenBefore = w.state.talked[npc] > 0;
  w.state.talked[npc] = (w.state.talked[npc] ?? 0) + 1;
  w.state.convo = { npc, node: null };
  w.say(w.msg('talkingWith', { person: w.the(npc) }), 'meta');
  return goTo(w, seenBefore && conv.again ? conv.again : conv.start);
}

export function endConversation(w, text) {
  const { npc } = w.state.convo;
  const conv = w.obj(npc).conversation;
  w.state.convo = null;
  w.say(w.text(text ?? (conv.leave || undefined)) ?? w.msg('excuse', { person: w.the(npc) }));
}

export function currentOptions(w) {
  const { npc, node } = w.state.convo;
  const n = w.obj(npc).conversation.nodes[node];
  const opts = (n.options ?? []).filter((o) => check(w, o.when));
  return n.noLeave ? opts : [...opts, { text: w.msg('leaveOption'), end: true }];
}

function showOptions(w) {
  currentOptions(w).forEach((o, i) => w.say(`${i + 1}. ${w.text(o.text)}`, 'choice', { choice: i + 1 }));
}

// Returns signals from the node's effects (see story.js).
function goTo(w, nodeId) {
  const { npc } = w.state.convo;
  const node = w.obj(npc).conversation.nodes[nodeId];
  if (!node) throw new Error(`${npc}: conversation has no node "${nodeId}"`);
  w.state.convo.node = nodeId;
  w.state.seen[`${npc}:${nodeId}`] = true;
  w.say(w.text(node.say), 'speech');
  const signals = apply(w, node.effects);
  if (w.state.convo && !signals.end && !w.state.ended) showOptions(w);
  return signals;
}

// Handles input while a conversation is open. Returns:
//   { done: 'turn' | 'error', signals }  the input was a conversation move
//   null                                 the player stepped away; parse the input normally
export function conversationInput(w, words) {
  const st = w.state;
  if (words.length === 1 && /^\d+$/.test(words[0])) {
    const opts = currentOptions(w);
    const o = opts[Number(words[0]) - 1];
    if (!o) {
      w.say(w.msg('chooseNumber', { count: opts.length }), 'error');
      return { done: 'error', signals: {} };
    }
    w.say(w.text(o.text), 'said');
    if (o.set) Object.assign(st.vars, o.set);
    const signals = apply(w, o.effects);
    if (o.command) signals.command = o.command;
    if (o.end || signals.end) {
      if (st.convo) endConversation(w, o.endText);
      delete signals.end;
    } else if (st.ended) {
      st.convo = null;
    } else if (o.go) {
      Object.assign(signals, goTo(w, o.go));
    } else if (!signals.command && !signals.start) {
      showOptions(w);
    }
    if (signals.command && st.convo) st.convo = null;
    return { done: 'turn', signals };
  }
  if (words.length === 1 && LEAVE_WORDS.has(words[0])) {
    endConversation(w);
    return { done: 'turn', signals: {} };
  }
  // TALK TO / ASK / X the person you're already talking to: show the choices again.
  const npcWords = w.obj(st.convo.npc).words ?? new Set();
  const talking = ['talk', 'speak', 'ask', 'tell', 'greet', 'say', 'hello', 'hi', 'x', 'examine', 'question'].includes(words[0]);
  const pronoun = words.some((x) => ['him', 'her', 'them'].includes(x));
  if (talking && (words.length === 1 || pronoun || ['say', 'hello', 'hi'].includes(words[0]) || words.some((x) => npcWords.has(x)))) {
    w.say(w.msg('talkingWith', { person: w.the(st.convo.npc) }), 'meta');
    showOptions(w);
    return { done: 'error', signals: {} };
  }
  w.say(w.msg('stepAway', { person: w.the(st.convo.npc) }), 'implicit');
  st.convo = null;
  return null;
}
