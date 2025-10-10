/**
 * AI Providers Registry
 *
 * This file imports all available AI providers and exports them as a single object.
 */

import { gemini } from './ai/gemini.js';
import { claude } from './ai/claude.js';
import { fallback } from './ai/fallback.js';
import { local } from './ai/local.js';

export default {
    gemini,
    claude,
    fallback,
    local,
};