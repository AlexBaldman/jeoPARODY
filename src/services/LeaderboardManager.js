/**
 * LeaderboardManager - Managing High Scores
 * 
 * "It's not about winning, it's about being on the list."
 */

import { eventBus } from '../utils/events.js';

const STORAGE_KEY = 'jeopardish_leaderboard';

const SEED_DATA = [
	{ name: "Watson", score: 77147, date: Date.now() },
	{ name: "Ken J.", score: 75000, date: Date.now() - 10000000 },
	{ name: "Brad R.", score: 65000, date: Date.now() - 20000000 },
	{ name: "HAL 9000", score: 50000, date: Date.now() - 30000000 },
	{ name: "Deep Blue", score: 45000, date: Date.now() - 40000000 },
	{ name: "GLaDOS", score: 42000, date: Date.now() - 50000000 },
	{ name: "Clippy", score: 100, date: Date.now() - 999999999 }
];

export class LeaderboardManager {
	constructor() {
		this.scores = this.loadScores();
		this.setupListeners();
	}

	loadScores() {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			return raw ? JSON.parse(raw) : [...SEED_DATA];
		} catch (e) {
			return [...SEED_DATA];
		}
	}

	saveScores() {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(this.scores));
	}

	setupListeners() {
		eventBus.on('game:game-over', (data) => {
			// data.score, data.user
			if (data.score && data.score.total > 0) {
				this.addScore(data.user || { name: 'Anonymous' }, data.score.total);
			}
		});
	}

	/**
	 * Add a score to the leaderboard
	 * @param {Object} user 
	 * @param {number} points 
	 */
	addScore(user, points) {
		this.scores.push({
			name: user.name,
			score: points,
			date: Date.now()
		});

		// Sort descending
		this.scores.sort((a, b) => b.score - a.score);

		// Keep top 50
		if (this.scores.length > 50) {
			this.scores = this.scores.slice(0, 50);
		}

		this.saveScores();

		// Notify new high score?
		const rank = this.scores.findIndex(s => s.score === points && s.name === user.name) + 1;
		if (rank <= 10) {
			eventBus.emit('leaderboard:high-score', { rank, score: points });
		}
	}

	getTopScores(limit = 10) {
		return this.scores.slice(0, limit);
	}
}

export const leaderboardManager = new LeaderboardManager();
