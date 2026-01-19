/**
 * StateBridge - The Synapse
 * 
 * Carmack's pattern: "When migrating systems, build a translation layer 
 * rather than rewriting everything at once."
 * 
 * This bridge listens to high-frequency GameEngine events and 
 * syncs the legacy Redux store, ensuring the UI (QuestionDisplay, etc)
 * stays in sync with the new Core Logic.
 */

import { eventBus } from '../utils/events.js';
import { store } from '../state/store.js';
import { ACTION_TYPES } from '../state/actions.js';
import { GAME_PHASES, getGameEngine } from './GameEngine.js'; // Need to map phases to status

export class StateBridge {
	constructor() {
		this.setupListeners();
		console.log('[🌉] StateBridge initialized');
	}

	setupListeners() {
		// 1. Phase Changes -> Game Status
		eventBus.on('game:phase-changed', ({ to }) => {
			this.syncGameStatus(to);
		});

		// 2. Question Loaded -> Current Question
		eventBus.on('question:loaded', ({ question }) => {
			store.dispatch(ACTION_TYPES.QUESTION_LOAD, { question });
		});

		// 3. Answer Evaluated -> Score & History
		eventBus.on('answer:evaluated', () => {
			const engine = getGameEngine();
			store.dispatch('UPDATE', {
				score: JSON.parse(JSON.stringify(engine.state.score)),
				statistics: JSON.parse(JSON.stringify(engine.state.stats))
			});
		});

		// 4. Settings Changed (Engine -> Store)
		eventBus.on('settings:changed', (settings) => {
			store.dispatch(ACTION_TYPES.SETTINGS_UPDATE, { settings });
		});

		// 5. User Updated
		eventBus.on('user:updated', (user) => {
			// Map engine user structure to store structure
			store.dispatch(ACTION_TYPES.USER_LOGIN, { user });
		});
	}

	syncGameStatus(phase) {
		// Map Engine Phase to Store Status
		// Engine: menu, loading, question, answering, result, complete, paused
		// Store: idle, loading, playing, paused, ended

		let status = 'idle';
		switch (phase) {
			case GAME_PHASES.MENU: status = 'idle'; break;
			case GAME_PHASES.LOADING: status = 'loading'; break;
			case GAME_PHASES.QUESTION:
			case GAME_PHASES.ANSWERING:
			case GAME_PHASES.RESULT:
				status = 'playing';
				break;
			case GAME_PHASES.COMPLETE: status = 'ended'; break;
			case GAME_PHASES.PAUSED: status = 'paused'; break;
		}

		// We use MERGE to perform a deep merge to allow UI reactivity
		store.dispatch('MERGE', {
			game: { status }
		});
	}
}

// Singleton
export const stateBridge = new StateBridge();
