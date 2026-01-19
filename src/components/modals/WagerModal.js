import Modal from '../Modal.js';
import { getGameEngine } from '../../core/GameEngine.js';
import { createElement } from '../../utils/helpers.js';

export class WagerModal extends Modal {
	constructor(eventBus) {
		super(null, eventBus, {
			modalId: 'wager',
			title: 'DAILY DOUBLE!',
			isClosable: false // Must wager to proceed
		});
		this.engine = getGameEngine();
		this.maxWager = 1000;

		// Listen for the trigger event
		this.eventBus.on('game:daily-double', (data) => {
			this.maxWager = data.maxWager;
			this.open();
		});
	}

	renderContent() {
		const container = createElement('div', { className: 'wager-container' });

		const infoText = createElement('p', { className: 'wager-info' },
			[`You can wager up to $${this.maxWager}`]
		);

		const inputGroup = createElement('div', { className: 'wager-input-group' });

		const input = createElement('input', {
			type: 'number',
			min: '5',
			max: this.maxWager.toString(),
			value: Math.min(1000, this.maxWager), // Default suggestion
			className: 'wager-input',
			id: 'wager-amount'
		});

		const submitBtn = createElement('button', {
			className: 'btn btn-neon wager-submit',
			textContent: 'BET IT!'
		});

		submitBtn.onclick = () => {
			const amount = parseInt(input.value, 10);
			if (!isNaN(amount) && amount >= 5 && amount <= this.maxWager) {
				this.engine.submitWager(amount);
				this.close();
			} else {
				// Shake animation or error
				input.classList.add('shake');
				setTimeout(() => input.classList.remove('shake'), 500);
			}
		};

		// Quick buttons
		const quickBtns = createElement('div', { className: 'wager-quick-btns' });
		const makeTrueDailyDouble = createElement('button', { className: 'btn btn-sm', textContent: 'TRUE DAILY DOUBLE' });
		makeTrueDailyDouble.onclick = () => {
			input.value = this.maxWager;
		};

		quickBtns.appendChild(makeTrueDailyDouble);

		inputGroup.appendChild(input);
		inputGroup.appendChild(submitBtn);

		container.appendChild(infoText);
		container.appendChild(quickBtns);
		container.appendChild(inputGroup);

		// Auto focus
		setTimeout(() => input.focus(), 100);

		return container;
	}
}
