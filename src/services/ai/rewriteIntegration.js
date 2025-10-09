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

export function installQuestionRewrite() {
	// When a question is loaded, compute persona rewrite for display only
	eventBus.on('game:question:loaded', async ({ question }) => {
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
			const qb = document.getElementById('questionBox');
			if (qb) {
				qb.dataset.canonical = question.question;
				qb.textContent = text || question.question;
			}
		} catch (e) {
			// Silent failure keeps UI responsive
		}
	});
}

export default installQuestionRewrite;

