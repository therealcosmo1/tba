// The condition and effect types the editor offers. Each must match an implementation
// in engine/story.js (CHECKS and apply). Field kinds are rendered by rules.js.

export const CONDITIONS = {
  var: { label: 'A variable', fields: [['name', 'var'], ['op', 'op'], ['value', 'value']], defaults: { op: 'is', value: true } },
  turn: { label: 'The turn number', fields: [['op', 'opNum'], ['value', 'number']], defaults: { op: 'atLeast', value: 1 } },
  inRoom: { label: 'The player is in', fields: [['room', 'room']] },
  has: { label: 'The player carries', fields: [['item', 'thing']] },
  talkedTo: { label: 'The player has talked to', fields: [['actor', 'actor']] },
  seenNode: { label: 'The player has heard', fields: [['actor', 'actor'], ['node', 'node']] },
  eventFired: { label: 'This event has happened', fields: [['event', 'event']] },
  thingIn: { label: 'A thing is in', fields: [['thing', 'thing'], ['where', 'place']] },
  doorIs: { label: 'A door or passage is', fields: [['thing', 'door'], ['state', 'doorState']], defaults: { state: 'locked' } },
  switchIs: { label: 'A thing is switched', fields: [['thing', 'switch'], ['state', 'switchState']], defaults: { state: 'on' } },
  thingIs: { label: 'The thing used is', fields: [['thing', 'thing']] },
  otherIs: { label: 'The second thing used is', fields: [['thing', 'thing']] },
};
// Conditions can be turned round with "not" (rules.js shows the toggle for this schema).
Object.defineProperty(CONDITIONS, 'negatable', { value: true });

export const EFFECTS = {
  say: { label: 'Show text', fields: [['text', 'longtext']] },
  setVar: { label: 'Set a variable', fields: [['name', 'var'], ['value', 'value']], defaults: { value: true } },
  addVar: { label: 'Add to a variable', fields: [['name', 'var'], ['value', 'number']], defaults: { value: 1 } },
  move: { label: 'Move a thing or actor', fields: [['thing', 'thing'], ['to', 'place']] },
  startConversation: { label: 'Start a conversation with', fields: [['actor', 'actor']] },
  endConversation: { label: 'End the current conversation', fields: [] },
  fireEvent: { label: 'Trigger an event', fields: [['event', 'event']] },
  command: { label: 'Run a command as the player', fields: [['text', 'text']] },
  endGame: { label: 'End the game', fields: [['text', 'longtext']] },
  setDoor: { label: 'Make a door or passage', fields: [['thing', 'door'], ['state', 'doorState']], defaults: { state: 'unlocked' } },
  setSwitch: { label: 'Switch a thing', fields: [['thing', 'switch'], ['state', 'switchState']], defaults: { state: 'on' } },
  later: { label: 'Trigger an event after some turns', fields: [['event', 'event'], ['turns', 'number']], defaults: { turns: 3 } },
  cancelLater: { label: 'Cancel a waiting event', fields: [['event', 'event']] },
  follow: { label: 'Make an actor follow the player', fields: [['actor', 'actor']] },
  stopFollowing: { label: 'Make an actor stop following', fields: [['actor', 'actor']] },
};

export const DOOR_STATES = [
  { id: 'open', label: 'open' },
  { id: 'closed', label: 'closed' },
  { id: 'locked', label: 'locked' },
  { id: 'unlocked', label: 'unlocked' },
  { id: 'hidden', label: 'hidden' },
  { id: 'shown', label: 'shown (not hidden)' },
];

export const SWITCH_STATES = [{ id: 'on', label: 'on' }, { id: 'off', label: 'off' }];

export const DIRECTIONS = [
  { id: 'n', label: 'north' }, { id: 'ne', label: 'northeast' }, { id: 'e', label: 'east' }, { id: 'se', label: 'southeast' },
  { id: 's', label: 'south' }, { id: 'sw', label: 'southwest' }, { id: 'w', label: 'west' }, { id: 'nw', label: 'northwest' },
  { id: 'u', label: 'up' }, { id: 'd', label: 'down' }, { id: 'in', label: 'in' }, { id: 'out', label: 'out' },
];

export const WALLS = [
  { id: 'n', label: 'north wall' }, { id: 'e', label: 'east wall' }, { id: 's', label: 'south wall' }, { id: 'w', label: 'west wall' },
];

export const PASSAGE_KINDS = [
  { id: 'door', label: 'door' }, { id: 'passage', label: 'passage' }, { id: 'stairs', label: 'stairs' }, { id: 'archway', label: 'archway' },
];

export const OPS = [
  { id: 'is', label: 'is' },
  { id: 'isNot', label: 'is not' },
  { id: 'atLeast', label: 'is at least' },
  { id: 'atMost', label: 'is at most' },
];

export const NUM_OPS = [
  { id: 'atLeast', label: 'is at least' },
  { id: 'atMost', label: 'is at most' },
  { id: 'is', label: 'is exactly' },
];

// What the player can do to an object that it can react to (see react() in engine/story.js).
export const REACTION_ACTIONS = [
  { id: 'examine', label: 'examines it' },
  { id: 'take', label: 'picks it up' },
  { id: 'drop', label: 'drops it' },
  { id: 'putOn', label: 'puts it on something' },
  { id: 'putIn', label: 'puts it in something' },
  { id: 'open', label: 'opens it' },
  { id: 'close', label: 'closes it' },
  { id: 'unlock', label: 'unlocks it' },
  { id: 'search', label: 'searches it' },
  { id: 'touch', label: 'touches it' },
  { id: 'smell', label: 'smells it' },
  { id: 'listen', label: 'listens to it' },
  { id: 'read', label: 'reads it' },
  { id: 'eat', label: 'eats it' },
  { id: 'drink', label: 'drinks it' },
  { id: 'wear', label: 'puts it on (wears it)' },
  { id: 'takeOff', label: 'takes it off' },
  { id: 'enter', label: 'goes into or through it' },
  { id: 'climb', label: 'climbs it' },
  { id: 'approach', label: 'goes over to it' },
  { id: 'talk', label: 'talks to it' },
  { id: 'throw', label: 'throws it' },
  { id: 'switchOn', label: 'switches it on' },
  { id: 'switchOff', label: 'switches it off' },
];
