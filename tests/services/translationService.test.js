import {
  splitStudyLines,
  TranslationService,
  translateTriviaTextFallback
} from '@/services/TranslationService.js';

describe('TranslationService', () => {
  const question = {
    id: 'clue-test-1',
    category: 'Actors & Actresses',
    question: '"Autumn Sonata" was not only this actress\' last feature film but her last film in her native language, Swedish.',
    answer: 'Ingrid Bergman',
    value: 2000
  };

  beforeEach(() => {
    localStorage.clear();
  });

  test('returns exact source text for English mode', async () => {
    const service = new TranslationService();
    const model = await service.translateQuestion(question, 'en');

    expect(model.source).toBe('original');
    expect(model.category).toBe(question.category);
    expect(model.question).toBe(question.question);
    expect(model.lines).toEqual([
      {
        text: question.question,
        source: question.question
      }
    ]);
  });

  test('creates Portuguese study lines with English hover sources', async () => {
    const service = new TranslationService();
    const model = await service.translateQuestion(question, 'pt-BR');

    expect(model.source).toBe('local-fallback');
    expect(model.category).toBe('ATORES E ATRIZES');
    expect(model.question).toContain('não apenas');
    expect(model.question).toContain('atriz');
    expect(model.lines[0]).toEqual(
      expect.objectContaining({
        source: question.question
      })
    );
  });

  test('reuses cached Portuguese translations by clue fingerprint', async () => {
    const service = new TranslationService();

    const first = await service.translateQuestion(question, 'pt-BR');
    const second = await service.translateQuestion(question, 'pt-BR');

    expect(first.source).toBe('local-fallback');
    expect(second.source).toBe('cache');
    expect(second.question).toBe(first.question);
  });

  test('fallback phrase map handles common clue language', () => {
    expect(translateTriviaTextFallback('A playing card can also mean to easily pass a test.', 'pt-BR'))
      .toContain('carta de baralho');
    expect(translateTriviaTextFallback('A playing card can also mean to easily pass a test.', 'pt-BR'))
      .toContain('também pode significar');
  });

  test('splits study lines without losing single-sentence clues', () => {
    expect(splitStudyLines('One sentence only')).toEqual(['One sentence only']);
    expect(splitStudyLines('First clue. Second clue?')).toEqual(['First clue.', 'Second clue?']);
  });
});
