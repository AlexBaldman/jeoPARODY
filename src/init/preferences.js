/**
 * User Preferences Management
 * 
 * Handles loading, saving, and applying user preferences:
 * - Theme (dark/light mode)
 * - Language (en/pt-BR)
 * - Theme variant (jeopardy/retro/comic)
 * - Audio settings
 * - Accessibility settings
 * 
 * @module init/preferences
 */

import { eventBus } from '../utils/events.js';
import { logger as console } from '../utils/logger.js';

/**
 * Load and apply user preferences from localStorage
 */
export function loadUserPreferences() {
  console.info('[💾] Loading user preferences...');
  
  // Load theme preference
  const savedTheme = localStorage.getItem('jeopardish_theme');
  if (savedTheme) {
    const isDark = savedTheme === 'dark';
    applyTheme(isDark);
    console.log(`🎨 Theme loaded: ${savedTheme}`);
  }
  
  // Load language preference
  const savedLang = localStorage.getItem('jeopardish_language');
  if (savedLang) {
    setLanguageUI(savedLang);
    eventBus.emit('language:changed', { lang: savedLang });
    console.log(`🌐 Language loaded: ${savedLang}`);
  }
  
  // Load theme variant preference
  const savedVariant = localStorage.getItem('jeopardish_theme_variant');
  if (savedVariant) {
    document.documentElement.setAttribute('data-theme', savedVariant);
    console.log(`🎨 Theme variant loaded: ${savedVariant}`);
  }
  
  console.info('[✅] User preferences loaded');
}

/**
 * Set up preference change listeners
 * Automatically save preferences when they change
 */
export function watchPreferenceChanges() {
  // Save theme when it changes
  eventBus.on('theme:changed', ({ theme }) => {
    localStorage.setItem('jeopardish_theme', theme);
    console.log(`💾 Theme saved: ${theme}`);
  });
  
  // Save language when it changes
  eventBus.on('language:changed', ({ lang }) => {
    localStorage.setItem('jeopardish_language', lang);
    setLanguageUI(lang);
    console.log(`💾 Language saved: ${lang}`);
  });
  
  // Save theme variant when it changes
  eventBus.on('theme:variant-changed', ({ variant }) => {
    localStorage.setItem('jeopardish_theme_variant', variant);
    console.log(`💾 Theme variant saved: ${variant}`);
  });
  
  console.info('[👀] Watching preference changes');
}

/**
 * Apply theme (dark/light mode)
 * @param {boolean} isDark - Whether dark mode is enabled
 */
export function applyTheme(isDark) {
  const htmlEl = document.documentElement;
  const bodyEl = document.body;
  
  // Apply theme classes
  htmlEl.classList.toggle('dark-theme', isDark);
  htmlEl.classList.toggle('dark-mode', isDark);
  bodyEl.classList.toggle('dark-theme', isDark);
  bodyEl.classList.toggle('dark-mode', isDark);
  
  // Sync checkbox UI if present
  const themeSwitchInput = document.getElementById('theme-switch');
  if (themeSwitchInput) {
    themeSwitchInput.checked = isDark;
  }
}

/**
 * Toggle theme
 * @param {Event} e - Change event from theme toggle
 */
export function toggleTheme(e) {
  const isDark = e.target.checked;
  applyTheme(isDark);
  eventBus.emit('theme:changed', { theme: isDark ? 'dark' : 'light' });
}

/**
 * Set language UI elements
 * @param {string} lang - Language code (en, pt-BR, etc.)
 */
export function setLanguageUI(lang) {
  const langBtnHeader = document.getElementById('lang-btn');
  const langBtnMenu = document.getElementById('lang-btn-menu');
  const flag = lang === 'en' ? '🇺🇸' : '🇧🇷';
  
  if (langBtnHeader) {
    langBtnHeader.setAttribute('data-lang', lang);
    langBtnHeader.innerHTML = `<i class="fas fa-language"></i><span class="flag-emoji">${flag}</span>`;
  }
  
  if (langBtnMenu) {
    langBtnMenu.setAttribute('data-lang', lang);
    langBtnMenu.innerHTML = `<i class="fas fa-language"></i>`;
  }
}

/**
 * Toggle language
 */
export function toggleLanguage() {
  const langBtnHeader = document.getElementById('lang-btn');
  const langBtnMenu = document.getElementById('lang-btn-menu');
  
  // Determine current language
  const currentLang = (
    langBtnHeader?.getAttribute('data-lang') || 
    langBtnMenu?.getAttribute('data-lang') || 
    'en'
  );
  
  // Toggle to other language
  const newLang = currentLang === 'en' ? 'pt-BR' : 'en';
  
  // Update UI and emit event
  setLanguageUI(newLang);
  eventBus.emit('language:changed', { lang: newLang });
  
  console.log(`🌐 Language switched to: ${newLang}`);
}

/**
 * Get all current preferences
 * @returns {Object} Current preferences
 */
export function getPreferences() {
  return {
    theme: localStorage.getItem('jeopardish_theme') || 'light',
    language: localStorage.getItem('jeopardish_language') || 'en',
    themeVariant: localStorage.getItem('jeopardish_theme_variant') || 'jeopardy',
    soundEnabled: localStorage.getItem('jeopardish_sound') !== 'false',
    // Add more preferences as needed
  };
}

/**
 * Reset all preferences to defaults
 */
export function resetPreferences() {
  localStorage.removeItem('jeopardish_theme');
  localStorage.removeItem('jeopardish_language');
  localStorage.removeItem('jeopardish_theme_variant');
  
  // Apply defaults
  applyTheme(false);
  setLanguageUI('en');
  document.documentElement.setAttribute('data-theme', 'jeopardy');
  
  eventBus.emit('preferences:reset');
  console.info('[🔄] Preferences reset to defaults');
}
