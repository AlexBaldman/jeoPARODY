import { eventBus, GAME_EVENTS } from '../utils/events.js';
import { logger as console } from '../utils/logger.js';
import questionService from '../services/api/questionService.js';
import translationService from '../services/TranslationService.js';
import { applySavedThemeVariant, applyTheme, toggleLanguage, toggleTheme } from './preferences.js';

const PAO_SECRET_SEQUENCE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'p',
  'a',
  'o'
];

const LOGO_ORB_VARIANTS = [
  { glyph: '☺', label: 'silly smile' },
  { glyph: '◎', label: 'cosmic donut' },
  { glyph: '◉', label: 'all-seeing trivia pupil' },
  { glyph: '◌', label: 'loose metaphysical cheerio' },
  { glyph: '◍', label: 'department of circular affairs' },
  { glyph: '◑', label: 'half-lit night mode oracle' }
];

let currentLegacyQuestion = null;
let speechRenderToken = 0;

export function setupUIBindings(app) {
  console.log('[Debug] setupUIBindings() called');
  setupJeoparodyLogo();
  setupGameControls(app);
  setupMenuInteractions(app);
  setupKeyboardShortcuts(app);
  setupEventDrivenModals();
  setupRuntimeModals();
  setupNewUIModes();
  setupQuestionEventOrchestrator();
  setupScoreboardEffects();
  applySavedThemeVariant();
}

function setupJeoparodyLogo() {
  const orb = document.getElementById('logo-orb');
  const face = orb?.querySelector('.jeoparody-logo__orb-face');
  if (!orb || !face) return;

  let index = Number(localStorage.getItem('jeoparody_logo_orb') || 0);

  const render = () => {
    const variant = LOGO_ORB_VARIANTS[index % LOGO_ORB_VARIANTS.length];
    face.textContent = variant.glyph;
    orb.setAttribute('title', `Cycle logo O: ${variant.label}`);
    orb.setAttribute('data-orb', String(index % LOGO_ORB_VARIANTS.length));
    localStorage.setItem('jeoparody_logo_orb', String(index % LOGO_ORB_VARIANTS.length));
  };

  orb.addEventListener('click', () => {
    index += 1;
    render();
    eventBus.emit('ui:button-click');
  });

  render();
}

function getSecretKey(event) {
  if (event.key?.startsWith('Arrow')) return event.key;
  return event.key?.toLowerCase?.() || '';
}

async function openPaoMode(paoContainer) {
  if (!paoContainer) return;

  if (paoContainer._pao) {
    paoContainer.classList.remove('hidden');
    paoContainer._pao.show();
    return;
  }

  const { default: PAOView } = await import('../components/pao/PAOView.js');
  const pao = new PAOView();
  pao.init(paoContainer);
  paoContainer.classList.remove('hidden');
  setTimeout(() => pao.show(), 0);
  paoContainer._pao = pao;
}

function setupGameControls(app) {
  const questionButton = document.getElementById('questionButton');
  if (questionButton) {
    questionButton.addEventListener('click', () => {
      eventBus.emit('question:request-new');
      eventBus.emit('ui:button-click');
    });
  }

  const answerButton = document.getElementById('answerButton');
  if (answerButton) {
    answerButton.addEventListener('click', () => {
      eventBus.emit('question:show-answer');
      eventBus.emit('ui:button-click');
    });
  }

  const inputBox = document.getElementById('inputBox');
  const checkButton = document.getElementById('checkButton');

  if (inputBox && checkButton) {
    inputBox.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return;

      const value = inputBox.value.trim();
      const answerBox = document.getElementById('answerBox');
      const answerVisible = Boolean(answerBox?.classList.contains('visible') || answerBox?.style.display === 'block');
      const phase = app.gameEngine?.state?.session?.phase;

      if (phase === 'result') {
        eventBus.emit('question:request-new');
        event.preventDefault();
        return;
      }

      if (value) {
        submitAnswer(app);
      } else if (answerVisible) {
        eventBus.emit('question:request-new');
      } else {
        eventBus.emit('dialog:prompt', {
          text: 'Type your answer and press Enter. Press Enter again to get a new question.'
        });
      }
    });

    checkButton.addEventListener('click', () => {
      const phase = app.gameEngine?.state?.session?.phase;
      const answerBox = document.getElementById('answerBox');
      const answerVisible = Boolean(answerBox?.classList.contains('visible') || answerBox?.style.display === 'block');

      if (phase === 'result' || answerVisible) {
        eventBus.emit('question:request-new');
        eventBus.emit('ui:button-click');
        return;
      }

      submitAnswer(app);
    });
  }

  eventBus.on('question:show-answer', () => {
    const answerBox = document.getElementById('answerBox');
    const { question } = app.gameEngine.state;
    if (answerBox && question.data) {
      answerBox.innerHTML = question.data.answer;
      answerBox.classList.add('visible');
      console.log(`[AnswerBox] Showing answer: ${question.data.answer}`);
    } else {
      console.warn('[AnswerBox] Could not show answer - missing element or data');
    }
  });
}

