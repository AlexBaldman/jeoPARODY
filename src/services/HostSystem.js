import { eventBus } from '../utils/events.js';
import { soundManager } from './soundManager.js';
import { getHostStageActor } from './HostStageActor.js';

export const HOST_PERSONALITIES = {
  trebek: {
    id: 'trebek',
    name: 'Alex Trebek',
    description: 'Classic Jeopardy host with wit and warmth',
    imagePrefix: 'trebek',
    imageCount: 9,
    moods: {
      encouraging: ['trebek-good-01.png', 'trebek-good-02.png', 'trebek-good-03.png'],
      neutral: ['trebek-good-05.png'],
      playful: ['trebek-dope-01.png', 'trebek-dope-02.png', 'trebek-dope-03.png', 'trebek-dope-05.png'],
      mischievous: ['trebek-coy-angel.png', 'trebek-smarmy-mafioso.png']
    },
    personality: {
      voice: 'warm and authoritative',
      humor: 'dry wit with dad jokes',
      encouragement: 'supportive but challenging',
      reactions: {
        correct: ['Excellent!', 'Well done!', "That's right!", 'Outstanding!'],
        incorrect: ["Oh, I'm sorry, that's not correct.", 'Not quite right.', 'Good try, but no.'],
        streak: ["You're on fire!", 'Keep it up!', 'Impressive streak!'],
        timeout: ["Time's up! The answer was...", 'We needed that answer a bit quicker.']
      }
    },
    aiPrompt: `You are Alex Trebek, the beloved host of Jeopardy. You are warm, witty, encouraging, dryly funny, supportive, and professional. Respond in character with brief reactions.`
  },
  watson: {
    id: 'watson',
    name: 'IBM Watson',
    description: 'AI assistant with analytical precision',
    imagePrefix: 'watson',
    imageCount: 5,
    moods: {
      analytical: ['watson-thinking-01.png', 'watson-processing-01.png'],
      confident: ['watson-confident-01.png'],
      curious: ['watson-curious-01.png'],
      pleased: ['watson-pleased-01.png']
    },
    personality: {
      voice: 'analytical and precise',
      humor: 'logical observations',
      encouragement: 'data-driven motivation',
      reactions: {
        correct: ['Correct. Probability of success: increasing.', 'Affirmative. Well calculated.'],
        incorrect: ['Incorrect. Recalibrating analysis.', 'Negative. Alternative approach recommended.'],
        streak: ['Efficiency optimal. Performance trending upward.', 'Statistical anomaly detected: excellence.'],
        timeout: ['Time constraint exceeded. Processing complete.']
      }
    },
    aiPrompt: `You are IBM Watson, the AI that won Jeopardy. Be analytical, precise, data-focused, and helpful.`
  }
};

export const MOOD_SYSTEM = {
  calculateMood(stats = {}) {
    const accuracy = Number(stats.accuracy || 0);
    const streak = Number(stats.streak || 0);
    const questionsAnswered = Number(stats.questionsAnswered || 0);

    if (questionsAnswered < 3) return 'encouraging';
    if (streak > 10) return 'mischievous';
    if (accuracy > 0.8 && streak > 3) return 'playful';
    if (accuracy > 0.6) return 'neutral';
    if (accuracy < 0.4) return 'encouraging';
    return 'neutral';
  }
};

export class HostSystem {
  constructor() {
    this.currentPersonality = 'trebek';
    this.currentMood = 'neutral';
    this.currentImageIndex = 0;
    this.currentImageUrl = '';
    this.imageCache = new Map();
    this.preloadedImages = new Set();
    this.isAnimating = false;
    this.animationQueue = [];
    this.hostImageElement = null;
    this.hostContainer = null;
    this.stageActor = null;
    this.lastMoodUpdate = 0;
    this.moodUpdateInterval = 2000;

    this.setupEventHandlers();
    this.init();
  }

  async init() {
    this.hostImageElement = document.getElementById('trebekImage');
    this.hostContainer = document.querySelector('.host-container');

    if (!this.hostImageElement) {
      console.warn('[HostSystem] Host image element not found');
      return;
    }

    this.setupImageCycling();
    this.stageActor = getHostStageActor().init();

    await this.preloadPersonalityImages(this.currentPersonality);
    this.updateHostImage();
    console.log('[👤] HostSystem initialized');
  }

