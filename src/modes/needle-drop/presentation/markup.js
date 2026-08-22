import { rankPlayers } from '../core/party.js';
import { ROUND_PHASES } from '../core/round.js';

export function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const formatPoints = value => Number(value || 0).toLocaleString();

function playerCountMarkup(count) {
  return `<nav class="player-count" aria-label="Player count">
    ${[1, 2, 3, 4].map(value => `<a href="?players=${value}" ${value === count ? 'aria-current="page"' : ''}>${value}P</a>`).join('')}
  </nav>`;
}

function rulesMarkup(isParty) {
  return `<details class="rules">
    <summary>How to play <span>three steps, zero liner notes required</span></summary>
    <ol>
      <li><strong>Listen.</strong> Start with a ruthless 0.25-second fragment.</li>
      <li><strong>${isParty ? 'Buzz.' : 'Name it.'}</strong> ${isParty ? 'First eligible number key owns the mic.' : 'Lock a title after the clip ends.'}</li>
      <li><strong>Choose.</strong> Guess, replay free, or buy more audio for fewer points.</li>
    </ol>
  </details>`;
}

function playersMarkup(state) {
  return `<section class="players" aria-label="Players">
    ${state.players.map(player => {
      const isActive = state.activePlayerId === player.id;
      const isBlocked = state.blockedPlayerIds.includes(player.id);
      const classes = [isActive ? 'is-active' : '', isBlocked ? 'is-blocked' : '']
        .filter(Boolean)
        .join(' ');
      const status = isActive ? 'ON MIC' : (isBlocked ? 'LOCKED THIS CLIP' : '');

      return `<article class="${classes}" data-player-id="${player.id}" style="--player:${player.color}" aria-label="${escapeHtml(player.name)}, ${formatPoints(player.score)} points${status ? `, ${status.toLowerCase()}` : ''}">
        <kbd aria-label="Buzz key ${player.buzzKey}">${player.buzzKey}</kbd>
        <span class="players__identity"><strong>${escapeHtml(player.name)}</strong>${status ? `<small>${status}</small>` : ''}</span>
        <span class="players__score">${formatPoints(player.score)}</span>
      </article>`;
    }).join('')}
  </section>`;
}

function hostMessage(state, clue) {
  if (state.audioError) return `Audio hiccup: ${state.audioError}`;
  if (state.phase === ROUND_PHASES.READY) {
    return state.revealIndex === 0
      ? `Needle armed. Hear ${clue.reveals[0].duration} seconds, then make history or a small mistake.`
      : `${clue.reveals[state.revealIndex].duration}-second reveal ready. The points have become less emotionally available.`;
  }
  if (state.phase === ROUND_PHASES.LISTENING) return 'Ears up. Shazam has been asked to leave the building.';
  if (state.phase !== ROUND_PHASES.ANSWERING) return '';

  const activePlayer = state.players.find(player => player.id === state.activePlayerId);
  if (activePlayer) return `${activePlayer.name} owns the mic. Lock an answer.`;

  const allBlocked = state.blockedPlayerIds.length === state.players.length;
  if (allBlocked) {
    return state.revealIndex < clue.reveals.length - 1
      ? 'Nobody got it. Buy more audio to put every player back in the hunt.'
      : 'The full alibi fooled the room. Reveal the answer when dignity permits.';
  }
  if (state.players.length > 1) return 'Buzzers open. First eligible number key owns the mic.';
  return 'Name that suspicious noise. Spelling is judged by humans, which is already too much power.';
}

function missMarkup(state) {
  if (!state.lastAttempt || state.lastAttempt.accepted || state.phase === ROUND_PHASES.RESOLVED) return '';
  const player = state.players.find(item => item.id === state.lastAttempt.playerId);
  const subject = player?.name || 'The room';
  if (state.lastAttempt.passed) {
    return `<p class="miss-call" role="status"><strong>${escapeHtml(subject)}</strong> passed the mic. Steal window open.</p>`;
  }
  const answer = state.lastAttempt.answer ? ` “${escapeHtml(state.lastAttempt.answer)}”` : '';

  return `<p class="miss-call" role="status"><strong>${escapeHtml(subject)}:</strong>${answer} is not on the label. Steal window open.</p>`;
}