function submitAnswer(app) {
  const inputBox = document.getElementById('inputBox');
  if (!inputBox) return;

  const answer = inputBox.value.trim();
  const phase = app.gameEngine?.state?.session?.phase;

  if (phase === 'result') {
    eventBus.emit('question:request-new');
    return;
  }

  const hasQuestion = Boolean(app.gameEngine?.state?.question?.data);
  if (!hasQuestion) {
    console.warn('[Submit] No question loaded; requesting a new one');
    eventBus.emit('question:request-new');
    return;
  }

  if (answer) {
    console.log(`[Submit] Answer submitted: ${answer}`);
    eventBus.emit(GAME_EVENTS.ANSWER_SUBMITTED, { answer });
    eventBus.emit('answer:submit', { answer });
    inputBox.value = '';
    eventBus.emit('ui:button-click');
  }
}

function setupMenuInteractions(app) {
  const themeSwitch = document.getElementById('theme-switch');
  if (themeSwitch) themeSwitch.addEventListener('change', toggleTheme);

  document.getElementById('lang-btn')?.addEventListener('click', toggleLanguage);
  document.getElementById('lang-btn-menu')?.addEventListener('click', toggleLanguage);

  const hamburgerMenu = document.getElementById('hamburger-menu');
  const sideMenu = document.getElementById('side-menu');
  const backdrop = document.getElementById('menu-backdrop');
  const closeMenu = sideMenu?.querySelector('.close-menu');

  const setMenuOpen = (open) => {
    sideMenu?.classList.toggle('active', open);
    hamburgerMenu?.classList.toggle('active', open);
    backdrop?.classList.toggle('active', open);
    document.body.classList.toggle('menu-open', open);
  };

  hamburgerMenu?.addEventListener('click', () => {
    setMenuOpen(!sideMenu?.classList.contains('active'));
    eventBus.emit('ui:button-click');
  });
  closeMenu?.addEventListener('click', () => setMenuOpen(false));
  backdrop?.addEventListener('click', () => setMenuOpen(false));

  const hostAnimBtn = document.getElementById('host-anim-trigger');
  if (hostAnimBtn) {
    hostAnimBtn.addEventListener('click', () => {
      const animations = ['celebrate', 'surprise', 'think'];
      const pick = animations[Math.floor(Math.random() * animations.length)];
      eventBus.emit('host:animate', { animation: pick });
      eventBus.emit('ui:button-click');
    });
  }

  eventBus.on('modal:open', () => setMenuOpen(false));

  document.getElementById('settings-button')?.addEventListener('click', () => eventBus.emit('modal:open', { type: 'settings' }));
  document.getElementById('stats-button')?.addEventListener('click', () => eventBus.emit('modal:open', { type: 'stats' }));
  document.getElementById('achievements-button')?.addEventListener('click', () => eventBus.emit('modal:open', { type: 'achievements' }));
  document.getElementById('leaderboard-button')?.addEventListener('click', () => eventBus.emit('modal:open', { type: 'leaderboard' }));
  document.getElementById('profile-button')?.addEventListener('click', () => eventBus.emit('modal:open', { type: 'profile' }));
  document.getElementById('help-button')?.addEventListener('click', () => eventBus.emit('modal:open', { type: 'help' }));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenuOpen(false);
  });

  app.setMenuOpen = setMenuOpen;
}

function setupKeyboardShortcuts(app) {
  document.addEventListener('keydown', (event) => {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;

    switch (event.key) {
      case 'n':
      case 'N':
        eventBus.emit('question:request-new');
        event.preventDefault();
        break;
      case 's':
      case 'S':
        eventBus.emit('question:show-answer');
        event.preventDefault();
        break;
      case 'm':
      case 'M':
        app.soundManager?.toggleMute();
        event.preventDefault();
        break;
    }
  });
}

