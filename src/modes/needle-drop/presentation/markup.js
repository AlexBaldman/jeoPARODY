import { rankPlayers } from '../core/party.js';
import { ROUND_PHASES } from '../core/round.js';
import { CRATE_FORMATS, createSessionUrl } from '../core/session.js';

export function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const formatPoints = value => Number(value || 0).toLocaleString();

function playerCountMarkup(count, session) {
  return `<nav class="player-count" aria-label="Player count">
    ${[1, 2, 3, 4].map(value => `<a href="${escapeHtml(createSessionUrl({ playerCount: value, formatId: session.formatId, seed: session.seed }))}" ${value === count ? 'aria-current="page"' : ''}>${value}P</a>`).join('')}
  </nav>`;
}

function crateFormatsMarkup(playerCount, session) {
  return `<nav class="crate-formats" aria-label="Crate length">
    ${CRATE_FORMATS.map(format => `<a href="${escapeHtml(createSessionUrl({ playerCount, formatId: format.id, seed: session.seed }))}" ${format.id === session.formatId ? 'aria-current="page"' : ''}>
      <strong>${escapeHtml(format.label)}</strong><small>${escapeHtml(format.description)}</small>
    </a>`).join('')}
  </nav>`;
}

function gameOptionsMarkup(playerCount, session) {
  return `<details class="game-options">
    <summary>Change game <span>${playerCount} player${playerCount === 1 ? '' : 's'} · ${escapeHtml(session.formatLabel)}</span></summary>
    <div>
      <p>Players</p>${playerCountMarkup(playerCount, session)}
      <p>Round length</p>${crateFormatsMarkup(playerCount, session)}
    </div>
  </details>`;
}

