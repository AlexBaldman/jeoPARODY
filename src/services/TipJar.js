/**
 * TipJar - Simple tipping modal with direct payment links
 * 
 * Carmack's principle: "No backend complexity. Direct links only."
 * 
 * This provides a simple modal with QR codes and direct payment links.
 * No payment processing, no data collection, no account requirements.
 * 
 * @module services/TipJar
 */

import { eventBus } from '../utils/events.js';

/**
 * Tip jar configuration
 * Direct links and QR codes for various payment methods
 */
export const TIP_JAR_CONFIG = {
  // Venmo (username-based QR code)
  venmo: {
    username: '', // Add your Venmo username
    url: 'https://venmo.com/', // Will append username
    qrTemplate: 'https://venmo.com/qr-code/{username}',
    label: 'Venmo',
    icon: '💙'
  },
  
  // Cash App (cashtag-based QR code)
  cashapp: {
    cashtag: '', // Add your Cash App cashtag
    url: 'https://cash.app/', // Will append cashtag
    qrTemplate: 'https://cash.app/{cashtag}',
    label: 'Cash App',
    icon: '💚'
  },
  
  // Stripe Payment Link (pre-configured payment link)
  stripe: {
    paymentLink: '', // Add your Stripe Payment Link URL
    url: '', // Will use paymentLink
    label: 'Card / Apple Pay',
    icon: '💳'
  },
  
  // Bitcoin (BTC address)
  bitcoin: {
    address: '', // Add your BTC address
    label: 'Bitcoin',
    icon: '₿'
  },
  
  // Ethereum (ETH address)
  ethereum: {
    address: '', // Add your ETH address
    label: 'Ethereum',
    icon: 'Ξ'
  },
  
  // Solana (SOL address)
  solana: {
    address: '', // Add your SOL address
    label: 'Solana',
    icon: '◎'
  }
};

/**
 * Tip Jar Service
 * Manages tip jar modal and payment method configuration
 */
export class TipJar {
  constructor(config = {}) {
    this.config = { ...TIP_JAR_CONFIG, ...config };
    this.eventBus = eventBus;
    this.modal = null;
    this.isOpen = false;
  }
  
  /**
   * Open the tip jar modal
   */
  open() {
    if (this.isOpen) return;
    
    this.isOpen = true;
    this.renderModal();
    
    this.eventBus.emit('tipjar:opened');
    console.log('[💰 TipJar] Tip jar opened');
  }
  
  /**
   * Close the tip jar modal
   */
  close() {
    if (!this.isOpen) return;
    
    this.isOpen = false;
    this.removeModal();
    
    this.eventBus.emit('tipjar:closed');
    console.log('[💰 TipJar] Tip jar closed');
  }
  
  /**
   * Toggle the tip jar modal
   */
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
  
  /**
   * Render the tip jar modal
   */
  renderModal() {
    // Remove existing modal if present
    this.removeModal();
    
    // Create modal backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'tipjar-backdrop';
    backdrop.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      animation: fadeIn 0.2s ease-out;
    `;
    
    // Create modal content
    const modal = document.createElement('div');
    modal.className = 'tipjar-modal';
    modal.style.cssText = `
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border: 2px solid #ff25b8;
      border-radius: 16px;
      padding: 2rem;
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      animation: slideUp 0.3s ease-out;
      box-shadow: 0 20px 60px rgba(255, 37, 184, 0.3);
    `;
    
    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.style.cssText = `
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: none;
      border: none;
      color: #ff25b8;
      font-size: 2rem;
      cursor: pointer;
      padding: 0;
      line-height: 1;
    `;
    closeBtn.onclick = () => this.close();
    
    // Header
    const header = document.createElement('h2');
    header.textContent = '💰 Support the Game';
    header.style.cssText = `
      margin: 0 0 1.5rem 0;
      color: #fff;
      font-size: 1.5rem;
      text-align: center;
      font-family: Impact, sans-serif;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    `;
    
    // Subtitle
    const subtitle = document.createElement('p');
    subtitle.textContent = 'Choose your preferred tipping method';
    subtitle.style.cssText = `
      margin: 0 0 2rem 0;
      color: rgba(255, 255, 255, 0.7);
      text-align: center;
      font-size: 0.9rem;
    `;
    
    // Payment methods grid
    const grid = document.createElement('div');
    grid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 1rem;
    `;
    
    // Add payment method cards
    this.addPaymentMethodCard(grid, this.config.venmo, 'venmo');
    this.addPaymentMethodCard(grid, this.config.cashapp, 'cashapp');
    this.addPaymentMethodCard(grid, this.config.stripe, 'stripe');
    this.addPaymentMethodCard(grid, this.config.bitcoin, 'bitcoin');
    this.addPaymentMethodCard(grid, this.config.ethereum, 'ethereum');
    this.addPaymentMethodCard(grid, this.config.solana, 'solana');
    
    // Footer note
    const footer = document.createElement('p');
    footer.textContent = '100% of tips go directly to the developer. No fees, no middleman.';
    footer.style.cssText = `
      margin: 2rem 0 0 0;
      color: rgba(255, 255, 255, 0.5);
      text-align: center;
      font-size: 0.8rem;
      font-style: italic;
    `;
    
    // Assemble modal
    modal.appendChild(closeBtn);
    modal.appendChild(header);
    modal.appendChild(subtitle);
    modal.appendChild(grid);
    modal.appendChild(footer);
    backdrop.appendChild(modal);
    
    // Add to DOM
    document.body.appendChild(backdrop);
    this.modal = backdrop;
    
    // Close on backdrop click
    backdrop.onclick = (e) => {
      if (e.target === backdrop) {
        this.close();
      }
    };
    
    // Close on Escape key
    this.escapeHandler = (e) => {
      if (e.key === 'Escape') {
        this.close();
      }
    };
    document.addEventListener('keydown', this.escapeHandler);
  }
  