function setupEventDrivenModals() {
  document.getElementById('settings-button')?.addEventListener('click', () => eventBus.emit('modal:open', { type: 'settings' }));
  document.getElementById('stats-button')?.addEventListener('click', () => eventBus.emit('modal:open', { type: 'stats' }));
  document.getElementById('achievements-button')?.addEventListener('click', () => eventBus.emit('modal:open', { type: 'achievements' }));
  document.getElementById('help-button')?.addEventListener('click', () => eventBus.emit('modal:open', { type: 'help' }));
  document.getElementById('leaderboard-button')?.addEventListener('click', () => eventBus.emit('modal:open', { type: 'leaderboard' }));
  document.getElementById('profile-button')?.addEventListener('click', () => eventBus.emit('modal:open', { type: 'profile' }));
}

function setupRuntimeModals() {
  const settingsModal = document.getElementById('settings-modal');
  if (!settingsModal) return;
  const aiTranslationToggle = document.getElementById('ai-translation-toggle');
  if (aiTranslationToggle) {
    aiTranslationToggle.checked = localStorage.getItem('jeoparody_ai_translation') === '1';
    aiTranslationToggle.addEventListener('change', () => {
      localStorage.setItem('jeoparody_ai_translation', aiTranslationToggle.checked ? '1' : '0');
      translationService.clearCache();
      if (currentLegacyQuestion && getCurrentLanguage() !== 'en') {
        renderLegacySpeechBubble(currentLegacyQuestion).catch((error) => {
          console.warn('[Translation] Failed to refresh clue after AI translation toggle.', error);
        });
      }
    });
  }

  const closeSettings = () => {
    settingsModal.classList.remove('open');
    settingsModal.style.display = 'none';
  };

  const openSettings = () => {
    settingsModal.classList.add('open');
    settingsModal.style.display = 'block';
  };

  eventBus.on('modal:open', ({ type }) => {
    if (type === 'settings') openSettings();
  });

  settingsModal.querySelector('[data-close-settings]')?.addEventListener('click', closeSettings);
  settingsModal.querySelector('[data-settings-action="close"]')?.addEventListener('click', closeSettings);
  settingsModal.querySelector('[data-settings-theme="light"]')?.addEventListener('click', () => applyTheme(false));
  settingsModal.querySelector('[data-settings-theme="dark"]')?.addEventListener('click', () => applyTheme(true));
  settingsModal.addEventListener('click', (event) => {
    if (event.target === settingsModal) closeSettings();
  });
}

