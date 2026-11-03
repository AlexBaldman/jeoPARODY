import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const hash = content => createHash('sha256').update(content).digest('hex');
const safeName = name => typeof name === 'string'
  && /^[a-zA-Z0-9][a-zA-Z0-9._-]*\.json$/.test(name)
  && name !== '..json';

// Intentionally a verifier, not an agent runner: no shell, network, or write authority.
export function evaluateRunContract(contract, readEvidence) {
  if (contract?.schemaVersion !== 1 || !/^[a-z0-9][a-z0-9._-]+$/.test(contract?.id ?? '')
    || contract?.authority?.mode !== 'verify-only'
    || !Array.isArray(contract?.checks) || contract.checks.length < 1 || contract.checks.length > 8
    || contract.checks.some(check => !safeName(check?.evidence)
      || !/^[a-z0-9][a-z0-9._-]+$/.test(check?.id ?? '')
      || !['default', 'main-result'].includes(check?.scenario)
      || check?.maxViolations !== 0)
    || new Set(contract.checks.map(check => check.id)).size !== contract.checks.length
    || new Set(contract.checks.map(check => check.evidence)).size !== contract.checks.length) {
    throw new Error('Invalid run contract: expected schema v1, verify-only authority, unique safe evidence files and zero-violation checks');
  }

  const checks = contract.checks.map(check => {
    const findings = [];
    let evidenceSha256 = null;
    let observed = null;
    try {
      const raw = readEvidence(check.evidence);
      evidenceSha256 = hash(raw);
      const report = JSON.parse(raw);
      const violations = report.violations;
      const scenario = report.auditContext?.scenario;
      const answerVisible = report.auditContext?.answerVisible;
      observed = {
        scenario: scenario ?? null,
        answerVisible: typeof answerVisible === 'boolean' ? answerVisible : null,
        violations: Array.isArray(violations) ? violations.length : null,
        incomplete: Array.isArray(report.incomplete) ? report.incomplete.length : null,
        violationIds: Array.isArray(violations) ? violations.map(v => v.id) : [],
      };
      if (report.testEngine?.name !== 'axe-core') findings.push('Not an axe-core report');
      if (scenario !== check.scenario) findings.push('Scenario mismatch: expected ' + check.scenario + ', got ' + (scenario ?? 'missing'));
      if (answerVisible !== (check.scenario === 'main-result')) findings.push('Answer visibility did not match ' + check.scenario);
      if (!Array.isArray(violations)) findings.push('Missing violations array');
      else if (violations.length > check.maxViolations) findings.push(violations.length + ' violation(s): ' + observed.violationIds.join(', '));
    } catch (error) {
      findings.push('Evidence unreadable: ' + error.message);
    }
    return { id: check.id, evidence: check.evidence, evidenceSha256, pass: findings.length === 0, observed, findings };
  });

  return {
    schemaVersion: 1,
    contractId: contract.id,
    contractSha256: hash(JSON.stringify(contract)),
    status: checks.every(check => check.pass) ? 'pass' : 'fail',
    checks,
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [contractPath, outputPath] = process.argv.slice(2);
  if (!contractPath || !outputPath) {
    console.error('Usage: node scripts/verify-run-contract.mjs <contract.json> <evidence-summary.json>');
    process.exitCode = 2;
  } else {
    try {
      const contract = JSON.parse(readFileSync(contractPath, 'utf8'));
      const result = evaluateRunContract(contract, name => readFileSync(path.resolve(name), 'utf8'));
      const summary = { ...result, sourceSha: process.env.GITHUB_SHA || null, observedAt: new Date().toISOString() };
      writeFileSync(outputPath, JSON.stringify(summary, null, 2) + '\n');
      for (const check of summary.checks) {
        console.log((check.pass ? 'PASS ' : 'FAIL ') + check.id + ': ' + (check.findings.join('; ') || 'evidence accepted'));
      }
      console.log('Run Contract ' + summary.contractId + ': ' + summary.status + '; evidence: ' + outputPath);
      if (summary.status !== 'pass') process.exitCode = 1;
    } catch (error) {
      console.error('Run Contract could not be evaluated: ' + error.message);
      process.exitCode = 2;
    }
  }
}
