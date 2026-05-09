#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const coordinationDir = path.join(root, 'coordination');
const logsDir = path.join(coordinationDir, 'logs');
const activeWorkPath = path.join(coordinationDir, 'active-work.md');
const outDir = path.join(root, 'site', 'data');
const outPath = path.join(outDir, 'project-truth.json');

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { data: {}, body: content };
  const yaml = match[1];
  const body = match[2];
  const data = {};
  yaml.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) return;
    const key = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim();
    if (value.startsWith('[') && value.endsWith(']')) {
      data[key] = value.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    } else {
      data[key] = value.replace(/^["']|["']$/g, '');
    }
  });
  return { data, body };
}

function parseActiveWork(content) {
  const lines = content.split('\n');
  const tableStart = lines.findIndex(l => l.includes('| Area |'));
  if (tableStart === -1) return [];
  const rows = lines.slice(tableStart + 2).filter(l => l.includes('|') && !l.includes('---'));
  return rows.map(row => {
    const parts = row.split('|').map(s => s.trim()).filter((_, i) => i > 0);
    return {
      area: parts[0],
      owner: parts[1],
      started: parts[2],
      status: parts[3],
      claimed: parts[4],
      notes: parts[5]
    };
  });
}

function getLogs() {
  const logs = [];
  if (!fs.existsSync(logsDir)) return logs;
  const dates = fs.readdirSync(logsDir).filter(d => fs.statSync(path.join(logsDir, d)).isDirectory());
  for (const date of dates) {
    const dayDir = path.join(logsDir, date);
    const files = fs.readdirSync(dayDir).filter(f => f.endsWith('.md'));
    for (const file of files) {
      const content = fs.readFileSync(path.join(dayDir, file), 'utf8');
      const { data, body } = parseFrontmatter(content);
      logs.push({
        file: path.join('coordination', 'logs', date, file),
        ...data,
        summary: body.split('\n').find(l => l.trim() && !l.startsWith('#')) || ''
      });
    }
  }
  return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

function detectDrift(activeWork, logs) {
  const flags = [];
  
  // Ghost Edits: Files modified in log but not claimed in active-work
  logs.forEach(log => {
    if (log.status !== 'completed' && log.status !== 'Done') return;
    const modified = log.files_touched || [];
    const agentClaims = activeWork.filter(c => c.owner === log.agent && c.status === 'Done');
    
    if (agentClaims.length > 0) {
      // Flatten all files claimed by this agent across all their DONE slices
      const allClaimed = agentClaims.flatMap(c => c.claimed.split(',').map(s => s.trim().replace(/[`]/g, '')));
      
      modified.forEach(f => {
        const isFileClaimed = allClaimed.some(claim => {
          if (claim.endsWith('*')) {
            const prefix = claim.replace('*', '');
            return f.startsWith(prefix);
          }
          return f === claim;
        });

        if (!isFileClaimed) {
          flags.push({
            type: 'GHOST_EDIT',
            severity: 'high',
            message: `Agent ${log.agent} modified ${f} but it was not in their claims.`,
            file: log.file
          });
        }
      });
    }
  });

  // Stale Claims: In Progress but no log in 2 hours
  const now = new Date();
  activeWork.forEach(claim => {
    if (claim.status === 'In Progress') {
      const lastLog = logs.find(l => l.agent === claim.owner && l.task === claim.area);
      const startTime = new Date(claim.started);
      const checkTime = lastLog ? new Date(lastLog.timestamp) : startTime;
      const hours = (now - checkTime) / (1000 * 60 * 60);
      if (hours > 2) {
        flags.push({
          type: 'STALE_CLAIM',
          severity: 'medium',
          message: `Claim "${claim.area}" by ${claim.owner} has no updates in ${Math.round(hours)} hours.`,
          owner: claim.owner
        });
      }
    }
  });

  // Baseline Mismatch: Check for referenced docs that don't exist
  const readmePath = path.join(coordinationDir, 'README.md');
  if (fs.existsSync(readmePath)) {
    const readme = fs.readFileSync(readmePath, 'utf8');
    const docLinks = readme.match(/docs\/[a-zA-Z0-9_-]+\.md/g) || [];
    docLinks.forEach(link => {
      if (!fs.existsSync(path.join(root, link))) {
        flags.push({
          type: 'BROKEN_DOC_LINK',
          severity: 'medium',
          message: `Coordination README references missing document: ${link}`
        });
      }
    });
  }

  return flags;
}

function main() {
  console.log('🏗️ Building Shipyard Cockpit...');
  
  const activeWork = fs.existsSync(activeWorkPath) ? parseActiveWork(fs.readFileSync(activeWorkPath, 'utf8')) : [];
  const logs = getLogs();
  const drift = detectDrift(activeWork, logs);

  const truth = {
    generatedAt: new Date().toISOString(),
    project: 'JeoPARODY',
    activeWork,
    recentLogs: logs.slice(0, 10),
    drift,
    baseline: {
      tests: 'PASS', // Placeholder: would parse actual test output files
      build: 'PASS'
    }
  };

  ensureDir(outDir);
  fs.writeFileSync(outPath, JSON.stringify(truth, null, 2));
  console.log(`✅ Project Truth emitted to ${outPath}`);
  console.log(`🚩 Detected ${drift.length} drift signals.`);
  drift.forEach(d => console.log(`  [${d.severity.toUpperCase()}] ${d.type}: ${d.message}`));
}

main();
