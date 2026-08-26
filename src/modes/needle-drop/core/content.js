const FREQUENCIES = Object.freeze({
  A3: 220, B3: 246.94, C4: 261.63, Cs4: 277.18, D4: 293.66, Ds4: 311.13,
  E4: 329.63, F4: 349.23, Fs4: 369.99, G4: 392, Gs4: 415.3, A4: 440,
  As4: 466.16, B4: 493.88, C5: 523.25, Cs5: 554.37, D5: 587.33,
  Ds5: 622.25, E5: 659.25, F5: 698.46, Fs5: 739.99, G5: 783.99,
  A5: 880, B5: 987.77,
});

const note = (pitch, duration, gain = 0.16, type = 'triangle') => ({
  frequency: FREQUENCIES[pitch], duration, gain, type,
});
const melody = (notes, duration = 0.28, type = 'triangle') => (
  notes.map(pitch => note(pitch, duration, 0.16, type))
);
const reveals = () => [
  { duration: 1, points: 1000, label: 'One Second' },
  { duration: 2, points: 750, label: 'Two Seconds' },
  { duration: 4, points: 500, label: 'Four Seconds' },
  { duration: 8, points: 250, label: 'Full Phrase' },
];
const rights = (id, published) => ({
  id: `rights-${id}`,
  basis: 'public-domain-composition-original-recording',
  owner: 'Needle Drop House Band',
  compositionPublished: published,
  territories: ['worldwide'],
  startsOn: '2026-08-26',
  expiresOn: '2036-08-26',
  interactiveGame: true,
  approvedMaxSeconds: 8,
});
const synth = sequence => ({ kind: 'synth', sequence });

