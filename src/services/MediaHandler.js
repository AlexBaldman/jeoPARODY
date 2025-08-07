/**
 * Media Handler Service
 * Processes and displays different types of media (audio, images, videos) in questions
 * Provides elegant UI for media interaction
 */

import { eventBus } from '../utils/events.js';

class MediaHandler {
    constructor() {
        this.supportedAudioFormats = ['.mp3', '.wav', '.ogg', '.m4a'];
        this.supportedImageFormats = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
        this.supportedVideoFormats = ['.mp4', '.webm', '.ogg', '.mov'];
        this.currentModal = null;
    }

    /**
     * Process text content to find and replace media links with interactive elements
     * @param {string} text - The text content to process
     * @returns {string} - Processed HTML content
     */
    processMediaContent(text) {
        if (!text) return text;

        // Find all <a href="..."> tags
        const linkRegex = /<a\s+href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi;
        
        return text.replace(linkRegex, (match, url, linkText) => {
            const mediaType = this.detectMediaType(url);
            
            switch (mediaType) {
                case 'audio':
                    return this.createAudioPlayer(url, linkText);
                case 'image':
                    return this.createImageThumbnail(url, linkText);
                case 'video':
                    return this.createVideoThumbnail(url, linkText);
                default:
                    // For non-media links, make them look nicer but still non-functional
                    return `<span class="external-link" title="External link: ${url}">${linkText}</span>`;
            }
        });
    }

    /**
     * Detect media type from URL
     * @param {string} url - The URL to analyze
     * @returns {string} - Media type ('audio', 'image', 'video', 'unknown')
     */
    detectMediaType(url) {
        const urlLower = url.toLowerCase();
        
        if (this.supportedAudioFormats.some(format => urlLower.includes(format))) {
            return 'audio';
        }
        if (this.supportedImageFormats.some(format => urlLower.includes(format))) {
            return 'image';
        }
        if (this.supportedVideoFormats.some(format => urlLower.includes(format))) {
            return 'video';
        }
        
        return 'unknown';
    }

