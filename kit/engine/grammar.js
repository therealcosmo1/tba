// Verb grammar as data. Each line is tried against the whole input; lines with more
// literal words win ties, so "take off [held]" beats "take [objs]".
//
// Slots: [obj] one thing, [objs] one or more (all, and, except), [held] one thing,
// preferring what the player carries, [heldobjs] several of those, [dir] a direction,
// [topic] any words (not looked up).

export const DIRS = {
  n: 'n', north: 'n', s: 's', south: 's', e: 'e', east: 'e', w: 'w', west: 'w',
  ne: 'ne', northeast: 'ne', nw: 'nw', northwest: 'nw',
  se: 'se', southeast: 'se', sw: 'sw', southwest: 'sw',
  u: 'u', up: 'u', upstairs: 'u', d: 'd', down: 'd', downstairs: 'd',
  in: 'in', inside: 'in', out: 'out', outside: 'out',
};

// Words the parser itself understands inside noun phrases.
export const PARSER_WORDS = ['all', 'everything', 'except', 'but', 'and', 'it', 'them', 'him', 'her', 'one', 'ones'];

export const GRAMMAR = [
  ['look', ['look', 'l', 'look around']],
  ['lookDir', ['look [dir]', 'l [dir]', 'look to the [dir]', 'look towards [dir]']],
  ['examine', ['examine [obj]', 'x [obj]', 'look at [obj]', 'l at [obj]', 'inspect [obj]', 'check [obj]', 'describe [obj]', 'study [obj]', 'look over [obj]', 'look out [obj]', 'look out of [obj]', 'look through [obj]', 'peer at [obj]', 'watch [obj]', 'read about [obj]']],
  ['search', ['search [obj]', 'look in [obj]', 'look inside [obj]', 'look on [obj]', 'look under [obj]']],
  ['take', ['take [objs]', 'get [objs]', 'grab [objs]', 'pick up [objs]', 'pick [objs] up', 'take [objs] from [obj]', 'get [objs] from [obj]', 'take [objs] off [obj]']],
  ['drop', ['drop [heldobjs]', 'put down [heldobjs]', 'put [heldobjs] down', 'discard [heldobjs]']],
  ['putOn', ['put [held] on [obj]', 'put [held] onto [obj]', 'place [held] on [obj]', 'set [held] on [obj]', 'leave [held] on [obj]']],
  ['putIn', ['put [held] in [obj]', 'put [held] into [obj]', 'place [held] in [obj]', 'insert [held] in [obj]', 'insert [held] into [obj]']],
  ['inventory', ['inventory', 'i', 'inv']],
  ['go', ['go [dir]', 'walk [dir]', 'run [dir]', 'head [dir]', '[dir]']],
  ['approach', ['go to [obj]', 'walk to [obj]', 'head to [obj]', 'go over to [obj]', 'walk over to [obj]', 'move to [obj]', 'approach [obj]']],
  ['enter', ['enter [obj]', 'go through [obj]', 'walk through [obj]', 'go in [obj]', 'go into [obj]', 'use [obj]']],
  ['open', ['open [obj]']],
  ['close', ['close [obj]', 'shut [obj]']],
  ['unlock', ['unlock [obj] with [held]', 'unlock [obj]']],
  ['eat', ['eat [held]', 'consume [held]']],
  ['drink', ['drink [held]', 'sip [held]', 'drink from [held]']],
  ['read', ['read [obj]']],
  ['wear', ['wear [held]', 'put on [held]', 'put [held] on', 'don [held]']],
  ['takeOff', ['take off [held]', 'take [held] off', 'remove [held]', 'doff [held]']],
  ['talk', ['talk to [obj]', 'talk with [obj]', 'speak to [obj]', 'speak with [obj]', 'greet [obj]', 'ask [obj] about [topic]', 'ask [obj] for [topic]', 'ask [obj]', 'question [obj]',
    'tell [obj] about [topic]', 'tell [obj] [topic]', 'say [topic] to [obj]', 'talk to [obj] about [topic]', 'hello [obj]', 'hi [obj]']],
  ['talkAround', ['say [topic]', 'ask about [topic]', 'hello', 'hi', 'talk']],
  ['notTalking', ['leave', 'bye', 'goodbye', 'farewell']],
  ['throw', ['throw [held]', 'throw [held] at [obj]', 'throw [held] in [obj]', 'throw [held] into [obj]', 'throw away [held]', 'toss [held]', 'toss [held] into [obj]', 'hurl [held]']],
  ['climb', ['climb [obj]', 'scale [obj]']],
  ['ascend', ['climb up [obj]', 'go up [obj]', 'walk up [obj]', 'ascend [obj]', 'run up [obj]']],
  ['descend', ['go down [obj]', 'walk down [obj]', 'climb down [obj]', 'descend [obj]', 'run down [obj]', 'come down [obj]']],
  ['wait', ['wait', 'z']],
  ['switchOn', ['turn on [obj]', 'turn [obj] on', 'switch on [obj]', 'switch [obj] on', 'activate [obj]']],
  ['switchOff', ['turn off [obj]', 'turn [obj] off', 'switch off [obj]', 'switch [obj] off', 'deactivate [obj]']],
  ['smell', ['smell', 'sniff', 'smell [obj]', 'sniff [obj]']],
  ['listen', ['listen', 'listen to [obj]']],
  ['touch', ['touch [obj]', 'feel [obj]']],
  ['help', ['help', 'commands', 'hint', 'hints']],
];

export function compileGrammar(grammar) {
  const lines = [];
  for (const [action, patterns] of grammar) {
    for (const p of patterns) {
      const tokens = p.split(/\s+/);
      lines.push({ action, tokens, literals: tokens.filter((t) => t[0] !== '[').length });
    }
  }
  return lines;
}
