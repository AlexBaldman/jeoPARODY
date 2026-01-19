/**
 * Game Session
 * 
 * Tracks a complete game session with multiple rounds.
 * Carmack's principle: "Keep persistent data separate from transient logic."
 */

import { generateId } from '../utils/helpers.js';

export class GameSession {
	constructor() {
		this.sessionId = generateId();
		this.startTime = Date.now();
		this.rounds = [];
		this.currentRound = null;
		this.totalScore = 0;
		this.totalQuestions = 0;
		this.correctAnswers = 0;
	}

	/**
	 * Start a new round
	 * @param {Object} question - Question data
	 * @returns {Object} Round object
	 */
	startRound(question) {
		const round = {
			id: generateId(),
			questionId: question.id || generateId(),
			question: question.question,
			answer: question.answer,
			category: question.category,
			value: question.value,
			startTime: Date.now(),
			endTime: null,
			userAnswer: null,
			isCorrect: false,
			timeElapsed: 0,
			score: 0,
			peekUsed: false
		};

		this.currentRound = round;
		this.rounds.push(round);
		this.totalQuestions++;

		return round;
	}

	/**
	 * Complete current round
	 * @param {Object} result - Round result data
	 */
	completeRound(result) {
		if (!this.currentRound) return;

		this.currentRound.endTime = Date.now();
		this.currentRound.timeElapsed = this.currentRound.endTime - this.currentRound.startTime;
		this.currentRound.userAnswer = result.userAnswer;
		this.currentRound.isCorrect = result.isCorrect;
		this.currentRound.score = result.score;
		this.currentRound.peekUsed = result.peekUsed || false;

		if (result.isCorrect) {
			this.correctAnswers++;
		}

		this.totalScore += (result.score || 0);
		this.currentRound = null;
	}

	/**
	 * Get session statistics
	 * @returns {Object} Session stats
	 */
	getStats() {
		const accuracy = this.totalQuestions > 0
			? (this.correctAnswers / this.totalQuestions) * 100
			: 0;

		const averageTime = this.rounds.length > 0
			? this.rounds.reduce((sum, r) => sum + (r.timeElapsed || 0), 0) / this.rounds.length
			: 0;

		return {
			sessionId: this.sessionId,
			duration: Date.now() - this.startTime,
			totalScore: this.totalScore,
			totalQuestions: this.totalQuestions,
			correctAnswers: this.correctAnswers,
			accuracy: Math.round(accuracy),
			averageResponseTime: Math.round(averageTime),
			rounds: this.rounds.length
		};
	}

	/**
	 * Export session data
	 * @returns {Object} Complete session data
	 */
	export() {
		return {
			...this.getStats(),
			startTime: this.startTime,
			endTime: Date.now(),
			rounds: this.rounds
		};
	}
}

export default GameSession;
