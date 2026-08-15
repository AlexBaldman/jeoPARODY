import fs from 'node:fs';
import path from 'node:path';

const manifestPath = process.env.MANIFEST || 'data/trebek-audio-manifest.json';
const outPath = process.env.OUT || 'public/data/trebek-audio-search-index.json';

if (!fs.existsSync(manifestPath)) throw new Error(`Missing ${manifestPath}`);
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

const documents = (manifest.records || []).map(record => ({
  id: record.id,
  legacyFile: record.legacyFile,
  sourceSha256: record.sourceSha256,
  transcript: record.transcript || '',
  transcriptNormalized: record.transcriptNormalized || '',
  filenameHint: record.filenameHint || '',
  eventTags: record.eventTags || [],
  toneTags: record.toneTags || [],
  contextTags: record.contextTags || [],
  peopleMentioned: record.peopleMentioned || [],
  durationMs: record.durationMs,
  transcriptStatus: record.transcriptStatus,
  rightsStatus: record.rightsStatus,
  runtimeStatus: record.runtimeStatus,
  easterEggEligible: Boolean(record.easterEggEligible),
  proposedAlias: record.proposedAlias,
  notes: record.notes || ''
}));

const index = {
  schema: 'jeoparody.archival-audio-search-index',
  version: 1,
  generatedAt: new Date().toISOString(),
  sourceManifest: manifestPath,
  documentCount: documents.length,
  documents
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(index, null, 2)}\n`);
console.log(`Indexed ${documents.length} clips -> ${outPath}`);
