export class Waveform {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.progress = 0;
    this.frame = null;
    this.draw = this.draw.bind(this);
    this.resizeObserver = window.ResizeObserver ? new window.ResizeObserver(this.draw) : null;
    this.resizeObserver?.observe(canvas);
    if (!this.resizeObserver) window.addEventListener('resize', this.draw);
  }

  setProgress(progress) {
    this.progress = Math.max(0, Math.min(1, progress));
    this.draw();
  }

  animate(durationMs) {
    cancelAnimationFrame(this.frame);
    const start = performance.now();
    const tick = now => {
      this.setProgress((now - start) / durationMs);
      if (this.progress < 1) this.frame = requestAnimationFrame(tick);
    };
    this.frame = requestAnimationFrame(tick);
  }

  draw() {
    const ratio = window.devicePixelRatio || 1;
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    const accent = window.getComputedStyle(this.canvas)
      .getPropertyValue('--accent-2')
      .trim() || '#00f0d0';
    this.canvas.width = width * ratio;
    this.canvas.height = height * ratio;
    const context = this.context;
    context.scale(ratio, ratio);
    context.clearRect(0, 0, width, height);
    context.lineWidth = 2;

    for (let x = 0; x < width; x += 4) {
      const envelope = 0.25 + 0.75 * Math.sin(Math.PI * x / width) ** 1.6;
      const amplitude = (
        Math.sin(x * 0.17)
        + 0.5 * Math.sin(x * 0.53)
        + 0.2 * Math.sin(x * 1.7)
      ) * height * 0.18 * envelope;
      context.strokeStyle = x / width <= this.progress ? accent : 'rgba(255, 255, 255, 0.16)';
      context.beginPath();
      context.moveTo(x, height / 2 - amplitude);
      context.lineTo(x, height / 2 + amplitude);
      context.stroke();
    }
  }

  destroy() {
    cancelAnimationFrame(this.frame);
    this.resizeObserver?.disconnect();
    if (!this.resizeObserver) window.removeEventListener('resize', this.draw);
  }
}
