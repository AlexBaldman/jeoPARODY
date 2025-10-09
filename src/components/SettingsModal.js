import Modal from './Modal.js';
import AIConfig from '../services/ai/config.js';
import { createElement } from '../utils/helpers.js';

export default class SettingsModal extends Modal {
	constructor(store, eventBus) {
		super(store, eventBus, { modalId: 'settings-modal', title: 'AI Settings' });
	}

	renderContent() {
		const flags = AIConfig.featureFlags;
		const container = createElement('div', { className: 'modal-body' });
		container.appendChild(this.sectionProvider());
		container.appendChild(this.sectionKeys());
		container.appendChild(this.sectionFlags(flags));
		container.appendChild(this.sectionDeterminism());
		container.appendChild(this.sectionTest());
		return container;
	}

	sectionProvider() {
		const wrap = document.createElement('div');
		wrap.innerHTML = `
			<h3 style="margin:0.5rem 0">Provider order</h3>
			<input id="prov-order" type="text" style="width:100%" placeholder="gemini,claude,openrouter,local,fallback" value="${AIConfig.providerOrder.join(',')}">
			<small>Comma-separated. Unknown entries ignored.</small>
		`;
		setTimeout(() => {
			const input = wrap.querySelector('#prov-order');
			input?.addEventListener('change', () => {
				AIConfig.providerOrder = input.value.split(',').map(s => s.trim()).filter(Boolean);
			});
		}, 0);
		return wrap;
	}

	sectionKeys() {
		const wrap = document.createElement('div');
		wrap.innerHTML = `
			<h3 style="margin:0.5rem 0">API Keys</h3>
			<label>Gemini <input id="gemini-key" type="password" style="width:100%" value="${localStorage.getItem('gemini_api_key') || ''}"></label>
			<label style="margin-top:6px;display:block">Claude <input id="claude-key" type="password" style="width:100%" value="${localStorage.getItem('claude_api_key') || ''}"></label>
			<div style="margin-top:6px;display:flex;gap:8px;justify-content:flex-end">
				<button id="save-keys">Save</button>
				<button id="clear-keys">Clear</button>
			</div>
		`;
		setTimeout(() => {
			wrap.querySelector('#save-keys')?.addEventListener('click', () => {
				const g = wrap.querySelector('#gemini-key').value.trim();
				const c = wrap.querySelector('#claude-key').value.trim();
				if (g) localStorage.setItem('gemini_api_key', g);
				if (c) localStorage.setItem('claude_api_key', c);
			});
			wrap.querySelector('#clear-keys')?.addEventListener('click', () => {
				localStorage.removeItem('gemini_api_key');
				localStorage.removeItem('claude_api_key');
				wrap.querySelector('#gemini-key').value = '';
				wrap.querySelector('#claude-key').value = '';
			});
		}, 0);
		return wrap;
	}

	sectionFlags(flags) {
		const wrap = document.createElement('div');
		wrap.innerHTML = `
			<h3 style="margin:0.5rem 0">Feature flags</h3>
			<label><input id="ff-rewrite" type="checkbox" ${flags.personaRewrite ? 'checked' : ''}> Persona rewrite</label><br>
			<label><input id="ff-local" type="checkbox" ${flags.useLocalModel ? 'checked' : ''}> On-device local model (lightweight)</label><br>
			<label><input id="ff-study" type="checkbox" ${flags.studyMode ? 'checked' : ''}> Study mode (longer answers)</label><br>
			<label><input id="ff-console" type="checkbox" ${flags.aiConsole ? 'checked' : ''}> AI Console overlay</label>
		`;
		setTimeout(() => {
			['ff-rewrite','ff-local','ff-study','ff-console'].forEach(id => {
				wrap.querySelector('#'+id)?.addEventListener('change', () => {
					AIConfig.featureFlags = {
						personaRewrite: wrap.querySelector('#ff-rewrite').checked,
						useLocalModel: wrap.querySelector('#ff-local').checked,
						studyMode: wrap.querySelector('#ff-study').checked,
						aiConsole: wrap.querySelector('#ff-console').checked
					};
				});
			});
		}, 0);
		return wrap;
	}

	sectionDeterminism() {
		const wrap = document.createElement('div');
		wrap.innerHTML = `
			<h3 style="margin:0.5rem 0">Determinism</h3>
			<label>Temperature <input id="ai-temp" type="number" min="0" max="1" step="0.05" value="${AIConfig.temperature}"></label>
			<label style="margin-left:8px">Seed <input id="ai-seed" type="number" step="1" value="${AIConfig.seed}"></label>
		`;
		setTimeout(() => {
			wrap.querySelector('#ai-temp')?.addEventListener('change', (e) => AIConfig.temperature = e.target.value);
			wrap.querySelector('#ai-seed')?.addEventListener('change', (e) => AIConfig.seed = e.target.value);
		}, 0);
		return wrap;
	}

	sectionTest() {
		const wrap = document.createElement('div');
		wrap.innerHTML = `
			<h3 style="margin:0.5rem 0">Diagnostics</h3>
			<textarea id="test-prompt" rows="3" style="width:100%" placeholder="Type a test prompt..."></textarea>
			<button id="run-test" style="margin-top:6px">Run test</button>
			<pre id="test-output" style="white-space:pre-wrap;background:#111;padding:6px;margin-top:6px;max-height:140px;overflow:auto"></pre>
		`;
		setTimeout(() => {
			wrap.querySelector('#run-test')?.addEventListener('click', async () => {
				const prompt = wrap.querySelector('#test-prompt').value;
				wrap.querySelector('#test-output').textContent = 'Running...';
				try {
					const { aiService } = await import('../services/ai.js');
					const text = await aiService.generate(prompt, { maxTokens: 60 });
					wrap.querySelector('#test-output').textContent = text ?? '[no response]';
				} catch (e) {
					wrap.querySelector('#test-output').textContent = String(e);
				}
			});
		}, 0);
		return wrap;
	}
}

