import Modal from '../Modal.js';
import { leaderboardManager } from '../../services/LeaderboardManager.js';
import { createElement } from '../../utils/helpers.js';

export class LeaderboardModal extends Modal {
	constructor(eventBus) {
		super(null, eventBus, {
			modalId: 'leaderboard',
			title: 'HALL OF FAME'
		});
	}

	renderContent() {
		const scores = leaderboardManager.getTopScores(10);

		const list = createElement('div', { className: 'leaderboard-list' },
			scores.map((entry, index) => {
				const isTop3 = index < 3;
				const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;

				return createElement('div', { className: `leaderboard-entry ${isTop3 ? 'top-rank' : ''}` }, [
					createElement('span', { className: 'rank' }, [medal]),
					createElement('span', { className: 'player-name' }, [entry.name]),
					createElement('span', { className: 'score-val' }, [entry.score.toLocaleString()])
				]);
			})
		);

		return list;
	}
}
