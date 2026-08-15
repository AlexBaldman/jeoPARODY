import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';

const manifestPath = process.env.MANIFEST || 'data/trebek-audio-manifest.json';
const whisperBin = process.env.WHISPER_BIN || 'whisper-cli';
const whisperModel = process.env.WHISPER_MODEL;
const language = process.env.WHISPER_LANGUAGE || 'en';

if (!fs.existsSync(manifestPath)) {
  throw new Error(`Missing ${manifestPath}. Run npm run trebek:inventory first.`);
}
if (!whisperModel) {
  throw new Error('WHISPER_MODEL must point to a local whisper.cpp model file.');
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const records = manifest.records || [];
let completed = 0;
let failed = 0;

function cleanTranscript(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

for (const record of records) {
  if (record.duplicateOf || record.transcriptStatus === 'verified') continue;
  if (!fs.existsSync(record.sourcePath)) {
    record.transcriptStatus = 'source-missing';
    failed += 1;
    continue;
  }

  const tmpBase = path.join(os.tmpdir(), `trebek-${record.id.replace(/[^a-z0-9.-]/gi, '-')}`);
  const result = spawnSync(whisperBin, [
    '-m', whisperModel,
    '-f', record.sourcePath,
    '-l', language,
    '-oj',
    '-of', tmpBase,
    '-np'
  ], { encoding: 'utf8' });

  const jsonPath = `${tmpBase}.json`;
  if (result.status !== 0 || !fs.existsSync(jsonPath)) {
    record.transcriptStatus = 'transcription-failed';
    record.transcriptionError = cleanTranscript(result.stderr || result.stdout).slice(0, 500);
    failed += 1;
    continue;
  }

  const output = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const segments = output.transcription || output.segments || [];
  const words = [];
  const transcriptParts = [];

  for (const segment of segments) {
    const text = cleanTranscript(segment.text);
    if (text) transcriptParts.push(text);
    const tokens = segment.tokens || segment.words || [];
    for (const token of tokens) {
      const tokenText = cleanTranscript(token.text || token.word);
      if (!tokenText) continue;
      words.push({
        text: tokenText,
        startMs: token.offsets?.from ?? token.start ?? null,
        endMs: token.offsets?.to ?? token.end ?? null,
        probability: token.p ?? token.probability ?? null
      });
    }
  }

  record.transcript = cleanTranscript(transcriptParts.join(' '));
  record.transcriptNormalized = record.transcript.toLowerCase().replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim();
  record.words = words;
  record.transcriptStatus = record.transcript ? 'machine-transcribed' : 'needs-review';
  record.transcriptionEngine = 'whisper.cpp';
  record.transcriptionModel = path.basename(whisperModel);
  record.transcribedAt = new Date().toISOString();
  delete record.transcriptionError;
  completed += 1;

  try { fs.unlinkSync(jsonPath); } catch {}
}

manifest.transcription = {
  engine: 'whisper.cpp',
  model: path.basename(whisperModel),
  language,
  updatedAt: new Date().toISOString()
};
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Transcribed ${completed}; failed/missing ${failed}; manifest: ${manifestPath}`);
