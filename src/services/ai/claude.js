class ClaudeProvider {
    constructor() {
        this.id = 'claude';
        this.isInitialized = false;
        this._circuitOpenUntil = 0;
    }

    async init() { return false; }
    isReady() { return false; }
    openCircuit(durationMs = 30000) { this._circuitOpenUntil = Date.now() + durationMs; }

    async generate() {
        console.warn('Claude provider is not configured. Route provider credentials through a server-side proxy before enabling it.');
        return null;
    }
}

export const claude = new ClaudeProvider();