function setupNewUIModes() {
  console.log('[Debug] setupNewUIModes() called');
  const splash = document.getElementById('splash-screen');
  const board = document.getElementById('jeopardy-board-screen');
  const run = document.getElementById('run-category-screen');
  const paoContainer = document.getElementById('pao-screen-container');
  const clueModal = document.getElementById('clue-modal');
  const clueText = document.getElementById('clue-text');
  const clueTitle = document.getElementById('clue-title');
  const clueKicker = document.getElementById('clue-modal-kicker');
  const clueCard = clueModal?.querySelector('.clue-card');
  const hostContainer = document.querySelector('.host-container');
  const secretBurst = document.getElementById('secret-mode-burst');
  let secretOpening = false;

  const closeClueModal = () => {
    if (!clueModal) return;
    clueModal.classList.remove('active');
    clueModal.setAttribute('aria-hidden', 'true');
    clueModal.classList.remove('clue-modal--media', 'clue-modal--image', 'clue-modal--video', 'clue-modal--audio');
    if (clueText) clueText.replaceChildren();
  };

  const openTextClueModal = (title, text) => {
    if (!clueModal || !clueText) return;
    clueModal.classList.remove('clue-modal--media', 'clue-modal--image', 'clue-modal--video', 'clue-modal--audio');
    clueKicker && (clueKicker.textContent = 'Clue Preview');
    clueTitle && (clueTitle.textContent = title || 'Clue');
    clueText.textContent = text || '';
    clueModal.setAttribute('aria-hidden', 'false');
    clueModal.classList.add('active');
    requestAnimationFrame(() => clueCard?.focus());
  };

  const openMediaModal = (media = {}) => {
    if (!clueModal || !clueText) return;
    clueText.replaceChildren(createMediaModalBody(media));
    clueKicker && (clueKicker.textContent = `${formatMediaTypeLabel(media.type)} Preview`);
    clueTitle && (clueTitle.textContent = media.label || 'Clue Media');
    clueModal.classList.remove('clue-modal--image', 'clue-modal--video', 'clue-modal--audio');
    clueModal.classList.add('active', 'clue-modal--media', `clue-modal--${media.type || 'link'}`);
    clueModal.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => clueCard?.focus());
    eventBus.emit('media:opened', media);
  };

  const flashSecretBurst = (message) => {
    if (!secretBurst) return;
    secretBurst.textContent = message;
    secretBurst.hidden = false;
    secretBurst.classList.remove('secret-mode-burst--active');
    requestAnimationFrame(() => secretBurst.classList.add('secret-mode-burst--active'));
  };

  const launchSecretPaoMode = (message = 'PAO DIP SWITCH FOUND') => {
    if (secretOpening) return;
    secretOpening = true;

    splash?.classList.remove('secret-unlocking');
    splash?.classList.add('secret-unlocked');
    flashSecretBurst(message);
    eventBus.emit('game:start', { mode: 'pao-secret', difficulty: 'normal' });

    setTimeout(() => {
      splash?.classList.remove('active', 'secret-unlocked');
      openPaoMode(paoContainer)
        .catch((error) => {
          console.error('Failed to launch secret PAO mode', error);
          document.getElementById('splash-screen')?.classList.add('active');
        })
        .finally(() => {
          secretOpening = false;
        });
    }, 520);
  };

  const bindRapidClickUnlock = (target, message) => {
    if (!target) return;
    const maxAge = 2400;
    const requiredClicks = 10;
    let clicks = [];

    target.addEventListener('click', () => {
      const now = Date.now();
      clicks = clicks.filter((time) => now - time <= maxAge);
      clicks.push(now);

      target.classList.add('secret-tap-pulse');
      setTimeout(() => target.classList.remove('secret-tap-pulse'), 180);

      if (clicks.length >= requiredClicks) {
        clicks = [];
        launchSecretPaoMode(message);
      }
    });
  };

  bindRapidClickUnlock(document.getElementById('splash-title'), 'TOASTY MEMORY LAB');
  bindRapidClickUnlock(hostContainer, 'HOST PANEL OVERRIDE');

  if (splash) {
    const secretToast = document.getElementById('secret-mode-toast');
    let secretProgress = 0;

    const resetSecretProgress = () => {
      secretProgress = 0;
      splash.classList.remove('secret-unlocking');
    };

    const flashSecretToast = (message) => {
      if (!secretToast) return;
      secretToast.textContent = message;
      secretToast.hidden = false;
      secretToast.classList.remove('secret-mode-toast--active');
      requestAnimationFrame(() => secretToast.classList.add('secret-mode-toast--active'));
    };

    const trySecretPaoUnlock = (event) => {
      if (event.target.closest('input, textarea, select')) return false;

      const key = getSecretKey(event);
      const expectedKey = PAO_SECRET_SEQUENCE[secretProgress];

      if (key === expectedKey) {
        event.preventDefault();
        secretProgress += 1;
        splash.classList.add('secret-unlocking');

        if (secretProgress === PAO_SECRET_SEQUENCE.length) {
          flashSecretToast('PAO DIP SWITCH FOUND');
          launchSecretPaoMode('PAO DIP SWITCH FOUND');
          secretProgress = 0;
        }

        return true;
      }

      if (secretProgress > 0) resetSecretProgress();
      return false;
    };

    splash.querySelectorAll('.theme-dot').forEach((dot) => {
      dot.addEventListener('click', () => {
        const theme = dot.getAttribute('data-theme');
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('jeopardish_theme_variant', theme);
      });
    });

    splash.querySelectorAll('[data-start-mode]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-start-mode');
        console.log(`[Splash] Start button clicked - Mode: ${mode}`);
        splash.classList.remove('active');
        eventBus.emit('game:start', { mode, difficulty: 'normal' });

        if (mode === 'fullboard') {
          board?.classList.remove('hidden');
          board?.classList.add('active');
          try {
            const game = questionService.getRandomBoard();
            renderJeopardyBoard(game);
            attachBoardControls();
          } catch (error) {
            console.error('Failed to render fullboard', error);
          }
        } else if (mode === 'run-category') {
          run?.classList.remove('hidden');
          run?.classList.add('active');
        } else if (['classic', 'practice', 'daily-double'].includes(mode)) {
          eventBus.emit('question:request-new');
        }
      });
    });

    splash.querySelector('[data-action="open-settings"]')?.addEventListener('click', () => {
      eventBus.emit('modal:open', { type: 'settings' });
    });

    document.addEventListener('keydown', (event) => {
      if (!splash.classList.contains('active')) return;
      if (trySecretPaoUnlock(event)) return;
      if (event.target.closest('button, input, textarea, select, a')) return;
      if (event.key !== 'Enter' && event.key !== ' ') return;

      event.preventDefault();
      splash.querySelector('[data-start-mode="classic"]')?.click();
    });

    requestAnimationFrame(() => {
      splash.querySelector('[data-start-mode="classic"]')?.focus();
    });
  }

  if (board) {
    board.querySelector('[data-close-board]')?.addEventListener('click', () => {
      board.classList.remove('active');
      board.classList.add('hidden');
      document.getElementById('splash-screen')?.classList.add('active');
    });

    board.addEventListener('click', (event) => {
      const cell = event.target.closest('.clue');
      if (!cell) return;
      const q = cell._question;
      const value = cell.getAttribute('data-value');
      openTextClueModal(q?.category || `Clue for ${value}`, q?.question || `Clue for ${value}`);
    });
  }

  if (paoContainer) {
    const observer = new MutationObserver(() => {
      if (paoContainer.classList.contains('hidden') && paoContainer._pao) {
        paoContainer._pao.destroy();
        paoContainer._pao = null;
      }
    });
    observer.observe(paoContainer, { attributes: true, attributeFilter: ['class'] });
  }

  if (clueModal) {
    clueModal.querySelector('[data-close-clue-modal]')?.addEventListener('click', closeClueModal);
    clueModal.addEventListener('click', (event) => {
      if (event.target === clueModal) closeClueModal();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && clueModal.classList.contains('active')) closeClueModal();
    });

    eventBus.on('media:show', openMediaModal);
  }

  if (run) {
    run.querySelector('[data-close-run]')?.addEventListener('click', () => {
      run.classList.remove('active');
      run.classList.add('hidden');
      document.getElementById('splash-screen')?.classList.add('active');
    });

    const progress = run.querySelector('#run-progress-bar');
    let pct = 0;
    run.addEventListener('click', (event) => {
      const item = event.target.closest('.run-item');
      if (!item) return;
      pct = Math.min(100, pct + 20);
      if (progress) progress.style.width = `${pct}%`;
      item.style.opacity = '0.6';
    });
  }

  const speech = document.getElementById('speechBubble');
  if (speech) {
    const styles = ['', 'speech-bubble--thought', 'speech-bubble--comic'];
    let idx = 0;
    speech.addEventListener('click', (event) => {
      const rect = speech.getBoundingClientRect();
      const leftSide = event.clientX - rect.left < rect.width / 2;
      styles.forEach((cls) => cls && speech.classList.remove(cls));
      idx = (idx + (leftSide ? -1 : 1) + styles.length) % styles.length;
      const cls = styles[idx];
      if (cls) speech.classList.add(cls);
    });
  }
}

