import './styles.css';
import { demoEpisode, validateEpisode } from './core/content.js';
import { playerForKey } from './core/party.js';
import { createInitialState, reduceRound, ROUND_PHASES } from './core/round.js';
import { createFreshSeed, createSessionEpisode, createSessionUrl } from './core/session.js';
import { createShowEvent } from './core/showEvents.js';
import { renderApp } from './presentation/markup.js';
import { ShowDirector, SHOW_SCENES } from './presentation/showDirector.js';
import { Waveform } from './presentation/Waveform.js';
import { AudioRuntime } from './services/audioRuntime.js';
import { ProfileStore } from './services/profileStore.js';
import { SessionRecorder, sessionResultText } from './services/sessionRecorder.js';
import { StingAudio } from './services/stingAudio.js';

const errors = validateEpisode(demoEpisode);
if (errors.length) throw new Error(`Needle Drop content invalid:\n${errors.join('\n')}`);

const app = document.querySelector('#needle-drop-app');
if (!app) throw new Error('Needle Drop mount point is missing. The crate cannot levitate.');

const audio = new AudioRuntime();
const profileStore = new ProfileStore();
const params = new URLSearchParams(window.location.search);
const requestedPlayers = params.get('players');
const episode = createSessionEpisode(demoEpisode, {
  formatId: params.get('crate'),
  seed: params.get('seed'),
});
const session = episode.session;
const freshCrateUrl = createSessionUrl({
  playerCount: requestedPlayers,
  formatId: session.formatId,
  seed: createFreshSeed(),
});

let state = createInitialState(episode, { playerCount: requestedPlayers });
let profile = profileStore.read();
let waveform;
let playbackToken = 0;
let isNewBest = false;
let sessionSummary = null;
let copyStatus = '';
let performance = null;
const sessionRecorder = new SessionRecorder();
const stingAudio = new StingAudio({ enabled: profile.settings.showSound });
const showDirector = new ShowDirector({
  audio: stingAudio,
  onPerformance: nextPerformance => { performance = nextPerformance; },
});

function emitShowEvent(event) {
  if (!event) return;
  window.dispatchEvent(new CustomEvent('needle-drop:event', {
    detail: { event, performance },
  }));
}

function focusAfter(actionType) {
  window.queueMicrotask(() => {
    if (actionType === 'COPY_RESULT') {
      document.querySelector('[data-action="copy-result"]')?.focus();
      return;
    }
    if (actionType === 'TOGGLE_SOUND') {
      document.querySelector('[data-action="toggle-sound"]')?.focus();
      return;
    }
    if (state.phase === ROUND_PHASES.COMPLETE) {
      document.querySelector('#finale-heading')?.focus();
      return;
    }
    if (state.phase === ROUND_PHASES.RESOLVED) {
      document.querySelector('#result-heading')?.focus();
      return;
    }
    if (state.activePlayerId) {
      document.querySelector('#answer')?.focus();
      return;
    }
    if (['MORE_AUDIO', 'NEXT_CLUE', 'RESTART', 'AUDIO_FAILED'].includes(actionType)) {
      document.querySelector('[data-action="play"]')?.focus();
      return;
    }
    if (['SUBMIT_ANSWER', 'PASS'].includes(actionType)) {
      const nextControl = document.querySelector('[data-action="more"]:not(:disabled)')
        || document.querySelector('[data-action="give-up"]:not(:disabled)');
      nextControl?.focus();
    }
  });
}

function render(actionType) {
  waveform?.destroy();
  app.innerHTML = renderApp(state, episode, {
    profile,
    isNewBest,
    session,
    sessionSummary,
    freshCrateUrl,
    copyStatus,
    performance,
    showSoundEnabled: profile.settings.showSound,
  });

  const canvas = document.querySelector('#waveform');
  if (canvas) {
    waveform = new Waveform(canvas);
    waveform.setProgress(0);
  } else {
    waveform = undefined;
  }

  if (actionType) focusAfter(actionType);
}

