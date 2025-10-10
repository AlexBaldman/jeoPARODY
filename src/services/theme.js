/**
 * Theme Service - centralizes theme persistence and UI sync
 */
import { eventBus } from '../utils/events.js';

class ThemeService {
  constructor() {
    this.theme = 'light';
    this.initialized = false;
  }

  detectSystemTheme() {
    try {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    } catch {
      return 'light';
    }
  }

  applyTheme(theme) {
    this.theme = theme;
    document.body.classList.toggle('dark-theme', theme === 'dark');

    // Sync checkbox switch in header
    const checkbox = document.querySelector('#theme-switch');
    if (checkbox) checkbox.checked = theme === 'dark';

    // Sync label text
    const label = document.querySelector('.toggle-label');
    if (label) label.textContent = theme === 'dark' ? 'DARK MODE' : 'LIGHT MODE';

    // Sync any .theme-toggle buttons (icon)
    document.querySelectorAll('.theme-toggle .theme-icon').forEach(icon => {
      icon.textContent = theme === 'dark' ? '🌚' : '🌞';
    });

    // Emit event for listeners
    eventBus.emit('theme:changed', { theme });
  }

  setTheme(theme) {
    localStorage.setItem('theme', theme);
    this.applyTheme(theme);
  }

  toggleTheme() {
    this.setTheme(this.theme === 'dark' ? 'light' : 'dark');
  }

  bindUI() {
    // Header checkbox
    const checkbox = document.querySelector('#theme-switch');
    if (checkbox) {
      checkbox.addEventListener('change', () => this.toggleTheme());
    }

    // Any .theme-toggle buttons from App component
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.addEventListener('click', () => this.toggleTheme());
    });
  }

  init() {
    if (this.initialized) return;
    const saved = localStorage.getItem('theme');
    const theme = saved || this.detectSystemTheme();
    this.applyTheme(theme);
    this.bindUI();
    this.initialized = true;
  }
}

const theme = new ThemeService();
export default theme;

