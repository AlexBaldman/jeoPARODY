/**
 * Host Image Cycler Service
 * Manages cycling through different Trebek host images
 */

export default class HostImageCycler {
  constructor() {
    this.currentIndex = 0;
    this.hostImages = [
      'assets/images/trebek/trebek-good-01.png',
      'assets/images/trebek/trebek-good-02.png',
      'assets/images/trebek/trebek-good-03.png',
      'assets/images/trebek/trebek-good-05.png',
      'assets/images/trebek/trebek-dope-01.png',
      'assets/images/trebek/trebek-dope-02.png',
      'assets/images/trebek/trebek-dope-03.png',
      'assets/images/trebek/trebek-dope-05.png',
      'assets/images/trebek/trebek-smarmy-mafioso.png',
      'assets/images/trebek/trebek-coy-angel.png'
    ];
    this.hostImageElement = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    
    this.hostImageElement = document.getElementById('trebekImage');
    if (!this.hostImageElement) {
      console.warn('Host image element not found');
      return;
    }

    // Set initial image
    this.setHostImage(this.currentIndex);
    
    // Add click event listeners for cycling
    this.setupClickListeners();
    
    // Add visual indicator for cycling
    this.addCyclingIndicator();
    
    this.initialized = true;
    console.log('🎭 Host image cycler initialized with', this.hostImages.length, 'images');
  }

  setupClickListeners() {
    if (!this.hostImageElement) return;

    this.hostImageElement.addEventListener('click', (event) => {
      const rect = this.hostImageElement.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const width = rect.width;

      if (clickX < width / 2) {
        // Clicked on the left side - go backwards
        this.previousImage();
      } else {
        // Clicked on the right side - go forwards
        this.nextImage();
      }
    });

    // Add hover effect to show cycling is possible
    this.hostImageElement.style.cursor = 'pointer';
    this.hostImageElement.title = 'Click left/right side to cycle through host images';
  }

  addCyclingIndicator() {
    if (!this.hostImageElement) return;

    // Create cycling indicator
    const indicator = document.createElement('div');
    indicator.className = 'host-cycling-indicator';
    indicator.innerHTML = `
      <div class="cycling-arrow left">◀</div>
      <div class="cycling-arrow right">▶</div>
      <div class="cycling-text">Click to cycle</div>
    `;
    
    // Style the indicator
    indicator.style.cssText = `
      position: absolute;
      top: -30px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 5px 10px;
      border-radius: 5px;
      font-size: 12px;
      font-family: 'Press Start 2P', monospace;
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
      z-index: 1000;
    `;

    // Add hover effect
    this.hostImageElement.addEventListener('mouseenter', () => {
      indicator.style.opacity = '1';
    });

    this.hostImageElement.addEventListener('mouseleave', () => {
      indicator.style.opacity = '0';
    });

    // Insert indicator
    this.hostImageElement.parentElement.style.position = 'relative';
    this.hostImageElement.parentElement.appendChild(indicator);
  }

  nextImage() {
    this.currentIndex = (this.currentIndex + 1) % this.hostImages.length;
    this.setHostImage(this.currentIndex);
    this.showCyclingFeedback('next');
  }

  previousImage() {
    this.currentIndex = (this.currentIndex - 1 + this.hostImages.length) % this.hostImages.length;
    this.setHostImage(this.currentIndex);
    this.showCyclingFeedback('previous');
  }

  setHostImage(index) {
    if (!this.hostImageElement) return;
    
    const imagePath = this.hostImages[index];
    this.hostImageElement.src = imagePath;
    this.currentIndex = index;
    
    console.log(`🎭 Switched to host image ${index + 1}/${this.hostImages.length}: ${imagePath}`);
  }

  showCyclingFeedback(direction) {
    if (!this.hostImageElement) return;

    // Create temporary feedback element
    const feedback = document.createElement('div');
    feedback.className = 'host-cycling-feedback';
    feedback.textContent = direction === 'next' ? '▶' : '◀';
    feedback.style.cssText = `
      position: absolute;
      top: 50%;
      ${direction === 'next' ? 'right' : 'left'}: 10px;
      transform: translateY(-50%);
      background: rgba(255, 215, 0, 0.9);
      color: black;
      padding: 5px;
      border-radius: 3px;
      font-size: 16px;
      font-weight: bold;
      animation: fadeInOut 0.5s ease;
      pointer-events: none;
      z-index: 1001;
    `;

    this.hostImageElement.parentElement.appendChild(feedback);

    // Remove after animation
    setTimeout(() => {
      if (feedback.parentElement) {
        feedback.parentElement.removeChild(feedback);
      }
    }, 500);
  }

  getCurrentImage() {
    return this.hostImages[this.currentIndex];
  }

  getImageCount() {
    return this.hostImages.length;
  }

  getCurrentIndex() {
    return this.currentIndex;
  }
}

// Add CSS animation for feedback
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInOut {
    0% { opacity: 0; transform: translateY(-50%) scale(0.8); }
    50% { opacity: 1; transform: translateY(-50%) scale(1.2); }
    100% { opacity: 0; transform: translateY(-50%) scale(0.8); }
  }
`;
document.head.appendChild(style);
