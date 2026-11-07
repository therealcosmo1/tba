// Neutral fixture for variable text ({if}, {either}, {cycle}, {once} ...). Not game content.
import { buildGame } from '../../engine/story.js';

export default buildGame({
  game: {
    title: 'GAME_TITLE', questions: [{ var: 'name', label: 'NAME_Q' }], start: { room: 'loc1' },
    player: { description: 'PLAYER_DESC {name}{if flag} FLAG_ON{else} FLAG_OFF{/if}' },
    messages: { wait: '{cycle WAIT_A|WAIT_B}' },
  },
  locations: {
    loc1: { title: 'LOC_1', description: 'LOC1_DESC{once} FIRST_VISIT{/once}{again} LATER_VISIT{/again}' },
  },
  objects: {
    thing1: { name: 'THING_1', nouns: ['thing1'], in: 'loc1', description: '{cycle C1|C2|C3}' },
    thing2: { name: 'THING_2', nouns: ['thing2'], in: 'loc1', description: '{stopping S1|S2}' },
    thing3: { name: 'THING_3', nouns: ['thing3'], in: 'loc1', description: '{if count >= 2}COUNT_HIGH{else}COUNT_LOW{if not flag} NO_FLAG{/if}{/if}' },
    thing4: { name: 'THING_4', nouns: ['thing4'], in: 'loc1', description: 'E:{either EA|EB}', readText: '{if flag}{once}HIDDEN_ONCE{/once}{/if}SHOWN' },
    thing5: {
      name: 'THING_5', nouns: ['thing5'], in: 'loc1', fixed: true,
      reactions: [{ action: 'touch', effects: [{ type: 'setVar', name: 'flag', value: true }, { type: 'addVar', name: 'count', value: 1 }], instead: true }],
    },
  },
  actors: {},
  events: {},
});
