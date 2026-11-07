// Neutral fixture for overriding built-in messages (Game tab, Messages). Not game content.
import { buildGame } from '../../engine/story.js';

export default buildGame({
  game: {
    title: 'GAME_TITLE',
    questions: [{ var: 'name', label: 'NAME_Q' }],
    start: { room: 'loc1' },
    player: { description: 'PLAYER_DESC' },
    messages: {
      taken: 'MSG_TAKEN {Thing} for {name}',
      notHere: 'MSG_NOT_HERE',
      unknownWord: 'MSG_UNKNOWN {word}',
      help: 'MSG_HELP_1\nMSG_HELP_2',
      carrying: 'MSG_CARRYING',
      wornTag: 'MSG_WORN',
      contents: '{Prep} {thing} MSG_CONTENTS {list}',
      wait: '   ',
      undone: 'MSG_UNDONE',
    },
  },
  locations: { loc1: { title: 'LOC_1', description: 'LOC_1 description.' } },
  objects: {
    thing1: { name: 'THING_1', nouns: ['thing1'], in: 'loc1', wearable: true },
    box1: { name: 'BOX_1', nouns: ['box1'], in: 'loc1', supporter: true, fixed: true },
    thing2: { name: 'THING_2', nouns: ['thing2'], in: 'box1' },
  },
  actors: {},
  events: {},
});
