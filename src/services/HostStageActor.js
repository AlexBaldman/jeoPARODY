import { eventBus } from '../utils/events.js';

const DEFAULTS = {
  edgePadding: 12,
  bubbleTailPadding: 24,
  moveDurationMs: 900,
  beatMs: 420
};

class HostStageActor {
  constructor(options = {}) {
    this.options = { ...DEFAULTS, ...options };
    this.host = null;
    this.bubble = null;
    this.footer = null;
    this.trigger = null;
    this.resizeObserver = null;
    this.sequence = 0;
    this.isAnimating = false;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return this;

    this.host = document.querySelector('.host-container');
    this.bubble = document.getElementById('speechBubble');
    this.footer = document.querySelector('.sticky-footer');
    this.trigger = document.getElementById('host-anim-trigger');

    if (!this.host || !this.bubble || !this.footer) {
      console.warn('[HostStageActor] Stage surfaces unavailable.');
      return this;
    }

    this.host.dataset.stageActor = 'host';
    this.footer.dataset.stageRail = 'footer';

    this.host.addEventListener('transitionrun', () => this.syncBubbleTail());
    this.host.addEventListener('transitionend', () => this.syncBubbleTail());
    this.trigger?.addEventListener('click', () => this.playDemoSequence());

    window.addEventListener('resize', () => this.layout());
    window.visualViewport?.addEventListener('resize', () => this.layout());

    if ('ResizeObserver' in window) {
      this.resizeObserver = new window.ResizeObserver(() => this.layout());
      this.resizeObserver.observe(this.host);
      this.resizeObserver.observe(this.bubble);
      this.resizeObserver.observe(this.footer);
    }

    eventBus.on('game:started', () => this.moveTo(0.18));
    eventBus.on('answer:correct', () => this.surprisePop());
    eventBus.on('answer:incorrect', () => this.duckBehindRail());

    this.layout();
    this.initialized = true;
    return this;
  }

  layout() {
    if (!this.host || !this.bubble) return;

    const viewportWidth = window.visualViewport?.width || window.innerWidth;
    const hostWidth = this.host.getBoundingClientRect().width;
    const currentRatio = Number(this.host.dataset.stageX || 0.12);
    const x = this.clampX(viewportWidth * currentRatio - hostWidth / 2);

    this.host.style.left = `${x}px`;
    this.syncBubbleTail();
  }

  clampX(value) {
    const viewportWidth = window.visualViewport?.width || window.innerWidth;
    const hostWidth = this.host?.getBoundingClientRect().width || 0;
    const min = this.options.edgePadding;
    const max = Math.max(min, viewportWidth - hostWidth - this.options.edgePadding);
    return Math.min(max, Math.max(min, value));
  }

  moveTo(ratio, { durationMs = this.options.moveDurationMs, facing } = {}) {
    if (!this.host) return;

    const normalized = Math.min(0.92, Math.max(0.08, ratio));
    this.host.dataset.stageX = String(normalized);
    this.host.style.setProperty('--host-move-duration', `${durationMs}ms`);

    if (facing) this.host.dataset.facing = facing;

    const viewportWidth = window.visualViewport?.width || window.innerWidth;
    const hostWidth = this.host.getBoundingClientRect().width;
    this.host.style.left = `${this.clampX(viewportWidth * normalized - hostWidth / 2)}px`;

    this.trackTailDuring(durationMs);
  }

  syncBubbleTail() {
    if (!this.host || !this.bubble) return;

    const hostRect = this.host.getBoundingClientRect();
    const bubbleRect = this.bubble.getBoundingClientRect();
    const desired = hostRect.left + hostRect.width / 2 - bubbleRect.left;
    const min = this.options.bubbleTailPadding;
    const max = Math.max(min, bubbleRect.width - this.options.bubbleTailPadding);
    const clamped = Math.min(max, Math.max(min, desired));

    this.bubble.style.setProperty('--sbub-tail-left', `${clamped}px`);
  }

