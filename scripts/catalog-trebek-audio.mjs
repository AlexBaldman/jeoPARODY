import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const roots = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['assets/audio/trebek', 'public/assets/audio/trebek'];

function eventTagsFromHint(hint) {
  const value = hint.toLowerCase();
  const tags = [];
  const add = tag => { if (!tags.includes(tag)) tags.push(tag); };

  if (/rnd-?1-intro|rnd-?2-intro|round.*intro/.test(value)) add('round.intro');
  if (/rnd-?1-outro|rnd-?2-outro|round.*outro/.test(value)) add('round.outro');
  if (/\bintro\b/.test(value) && tags.length === 0) add('game.intro');
  if (/clue-instr|clue.*instruction/.test(value)) add('clue.instruction');
  if (/player-correct|correct-response/.test(value)) add('answer.correct');
  if (/player-incorrect|incorrect-response/.test(value)) add('answer.incorrect');
  if (/player-select/.test(value)) add('player.select');
  if (/player-start|player-[123]|back-to-player|control-normal/.test(value)) add('player.control');
  if (/player-ring|player-resp|other-player-resp/.test(value)) add('player.prompt');
  if (/dailyd|daily-double/.test(value)) add('daily-double.intro');
  if (/wager/.test(value) && /dailyd|daily-double/.test(value)) add('daily-double.wager');
  if (/final-cat/.test(value)) add('final.category');
  if (/final-clue/.test(value)) add('final.clue');
  if (/final.*wager/.test(value)) add('final.wager');
  if (/final.*resp/.test(value)) add('final.response');
  if (/final.*winner|final.*stats|final.*control/.test(value)) add('final.result');
  if (/comm-break/.test(value)) add('transition.break');
  if (/speak-again|cant-hear/.test(value)) add('speech.retry');
  if (/confirm-resp/.test(value)) add('speech.confirm');
  if (/thanks|goodbye/.test(value)) add('game.goodbye');
  if (tags.length === 0) add('other');
  return tags.sort();
}

function inventoryFile(root, file) {
  const fullPath = path.join(root, file);
  const bytes = fs.readFileSync(fullPath);
  const stat = fs.statSync(fullPath);
  const stem = path.basename(file, path.extname(file));
  const match = stem.match(/^(\d+)-alx(?:-(.*))?$/i);
  const legacyId = match?.[1] || stem;
  const filenameHint = match?.[2] || '';

  return {
    id: `trebek.${legacyId}`,
    legacyFile: file,
    sourcePath: fullPath.split(path.sep).join('/'),
    sourceSha256: crypto.createHash('sha256').update(bytes).digest('hex'),
    byteSize: stat.size,
    durationMs: null,
    filenameHint,
    transcript: null,
    transcriptConfidence: null,
    transcriptStatus: 'pending',
    reviewedBy: null,
    eventTags: eventTagsFromHint(filenameHint),
    toneTags: [],
    proposedAlias: null,
    rightsStatus: 'review-required',
    runtimeStatus: 'archive-only',
    easterEggEligible: false,
    notes: ''
  };
}

const records = [];
const seenHashes = new Map();

for (const root of roots) {
  if (!fs.existsSync(root)) continue;
  for (const file of fs.readdirSync(root).sort()) {
    if (!/\.(mp3|wav|m4a|ogg)$/i.test(file)) continue;
    const record = inventoryFile(root, file);
    const prior = seenHashes.get(record.sourceSha256);
    if (prior) {
      record.duplicateOf = prior.id;
    } else {
      seenHashes.set(record.sourceSha256, record);
    }
    records.push(record);
  }
}

const payload = {
  schema: 'jeoparody.archival-audio-manifest',
  version: 1,
  generatedAt: new Date().toISOString(),
  roots,
  recordCount: records.length,
  uniqueContentCount: seenHashes.size,
  records
};

const out = process.env.OUT || 'data/trebek-audio-manifest.json';
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, `${JSON.stringify(payload, null, 2)}\n`);
console.log(`Cataloged ${records.length} audio files (${seenHashes.size} unique) -> ${out}`);