function dispatch(action) {
  const previous = state;
  const next = reduceRound(state, action, episode);
  if (next === previous) return false;

  const showEvent = createShowEvent(action, previous, next, episode);
  state = next;
  sessionRecorder.record(showEvent, previous, next);
  if (state.phase === ROUND_PHASES.COMPLETE && previous.phase !== ROUND_PHASES.COMPLETE) {
    sessionSummary = sessionRecorder.summarize(state, episode);
    if (state.players.length === 1) {
      const previousBest = profile.bestScores?.[session.formatId] || 0;
      profile = profileStore.recordCompletedScore(state.score, session.formatId);
      isNewBest = state.score > previousBest;
    }
  }
  if (action.type === 'RESTART') {
    isNewBest = false;
    sessionSummary = null;
    copyStatus = '';
  }

  showDirector.perform(showEvent, state, episode);
  emitShowEvent(showEvent);
  render(action.type);
  return true;
}

async function playCurrentReveal() {
  if (!dispatch({ type: 'PLAY_REVEAL' })) return;

  const clue = episode.clues[state.clueIndex];
  const reveal = clue.reveals[state.revealIndex];
  const token = ++playbackToken;
  waveform?.animate(reveal.duration * 1000);

  try {
    await audio.play(clue, reveal);
    if (token !== playbackToken) return;
    dispatch({ type: 'REVEAL_FINISHED' });
  } catch (error) {
    if (token !== playbackToken) return;
    const message = error instanceof Error ? error.message : 'Unknown playback error';
    dispatch({ type: 'AUDIO_FAILED', message });
  }
}

function toggleShowSound() {
  const enabled = !profile.settings.showSound;
  profile = profileStore.setShowSound(enabled);
  stingAudio.setEnabled(enabled);
  performance = {
    scene: state.phase === ROUND_PHASES.COMPLETE ? SHOW_SCENES.WINNER : SHOW_SCENES.CLUE,
    cue: null,
    call: enabled
      ? 'Show sound on. The tiny orchestra has been released on its own recognizance.'
      : 'Show sound off. Captions remain on duty and have requested better chairs.',
  };
  render('TOGGLE_SOUND');
}

async function copySessionResult() {
  if (!sessionSummary) return;
  const text = sessionResultText(state, episode, sessionSummary);

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const field = document.createElement('textarea');
      field.value = text;
      field.setAttribute('readonly', '');
      field.className = 'copy-field';
      document.body.append(field);
      field.select();
      document.execCommand('copy');
      field.remove();
    }
    copyStatus = 'Result copied. The clipboard now knows too much.';
  } catch {
    copyStatus = 'Copy blocked. The clipboard has retained counsel.';
  }
  render('COPY_RESULT');
}

function stopPlayback() {
  playbackToken += 1;
  audio.stop();
  showDirector.dispose();
}

app.addEventListener('click', event => {
  const control = event.target.closest('[data-action]');
  if (!control || control.disabled) return;

  switch (control.dataset.action) {
    case 'play':
      playCurrentReveal();
      break;
    case 'more':
      dispatch({ type: 'MORE_AUDIO' });
      break;
    case 'give-up':
      dispatch({ type: 'GIVE_UP' });
      break;
    case 'pass':
      dispatch({ type: 'PASS' });
      break;
    case 'next':
      stopPlayback();
      dispatch({ type: 'NEXT_CLUE' });
      break;
    case 'restart':
      stopPlayback();
      dispatch({ type: 'RESTART' });
      break;
    case 'copy-result':
      copySessionResult();
      break;
    case 'toggle-sound':
      toggleShowSound();
      break;
    default:
      break;
  }
});

app.addEventListener('submit', event => {
  if (event.target.id !== 'answer-form') return;
  event.preventDefault();
  const answer = new FormData(event.target).get('answer');
  if (String(answer).trim()) dispatch({ type: 'SUBMIT_ANSWER', answer });
});

window.addEventListener('keydown', event => {
  const target = event.target;
  const isTyping = target instanceof window.HTMLInputElement
    || target instanceof window.HTMLTextAreaElement
    || target instanceof window.HTMLSelectElement
    || target?.isContentEditable;
  if (event.repeat || event.isComposing || event.altKey || event.ctrlKey || event.metaKey || isTyping) return;
  if (state.phase !== ROUND_PHASES.ANSWERING || state.activePlayerId) return;

  const player = playerForKey(state.players, event.key);
  if (player && dispatch({ type: 'BUZZ', playerId: player.id })) event.preventDefault();
});

window.addEventListener('pagehide', stopPlayback);
render();
