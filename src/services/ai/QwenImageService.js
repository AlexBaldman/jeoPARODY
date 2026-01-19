// QwenImageService.js - functional client with fetch and placeholder fallback

export default class QwenImageService {
  constructor() {
    const saved = JSON.parse(localStorage.getItem('qwen_image_config') || '{}');
    this.endpoint = saved.endpoint || (window.QWEN_IMAGE_ENDPOINT || '');
    this.apiKey = saved.apiKey || (window.QWEN_IMAGE_API_KEY || '');
  }

  setConfig({ endpoint, apiKey }) {
    this.endpoint = endpoint || '';
    this.apiKey = apiKey || '';
    localStorage.setItem('qwen_image_config', JSON.stringify({ endpoint: this.endpoint, apiKey: this.apiKey }));
  }

  /**
   * Generate an image from text prompt
   * @param {string} prompt 
   * @returns {Promise<string>} Image URL
   */
  async generateImage(prompt) {
    try {
      if (this.endpoint) {
        const res = await fetch(this.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {})
          },
          body: JSON.stringify({ prompt })
        });
        if (!res.ok) throw new Error(`Qwen endpoint error: ${res.status}`);
        const data = await res.json();
        // Expected data.url or data.image
        return data.url || data.image || '';
      }
      // Fallback: placeholder image (free)
      const encoded = encodeURIComponent(prompt.substring(0, 24));
      return `https://dummyimage.com/512x512/eeeeee/333333&text=${encoded}`;
    } catch (e) {
      console.warn('Qwen generateImage failed, using placeholder:', e.message);
      const encoded = encodeURIComponent(prompt.substring(0, 24));
      return `https://dummyimage.com/512x512/eeeeee/333333&text=${encoded}`;
    }
  }

  /**
   * Edit an existing image (img2img)
   * @param {string} prompt 
   * @param {Blob} sourceBlob 
   * @returns {Promise<string>} Image URL
   */
  async editImage(prompt, sourceBlob) {
    try {
      if (this.endpoint) {
        const formData = new FormData();
        formData.append('prompt', prompt);
        formData.append('image', sourceBlob, 'input.png');

        const res = await fetch(this.endpoint + '/edit', { // Assuming /edit endpoint
          method: 'POST',
          headers: {
            ...(this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {})
          },
          body: formData
        });
        if (!res.ok) throw new Error(`Qwen edit error: ${res.status}`);
        const data = await res.json();
        return data.url || data.image || '';
      }
      return this.generateImage(prompt + ' (edited)');
    } catch (e) {
      console.warn('Qwen editImage failed:', e.message);
      return this.generateImage(prompt);
    }
  }
}