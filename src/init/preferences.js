import { eventBus } from '../utils/events.js';
import { logger as console } from '../utils/logger.js';

export function applyTheme(isDark) {
  const htmlEl = document.documentElement;
  const bodyEl = document.body;

  htmlEl.classList.toggle('dark-theme', isDark);
  htmlEl.classList.toggle('dark-mode', isDark);
  bodyEl.classList.toggle('dark-theme', isDark);
  bodyEl.classList.toggle('dark-mode', isDark);

  localStorage.setItem('jeopardish_theme', isDark ? 'dark' : 'light');

  const themeSwitchInput = document.getElementById('theme-switch');
  if (themeSwitchInput) themeSwitchInput.checked = isDark;

  const toggleLabel = document.querySelector('.toggle-label');
  if (toggleLabel) toggleLabel.textContent = isDark ? 'Night' : 'Day';

  document.documentElement.setAttribute('data-theme-mode', isDark ? 'dark' : 'light');
  bodyEl.setAttribute('data-theme-mode', isDark ? 'dark' : 'light');
}

export function toggleTheme(event) {
  const isDark = event.target.checked;
  applyTheme(isDark);
  eventBus.emit('theme:changed', { theme: isDark ? 'dark' : 'light' });
}

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
    langBtnMenu.innerHTML = `<i class="fas fa-language"></i><span class="flag-emoji">${flag}</span>`;
  }

  document.documentElement.lang = lang === 'pt-BR' ? 'pt-BR' : 'en';
  document.body.lang = lang === 'pt-BR' ? 'pt-BR' : 'en';
  document.documentElement.setAttribute('data-language', lang);
  document.body.setAttribute('data-language', lang);
}

export function toggleLanguage() {
  const langBtnHeader = document.getElementById('lang-btn');
  const langBtnMenu = document.getElementById('lang-btn-menu');
  const currentLang = langBtnHeader?.getAttribute('data-lang') || langBtnMenu?.getAttribute('data-lang') || 'en';
  const newLang = currentLang === 'en' ? 'pt-BR' : 'en';

  setLanguageUI(newLang);
  eventBus.emit('language:changed', { lang: newLang });
  localStorage.setItem('jeopardish_language', newLang);

  console.log(`Language switched to: ${newLang}`);
}

export function loadUserPreferences() {
  const savedTheme = localStorage.getItem('jeopardish_theme');
  const isDark = savedTheme === 'dark';
  if (savedTheme) {
    applyTheme(isDark);
    const themeSwitch = document.getElementById('theme-switch');
    if (themeSwitch) themeSwitch.checked = isDark;
  }

  const savedLang = localStorage.getItem('jeopardish_language');
  if (savedLang) {
    setLanguageUI(savedLang);
    eventBus.emit('language:changed', { lang: savedLang });
  }
}

export function saveUserPreferences() {
  eventBus.on('theme:changed', ({ theme }) => {
    localStorage.setItem('jeopardish_theme', theme);
    applyTheme(theme === 'dark');
  });

  eventBus.on('language:changed', ({ lang }) => {
    localStorage.setItem('jeopardish_language', lang);
    setLanguageUI(lang);
  });
}

export function applySavedThemeVariant() {
  const savedVariant = localStorage.getItem('jeopardish_theme_variant');
  document.documentElement.setAttribute('data-theme', savedVariant || 'jeopardy');
}