  /**
   * Add a payment method card to the grid
   */
  addPaymentMethodCard(grid, config, method) {
    const card = document.createElement('div');
    card.style.cssText = `
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 37, 184, 0.3);
      border-radius: 12px;
      padding: 1.5rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
    `;
    
    card.onmouseover = () => {
      card.style.background = 'rgba(255, 37, 184, 0.1)';
      card.style.borderColor = '#ff25b8';
      card.style.transform = 'translateY(-2px)';
    };
    
    card.onmouseout = () => {
      card.style.background = 'rgba(255, 255, 255, 0.05)';
      card.style.borderColor = 'rgba(255, 37, 184, 0.3)';
      card.style.transform = 'translateY(0)';
    };
    
    // Icon
    const icon = document.createElement('div');
    icon.textContent = config.icon;
    icon.style.cssText = `
      font-size: 2.5rem;
      line-height: 1;
    `;
    
    // Label
    const label = document.createElement('div');
    label.textContent = config.label;
    label.style.cssText = `
      color: #fff;
      font-weight: bold;
      font-size: 0.9rem;
    `;
    
    // Click handler
    card.onclick = () => this.openPaymentMethod(method, config);
    
    card.appendChild(icon);
    card.appendChild(label);
    grid.appendChild(card);
  }
  
  /**
   * Open a specific payment method
   */
  openPaymentMethod(method, config) {
    let url = '';
    
    switch (method) {
      case 'venmo':
        url = config.url + config.username;
        break;
      case 'cashapp':
        url = config.url + config.cashtag;
        break;
      case 'stripe':
        url = config.paymentLink;
        break;
      case 'bitcoin':
      case 'ethereum':
      case 'solana':
        // Copy address to clipboard
        this.copyToClipboard(config.address);
        this.showNotification(`${config.label} address copied to clipboard!`);
        return;
      default:
        return;
    }
    
    if (url) {
      window.open(url, '_blank');
      this.eventBus.emit('tipjar:payment-method-selected', { method, url });
    }
  }
  
  /**
   * Copy text to clipboard
   */
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('[💰 TipJar] Failed to copy to clipboard:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }
  
  /**
   * Show a notification
   */
  showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      background: #ff25b8;
      color: #fff;
      padding: 1rem 2rem;
      border-radius: 8px;
      font-weight: bold;
      z-index: 3000;
      animation: slideUp 0.3s ease-out;
      box-shadow: 0 4px 15px rgba(255, 37, 184, 0.4);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'fadeOut 0.3s ease-out';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 2000);
  }
  
  /**
   * Remove the modal from DOM
   */
  removeModal() {
    if (this.modal) {
      document.removeEventListener('keydown', this.escapeHandler);
      document.body.removeChild(this.modal);
      this.modal = null;
    }
  }
  
  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }
}

/**
 * Create a tip jar instance
 */
export function createTipJar(config = {}) {
  return new TipJar(config);
}

/**
 * Global tip jar instance
 */
let globalTipJar = null;

/**
 * Get or create the global tip jar instance
 */
export function getTipJar(config = {}) {
  if (!globalTipJar) {
    globalTipJar = createTipJar(config);
  }
  return globalTipJar;
}

/**
 * Dispose the global tip jar instance
 */
export function disposeTipJar() {
  if (globalTipJar) {
    globalTipJar.close();
    globalTipJar = null;
  }
}
