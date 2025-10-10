import Modal from './Modal.js';
import { createElement } from '../utils/helpers.js';

/**
 * MediaModal Component
 * Extends base Modal to handle media content (images, videos, audio)
 * with elegant presentation and interactions
 */
class MediaModal extends Modal {
    constructor(store, eventBus) {
        super(store, eventBus, {
            modalId: 'media-modal',
            title: 'Media Content'
        });
        this.currentMedia = null;
        this.audioElement = null;
        this.isPlaying = false;
    }

    setupEventListeners() {
        super.setupEventListeners();
        
        // Listen for media display events
        this.eventBus.on('media:show', this.handleShowMedia.bind(this));
    }

    handleShowMedia(mediaData) {
        this.currentMedia = mediaData;
        this.title = mediaData.alt || 'Media Content';
        this.open();
    }

    open() {
        super.open();
        // Add opening animation class
        setTimeout(() => {
            if (this.element.querySelector('.modal')) {
                this.element.querySelector('.modal').classList.add('modal-opening');
            }
        }, 10);
        
        document.body.classList.add('modal-open');
    }

    close() {
        const modal = this.element.querySelector('.modal');
        if (modal) {
            // Add rotating animation to close button
            const closeBtn = modal.querySelector('.close-modal');
            if (closeBtn) {
                closeBtn.classList.add('rotating');
            }
            
            // Add closing animation
            modal.classList.add('modal-closing');
            
            setTimeout(() => {
                // Clean up audio if playing
                if (this.audioElement) {
                    this.audioElement.pause();
                    this.audioElement = null;
                    this.isPlaying = false;
                }
                
                super.close();
                document.body.classList.remove('modal-open');
                
                // Clean up classes
                modal.classList.remove('modal-opening', 'modal-closing');
                if (closeBtn) {
                    closeBtn.classList.remove('rotating');
                }
            }, 300);
        } else {
            super.close();
            document.body.classList.remove('modal-open');
        }
    }

    renderContent() {
        if (!this.currentMedia) {
            return createElement('div', { className: 'modal-body' }, [
                createElement('p', {}, ['No media to display'])
            ]);
        }

        const { type, src, alt, caption } = this.currentMedia;
        
        switch (type) {
            case 'image':
                return this.renderImageContent(src, alt, caption);
            case 'video':
                return this.renderVideoContent(src, alt, caption);
            case 'audio':
                return this.renderAudioContent(src, alt, caption);
            default:
                return createElement('div', { className: 'modal-body' }, [
                    createElement('p', {}, ['Unsupported media type'])
                ]);
        }
    }

    renderImageContent(src, alt, caption) {
        const content = [
            createElement('div', { className: 'modal-image-container' }, [
                createElement('img', {
                    src: src,
                    alt: alt || 'Media content',
                    className: 'modal-image'
                })
            ])
        ];

        if (caption) {
            content.push(
                createElement('p', { 
                    className: 'modal-caption'
                }, [caption])
            );
        }

        return createElement('div', { className: 'modal-body' }, content);
    }

    renderVideoContent(src, alt, caption) {
        const content = [
            createElement('div', { className: 'modal-video-container' }, [
                createElement('video', {
                    src: src,
                    className: 'modal-video',
                    controls: true,
                    preload: 'metadata'
                })
            ])
        ];

        if (caption) {
            content.push(
                createElement('p', { 
                    className: 'modal-caption'
                }, [caption])
            );
        }

        return createElement('div', { className: 'modal-body' }, content);
    }

    renderAudioContent(src, alt, caption) {
        const playButtonId = `audio-play-btn-${Date.now()}`;
        const progressId = `audio-progress-${Date.now()}`;
        const currentTimeId = `current-time-${Date.now()}`;
        const totalTimeId = `total-time-${Date.now()}`;

        const content = [
            createElement('div', { className: 'modal-audio-container' }, [
                createElement('div', { 
                    className: 'audio-player',
                }, [
                    createElement('button', {
                        id: playButtonId,
                        className: 'audio-play-btn',
                        onclick: () => this.toggleAudio(src, playButtonId, progressId, currentTimeId, totalTimeId),
                    }, [
                        createElement('i', { className: 'fas fa-play' })
                    ]),
                    createElement('div', { className: 'audio-info' }, [
                        createElement('p', { 
                            className: 'audio-title',
                        }, [alt || 'Audio Clip']),
                        createElement('div', { 
                            className: 'audio-progress',
                        }, [
                            createElement('div', {
                                id: progressId,
                                className: 'audio-progress-bar',
                            })
                        ]),
                        createElement('div', { 
                            className: 'audio-time',
                        }, [
                            createElement('span', { 
                                id: currentTimeId,
                                className: 'current-time' 
                            }, ['0:00']),
                            createElement('span', { 
                                id: totalTimeId,
                                className: 'total-time' 
                            }, ['0:00'])
                        ])
                    ])
                ])
            ])
        ];

        if (caption) {
            content.push(
                createElement('p', { 
                    className: 'modal-caption',
                }, [caption])
            );
        }

        return createElement('div', { className: 'modal-body' }, content);
    }

