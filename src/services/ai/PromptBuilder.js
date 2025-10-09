import AIConfig from './config.js';

function sanitize(value) {
	if (value == null) return '';
	return String(value).replace(/[<>]/g, '');
}

export class PromptBuilder {
	constructor(persona) {
		this.persona = persona;
	}

	buildSystemPrompt() {
		const { systemPrompt, style } = this.persona;
		const rules = [
			`Tone: ${style?.tone || 'brief, witty, professional'}`,
			`Length: ${style?.length || 'brief'}`,
			...(style?.constraints || [])
		];
		return `${systemPrompt}\n\nStyle rules:\n- ${rules.join('\n- ')}`;
	}

	buildEventPrompt(event, context) {
		const seed = AIConfig.seed;
		const studyMode = AIConfig.featureFlags.studyMode;
		const base = { seed, studyMode };
		switch (event) {
			case 'game:start':
				return `${JSON.stringify(base)}\nGame starting. Player: ${sanitize(context.playerName || 'Player')} Score: ${sanitize(context.score || 0)}.`;
			case 'question:new':
				return `${JSON.stringify(base)}\nNew question in category ${sanitize(context.category)} for $${sanitize(context.value)}. Question: ${sanitize(context.question)}.`;
			case 'answer:correct':
				return `${JSON.stringify(base)}\nUser answered correctly: "${sanitize(context.userAnswer)}". Correct answer: "${sanitize(context.answer)}".`;
			case 'answer:incorrect':
				return `${JSON.stringify(base)}\nUser answered incorrectly: "${sanitize(context.userAnswer)}". Correct answer: "${sanitize(context.answer)}".`;
			case 'streak:milestone':
				return `${JSON.stringify(base)}\nStreak milestone reached: ${sanitize(context.streak)}.`;
			case 'study:explain':
				return `${JSON.stringify(base)}\nExplain the question and answer with a short, educational note.`;
			default:
				return `${JSON.stringify(base)}\nGeneral host line.`;
		}
	}

	compose(event, context) {
		const system = this.buildSystemPrompt();
		const eventPrompt = this.buildEventPrompt(event, context);
		const safety = [
			'Never reveal future answers prematurely.',
			'Preserve named entities and numeric facts; do not change semantics.',
			'Redact PII and do not reproduce copyrighted media content.'
		].join('\n');
		return `${system}\n\n${eventPrompt}\n\nSafety rules:\n${safety}`;
	}
}

export default PromptBuilder;

