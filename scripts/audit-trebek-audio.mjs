import fs from 'node:fs';

const manifestPath = process.env.MANIFEST || 'data/trebek-audio-manifest.json';
if (!fs.existsSync(manifestPath)) throw new Error(`Missing ${manifestPath}`);
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const records = manifest.records || [];

const counts = {};
const inc = key => { counts[key] = (counts[key] || 0) + 1; };
for (const record of records) {
  inc(`transcript:${record.transcriptStatus || 'unknown'}`);
  inc(`rights:${record.rightsStatus || 'unknown'}`);
  inc(`runtime:${record.runtimeStatus || 'unknown'}`);
  if (record.duplicateOf) inc('duplicate');
  if (record.easterEggEligible) inc('easter-egg-eligible');
  for (const tag of record.eventTags || []) inc(`event:${tag}`);
}

console.log(`Trebek archive: ${records.length} records`);
Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)).forEach(([key, value]) => {
  console.log(`${String(value).padStart(4)}  ${key}`);
});

const unsafe = records.filter(record => record.easterEggEligible && (
  record.transcriptStatus !== 'verified' || record.rightsStatus !== 'cleared'
));
if (unsafe.length) {
  console.error(`\n${unsafe.length} clip(s) marked Easter-egg eligible without verified transcript + cleared rights:`);
  unsafe.forEach(record => console.error(`- ${record.id} (${record.legacyFile})`));
  process.exitCode = 1;
}
