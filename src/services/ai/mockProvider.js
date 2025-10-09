/**
 * Simple mock AI provider for development and tests.
 */
class MockProvider {
  constructor() {
    this.isInitialized = false;
  }
  enable() {
    this.isInitialized = true;
    console.log('🧪 Mock AI provider enabled');
  }
  disable() {
    this.isInitialized = false;
  }
  async generate(prompt) {
    if (!this.isInitialized) return null;
    const preview = String(prompt).replace(/\s+/g, ' ').slice(0, 80);
    return `[mock-ai] ${preview}...`;
  }
}

export const mock = new MockProvider();

