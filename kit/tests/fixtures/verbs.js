// Neutral fixture for the game's own verbs (Verbs tab). Not game content.
import { buildGame } from '../../engine/story.js';

export default buildGame({
  game: { title: 'GAME_TITLE', start: { room: 'loc1' }, player: { description: 'PLAYER_DESC' } },
  locations: {
    loc1: { title: 'LOC_1', description: 'LOC_1 description.' },
    loc2: { title: 'LOC_2', description: 'LOC_2 description.' },
  },
  objects: {
    thing1: {
      name: 'THING_1', nouns: ['thing1'], in: 'loc1', fixed: true,
      reactions: [{ action: 'v:verb1', effects: [{ type: 'say', text: 'THING1_REACTS' }], instead: true }],
    },
    thing2: { name: 'THING_2', nouns: ['thing2'], in: 'loc1' },
    tool1: { name: 'TOOL_1', nouns: ['tool1'], in: 'player' },
  },
  verbs: {
    verb1: { name: 'VERB_1', patterns: ['verbone [thing]', 'verbalt [thing]'], reply: 'VERB1_REPLY {Thing}' },
    verb2: { name: 'VERB_2', patterns: ['verbtwo'], rules: [
      { when: [{ type: 'inRoom', room: 'loc1' }], effects: [{ type: 'say', text: 'VERB2_LOC1' }, { type: 'setVar', name: 'v2', value: 1 }], instead: true, once: true },
    ], reply: 'VERB2_REPLY' },
    verb3: { name: 'VERB_3', patterns: ['verbthree [thing] with [carried]'] },
    verb4: { name: 'VERB_4', patterns: ['examine [thing]'], reply: 'VERB4_OWNS_EXAMINE {thing}' },
    verb5: { name: 'VERB_5', patterns: ['verbfive [thing]'], rules: [
      { when: [{ type: 'var', name: 'v2', op: 'is', value: 1 }], effects: [{ type: 'move', thing: 'thing2', to: 'player' }] },
    ] },
  },
  passages: {
    p1: { kind: 'archway', name: 'ARCH_1', nouns: ['arch1'], a: { room: 'loc1', dir: 'n' }, b: { room: 'loc2', dir: 's' } },
  },
  actors: {},
  events: {},
});