function lineageMarkup(clue) {
  return `<div class="lineage" aria-label="Sample lineage">
    <article>
      <span>ORIGINAL SOURCE</span>
      <strong>${escapeHtml(clue.source.title)}</strong>
      <small>${escapeHtml(clue.source.artist)} · ${clue.source.year}</small>
    </article>
    <div class="lineage__arrow" aria-hidden="true">➜<small>${clue.transformation.map(escapeHtml).join(' · ')}</small></div>
    <article>
      <span>THE FLIP</span>
      <strong>${escapeHtml(clue.title)}</strong>
      <small>${escapeHtml(clue.artist)}</small>
    </article>
  </div>
  <blockquote class="liner-note">“${escapeHtml(clue.linerNote)}”</blockquote>`;
}

function resultMarkup(state, episode, clue) {
  const accepted = state.result.accepted;
  const player = state.players.find(item => item.id === state.result.playerId);
  const attemptCount = state.attempts.filter(attempt => attempt.clueId === clue.id && !attempt.gaveUp).length;
  const eyebrow = accepted
    ? `CORRECT${player && state.players.length > 1 ? ` · ${player.name.toUpperCase()} SCORES` : ''}`
    : 'THE RECORD DISAGREES';
  const scoreLine = accepted
    ? `+${formatPoints(state.result.points)} points`
    : `0 points · ${attemptCount ? `${attemptCount} brave ${attemptCount === 1 ? 'guess' : 'guesses'}` : 'strategic surrender'}`;

  return `<section class="clue-card clue-card--result">
    <section class="result ${accepted ? 'result--correct' : 'result--wrong'}" role="status" aria-live="polite">
      <p class="eyebrow">${escapeHtml(eyebrow)}</p>
      <h2 id="result-heading" tabindex="-1">${escapeHtml(clue.title)}</h2>
      <p>${escapeHtml(clue.artist)}</p>
      <strong>${escapeHtml(scoreLine)}</strong>
    </section>
    ${lineageMarkup(clue)}
    <button type="button" class="next" data-action="next">${state.clueIndex === episode.clues.length - 1 ? 'Close the crate' : 'Next record'} →</button>
  </section>`;
}

function roundMarkup(state, episode, clue, reveal) {
  if (state.phase === ROUND_PHASES.RESOLVED) return resultMarkup(state, episode, clue);

  const heardCurrentReveal = state.listenedRevealIndex >= state.revealIndex;
  const activePlayer = state.players.find(player => player.id === state.activePlayerId);
  const canAnswer = state.phase === ROUND_PHASES.ANSWERING
    && activePlayer
    && !state.blockedPlayerIds.includes(activePlayer.id);
  const canPlay = [ROUND_PHASES.READY, ROUND_PHASES.ANSWERING].includes(state.phase)
    && !state.activePlayerId;
  const canBuy = state.phase === ROUND_PHASES.ANSWERING
    && heardCurrentReveal
    && !state.activePlayerId
    && state.revealIndex < clue.reveals.length - 1;
  const canGiveUp = state.phase === ROUND_PHASES.ANSWERING
    && state.listenedRevealIndex >= 0
    && !state.activePlayerId;
  const nextReveal = clue.reveals[state.revealIndex + 1];
  const answerLabel = canAnswer
    ? `${activePlayer.name}'s answer`
    : (state.phase === ROUND_PHASES.READY ? 'Listen before answering' : 'Buzz to claim the mic');
  const playLabel = state.phase === ROUND_PHASES.LISTENING
    ? 'Listening…'
    : (heardCurrentReveal ? `↻ Replay ${reveal.duration}s` : '▶ Drop the needle');

  return `<section class="clue-card">
    <div class="clue-card__progress" style="--progress:${((state.clueIndex + 1) / episode.clues.length) * 100}%" aria-hidden="true"></div>
    <div class="clue-card__meta"><span>TRACK ${state.clueIndex + 1}/${episode.clues.length}</span><span>${escapeHtml(clue.category)}</span></div>
    <h2>${escapeHtml(clue.prompt)}</h2>
    <div class="turntable" aria-hidden="true"><div class="record ${state.phase === ROUND_PHASES.LISTENING ? 'record--spinning' : ''}"><i></i></div><div class="tonearm"></div></div>
    <canvas id="waveform" class="waveform" role="img" aria-label="Stylized audio waveform showing playback progress"></canvas>
    <div class="reveal-meter" aria-label="Audio reveal ladder">
      ${clue.reveals.map((item, index) => `<div class="${index === state.revealIndex ? 'is-current' : ''} ${index < state.revealIndex ? 'is-spent' : ''} ${index <= state.listenedRevealIndex ? 'is-heard' : ''}">
        <span>${escapeHtml(item.label)}</span><strong>${item.duration}s</strong><small>${item.points} pts</small>
      </div>`).join('')}
    </div>
    <p class="host-call ${state.audioError ? 'host-call--error' : ''}" role="status" aria-live="polite">${escapeHtml(hostMessage(state, clue))}</p>
    ${missMarkup(state)}
    <form id="answer-form" class="answer">
      <label for="answer">${escapeHtml(answerLabel)}</label>
      <div>
        <input id="answer" name="answer" autocomplete="off" placeholder="Name that suspicious noise…" ${canAnswer ? '' : 'disabled'} />
        <button type="submit" ${canAnswer ? '' : 'disabled'}>Lock it</button>
      </div>
      ${state.players.length > 1 ? `<button type="button" class="answer__pass" data-action="pass" ${canAnswer ? '' : 'disabled'}>Pass mic · open the steal</button>` : ''}
    </form>
    <div class="controls">
      <button type="button" class="button--needle" data-action="play" ${canPlay ? '' : 'disabled'}>${escapeHtml(playLabel)}</button>
      <button type="button" data-action="more" ${canBuy ? '' : 'disabled'}>Buy more audio <small>${nextReveal ? `−${reveal.points - nextReveal.points} potential` : 'full clip reached'}</small></button>
      <button type="button" class="button--quiet" data-action="give-up" ${canGiveUp ? '' : 'disabled'}>Reveal answer <small>the crate keeps no secrets</small></button>
    </div>
  </section>`;
}

