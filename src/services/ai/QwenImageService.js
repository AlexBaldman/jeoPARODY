const STORAGE_KEY = 'qwen_image_config';

const DEFAULT_CONFIG = {
  enabled: false,
  endpoint: '',
  editEndpoint: '',
  apiKey: '',
  requestTimeoutMs: 25000
};

function normalizeConfig(raw) {
  return {
    enabled: raw?.enabled === true,
    endpoint: String(raw?.endpoint || '').trim(),
    editEndpoint: String(raw?.editEndpoint || '').trim(),
    apiKey: String(raw?.apiKey || '').trim(),
    requestTimeoutMs: Number.isFinite(Number(raw?.requestTimeoutMs))
      ? Math.max(1000, Number(raw.requestTimeoutMs))
      : DEFAULT_CONFIG.requestTimeoutMs
  };
}

function readStoredConfig() {
  if (typeof localStorage === 'undefined') return { ...DEFAULT_CONFIG };
  try {
    return { ...DEFAULT_CONFIG, ...normalizeConfig(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')) };
  } catch (_) {
    return { ...DEFAULT_CONFIG };
  }
}

function readWindowConfig() {
  if (typeof window === 'undefined') return {};
  return normalizeConfig({
    enabled: window.QWEN_IMAGE_ENABLED === true,
    endpoint: window.QWEN_IMAGE_ENDPOINT || '',
    editEndpoint: window.QWEN_IMAGE_EDIT_ENDPOINT || '',
    apiKey: window.QWEN_IMAGE_API_KEY || ''
  });
}

function hashString(text) {
  let hash = 0;
  const input = String(text || '');
  for (let i = 0; i < input.length; i += 1) {
    hash = ((hash << 5) - hash) + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function buildPlaceholder(prompt, mode) {
  const safePrompt = String(prompt || 'PAO image').trim() || 'PAO image';
  const displayText = safePrompt.slice(0, 42);
  const hash = hashString(`${mode}:${safePrompt}`);
  const hue = hash % 360;
  const hue2 = (hue + 45) % 360;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="hsl(${hue},70%,58%)"/>
          <stop offset="100%" stop-color="hsl(${hue2},70%,44%)"/>
        </linearGradient>
      </defs>
      <rect width="512" height="512" fill="url(#bg)"/>
      <rect x="24" y="24" width="464" height="464" rx="20" fill="rgba(0,0,0,0.18)"/>
      <text x="256" y="228" text-anchor="middle" font-size="28" font-family="Arial, sans-serif" fill="#ffffff">
        ${mode === 'edit' ? 'Qwen Edit Fallback' : 'Qwen Image Fallback'}
      </text>
      <text x="256" y="276" text-anchor="middle" font-size="16" font-family="Arial, sans-serif" fill="#ffffff">
        ${displayText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
      </text>
    </svg>
  `;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export default class QwenImageService {
  constructor(overrides = {}) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...readStoredConfig(),
      ...readWindowConfig(),
      ...normalizeConfig(overrides)
    };
  }

  setConfig(nextConfig = {}) {
    this.config = {
      ...this.config,
      ...normalizeConfig({ ...this.config, ...nextConfig })
    };
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
    }
  }

  isEnabled() {
    return this.config.enabled === true;
  }

  isConfigured() {
    return this.isEnabled() && Boolean(this.config.endpoint);
  }

  isEditConfigured() {
    return this.isEnabled() && Boolean(this.config.editEndpoint || this.config.endpoint);
  }

  async generateImage(prompt) {
    const textPrompt = this.normalizePrompt(prompt);
    if (!this.isConfigured()) {
      return buildPlaceholder(textPrompt, 'generate');
    }

    try {
      const response = await this.fetchWithTimeout(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.authHeader()
        },
        body: JSON.stringify({
          prompt: textPrompt,
          model: 'Qwen/Qwen-Image'
        })
      });

      if (!response.ok) {
        throw new Error(`Qwen generate error: ${response.status}`);
      }

      const imageUrl = await this.extractImageUrl(response);
      return imageUrl || buildPlaceholder(textPrompt, 'generate');
    } catch (error) {
      console.warn('[QwenImageService] generateImage failed, using deterministic fallback:', error);
      return buildPlaceholder(textPrompt, 'generate');
    }
  }

  async editImage(prompt, sourceBlob) {
    const textPrompt = this.normalizePrompt(prompt);
    const hasSource = sourceBlob instanceof Blob;

    if (!hasSource) {
      return this.generateImage(textPrompt);
    }
    if (!this.isEditConfigured()) {
      return buildPlaceholder(textPrompt, 'edit');
    }

    const editEndpoint = this.config.editEndpoint || `${this.config.endpoint.replace(/\/$/, '')}/edit`;
    const formData = new FormData();
    formData.append('prompt', textPrompt);
    formData.append('image', sourceBlob, 'input.png');
    formData.append('model', 'Qwen/Qwen-Image-Edit');

    try {
      const response = await this.fetchWithTimeout(editEndpoint, {
        method: 'POST',
        headers: this.authHeader(),
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Qwen edit error: ${response.status}`);
      }

      const imageUrl = await this.extractImageUrl(response);
      return imageUrl || buildPlaceholder(textPrompt, 'edit');
    } catch (error) {
      console.warn('[QwenImageService] editImage failed, using deterministic fallback:', error);
      return buildPlaceholder(textPrompt, 'edit');
    }
  }

  normalizePrompt(prompt) {
    return String(prompt || '').replace(/\s+/g, ' ').trim().slice(0, 400);
  }

  authHeader() {
    return this.config.apiKey ? { Authorization: `Bearer ${this.config.apiKey}` } : {};
  }

  async fetchWithTimeout(url, init) {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeoutId = controller
      ? setTimeout(() => controller.abort(), this.config.requestTimeoutMs)
      : null;

    try {
      return await fetch(url, controller ? { ...init, signal: controller.signal } : init);
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  }

  async extractImageUrl(response) {
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const data = await response.json();
      return this.extractImageUrlFromJson(data);
    }

    if (contentType.startsWith('image/')) {
      const blob = await response.blob();
      if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
        return URL.createObjectURL(blob);
      }
      return buildPlaceholder('Image unavailable in this environment', 'generate');
    }

    try {
      const text = await response.text();
      const parsed = JSON.parse(text);
      return this.extractImageUrlFromJson(parsed);
    } catch (_) {
      return '';
    }
  }

  extractImageUrlFromJson(data) {
    if (!data || typeof data !== 'object') return '';
    if (typeof data.url === 'string' && data.url) return data.url;
    if (typeof data.image === 'string' && data.image) return data.image;
    if (typeof data.output === 'string' && data.output) return data.output;
    if (Array.isArray(data.output) && typeof data.output[0] === 'string') return data.output[0];
    if (typeof data.data?.[0]?.url === 'string') return data.data[0].url;
    return '';
  }
}
