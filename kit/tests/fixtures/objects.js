// Neutral fixture for editor objects, reactions, and the actor and passage extras.
// Not game content.
import { applyStory } from '../../engine/story.js';

const baseObjects = {
  room1: { kind: 'room', name: 'ROOM_1', desc: 'ROOM_1 description.', exits: {}, map: { w: 60, h: 40, shapes: [{ type: 'room', x: 4, y: 4, w: 52, h: 32 }] } },
  player: { name: 'yourself', proper: true, names: ['me'], in: 'room1' },
};

const story = {
  actors: {
    crowd1: { name: 'CROWD_1', nouns: ['crowd1'], place: { room: 'room1' }, scenery: true, talk: 'CROWD_TALK' },
  },
  objects: {
    table1: { name: 'TABLE_1', nouns: ['table1'], in: 'room1', scenery: true, supporter: true, fixed: true, fixedText: 'TABLE_FIXED', shape: { x: 10, y: 10, w: 12, h: 6 } },
    box1: { name: 'BOX_1', nouns: ['box1'], in: 'table1', container: true, openable: true, locked: true, key: 'key1' },
    key1: { name: 'KEY_1', nouns: ['key1'], in: 'room1', smell: 'KEY_SMELL' },
    gem1: { name: 'GEM_1', nouns: ['gem1'], in: 'box1' },
    cup1: { name: 'CUP_1', nouns: ['cup1'], in: 'table1', drinkable: true, drunkText: 'CUP_DRUNK', becomes: 'cup2' },
    cup2: { name: 'CUP_2', nouns: ['cup2'], in: '' },
    note1: { name: 'NOTE_1', nouns: ['note1'], in: 'player', readText: 'NOTE_TEXT' },
    hat1: { name: 'HAT_1', article: 'some', nouns: ['hat1'], in: 'player', wearable: true, worn: true },
    trap1: {
      name: 'TRAP_1', nouns: ['trap1'], in: 'room1',
      reactions: [
        { action: 'take', once: true, instead: true, when: [], effects: [{ type: 'say', text: 'TRAP_SPRUNG' }, { type: 'setVar', name: 'sprung', value: true }] },
        { action: 'examine', when: [{ type: 'var', name: 'sprung', op: 'is', value: true }], effects: [{ type: 'say', text: 'TRAP_SPENT' }] },
      ],
    },
  },
  passages: {
    p1: { kind: 'door', name: 'DOOR_1', nouns: ['door1'], locked: true, key: 'key1', blocked: 'DOOR_BLOCKED', a: { room: 'room1', dir: 'n' }, b: null },
  },
  events: {
    afterTrap: { when: [{ type: 'var', name: 'sprung', op: 'is', value: true }], effects: [{ type: 'say', text: 'EVENT_AFTER_TRAP' }] },
  },
};

export default {
  title: 'fixture',
  objects: applyStory(baseObjects, story),
  events: story.events,
  story,
  baseObjects,
};