  setupImageCycling() {
    if (!this.hostContainer) return;

    const leftZone = this.hostContainer.querySelector('.host-click-left');
    const rightZone = this.hostContainer.querySelector('.host-click-right');

    leftZone?.addEventListener('click', () => this.previousImage());
    rightZone?.addEventListener('click', () => this.nextImage());
  }

  async preloadPersonalityImages(personalityId) {
    const personality = HOST_PERSONALITIES[personalityId];
    if (!personality) return;

    const uniqueImages = [...new Set(Object.values(personality.moods).flat())];
    const results = await Promise.allSettled(uniqueImages.map(imageName => this.preloadImage(imageName)));
    const failed = results.filter(result => result.status === 'rejected').length;

    if (failed) console.warn(`[HostSystem] ${failed} host image(s) failed to preload.`);
    console.log(`[HostSystem] Preloaded ${uniqueImages.length - failed}/${uniqueImages.length} images for ${personalityId}`);
  }

  preloadImage(imageName) {
    return new Promise((resolve, reject) => {
      if (this.preloadedImages.has(imageName)) {
        resolve();
        return;
      }

      const img = new Image();
      img.onload = () => {
        this.imageCache.set(imageName, img);
        this.preloadedImages.add(imageName);
        resolve();
      };
      img.onerror = reject;
      img.src = `assets/images/trebek/${imageName}`;
    });
  }

  async changePersonality(personalityId) {
    if (!HOST_PERSONALITIES[personalityId]) {
      console.warn('[HostSystem] Unknown personality:', personalityId);
      return;
    }
    if (personalityId === this.currentPersonality) return;

    const oldPersonality = this.currentPersonality;
    this.currentPersonality = personalityId;
    this.currentImageIndex = 0;
    await this.preloadPersonalityImages(personalityId);
    await this.animatePersonalityChange();

    eventBus.emit('host:personality-changed', { from: oldPersonality, to: personalityId });
  }

  updateMood(gameStats) {
    const now = performance.now();
    if (now - this.lastMoodUpdate < this.moodUpdateInterval) return;

    const newMood = MOOD_SYSTEM.calculateMood(gameStats);
    if (newMood !== this.currentMood) {
      this.currentMood = newMood;
      this.updateHostImage();
      eventBus.emit('host:mood-changed', { mood: newMood, stats: gameStats });
    }
    this.lastMoodUpdate = now;
  }

  getCurrentPersonality() {
    return HOST_PERSONALITIES[this.currentPersonality];
  }

  getCurrentMoodImages() {
    const personality = this.getCurrentPersonality();
    return personality.moods[this.currentMood] || personality.moods.neutral || Object.values(personality.moods)[0] || [];
  }

  updateHostImage() {
    const moodImages = this.getCurrentMoodImages();
    if (!moodImages.length) return;

    this.currentImageIndex = Math.max(0, Math.min(this.currentImageIndex, moodImages.length - 1));
    const imageName = moodImages[this.currentImageIndex];
    const newImageUrl = `assets/images/trebek/${imageName}`;
    if (newImageUrl === this.currentImageUrl) return;

    this.currentImageUrl = newImageUrl;
    if (this.hostImageElement) this.transitionToImage(newImageUrl);
  }

  async transitionToImage(newImageUrl) {
    if (!this.hostImageElement || this.isAnimating) {
      if (newImageUrl) this.animationQueue.push(newImageUrl);
      return;
    }

    this.isAnimating = true;
    this.hostImageElement.style.transition = 'opacity 0.3s ease-in-out';
    this.hostImageElement.style.opacity = '0';
    await new Promise(resolve => setTimeout(resolve, 300));
    this.hostImageElement.src = newImageUrl;
    this.hostImageElement.style.opacity = '1';
    await new Promise(resolve => setTimeout(resolve, 300));
    this.isAnimating = false;

    const nextImage = this.animationQueue.pop();
    this.animationQueue.length = 0;
    if (nextImage && nextImage !== newImageUrl) this.transitionToImage(nextImage);
  }

