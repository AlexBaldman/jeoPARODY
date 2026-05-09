/**
 * Input Validators
 * 
 * Carmack's principle: "Validate early, validate often.
 * Never trust external input."
 */

import { RULES } from './constants.js';
import { stringSimilarity } from './helpers.js';

/**
 * Validate answer input
 * @param {string} answer - Answer to validate
 * @returns {{valid: boolean, error?: string}} Validation result
 */
export function validateAnswer(answer) {
  if (!answer || answer.trim().length === 0) {
    return { valid: false, error: 'Answer cannot be empty' };
  }
  
  if (answer.length > RULES.MAX_ANSWER_LENGTH) {
    return { valid: false, error: `Answer must be ${RULES.MAX_ANSWER_LENGTH} characters or less` };
  }
  
  // Check for potentially harmful input
  if (containsScriptTags(answer)) {
    return { valid: false, error: 'Invalid characters in answer' };
  }
  
  return { valid: true };
}

/**
 * Normalize answer for comparison
 * @param {string} answer - Answer to normalize
 * @returns {string} Normalized answer
 */
export function normalizeAnswer(answer) {
  return String(answer || '')
    .toLowerCase()
    .trim()
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    // Jeopardy-style responses commonly include the prompt form.
    .replace(/^(what|who|where|when)\s+(is|are|was|were)\s+/i, '')
    .replace(/^(or|aka|also known as)\s+/i, '')
    // Remove articles
    .replace(/^(a|an|the)\s+/i, '')
    // Remove punctuation
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalize answer for strict comparison.
 * @param {string} answer - Answer to normalize
 * @returns {string} Compact normalized answer
 */
export function cleanAnswer(answer) {
  return normalizeAnswer(answer)
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Extract acceptable answer variants from parentheticals and explicit alternates.
 * @param {string} answer - Raw correct answer
 * @returns {string[]} Compact accepted answers
 */
export function getAcceptedAnswers(answer) {
  return getAcceptedAnswerCandidates(answer).map((candidate) => candidate.compact);
}

function getAcceptedAnswerCandidates(answer) {
  const raw = String(answer || '');
  const parentheticals = Array.from(raw.matchAll(/\(([^)]+)\)/g), (match) => match[1]);
  const withoutParentheticals = raw.replace(/\([^)]*\)/g, ' ');
  const candidates = [raw, withoutParentheticals, ...parentheticals];
  const splitPattern = /\s+(?:or|aka|also known as)\s+|[;/|]/i;

  for (const part of raw.split(splitPattern)) {
    candidates.push(part);
  }

  for (const part of parentheticals.flatMap((text) => text.split(splitPattern))) {
    candidates.push(part);
  }

  const seen = new Set();
  const accepted = [];
  for (const candidate of candidates) {
    const compact = cleanAnswer(candidate);
    if (!compact || seen.has(compact)) continue;

    seen.add(compact);
    accepted.push({
      raw: candidate,
      normalized: normalizeAnswer(candidate),
      compact
    });
  }

  return accepted;
}

/**
 * Calculate Levenshtein edit distance.
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {number} Edit distance
 */