export const demoEpisode = Object.freeze({
  schemaVersion: 1,
  packageVersion: '2.0.0',
  id: 'nd-public-domain-001',
  title: 'Famous Melodies, No Guesswork About the Guesswork',
  description: 'Eight recognizable public-domain compositions in original procedural arrangements.',
  status: 'public-domain-proving-demo',
  release: { channel: 'demo', immutable: true, rightsGate: 'required' },
  clues: [
    {
      id: 'ode-to-joy', category: 'Classical Hooks', prompt: 'Which famous melody is this?',
      title: 'Ode to Joy', artist: 'Needle Drop House Band',
      acceptedAnswers: ['Ode to Joy', 'Beethoven Ode to Joy'],
      choices: ['Für Elise', 'Ode to Joy', 'The Blue Danube', 'William Tell Overture'],
      source: { title: 'Symphony No. 9, IV', artist: 'Ludwig van Beethoven', year: 1824 },
      transformation: ['public-domain composition', '8-bit arrangement', 'procedural performance'],
      linerNote: 'Beethoven wrote a melody sturdy enough to survive two centuries and this browser oscillator.',
      palette: ['#ff3f81', '#22e0b8'],
      audio: synth(melody(['E4', 'E4', 'F4', 'G4', 'G4', 'F4', 'E4', 'D4', 'C4', 'C4', 'D4', 'E4', 'E4', 'D4', 'D4'], 0.3)),
      rights: rights('ode-to-joy', 1824), reveals: reveals(),
    },
    {
      id: 'eine-kleine-nachtmusik', category: 'Classical Hooks', prompt: 'Which famous melody is this?',
      title: 'Eine kleine Nachtmusik', artist: 'Needle Drop House Band',
      acceptedAnswers: ['Eine kleine Nachtmusik', 'A Little Night Music', 'Mozart Eine kleine Nachtmusik'],
      choices: ['Eine kleine Nachtmusik', 'Ode to Joy', 'Habanera', 'The Entertainer'],
      source: { title: 'Serenade No. 13 in G Major', artist: 'Wolfgang Amadeus Mozart', year: 1787 },
      transformation: ['public-domain composition', 'arcade lead', 'procedural performance'],
      linerNote: 'Mozart remains unavailable for comment, which has done wonders for the licensing meeting.',
      palette: ['#735cdd', '#ffd166'],
      audio: synth([
        note('G4', 0.18), note('D5', 0.18), note('G5', 0.35), note('D5', 0.18),
        note('G5', 0.35), note('D5', 0.18), note('G4', 0.18), note('B4', 0.18),
        note('D5', 0.35), note('C5', 0.18), note('B4', 0.18), note('A4', 0.35),
      ]),
      rights: rights('eine-kleine-nachtmusik', 1787), reveals: reveals(),
    },
    {
      id: 'fur-elise', category: 'Piano Riffs Everyone Knows', prompt: 'Which famous melody is this?',
      title: 'Für Elise', artist: 'Needle Drop House Band',
      acceptedAnswers: ['Für Elise', 'Fur Elise', 'Beethoven Fur Elise'],
      choices: ['The Blue Danube', 'Für Elise', 'Can-Can', 'Ode to Joy'],
      source: { title: 'Bagatelle No. 25 in A minor', artist: 'Ludwig van Beethoven', year: 1867 },
      transformation: ['public-domain composition', 'synth piano', 'procedural performance'],
      linerNote: 'Elise has still not confirmed whether she enjoyed receiving the world’s most persistent ringtone.',
      palette: ['#00d7d7', '#ff3f81'],
      audio: synth([
        ...melody(['E5', 'Ds5', 'E5', 'Ds5', 'E5', 'B4', 'D5', 'C5', 'A4'], 0.2, 'sine'),
        ...melody(['C4', 'E4', 'A4', 'B4'], 0.23, 'triangle'),
      ]),
      rights: rights('fur-elise', 1867), reveals: reveals(),
    },
    {
      id: 'william-tell-overture', category: 'Cartoon Chase Department', prompt: 'Which famous melody is this?',
      title: 'William Tell Overture', artist: 'Needle Drop House Band',
      acceptedAnswers: ['William Tell Overture', 'William Tell', 'Lone Ranger Theme'],
      choices: ['Can-Can', 'William Tell Overture', 'The Entertainer', 'Habanera'],
      source: { title: 'William Tell Overture, Finale', artist: 'Gioachino Rossini', year: 1829 },
      transformation: ['public-domain composition', 'square-wave cavalry', 'procedural performance'],
      linerNote: 'Rossini supplied the gallop. Television later supplied an alarming number of horses.',
      palette: ['#f4b942', '#ef476f'],
      audio: synth([
        ...melody(['E4', 'E4', 'E4', 'E4', 'E4', 'E4', 'G4', 'C5', 'E5'], 0.14, 'square'),
        ...melody(['E5', 'D5', 'C5', 'B4', 'A4', 'G4'], 0.18, 'square'),
      ]),
      rights: rights('william-tell-overture', 1829), reveals: reveals(),
    },
    {
      id: 'can-can', category: 'Cartoon Chase Department', prompt: 'Which famous melody is this?',
      title: 'Can-Can', artist: 'Needle Drop House Band',
      acceptedAnswers: ['Can-Can', 'Can Can', 'Infernal Galop'],
      choices: ['Habanera', 'Can-Can', 'Eine kleine Nachtmusik', 'The Blue Danube'],
      source: { title: 'Orpheus in the Underworld: Infernal Galop', artist: 'Jacques Offenbach', year: 1858 },
      transformation: ['public-domain composition', 'neon kick line', 'procedural performance'],
      linerNote: 'The melody has kicked this high since 1858 and has declined all orthopedic referrals.',
      palette: ['#ff6b35', '#ffd166'],
      audio: synth([
        ...melody(['G4', 'G4', 'G4', 'C5', 'E5', 'D5', 'C5', 'A4', 'G4'], 0.18, 'square'),
        ...melody(['G4', 'G4', 'G4', 'C5', 'E5', 'D5', 'C5'], 0.18, 'square'),
      ]),
      rights: rights('can-can', 1858), reveals: reveals(),
    },
    {
      id: 'habanera', category: 'Opera Hooks in Civilian Clothing', prompt: 'Which famous melody is this?',
      title: 'Habanera', artist: 'Needle Drop House Band',
      acceptedAnswers: ['Habanera', 'Carmen Habanera', "L'amour est un oiseau rebelle"],
      choices: ['Für Elise', 'Habanera', 'The Entertainer', 'William Tell Overture'],
      source: { title: 'Carmen: Habanera', artist: 'Georges Bizet', year: 1875 },
      transformation: ['public-domain composition', 'low-register synth', 'procedural performance'],
      linerNote: 'Love is a rebellious bird. The MIDI channel is merely difficult at meetings.',
      palette: ['#8d6cff', '#ff3f81'],
      audio: synth([
        ...melody(['D5', 'Cs5', 'C5', 'B4', 'As4', 'A4', 'Gs4', 'G4'], 0.26, 'sawtooth'),
        ...melody(['Fs4', 'G4', 'A4', 'G4', 'Fs4', 'E4'], 0.24, 'triangle'),
      ]),
      rights: rights('habanera', 1875), reveals: reveals(),
    },
    {
      id: 'blue-danube', category: 'Fancy Room, Dangerous Floor', prompt: 'Which famous melody is this?',
      title: 'The Blue Danube', artist: 'Needle Drop House Band',
      acceptedAnswers: ['The Blue Danube', 'Blue Danube', 'An der schönen blauen Donau'],
      choices: ['Ode to Joy', 'The Blue Danube', 'Can-Can', 'Eine kleine Nachtmusik'],
      source: { title: 'An der schönen blauen Donau', artist: 'Johann Strauss II', year: 1867 },
      transformation: ['public-domain composition', 'zero-gravity waltz', 'procedural performance'],
      linerNote: 'A waltz so elegant that space movies borrowed it and gravity briefly felt overdressed.',
      palette: ['#3a86ff', '#00d7d7'],
      audio: synth([
        note('D4', 0.28), note('Fs4', 0.28), note('A4', 0.6), note('A4', 0.28),
        note('A4', 0.28), note('Cs5', 0.6), note('Cs5', 0.28), note('Cs5', 0.28),
        note('E5', 0.6), note('E5', 0.28), note('E5', 0.28), note('D5', 0.6),
      ]),
      rights: rights('blue-danube', 1867), reveals: reveals(),
    },
    {
      id: 'the-entertainer', category: 'Ragtime Recognition Unit', prompt: 'Which famous melody is this?',
      title: 'The Entertainer', artist: 'Needle Drop House Band',
      acceptedAnswers: ['The Entertainer', 'Entertainer', 'Scott Joplin The Entertainer'],
      choices: ['The Entertainer', 'Habanera', 'Für Elise', 'William Tell Overture'],
      source: { title: 'The Entertainer', artist: 'Scott Joplin', year: 1902 },
      transformation: ['public-domain composition', 'coin-op ragtime', 'procedural performance'],
      linerNote: 'Joplin wrote a rag. Seventy years later, every upright piano in America received a subpoena.',
      palette: ['#06d6a0', '#ffd166'],
      audio: synth([
        ...melody(['Ds5', 'E5', 'C5', 'A4', 'B4', 'G4'], 0.18, 'square'),
        ...melody(['Ds5', 'E5', 'C5', 'A4', 'B4', 'G4', 'Fs4', 'A4'], 0.18, 'triangle'),
      ]),
      rights: rights('the-entertainer', 1902), reveals: reveals(),
    },
  ],
});

