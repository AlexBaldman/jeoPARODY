import { demoEpisode, validateEpisode } from '../src/modes/needle-drop/core/content.js';
const errors=validateEpisode(demoEpisode);
if(errors.length){console.error(`Needle Drop content failed validation:\n- ${errors.join('\n- ')}`);process.exitCode=1;}else console.log(`Needle Drop content valid: ${demoEpisode.clues.length} clues in ${demoEpisode.id}`);