    /**
     * Create an interactive audio player
     * @param {string} url - Audio file URL
     * @param {string} linkText - Original link text
     * @returns {string} - HTML for audio player
     */
    createAudioPlayer(url, linkText) {
        const playerId = `audio-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Schedule the setup of the audio player after DOM update
        setTimeout(() => this.setupAudioPlayer(playerId, url), 100);
        
        return `
            <div class="media-player audio-player" id="${playerId}">
                <button class="play-button" data-url="${url}" title="Play audio clip">
                    <i class="fas fa-play"></i>
                    <span class="media-label">🎵 ${linkText || 'Play Audio'}</span>
                </button>
                <div class="audio-controls" style="display: none;">
                    <button class="pause-button">
                        <i class="fas fa-pause"></i>
                    </button>
                    <div class="progress-bar">
                        <div class="progress"></div>
                    </div>
                    <span class="time-display">0:00 / 0:00</span>
                </div>
            </div>
        `;
    }

    /**
     * Create an image thumbnail that opens in modal
     * @param {string} url - Image URL
     * @param {string} linkText - Original link text
     * @returns {string} - HTML for image thumbnail
     */
    createImageThumbnail(url, linkText) {
        const imageId = `image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Schedule the setup of the image thumbnail after DOM update
        setTimeout(() => this.setupImageThumbnail(imageId, url), 100);
        
        return `
            <div class="media-thumbnail image-thumbnail" id="${imageId}">
                <div class="thumbnail-container" data-url="${url}" title="Click to view full image">
                    <img src="${url}" alt="${linkText}" loading="lazy" />
                    <div class="thumbnail-overlay">
                        <i class="fas fa-expand"></i>
                        <span class="media-label">📷 ${linkText || 'View Image'}</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Create a video thumbnail that opens in modal
     * @param {string} url - Video URL
     * @param {string} linkText - Original link text
     * @returns {string} - HTML for video thumbnail
     */
    createVideoThumbnail(url, linkText) {
        const videoId = `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Schedule the setup of the video thumbnail after DOM update
        setTimeout(() => this.setupVideoThumbnail(videoId, url), 100);
        
        return `
            <div class="media-thumbnail video-thumbnail" id="${videoId}">
                <div class="thumbnail-container" data-url="${url}" title="Click to play video">
                    <video muted preload="metadata">
                        <source src="${url}" type="video/mp4">
                    </video>
                    <div class="thumbnail-overlay">
                        <i class="fas fa-play-circle"></i>
                        <span class="media-label">🎬 ${linkText || 'Play Video'}</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Setup audio player functionality
     * @param {string} playerId - The audio player element ID
     * @param {string} url - Audio file URL
     */
    setupAudioPlayer(playerId, url) {
        const playerElement = document.getElementById(playerId);
        if (!playerElement) return;

        const playButton = playerElement.querySelector('.play-button');
        const pauseButton = playerElement.querySelector('.pause-button');
        const controls = playerElement.querySelector('.audio-controls');
        const progressBar = playerElement.querySelector('.progress');
        const timeDisplay = playerElement.querySelector('.time-display');

        let audio = null;

        playButton.addEventListener('click', () => {
            if (!audio) {
                audio = new Audio(url);
                audio.addEventListener('loadedmetadata', () => {
                    timeDisplay.textContent = `0:00 / ${this.formatTime(audio.duration)}`;
                });
                
                audio.addEventListener('timeupdate', () => {
                    const progress = (audio.currentTime / audio.duration) * 100;
                    progressBar.style.width = `${progress}%`;
                    timeDisplay.textContent = `${this.formatTime(audio.currentTime)} / ${this.formatTime(audio.duration)}`;
                });
                
                audio.addEventListener('ended', () => {
                    playButton.style.display = 'block';
                    controls.style.display = 'none';
                    progressBar.style.width = '0%';
                });
            }

            audio.play();
            playButton.style.display = 'none';
            controls.style.display = 'flex';
            
            // Emit event for analytics
            eventBus.emit('media:audioPlayed', { url });
        });

        if (pauseButton) {
            pauseButton.addEventListener('click', () => {
                if (audio) {
                    audio.pause();
                    playButton.style.display = 'block';
                    controls.style.display = 'none';
                }
            });
        }
    }

    /**
     * Setup image thumbnail functionality
     * @param {string} imageId - The image element ID
     * @param {string} url - Image URL
     */
    setupImageThumbnail(imageId, url) {
        const thumbnailElement = document.getElementById(imageId);
        if (!thumbnailElement) return;

        const container = thumbnailElement.querySelector('.thumbnail-container');
        
        container.addEventListener('click', () => {
            this.openImageModal(url);
            eventBus.emit('media:imageViewed', { url });
        });
    }

    /**
     * Setup video thumbnail functionality
     * @param {string} videoId - The video element ID
     * @param {string} url - Video URL
     */
    setupVideoThumbnail(videoId, url) {
        const thumbnailElement = document.getElementById(videoId);
        if (!thumbnailElement) return;

        const container = thumbnailElement.querySelector('.thumbnail-container');
        
        container.addEventListener('click', () => {
            this.openVideoModal(url);
            eventBus.emit('media:videoPlayed', { url });
        });
    }

    /**
     * Open image in a modal
     * @param {string} url - Image URL
     */
    openImageModal(url) {
        this.closeCurrentModal();
        
        const modal = document.createElement('div');
        modal.className = 'media-modal image-modal';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <button class="modal-close" aria-label="Close">
                    <i class="fas fa-times"></i>
                </button>
                <div class="modal-body">
                    <img src="${url}" alt="Full size image" />
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.currentModal = modal;
        
        // Add event listeners
        modal.querySelector('.modal-close').addEventListener('click', () => this.closeCurrentModal());
        modal.querySelector('.modal-backdrop').addEventListener('click', () => this.closeCurrentModal());
        
        // Add escape key listener
        const escapeListener = (e) => {
            if (e.key === 'Escape') {
                this.closeCurrentModal();
                document.removeEventListener('keydown', escapeListener);
            }
        };
        document.addEventListener('keydown', escapeListener);
        
        // Animate in
        requestAnimationFrame(() => {
            modal.classList.add('show');
        });
    }

    /**
     * Open video in a modal
     * @param {string} url - Video URL
     */
    openVideoModal(url) {
        this.closeCurrentModal();
        
        const modal = document.createElement('div');
        modal.className = 'media-modal video-modal';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <button class="modal-close" aria-label="Close">
                    <i class="fas fa-times"></i>
                </button>
                <div class="modal-body">
                    <video controls autoplay>
                        <source src="${url}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.currentModal = modal;
        
        // Add event listeners
        modal.querySelector('.modal-close').addEventListener('click', () => this.closeCurrentModal());
        modal.querySelector('.modal-backdrop').addEventListener('click', () => this.closeCurrentModal());
        
        // Add escape key listener
        const escapeListener = (e) => {
            if (e.key === 'Escape') {
                this.closeCurrentModal();
                document.removeEventListener('keydown', escapeListener);
            }
        };
        document.addEventListener('keydown', escapeListener);
        
        // Animate in
        requestAnimationFrame(() => {
            modal.classList.add('show');
        });
    }

    /**
     * Close the current modal
     */
    closeCurrentModal() {
        if (this.currentModal) {
            this.currentModal.classList.remove('show');
            setTimeout(() => {
                if (this.currentModal && this.currentModal.parentNode) {
                    this.currentModal.parentNode.removeChild(this.currentModal);
                }
                this.currentModal = null;
            }, 300);
        }
    }

    /**
     * Format time in MM:SS format
     * @param {number} seconds - Time in seconds
     * @returns {string} - Formatted time string
     */
    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    /**
     * Initialize the media handler
     */
    init() {
        console.log('🎬 Media Handler initialized');
    }
}

// Export singleton instance
const mediaHandler = new MediaHandler();
export default mediaHandler;
