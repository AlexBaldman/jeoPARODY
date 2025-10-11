/**
 * Text Formatting Utilities
 * 
 * Cleans and formats question/answer text from various sources.
 * Removes HTML tags, fixes encoding issues, handles line breaks, etc.
 * 
 * Used across all game modes for consistent text display.
 * 
 * @module utils/textFormatting
 */

/**
 * Clean and format question text
 * Removes ugly characters, fixes quotes, adds proper line wrapping
 * 
 * @param {string} rawText - Raw question text from API
 * @returns {string} Cleaned and formatted text
 * 
 * @example
 * const raw = 'This &quot;king&quot; ruled\\nEngland';
 * const clean = formatQuestionText(raw);
 * // => 'This "king" ruled England'
 */
export function formatQuestionText(rawText) {
  if (!rawText) return '';
  
  return rawText
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    
    // Fix HTML entities
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    
    // Fix line breaks - replace with space
    .replace(/\n\s*\n/g, ' ')      // Multiple line breaks
    .replace(/\\n/g, ' ')           // Escaped line breaks
    .replace(/\n/g, ' ')            // Single line breaks
    .replace(/<br\s*\/?>/gi, ' ')  // HTML line breaks
    
    // Fix escaped characters
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\\\/g, '\\')
    
    // Remove parenthetical notes often found in Jeopardy questions
    // e.g., "(read carefully)" or "(1 of 2)"
    // .replace(/\([^)]*\)/g, '')  // Optional: uncomment to remove all parentheticals
    
    // Fix common typos/issues
    .replace(/\s+([.,!?;:])/g, '$1')  // Remove space before punctuation
    .replace(/([.,!?;:])\s*([.,!?;:])/g, '$1')  // Remove double punctuation
    
    // Normalize whitespace
    .replace(/\s+/g, ' ')           // Multiple spaces to single space
    .replace(/\s+$/gm, '')          // Trailing whitespace
    .trim();
}

/**
 * Format answer text (same cleanup as questions)
 * Also standardizes "What is" format
 * 
 * @param {string} rawText - Raw answer text
 * @returns {string} Cleaned and formatted answer
 * 
 * @example
 * const raw = 'what is the berlin wall';
 * const clean = formatAnswerText(raw);
 * // => 'What is the Berlin Wall'
 */
export function formatAnswerText(rawText) {
  if (!rawText) return '';
  
  let cleaned = formatQuestionText(rawText);
  
  // Standardize "What is/Who is/Where is" format
  cleaned = cleaned.replace(/^(what is|who is|where is|when is|what are|who are)/i, (match) => 
    match.charAt(0).toUpperCase() + match.slice(1).toLowerCase()
  );
  
  // Capitalize first letter if not already a question format
  if (!/^(What|Who|Where|When)/i.test(cleaned)) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  
  return cleaned;
}

/**
 * Format category name
 * Uppercase and clean
 * 
 * @param {string} rawText - Raw category text
 * @returns {string} Formatted category
 * 
 * @example
 * const raw = 'world history';
 * const clean = formatCategoryText(raw);
 * // => 'WORLD HISTORY'
 */
export function formatCategoryText(rawText) {
  if (!rawText) return '';
  
  return formatQuestionText(rawText)
    .toUpperCase()
    .trim();
}

/**
 * Truncate text to a maximum length with ellipsis
 * 
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 * 
 * @example
 * const text = 'This is a very long question that needs truncating';
 * const short = truncateText(text, 30);
 * // => 'This is a very long questi...'
 */
export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Remove parenthetical notes from text
 * Often used in Jeopardy questions for meta-information
 * 
 * @param {string} text - Text with parentheticals
 * @returns {string} Text without parentheticals
 * 
 * @example
 * const text = 'This king (read carefully) ruled England';
 * const clean = removeParentheticals(text);
 * // => 'This king ruled England'
 */