function setupQuestionEventOrchestrator() {
  eventBus.on('question:request-new', () => {
    const inputBox = document.getElementById('inputBox');
    if (inputBox) inputBox.value = '';
    setSubmitButtonMode('submit');
    setLegacyAnswerVisible(false);
  });

  eventBus.on('question:show-answer', () => {
    setLegacyAnswerVisible(true);
    setSubmitButtonMode('next');
    eventBus.emit('game:answer:revealed');
  });

  eventBus.on(GAME_EVENTS.QUESTION_LOADED, ({ question }) => {
    renderLegacySpeechBubble(question).catch((error) => {
      console.warn('[Translation] Failed to render translated clue; showing original.', error);
    });
  });

  eventBus.on('language:changed', () => {
    if (currentLegacyQuestion) {
      renderLegacySpeechBubble(currentLegacyQuestion).catch((error) => {
        console.warn('[Translation] Failed to re-render clue after language change.', error);
      });
    }
  });

  eventBus.on('answer:evaluated', renderAnswerFeedback);
}

async function renderLegacySpeechBubble(question) {
  currentLegacyQuestion = question;
  const token = speechRenderToken + 1;
  speechRenderToken = token;
  const lang = getCurrentLanguage();
  const localized = await translationService.translateQuestion(question, lang);
  if (token !== speechRenderToken) return;

  setText('categoryBox', localized.category || '');
  setText('valueBox', question.value ? `${question.value}` : '');
  renderQuestionBox(localized, question.question || '', lang);
  renderClueMedia(question.media || []);

  const answerBox = document.getElementById('answerBox');
  if (answerBox) {
    answerBox.textContent = question.answer || '';
    answerBox.className = 'answer-box';
    answerBox.style.display = 'none';
  }

  const inputBox = document.getElementById('inputBox');
  if (inputBox) {
    inputBox.placeholder = lang === 'pt-BR' ? 'Digite sua resposta...' : 'Type your answer...';
    inputBox.focus();
  }

  setSubmitButtonMode('submit');
}