  trackTailDuring(durationMs) {
    const startedAt = performance.now();
    const tick = now => {
      this.syncBubbleTail();
      if (now - startedAt < durationMs + 80) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  async personalityChange(updateImage) {
    const applyImage = typeof updateImage === 'function' ? updateImage : () => {};
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (!this.host || reducedMotion || typeof this.host.animate !== 'function') {
      applyImage();
      return;
    }

    const animation = this.host.animate([
      { scale: 1 },
      { scale: 0.9, offset: 1 / 6 },
      { scale: 1 }
    ], {
      duration: 600,
      easing: 'ease-in-out'
    });

    await this.wait(100);
    applyImage();

    try {
      await animation.finished;
    } catch (error) {
      if (error.name !== 'AbortError') throw error;
    }
  }

  async fakeStairs() {
    if (this.isAnimating || !this.host) return;
    this.isAnimating = true;
    let animation;

    try {
      const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      if (reducedMotion || typeof this.host.animate !== 'function') {
        await this.wait(this.options.beatMs);
        return;
      }

      animation = this.host.animate([
        { translate: '0 0' },
        { translate: '0 18%', offset: 0.25 },
        { translate: '0 18%', offset: 0.36 },
        { translate: '0 42%', offset: 0.5 },
        { translate: '0 42%', offset: 0.61 },
        { translate: '0 70%', offset: 0.75 },
        { translate: '0 70%', offset: 0.86 },
        { translate: '0 110%' }
      ], {
        duration: 1400,
        easing: 'ease-in-out',
        fill: 'forwards'
      });

      this.trackTailDuring(1400);
      await animation.finished;
      await this.wait(this.options.beatMs);
    } catch (error) {
      if (error.name !== 'AbortError') throw error;
    } finally {
      animation?.cancel();
      this.syncBubbleTail();
      this.isAnimating = false;
    }
  }

  async pace() {
    if (this.isAnimating) return;
    this.isAnimating = true;
    try {
      this.host.classList.add('host-stage--pacing');
      this.moveTo(0.22, { facing: 'right' });
      await this.wait(920);
      this.moveTo(0.78, { facing: 'left' });
      await this.wait(920);
      this.moveTo(0.42, { facing: 'right' });
      await this.wait(760);
    } finally {
      this.host.classList.remove('host-stage--pacing');
      this.isAnimating = false;
    }
  }

  async duckBehindRail() {
    if (this.isAnimating || !this.host) return;
    this.isAnimating = true;
    try {
      this.host.classList.add('host-stage--descending');
      await this.wait(900);
      this.host.classList.add('host-stage--hidden');
      await this.wait(this.options.beatMs);
      this.host.classList.remove('host-stage--descending', 'host-stage--hidden');
      this.trackTailDuring(700);
    } finally {
      this.isAnimating = false;
    }
  }

  async surprisePop() {
    if (this.isAnimating || !this.host) return;
    this.isAnimating = true;
    try {
      this.host.classList.add('host-stage--descending');
      await this.wait(760);
      this.host.classList.add('host-stage--hidden');
      await this.wait(this.options.beatMs + 180);
      this.moveTo(Math.random() > 0.5 ? 0.28 : 0.72, { durationMs: 0 });
      this.host.classList.remove('host-stage--descending', 'host-stage--hidden');
      this.host.classList.add('host-stage--surprise');
      this.trackTailDuring(760);
      await this.wait(760);
      this.host.classList.remove('host-stage--surprise');
    } finally {
      this.isAnimating = false;
    }
  }

  async playDemoSequence() {
    this.sequence = (this.sequence + 1) % 3;
    if (this.sequence === 0) return this.pace();
    if (this.sequence === 1) return this.duckBehindRail();
    return this.surprisePop();
  }

  wait(ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }
}

let instance = null;

export function getHostStageActor() {
  if (!instance) instance = new HostStageActor();
  return instance;
}

export default HostStageActor;