  nextImage() {
    const moodImages = this.getCurrentMoodImages();
    if (!moodImages.length) return;

    this.currentImageIndex = (this.currentImageIndex + 1) % moodImages.length;
    this.updateHostImage();
    soundManager.play('click', { volume: 0.3 });
    eventBus.emit('host:image-changed', { direction: 'next', index: this.currentImageIndex });
  }

  previousImage() {
    const moodImages = this.getCurrentMoodImages();
    if (!moodImages.length) return;

    this.currentImageIndex = this.currentImageIndex === 0 ? moodImages.length - 1 : this.currentImageIndex - 1;
    this.updateHostImage();
    soundManager.play('click', { volume: 0.3 });
    eventBus.emit('host:image-changed', { direction: 'previous', index: this.currentImageIndex });
  }

  async animatePersonalityChange() {
    const stageActor = this.stageActor || getHostStageActor().init();
    await stageActor.personalityChange(() => this.updateHostImage());
  }

  async triggerAnimation(animationType) {
    const stageActor = this.stageActor || getHostStageActor().init();

    if (animationType === 'pace') return stageActor.pace();
    if (animationType === 'stairs') return stageActor.fakeStairs();

    if (animationType === 'celebrate') {
      await Promise.all([
        stageActor.surprisePop(),
        this.celebrationAnimation()
      ]);
      eventBus.emit('host:animation-complete', { type: 'celebrate' });
      return;
    }

    if (animationType === 'surprise') {
      await Promise.all([
        stageActor.surprisePop(),
        this.surpriseAnimation()
      ]);
      eventBus.emit('host:animation-complete', { type: 'surprise' });
      return;
    }

    if (animationType === 'duck') return stageActor.duckBehindRail();
    if (animationType === 'think') return this.thinkingAnimation();
  }

  async celebrationAnimation() {
    if (!this.hostContainer) return;

    const originalMood = this.currentMood;
    this.currentMood = 'playful';
    this.updateHostImage();
    await new Promise(resolve => setTimeout(resolve, 650));
    this.currentMood = originalMood;
    this.updateHostImage();
  }

  async thinkingAnimation() {
    if (!this.hostImageElement) return;
    this.hostImageElement.style.animation = 'pulse 1s ease-in-out infinite';
  }

  stopThinkingAnimation() {
    if (this.hostImageElement) this.hostImageElement.style.animation = '';
  }

  async surpriseAnimation() {
    if (!this.hostContainer) return;

    const originalMood = this.currentMood;
    if (this.getCurrentPersonality().moods.mischievous) {
      this.currentMood = 'mischievous';
      this.updateHostImage();
    }
    await new Promise(resolve => setTimeout(resolve, 700));
    this.currentMood = originalMood;
    this.updateHostImage();
  }

  getResponse(context, data = {}) {
    const personality = this.getCurrentPersonality();
    const responses = personality.personality.reactions[context];
    if (!responses?.length) return null;

    const response = responses[Math.floor(Math.random() * responses.length)];
    eventBus.emit('host:response', {
      personality: this.currentPersonality,
      context,
      response,
      mood: this.currentMood,
      data
    });
    return response;
  }

  setupEventHandlers() {
    eventBus.on('answer:evaluated', data => {
      if (data.isCorrect && !data.timedOut) {
        this.triggerAnimation('celebrate');
        this.getResponse('correct', data);
      } else {
        this.stageActor?.duckBehindRail();
        this.getResponse('incorrect', data);
      }
    });

    eventBus.on('game:stats-updated', data => this.updateMood(data.stats));
    eventBus.on('host:change-personality', data => this.changePersonality(data.personality));
    eventBus.on('host:animate', data => this.triggerAnimation(data.animation));
    eventBus.on('achievement:unlocked', () => this.triggerAnimation('surprise'));
  }

  getState() {
    return {
      personality: this.currentPersonality,
      mood: this.currentMood,
      imageIndex: this.currentImageIndex,
      imageUrl: this.currentImageUrl,
      isAnimating: this.isAnimating,
      stageActorReady: Boolean(this.stageActor?.initialized),
      preloadedImages: this.preloadedImages.size,
      cachedImages: this.imageCache.size
    };
  }
}

let hostSystemInstance = null;

export function getHostSystem() {
  if (!hostSystemInstance) hostSystemInstance = new HostSystem();
  return hostSystemInstance;
}
