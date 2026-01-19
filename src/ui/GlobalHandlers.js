import { eventBus } from '../utils/events.js';
import { AppState } from '../core/AppConfig.js';

export function setupGlobalEventListeners() {
	// Theme toggle
	const themeSwitch = document.getElementById('theme-switch');
	if (themeSwitch) {
		themeSwitch.addEventListener('change', toggleTheme);
	}

	// Language toggles
	const langBtn = document.getElementById('lang-btn');
	const langBtnMenu = document.getElementById('lang-btn-menu');
	if (langBtn) langBtn.addEventListener('click', toggleLanguage);
	if (langBtnMenu) langBtnMenu.addEventListener('click', toggleLanguage);

	// Hamburger menu
	const hamburgerMenu = document.getElementById('hamburger-menu');
	const sideMenu = document.getElementById('side-menu');
	const overlay = document.getElementById('overlay');

	if (hamburgerMenu && sideMenu && overlay) {
		hamburgerMenu.addEventListener('click', () => {
			sideMenu.classList.toggle('active');
			hamburgerMenu.classList.toggle('active');
			overlay.classList.toggle('active');
			resetIdleTimer();
		});

		overlay.addEventListener('click', () => {
			sideMenu.classList.remove('active');
			hamburgerMenu.classList.remove('active');
			overlay.classList.remove('active');
			resetIdleTimer();
		});
	}

	// Idle / Attract Mode Detection
	setupIdleDetection();
}

let idleTimer;
const IDLE_TIMEOUT_MS = 60000; // 60 seconds

function setupIdleDetection() {
	['mousemove', 'mousedown', 'keydown', 'touchstart'].forEach(evt => {
		document.addEventListener(evt, resetIdleTimer, { passive: true });
	});
	resetIdleTimer();
}

function resetIdleTimer() {
	if (idleTimer) clearTimeout(idleTimer);

	// If the app was previously idle, we might want to emit an 'active' event here
	// eventBus.emit('app:active'); 

	idleTimer = setTimeout(() => {
		eventBus.emit('app:idle');
		// console.log('[Attract Mode] App is idle...');
	}, IDLE_TIMEOUT_MS);
}

export function setupKeyboardShortcuts() {
	document.addEventListener('keydown', (e) => {
		// Don't interfere with typing in input fields
		if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
			return;
		}

		switch (e.key) {
			case 'n':
			case 'N':
				eventBus.emit('question:request-new');
				e.preventDefault();
				break;
			case 's':
			case 'S':
				eventBus.emit('question:show-answer');
				e.preventDefault();
				break;
			case 'm':
			case 'M':
				AppState.soundManager?.toggleMute();
				e.preventDefault();
				break;
		}
	});
}

function toggleTheme(e) {
	const isDark = e.target.checked;
	applyTheme(isDark);
	eventBus.emit('theme:changed', { theme: isDark ? 'dark' : 'light' });
}

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

	document.documentElement.setAttribute('data-theme-mode', isDark ? 'dark' : 'light');
}

function toggleLanguage() {
	const langBtnHeader = document.getElementById('lang-btn');
	const langBtnMenu = document.getElementById('lang-btn-menu');

	const currentLang = (langBtnHeader?.getAttribute('data-lang') || langBtnMenu?.getAttribute('data-lang') || 'en');
	const newLang = currentLang === 'en' ? 'pt-BR' : 'en';

	setLanguageUI(newLang);

	eventBus.emit('language:changed', { lang: newLang });
	localStorage.setItem('jeopardish_language', newLang);
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
		langBtnMenu.innerHTML = `<i class="fas fa-language"></i>`;
	}
}
