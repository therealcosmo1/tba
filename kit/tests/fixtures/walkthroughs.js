// Neutral fixture for walkthroughs (the editor's game tests). Not game content.
import { buildGame } from '../../engine/story.js';

export default buildGame({
  game: { title: 'GAME_TITLE', questions: [{ var: 'name', label: 'NAME_Q' }], start: { room: 'loc1' }, player: { description: 'PLAYER_DESC {name}' } },
  locations: {
    loc1: { title: 'LOC_1', description: 'LOC_1 description.' },
    loc2: { title: 'LOC_2', description: 'LOC_2 description.' },
  },
  passages: { p1: { kind: 'archway', name: 'ARCH_1', nouns: ['arch1'], a: { room: 'loc1', dir: 'n' }, b: { room: 'loc2', dir: 's' } } },
  objects: { thing1: { name: 'THING_1', nouns: ['thing1'], in: 'loc2' } },
  actors: {},
  events: {},
  walkthroughs: {
    walk1: { name: 'WALK_1', answers: { name: 'Bea' }, steps: [
      { command: 'x me', expect: ['PLAYER_DESC Bea'] },
      { command: 'n', expect: ['LOC_2'], reject: ['LOC_1 description'] },
    ] },
    walk2: { name: 'WALK_2', from: 'walk1', steps: [
      { command: 'take thing1', expect: ['Taken'], check: [{ type: 'has', item: 'thing1' }] },
      { command: 'undo', expect: ['Undone'] },
    ] },
    walk3: { name: 'WALK_3', from: 'walk1', steps: [
      { command: 's', expect: ['LOC_2'], reject: ['LOC_1'], check: [{ type: 'inRoom', room: 'loc2' }] },
    ] },
    walk4: { name: 'WALK_4', from: 'walk4', steps: [] },
  },
});
