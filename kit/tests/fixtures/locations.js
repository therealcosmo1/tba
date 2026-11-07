// Neutral fixture for editor locations, doors and passages. Not game content.
import { applyStory } from '../../engine/story.js';

const room = (name) => ({ kind: 'room', name, desc: `${name} description.`, exits: {}, map: { w: 60, h: 40, shapes: [{ type: 'room', x: 4, y: 4, w: 52, h: 32 }] } });

const baseObjects = {
  room1: room('ROOM_1'),
  player: { name: 'yourself', proper: true, names: ['me'], in: 'room1' },
  oldDoor: { name: 'OLD_DOOR', names: ['olddoor'], in: 'room1', scenery: true, openable: true, locked: true },
};

const story = {
  actors: {},
  locations: {
    loc2: { title: 'LOC_2', description: 'LOC_2 description.' },
    loc3: { title: 'LOC_3', description: 'LOC_3 description.', size: { w: 80, h: 50 } },
  },
  passages: {
    // An existing hand-written door, unlocked by the editor and connected onward.
    p1: { existing: 'oldDoor', locked: false, a: { room: 'room1', dir: 'n', wall: 'n', pos: 30 }, b: { room: 'loc2', dir: 's' } },
    p2: { kind: 'door', name: 'DOOR_2', nouns: ['door2'], locked: true, a: { room: 'loc2', dir: 'e' }, b: { room: 'loc3', dir: 'w' } },
    // Placed but not connected yet.
    p3: { kind: 'passage', name: 'PASSAGE_3', nouns: ['passage3'], a: { room: 'loc3', dir: 'n' } },
    // One way only, from loc3 down to loc2.
    p5: { kind: 'passage', name: 'CHUTE_5', nouns: ['chute5'], oneWay: true, blocked: 'ONE_WAY_BLOCKED', a: { room: 'loc3', dir: 'd' }, b: { room: 'loc2', dir: 'u' } },
    p4: { kind: 'stairs', name: 'STAIRS_4', nouns: ['stairs4'], a: { room: 'loc3', dir: 'u', wall: 'e', pos: 80 }, b: { room: 'room1', dir: 'd', wall: 'w' } },
  },
  events: {
    unlock: {
      when: [{ type: 'doorIs', thing: 'p2', state: 'locked' }, { type: 'turn', op: 'atLeast', value: 4 }],
      effects: [{ type: 'setDoor', thing: 'p2', state: 'unlocked' }, { type: 'say', text: 'UNLOCKED' }],
    },
  },
};

export default {
  title: 'fixture',
  objects: applyStory(baseObjects, story),
  events: story.events,
  story,
  baseObjects,
};
