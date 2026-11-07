// Neutral fixture for switches, hidden passages, LOOK <dir>, shared things, timers,
// conditions about the thing used, NOT conditions and followers. Not game content.
import { buildGame } from '../../engine/story.js';

export default buildGame({
  game: { title: 'GAME_TITLE', start: { room: 'loc1' }, player: { description: 'PLAYER_DESC' } },
  locations: {
    loc1: { title: 'LOC_1', description: 'LOC_1 description.', look: { e: 'LOOK_EAST_TEXT' }, details: [{ nouns: ['tower9', 'spire9'], adjectives: ['far'], description: 'TOWER9_DETAIL' }] },
    loc2: { title: 'LOC_2', description: 'LOC_2 description.' },
    loc4: { title: 'LOC_4', description: 'LOC_4 description.' },
    loc3: { title: 'LOC_3', description: 'LOC_3 description.', dark: true, darkText: 'LOC3_DARK' },
  },
  passages: {
    p1: { kind: 'archway', name: 'ARCH_1', nouns: ['arch1'], description: 'ARCH_SHARED', a: { room: 'loc1', dir: 'n', description: 'ARCH_FROM_LOC1' }, b: { room: 'loc2', dir: 's' } },
    p3: { kind: 'stairs', name: 'STAIRS_3', nouns: ['stairs3'], a: { room: 'loc2', dir: 'u' }, b: { room: 'loc4', dir: 'd' } },
    p2: { kind: 'passage', name: 'SECRET_2', nouns: ['secret2'], hidden: true, a: { room: 'loc1', dir: 'w' }, b: { room: 'loc3', dir: 'e' } },
  },
  objects: {
    lamp1: { name: 'LAMP_1', nouns: ['lamp1'], in: 'loc1', switchable: true, onText: 'LAMP_IS_LIT', switchOnText: 'LAMP_LIGHTS' },
    fan1: { name: 'FAN_1', nouns: ['fan1'], in: 'loc1', switchable: true, on: true },
    sky1: { name: 'SKY_1', nouns: ['sky1'], in: 'loc1', alsoIn: ['loc2'], description: 'SKY_DESC' },
    stone1: { name: 'STONE_1', nouns: ['stone1'], in: 'loc1' },
    torch1: { name: 'TORCH_1', nouns: ['torch1'], in: 'loc1', switchable: true, light: true },
    gem3: { name: 'GEM_3', nouns: ['gem3'], in: 'loc3' },
    tray2: { name: 'TRAY_2', nouns: ['tray2'], in: 'loc2', supporter: true, fixed: true },
    coins2: { name: 'COINS_2', article: 'some', nouns: ['coins2'], in: 'tray2' },
    lever1: {
      name: 'LEVER_1', nouns: ['lever1'], in: 'loc1', fixed: true,
      reactions: [{ action: 'touch', instead: true, effects: [
        { type: 'setDoor', thing: 'p2', state: 'shown' }, { type: 'say', text: 'SECRET_REVEALED' },
        { type: 'later', event: 'bell', turns: 2 },
      ] }],
    },
  },
  verbs: {
    poke: { name: 'POKE', patterns: ['poke [thing]'], reply: 'POKE_DEFAULT', rules: [
      { when: [{ type: 'thingIs', thing: 'stone1' }], effects: [{ type: 'say', text: 'POKED_THE_STONE' }], instead: true },
      { when: [{ type: 'switchIs', thing: 'lamp1', state: 'on' }, { type: 'thingIs', thing: 'lamp1' }], effects: [{ type: 'say', text: 'HOT_LAMP' }], instead: true },
      { when: [{ type: 'has', item: 'stone1', not: true }, { type: 'thingIs', thing: 'fan1' }], effects: [{ type: 'say', text: 'NO_STONE_HELD' }], instead: true },
    ] },
    tap: { name: 'TAP', patterns: ['tap'], rules: [
      { when: [{ type: 'var', name: 'tapped', op: 'is', value: true, not: true }], effects: [{ type: 'setVar', name: 'tapped', value: true }, { type: 'say', text: 'TAP_FIRST' }], instead: true },
      { when: [{ type: 'var', name: 'tapped', op: 'is', value: true }], effects: [{ type: 'say', text: 'TAP_AGAIN' }], instead: true },
    ] },
    beckon: { name: 'BECKON', patterns: ['beckon [thing]'], rules: [
      { when: [{ type: 'thingIs', thing: 'helper1' }], effects: [{ type: 'follow', actor: 'helper1' }, { type: 'say', text: 'HELPER_COMES' }], instead: true },
    ] },
  },
  actors: {
    helper1: { name: 'HELPER_1', article: 'the', nouns: ['helper1'], place: { room: 'loc1' }, followText: '{once}HELPER_TAGS_ALONG{/once}' },
    talker4: { name: 'TALKER_4', article: 'none', nouns: ['talker4'], place: { room: 'loc4' }, conversation: { start: 'n1', nodes: { n1: { say: 'TALKER4_SAYS', options: [{ text: 'OPTION_A' }] } } } },
  },
  events: { bell: { name: 'BELL', onlyTriggered: true, effects: [{ type: 'say', text: 'BELL_RINGS' }] } },
});
