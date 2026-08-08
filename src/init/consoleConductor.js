import { eventBus, GAME_EVENTS } from '../utils/events.js';
import { logger as console } from '../utils/logger.js';

const CONDUCTOR_FLAG = 'jeoparody_console_conductor';

const isBrowser = typeof window !== 'undefined';
const isLocalRuntime = isBrowser && (
  window.location.hostname === 'localhost'
  || window.location.hostname === '127.0.0.1'
  || window.location.search.includes('debug=true')
);

let installed = false;

function conductorEnabled() {
  if (!isBrowser) return false;
  const setting = localStorage.getItem(CONDUCTOR_FLAG);
  if (setting === 'off') return false;
  if (setting === 'on') return true;
  return isLocalRuntime;
}

function compactText(value, maxLength = 96) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1)}…`;
}

function money(value) {
  const amount = Number(value || 0);
  return Number.isFinite(amount) ? `$${amount}` : '$???';
}

function confidencePercent(validation = {}) {
  const confidence = Number(validation.confidence);
  if (!Number.isFinite(confidence)) return 'n/a';
  return `${Math.round(confidence * 100)}%`;
}

function section(title, details) {
  if (!conductorEnabled()) return;
  console.groupCollapsed(title);
  if (details) console.log(details);
  console.groupEnd();
}

function line(message, details) {
  if (!conductorEnabled()) return;
  if (details) {
    console.log(message, details);
  } else {
    console.log(message);
  }
}

function warn(message, details) {
  if (!conductorEnabled()) return;
  if (details) {
    console.warn(message, details);
  } else {
    console.warn(message);
  }
}

function error(message, details) {
  if (!conductorEnabled()) return;
  if (details) {
    console.error(message, details);
  } else {
    console.error(message);
  }
}

function summarizeQuestion(question = {}) {
  return {
    id: question.id || 'unfiled',
    category: question.category || 'mystery drawer',
    value: money(question.value),
    answer: compactText(question.answer, 72),
    clue: compactText(question.question || question.clue, 110),
    source: question.source || question.year || question.airdate || 'local archive'
  };
}

function installGameFlowLogs() {
  eventBus.on('game:engine-started', () => {
    line('🎮🎩 Engine awake. The little gears are wearing tiny tuxedos.');
  });

  eventBus.on('game:start', ({ mode = 'classic', difficulty = 'normal' } = {}) => {
    section(`🕹️ Curtain up: ${mode} mode`, {
      mode,
      difficulty,
      note: 'New session requested. If this goes sideways, start checking from here.'
    });
  });

  eventBus.on('game:started', ({ sessionId, options } = {}) => {
    line('🎬 Session born. Try not to name it; that only makes debugging harder.', {
      sessionId,
      options
    });
  });

  eventBus.on('game:phase-changed', ({ from, to, timestamp } = {}) => {
    line(`🎼 Phase change: ${from} → ${to}`, {
      timestamp: Math.round(timestamp || 0)
    });
  });

  eventBus.on('question:request-new', () => {
    line('🎣 New clue requested. Lowering a bucket into the trivia well.');
  });

  eventBus.on('question:fetch:start', ({ buffer, total } = {}) => {
    line('📚 Question service is rummaging through the archive.', {
      bufferRemaining: buffer,
      totalLoaded: total
    });
  });

  eventBus.on('question:fetch:complete', ({ source, question, buffer, total } = {}) => {
    line('📦 Clue fetched. It made the trip with most of its dignity.', {
      source,
      bufferRemaining: buffer,
      totalLoaded: total,
      ...summarizeQuestion(question)
    });
  });

  eventBus.on('question:fetch:error', ({ reason, fallback, buffer, total } = {}) => {
    warn('🧻 Clue fetch failed. Deploying the emergency trivia napkin.', {
      reason,
      bufferRemaining: buffer,
      totalLoaded: total,
      fallback: summarizeQuestion(fallback)
    });
  });

  eventBus.on(GAME_EVENTS.QUESTION_LOADED, ({ question, difficulty } = {}) => {
    section(`🧾 Clue on deck: ${question?.category || 'Unlabeled Cabinet'} ${money(question?.value)}`, {
      difficulty,
      ...summarizeQuestion(question)
    });
  });

  eventBus.on(GAME_EVENTS.ANSWER_SUBMITTED, ({ answer } = {}) => {
    line('✍️ Player submitted an answer. The judges have put down their sandwiches.', {
      submitted: compactText(answer, 96),
      length: String(answer || '').trim().length
    });
  });

  eventBus.on('game:answer:revealed', () => {
    warn('🫣 Answer revealed. The honor system is now wearing a fake mustache.');
  });

  eventBus.on('answer:evaluated', (result = {}) => {
    const verdict = result.isCorrect ? '✅ Accepted' : '❌ Rejected';
    const question = result.question || {};
    const validation = result.validation || {};
    section(`${verdict}: ${compactText(result.userAnswer || '(empty)', 50)}`, {
      category: question.category,
      value: money(question.value),
      correctAnswer: compactText(result.correctAnswer, 96),
      rawSubmitted: compactText(validation.rawUserAnswer || result.userAnswer, 96),
      normalizedSubmitted: validation.normalizedUserAnswer,
      acceptedTarget: validation.acceptedAnswer || validation.normalizedCorrectAnswer,
      acceptedVariants: validation.acceptedAnswers,
      editDistance: validation.distance,
      editAllowance: validation.threshold,
      judgment: validation.judgmentLabel,
      notes: validation.judgmentNotes,
      scoreDelta: result.score?.total ?? 0,
      scoreBreakdown: {
        base: result.score?.base ?? 0,
        timeBonus: result.score?.timeBonus ?? 0,
        streakBonus: result.score?.streakBonus ?? 0,
        difficultyBonus: result.score?.difficultyBonus ?? 0,
        penalty: result.score?.penalty ?? 0
      },
      streakDelta: result.score?.streak ?? 0,
      confidence: confidencePercent(validation),
      reason: validation.reason || 'unknown',
      timedOut: Boolean(result.timedOut),
      timeElapsedMs: Math.round(result.timeElapsed || 0)
    });
  });

  eventBus.on('game:time-up', () => {
    warn('⏰ Time expired. The clock has testified, and frankly it seemed smug.');
  });

  eventBus.on('game:error', ({ message } = {}) => {
    error('🧯 Game error. Someone tripped over a cable labeled “definitely not important.”', {
      message
    });
  });
}

function installServiceLogs() {
  eventBus.on('questions:loaded', ({ count } = {}) => {
    line('🗃️ Question archive loaded. The facts are stacked like pancakes.', {
      count
    });
  });

  eventBus.on('questions:error', ({ error: message } = {}) => {
    error('📭 Question archive failed to load. The library card came back haunted.', {
      message
    });
  });

  eventBus.on('host:image-changed', ({ direction, index } = {}) => {
    line('🖼️ Host skin changed. Wardrobe has opinions.', {
      direction,
      index
    });
  });

  eventBus.on('host:mood-changed', ({ mood, stats } = {}) => {
    line(`🎭 Host mood: ${mood}. This is science, but wearing a dinner jacket.`, stats);
  });

  eventBus.on('theme:changed', ({ theme } = {}) => {
    line(`🎨 Theme changed to ${theme}. The pixels are redecorating.`);
  });

  eventBus.on('language:changed', ({ lang } = {}) => {
    line(`🌐 Language switched to ${lang}. The subtitles found a passport.`);
  });
}

export function installConsoleConductor() {
  if (installed) return;
  installed = true;

  if (!conductorEnabled()) return;

  line('🎙️ Console Conductor online. Watch the muscles move; laugh only where medically indicated.', {
    disable: `localStorage.setItem('${CONDUCTOR_FLAG}', 'off')`,
    enable: `localStorage.setItem('${CONDUCTOR_FLAG}', 'on')`
  });

  installGameFlowLogs();
  installServiceLogs();
}

export default installConsoleConductor;
