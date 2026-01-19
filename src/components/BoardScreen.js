/**
 * BoardScreen - Full Jeopardy Board UI
 * 
 * Displays a 6x6 grid (1 row headers, 5 rows clues).
 * Clicking a clue cell reveals the question in GameScreen-like fashion.
 */

import { createElement } from '../utils/helpers.js';
import { eventBus } from '../utils/events.js';
import { getGameEngine } from '../core/GameEngine.js';
import questionService from '../services/api/questionService.js';

export default class BoardScreen {
	constructor() {
		this.engine = getGameEngine();
		this.board = null;
		this.element = null;

		this.setupEventListeners();
	}

	setupEventListeners() {
		eventBus.on('board:clue-revealed', ({ categoryIdx, clueIdx }) => {
			this.markClueRevealed(categoryIdx, clueIdx);
		});

		eventBus.on('board:reset', () => {
			this.loadBoard();
		});
	}

	async loadBoard() {
		// Ensure question service is initialized
		await questionService.initialize();

		this.board = questionService.getGameSet();

		if (!this.board) {
			console.error('[BoardScreen] Failed to generate game set');
			eventBus.emit('ui:notification', { message: 'Not enough categories for a full board!', type: 'error' });
			return false;
		}

		// Assign one Daily Double randomly
		const ddCatIdx = Math.floor(Math.random() * this.board.length);
		const ddClueIdx = Math.floor(Math.random() * this.board[ddCatIdx].clues.length);
		this.board[ddCatIdx].clues[ddClueIdx].isDailyDouble = true;

		console.log(`[BoardScreen] Daily Double at Category ${ddCatIdx}, Clue ${ddClueIdx}`);
		return true;
	}

	render() {
		this.element = createElement('div', { className: 'board-screen' });

		if (!this.board) {
			this.element.innerHTML = '<div class="board-loading">Loading Board...</div>';
			this.loadBoard().then((success) => {
				if (success) {
					this.element.innerHTML = '';
					this.element.appendChild(this.renderGrid());
				}
			});
		} else {
			this.element.appendChild(this.renderGrid());
		}

		return this.element;
	}

	renderGrid() {
		const grid = createElement('div', { className: 'jeopardy-grid' });

		// Category Headers Row
		const headerRow = createElement('div', { className: 'grid-row header-row' });
		this.board.forEach(category => {
			const headerCell = createElement('div', { className: 'grid-cell category-header' }, [category.name]);
			headerRow.appendChild(headerCell);
		});
		grid.appendChild(headerRow);

		// Clue Rows (5 rows)
		for (let clueIdx = 0; clueIdx < 5; clueIdx++) {
			const row = createElement('div', { className: 'grid-row clue-row' });

			this.board.forEach((category, catIdx) => {
				const clue = category.clues[clueIdx];
				const cell = createElement('div', {
					className: `grid-cell clue-cell ${clue.isRevealed ? 'revealed' : ''}`,
					'data-cat-idx': catIdx,
					'data-clue-idx': clueIdx
				});

				if (clue.isRevealed) {
					cell.textContent = '';
				} else {
					cell.textContent = `$${clue.value}`;
					cell.onclick = () => this.selectClue(catIdx, clueIdx);
				}

				row.appendChild(cell);
			});

			grid.appendChild(row);
		}

		return grid;
	}

	selectClue(categoryIdx, clueIdx) {
		const category = this.board[categoryIdx];
		const clue = category.clues[clueIdx];

		if (clue.isRevealed) return;

		console.log(`[BoardScreen] Selected: ${category.name} for $${clue.value}`);

		// Mark as revealed immediately (visually)
		clue.isRevealed = true;
		this.markClueRevealed(categoryIdx, clueIdx);

		// Load question into engine
		// The engine will handle Daily Double detection via the flag
		if (clue.isDailyDouble) {
			// Engine should trigger wager modal
			this.engine.loadQuestion({ ...clue, isDailyDouble: true });
		} else {
			this.engine.loadQuestion(clue);
		}

		// Switch to Game Screen for answering
		eventBus.emit('ui:screen:change', { screenName: 'game' });
	}

	markClueRevealed(categoryIdx, clueIdx) {
		if (!this.element) return;

		const cell = this.element.querySelector(`[data-cat-idx="${categoryIdx}"][data-clue-idx="${clueIdx}"]`);
		if (cell) {
			cell.classList.add('revealed');
			cell.textContent = '';
			cell.onclick = null;
		}

		// Check if board is complete
		const allRevealed = this.board.every(cat => cat.clues.every(c => c.isRevealed));
		if (allRevealed) {
			eventBus.emit('board:complete');
		}
	}

	hide() {
		if (this.element) this.element.classList.add('hidden');
	}

	show() {
		if (this.element) this.element.classList.remove('hidden');
	}
}
