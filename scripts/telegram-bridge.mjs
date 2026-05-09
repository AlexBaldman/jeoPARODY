#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const rootDir = process.cwd();

loadEnvFile('.env.local');
loadEnvFile('.env');

const token = process.env.TELEGRAM_BOT_TOKEN;
const allowedUserIds = parseList(process.env.TELEGRAM_ALLOWED_USER_IDS);
const pollTimeoutSeconds = Number(process.env.TELEGRAM_POLL_TIMEOUT || 25);
const maxMessageLength = 3800;

if (!token) {
  fail('Missing TELEGRAM_BOT_TOKEN. Create a bot with @BotFather and set TELEGRAM_BOT_TOKEN locally.');
}

if (allowedUserIds.length === 0) {
  fail('Missing TELEGRAM_ALLOWED_USER_IDS. Set a comma-separated allowlist of Telegram numeric user IDs.');
}

let offset = Number(process.env.TELEGRAM_START_OFFSET || 0);

console.log('Telegram bridge running.');
console.log(`Repo: ${rootDir}`);
console.log(`Allowed users: ${allowedUserIds.join(', ')}`);

while (true) {
  try {
    const updates = await telegram('getUpdates', {
      offset,
      timeout: pollTimeoutSeconds,
      allowed_updates: ['message']
    });

    for (const update of updates.result || []) {
      offset = update.update_id + 1;
      await handleUpdate(update);
    }
  } catch (error) {
    console.error('[telegram-bridge]', error.message);
    await sleep(3000);
  }
}

async function handleUpdate(update) {
  const message = update.message;
  if (!message || typeof message.text !== 'string') return;

  const chatId = message.chat.id;
  const userId = String(message.from?.id || '');
  const text = message.text.trim();

  if (!allowedUserIds.includes(userId)) {
    await send(chatId, 'Unauthorized user.');
    return;
  }

  if (!text.startsWith('/')) {
    await send(chatId, 'Send /help for available JeoPARODY bridge commands.');
    return;
  }

  const [commandWithBot, ...parts] = text.split(/\s+/);
  const command = commandWithBot.split('@')[0].toLowerCase();
  const rest = text.slice(commandWithBot.length).trim();

  try {
    switch (command) {
      case '/help':
      case '/start':
        await send(chatId, helpText());
        break;
      case '/status':
      case '/claims':
        await sendFile(chatId, 'coordination/active-work.md', 'Active Work');
        break;
      case '/latest':
        await send(chatId, latestSummary());
        break;
      case '/dirty':
        await send(chatId, await run('git', ['status', '--short', '--branch']));
        break;
      case '/checks':
        await send(chatId, checksSummary());
        break;
      case '/tail':
        await send(chatId, tailLatest(parts[0]));
        break;
      case '/verify':
        await send(chatId, 'Running verification: tests, lint, build, asset check. This can take a moment.');
        await send(chatId, await verify());
        break;
      case '/note':
        await send(chatId, await writeNote(rest, userId));
        break;
      default:
        await send(chatId, `Unknown command: ${command}\n\n${helpText()}`);
        break;
    }
  } catch (error) {
    await send(chatId, `Command failed: ${error.message}`);
  }
}

function helpText() {
  return [
    'JeoPARODY Telegram Bridge',
    '',
    'Read commands:',
    '/status - show coordination/active-work.md',
    '/latest - show latest coordination artifacts',
    '/dirty - show git working tree status',
    '/checks - show current check policy',
    '/tail [pattern] - show latest log/live file matching pattern',
    '',
    'Action commands:',
    '/verify - run tests, JS lint, build, and asset check',
    '/note <text> - write a timestamped coordination log note',
    '',
    'No arbitrary shell commands are supported.'
  ].join('\n');
}

function checksSummary() {
  return [
    'Check policy:',
    '- npm test -- --runInBand',
    '- npm run lint',
    '- npm run build',
    '- node scripts/asset-check.js',
    '',
    'Known baseline debt:',
    '- npm run lint:css currently reports existing CSS lint debt.',
    '- npm audit --omit=dev reports production dependency vulnerabilities requiring a separate remediation slice.'
  ].join('\n');
}

