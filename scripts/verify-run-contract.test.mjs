import assert from 'node:assert/strict';
import { test } from 'node:test';
import { evaluateRunContract } from './verify-run-contract.mjs';

const contract = {
  schemaVersion: 1,
  id: 'jeoparody.main-accessibility',
  authority: { mode: 'verify-only' },
  checks: [
    { id: 'splash', evidence: 'axe-report.json', scenario: 'default', maxViolations: 0 },
    { id: 'answer-reveal', evidence: 'axe-main-result-report.json', scenario: 'main-result', maxViolations: 0 },
  ],
};
const report = (scenario, violations = []) => JSON.stringify({
  testEngine: { name: 'axe-core' },
  violations,
  incomplete: [],
  auditContext: { scenario, answerVisible: scenario === 'main-result' },
});
const evaluate = (override = {}) => evaluateRunContract(contract, name => {
  if (Object.hasOwn(override, name)) return override[name];
  return report(name === 'axe-report.json' ? 'default' : 'main-result');
});

test('accepts independent default and revealed answer reports', () => {
  const result = evaluate();
  assert.equal(result.status, 'pass');
  assert.equal(result.checks.length, 2);
  assert.match(result.checks[0].evidenceSha256, /^[a-f0-9]{64}$/);
});

test('reports the precise failing axe rule without discarding the passing state', () => {
  const result = evaluate({ 'axe-main-result-report.json': report('main-result', [{ id: 'label-content-name-mismatch' }]) });
  assert.equal(result.status, 'fail');
  assert.equal(result.checks[0].pass, true);
  assert.equal(result.checks[1].pass, false);
  assert.match(result.checks[1].findings[0], /label-content-name-mismatch/);
});

test('rejects a mislabeled scenario even when the report says zero violations', () => {
  const result = evaluate({ 'axe-main-result-report.json': report('default') });
  assert.equal(result.status, 'fail');
  assert.match(result.checks[1].findings.join(' '), /Scenario mismatch/);
});

test('rejects missing or malformed evidence', () => {
  assert.equal(evaluate({ 'axe-report.json': 'not json' }).status, 'fail');
  const result = evaluateRunContract(contract, () => { throw new Error('ENOENT'); });
  assert.equal(result.status, 'fail');
  assert.equal(result.checks.length, 2);
});

test('rejects path traversal and duplicate evidence paths before any read', () => {
  for (const evidence of ['../secrets.json', '/tmp/report.json', '..json']) {
    const bad = structuredClone(contract);
    bad.checks[0].evidence = evidence;
    assert.throws(() => evaluateRunContract(bad, () => { throw new Error('should not read'); }), /Invalid run contract/);
  }
  const duplicate = structuredClone(contract);
  duplicate.checks[1].evidence = duplicate.checks[0].evidence;
  assert.throws(() => evaluateRunContract(duplicate, () => ''), /Invalid run contract/);
});

test('does not execute unknown authority modes', () => {
  const bad = structuredClone(contract);
  bad.authority.mode = 'execute-and-publish';
  assert.throws(() => evaluateRunContract(bad, () => ''), /Invalid run contract/);
});
