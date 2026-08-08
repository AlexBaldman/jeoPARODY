import AIConfig from './ai/config.js';

const CACHE_KEY = 'jeoparody_translation_cache_v1';
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const TARGET_LABELS = {
  'pt-BR': 'Brazilian Portuguese'
};

const PHRASE_MAP_PT_BR = [
  ['United States', 'Estados Unidos'],
  ['South Pacific', 'Pacífico Sul'],
  ['Department of Homeland Security', 'Departamento de Segurança Interna'],
  ['World War II', 'Segunda Guerra Mundial'],
  ['World War I', 'Primeira Guerra Mundial'],
  ['New York City', 'Cidade de Nova York'],
  ['Great Britain', 'Grã-Bretanha'],
  ['Latin America', 'América Latina'],
  ['prime minister', 'primeiro-ministro'],
  ['president', 'presidente'],
  ['capital city', 'capital'],
  ['official language', 'língua oficial'],
  ['official languages', 'línguas oficiais'],
  ['Actors & Actresses', 'Atores e Atrizes'],
  ['Actors and Actresses', 'Atores e Atrizes'],
  ['not only', 'não apenas'],
  ['feature film', 'longa-metragem'],
  ['native language', 'língua nativa'],
  ['3-letter verbs', 'verbos de 3 letras'],
  ['playing card', 'carta de baralho'],
  ['can also mean', 'também pode significar'],
  ['easily pass', 'passar facilmente em'],
  ['theme song', 'música-tema'],
  ['catch-phrase', 'bordão'],
  ['catchphrase', 'bordão'],
  ['TV show', 'programa de TV'],
  ['book', 'livro'],
  ['novel', 'romance'],
  ['poet', 'poeta'],
  ['author', 'autor'],
  ['actress', 'atriz'],
  ['actor', 'ator'],
  ['movie', 'filme'],
  ['film', 'filme'],
  ['song', 'canção'],
  ['river', 'rio'],
  ['mountain', 'montanha'],
  ['island', 'ilha'],
  ['country', 'país'],
  ['city', 'cidade'],
  ['state', 'estado'],
  ['woman', 'mulher'],
  ['man', 'homem'],
  ['American', 'americano'],
  ['Canadian', 'canadense']
];

const WORD_MAP_PT_BR = {
  this: 'isto',
  these: 'estes',
  those: 'aqueles',
  that: 'aquilo',
  who: 'quem',
  what: 'o que',
  where: 'onde',
  when: 'quando',
  why: 'por que',
  which: 'qual',
  had: 'tinha',
  has: 'tem',
  have: 'têm',
  was: 'foi',
  were: 'foram',
  is: 'é',
  are: 'são',
  includes: 'inclui',
  include: 'incluem',
  called: 'chamado',
  represents: 'representa',
  became: 'tornou-se',
  born: 'nascido',
  wrote: 'escreveu',
  named: 'chamado',
  known: 'conhecido',
  first: 'primeiro',
  last: 'último',
  largest: 'maior',
  smallest: 'menor',
  famous: 'famoso',
  ancient: 'antigo',
  modern: 'moderno',
  but: 'mas',
  her: 'dela',
  his: 'dele',
  not: 'não',
  only: 'apenas',
  three: 'três',
  two: 'dois',
  one: 'um',
  and: 'e',
  or: 'ou',
  for: 'para',
  with: 'com',
  from: 'de',
  on: 'em',
  in: 'em',
  of: 'de',
  the: 'o',
  a: 'um',
  an: 'um'
};

function storageAvailable() {
  return typeof localStorage !== 'undefined';
}

function readCache() {
  if (!storageAvailable()) return {};
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  } catch (_) {
    return {};
  }
}

function writeCache(cache) {
  if (!storageAvailable()) return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (_) {
    // Translation cache is an optimization, not a runtime dependency.
  }
}