async function verify() {
  const checks = [
    ['Tests', 'npm', ['test', '--', '--runInBand']],
    ['JS lint', 'npm', ['run', 'lint']],
    ['Build', 'npm', ['run', 'build']],
    ['Assets', 'node', ['scripts/asset-check.js']]
  ];

  const results = [];
  for (const [label, cmd, args] of checks) {
    try {
      const output = await run(cmd, args, { maxBuffer: 1024 * 1024 * 4 });
      results.push(`PASS ${label}\n${lastLines(output, 8)}`);
    } catch (error) {
      results.push(`FAIL ${label}\n${lastLines(error.message, 18)}`);
      break;
    }
  }

  return results.join('\n\n');
}

async function writeNote(text, userId) {
  if (!text) return 'Usage: /note <text>';

  const output = await run('node', [
    'scripts/agent-log.mjs',
    '--agent',
    `Telegram:${userId}`,
    '--tool',
    'Telegram Bridge',
    '--task',
    'Remote note',
    '--status',
    'note',
    '--files',
    'coordination/logs/*',
    '--summary',
    text,
    '--validation',
    'No validation run for note-only command.',
    '--risks',
    'None.',
    '--next-notes',
    'Review active-work.md before editing overlapping files.'
  ]);

  return `Wrote note:\n${output.trim()}`;
}

function latestSummary() {
  const files = [
    ...findFiles('coordination/logs'),
    ...findFiles('coordination/handoffs'),
    ...findFiles('coordination/decisions'),
    ...findFiles('coordination/reviews')
  ]
    .map((file) => ({ file, mtime: fs.statSync(file).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime)
    .slice(0, 8);

  if (files.length === 0) return 'No coordination artifacts found.';

  return files
    .map(({ file }) => {
      const title = firstHeading(file);
      return `- ${file}${title ? `\n  ${title}` : ''}`;
    })
    .join('\n');
}

function tailLatest(pattern = '') {
  const needle = String(pattern || '').toLowerCase();
  const files = [
    ...findFiles('coordination/live'),
    ...findFiles('coordination/logs')
  ]
    .filter((file) => !needle || file.toLowerCase().includes(needle))
    .map((file) => ({ file, mtime: fs.statSync(file).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);

  if (files.length === 0) {
    return needle ? `No live/log files matched "${needle}".` : 'No live/log files found.';
  }

  const file = files[0].file;
  return `${file}\n\n${lastLines(readText(file), 40)}`;
}

async function sendFile(chatId, file, title) {
  await send(chatId, `${title}\n\n${readText(file)}`);
}

async function send(chatId, text) {
  const chunks = chunkText(String(text || ''), maxMessageLength);
  for (const chunk of chunks) {
    await telegram('sendMessage', {
      chat_id: chatId,
      text: chunk,
      disable_web_page_preview: true
    });
  }
}

async function telegram(method, body) {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });

  const json = await response.json();
  if (!json.ok) {
    throw new Error(json.description || `Telegram ${method} failed`);
  }

  return json;
}

async function run(command, args, options = {}) {
  const { stdout, stderr } = await execFileAsync(command, args, {
    cwd: rootDir,
    timeout: options.timeout || 120000,
    maxBuffer: options.maxBuffer || 1024 * 1024
  });

  return [stdout, stderr].filter(Boolean).join('\n').trim() || '(no output)';
}

function readText(file) {
  return fs.readFileSync(path.join(rootDir, file), 'utf8');
}

function firstHeading(file) {
  const line = readText(file).split(/\r?\n/).find((item) => item.startsWith('# '));
  return line ? line.replace(/^#\s+/, '') : '';
}

function findFiles(dir) {
  const fullDir = path.join(rootDir, dir);
  if (!fs.existsSync(fullDir)) return [];

  return fs.readdirSync(fullDir, { withFileTypes: true }).flatMap((entry) => {
    const relative = path.join(dir, entry.name);
    const full = path.join(rootDir, relative);
    if (entry.isDirectory()) return findFiles(relative);
    if (!entry.isFile()) return [];
    return [relative];
  });
}

function lastLines(text, count) {
  return String(text || '').split(/\r?\n/).slice(-count).join('\n');
}

function chunkText(text, size) {
  if (text.length <= size) return [text];

  const chunks = [];
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size));
  }
  return chunks;
}

function parseList(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function loadEnvFile(file) {
  const full = path.join(rootDir, file);
  if (!fs.existsSync(full)) return;

  for (const line of fs.readFileSync(full, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key] !== undefined) continue;
    process.env[key] = rawValue.replace(/^['"]|['"]$/g, '');
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
