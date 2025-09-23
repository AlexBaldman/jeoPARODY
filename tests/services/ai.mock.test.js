describe('AI Service mock provider toggle', () => {
  beforeEach(() => {
    // Ensure a clean module state and set the mock toggle
    localStorage.setItem('use_mock_ai', '1');
    jest.resetModules();
  });

  afterEach(() => {
    localStorage.removeItem('use_mock_ai');
  });

  test('uses mock provider when toggle is set', async () => {
    const { aiService } = await import('@/services/ai.js');
    const out = await aiService.generate('Hello from test');
    expect(out).toMatch(/^\[mock-ai\] /);
  });
});

