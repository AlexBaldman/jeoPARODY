import QwenImageService from '../../src/services/ai/QwenImageService.js';
import { getImageBlobFromElement } from '../../src/utils/image-element-to-blob.js';

describe('Qwen image editing', () => {
  test('posts the prompt and source image to the configured proxy', async () => {
    const fetchImpl = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ imageUrl: 'https://cdn.example.test/edited.png' })
    });
    const service = new QwenImageService({
      endpoint: '/api/qwen/image-edit',
      fetchImpl
    });
    const source = new Blob(['pixels'], { type: 'image/png' });

    await expect(service.editImage('add a purple hat', source)).resolves.toBe(
      'https://cdn.example.test/edited.png'
    );

    expect(fetchImpl).toHaveBeenCalledWith(
      '/api/qwen/image-edit',
      expect.objectContaining({ method: 'POST', body: expect.any(FormData) })
    );
    const form = fetchImpl.mock.calls[0][1].body;
    expect(form.get('prompt')).toBe('add a purple hat');
    expect(form.get('image')).toBeInstanceOf(Blob);
  });

  test('requires a proxy rather than exposing provider credentials', async () => {
    const service = new QwenImageService({ endpoint: '', fetchImpl: jest.fn() });
    await expect(
      service.editImage('edit this', new Blob(['x']))
    ).rejects.toThrow('VITE_QWEN_IMAGE_EDIT_ENDPOINT');
  });

  test('rejects transient or malformed proxy responses', async () => {
    const service = new QwenImageService({
      endpoint: '/api/qwen/image-edit',
      fetchImpl: jest.fn().mockResolvedValue({ ok: true, json: async () => ({}) })
    });
    await expect(
      service.editImage('edit this', new Blob(['x']))
    ).rejects.toThrow('durable image URL');
  });

  test('extracts the displayed image through fetch', async () => {
    const expected = new Blob(['image'], { type: 'image/webp' });
    const fetchImpl = jest.fn().mockResolvedValue({
      ok: true,
      blob: async () => expected
    });

    await expect(
      getImageBlobFromElement({ currentSrc: 'https://img.example.test/card.webp' }, { fetchImpl })
    ).resolves.toBe(expected);
  });

  test('reports unreadable sources when fetch and canvas are unavailable', async () => {
    const fetchImpl = jest.fn().mockRejectedValue(new Error('CORS'));
    await expect(
      getImageBlobFromElement('https://img.example.test/card.webp', { fetchImpl })
    ).rejects.toThrow('Unable to read');
  });
});
