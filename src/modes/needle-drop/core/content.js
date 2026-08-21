const note = (frequency, duration, gain = 0.18, type = 'sine') => ({ frequency, duration, gain, type });
const reveals = () => [{duration:.25,points:1000,label:'Needle Drop'},{duration:.75,points:750,label:'One Beat'},{duration:2,points:500,label:'The Loop'},{duration:5,points:250,label:'Full Alibi'}];

export const demoEpisode = Object.freeze({ schemaVersion:1, id:'nd-demo-001', title:'The Unlicensed Basement Tapes', description:'Four original musical families. No catalog lawyers were awakened.', status:'editorial-demo', clues:[
  { id:'rubber-duck-funk', category:'Bassline Witness Protection', prompt:'Name this suspiciously buoyant original groove.', title:'Rubber Duck Funk', artist:'The Cleared Samples', acceptedAnswers:['Rubber Duck Funk','Rubber Duck'], source:{title:'Bathwater Break',artist:'DJ Public Domain Adjacent',year:2026}, transformation:['pitch +3','low-pass filter','two-beat chop'], palette:['#ff3f81','#ffb000'], sequence:[note(110,.12,.26,'square'),note(146.83,.12,.22,'square'),note(164.81,.12,.20,'square'),note(146.83,.12,.22,'square'),note(220,.18,.18,'sawtooth')], reveals:reveals() },
  { id:'midnight-pager', category:'Things Heard Through a Wall', prompt:'Identify the nocturnal synth communiqué.', title:'Midnight Pager', artist:'Dial Tone Jones', acceptedAnswers:['Midnight Pager','Pager'], source:{title:'Busy Signal No. 9',artist:'The Operators',year:2026}, transformation:['half-time','tape wobble','minor reharmonization'], palette:['#735cdd','#00d7d7'], sequence:[note(261.63,.18,.16,'triangle'),note(311.13,.18,.16,'triangle'),note(392,.28,.18,'sine'),note(349.23,.18,.16,'triangle')], reveals:reveals() },
  { id:'municipal-cowbell', category:'More Cowbell, Less Zoning', prompt:'Name the civic percussion emergency.', title:'Municipal Cowbell', artist:'The Department of Funk', acceptedAnswers:['Municipal Cowbell','Cowbell'], source:{title:'Permit Denied',artist:'City Hall & Oates',year:2026}, transformation:['cowbell extraction','tempo +12%','bureaucratic delay'], palette:['#f4b942','#c83e4d'], sequence:[note(540,.08,.20,'square'),note(130.81,.20,.18,'sawtooth'),note(540,.08,.20,'square'),note(196,.20,.18,'sawtooth')], reveals:reveals() },
  { id:'last-train-neptune', category:'Six Degrees of Outer Space', prompt:'Identify the final interplanetary departure.', title:'Last Train to Neptune', artist:'Cosmic Rail Authority', acceptedAnswers:['Last Train to Neptune','Neptune'], source:{title:'Platform Infinity',artist:'Saturn Transit Choir',year:2026}, transformation:['reverse envelope','octave stack','zero-gravity swing'], palette:['#00d7d7','#37b36b'], sequence:[note(196,.22,.14,'sine'),note(246.94,.22,.14,'sine'),note(293.66,.22,.14,'sine'),note(392,.38,.16,'triangle')], reveals:reveals() }
] });

export function validateEpisode(episode) {
  const errors=[];
  if (episode?.schemaVersion !== 1) errors.push('schemaVersion must be 1');
  if (!episode?.id) errors.push('episode.id is required');
  if (!Array.isArray(episode?.clues) || !episode.clues.length) errors.push('episode.clues must be non-empty');
  const ids=new Set();
  for (const [index,clue] of (episode?.clues || []).entries()) {
    const path=`clues[${index}]`;
    if (!clue.id) errors.push(`${path}.id is required`);
    if (ids.has(clue.id)) errors.push(`${path}.id must be unique`); ids.add(clue.id);
    if (!clue.title || !clue.artist) errors.push(`${path} requires title and artist`);
    if (!Array.isArray(clue.acceptedAnswers) || !clue.acceptedAnswers.includes(clue.title)) errors.push(`${path}.acceptedAnswers must include title`);
    if (!Array.isArray(clue.reveals) || clue.reveals.length < 2) errors.push(`${path}.reveals requires at least two stages`);
    for (let i=1;i<(clue.reveals || []).length;i++) { if (clue.reveals[i].duration <= clue.reveals[i-1].duration) errors.push(`${path}.reveals durations must increase`); if (clue.reveals[i].points >= clue.reveals[i-1].points) errors.push(`${path}.reveals points must decrease`); }
    if (!Array.isArray(clue.sequence) || !clue.sequence.length) errors.push(`${path}.sequence is required for demo synth`);
  }
  return errors;
}
