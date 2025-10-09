import AIConfig from './config.js';

export function installAIConsole() {
	if (typeof window === 'undefined') return;
	if (!AIConfig.featureFlags.aiConsole) return;
	if (window.__aiConsole) return;
	const store = [];
	window.__aiConsole = store;

	const panel = document.createElement('div');
	panel.className = 'ai-console-overlay';
	panel.style.cssText = `
		position: fixed;
		bottom: 10px;
		right: 10px;
		width: 360px;
		max-height: 50vh;
		background: rgba(0,0,0,0.85);
		border: 1px solid #444;
		border-radius: 8px;
		color: #e8e8e8;
		font: 12px/1.4 system-ui, sans-serif;
		z-index: 99999;
		overflow: hidden;
	`;
	panel.innerHTML = `
		<div style="display:flex;align-items:center;justify-content:space-between;padding:6px 8px;background:#111;border-bottom:1px solid #333;">
			<strong>AI Console</strong>
			<button id="ai-console-close" style="background:none;border:none;color:#aaa;cursor:pointer">×</button>
		</div>
		<div id="ai-console-body" style="padding:8px;overflow:auto;max-height:40vh"></div>
	`;
	document.body.appendChild(panel);

	panel.querySelector('#ai-console-close').onclick = () => panel.remove();

	const body = panel.querySelector('#ai-console-body');
	const render = () => {
		body.innerHTML = store.slice(-20).reverse().map((e) => `
			<div style="margin-bottom:8px;border-bottom:1px dashed #333;padding-bottom:6px;">
				<div style="color:#aaa">${new Date(e.ts).toLocaleTimeString()} • ${e.provider}</div>
				<div style="white-space:pre-wrap;color:#7fbfff">${truncate(e.prompt, 180)}</div>
				<div style="white-space:pre-wrap;color:#d4ffd6;margin-top:4px">${truncate(String(e.response || ''), 180)}</div>
			</div>`).join('');
	};

	const origPush = store.push.bind(store);
	store.push = (...args) => { const r = origPush(...args); render(); return r; };
	render();
}

function truncate(str, n) { return str.length > n ? str.slice(0, n) + '…' : str; }

export default installAIConsole;

