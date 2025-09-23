import ConnectedComponent from '../base/ConnectedComponent.js';
import { createElement } from '../utils/helpers.js';

/**
 * Base Modal component
 * Provides common modal functionality and structure
 */
class Modal extends ConnectedComponent {
    constructor(store, eventBus, options = {}) {
        super(store, eventBus);
        this.modalId = options.modalId || 'modal';
        this.title = options.title || 'Modal';
        this.isOpen = false;
        this.prevFocused = null;
        this._onKeydownEsc = this.handleEscapeKey.bind(this);
        this._onKeydownTrap = this.handleFocusTrap.bind(this);
        this._onBackdropClick = null;
    }

    setupEventListeners() {
        super.setupEventListeners();
        
        // Listen for modal-specific events
        this.eventBus.on('modal:open', this.handleModalOpen.bind(this));
        this.eventBus.on('modal:close', this.handleModalClose.bind(this));
        this.eventBus.on('modal:toggle', this.handleModalToggle.bind(this));
    }

    handleModalOpen(modalId) {
        if (modalId === this.modalId) {
            this.open();
        }
    }

    handleModalClose(modalId) {
        if (!modalId || modalId === this.modalId) {
            this.close();
        }
    }

    handleModalToggle(modalId) {
        if (modalId === this.modalId) {
            this.toggle();
        }
    }

    open() {
        this.isOpen = true;
        this.render();
        this.prevFocused = document.activeElement;
        this.focusDialog();
        this.eventBus.emit('modal:opened', this.modalId);
    }

    close() {
        this.isOpen = false;
        this.render();
        if (this.prevFocused && typeof this.prevFocused.focus === 'function') {
            try { this.prevFocused.focus(); } catch (_) {}
        }
        this.eventBus.emit('modal:closed', this.modalId);
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    handleBackdropClick(event) {
        if (event.target.classList.contains('modal')) {
            this.close();
        }
    }

    handleCloseClick() {
        this.close();
    }

    handleEscapeKey(event) {
        if (event.key === 'Escape' && this.isOpen) {
            this.close();
        }
    }

    // Keep keyboard focus within the modal when open
    handleFocusTrap(event) {
        if (!this.isOpen || event.key !== 'Tab') return;
        const dialog = this.element.querySelector('.modal-content');
        if (!dialog) return;
        const focusable = dialog.querySelectorAll('a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])');
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement;
        if (event.shiftKey && active === first) {
            last.focus();
            event.preventDefault();
        } else if (!event.shiftKey && active === last) {
            first.focus();
            event.preventDefault();
        }
    }

    focusDialog() {
        const dialog = this.element.querySelector('.modal-content');
        if (dialog) {
            if (!dialog.hasAttribute('tabindex')) dialog.setAttribute('tabindex', '-1');
            dialog.focus();
        }
    }

    renderContent() {
        // Override in child classes
        return createElement('div', { className: 'modal-body' }, [
            createElement('p', {}, ['Override renderContent in child class'])
        ]);
    }

    render() {
        const modalClass = this.isOpen ? 'modal open' : 'modal';
        
        this.element.innerHTML = '';
        this.element.appendChild(
            createElement('div', { 
                id: this.modalId,
                className: modalClass,
                style: this.isOpen ? 'display: flex;' : 'display: none;'
            }, [
                createElement('div', { className: 'modal-content beautiful-modal', role: 'dialog', ariaModal: 'true', ariaLabelledby: `${this.modalId}-title` }, [
                    createElement('button', { 
                        className: 'close-modal neon-x',
                        ariaLabel: 'Close',
                        onclick: this.handleCloseClick.bind(this)
                    }, ['×']),
                    createElement('h2', { 
                        id: `${this.modalId}-title`,
                        style: 'color: #ffd700; text-align: center; margin-bottom: 1.5rem; text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);'
                    }, [this.title]),
                    this.renderContent()
                ])
            ])
        );

        // Add backdrop click handler
        const modal = this.element.querySelector('.modal');
        if (modal) {
            if (!this._onBackdropClick) this._onBackdropClick = this.handleBackdropClick.bind(this);
            modal.addEventListener('click', this._onBackdropClick);
        }

        // Add escape key handler
        if (this.isOpen) {
            document.addEventListener('keydown', this._onKeydownEsc);
            document.addEventListener('keydown', this._onKeydownTrap);
        } else {
            document.removeEventListener('keydown', this._onKeydownEsc);
            document.removeEventListener('keydown', this._onKeydownTrap);
        }
    }

    mount(container) {
        super.mount(container);
        
        // Initial render
        this.render();
    }

    destroy() {
        // Clean up escape key listener
        document.removeEventListener('keydown', this._onKeydownEsc);
        document.removeEventListener('keydown', this._onKeydownTrap);
        
        super.destroy();
    }
}

// Default export
export default Modal;
