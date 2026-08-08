import { getGameEngine } from '../core/GameEngine.js';
import { soundManager } from '../services/soundManager.js';
import { getHostSystem } from '../services/HostSystem.js';
import { eventBus } from '../utils/events.js';
import { logger as console } from '../utils/logger.js';
import questionService from '../services/api/questionService.js';
import AIConfig from '../services/ai/config.js';
import installAIConsole from '../services/ai/ConsoleOverlay.js';
import installQuestionRewrite from '../services/ai/rewriteIntegration.js';

export async function initializeCoreServices(app) {
  console.info('[Services] Initializing core services...');

  app.gameEngine = getGameEngine();
  console.info('[Services] Game engine ready');

  try {
    await questionService.initialize();
    console.info('[Services] Question service ready');
  } catch (error) {
    console.error('[Services] Question service failed to initialize', error);
  }

  app.soundManager = soundManager;
  // Don't block initialization on audio - defer to first user interaction
  console.info('[Services] Audio system deferred (will initialize on first interaction)');

  app.hostSystem = getHostSystem();
  console.info('[Services] Host system ready');

  setupServiceIntegration(app);
  installAIConsole();
  installQuestionRewrite();
  console.info('[Services] AI features ready');
}

export function injectKeysFromURL() {
  try {
    const url = new URL(window.location.href);
    const ai = url.searchParams.get('ai');
    const geminiKey = url.searchParams.get('gemini_key') || url.searchParams.get('key');
    const claudeKey = url.searchParams.get('claude_key');
    const providerOrder = url.searchParams.get('provider_order');
    const personaId = url.searchParams.get('persona');
    const enableLocal = url.searchParams.get('local_model');

    let mutated = false;
    if (geminiKey) {
      localStorage.setItem('gemini_api_key', geminiKey);
      mutated = true;
    }
    if (claudeKey) {
      localStorage.setItem('claude_api_key', claudeKey);
      mutated = true;
    }
    if (providerOrder) {
      AIConfig.providerOrder = providerOrder.split(',');
      mutated = true;
    }
    if (personaId) {
      AIConfig.personaId = personaId;
      mutated = true;
    }
    if (enableLocal != null) {
      AIConfig.featureFlags = { useLocalModel: enableLocal === '1' || enableLocal === 'true' };
      mutated = true;
    }
    if (ai) mutated = true;

    if (mutated) {
      url.searchParams.delete('gemini_key');
      url.searchParams.delete('claude_key');
      url.searchParams.delete('key');
      url.searchParams.delete('provider_order');
      url.searchParams.delete('persona');
      url.searchParams.delete('local_model');
      url.searchParams.delete('ai');
      window.history.replaceState({}, document.title, url.toString());
    }
  } catch (_) {
    // URL key injection is a dev convenience. Ignore malformed URLs.
  }
}

function setupServiceIntegration(app) {
  eventBus.on('answer:evaluated', () => {
    app.hostSystem?.updateMood(app.gameEngine?.state?.stats);

    const { current, streak, high, maxStreak } = app.gameEngine?.state?.score || {};
    setText('score', current);
    setText('streak', streak);
    setText('top-score', high);
    setText('max-streak', maxStreak);
  });

  eventBus.on('ui:button-click', () => {
    app.soundManager?.play('click');
  });

  eventBus.on('question:show-answer', () => {
    const answerBox = document.getElementById('answerBox');
    const { question } = app.gameEngine?.state || {};
    if (answerBox && question?.data) {
      answerBox.innerHTML = question.data.answer;
      answerBox.classList.add('visible');
    }
  });

  eventBus.on('game:started', () => {
    document.getElementById('splash-screen')?.classList.remove('active');
  });
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el && value != null) el.textContent = String(value);
}
