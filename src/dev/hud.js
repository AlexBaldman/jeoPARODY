/**
 * Dev HUD: FPS + event counters (enabled when localStorage.dev_hud === '1')
 */
export function attachDevHUD({ eventBus, app }) {
  if (typeof document === 'undefined') return;

  const enabled = typeof localStorage !== 'undefined' && localStorage.getItem('dev_hud') === '1';
  if (!enabled) return;

  const wrap = document.createElement('div');
  wrap.style.cssText = [
    'position:fixed', 'left:12px', 'top:12px', 'z-index:20000', 'font:12px/1.2 monospace',
    'color:#fff', 'background:rgba(0,0,0,0.6)', 'border:1px solid rgba(255,215,0,0.6)',
    'border-radius:6px', 'padding:8px 10px', 'box-shadow:0 8px 24px rgba(0,0,0,0.35)'
  ].join(';');
  wrap.innerHTML = `
    <div><strong>Dev HUD</strong> <span style="opacity:.7">(local only)</span></div>
    <div>FPS: <span id="hud-fps">0</span></div>
    <div>Events: <span id="hud-evts">0</span></div>
    <div>Score: <span id="hud-score">-</span>, Streak: <span id="hud-streak">-</span></div>
  `;
  document.body.appendChild(wrap);

  // FPS meter
  const fpsEl = wrap.querySelector('#hud-fps');
  let frames = 0; let last = performance.now();
  const tick = (t) => {
    frames++;
    if (t - last >= 1000) {
      const fps = Math.round((frames * 1000) / (t - last));
      fpsEl.textContent = String(fps);
      frames = 0; last = t;
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  // Event counters
  const evtsEl = wrap.querySelector('#hud-evts');
  let evts = 0; const bump = () => { evts++; evtsEl.textContent = String(evts); };
  ['game:started','game:question:loaded','game:answer:revealed','answer:evaluated']
    .forEach(e => eventBus.on(e, bump));

  // Score snapshot
  const scoreEl = wrap.querySelector('#hud-score');
  const streakEl = wrap.querySelector('#hud-streak');
  eventBus.on('answer:evaluated', () => {
    try {
      const s = app?.gameEngine?.state?.score || {};
      scoreEl.textContent = String(s.current ?? '-');
      streakEl.textContent = String(s.streak ?? '-');
    } catch (_) {}
  });
}

