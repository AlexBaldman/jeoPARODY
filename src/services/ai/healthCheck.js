/**
 * Lightweight AI health-check utility.
 * Uses relative URLs so it works in dev/preview and production.
 */
export async function checkAIHealth(healthURL = '/api/gemini/health') {
  try {
    const res = await fetch(healthURL, { method: 'GET' });
    if (!res.ok) return { ok: false, apiKeyConfigured: false };
    const data = await res.json().catch(() => ({}));
    const ok = data.status ? data.status === 'ok' : true;
    const apiKeyConfigured = !!data.apiKeyConfigured;
    return { ok, apiKeyConfigured };
  } catch (e) {
    return { ok: false, apiKeyConfigured: false };
  }
}

