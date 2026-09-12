// Owns cancellation of content requests only. All playable state stays in the engine.
export function createQuestionLoader({ engine, getQuestion, onError }) {
  let generation = 0;
  return {
    cancel() { generation += 1; },
    async load() {
      const request = ++generation;
      engine.beginQuestionLoad();
      try {
        const question = await getQuestion();
        if (request !== generation) return;
        engine.loadQuestion(question);
      } catch (error) {
        if (request === generation) onError(error);
      }
    },
  };
}
