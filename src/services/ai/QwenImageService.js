/**
 * Qwen image generation/editing adapter.
 *
 * Image-edit requests are sent to an application-owned proxy so provider
 * credentials never enter the browser bundle.
 */
class QwenImageService {
  constructor(options = {}) {
    this.endpoint = options.endpoint || this.getConfiguredEndpoint();
    this.fetchImpl = options.fetchImpl || globalThis.fetch?.bind(globalThis);
    this.initialized = false;
  }

  getConfiguredEndpoint() {
    try {
      return import.meta.env?.VITE_QWEN_IMAGE_EDIT_ENDPOINT || '';
    } catch {
      return '';
    }
  }

  async initialize() {
    this.initialized = Boolean(this.endpoint && this.fetchImpl);
    return this.initialized;
  }

  /**
   * Text-to-image placeholder retained for the existing PAO flow.
   */
  async generateImage(prompt) {
    const placeholderUrl =
      `https://via.placeholder.com/150x150/4a90e2/ffffff?text=${encodeURIComponent(
        String(prompt).substring(0, 10)
      )}`;
    return placeholderUrl;
  }

  /**
   * Edit an image using an application-owned Qwen proxy.
   *
   * The proxy must accept multipart fields "prompt" and "image" and return
   * JSON containing a durable URL in url, imageUrl, output[0], or data[0].url.
   */
  async editImage(prompt, sourceBlob) {
    if (!String(prompt || '').trim()) {
      throw new TypeError('An image-edit prompt is required.');
    }
    if (!(sourceBlob instanceof Blob)) {
      throw new TypeError('sourceBlob must be a Blob.');
    }
    if (!this.endpoint) {
      throw new Error(
        'Qwen image editing is not configured. Set VITE_QWEN_IMAGE_EDIT_ENDPOINT to an application-owned proxy.'
      );
    }
    if (!this.fetchImpl) {
      throw new Error('Fetch is unavailable in this environment.');
    }

    const payload = new FormData();
    payload.append('prompt', String(prompt).trim());
    payload.append('image', sourceBlob, sourceBlob.name || 'source-image.png');

    const response = await this.fetchImpl(this.endpoint, {
      method: 'POST',
      body: payload
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new Error(
        `Qwen image edit failed (${response.status})${detail ? `: ${detail}` : ''}`
      );
    }

    const result = await response.json();
    const imageUrl =
      result?.url ||
      result?.imageUrl ||
      result?.output?.[0] ||
      result?.data?.[0]?.url;

    if (!imageUrl || typeof imageUrl !== 'string') {
      throw new Error('Qwen image-edit proxy did not return a durable image URL.');
    }

    return imageUrl;
  }

  isAvailable() {
    return this.initialized || Boolean(this.endpoint && this.fetchImpl);
  }
}

export default QwenImageService;
