import { eventBus } from '@/utils/events.js';
import { installQuestionRewrite } from '@/services/ai/rewriteIntegration.js';
import { rewriteWithPolicy } from '@/services/ai/rewrite.js';

jest.mock('@/services/ai/rewrite.js', () => ({ rewriteWithPolicy: jest.fn() }));
jest.mock('@/services/ai-providers.js', () => ({ __esModule: true, default: {} }));
jest.mock('@/services/ai/config.js', () => ({ __esModule: true, default: { featureFlags: {} } }));

test('delayed display rewrites cannot replace a newer clue or reset screen', async () => {
  document.body.innerHTML = '<div id="questionBox">Current</div>';
  const completions = [];
  rewriteWithPolicy.mockImplementation(() => new Promise(resolve => completions.push(resolve)));
  const old = { question: 'Old' }, current = { question: 'Current' };
  let active = old;
  const unsubscribe = installQuestionRewrite({ isCurrent: question => question === active });
  try {
    eventBus.emit('question:loaded', { question: old });
    active = current;
    eventBus.emit('question:loaded', { question: current });
    completions[1]({ text: 'Current rewrite' }); await Promise.resolve();
    completions[0]({ text: 'Stale rewrite' }); await Promise.resolve();
    expect(document.getElementById('questionBox').textContent).toBe('Current rewrite');
    eventBus.emit('question:loaded', { question: current });
    active = null;
    document.getElementById('questionBox').textContent = 'Press Start';
    completions[2]({ text: 'Late after reset' }); await Promise.resolve();
    expect(document.getElementById('questionBox').textContent).toBe('Press Start');
  } finally { unsubscribe(); }
});
