/**
 * Language Service - centralizes language toggle, persistence, and UI sync
 */
import { eventBus } from '../utils/events.js';

class LanguageService {
  constructor() {
    this.language = 'en';
    this.initialized = false;
  }

  applyLanguage(lang) {
    this.language = lang;
    
    // Set on document for CSS/hooks
    document.documentElement.setAttribute('lang', lang);

    // Sync any buttons with class js-lang-toggle
    document.querySelectorAll('.js-lang-toggle').forEach(btn => {
      btn.setAttribute('data-lang', lang);
      const flag = btn.querySelector('.flag-emoji');
      if (flag) flag.textContent = lang === 'en' ? '🇺🇸' : '🇧🇷';
    });

    // Emit for listeners
    eventBus.emit('language:changed', { language: lang });
  }

  setLanguage(lang) {
    localStorage.setItem('language', lang);
    this.applyLanguage(lang);
  }

  toggleLanguage() {
    this.setLanguage(this.language === 'en' ? 'pt-BR' : 'en');
  }

  bindUI() {
    document.querySelectorAll('.js-lang-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleLanguage();
      });
    });
  }

  init() {
    if (this.initialized) return;
    const saved = localStorage.getItem('language');
    const lang = saved || 'en';
    this.applyLanguage(lang);
    this.bindUI();
    this.initialized = true;
  }
}

const language = new LanguageService();
export default language;

