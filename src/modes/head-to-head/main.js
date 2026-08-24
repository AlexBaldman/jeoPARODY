import './styles.css';
import questionService from '../../services/api/questionService.js';
import { createRoomGateway } from '../../services/multiplayer/createRoomGateway.js';
import { generateRoomCode, normalizeRoomCode } from '../../services/multiplayer/roomCode.js';
import {
  clearRoomSession,
  loadRoomSession,
  saveRoomSession,
} from '../../services/multiplayer/roomSession.js';
import { createMatchState, MATCH_PHASES } from './core/match.js';
import { HeadToHeadHost } from './HeadToHeadHost.js';

const root = document.querySelector('#head-to-head-app');
const statusRegion = document.querySelector('#head-to-head-status');

let gateway;
let localPlayer;
let roomState;
let roomId;
let unsubscribeRoom;
let hostController;

function makeRoomId() {
  return globalThis.crypto?.randomUUID?.()
    || `room-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function setStatus(message, kind = 'info') {
  if (!statusRegion) return;
  statusRegion.textContent = message || '';
  statusRegion.dataset.kind = kind;
}

function transportCopy() {
  return gateway?.kind === 'firebase'
    ? 'Cloud room · anonymous Firebase identity'
    : 'Local lab · same browser only';
}

function playerById(id) {
  return roomState?.players.find(player => player.id === id);
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function requestedJoinCode() {
  return normalizeRoomCode(new URLSearchParams(window.location.search).get('join') || '');
}

function requestedRoomId() {
  return new URLSearchParams(window.location.search).get('room');
}

function updateRoomUrl(id) {
  const url = new URL(window.location.href);
  url.searchParams.delete('join');
  url.searchParams.set('room', id);
  if (gateway.kind === 'local') {
    url.searchParams.set('transport', 'local');
  } else {
    url.searchParams.delete('transport');
  }
  window.history.replaceState({}, '', url);
}

function buildInviteUrl() {
  const url = new URL('head-to-head.html', window.location.href);
  url.search = '';
  url.searchParams.set('join', roomState.joinCode);
  if (gateway.kind === 'local') url.searchParams.set('transport', 'local');
  return url.toString();
}

function renderEntry() {
  const joinCode = requestedJoinCode();
  root.innerHTML = `
    <main class="h2h-shell">
      <a class="h2h-back" href="./">← JeoPARODY</a>
      <section class="h2h-hero">
        <div>
          <p class="h2h-kicker">TWO HUMANS ENTER. STATISTICS LEAVE.</p>
          <h1>Head to Head</h1>
          <p>Five shared clues. One answer each. No account ceremony.</p>
        </div>
        <div class="h2h-signal">${escapeHtml(transportCopy())}</div>
      </section>

      <section class="h2h-entry-grid">
        <form id="create-room-form" class="h2h-panel">
          <span class="h2h-panel-number">01</span>
          <h2>Create match</h2>
          <label>Nickname
            <input name="nickname" maxlength="28" autocomplete="nickname" required placeholder="Turd Ferguson">
          </label>
          <button class="h2h-primary" type="submit">Create room</button>
        </form>

        <form id="join-room-form" class="h2h-panel">
          <span class="h2h-panel-number">02</span>
          <h2>${joinCode ? 'Your invitation awaits' : 'Join match'}</h2>
          <label>Nickname
            <input name="nickname" maxlength="28" autocomplete="nickname" required placeholder="Contestant 2" ${joinCode ? 'autofocus' : ''}>
          </label>
          <label>Room code
            <input name="code" maxlength="8" autocapitalize="characters" spellcheck="false" required placeholder="B7K9P" value="${escapeHtml(joinCode)}">
          </label>
          <button class="h2h-primary" type="submit">Join room</button>
        </form>
      </section>

      ${gateway.kind === 'local' ? `
        <aside class="h2h-lab-note">
          Firebase is not configured, so this build uses a two-tab local proving transport.
          Open this page in another tab and enter the room code there.
        </aside>
      ` : ''}
    </main>
  `;

  root.querySelector('#create-room-form').addEventListener('submit', createRoom);
  root.querySelector('#join-room-form').addEventListener('submit', joinRoom);
}

async function createRoom(event) {
  event.preventDefault();
  setStatus('Creating room…');

  const form = new FormData(event.currentTarget);
  localPlayer = await gateway.ensurePlayer(form.get('nickname'));

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = generateRoomCode();
    const id = makeRoomId();
    const initial = createMatchState({
      roomId: id,
      joinCode: code,
      host: localPlayer,
    });

    try {
      await gateway.createRoom(initial);
      await enterRoom(id, initial);
      return;
    } catch (error) {
      if (error.code !== 'ROOM_CODE_COLLISION') throw error;
    }
  }

  throw new Error('Could not allocate a room code after five attempts.');
}

async function joinRoom(event) {
  event.preventDefault();
  setStatus('Finding room…');

  const form = new FormData(event.currentTarget);
  localPlayer = await gateway.ensurePlayer(form.get('nickname'));
  const code = normalizeRoomCode(form.get('code'));
  const id = await gateway.resolveRoom(code);

  await enterRoom(id);
  await gateway.sendCommand(id, {
    type: 'JOIN',
    actorId: localPlayer.id,
    payload: { player: localPlayer },
  });
}

function leaveUnavailableRoom() {
  clearRoomSession();
  roomState = null;
  roomId = null;
  unsubscribeRoom?.();
  unsubscribeRoom = null;
  hostController?.stop();
  hostController = null;

  const url = new URL(window.location.href);
  url.searchParams.delete('room');
  window.history.replaceState({}, '', url);
  renderEntry();
  setStatus('That room is no longer available. Create or join another match.', 'error');
}

async function enterRoom(id, initialState = null) {
  roomId = id;
  roomState = initialState;
  unsubscribeRoom?.();
  hostController?.stop();
  hostController = null;
  setStatus('');
  updateRoomUrl(id);
  saveRoomSession({ roomId: id, player: localPlayer, transport: gateway.kind });

  unsubscribeRoom = gateway.subscribeRoom(roomId, (state, error) => {
    if (error) {
      setStatus(error.message, 'error');
      return;
    }
    if (!state) {
      leaveUnavailableRoom();
      return;
    }

    roomState = state;
    if (localPlayer?.id === state.hostId) {
      if (!hostController) {
        hostController = new HeadToHeadHost({
          roomId,
          hostId: state.hostId,
          gateway,
          questionProvider: () => questionService.getQuestion(),
          initialState: state,
          onError: error => setStatus(error.message, 'error'),
        });
        hostController.start();
      } else {
        hostController.setState(state);
      }
    }

    renderRoom();
  });
}

async function restoreRoomSession() {
  const targetRoomId = requestedRoomId();
  if (!targetRoomId) return false;

  const session = loadRoomSession();
  if (!session || session.roomId !== targetRoomId) return false;
  if (session.transport && session.transport !== gateway.kind) return false;

  const restoredPlayer = await gateway.ensurePlayer(session.player.nickname);
  if (restoredPlayer.id !== session.player.id) {
    clearRoomSession();
    return false;
  }

  localPlayer = restoredPlayer;
  await enterRoom(targetRoomId);
  return true;
}

function renderScores() {
  return roomState.players.map(player => `
    <article class="h2h-player ${player.id === localPlayer.id ? 'is-you' : ''}">
      <div>
        <span class="h2h-player-label">${player.id === roomState.hostId ? 'HOST' : 'CHALLENGER'}</span>
        <strong>${escapeHtml(player.nickname)}</strong>
      </div>
      <span class="h2h-score">${player.score}</span>
    </article>
  `).join('');
}

function renderLobby() {
  const me = playerById(localPlayer.id);
  const opponentMissing = roomState.players.length < 2;
  const allReady = roomState.players.length === 2 && roomState.players.every(player => player.ready);
  const isHost = localPlayer.id === roomState.hostId;

  return `
    <section class="h2h-room-card">
      <div class="h2h-code-wrap">
        <span>ROOM CODE</span>
        <button class="h2h-code" data-copy-code type="button">${escapeHtml(roomState.joinCode)}</button>
        <small>${escapeHtml(transportCopy())}</small>
      </div>

      <div class="h2h-score-grid">${renderScores()}</div>

      <div class="h2h-lobby-status">
        ${opponentMissing ? 'Waiting for challenger…' : 'Both contestants detected. A miracle of networking.'}
      </div>

      <div class="h2h-actions">
        <button class="h2h-secondary" data-copy-invite type="button">Copy invite link</button>
        <button class="h2h-secondary" data-ready type="button">
          ${me?.ready ? 'Unready' : 'Ready up'}
        </button>
        ${isHost ? `
          <button class="h2h-primary" data-start type="button" ${allReady ? '' : 'disabled'}>
            Start five-clue match
          </button>
        ` : ''}
      </div>
    </section>
  `;
}

function renderPlaying() {
  const hasSubmitted = roomState.round.submittedPlayerIds.includes(localPlayer.id);
  return `
    <section class="h2h-room-card">
      <div class="h2h-round-meta">
        <span>ROUND ${roomState.roundIndex + 1}/${roomState.totalRounds}</span>
        <span>${escapeHtml(roomState.round.question.category)}</span>
        <span>${roomState.round.question.value} PTS</span>
      </div>

      <div class="h2h-score-grid">${renderScores()}</div>

      <article class="h2h-clue">
        ${escapeHtml(roomState.round.question.prompt)}
      </article>

      ${hasSubmitted ? `
        <div class="h2h-waiting">Answer locked. Waiting for your opponent.</div>
      ` : `
        <form id="answer-form" class="h2h-answer-form">
          <label for="answer">Your answer</label>
          <div>
            <input id="answer" name="answer" maxlength="200" autocomplete="off" required autofocus>
            <button class="h2h-primary" type="submit">Lock it</button>
          </div>
        </form>
      `}
    </section>
  `;
}

function renderRoundResult() {
  const isHost = localPlayer.id === roomState.hostId;
  const resultRows = roomState.players.map(player => {
    const outcome = roomState.round.outcomes[player.id];
    return `
      <div class="h2h-result-row">
        <strong>${escapeHtml(player.nickname)}</strong>
        <span>${outcome?.isCorrect ? `+${outcome.points}` : '0'}</span>
      </div>
    `;
  }).join('');

  return `
    <section class="h2h-room-card">
      <div class="h2h-score-grid">${renderScores()}</div>
      <div class="h2h-reveal">
        <span>CORRECT RESPONSE</span>
        <h2>${escapeHtml(roomState.round.answerReveal)}</h2>
      </div>
      <div class="h2h-results">${resultRows}</div>
      ${isHost ? `
        <button class="h2h-primary h2h-next" data-next type="button">
          ${roomState.roundIndex + 1 >= roomState.totalRounds ? 'Final scores' : 'Next clue'}
        </button>
      ` : '<div class="h2h-waiting">Host controls the next clue.</div>'}
    </section>
  `;
}

function renderComplete() {
  const winners = roomState.players
    .filter(player => roomState.winnerIds.includes(player.id))
    .map(player => player.nickname);

  return `
    <section class="h2h-room-card">
      <div class="h2h-complete-kicker">FINAL SIGNAL</div>
      <h2 class="h2h-winner">${escapeHtml(winners.join(' + '))}</h2>
      <p>${winners.length > 1 ? 'A tie. Statistics have failed us.' : 'wins the head-to-head.'}</p>
      <div class="h2h-score-grid">${renderScores()}</div>
      <a class="h2h-primary h2h-link-button" href="./head-to-head.html">New match</a>
    </section>
  `;
}

function renderRoom() {
  if (!roomState || !localPlayer) return;

  let content;
  switch (roomState.phase) {
    case MATCH_PHASES.LOBBY:
      content = renderLobby();
      break;
    case MATCH_PHASES.PLAYING:
      content = renderPlaying();
      break;
    case MATCH_PHASES.ROUND_RESULT:
      content = renderRoundResult();
      break;
    case MATCH_PHASES.COMPLETE:
      content = renderComplete();
      break;
    default:
      content = '<p>Unknown match phase.</p>';
  }

  root.innerHTML = `
    <main class="h2h-shell">
      <a class="h2h-back" href="./">← JeoPARODY</a>
      <header class="h2h-room-header">
        <div>
          <p class="h2h-kicker">HEAD TO HEAD</p>
          <h1>${roomState.phase === MATCH_PHASES.LOBBY ? 'Green Room' : 'Live Match'}</h1>
        </div>
        <span class="h2h-signal">${escapeHtml(transportCopy())}</span>
      </header>
      ${content}
    </main>
  `;

  bindRoomActions();
}

function bindRoomActions() {
  root.querySelector('[data-copy-code]')?.addEventListener('click', async event => {
    await navigator.clipboard?.writeText(roomState.joinCode);
    event.currentTarget.textContent = 'COPIED';
    setTimeout(() => renderRoom(), 700);
  });

  root.querySelector('[data-copy-invite]')?.addEventListener('click', async event => {
    await navigator.clipboard?.writeText(buildInviteUrl());
    event.currentTarget.textContent = 'Invite copied';
    setTimeout(() => renderRoom(), 900);
  });

  root.querySelector('[data-ready]')?.addEventListener('click', async () => {
    const me = playerById(localPlayer.id);
    await send('SET_READY', { ready: !me.ready });
  });

  root.querySelector('[data-start]')?.addEventListener('click', () => send('START'));

  root.querySelector('#answer-form')?.addEventListener('submit', async event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const answer = String(form.get('answer') || '').trim();
    if (answer) await send('SUBMIT_ANSWER', { answer });
  });

  root.querySelector('[data-next]')?.addEventListener('click', () => send('NEXT_ROUND'));
}

async function send(type, payload = {}) {
  setStatus('');
  await gateway.sendCommand(roomId, {
    type,
    actorId: localPlayer.id,
    payload,
  });
}

async function boot() {
  try {
    gateway = await createRoomGateway();
    await questionService.initialize();
    if (await restoreRoomSession()) return;
    renderEntry();
  } catch (error) {
    console.error(error);
    setStatus(error.message, 'error');
    root.innerHTML = `
      <main class="h2h-shell">
        <a class="h2h-back" href="./">← JeoPARODY</a>
        <section class="h2h-panel">
          <h1>Multiplayer could not start</h1>
          <p>${escapeHtml(error.message)}</p>
        </section>
      </main>
    `;
  }
}

window.addEventListener('beforeunload', () => {
  unsubscribeRoom?.();
  hostController?.stop();
});

boot();
