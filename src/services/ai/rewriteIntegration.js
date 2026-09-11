import { eventBus } from '../../utils/events.js';
import AIConfig from './config.js';
import { rewriteWithPolicy } from './rewrite.js';
import Providers from '../ai-providers.js';
const { gemini, local } = Providers;

function getCoreFacts(question) {
	return {
		category: question.category,
		value: question.value,
		answer: question.answer
	};
}

export function installQuestionRewrite({ isCurrent = () => true } = {}) {
	let generation = 0;
	// When a question is loaded, compute persona rewrite for display only
	return eventBus.on('question:loaded', async ({ question }) => {
		const request = ++generation;
		try {
			if (!question || !question.question) return;
			const providerChain = [];
			// Try online low-cost first, then local style filter
			if (gemini?.isReady?.()) providerChain.push(gemini);
			if (AIConfig.featureFlags.useLocalModel) providerChain.push(local);
			const { text } = await rewriteWithPolicy({
				providerChain,
				eventType: 'question:new',
				personaId: AIConfig.personaId,
				canonical: question.question,
				coreFacts: getCoreFacts(question)
			});
			if (request !== generation || !isCurrent(question)) return;
			const qb = document.getElementById('questionBox');
			if (qb) {
				qb.dataset.canonical = question.question;
				qb.textContent = text || question.question;
			}
		} catch (_) {
			// Silent failure keeps UI responsive
		}
	});
}

export default installQuestionRewrite;

