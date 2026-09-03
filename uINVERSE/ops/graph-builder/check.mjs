import assert from 'node:assert/strict';
import {
  compileRecords,
  parseFrontmatter,
  validateRecord,
} from './lib.mjs';

function record(overrides = {}) {
  return {
    id: 'valid-record',
    name: 'Valid Record',
    type: 'system',
    status: 'proving',
    summary: 'A valid contract fixture.',
    source: 'fixture:graph-builder-check',
    uses: [],
    promotion: { portfolio: false, showcase: false, reusable: true },
    path: 'fixture.md',
    ...overrides,
  };
}

const parsed = parseFrontmatter(`---
id: block-list
name: Block List
type: system
status: proving
summary: Parses a block relationship list.
source: fixture:block-list
uses:
  - stage-runtime
  - semantic-events
promotion: {"portfolio": false, "showcase": false, "reusable": true}
---
`, 'block-list.md');
assert.deepEqual(parsed.uses, ['stage-runtime', 'semantic-events']);
assert.equal(parsed.promotion.reusable, true);

const missingIdErrors = validateRecord(record({ id: undefined }));
assert.ok(missingIdErrors.some((message) => message.includes('id')));
assert.throws(
  () => compileRecords([record({ id: undefined })]),
  /missing or invalid id|invalid id/,
);

const badPromotionErrors = validateRecord(record({
  promotion: { showcase: 'false' },
}));
assert.ok(badPromotionErrors.some((message) => message.includes('promotion.showcase must be Boolean')));

const badRelationshipErrors = validateRecord(record({ uses: [42] }));
assert.ok(badRelationshipErrors.some((message) => message.includes('kebab-case string ID')));

const unresolved = compileRecords([
  record({ id: 'source-record', uses: ['future-system'] }),
]);
assert.deepEqual(unresolved.warnings, ['source-record --uses--> future-system is unresolved']);

assert.throws(
  () => compileRecords([
    record({ id: 'duplicate-record', path: 'a.md' }),
    record({ id: 'duplicate-record', path: 'b.md' }),
  ]),
  /duplicate id duplicate-record/,
);

console.log('graph-builder contract: parser, validation, duplicate, and unresolved-edge fixtures passed');
