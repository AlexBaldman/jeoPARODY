/**
 * Canonical Main Game scoring truth.
 *
 * Carmack filter: make the rule obvious enough to inspect without a diagram.
 * Correct answers add the authored clue value. Incorrect/timed-out answers reset
 * the current score to zero, matching the approved Jeopardish parity behavior.
 * Presentation, achievements, persistence, and multiplayer scoring stay outside
 * this pure transition.
 */

export const SCORE_RULES = Object.freeze({
  incorrectScoreMode: 'reset-to-zero',
  allowNegativeScore: false,
  defaultClueValue: 100,
});

export function parseClueValue(value, fallback = SCORE_RULES.defaultClueValue) {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return Math.round(value);
  }

  if (typeof value === 'string') {
    const digits = value.replace(/[^0-9]/g, '');
    const parsed = Number(digits);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return fallback;
}

export function calculateScoreTransition({
  isCorrect,
  timedOut = false,
  currentScore = 0,
  clueValue,
  rules = SCORE_RULES,
} = {}) {
  const previousScore = Number.isFinite(Number(currentScore))
    ? Math.max(0, Number(currentScore))
    : 0;
  const resolvedClueValue = parseClueValue(clueValue, rules.defaultClueValue);
  const accepted = Boolean(isCorrect) && !timedOut;

  let newScore;
  if (accepted) {
    newScore = previousScore + resolvedClueValue;
  } else if (rules.incorrectScoreMode === 'subtract') {
    const candidate = previousScore - resolvedClueValue;
    newScore = rules.allowNegativeScore ? candidate : Math.max(0, candidate);
  } else {
    newScore = 0;
  }

  return {
    isCorrect: accepted,
    clueValue: resolvedClueValue,
    previousScore,
    newScore,
    scoreDelta: newScore - previousScore,
  };
}
