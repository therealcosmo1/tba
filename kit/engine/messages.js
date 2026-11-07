// Every built-in message the player can see: parser replies, default action results,
// room descriptions' standard sentences, conversations, saving, and the page's labels.
// A game overrides any of them in the editor (Game tab, Messages), stored as
// story.game.messages { key: text }; an empty override keeps the default.
//
// Messages are templates. {name} placeholders are filled from the message's params
// (listed in `params` for the editor), then from the game's variables ({pname} ...).
// Each param also has a capitalised form for the start of a sentence: {thing} is
// "the lamp", {Thing} is "The lamp".
const T = (group, text, about, params = []) => ({ group, text, about, params });

export const MESSAGE_GROUPS = ['Parser', 'Actions', 'Describing places', 'Conversations', 'Saving and undo', 'Page'];

export const MESSAGES = {
  // Parser
  empty: T('Parser', 'Type a command. HELP lists what you can do.', 'The player pressed Enter on an empty line'),
  unknownWord: T('Parser', 'I don\'t know the word "{word}".', 'A word the game doesn\'t know', ['word']),
  notVerb: T('Parser', "That's not a verb I recognise.", 'The command doesn\'t start with a verb'),
  notUnderstood: T('Parser', "I didn't understand that sentence.", 'The words are known but the sentence isn\'t'),
  notHere: T('Parser', "You can't see any such thing.", 'The thing named isn\'t here'),
  noIt: T('Parser', "I'm not sure what you're referring to.", '"it" with nothing mentioned before'),
  ambiguous: T('Parser', 'Which do you mean, {options}?', 'More than one thing matches', ['options']),
  missing: T('Parser', 'What do you want to {verb}?', 'A verb without the thing it needs', ['verb']),
  missingDir: T('Parser', 'Which way do you want to go?', '"go" without a direction'),
  nothingToTake: T('Parser', "There's nothing here to take.", '"take all" with nothing to take'),
  nothingToDrop: T('Parser', "You aren't carrying anything to drop.", '"drop all" with nothing carried'),
  nothingToRepeat: T('Parser', "There's no previous command to repeat.", '"again" as the first command'),
  tooFar: T('Parser', "That's too far away.", 'Touching something only seen from here (another room)'),
  ended: T('Parser', 'The story has ended. Type UNDO or RESTART.', 'Any command after the game has ended'),
  help: T('Parser', [
    'Type commands in plain English, for example:',
    '  look · examine the door · open it · go north · take everything',
    'Shortcuts: x (examine), i (inventory), l (look), z (wait), g (again), n s e w ne nw se sw u d.',
    'Chain commands with THEN or full stops. IT means the last thing you mentioned.',
    'Game: UNDO, SAVE, RESTORE, RESTART.',
    'Click things on the map or in your inventory to fill in the command line.',
  ].join('\n'), 'The HELP command (each line is shown as a line)'),

  // Actions
  cantGo: T('Actions', "You can't go that way.", 'A direction with no exit (rooms can override per direction)'),
  locked: T('Actions', '{Thing} is locked.', 'Trying to open or go through something locked', ['thing']),
  firstOpening: T('Actions', '(first opening {thing})', 'Opening a door on the way through', ['thing']),
  firstTaking: T('Actions', '(first taking {thing})', 'Picking something up before using it', ['thing']),
  firstTakingOff: T('Actions', '(first taking off {thing})', 'Taking off something worn before dropping it', ['thing']),
  examineNothing: T('Actions', 'You see nothing special about {thing}.', 'Examining something with no description', ['thing']),
  isOpen: T('Actions', '{Thing} is open.', 'After examining something that opens', ['thing']),
  isClosed: T('Actions', '{Thing} is closed.', 'After examining something closed, or looking inside it', ['thing']),
  wearingIt: T('Actions', "You're wearing it.", 'After examining something worn'),
  searchNothing: T('Actions', 'You find nothing of interest.', 'Searching something that holds nothing'),
  searchEmpty: T('Actions', "There's nothing {prep} {thing}.", 'Searching an empty container or surface', ['prep', 'thing']),
  alreadyHave: T('Actions', 'You already have that.', 'Taking something already held'),
  notThere: T('Actions', "{Thing} isn't {prep} {other}.", '"take X from Y" when X isn\'t there', ['thing', 'prep', 'other']),
  takeSelf: T('Actions', "You can't take yourself.", 'Taking the player'),
  takePerson: T('Actions', "{Thing} wouldn't appreciate that.", 'Taking a person', ['thing']),
  cantTake: T('Actions', "That's not something you can pick up.", 'Taking something fixed (objects can have their own text)'),
  taken: T('Actions', 'Taken.', 'Picking something up', ['thing']),
  notCarrying: T('Actions', "You aren't carrying that.", 'Dropping something not held'),
  dropped: T('Actions', 'Dropped.', 'Dropping something', ['thing']),
  putOnSelf: T('Actions', "You can't put something on itself.", 'Putting something on itself'),
  putInSelf: T('Actions', "You can't put something inside itself.", 'Putting something in itself'),
  cantPutOn: T('Actions', "You can't put things on {thing}.", 'Putting something on what isn\'t a surface', ['thing']),
  cantPutIn: T('Actions', "You can't put things in {thing}.", 'Putting something in what isn\'t a container', ['thing']),
  putOn: T('Actions', 'You put {thing} on {other}.', 'Putting something on a surface', ['thing', 'other']),
  putIn: T('Actions', 'You put {thing} in {other}.', 'Putting something in a container', ['thing', 'other']),
  emptyHanded: T('Actions', "You're empty-handed.", 'INVENTORY with nothing carried'),
  carrying: T('Actions', 'You are carrying:', 'INVENTORY, above the list'),
  wornTag: T('Actions', '(worn)', 'After a worn item in the inventory'),
  litTag: T('Actions', '(lit)', 'After a light that is on, in the inventory'),
  onTag: T('Actions', '(on)', 'After something switched on, in the inventory'),
  alreadyHolding: T('Actions', "You're already holding it.", 'Going to something carried'),
  alreadyHere: T('Actions', "You're already here.", 'Going to the room you\'re in, or to yourself'),
  approach: T('Actions', 'You make your way over to {thing}.', 'Going to something in the room', ['thing']),
  cantEnter: T('Actions', "That's not something you can enter.", 'Entering something that leads nowhere'),
  cantOpen: T('Actions', "That's not something you can open.", 'Opening something that doesn\'t open'),
  alreadyOpen: T('Actions', "It's already open.", 'Opening something open'),
  opened: T('Actions', 'You open {thing}.', 'Opening something', ['thing']),
  cantClose: T('Actions', "That's not something you can close.", 'Closing something that doesn\'t close'),
  alreadyClosed: T('Actions', "It's already closed.", 'Closing something closed'),
  closed: T('Actions', 'You close {thing}.', 'Closing something', ['thing']),
  noLock: T('Actions', "That doesn't have a lock.", 'Unlocking something without a lock'),
  notLocked: T('Actions', "It isn't locked.", 'Unlocking something unlocked'),
  unlockWith: T('Actions', "You'll need to say what to unlock {thing} with.", '"unlock X" without saying with what', ['thing']),
  wrongKey: T('Actions', "{Thing} doesn't fit the lock.", 'Unlocking with the wrong key', ['thing']),
  unlocked: T('Actions', 'You unlock {thing}.', 'Unlocking something', ['thing']),
  cantEat: T('Actions', "That's not something you'd want to eat.", 'Eating something not edible'),
  eaten: T('Actions', 'You eat {thing}.', 'Eating something (objects can have their own text)', ['thing']),
  cantDrink: T('Actions', "That's not something you can drink.", 'Drinking something not drinkable'),
  drunk: T('Actions', 'You drink {thing}.', 'Drinking something (objects can have their own text)', ['thing']),
  cantWear: T('Actions', "You can't wear that.", 'Wearing something not wearable'),
  alreadyWearing: T('Actions', "You're already wearing it.", 'Wearing something worn'),
  wear: T('Actions', 'You put on {thing}.', 'Wearing something (objects can have their own text)', ['thing']),
  notWearing: T('Actions', "You aren't wearing that.", 'Taking off something not worn'),
  takeOff: T('Actions', 'You take off {thing}.', 'Taking something off', ['thing']),
  talkSelf: T('Actions', 'You mutter something to yourself.', 'Talking to yourself'),
  cantTalk: T('Actions', "You can't talk to that.", 'Talking to a thing'),
  noConversation: T('Actions', "{Thing} doesn't seem interested in conversation.", 'Talking to a person with nothing to say', ['thing']),
  cantClimb: T('Actions', "You can't climb that.", 'Climbing something unclimbable'),
  onlyDown: T('Actions', '{Thing} only goes down from here.', 'Going UP stairs that lead down from here', ['thing']),
  onlyUp: T('Actions', '{Thing} only goes up from here.', 'Going DOWN stairs that lead up from here', ['thing']),
  notTalking: T('Conversations', "You aren't talking to anyone.", 'LEAVE or BYE outside a conversation'),
  throwAway: T('Actions', "You'd only have to go and fetch {thing} again.", 'THROW something (games can add reactions to it)', ['thing']),
  nobodyHere: T('Actions', 'There is nobody here to talk to.', 'SAY or ASK with nobody around'),
  talkDark: T('Actions', "You can't see who you'd be talking to.", 'SAY or ASK in the dark'),
  wait: T('Actions', 'Time passes.', 'WAIT'),
  cantSwitch: T('Actions', "That's not something you can switch on or off.", 'Turning on something that has no switch'),
  alreadyOn: T('Actions', '{Thing} is already on.', 'Turning on something on', ['thing']),
  alreadyOff: T('Actions', '{Thing} is already off.', 'Turning off something off', ['thing']),
  switchedOn: T('Actions', 'You turn on {thing}.', 'Turning something on (objects can have their own text)', ['thing']),
  switchedOff: T('Actions', 'You turn off {thing}.', 'Turning something off (objects can have their own text)', ['thing']),
  isOn: T('Actions', '{Thing} is on.', 'After examining something switched on (objects can have their own text)', ['thing']),
  isOff: T('Actions', '{Thing} is off.', 'After examining something switched off (objects can have their own text)', ['thing']),
  lookExit: T('Actions', 'That way is {thing}.', 'LOOK in a direction with a way out (locations can have their own text)', ['thing']),
  lookNothing: T('Actions', 'You see nothing special that way.', 'LOOK in a direction with nothing there'),
  smellNothing: T('Actions', 'You smell nothing unexpected.', 'SMELL with no smell text'),
  listenNothing: T('Actions', 'You hear nothing unexpected.', 'LISTEN with no listen text'),
  touchNothing: T('Actions', 'You feel nothing unexpected.', 'TOUCH with no touch text'),
  ownVerb: T('Actions', 'Nothing happens.', "One of the game's own verbs with no reply of its own", ['thing', 'other']),

  // Describing places
  dark: T('Describing places', 'It is pitch dark. You can\'t see a thing.', 'A dark location with no light (locations can have their own text)'),
  alsoHere: T('Describing places', 'You can also see {list} here.', 'Loose things listed after a room\'s description', ['list']),
  waysOut: T('Describing places', 'Ways out: {list}.', 'The exits listed after a room\'s description', ['list']),
  contents: T('Describing places', '{Prep} {thing} {isAre} {list}.', 'What\'s on a surface or in a container', ['prep', 'thing', 'isAre', 'list']),
  overlookThings: T('Describing places', 'Across the way, on {place}, you can see {list}.', 'Looking at a place seen from here, with things in it', ['place', 'list']),
  overlookEmpty: T('Describing places', 'You can see nothing of note on {place}.', 'Looking at a place seen from here, with nothing in it', ['place']),
  overlookPlace: T('Describing places', 'Across the way you can see {place}.', 'A place seen from here, mentioned in the room description', ['place']),

  // Conversations
  talkingWith: T('Conversations', '(Talking with {person}. Choose a number, or type LEAVE.)', 'When a conversation starts', ['person']),
  leaveOption: T('Conversations', 'Leave the conversation.', 'The last option of every conversation'),
  excuse: T('Conversations', 'You excuse yourself from {person}.', 'Leaving a conversation (people can have their own text)', ['person']),
  chooseNumber: T('Conversations', 'Choose a number from 1 to {count}, or type LEAVE.', 'A number that isn\'t an option', ['count']),
  stepAway: T('Conversations', '(You step away from {person}.)', 'Typing a command during a conversation', ['person']),
  follows: T('Conversations', '{Person} follows you.', 'Someone who follows the player arrives with them', ['person']),
  stillTalking: T('Conversations', '(You are still in a conversation. Choose a number, or type LEAVE.)', 'Coming back to the page mid-conversation'),

  // Saving and undo
  nothingToUndo: T('Saving and undo', 'There is nothing to undo.', 'UNDO at the start'),
  undone: T('Saving and undo', 'Undone.', 'UNDO'),
  saved: T('Saving and undo', 'Game saved.', 'SAVE'),
  saveUnavailable: T('Saving and undo', "Saving isn't available in this browser.", 'SAVE when the browser blocks storage'),
  nothingToRestore: T('Saving and undo', 'There is no saved game to restore.', 'RESTORE with no save'),
  restored: T('Saving and undo', 'Game restored.', 'RESTORE'),
  restartConfirm: T('Saving and undo', 'Start over from the beginning? Type YES to confirm.', 'RESTART'),
  restartCancelled: T('Saving and undo', 'Restart cancelled.', 'Anything but YES after RESTART'),
  welcomeBack: T('Saving and undo', 'Welcome back. Type RESTART to begin again.', 'Coming back to the page'),

  // Page
  begin: T('Page', 'Begin', 'The start screen\'s button'),
  answerNeeded: T('Page', 'Enter {question} to continue.', 'A start-screen question left empty', ['question']),
  mapHeading: T('Page', 'Map', 'Heading of the map panel'),
  noMap: T('Page', 'No map for this room.', 'Under the map when the room has none'),
  byThing: T('Page', 'You are by {thing}.', 'Under the map, where the player stands', ['thing']),
  inventoryHeading: T('Page', 'Inventory', 'Heading of the inventory panel'),
  inventoryEmpty: T('Page', 'Empty-handed', 'The inventory panel with nothing carried'),
  turn: T('Page', 'Turn {count}', 'The turn counter at the top', ['count']),
};

const capFirst = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);

// The game's message for `key`: its override if it has one, else the default.
// params fill {name} (and {Name}, capitalised); vars fill anything left ({pname} ...).
export function message(messages, key, params = {}, vars = {}) {
  const template = messages?.[key] ?? MESSAGES[key]?.text;
  if (template === undefined) throw new Error(`Unknown message "${key}"`);
  return formatText(template, params, vars);
}

// Fills a template's {name} placeholders: params first ({Name} capitalised), then vars.
export function formatText(template, params = {}, vars = {}) {
  return template.replace(/\{(\w+)\}/g, (m, k) => {
    if (k in params) return String(params[k]);
    const lower = k[0].toLowerCase() + k.slice(1);
    if (k !== lower && lower in params) return capFirst(String(params[lower]));
    return vars[k] ?? m;
  });
}

// The defaults, with a game's non-empty overrides on top.
export function messageTable(overrides = {}) {
  const table = Object.fromEntries(Object.entries(MESSAGES).map(([k, m]) => [k, m.text]));
  for (const [k, v] of Object.entries(overrides ?? {})) if (typeof v === 'string' && v.trim() && k in MESSAGES) table[k] = v;
  return table;
}