    toggleAudio(src, playButtonId, progressId, currentTimeId, totalTimeId) {
        const playButton = document.getElementById(playButtonId);
        const progressBar = document.getElementById(progressId);
        const currentTimeSpan = document.getElementById(currentTimeId);
        const totalTimeSpan = document.getElementById(totalTimeId);

        if (!this.audioElement) {
            this.audioElement = new Audio(src);
            
            // Set up audio event listeners
            this.audioElement.addEventListener('loadedmetadata', () => {
                totalTimeSpan.textContent = this.formatTime(this.audioElement.duration);
            });
            
            this.audioElement.addEventListener('timeupdate', () => {
                const progress = (this.audioElement.currentTime / this.audioElement.duration) * 100;
                progressBar.style.width = `${progress}%`;
                currentTimeSpan.textContent = this.formatTime(this.audioElement.currentTime);
            });
            
            this.audioElement.addEventListener('ended', () => {
                this.isPlaying = false;
                playButton.innerHTML = '<i class="fas fa-play"></i>';
                progressBar.style.width = '0%';
                currentTimeSpan.textContent = '0:00';
            });
        }

        if (this.isPlaying) {
            this.audioElement.pause();
            this.isPlaying = false;
            playButton.innerHTML = '<i class="fas fa-play"></i>';
        } else {
            this.audioElement.play();
            this.isPlaying = true;
            playButton.innerHTML = '<i class="fas fa-pause"></i>';
        }
    }

    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // Static method to create media thumbnails
    static createThumbnail(mediaData, eventBus) {
        const { type, src, alt } = mediaData;
        const thumbnail = createElement('div', { 
            className: 'media-thumbnail',
            onclick: () => eventBus.emit('media:show', mediaData),
            style: `
                position: relative;
                display: inline-block;
                cursor: pointer;
                border-radius: 8px;
                overflow: hidden;
                transition: transform 0.3s ease;
                max-width: 200px;
                max-height: 150px;
            `
        });

        let content;
        switch (type) {
            case 'image':
                content = [
                    createElement('img', {
                        src: src,
                        alt: alt || 'Image thumbnail',
                        className: 'thumbnail-image',
                        style: 'width: 100%; height: 100%; object-fit: cover;'
                    }),
                    createElement('div', {
                        className: 'thumbnail-overlay',
                        style: `
                            position: absolute;
                            top: 0;
                            left: 0;
                            right: 0;
                            bottom: 0;
                            background: rgba(0, 0, 0, 0.5);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            opacity: 0;
                            transition: opacity 0.3s ease;
                        `
                    }, [
                        createElement('i', { 
                            className: 'fas fa-expand',
                            style: 'color: white; font-size: 24px;'
                        })
                    ])
                ];
                break;
                
            case 'video':
                content = [
                    createElement('video', {
                        src: src,
                        className: 'thumbnail-video',
                        preload: 'metadata',
                        style: 'width: 100%; height: 100%; object-fit: cover;'
                    }),
                    createElement('div', {
                        className: 'thumbnail-overlay',
                        style: `
                            position: absolute;
                            top: 0;
                            left: 0;
                            right: 0;
                            bottom: 0;
                            background: rgba(0, 0, 0, 0.5);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            opacity: 0.8;
                            transition: opacity 0.3s ease;
                        `
                    }, [
                        createElement('i', { 
                            className: 'fas fa-play',
                            style: 'color: white; font-size: 32px;'
                        })
                    ])
                ];
                break;
                
            case 'audio':
                content = [
                    createElement('div', {
                        className: 'audio-thumbnail',
                        style: `
                            background: linear-gradient(145deg, #4CAF50, #45a049);
                            padding: 2rem;
                            text-align: center;
                            color: white;
                            min-height: 100px;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                        `
                    }, [
                        createElement('i', { 
                            className: 'fas fa-volume-up',
                            style: 'font-size: 32px; margin-bottom: 0.5rem;'
                        }),
                        createElement('span', {
                            style: 'font-size: 0.9rem; font-weight: bold;'
                        }, [alt || 'Audio Clip'])
                    ])
                ];
                break;
        }

        thumbnail.innerHTML = '';
        content.forEach(child => thumbnail.appendChild(child));

        // Add hover effects
        thumbnail.addEventListener('mouseenter', () => {
            thumbnail.style.transform = 'scale(1.05)';
            const overlay = thumbnail.querySelector('.thumbnail-overlay');
            if (overlay) overlay.style.opacity = '1';
        });

        thumbnail.addEventListener('mouseleave', () => {
            thumbnail.style.transform = 'scale(1)';
            const overlay = thumbnail.querySelector('.thumbnail-overlay');
            if (overlay && type === 'image') overlay.style.opacity = '0';
        });

        return thumbnail;
    }
}

export default MediaModal;