function hashText(value) {
  const text = String(value || '');
  let hash = 5381;
  for (let i = 0; i < text.length; i += 1) {
    hash = ((hash << 5) + hash) ^ text.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function splitStudyLines(text = '') {
  const lines = String(text)
    .split(/(?<=[.!?])\s+|\s+(?=;)/)
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.length ? lines : [String(text)];
}

function translateTriviaTextFallback(value = '', lang = 'pt-BR') {
  if (lang !== 'pt-BR') return String(value || '');

  let translated = String(value || '');
  PHRASE_MAP_PT_BR.forEach(([english, portuguese]) => {
    translated = translated.replace(new RegExp(`\\b${escapeRegExp(english)}\\b`, 'gi'), portuguese);
  });

  translated = translated.replace(/\b[A-Za-z][A-Za-z'-]*\b/g, (word) => {
    const lower = word.toLowerCase();
    return WORD_MAP_PT_BR[lower] || word;
  });

  return translated
    .replace(/\bHere we go\b/gi, 'Vamos lá')
    .replace(/\bclue\b/gi, 'pista')
    .replace(/\s+/g, ' ')
    .trim();
}

function makeCacheKey(question, lang) {
  const stableId = question?.id || question?.showNumber || question?.airdate || 'ad-hoc';
  const basis = [
    stableId,
    question?.category || '',
    question?.question || '',
    question?.answer || '',
    question?.value || ''
  ].join('|');
  return `${lang}:${stableId}:${hashText(basis)}`;
}

function shouldUseAITranslation() {
  if (AIConfig.featureFlags.studyMode) return true;
  if (!storageAvailable()) return false;
  return localStorage.getItem('jeoparody_ai_translation') === '1';
}

function parseProviderJSON(raw) {
  if (!raw) return null;
  const text = String(raw).trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    if (!parsed || typeof parsed !== 'object') return null;
    if (!Array.isArray(parsed.lines)) return null;
    return parsed;
  } catch (_) {
    return null;
  }
}

function normalizeLines(translatedText, sourceText, providerLines = null) {
  if (Array.isArray(providerLines) && providerLines.length) {
    return providerLines
      .map((line) => ({
        text: String(line.text || line.translation || '').trim(),
        source: String(line.source || line.english || '').trim()
      }))
      .filter((line) => line.text)
      .map((line) => ({ ...line, source: line.source || sourceText }));
  }

  const translatedLines = splitStudyLines(translatedText);
  const sourceLines = splitStudyLines(sourceText);
  return translatedLines.map((line, index) => ({
    text: line,
    source: sourceLines[index] || sourceText
  }));
}

function fallbackModel(question, lang) {
  if (lang === 'en') {
    return {
      lang,
      source: 'original',
      category: question?.category || '',
      question: question?.question || '',
      lines: normalizeLines(question?.question || '', question?.question || '')
    };
  }

  const translatedQuestion = translateTriviaTextFallback(question?.question || '', lang);
  const translatedCategory = translateTriviaTextFallback(question?.category || '', lang);

  return {
    lang,
    source: 'local-fallback',
    category: lang === 'pt-BR' ? translatedCategory.toLocaleUpperCase('pt-BR') : translatedCategory,
    question: translatedQuestion,
    lines: normalizeLines(translatedQuestion, question?.question || '')
  };
}

async function translateWithProvider(question, lang) {
  if (!shouldUseAITranslation()) return null;

  const target = TARGET_LABELS[lang] || lang;
  const prompt = [
    `Translate this trivia clue into ${target} for language learners.`,
    'Preserve named entities, numbers, dates, titles, quoted text, and answer semantics.',
    'Return only valid JSON with shape:',
    '{"category":"...","question":"...","lines":[{"text":"translated line","source":"original English line"}]}',
    `Category: ${question?.category || ''}`,
    `Clue: ${question?.question || ''}`
  ].join('\n');

  try {
    const { aiService } = await import('./ai.js');
    const raw = await aiService.generate(prompt, {
      temperature: 0.15,
      maxTokens: 260,
      seed: AIConfig.seed
    });
    const parsed = parseProviderJSON(raw);
    if (!parsed) return null;

    const questionText = String(parsed.question || '').trim();
    if (!questionText) return null;

    return {
      lang,
      source: 'ai-provider',
      category: String(parsed.category || question?.category || '').trim(),
      question: questionText,
      lines: normalizeLines(questionText, question?.question || '', parsed.lines)
    };
  } catch (error) {
    console.warn('[TranslationService] AI translation failed; using local fallback.', error);
    return null;
  }
}

class TranslationService {
  constructor() {
    this.cache = readCache();
  }

  getCached(key) {
    const entry = this.cache[key];
    if (!entry) return null;
    if (Date.now() - entry.ts > CACHE_TTL_MS) {
      delete this.cache[key];
      writeCache(this.cache);
      return null;
    }
    return entry.model;
  }

  setCached(key, model) {
    this.cache[key] = { model, ts: Date.now() };
    writeCache(this.cache);
  }

  clearCache() {
    this.cache = {};
    writeCache(this.cache);
  }

  async translateQuestion(question, lang = 'en') {
    if (!question || lang === 'en') return fallbackModel(question, 'en');

    const key = makeCacheKey(question, lang);
    const cached = this.getCached(key);
    if (cached) return { ...cached, source: 'cache' };

    const providerModel = await translateWithProvider(question, lang);
    const model = providerModel || fallbackModel(question, lang);
    this.setCached(key, model);
    return model;
  }
}

export { TranslationService, translateTriviaTextFallback };
export const translationService = new TranslationService();
export default translationService;
