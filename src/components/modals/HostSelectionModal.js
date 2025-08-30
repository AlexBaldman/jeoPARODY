import { hostManager } from '../../services/HostManager.js';
import { eventBus } from '../../utils/events.js';

class HostSelectionModal {
  constructor() {
    this.element = this.createModalElement();
    this.render();
    this.attachEventListeners();
  }

  createModalElement() {
    const modal = document.createElement('div');
    modal.className = 'modal-backdrop';
    modal.style.display = 'none';
    return modal;
  }

  render() {
    const hosts = hostManager.getAvailableHosts();
    const activeHostId = hostManager.getActiveHost().id;

    this.element.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h2>Select a Host</h2>
          <button class="modal-close" data-action="close">&times;</button>
        </div>
        <div class="host-selection-gallery">
          ${hosts.map(host => `
            <div class="host-card ${host.id === activeHostId ? 'active' : ''}" data-host-id="${host.id}">
              <img src="${host.images[0]}" alt="${host.name}">
              <h3>${host.name}</h3>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    this.element.addEventListener('click', (e) => {
      const actionTarget = e.target.closest('[data-action]');
      if (actionTarget && actionTarget.dataset.action === 'close') {
        this.hide();
        return;
      }

      const cardTarget = e.target.closest('.host-card');
      if (cardTarget) {
        const hostId = cardTarget.dataset.hostId;
        hostManager.setActiveHost(hostId);
        this.render(); // Re-render to show the new active host
      }

      // Close modal if backdrop is clicked
      if (e.target === this.element) {
        this.hide();
      }
    });
  }

  show() {
    this.render(); // Ensure it's up-to-date when shown
    this.element.style.display = 'flex';
  }

  hide() {
    this.element.style.display = 'none';
  }
}

export const hostSelectionModal = new HostSelectionModal();
document.body.appendChild(hostSelectionModal.element);