function getCurrentLanguage() {
  return document.documentElement.getAttribute('data-language')
    || localStorage.getItem('jeopardish_language')
    || 'en';
}

function renderQuestionBox(localized, sourceText, lang) {
  const questionBox = document.getElementById('questionBox');
  if (!questionBox) return;

  questionBox.replaceChildren();
  questionBox.classList.toggle('question-box--translated', lang === 'pt-BR');

  if (lang !== 'pt-BR') {
    questionBox.textContent = localized.question || sourceText;
    return;
  }

  const displayLines = localized.lines?.length
    ? localized.lines
    : [{ text: localized.question || sourceText, source: sourceText }];

  displayLines.forEach((line) => {
    const row = document.createElement('span');
    row.className = 'translation-line';
    row.tabIndex = 0;

    const pt = document.createElement('span');
    pt.className = 'translation-line__pt';
    pt.textContent = line.text || '';

    const en = document.createElement('span');
    en.className = 'translation-line__en';
    en.textContent = line.source || sourceText;

    row.append(pt, en);
    questionBox.appendChild(row);
  });
}

function renderClueMedia(mediaItems = []) {
  const rack = document.getElementById('clueMediaRack');
  if (!rack) return;

  rack.replaceChildren();
  const playableItems = mediaItems.filter((item) => item?.url && item?.type);
  rack.hidden = playableItems.length === 0;

  for (const [index, item] of playableItems.entries()) {
    rack.appendChild(createClueMediaCard(item, index));
  }
}

function createClueMediaCard(item, index) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `clue-media-card clue-media-card--${item.type}`;
  button.dataset.mediaType = item.type;
  button.setAttribute('aria-label', `${mediaActionLabel(item.type)}: ${item.label || `Media ${index + 1}`}`);

  const preview = document.createElement('span');
  preview.className = 'clue-media-card__preview';
  preview.appendChild(createMediaPreviewNode(item));

  const copy = document.createElement('span');
  copy.className = 'clue-media-card__copy';

  const type = document.createElement('span');
  type.className = 'clue-media-card__type';
  type.textContent = item.type;

  const label = document.createElement('span');
  label.className = 'clue-media-card__label';
  label.textContent = item.label || defaultMediaLabel(item.type, index + 1);

  copy.append(type, label);
  button.append(preview, copy);
  button.addEventListener('click', () => eventBus.emit('media:show', item));
  return button;
}

function createMediaPreviewNode(item) {
  if (item.type === 'image') {
    const img = document.createElement('img');
    img.src = item.url;
    img.alt = item.label || 'Clue image';
    img.loading = 'lazy';
    return img;
  }

  const icon = document.createElement('span');
  icon.className = 'clue-media-card__icon';
  icon.textContent = item.type === 'audio' ? '♪' : '▶';
  return icon;
}

function createMediaModalBody(media) {
  const wrap = document.createElement('div');
  wrap.className = 'clue-media-stage';

  if (media.type === 'image') {
    const img = document.createElement('img');
    img.src = media.url;
    img.alt = media.label || 'Clue image';
    wrap.appendChild(img);
  } else if (media.type === 'video') {
    const video = document.createElement('video');
    video.src = media.url;
    video.controls = true;
    video.playsInline = true;
    video.preload = 'metadata';
    wrap.appendChild(video);
  } else if (media.type === 'audio') {
    const audio = document.createElement('audio');
    audio.src = media.url;
    audio.controls = true;
    audio.preload = 'metadata';
    wrap.appendChild(audio);
  } else {
    const link = document.createElement('a');
    link.href = media.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = media.label || media.url;
    wrap.appendChild(link);
  }

  const source = document.createElement('a');
  source.className = 'clue-media-source';
  source.href = media.url;
  source.target = '_blank';
  source.rel = 'noopener noreferrer';
  source.textContent = 'Open original source';
  wrap.appendChild(source);

  return wrap;
}

function mediaActionLabel(type) {
  return {
    image: 'View image',
    video: 'Play video',
    audio: 'Play audio'
  }[type] || 'Open media';
}

