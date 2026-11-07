import story from '../game/story.js';
import { buildGame } from './engine/story.js';

// The whole game comes from the story editor (game/story.js): settings, locations,
// doors and passages, objects, actors and events.
export const baseObjects = {};

export default buildGame(story);
