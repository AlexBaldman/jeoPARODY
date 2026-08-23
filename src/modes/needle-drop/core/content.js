const note = (frequency, duration, gain = 0.18, type = 'sine') => ({
  frequency,
  duration,
  gain,
  type,
});

const reveals = () => [
  { duration: 0.25, points: 1000, label: 'Needle Drop' },
  { duration: 0.75, points: 750, label: 'One Beat' },
  { duration: 2, points: 500, label: 'The Loop' },
  { duration: 5, points: 250, label: 'Full Alibi' },
];

const rights = id => ({
  id: `rights-${id}`,
  basis: 'original-commission',
  owner: 'Needle Drop Demo Catalog',
  territories: ['worldwide'],
  startsOn: '2026-08-21',
  expiresOn: '2036-08-21',
  interactiveGame: true,
  approvedMaxSeconds: 5,
});

const synth = sequence => ({ kind: 'synth', sequence });

export const demoEpisode = Object.freeze({
  schemaVersion: 1,
  packageVersion: '1.4.0',
  id: 'nd-demo-001',
  title: 'The Unlicensed Basement Tapes',
  description: 'Eight original musical families. No catalog lawyers were awakened.',
  status: 'editorial-demo',
  release: { channel: 'demo', immutable: true, rightsGate: 'required' },
  clues: [
    {
      id: 'rubber-duck-funk',
      category: 'Bassline Witness Protection',
      prompt: 'Name this suspiciously buoyant original groove.',
      title: 'Rubber Duck Funk',
      artist: 'The Cleared Samples',
      acceptedAnswers: ['Rubber Duck Funk', 'Rubber Duck'],
      source: { title: 'Bathwater Break', artist: 'DJ Public Domain Adjacent', year: 2026 },
      transformation: ['pitch +3', 'low-pass filter', 'two-beat chop'],
      linerNote: 'The bass was questioned for three hours and still refused to name the drummer.',
      palette: ['#ff3f81', '#ffb000'],
      audio: synth([
        note(110, 0.12, 0.26, 'square'),
        note(146.83, 0.12, 0.22, 'square'),
        note(164.81, 0.12, 0.2, 'square'),
        note(146.83, 0.12, 0.22, 'square'),
        note(220, 0.18, 0.18, 'sawtooth'),
      ]),
      rights: rights('rubber-duck-funk'),
      reveals: reveals(),
    },
    {
      id: 'midnight-pager',
      category: 'Things Heard Through a Wall',
      prompt: 'Identify the nocturnal synth communiqué.',
      title: 'Midnight Pager',
      artist: 'Dial Tone Jones',
      acceptedAnswers: ['Midnight Pager', 'Pager'],
      source: { title: 'Busy Signal No. 9', artist: 'The Operators', year: 2026 },
      transformation: ['half-time', 'tape wobble', 'minor reharmonization'],
      linerNote: 'Recorded after midnight, when every synthesizer believes it is the main character.',
      palette: ['#735cdd', '#00d7d7'],
      audio: synth([
        note(261.63, 0.18, 0.16, 'triangle'),
        note(311.13, 0.18, 0.16, 'triangle'),
        note(392, 0.28, 0.18),
        note(349.23, 0.18, 0.16, 'triangle'),
      ]),
      rights: rights('midnight-pager'),
      reveals: reveals(),
    },
    {
      id: 'municipal-cowbell',
      category: 'More Cowbell, Less Zoning',
      prompt: 'Name the civic percussion emergency.',
      title: 'Municipal Cowbell',
      artist: 'The Department of Funk',
      acceptedAnswers: ['Municipal Cowbell', 'Cowbell'],
      source: { title: 'Permit Denied', artist: 'City Hall & Oates', year: 2026 },
      transformation: ['cowbell extraction', 'tempo +12%', 'bureaucratic delay'],
      linerNote: 'The permit was denied, but the cowbell had already sublet the chorus.',
      palette: ['#f4b942', '#c83e4d'],
      audio: synth([
        note(540, 0.08, 0.2, 'square'),
        note(130.81, 0.2, 0.18, 'sawtooth'),
        note(540, 0.08, 0.2, 'square'),
        note(196, 0.2, 0.18, 'sawtooth'),
      ]),
      rights: rights('municipal-cowbell'),
      reveals: reveals(),
    },
    {
      id: 'last-train-neptune',
      category: 'Six Degrees of Outer Space',
      prompt: 'Identify the final interplanetary departure.',
      title: 'Last Train to Neptune',
      artist: 'Cosmic Rail Authority',
      acceptedAnswers: ['Last Train to Neptune', 'Neptune'],
      source: { title: 'Platform Infinity', artist: 'Saturn Transit Choir', year: 2026 },
      transformation: ['reverse envelope', 'octave stack', 'zero-gravity swing'],
      linerNote: 'Service to Neptune remains delayed because space is, frankly, quite large.',
      palette: ['#00d7d7', '#37b36b'],
      audio: synth([
        note(196, 0.22, 0.14),
        note(246.94, 0.22, 0.14),
        note(293.66, 0.22, 0.14),
        note(392, 0.38, 0.16, 'triangle'),
      ]),
      rights: rights('last-train-neptune'),
      reveals: reveals(),
    },
    {
      id: 'velvet-parking-ticket',
      category: 'Citation Needed, but Make It Funk',
      prompt: 'Identify this luxurious municipal inconvenience.',
      title: 'Velvet Parking Ticket',
      artist: 'Citation Nation',
      acceptedAnswers: ['Velvet Parking Ticket', 'Parking Ticket'],
      source: { title: 'Meter Maid in G Minor', artist: 'The Tow-Aways', year: 2026 },
      transformation: ['wah envelope', 'bass octave', 'thirty-day appeal'],
      linerNote: 'The groove was parked illegally and towed directly into the bridge.',
      palette: ['#ff6b35', '#f7c548'],
      audio: synth([
        note(98, 0.12, 0.2, 'sawtooth'),
        note(130.81, 0.12, 0.18, 'square'),
        note(146.83, 0.1, 0.18, 'square'),
        note(196, 0.2, 0.16, 'triangle'),
      ]),
      rights: rights('velvet-parking-ticket'),
      reveals: reveals(),
    },
    {
      id: 'ghosted-by-the-groove',
      category: 'Unanswered Texts in 4/4',
      prompt: 'Name the rhythm that left you on read.',
      title: 'Ghosted by the Groove',
      artist: 'Seen at 2:03 AM',
      acceptedAnswers: ['Ghosted by the Groove', 'Ghosted', 'The Groove'],
      source: { title: 'Read Receipt Riddim', artist: 'Typing Indicator', year: 2026 },
      transformation: ['vocal absence', 'double text', 'read-receipt reverb'],
      linerNote: 'It promised to call after the chorus. The chorus has retained counsel.',
      palette: ['#8d6cff', '#ff3f81'],
      audio: synth([
        note(220, 0.16, 0.14, 'sine'),
        note(277.18, 0.12, 0.16, 'triangle'),
        note(329.63, 0.16, 0.16, 'triangle'),
        note(246.94, 0.24, 0.12, 'sine'),
      ]),
      rights: rights('ghosted-by-the-groove'),
      reveals: reveals(),
    },
    {
      id: 'disco-laundromat',
      category: 'Loads of Rhythm',
      prompt: 'Identify this permanent-press dance-floor cycle.',
      title: 'Disco Laundromat',
      artist: 'Spin Cycle Social Club',
      acceptedAnswers: ['Disco Laundromat', 'Laundromat'],
      source: { title: 'Fabric Softener After Dark', artist: 'The Delicates', year: 2026 },
      transformation: ['four-on-the-floor', 'lint filter', 'extra rinse'],
      linerNote: 'Dry-clean only, except for the bassline, which absolutely insists on getting wet.',
      palette: ['#00d7d7', '#f25f5c'],
      audio: synth([
        note(130.81, 0.1, 0.2, 'square'),
        note(261.63, 0.1, 0.13, 'sawtooth'),
        note(164.81, 0.1, 0.18, 'square'),
        note(329.63, 0.16, 0.13, 'sawtooth'),
      ]),
      rights: rights('disco-laundromat'),
      reveals: reveals(),
    },
    {
      id: 'emergency-saxophone',
      category: 'Smooth Jazz First Responders',
      prompt: 'Name the melody arriving with lights and sirens.',
      title: 'Emergency Saxophone',
      artist: 'The Alto Responders',
      acceptedAnswers: ['Emergency Saxophone', 'Emergency Sax', 'Saxophone'],
      source: { title: 'Code Blue Note', artist: 'Triage by Moonlight', year: 2026 },
      transformation: ['portamento', 'night-shift vibrato', 'urgent key change'],
      linerNote: 'The solo is stable, but doctors recommend several weeks away from the bridge.',
      palette: ['#ef476f', '#06d6a0'],
      audio: synth([
        note(293.66, 0.18, 0.14, 'sawtooth'),
        note(349.23, 0.16, 0.15, 'triangle'),
        note(392, 0.22, 0.16, 'sawtooth'),
        note(440, 0.28, 0.14, 'triangle'),
      ]),
      rights: rights('emergency-saxophone'),
      reveals: reveals(),
    },
  ],
});

