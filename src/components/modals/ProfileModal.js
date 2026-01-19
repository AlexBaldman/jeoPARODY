import Modal from '../Modal.js';
import { getGameEngine } from '../../core/GameEngine.js';
import { userManager } from '../../services/UserManager.js';
import { createElement } from '../../utils/helpers.js';

export class ProfileModal extends Modal {
	constructor(eventBus) {
		super(null, eventBus, {
			modalId: 'profile',
			title: 'USER PROFILE'
		});
		this.engine = getGameEngine();
	}

	renderContent() {
		const user = this.engine.state.user;
		const stats = this.engine.state.stats;

		// Calculate XP Progress
		// Next Level XP = (Level)^2 * 500
		const nextLevelStartXP = Math.pow(user.level, 2) * 500;
		const currentLevelStartXP = Math.pow(user.level - 1, 2) * 500; // if Level 1, 0.
		const levelRange = nextLevelStartXP - currentLevelStartXP;
		const xpInLevel = user.xp - currentLevelStartXP; // Approximation for visuals
		const progressPercent = Math.min(100, Math.max(0, (xpInLevel / levelRange) * 100));

		const container = createElement('div', { className: 'profile-container' }, [
			// Header: Avatar & Name
			createElement('div', { className: 'profile-header' }, [
				createElement('div', { className: 'profile-avatar' }, [
					createElement('img', {
						src: 'assets/images/host/alex-trebek-pixel.png', // Placeholder
						alt: 'Avatar'
					})
				]),
				createElement('div', { className: 'profile-identity' }, [
					createElement('h3', { className: 'profile-level' }, [`LEVEL ${user.level}`]),
					createElement('div', { className: 'profile-name-edit' }, [
						createElement('input', {
							type: 'text',
							value: user.name,
							id: 'profile-name-input',
							onchange: (e) => userManager.updateName(e.target.value)
						})
					]),
					createElement('div', { className: 'xp-bar-container' }, [
						createElement('div', {
							className: 'xp-bar-fill',
							style: `width: ${progressPercent}%`
						}),
						createElement('span', { className: 'xp-text' }, [`${Math.floor(user.xp)} / ${nextLevelStartXP} XP`])
					])
				])
			]),

			// Stats Grid
			createElement('div', { className: 'profile-stats-grid' }, [
				this.createStatCard('Games', stats.questionsAnswered), // Proxy for games now
				this.createStatCard('Accuracy', `${(stats.accuracy * 100).toFixed(1)}%`),
				this.createStatCard('Correct', stats.correctAnswers),
				this.createStatCard('Avg Time', `${(stats.averageTime / 1000).toFixed(1)}s`)
			]),

			// Achievements (Placeholder)
			createElement('div', { className: 'achievements-section' }, [
				createElement('h4', {}, ['ACHIEVEMENTS']),
				createElement('div', { className: 'achievements-list' },
					Array.from(stats.achievements).map(id =>
						createElement('span', { className: 'achievement-badge' }, [id])
					)
				)
			])
		]);

		return container;
	}

	createStatCard(label, value) {
		return createElement('div', { className: 'stat-card' }, [
			createElement('span', { className: 'stat-label' }, [label]),
			createElement('span', { className: 'stat-value' }, [String(value)])
		]);
	}
}