function finaleMarkup(state, episode, profile, isNewBest) {
  const ranked = rankPlayers(state.players);
  const topScore = ranked[0]?.score || 0;
  const winners = ranked.filter(player => player.score === topScore);
  const title = state.players.length === 1
    ? `${state.correct}/${episode.clues.length} identified`
    : (winners.length > 1 ? 'A crate-sharing tie' : `${winners[0].name} wins the crate`);

  return `<section class="finale">
    <p class="eyebrow">CRATE CLOSED</p>
    <h2 id="finale-heading" tabindex="-1">${escapeHtml(title)}</h2>
    <p>${formatPoints(state.score)} room points. The waveform has declined to comment.</p>
    ${state.players.length === 1 ? `<p class="personal-best ${isNewBest ? 'is-new' : ''}">${isNewBest ? 'NEW PERSONAL BEST' : 'PERSONAL BEST'} <strong>${formatPoints(profile.bestScore)}</strong></p>` : ''}
    <ol class="standings" aria-label="Final standings">
      ${ranked.map((player, index) => `<li style="--player:${player.color}"><span>${index + 1}</span><strong>${escapeHtml(player.name)}</strong><small>${player.correct} correct</small><b>${formatPoints(player.score)}</b></li>`).join('')}
    </ol>
    <button type="button" data-action="restart">Spin it again</button>
  </section>`;
}

export function renderApp(state, episode, { profile, isNewBest = false } = {}) {
  const clue = episode.clues[state.clueIndex];
  const reveal = clue?.reveals[state.revealIndex];
  const complete = state.phase === ROUND_PHASES.COMPLETE;
  const isParty = state.players.length > 1;
  const ranked = rankPlayers(state.players);
  const secondaryMetric = isParty
    ? { label: 'LEAD', value: formatPoints(ranked[0]?.score) }
    : { label: 'STREAK', value: state.players[0]?.streak || 0 };
  const body = complete
    ? finaleMarkup(state, episode, profile, isNewBest)
    : roundMarkup(state, episode, clue, reveal);

  return `<main id="game" class="stage" data-phase="${state.phase}" data-reveal-index="${state.revealIndex}" style="--accent:${clue?.palette?.[0] || '#ff3f81'};--accent-2:${clue?.palette?.[1] || '#00d7d7'}">
    <header class="show-header">
      <a href="./" class="show-header__universe">JEO<span>PARODY</span> / MUSIC DISTRICT</a>
      <div class="show-header__score"><span>${isParty ? 'ROOM TOTAL' : 'SCORE'}</span><strong>${formatPoints(state.score)}</strong></div>
      <div class="show-header__streak"><span>${secondaryMetric.label}</span><strong>${secondaryMetric.value}</strong></div>
    </header>
    <section class="marquee">
      <span>PROJECT CRATE EXPECTATIONS</span>
      <h1>NEEDLE DROP</h1>
      <p>Musical archaeology conducted at an unsafe volume.</p>
      ${playerCountMarkup(state.players.length)}
      ${rulesMarkup(isParty)}
    </section>
    ${playersMarkup(state)}
    ${body}
    <footer><span>All demo music is procedurally synthesized and original.</span><span>Audio truth before audio swagger.</span></footer>
  </main>`;
}
