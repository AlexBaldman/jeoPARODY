// Optional: hook for WebLLM/Transformers.js small model
// Currently a stub that returns null to indicate not installed

export async function tryLocalModel(prompt, options = {}) {
	// If WebLLM or Transformers.js is integrated, call here.
	// Keep token budget tiny, return short text.
	return null;
}

export default tryLocalModel;

