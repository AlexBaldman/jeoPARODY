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
        
        setTimeout(() => this.setupImageThumbnail(imageId, url), 100);
        
        return `
            <div class="media-player image-player" id="${imageId}">
                <button class="image-button" data-url="${url}" title="View image">
                    <i class="fas fa-image"></i>
                    <span class="media-label">🖼️ ${linkText || 'View Image'}</span>
                </button>
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
        
        setTimeout(() => this.setupVideoThumbnail(videoId, url), 100);
        
        return `
            <div class="media-player video-player" id="${videoId}">
                <button class="video-button" data-url="${url}" title="Play video">
                    <i class="fas fa-play"></i>
                    <span class="media-label">🎬 ${linkText || 'Play Video'}</span>
                </button>
            </div>
        `;
    }

    /**
     * Setup audio player functionality
     * @param {string} playerId - The player element ID
     * @param {string} url - Audio file URL
     */
    setupAudioPlayer(playerId, url) {
        const player = document.getElementById(playerId);
        if (!player) return;

        const playButton = player.querySelector('.play-button');
        const pauseButton = player.querySelector('.pause-button');
        const progressBar = player.querySelector('.progress');
        const timeDisplay = player.querySelector('.time-display');
        const audioControls = player.querySelector('.audio-controls');

        let audio = null;
        let isPlaying = false;

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
                    isPlaying = false;
                    playButton.style.display = 'block';
                    audioControls.style.display = 'none';
                });
            }

            if (isPlaying) {
                audio.pause();
                isPlaying = false;
                playButton.style.display = 'block';
                audioControls.style.display = 'none';
            } else {
                audio.play();
                isPlaying = true;
                playButton.style.display = 'none';
                audioControls.style.display = 'flex';
            }
        });

        pauseButton.addEventListener('click', () => {
            if (audio && isPlaying) {
                audio.pause();
                isPlaying = false;
                playButton.style.display = 'block';
                audioControls.style.display = 'none';
            }
        });
    }

    /**
     * Setup image thumbnail functionality
     * @param {string} imageId - The image element ID
     * @param {string} url - Image URL
     */
    setupImageThumbnail(imageId, url) {
        const player = document.getElementById(imageId);
        if (!player) return;

        const imageButton = player.querySelector('.image-button');
        imageButton.addEventListener('click', () => {
            this.openImageModal(url);
        });
    }

    /**
     * Setup video thumbnail functionality
     * @param {string} videoId - The video element ID
     * @param {string} url - Video URL
     */
    setupVideoThumbnail(videoId, url) {
        const player = document.getElementById(videoId);
        if (!player) return;

        const videoButton = player.querySelector('.video-button');
        videoButton.addEventListener('click', () => {
            this.openVideoModal(url);
        });
    }

    /**
     * Open image in modal
     * @param {string} url - Image URL
     */
    openImageModal(url) {
        this.closeCurrentModal();

        const modal = document.createElement('div');
        modal.className = 'media-modal';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <button class="modal-close">&times;</button>
                    <img src="${url}" alt="Full size image" style="max-width: 90vw; max-height: 90vh; object-fit: contain;">
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.currentModal = modal;

        const closeButton = modal.querySelector('.modal-close');
        const overlay = modal.querySelector('.modal-overlay');

        const closeModal = () => {
            this.closeCurrentModal();
        };

        closeButton.addEventListener('click', closeModal);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });

        const escapeListener = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escapeListener);
            }
        };
        document.addEventListener('keydown', escapeListener);
    }

    /**
     * Open video in modal
     * @param {string} url - Video URL
     */
    openVideoModal(url) {
        this.closeCurrentModal();

        const modal = document.createElement('div');
        modal.className = 'media-modal';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <button class="modal-close">&times;</button>
                    <video controls style="max-width: 90vw; max-height: 90vh;">
                        <source src="${url}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.currentModal = modal;

        const closeButton = modal.querySelector('.modal-close');
        const overlay = modal.querySelector('.modal-overlay');

        const closeModal = () => {
            this.closeCurrentModal();
        };

        closeButton.addEventListener('click', closeModal);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });

        const escapeListener = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escapeListener);
            }
        };
        document.addEventListener('keydown', escapeListener);
    }

    /**
     * Close current modal
     */
    closeCurrentModal() {
        if (this.currentModal) {
            this.currentModal.remove();
            this.currentModal = null;
        }
    }

    /**
     * Format time in MM:SS format
     * @param {number} seconds - Time in seconds
     * @returns {string} - Formatted time string
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * Initialize the media handler
     */
    init() {
        console.log('[🎬] Media Handler initialized');
    }
}

// Export singleton instance
const mediaHandler = new MediaHandler();
export default mediaHandler;
