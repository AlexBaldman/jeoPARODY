import './styles.css';
import { demoEpisode, validateEpisode } from './core/content.js';
import { playerForKey } from './core/party.js';
import { createInitialState, reduceRound, ROUND_PHASES } from './core/round.js';
import { renderApp } from './presentation/markup.js';
import { Waveform } from './presentation/Waveform.js';
import { AudioRuntime } from './services/audioRuntime.js';
import { ProfileStore } from './services/profileStore.js';

const errors = validateEpisode(demoEpisode);
if (errors.length) throw new Error(`Needle Drop content invalid:\n${errors.join('\n')}`);

const app = document.querySelector('#needle-drop-app');
if (!app) throw new Error('Needle Drop mount point is missing. The crate cannot levitate.');

const audio = new AudioRuntime();
const profileStore = new ProfileStore();
const requestedPlayers = new URLSearchParams(window.location.search).get('players');

let state = createInitialState(demoEpisode, { playerCount: requestedPlayers });
let profile = profileStore.read();
let waveform;
let playbackToken = 0;
let isNewBest = false;

function emit(name, detail = {}) {
  window.dispatchEvent(new CustomEvent(`needle-drop:${name}`, {
    detail: { ...detail, state },
  }));
}

function focusAfter(actionType) {
  window.queueMicrotask(() => {
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
  app.innerHTML = renderApp(state, demoEpisode, { profile, isNewBest });

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
  const next = reduceRound(state, action, demoEpisode);
  if (next === previous) return false;

  state = next;
  if (state.phase === ROUND_PHASES.COMPLETE && previous.phase !== ROUND_PHASES.COMPLETE) {
    if (state.players.length === 1) {
      const previousBest = profile.bestScore;
      profile = profileStore.recordCompletedScore(state.score);
      isNewBest = state.score > previousBest;
    }
  }
  if (action.type === 'RESTART') isNewBest = false;

  emit(action.type.toLowerCase(), { action, previous });
  render(action.type);
  return true;
}

async function playCurrentReveal() {
  if (!dispatch({ type: 'PLAY_REVEAL' })) return;

  const clue = demoEpisode.clues[state.clueIndex];
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
    emit('audio_error', { error: message, clueId: clue.id, revealIndex: state.revealIndex });
    dispatch({ type: 'AUDIO_FAILED', message });
  }
}

function stopPlayback() {
  playbackToken += 1;
  audio.stop();
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
