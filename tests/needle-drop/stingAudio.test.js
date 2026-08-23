import { StingAudio } from '../../src/modes/needle-drop/services/stingAudio.js';

function createAudioHarness() {
  const oscillators = [];
  const context = {
    state: 'running',
    currentTime: 10,
    destination: {},
    createOscillator: jest.fn(() => {
      const oscillator = {
        type: 'sine',
        frequency: { setValueAtTime: jest.fn() },
        connect: jest.fn(node => node),
        start: jest.fn(),
        stop: jest.fn(),
        onended: null,
      };
      oscillators.push(oscillator);
      return oscillator;
    }),
    createGain: jest.fn(() => ({
      gain: {
        setValueAtTime: jest.fn(),
        exponentialRampToValueAtTime: jest.fn(),
      },
      connect: jest.fn(node => node),
    })),
  };
  return { context, oscillators };
}

describe('Needle Drop procedural sting audio', () => {
  test('plays known cues and cancels active nodes when muted', async () => {
    const { context, oscillators } = createAudioHarness();
    const audio = new StingAudio({ contextFactory: () => context, enabled: true });
    await expect(audio.play('correct')).resolves.toBe(true);
    expect(context.createOscillator).toHaveBeenCalledTimes(3);
    audio.setEnabled(false);
    expect(oscillators.every(oscillator => oscillator.stop.mock.calls.length > 0)).toBe(true);
    await expect(audio.play('correct')).resolves.toBe(false);
  });

  test('fails silently when Web Audio is unavailable', async () => {
    const audio = new StingAudio({ contextFactory: () => { throw new Error('no speakers'); } });
    await expect(audio.play('winner')).resolves.toBe(false);
  });
});