export function getLevenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = Array.from({ length: b.length + 1 }, () => []);

  for (let i = 0; i <= b.length; i += 1) matrix[i][0] = i;
  for (let j = 0; j <= a.length; j += 1) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i += 1) {
    for (let j = 1; j <= a.length; j += 1) {
      const cost = b[i - 1] === a[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Compare answers and return explainable match metadata.
 * @param {string} userAnswer - User's answer
 * @param {string} correctAnswer - Correct answer
 * @param {number} threshold - Similarity threshold fallback
 * @returns {Object} Detailed comparison result
 */
export function compareAnswersDetailed(userAnswer, correctAnswer, threshold = RULES.FUZZY_MATCH_THRESHOLD) {
  const normalizedUserAnswer = normalizeAnswer(userAnswer);
  const userCompact = cleanAnswer(userAnswer);
  const acceptedCandidates = getAcceptedAnswerCandidates(correctAnswer);
  const acceptedAnswers = acceptedCandidates.map((candidate) => candidate.compact);
  const normalizedCorrectAnswer = acceptedAnswers[0] || cleanAnswer(correctAnswer);

  if (!userCompact || !normalizedCorrectAnswer) {
    return {
      isCorrect: false,
      reason: 'empty',
      normalizedUserAnswer: userCompact,
      normalizedCorrectAnswer,
      acceptedAnswers,
      distance: null,
      threshold: null,
      confidence: 0
    };
  }

  for (const acceptedAnswer of acceptedAnswers) {
    if (userCompact === acceptedAnswer) {
      return {
        isCorrect: true,
        reason: 'exact',
        normalizedUserAnswer: userCompact,
        normalizedCorrectAnswer: acceptedAnswer,
        acceptedAnswers,
        distance: 0,
        threshold: 0,
        confidence: 1
      };
    }
  }

  for (const candidate of acceptedCandidates) {
    if (checkCommonVariations(normalizedUserAnswer, candidate.normalized)) {
      return {
        isCorrect: true,
        reason: 'variation',
        normalizedUserAnswer: userCompact,
        normalizedCorrectAnswer: candidate.compact,
        acceptedAnswers,
        distance: 0,
        threshold: 0,
        confidence: 1
      };
    }
  }

  let bestMatch = {
    answer: normalizedCorrectAnswer,
    distance: getLevenshteinDistance(userCompact, normalizedCorrectAnswer),
    threshold: Math.min(3, Math.floor(normalizedCorrectAnswer.length / 2))
  };

  for (const acceptedAnswer of acceptedAnswers.slice(1)) {
    const distance = getLevenshteinDistance(userCompact, acceptedAnswer);
    const matchThreshold = Math.min(3, Math.floor(acceptedAnswer.length / 2));

    if (distance < bestMatch.distance) {
      bestMatch = {
        answer: acceptedAnswer,
        distance,
        threshold: matchThreshold
      };
    }
  }

  if (bestMatch.distance <= bestMatch.threshold) {
    return {
      isCorrect: true,
      reason: 'fuzzy',
      normalizedUserAnswer: userCompact,
      normalizedCorrectAnswer: bestMatch.answer,
      acceptedAnswers,
      distance: bestMatch.distance,
      threshold: bestMatch.threshold,
      confidence: Math.max(0, 1 - bestMatch.distance / Math.max(userCompact.length, bestMatch.answer.length))
    };
  }

  const similarity = stringSimilarity(userCompact, bestMatch.answer);
  return {
    isCorrect: similarity >= threshold,
    reason: similarity >= threshold ? 'similarity' : 'mismatch',
    normalizedUserAnswer: userCompact,
    normalizedCorrectAnswer: bestMatch.answer,
    acceptedAnswers,
    distance: bestMatch.distance,
    threshold: bestMatch.threshold,
    confidence: similarity
  };
}

/**
 * Check if user answer matches correct answer
 * @param {string} userAnswer - User's answer
 * @param {string} correctAnswer - Correct answer
 * @param {number} threshold - Similarity threshold (0-1)
 * @returns {boolean} Whether answers match
 */
export function checkAnswer(userAnswer, correctAnswer, threshold = RULES.FUZZY_MATCH_THRESHOLD) {
  return compareAnswersDetailed(userAnswer, correctAnswer, threshold).isCorrect;
}

/**
 * Check for common answer variations
 * @param {string} userAnswer - Normalized user answer
 * @param {string} correctAnswer - Normalized correct answer
 * @returns {boolean} Whether variation matches
 */
function checkCommonVariations(userAnswer, correctAnswer) {
  // Handle numeric answers
  if (isNumericAnswer(correctAnswer)) {
    return checkNumericVariations(userAnswer, correctAnswer);
  }
  
  // Handle abbreviations
  if (checkAbbreviations(userAnswer, correctAnswer)) {
    return true;
  }
  
  // Handle plurals
  if (checkPlurals(userAnswer, correctAnswer)) {
    return true;
  }
  
  return false;
}

/**
 * Check if answer is numeric
 * @param {string} answer - Answer to check
 * @returns {boolean} Whether answer is numeric
 */
function isNumericAnswer(answer) {
  return /^\d+$/.test(answer.replace(/[,\s]/g, ''));
}

/**
 * Check numeric answer variations
 * @param {string} userAnswer - User's answer
 * @param {string} correctAnswer - Correct answer
 * @returns {boolean} Whether numeric answers match
 */
function checkNumericVariations(userAnswer, correctAnswer) {
  const userNum = parseFloat(userAnswer.replace(/[,\s]/g, ''));
  const correctNum = parseFloat(correctAnswer.replace(/[,\s]/g, ''));
  
  return !isNaN(userNum) && !isNaN(correctNum) && userNum === correctNum;
}

/**
 * Check for abbreviation matches
 * @param {string} userAnswer - User's answer
 * @param {string} correctAnswer - Correct answer
 * @returns {boolean} Whether abbreviation matches
 */
function checkAbbreviations(userAnswer, correctAnswer) {
  const commonAbbreviations = {
    'united states': ['us', 'usa'],
    'united kingdom': ['uk', 'britain'],
    'doctor': ['dr'],
    'mister': ['mr'],
    'missus': ['mrs'],
    'miss': ['ms'],
    'saint': ['st'],
    'mount': ['mt'],
    'number': ['no', '#']
  };
  
  for (const [full, abbrevs] of Object.entries(commonAbbreviations)) {
    if (correctAnswer.includes(full) && abbrevs.some(abbr => userAnswer.includes(abbr))) {
      return true;
    }
    if (abbrevs.some(abbr => correctAnswer.includes(abbr)) && userAnswer.includes(full)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Check for plural variations
 * @param {string} userAnswer - User's answer
 * @param {string} correctAnswer - Correct answer
 * @returns {boolean} Whether plural variation matches
 */
function checkPlurals(userAnswer, correctAnswer) {
  // Simple plural check
  if (userAnswer + 's' === correctAnswer || userAnswer === correctAnswer + 's') {
    return true;
  }
  
  // Check for 'es' plurals
  if (userAnswer + 'es' === correctAnswer || userAnswer === correctAnswer + 'es') {
    return true;
  }
  
  // Check for 'ies' plurals (city/cities)
  if (userAnswer.endsWith('y') && correctAnswer === userAnswer.slice(0, -1) + 'ies') {
    return true;
  }
  if (correctAnswer.endsWith('y') && userAnswer === correctAnswer.slice(0, -1) + 'ies') {
    return true;
  }
  
  return false;
}

/**
 * Check for potentially harmful script tags
 * @param {string} input - Input to check
 * @returns {boolean} Whether input contains script tags
 */
function containsScriptTags(input) {
  const scriptPattern = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
  return scriptPattern.test(input);
}

/**
 * Validate question data from API
 * @param {Object} question - Question object
 * @returns {{valid: boolean, error?: string}} Validation result
 */
export function validateQuestion(question) {
  if (!question || typeof question !== 'object') {
    return { valid: false, error: 'Invalid question format' };
  }
  
  if (!question.question || typeof question.question !== 'string') {
    return { valid: false, error: 'Question text is missing' };
  }
  
  if (!question.answer || typeof question.answer !== 'string') {
    return { valid: false, error: 'Answer is missing' };
  }
  
  if (question.question.length > RULES.MAX_QUESTION_LENGTH) {
    return { valid: false, error: 'Question is too long' };
  }
  
  if (!question.value || typeof question.value !== 'number' || question.value < 0) {
    return { valid: false, error: 'Invalid question value' };
  }
  
  return { valid: true };
}
