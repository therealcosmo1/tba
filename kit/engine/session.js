import { prepare } from './load.js';
import { newState, STATE_VERSION } from './state.js';
import { step } from './step.js';
import { World } from './world.js';
import { describeRoom } from './describe.js';
import { buildView } from './view.js';
import { message } from './messages.js';
import { expandText } from './text.js';

export { STATE_VERSION };

const MAX_UNDO = 100;

// Wraps the pure engine with things that live outside game state:
// the undo stack, save slots and the restart confirmation.
export class Session {
  constructor(raw, { storage = null, state = null, seed = null } = {}) {
    this.content = prepare(raw);
    this.storage = storage;
    this.seed = seed;
    this.state = state ?? this.freshState();
    // A save from before content was added: put new things where content says they start.
    for (const [id, o] of Object.entries(this.content.objects)) {
      if (o.kind !== 'room' && !(id in this.state.loc)) {
        this.state.loc[id] = o.in ?? null;
        for (const f of ['locked', 'open', 'on', 'hidden']) if (o[f]) this.state.flags[id] = { ...this.state.flags[id], [f]: true };
      }
    }
    this.undoStack = [];
    this.confirmingRestart = false;
  }

  freshState() {
    return newState(this.content, this.seed ?? (Date.now() >>> 0));
  }

  // The start screen shows content.intro and asks content.questions before play begins.
  get needsSetup() {
    return !this.state.started;
  }

  // Stores the start screen's answers as variables, then returns the opening room description.
  begin(answers = {}) {
    this.state = { ...this.state, started: true, vars: { ...this.state.vars, ...answers } };
    const w = new World(this.content, this.state);
    describeRoom(w);
    return w.out;
  }

  // Returns { output, reset }. `reset` means the UI should clear the transcript
  // and go back to the start screen.
  send(input) {
    const said = input.trim().toLowerCase().replace(/[^a-z\s]/g, '').replace(/\s+/g, ' ');
    if (this.confirmingRestart) {
      this.confirmingRestart = false;
      if (said === 'yes' || said === 'y') {
        this.state = this.freshState();
        this.undoStack = [];
        return { output: [], reset: true };
      }
      return { output: [this.meta('restartCancelled')] };
    }
    switch (said) {
      case 'undo': return this.undo();
      case 'save': return this.save();
      case 'restore':
      case 'load': return this.restore();
      case 'restart':
        this.confirmingRestart = true;
        return { output: [this.meta('restartConfirm')] };
    }
    const r = step(this.content, this.state, input);
    if (r.tookTurn) {
      this.undoStack.push(this.state);
      if (this.undoStack.length > MAX_UNDO) this.undoStack.shift();
    }
    this.state = r.state;
    return { output: r.output };
  }

  undo() {
    const prev = this.undoStack.pop();
    if (!prev) return { output: [this.meta('nothingToUndo')] };
    this.state = prev;
    return { output: [this.meta('undone')] };
  }

  save() {
    if (!this.storage?.set('save', this.state)) return { output: [this.meta('saveUnavailable')] };
    return { output: [this.meta('saved')] };
  }

  restore() {
    const saved = this.storage?.get('save');
    if (saved?.v !== STATE_VERSION) return { output: [this.meta('nothingToRestore')] };
    this.undoStack.push(this.state);
    this.state = saved;
    const w = new World(this.content, this.state);
    w.say(w.msg('restored'), 'meta');
    describeRoom(w);
    return { output: w.out };
  }

  // A built-in message (engine/messages.js) with the game's override, for the page too.
  msg(key, params) {
    return message(this.content.messages, key, params, this.state.vars);
  }

  // The game's status line (game settings), filled in without moving any {once} or
  // {cycle} counters, since it is redrawn every turn.
  statusLine() {
    if (!this.content.status) return null;
    return expandText(this.content.status, { vars: this.state.vars, random: () => 0, count: () => 0 });
  }

  meta(key, params) {
    return { text: this.msg(key, params), cls: 'meta' };
  }

  view() {
    return buildView(this.content, this.state);
  }
}