export function removeParentheticals(text) {
  if (!text) return '';
  
  return text
    .replace(/\s*\([^)]*\)\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Highlight search terms in text
 * Wraps matching terms in <mark> tags
 * 
 * @param {string} text - Text to search
 * @param {string} searchTerm - Term to highlight
 * @returns {string} HTML with highlighted terms
 * 
 * @example
 * const text = 'The Berlin Wall fell in 1989';
 * const highlighted = highlightText(text, 'Berlin');
 * // => 'The <mark>Berlin</mark> Wall fell in 1989'
 */
export function highlightText(text, searchTerm) {
  if (!text || !searchTerm) return text;
  
  const regex = new RegExp(`(${escapeRegex(searchTerm)})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

/**
 * Escape special regex characters
 * Helper for highlightText
 * 
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 * @private
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Sanitize text for display
 * Prevents XSS by escaping HTML
 * 
 * @param {string} text - Text to sanitize
 * @returns {string} Safe text
 * 
 * @example
 * const unsafe = '<script>alert("xss")</script>';
 * const safe = sanitizeText(unsafe);
 * // => '&lt;script&gt;alert("xss")&lt;/script&gt;'
 */
export function sanitizeText(text) {
  if (!text) return '';
  
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Add smart quotes to text
 * Converts straight quotes to curly quotes
 * 
 * @param {string} text - Text with straight quotes
 * @returns {string} Text with curly quotes
 * 
 * @example
 * const text = 'He said "hello" to me';
 * const smart = addSmartQuotes(text);
 * // Returns text with curly quotes
 */
export function addSmartQuotes(text) {
  if (!text) return '';
  
  return text
    // Opening double quotes
    .replace(/(^|[-\u2014\s(\["])"/g, '$1\u201C')
    // Closing double quotes
    .replace(/"/g, '\u201D')
    // Opening single quotes
    .replace(/(^|[-\u2014/\[(\u2018\s])'/g, '$1\u2018')
    // Closing single quotes & apostrophes
    .replace(/'/g, '\u2019');
}

/**
 * Word wrap text to fit within a maximum line length
 * Preserves words and doesn't break mid-word
 * 
 * @param {string} text - Text to wrap
 * @param {number} maxLength - Maximum line length
 * @returns {string} Wrapped text with line breaks
 * 
 * @example
 * const text = 'This is a very long sentence that needs wrapping';
 * const wrapped = wordWrap(text, 20);
 * // => 'This is a very long\nsentence that needs\nwrapping'
 */
export function wordWrap(text, maxLength = 80) {
  if (!text || text.length <= maxLength) return text;
  
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';
  
  for (const word of words) {
    if ((currentLine + word).length > maxLength) {
      if (currentLine) {
        lines.push(currentLine.trim());
        currentLine = word + ' ';
      } else {
        // Word is longer than maxLength, just add it
        lines.push(word);
      }
    } else {
      currentLine += word + ' ';
    }
  }
  
  if (currentLine) {
    lines.push(currentLine.trim());
  }
  
  return lines.join('\n');
}

/**
 * Count words in text
 * 
 * @param {string} text - Text to count
 * @returns {number} Word count
 * 
 * @example
 * const text = 'This is a test';
 * const count = countWords(text);
 * // => 4
 */
export function countWords(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).length;
}

/**
 * Estimate reading time in seconds
 * Based on average reading speed of 200 words per minute
 * 
 * @param {string} text - Text to estimate
 * @returns {number} Estimated seconds
 * 
 * @example
 * const text = 'This is a test question with several words';
 * const seconds = estimateReadingTime(text);
 * // => ~2 seconds
 */
export function estimateReadingTime(text) {
  const words = countWords(text);
  const wordsPerMinute = 200;
  const minutes = words / wordsPerMinute;
  return Math.ceil(minutes * 60);
}

/**
 * Format dollar amount
 * Adds commas and dollar sign
 * 
 * @param {number} amount - Dollar amount
 * @returns {string} Formatted amount
 * 
 * @example
 * const formatted = formatDollarAmount(1000);
 * // => '$1,000'
 */
export function formatDollarAmount(amount) {
  return `$${amount.toLocaleString('en-US')}`;
}

/**
 * Parse Jeopardy answer format
 * Extracts the core answer from "What is X" format
 * 
 * @param {string} answer - Full answer text
 * @returns {string} Core answer
 * 
 * @example
 * const answer = 'What is the Berlin Wall?';
 * const core = parseAnswerCore(answer);
 * // => 'the Berlin Wall'
 */
export function parseAnswerCore(answer) {
  if (!answer) return '';
  
  // Remove question format
  const cleaned = answer
    .replace(/^(What is|Who is|Where is|When is|What are|Who are)\s+/i, '')
    .replace(/[?!.]*$/, '')
    .trim();
  
  return cleaned;
}

/**
 * Check if two answers are similar enough to be considered correct
 * Case-insensitive, ignores articles (a, an, the)
 * 
 * @param {string} userAnswer - User's answer
 * @param {string} correctAnswer - Correct answer
 * @returns {boolean} True if similar enough
 * 
 * @example
 * const similar = areAnswersSimilar('Berlin Wall', 'The Berlin Wall');
 * // => true
 */
export function areAnswersSimilar(userAnswer, correctAnswer) {
  if (!userAnswer || !correctAnswer) return false;
  
  // Normalize both answers
  const normalize = (str) => str
    .toLowerCase()
    .replace(/^(a|an|the)\s+/i, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  const user = normalize(userAnswer);
  const correct = normalize(correctAnswer);
  
  // Exact match
  if (user === correct) return true;
  
  // Check if one contains the other (with buffer)
  if (user.length >= correct.length * 0.7 && correct.includes(user)) return true;
  if (correct.length >= user.length * 0.7 && user.includes(correct)) return true;
  
  return false;
}

// Export all functions as default object for convenience
export default {
  formatQuestionText,
  formatAnswerText,
  formatCategoryText,
  truncateText,
  removeParentheticals,
  highlightText,
  sanitizeText,
  addSmartQuotes,
  wordWrap,
  countWords,
  estimateReadingTime,
  formatDollarAmount,
  parseAnswerCore,
  areAnswersSimilar
};
