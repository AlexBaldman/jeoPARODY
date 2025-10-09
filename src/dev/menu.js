/**
 * Dev Menu: quick toggles for HUD, themes, audio, and changelog (dev only)
 */
export function attachDevMenu({ app }) {
  if (typeof document === 'undefined') return;
  const isLocal = ['localhost','127.0.0.1'].includes(window.location.hostname);
  if (!isLocal) return;

  const el = document.createElement('div');
  el.className = 'dev-menu';
  el.innerHTML = `
    <div class="dev-menu__title">Dev Menu</div>
    <div class="dev-menu__row">
      <label>HUD</label>
      <button data-action="hud-toggle" class="btn">Toggle</button>
    </div>
    <div class="dev-menu__row">
      <label>Scoreboard</label>
      <select data-ref="sb-theme">
        <option value="basketball">basketball</option>
        <option value="classic">classic</option>
        <option value="neon">neon</option>
      </select>
      <button data-action="sb-apply" class="btn">Apply</button>
    </div>
    <div class="dev-menu__row">
      <label>Speech Bubble</label>
      <select data-ref="bubble-style">
        <option value="default">default</option>
        <option value="comic">comic</option>
        <option value="thought">thought</option>
        <option value="retro">retro</option>
        <option value="jeopardy">jeopardy</option>
      </select>
      <button data-action="bubble-apply" class="btn">Apply</button>
    </div>
    <div class="dev-menu__row">
      <label>Audio</label>
      <button data-action="audio-start" class="btn">Start</button>
    </div>
    <div class="dev-menu__row">
      <label>Changelog</label>
      <button data-action="changelog" class="btn">Open</button>
    </div>
  `;
  document.body.appendChild(el);

  const $ = (sel) => el.querySelector(sel);
  const on = (action, fn) => el.querySelector(`[data-action="${action}"]`)?.addEventListener('click', fn);

  // Initialize selects from localStorage
  try {
    const sb = localStorage.getItem('scoreboard_theme') || 'basketball';
    $('[data-ref="sb-theme"]').value = sb;
    const bub = localStorage.getItem('speech_bubble_style') || 'default';
    $('[data-ref="bubble-style"]').value = bub;
  } catch(_) {}

  on('hud-toggle', () => {
    try {
      const v = localStorage.getItem('dev_hud') === '1' ? null : '1';
      if (v) localStorage.setItem('dev_hud', v); else localStorage.removeItem('dev_hud');
      location.reload();
    } catch(_) {}
  });

  on('sb-apply', () => {
    const val = $('[data-ref="sb-theme"]').value;
    try { localStorage.setItem('scoreboard_theme', val); } catch(_) {}
    // Try live update: adjust class on element; if not present, reload
    const sb = document.querySelector('.scoreboard');
    if (sb) {
      sb.classList.forEach(c => { if (c.startsWith('scoreboard--')) sb.classList.remove(c); });
      sb.classList.add(`scoreboard--${val}`);
    } else {
      location.reload();
    }
  });

  on('bubble-apply', () => {
    const val = $('[data-ref="bubble-style"]').value;
    try { localStorage.setItem('speech_bubble_style', val); } catch(_) {}
    // Try live update using cycling zones if present; else reload
    const root = document.querySelector('.speech-bubble, .speechBubble');
    if (!root) { location.reload(); return; }
    // best-effort: toggle classes
    root.classList.forEach(c => { if (c.startsWith('speech-bubble-') && c !== 'speech-bubble') root.classList.remove(c); });
    root.classList.add(`speech-bubble-${val}`);
  });

  on('audio-start', async () => {
    try { await app?.soundManager?.init(); } catch(_) {}
  });

  on('changelog', () => {
    const btn = document.querySelector('.dev-changelog-btn');
    if (btn) btn.click(); else window.open('CHANGELOG.md', '_blank');
  });
}

