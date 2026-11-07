// Neutral fixture for testing events, conditions and effects. Not game content.
import { storyObjects } from '../../engine/story.js';

const story = {
  actors: {
    actor1: {
      name: 'ACTOR_1',
      article: 'none',
      nouns: ['actor1'],
      description: 'ACTOR_1 description.',
      place: { room: 'room1' },
      conversation: {
        start: 'a',
        nodes: {
          a: {
            say: 'LINE_A',
            options: [
              { text: 'OPT_SET', effects: [{ type: 'setVar', name: 'flag', value: true }] },
              { text: 'OPT_GATED', go: 'b', when: [{ type: 'var', name: 'flag', op: 'is', value: true }] },
              { text: 'OPT_FIRE', effects: [{ type: 'fireEvent', event: 'manual' }] },
              { text: 'OPT_END_GAME', effects: [{ type: 'endGame', text: 'THE_END' }] },
            ],
          },
          b: {
            say: 'LINE_B',
            effects: [{ type: 'addVar', name: 'count', value: 2 }],
            options: [{ text: 'OPT_BACK', go: 'a' }],
          },
        },
      },
    },
    // A name that starts with "The" doesn't get a second article.
    actor3: { name: 'The ACTOR_3', article: 'the', nouns: ['actor3'], place: { room: 'room2' }, talk: 'ACTOR_3_TALK' },
    actor2: {
      name: 'ACTOR_2',
      article: 'none',
      nouns: ['actor2'],
      place: { room: 'room2' },
      conversation: { start: 'x', nodes: { x: { say: 'LINE_X', options: [] } } },
    },
  },
  events: {
    onTurn3: { when: [{ type: 'turn', op: 'atLeast', value: 3 }], effects: [{ type: 'say', text: 'EVENT_TURN3' }] },
    afterB: {
      when: [{ type: 'seenNode', actor: 'actor1', node: 'b' }],
      effects: [{ type: 'say', text: 'EVENT_AFTER_B' }, { type: 'move', thing: 'item1', to: 'player' }],
    },
    // No conditions, but it waits to be triggered instead of running on the first turn.
    manual: { onlyTriggered: true, when: [], effects: [{ type: 'say', text: 'EVENT_MANUAL' }] },
    enterRoom2: { when: [{ type: 'inRoom', room: 'room2' }], effects: [{ type: 'startConversation', actor: 'actor2' }] },
    repeating: { once: false, when: [{ type: 'has', item: 'item1' }], effects: [{ type: 'say', text: 'EVENT_REPEAT' }] },
    countCheck: { when: [{ type: 'var', name: 'count', op: 'atLeast', value: 2 }], effects: [{ type: 'say', text: 'EVENT_COUNT' }] },
  },
};

export default {
  title: 'fixture',
  objects: {
    room1: { kind: 'room', name: 'ROOM_1', desc: 'ROOM_1 description.', exits: { n: 'room2' } },
    room2: { kind: 'room', name: 'ROOM_2', desc: 'ROOM_2 description.', exits: { s: 'room1' } },
    player: { name: 'yourself', proper: true, names: ['me'], in: 'room1' },
    item1: { name: 'ITEM_1', names: ['item1'], in: null },
    ...storyObjects(story),
  },
  events: story.events,
};
