import { HOSTS, DEFAULT_HOST } from './ai/host-personalities.js';
import { eventBus } from '../utils/events.js';

const STORAGE_KEY = 'jeopardish_active_host';

class HostManager {
  constructor() {
    this.hosts = HOSTS;
    this.activeHostId = this.loadActiveHost();

    eventBus.on('host:set', (e) => this.setActiveHost(e.detail.hostId));
  }

  /**
   * Loads the active host ID from localStorage, falling back to the default.
   * @returns {string} The active host ID.
   */
  loadActiveHost() {
    const storedHostId = localStorage.getItem(STORAGE_KEY);
    if (storedHostId && this.hosts[storedHostId]) {
      return storedHostId;
    }
    return DEFAULT_HOST;
  }

  /**
   * Sets the active host.
   * @param {string} hostId - The ID of the host to set as active.
   */
  setActiveHost(hostId) {
    if (!this.hosts[hostId]) {
      console.warn(`HostManager: Host with ID "${hostId}" not found. Falling back to default.`);
      this.activeHostId = DEFAULT_HOST;
    } else {
      this.activeHostId = hostId;
    }
    localStorage.setItem(STORAGE_KEY, this.activeHostId);
    console.log(`HostManager: Active host set to ${this.activeHostId}`);
    eventBus.emit('host:changed', { activeHost: this.getActiveHost() });
  }

  /**
   * Gets the full configuration object for the active host.
   * @returns {object} The active host's configuration.
   */
  getActiveHost() {
    return this.hosts[this.activeHostId];
  }

  /**
   * Gets a list of all available hosts.
   * @returns {object[]} An array of all host configuration objects.
   */
  getAvailableHosts() {
    return Object.values(this.hosts);
  }
}

// Export a singleton instance
export const hostManager = new HostManager();