export function validateEpisode(episode, asOf = new Date().toISOString().slice(0, 10)) {
  const errors = [];
  if (episode?.schemaVersion !== 1) errors.push('schemaVersion must be 1');
  if (!episode?.packageVersion) errors.push('episode.packageVersion is required');
  if (!episode?.id) errors.push('episode.id is required');
  if (!episode?.release?.immutable) errors.push('episode.release must be immutable');
  if (!Array.isArray(episode?.clues) || !episode.clues.length) {
    errors.push('episode.clues must be non-empty');
  }

  const ids = new Set();
  for (const [index, clue] of (episode?.clues || []).entries()) {
    const path = `clues[${index}]`;
    if (!clue.id) errors.push(`${path}.id is required`);
    if (ids.has(clue.id)) errors.push(`${path}.id must be unique`);
    ids.add(clue.id);
    if (!clue.title || !clue.artist) errors.push(`${path} requires title and artist`);
    if (!clue.source?.title || !clue.source?.artist) errors.push(`${path}.source is required`);
    if (!clue.linerNote) errors.push(`${path}.linerNote is required`);
    if (!Array.isArray(clue.transformation) || !clue.transformation.length) {
      errors.push(`${path}.transformation is required`);
    }
    if (!Array.isArray(clue.acceptedAnswers) || !clue.acceptedAnswers.includes(clue.title)) {
      errors.push(`${path}.acceptedAnswers must include title`);
    }
    if (!Array.isArray(clue.reveals) || clue.reveals.length < 2) {
      errors.push(`${path}.reveals requires at least two stages`);
    }
    for (let revealIndex = 1; revealIndex < (clue.reveals || []).length; revealIndex += 1) {
      if (clue.reveals[revealIndex].duration <= clue.reveals[revealIndex - 1].duration) {
        errors.push(`${path}.reveals durations must increase`);
      }
      if (clue.reveals[revealIndex].points >= clue.reveals[revealIndex - 1].points) {
        errors.push(`${path}.reveals points must decrease`);
      }
    }
    if (!['synth', 'asset'].includes(clue.audio?.kind)) {
      errors.push(`${path}.audio.kind must be synth or asset`);
    }
    if (clue.audio?.kind === 'synth') {
      if (!Array.isArray(clue.audio.sequence) || !clue.audio.sequence.length) {
        errors.push(`${path}.audio.sequence is required`);
      }
      if (clue.audio.sequence?.some(item => item.duration <= 0 || item.frequency <= 0)) {
        errors.push(`${path}.audio.sequence notes must have positive frequency and duration`);
      }
    }
    if (clue.audio?.kind === 'asset'
      && (!clue.audio.url || !/^[a-f0-9]{64}$/i.test(clue.audio.sha256 || ''))) {
      errors.push(`${path}.audio asset requires url and sha256`);
    }
    if (!clue.rights?.interactiveGame) {
      errors.push(`${path}.rights must allow interactive game use`);
    }
    if (!clue.rights?.territories?.length) errors.push(`${path}.rights territories are required`);
    if (!clue.rights?.startsOn || clue.rights.startsOn > asOf) {
      errors.push(`${path}.rights have not started`);
    }
    if (!clue.rights?.expiresOn || clue.rights.expiresOn < asOf) {
      errors.push(`${path}.rights are expired`);
    }
    const largestReveal = Math.max(...(clue.reveals || []).map(item => item.duration));
    if (largestReveal > (clue.rights?.approvedMaxSeconds || 0)) {
      errors.push(`${path}.reveal exceeds rights scope`);
    }
  }

  return errors;
}
