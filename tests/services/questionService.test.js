import {
  normalizeQuestionData,
  parseCSV,
  parseTSV
} from '@/services/api/questionService.js';

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

  test('removes archive markup and wrapping quotes from playable clue text', () => {
    const question = normalizeQuestionData({
      category: 'ART',
      question: '\'<a href="https://example.com/media">This</a> painter created &quot;Guernica&quot;\'',
      answer: 'Picasso',
      value: '$400'
    });

    expect(question.question).toBe('This painter created "Guernica"');
  });

  test('uses clue_value for TSV imports without treating daily double wager as display value', () => {
    const question = normalizeQuestionData({
      category: 'MY ART IS FULL',
      clue_value: '1600',
      daily_double_value: '5800',
      question: 'In 1796 this artist may not have finished painting George Washington.',
      answer: 'Gilbert Stuart'
    });

    expect(question.value).toBe(1600);
    expect(question.dailyDoubleValue).toBe('5800');
  });

  test('preserves linked media metadata while keeping clue text readable', () => {
    const question = normalizeQuestionData({
      category: 'MEDIA CLUES',
      value: '$800',
      question: 'Study <a href="http://www.j-archive.com/media/2006-05-11_J_11.jpg" target="_blank">this portrait</a> and name the politician.',
      answer: 'Spiro Agnew'
    });

    expect(question.question).toBe('Study this portrait and name the politician.');
    expect(question.media).toEqual([
      {
        type: 'image',
        url: 'http://www.j-archive.com/media/2006-05-11_J_11.jpg',
        label: 'this portrait'
      }
    ]);
  });

  test('classifies archive audio and video media links', () => {
    const question = normalizeQuestionData({
      category: 'MIXED MEDIA',
      question: 'Listen to <a href="https://example.com/clue.mp3">this clip</a> then watch <a href="https://example.com/clue.wmv">the footage</a>.',
      answer: 'A thing',
      value: '$400'
    });

    expect(question.media.map((item) => item.type)).toEqual(['audio', 'video']);
    expect(question.media.map((item) => item.label)).toEqual(['this clip', 'the footage']);
  });

  test('parses TSV rows when required clue fields are present', () => {
    const rows = parseTSV('category\tanswer\tquestion\tclue_value\nHISTORY\tRome\tThis empire had a senate\t400');

    expect(rows).toEqual([
      {
        category: 'HISTORY',
        answer: 'Rome',
        question: 'This empire had a senate',
        clue_value: '400'
      }
    ]);
  });

  test('rejects HTML fallbacks before they can become fake clue rows', () => {
    expect(() => parseTSV('<!doctype html><div id="app"></div>')).toThrow(/HTML/i);
    expect(() => parseCSV('<html><body>no clues here</body></html>')).toThrow(/HTML/i);
  });

  test('rejects tabular sources missing playable question headers', () => {
    expect(() => parseTSV('category\tvalue\nHISTORY\t400')).toThrow(/question\/answer/i);
    expect(() => parseCSV('category,value\nHISTORY,400')).toThrow(/question\/answer/i);
  });
});