function playersMarkup(state) {
  if (state.players.length === 1) return '';
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

function hostMessage(state, clue, performance) {
  if (state.audioError) return `Audio hiccup: ${state.audioError}`;
  if (state.phase === ROUND_PHASES.READY) {
    return state.revealIndex === 0
      ? `Press play. You will hear ${clue.reveals[0].duration} second of a famous melody.`
      : `${clue.reveals[state.revealIndex].duration}-second clip ready for ${clue.reveals[state.revealIndex].points} points.`;
  }
  if (state.phase === ROUND_PHASES.LISTENING) return 'Listen closely…';
  if (state.phase !== ROUND_PHASES.ANSWERING) return '';

  const activePlayer = state.players.find(player => player.id === state.activePlayerId);
  if (activePlayer) return state.players.length > 1
    ? `${activePlayer.name} owns the mic. Choose the title.`
    : 'Choose the title.';

  const allBlocked = state.blockedPlayerIds.length === state.players.length;
  if (allBlocked) {
    return state.revealIndex < clue.reveals.length - 1
      ? 'Nobody got it. Play a longer clip to put everyone back in.'
      : 'Nobody got it. Reveal the answer.';
  }
  if (state.players.length > 1) return 'Buzzers open. Press your number key to answer.';
  return performance?.call || 'Choose the title.';
}

function missMarkup(state) {
  if (!state.lastAttempt || state.lastAttempt.accepted || state.phase === ROUND_PHASES.RESOLVED) return '';
  const player = state.players.find(item => item.id === state.lastAttempt.playerId);
  const subject = player?.name || 'The room';
  if (state.lastAttempt.passed) {
    return `<p class="miss-call" role="status"><strong>${escapeHtml(subject)}</strong> passed the mic. Steal window open.</p>`;
  }
  const answer = state.lastAttempt.answer ? ` “${escapeHtml(state.lastAttempt.answer)}”` : '';
  const nextStep = state.players.length > 1
    ? 'Steal window open.'
    : 'Try a longer clip or reveal the answer.';

  return `<p class="miss-call" role="status"><strong>${escapeHtml(subject)}:</strong>${answer} is incorrect. ${nextStep}</p>`;
}

function lineageMarkup(clue) {
  return `<div class="lineage" aria-label="Sample lineage">
    <article>
      <span>ORIGINAL COMPOSITION</span>
      <strong>${escapeHtml(clue.source.title)}</strong>
      <small>${escapeHtml(clue.source.artist)} · ${clue.source.year}</small>
    </article>
    <div class="lineage__arrow" aria-hidden="true">➜<small>${clue.transformation.map(escapeHtml).join(' · ')}</small></div>
    <article>
      <span>HOUSE-BAND FLIP</span>
      <strong>${escapeHtml(clue.title)}</strong>
      <small>${escapeHtml(clue.artist)}</small>
    </article>
  </div>
  <blockquote class="liner-note">“${escapeHtml(clue.linerNote)}”</blockquote>`;
}

function directorCallMarkup(performance) {
  return performance?.call
    ? `<p class="director-call">HOST BOOTH: ${escapeHtml(performance.call)}</p>`
    : '';
}

function resultMarkup(state, episode, clue, options) {
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
      ${directorCallMarkup(options.performance)}
    </section>
    ${lineageMarkup(clue)}
    <button type="button" class="next" data-action="next">${state.clueIndex === episode.clues.length - 1 ? 'Finish round' : 'Next song'} →</button>
  </section>`;
}

function roundMarkup(state, episode, clue, reveal, options) {
  if (state.phase === ROUND_PHASES.RESOLVED) return resultMarkup(state, episode, clue, options);

  const heardCurrentReveal = state.listenedRevealIndex >= state.revealIndex;
  const activePlayer = state.players.find(player => player.id === state.activePlayerId);
  const canAnswer = state.phase === ROUND_PHASES.ANSWERING
    && activePlayer
    && !state.blockedPlayerIds.includes(activePlayer.id);
  const roomCanChoose = !state.activePlayerId || state.players.length === 1;
  const canPlay = [ROUND_PHASES.READY, ROUND_PHASES.ANSWERING].includes(state.phase)
    && roomCanChoose;
  const canBuy = state.phase === ROUND_PHASES.ANSWERING
    && heardCurrentReveal
    && roomCanChoose
    && state.revealIndex < clue.reveals.length - 1;
  const canGiveUp = state.phase === ROUND_PHASES.ANSWERING
    && state.listenedRevealIndex >= 0
    && roomCanChoose;
  const nextReveal = clue.reveals[state.revealIndex + 1];
  const playLabel = state.phase === ROUND_PHASES.LISTENING
    ? 'Listening…'
    : (heardCurrentReveal ? `↻ Replay ${reveal.duration}-second clip` : `▶ Play ${reveal.duration}-second clip`);
  const choicePrompt = state.phase === ROUND_PHASES.READY
    ? 'Choices unlock after the clip'
    : (state.players.length > 1 && !activePlayer ? 'Buzz to unlock your choices' : 'Pick one');

  return `<section class="clue-card">
    <div class="clue-card__progress" style="--progress:${((state.clueIndex + 1) / episode.clues.length) * 100}%" aria-hidden="true"></div>
    <div class="clue-card__meta"><span>SONG ${state.clueIndex + 1} OF ${episode.clues.length}</span><span>${escapeHtml(clue.category)}</span></div>
    <h2>${escapeHtml(clue.prompt)}</h2>
    <div class="turntable" aria-hidden="true"><div class="record ${state.phase === ROUND_PHASES.LISTENING ? 'record--spinning' : ''}"><i></i></div><div class="tonearm"></div></div>
    <button type="button" class="listen-control" data-action="play" ${canPlay ? '' : 'disabled'}>${escapeHtml(playLabel)}<small>${reveal.points} points available</small></button>
    <canvas id="waveform" class="waveform" role="img" aria-label="Stylized audio waveform showing playback progress"></canvas>
    <div class="reveal-meter" aria-label="Audio reveal ladder">
      ${clue.reveals.map((item, index) => `<div class="${index === state.revealIndex ? 'is-current' : ''} ${index < state.revealIndex ? 'is-spent' : ''} ${index <= state.listenedRevealIndex ? 'is-heard' : ''}">
        <span>${escapeHtml(item.label)}</span><strong>${item.duration}s</strong><small>${item.points} pts</small>
      </div>`).join('')}
    </div>
    <p class="host-call ${state.audioError ? 'host-call--error' : ''}" role="status" aria-live="polite">${escapeHtml(hostMessage(state, clue, options.performance))}</p>
    ${missMarkup(state)}
    <fieldset class="choice-grid" ${canAnswer ? '' : 'disabled'}>
      <legend>${escapeHtml(choicePrompt)}</legend>
      ${clue.choices.map((choice, index) => `<button type="button" data-action="answer" data-answer="${escapeHtml(choice)}" ${canAnswer ? '' : 'disabled'}><span>${String.fromCharCode(65 + index)}</span>${escapeHtml(choice)}</button>`).join('')}
    </fieldset>
    <div class="round-options">
      <button type="button" data-action="more" ${canBuy ? '' : 'disabled'}>${nextReveal ? `Hear ${nextReveal.duration} seconds` : 'Full clip reached'}<small>${nextReveal ? `${nextReveal.points} points available` : ''}</small></button>
      <button type="button" class="button--quiet" data-action="give-up" ${canGiveUp ? '' : 'disabled'}>Show answer</button>
      ${state.players.length > 1 ? `<button type="button" class="button--quiet" data-action="pass" ${canAnswer ? '' : 'disabled'}>Pass mic</button>` : ''}
    </div>
  </section>`;
}

function receiptMarkup(summary) {
  if (!summary) return '';
  return `<section class="session-receipt" aria-labelledby="receipt-heading">
    <p class="eyebrow" id="receipt-heading">SESSION RECEIPT</p>
    <dl>
      <div><dt>First-drop hits</dt><dd>${summary.firstDropHits}</dd></div>
      <div><dt>Guesses</dt><dd>${summary.guesses}</dd></div>
      <div><dt>Replays</dt><dd>${summary.replays}</dd></div>
      <div><dt>More audio</dt><dd>${summary.revealsBought}</dd></div>
      ${summary.buzzes ? `<div><dt>Buzzes</dt><dd>${summary.buzzes}</dd></div>` : ''}
      ${summary.steals ? `<div><dt>Steals</dt><dd>${summary.steals}</dd></div>` : ''}
      <div><dt>Avg. reveal</dt><dd>${summary.averageReveal}</dd></div>
      <div><dt>Elapsed</dt><dd>${summary.durationSeconds}s</dd></div>
    </dl>
    <p>No telemetry left this device. Even the spies had to play locally.</p>
  </section>`;
}

function finaleMarkup(state, episode, profile, isNewBest, options) {
  const ranked = rankPlayers(state.players);
  const topScore = ranked[0]?.score || 0;
  const winners = ranked.filter(player => player.score === topScore);
  const title = state.players.length === 1
    ? `${state.correct}/${episode.clues.length} songs identified`
    : (winners.length > 1 ? 'The round ends in a tie' : `${winners[0].name} wins`);

  const formatBest = profile.bestScores?.[options.session.formatId] || 0;

  return `<section class="finale">
    <p class="eyebrow">ROUND COMPLETE</p>
    <h2 id="finale-heading" tabindex="-1">${escapeHtml(title)}</h2>
    ${directorCallMarkup(options.performance)}
    <p>${escapeHtml(options.session.formatLabel)}</p>
    <p>${formatPoints(state.score)} room points. The waveform has declined to comment.</p>
    ${state.players.length === 1 ? `<p class="personal-best ${isNewBest ? 'is-new' : ''}">${isNewBest ? 'NEW FORMAT BEST' : 'FORMAT BEST'} <strong>${formatPoints(formatBest)}</strong></p>` : ''}
    <ol class="standings" aria-label="Final standings">
      ${ranked.map((player, index) => `<li style="--player:${player.color}"><span>${index + 1}</span><strong>${escapeHtml(player.name)}</strong><small>${player.correct} correct</small><b>${formatPoints(player.score)}</b></li>`).join('')}
    </ol>
    ${receiptMarkup(options.sessionSummary)}
    <div class="finale__actions">
      <button type="button" data-action="restart">Play again</button>
      <a href="${escapeHtml(options.freshCrateUrl)}">New mix →</a>
      <button type="button" class="button--quiet" data-action="copy-result">Copy result</button>
    </div>
    <p class="copy-status" role="status" aria-live="polite">${escapeHtml(options.copyStatus)}</p>
  </section>`;
}

export function renderApp(state, episode, options = {}) {
  const {
    profile = { bestScores: {} },
    isNewBest = false,
    session = episode.session || { formatId: 'quick', formatLabel: 'Quick Hit', seed: 'original' },
  } = options;
  const clue = episode.clues[state.clueIndex];
  const reveal = clue?.reveals[state.revealIndex];
  const complete = state.phase === ROUND_PHASES.COMPLETE;
  const isParty = state.players.length > 1;
  const ranked = rankPlayers(state.players);
  const secondaryMetric = isParty
    ? { label: 'LEAD', value: formatPoints(ranked[0]?.score) }
    : { label: 'STREAK', value: state.players[0]?.streak || 0 };
  const body = complete
    ? finaleMarkup(state, episode, profile, isNewBest, { ...options, session })
    : roundMarkup(state, episode, clue, reveal, options);

  return `<main id="game" class="stage" data-phase="${state.phase}" data-scene="${escapeHtml(options.performance?.scene || 'CLUE')}" data-reveal-index="${state.revealIndex}" style="--accent:${clue?.palette?.[0] || '#ff3f81'};--accent-2:${clue?.palette?.[1] || '#00d7d7'}">
    <header class="show-header">
      <a href="./" class="show-header__universe">JEO<span>PARODY</span> / MUSIC DISTRICT</a>
      <button type="button" class="show-header__sound" data-action="toggle-sound" aria-pressed="${options.showSoundEnabled !== false}" aria-label="Show sound ${options.showSoundEnabled !== false ? 'on' : 'off'}"><span>SHOW SOUND</span><strong>${options.showSoundEnabled !== false ? 'ON' : 'OFF'}</strong></button>
      <div class="show-header__score"><span>${isParty ? 'ROOM TOTAL' : 'SCORE'}</span><strong>${formatPoints(state.score)}</strong></div>
      <div class="show-header__streak"><span>${secondaryMetric.label}</span><strong>${secondaryMetric.value}</strong></div>
    </header>
    <section class="marquee">
      <span>PROJECT CRATE EXPECTATIONS</span>
      <h1>NEEDLE DROP</h1>
      <p class="marquee__promise">Hear a tiny clip. Name the song.</p>
      <p class="marquee__steps" aria-label="How to play">Play clip <b>→</b> choose title <b>→</b> reveal the musical DNA</p>
      ${gameOptionsMarkup(state.players.length, session)}
    </section>
    ${playersMarkup(state)}
    ${body}
    <footer><span>Public-domain compositions · original procedural performances.</span><span>No mystery titles. No psychic paperwork.</span></footer>
  </main>`;
}
