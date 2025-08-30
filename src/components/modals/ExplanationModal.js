import { eventBus } from '../../utils/events.js';

class ExplanationModal {
  constructor() {
    this.element = this.createModalElement();
    this.attachEventListeners();
    document.body.appendChild(this.element);

    eventBus.on('ai:explanation-received', (e) => this.show(e.detail.explanation));
  }

  createModalElement() {
    const modal = document.createElement('div');
    modal.className = 'modal-backdrop';
    modal.style.display = 'none';
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h2>Explanation</h2>
          <button class="modal-close" data-action="close">&times;</button>
        </div>
        <div class="modal-body">
          <p class="explanation-text"></p>
        </div>
      </div>
    `;
    return modal;
  }

  attachEventListeners() {
    this.element.addEventListener('click', (e) => {
      if (e.target === this.element || e.target.closest('[data-action="close"]')) {
        this.hide();
      }
    });
  }

  show(explanation) {
    this.element.querySelector('.explanation-text').textContent = explanation;
    this.element.style.display = 'flex';
  }

  hide() {
    this.element.style.display = 'none';
  }
}

export const explanationModal = new ExplanationModal();
