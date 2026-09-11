import { createQuestionLoader } from '@/services/createQuestionLoader.js';

const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};

test('newest request wins even when earlier fetch completes last', async () => {
  const first = deferred(), second = deferred();
  const engine = { beginQuestionLoad: jest.fn(), loadQuestion: jest.fn() };
  const loader = createQuestionLoader({ engine, getQuestion: jest.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise), onError: jest.fn() });
  const a = loader.load(), b = loader.load();
  second.resolve({ id: 'current' }); await b;
  first.resolve({ id: 'stale' }); await a;
  expect(engine.loadQuestion.mock.calls).toEqual([[{ id: 'current' }]]);
});

test('reset cancels an outstanding fetch and stale errors cannot overwrite a newer clue', async () => {
  const first = deferred(), second = deferred();
  const engine = { beginQuestionLoad: jest.fn(), loadQuestion: jest.fn() };
  const onError = jest.fn();
  const loader = createQuestionLoader({ engine, getQuestion: jest.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise), onError });
  const a = loader.load(); loader.cancel();
  first.resolve({ id: 'canceled' }); await a;
  const b = loader.load(); loader.cancel();
  second.reject(new Error('old failure')); await b;
  expect(engine.loadQuestion).not.toHaveBeenCalled();
  expect(onError).not.toHaveBeenCalled();
});