export function validateEpisode(episode, asOf = new Date().toISOString().slice(0, 10)) {
  const errors = [];
  if (episode?.schemaVersion !== 1) errors.push('schemaVersion must be 1');
  if (!episode?.packageVersion) errors.push('episode.packageVersion is required');
  if (!episode?.id) errors.push('episode.id is required');
  if (!episode?.release?.immutable) errors.push('episode.release must be immutable');
  if (!Array.isArray(episode?.clues) || !episode.clues.length) errors.push('episode.clues must be non-empty');

  const ids = new Set();
  for (const [index, clue] of (episode?.clues || []).entries()) {
    const path = `clues[${index}]`;
    if (!clue.id) errors.push(`${path}.id is required`);
    if (ids.has(clue.id)) errors.push(`${path}.id must be unique`);
    ids.add(clue.id);
    if (!clue.title || !clue.artist) errors.push(`${path} requires title and artist`);
    if (!clue.source?.title || !clue.source?.artist) errors.push(`${path}.source is required`);
    if (!clue.linerNote) errors.push(`${path}.linerNote is required`);
    if (!Array.isArray(clue.transformation) || !clue.transformation.length) errors.push(`${path}.transformation is required`);
    if (!Array.isArray(clue.acceptedAnswers) || !clue.acceptedAnswers.includes(clue.title)) errors.push(`${path}.acceptedAnswers must include title`);
    if (!Array.isArray(clue.choices) || clue.choices.length !== 4 || new Set(clue.choices).size !== clue.choices.length || !clue.choices.includes(clue.title)) {
      errors.push(`${path}.choices must contain four unique titles including the answer`);
    }
    if (!Array.isArray(clue.reveals) || clue.reveals.length < 2) errors.push(`${path}.reveals requires at least two stages`);
    for (let revealIndex = 1; revealIndex < (clue.reveals || []).length; revealIndex += 1) {
      if (clue.reveals[revealIndex].duration <= clue.reveals[revealIndex - 1].duration) errors.push(`${path}.reveals durations must increase`);
      if (clue.reveals[revealIndex].points >= clue.reveals[revealIndex - 1].points) errors.push(`${path}.reveals points must decrease`);
    }
    if (!['synth', 'asset'].includes(clue.audio?.kind)) errors.push(`${path}.audio.kind must be synth or asset`);
    if (clue.audio?.kind === 'synth') {
      if (!Array.isArray(clue.audio.sequence) || !clue.audio.sequence.length) errors.push(`${path}.audio.sequence is required`);
      if (clue.audio.sequence?.some(item => (
        !Number.isFinite(item.frequency) || item.frequency <= 0 || item.duration <= 0
      ))) errors.push(`${path}.audio.sequence notes must have positive frequency and duration`);
    }
    if (clue.audio?.kind === 'asset' && (!clue.audio.url || !/^[a-f0-9]{64}$/i.test(clue.audio.sha256 || ''))) errors.push(`${path}.audio asset requires url and sha256`);
    if (!clue.rights?.interactiveGame) errors.push(`${path}.rights must allow interactive game use`);
    if (!clue.rights?.territories?.length) errors.push(`${path}.rights territories are required`);
    if (!clue.rights?.startsOn || clue.rights.startsOn > asOf) errors.push(`${path}.rights have not started`);
    if (!clue.rights?.expiresOn || clue.rights.expiresOn < asOf) errors.push(`${path}.rights are expired`);
    const largestReveal = Math.max(...(clue.reveals || []).map(item => item.duration));
    if (largestReveal > (clue.rights?.approvedMaxSeconds || 0)) errors.push(`${path}.reveal exceeds rights scope`);
  }
  return errors;
}
