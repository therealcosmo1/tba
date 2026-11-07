// The receiving-hall test room, starting in the hall. A frozen copy (hall-story.js),
// so these mechanics tests don't depend on the game's own story or settings.
import story from './hall-story.js';
import { buildGame } from '../../engine/story.js';

export default buildGame(story);
