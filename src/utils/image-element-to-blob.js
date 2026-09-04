/**
 * Convert an image element (or image URL) into a Blob suitable for img2img.
 * Fetch preserves the original bytes; canvas is a browser fallback for
 * already-rendered images when the source cannot be fetched directly.
 */
export async function getImageBlobFromElement(image, options = {}) {
  const fetchImpl = options.fetchImpl || globalThis.fetch?.bind(globalThis);
  const source =
    typeof image === 'string'
      ? image
      : image?.currentSrc || image?.src || '';

  if (!source) {
    throw new TypeError('An image element or source URL is required.');
  }

  if (fetchImpl) {
    try {
      const response = await fetchImpl(source);
      if (response.ok) return await response.blob();
    } catch {
      // Fall through to canvas for a rendered HTMLImageElement.
    }
  }

  if (
    typeof document === 'undefined' ||
    typeof image === 'string' ||
    !image?.naturalWidth ||
    !image?.naturalHeight
  ) {
    throw new Error('Unable to read the current image.');
  }

  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas is unavailable.');

  context.drawImage(image, 0, 0);
  return await new Promise((resolve, reject) => {
    try {
      canvas.toBlob(
        blob => (blob ? resolve(blob) : reject(new Error('Canvas produced no image data.'))),
        'image/png'
      );
    } catch (error) {
      reject(
        new Error(
          `Unable to export the image; it may be blocked by cross-origin policy: ${error.message}`
        )
      );
    }
  });
}