function formatMediaTypeLabel(type) {
  return String(type || 'Media')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function defaultMediaLabel(type, index) {
  return {
    image: `Image ${index}`,
    video: `Video ${index}`,
    audio: `Audio ${index}`
  }[type] || `Media ${index}`;
}

function setLegacyAnswerVisible(visible) {
  const answerBox = document.getElementById('answerBox');
  if (!answerBox) return;
  answerBox.style.display = visible ? 'block' : 'none';
  answerBox.classList.toggle('visible', visible);
}

function renderAnswerFeedback(result) {
  const answerBox = document.getElementById('answerBox');
  if (!answerBox) return;

  const isCorrect = Boolean(result?.isCorrect);
  const validation = result?.validation || {};
  const scoreTotal = Number(result?.score?.total || 0);
  const confidence = Number.isFinite(validation.confidence)
    ? Math.round(validation.confidence * 100)
    : null;
  const reason = validation.reason || (isCorrect ? 'accepted' : 'mismatch');
  const scoreText = scoreTotal > 0 ? `+${scoreTotal}` : String(scoreTotal);
  const headline = getFeedbackHeadline(isCorrect, reason);
  const detail = getFeedbackDetail(result, reason, confidence);
  const normalizedUser = validation.normalizedUserAnswer || '(empty)';
  const normalizedTarget = validation.acceptedAnswer || validation.normalizedCorrectAnswer || '(unknown)';
  const comparisonText = `Judges compared "${normalizedUser}" to "${normalizedTarget}".`;
  const scoreBreakdown = formatScoreBreakdown(result?.score);

  answerBox.replaceChildren(
    createFeedbackNode('div', 'answer-feedback__eyebrow', getVerdictEyebrow(result, confidence)),
    createFeedbackNode('div', 'answer-feedback__headline', headline),
    createFeedbackNode('div', 'answer-feedback__detail', detail),
    createFeedbackNode('div', 'answer-feedback__correct', `Correct answer: ${result?.correctAnswer || ''}`),
    createFeedbackNode('div', 'answer-feedback__comparison', comparisonText),
    createFeedbackNode('div', 'answer-feedback__meta', `Score ${scoreText} • Match ${confidence ?? 0}% • ${formatReason(reason)}`),
    createFeedbackNode('div', 'answer-feedback__score-breakdown', scoreBreakdown)
  );

  answerBox.style.display = 'block';
  answerBox.className = `answer-box visible answer-feedback ${isCorrect ? 'answer-feedback--correct' : 'answer-feedback--incorrect'}`;

  const inputBox = document.getElementById('inputBox');
  if (inputBox) {
    inputBox.value = '';
    inputBox.placeholder = 'Press Enter for next clue...';
    inputBox.focus();
  }

  setSubmitButtonMode('next');
}

function getFeedbackHeadline(isCorrect, reason) {
  if (isCorrect && reason === 'exact') return 'Correct.';
  if (isCorrect && reason === 'fuzzy') return 'Correct. Typo forgiven.';
  if (isCorrect && reason === 'variation') return 'Correct. Alternate accepted.';
  if (isCorrect) return 'Correct enough for the judges.';
  if (reason === 'empty') return 'No answer entered.';
  return 'Not quite.';
}

function getFeedbackDetail(result, reason, confidence) {
  if (result?.timedOut) return 'Time expired before the judges received a response.';
  if (result?.isCorrect && reason === 'fuzzy') {
    return 'The spelling was close enough to count. The judges are feeling generous, which is historically rare.';
  }
  if (result?.isCorrect && reason === 'similarity') {
    return 'The answer matched closely enough after normalization and similarity scoring.';
  }
  if (result?.validation?.judgmentNotes) {
    return result.validation.judgmentNotes;
  }
  if (result?.isCorrect) {
    return 'Your response survived punctuation, casing, spacing, article, and prompt-prefix cleanup.';
  }
  if (confidence >= 65) {
    return 'Close enough to raise an eyebrow, not close enough to raise the score.';
  }
  return 'The normalized answer did not clear the fuzzy-match threshold.';
}

function getVerdictEyebrow(result, confidence) {
  const label = result?.validation?.judgmentLabel || (result?.isCorrect ? 'accepted' : 'rejected');
  const prefix = result?.isCorrect ? 'Accepted Response' : 'Not Accepted';
  return `${prefix} • ${formatReason(label)} • ${confidence ?? 0}%`;
}

function formatScoreBreakdown(score = {}) {
  const parts = [
    ['Base', score.base],
    ['Time', score.timeBonus],
    ['Streak', score.streakBonus],
    ['Difficulty', score.difficultyBonus],
    ['Penalty', score.penalty]
  ]
    .filter(([, value]) => Number(value || 0) !== 0)
    .map(([label, value]) => `${label} ${formatSignedNumber(value)}`);

  return parts.length ? `Score math: ${parts.join(' • ')}` : 'Score math: no movement on the board.';
}

function formatSignedNumber(value) {
  const number = Number(value || 0);
  return number > 0 ? `+${number}` : String(number);
}

function formatReason(reason) {
  return String(reason || 'checked')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function createFeedbackNode(tagName, className, text) {
  const node = document.createElement(tagName);
  node.className = className;
  node.textContent = text;
  return node;
}

function setSubmitButtonMode(mode) {
  const checkButton = document.getElementById('checkButton');
  if (!checkButton) return;

  const isNext = mode === 'next';
  checkButton.textContent = isNext ? 'Next' : '✓';
  checkButton.setAttribute('aria-label', isNext ? 'Load next question' : 'Submit answer');
  checkButton.classList.toggle('check-button--next', isNext);
}

function setupScoreboardEffects() {
  eventBus.on('answer:evaluated', () => {
    flashScoreboard();
    highlightValue('score');
    highlightValue('streak');
  });
}

function flashScoreboard() {
  const scoreboard = document.getElementById('scoreboard');
  if (!scoreboard) return;
  scoreboard.classList.add('open');
  clearTimeout(scoreboard._hideTimer);
  scoreboard._hideTimer = setTimeout(() => scoreboard.classList.remove('open'), 2500);
}

function highlightValue(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('highlight');
  void el.offsetWidth;
  el.classList.add('highlight');
}

function renderJeopardyBoard(game) {
  const grid = document.getElementById('board-grid');
  if (!grid || !game) return;
  const cats = game.categories || [];
  const values = ['$200', '$400', '$600', '$800', '$1000'];
  const fragment = document.createDocumentFragment();

  cats.forEach((cat) => {
    const categoryEl = document.createElement('div');
    categoryEl.className = 'category';
    categoryEl.textContent = cat?.name ?? '';
    fragment.appendChild(categoryEl);
  });

  for (let row = 0; row < values.length; row += 1) {
    for (let col = 0; col < cats.length; col += 1) {
      const clueEl = document.createElement('div');
      clueEl.className = 'clue';
      clueEl.dataset.value = values[row];
      clueEl.textContent = values[row];
      clueEl._question = cats[col].clues[row];
      fragment.appendChild(clueEl);
    }
  }

  grid.innerHTML = '';
  grid.appendChild(fragment);
}

function attachBoardControls() {
  const controls = document.querySelector('#jeopardy-board-screen .board-controls');
  if (!controls || controls._attached) return;
  controls._attached = true;

  const wrap = document.createElement('div');
  wrap.style.display = 'flex';
  wrap.style.gap = '8px';
  wrap.style.alignItems = 'center';
  wrap.style.marginLeft = 'auto';
  wrap.innerHTML = `
    <input type="date" id="board-date" style="background:rgba(255,255,255,0.1);color:#fff;border:1px solid #ffd700;border-radius:6px;padding:4px 8px;" />
    <select id="board-year" style="background:rgba(255,255,255,0.1);color:#fff;border:1px solid #ffd700;border-radius:6px;padding:4px 8px;">
      <option value="">Year</option>
      ${Array.from({ length: 40 }, (_, i) => 2025 - i).map((year) => `<option value="${year}">${year}</option>`).join('')}
    </select>
    <select id="board-month" style="background:rgba(255,255,255,0.1);color:#fff;border:1px solid #ffd700;border-radius:6px;padding:4px 8px;">
      <option value="">Month</option>
      ${Array.from({ length: 12 }, (_, i) => `<option value="${String(i + 1).padStart(2, '0')}">${String(i + 1).padStart(2, '0')}</option>`).join('')}
    </select>
    <button id="board-apply" class="board-close" style="border:1px solid #ffd700;">Apply</button>
  `;
  controls.appendChild(wrap);
  wrap.querySelector('#board-apply').addEventListener('click', () => {
    const date = wrap.querySelector('#board-date').value || undefined;
    const year = wrap.querySelector('#board-year').value || undefined;
    const month = wrap.querySelector('#board-month').value || undefined;
    const game = questionService.getRandomBoard({ date, year, month });
    renderJeopardyBoard(game);
  });
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = String(value);
}
