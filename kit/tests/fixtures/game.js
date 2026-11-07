// Neutral fixture for game settings and the location extras. Not game content.
import { buildGame } from '../../engine/story.js';

export default buildGame({
  game: {
    title: 'GAME_TITLE',
    intro: 'INTRO_1\n\nINTRO_2',
    questions: [{ var: 'name', label: 'NAME_Q' }],
    start: { room: 'loc1', near: 'thing1' },
    player: { description: 'PLAYER_DESC {name}' },
  },
  locations: {
    loc1: {
      title: 'LOC_1', description: 'LOC_1 description.', smell: 'LOC1_SMELL', listen: 'LOC1_LISTEN',
      refuse: { w: 'LOC1_REFUSE' }, ambient: { chance: 100, lines: ['AMBIENT_1'] }, listExits: false,
    },
    loc2: { title: 'LOC_2', description: 'LOC_2 description.', arriveNear: 'thing2' },
  },
  passages: {
    p1: { kind: 'archway', name: 'ARCH_1', nouns: ['arch1'], a: { room: 'loc1', dir: 'n', also: ['out'], len: 14 }, b: { room: 'loc2', dir: 's', also: ['in'] } },
    p2: { kind: 'stairs', name: 'STAIRS_2', nouns: ['stairs2'], blocked: 'STAIRS_BLOCKED', a: { room: 'loc1', dir: 'u', box: { x: 10, y: 10, w: 20, h: 8 } }, b: null },
  },
  objects: {
    thing1: { name: 'THING_1', nouns: ['thing1'], in: 'loc1' },
    thing2: { name: 'THING_2', nouns: ['thing2'], in: 'loc2' },
  },
  actors: {},
  events: {},
});
