import { normalizeQuestionData } from '@/services/api/questionService.js';

describe('questionService normalization', () => {
  test('normalizes J-Archive style field names', () => {
    const question = normalizeQuestionData({
      category: 'HISTORY',
      air_date: '2004-12-31',
      question: 'A clue',
      value: '$1,200',
      answer: 'Copernicus',
      round: 'Jeopardy!',
      show_number: '4680'
    });

    expect(question.airdate).toBe('2004-12-31');
    expect(question.showNumber).toBe('4680');
    expect(question.value).toBe(1200);
    expect(question.id).toMatch(/^clue-/);
  });
});
