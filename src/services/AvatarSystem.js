/**
 * Avatar System - Unlockable avatars based on achievements
 * 
 * Carmack's principle: "Simple rewards, zero asset bloat."
 * 
 * Uses emoji/SVG for avatars - no image files needed.
 * Unlocks based on achievements and performance.
 * 
 * @module services/AvatarSystem
 */

import { eventBus } from '../utils/events.js';

/**
 * Avatar definitions
 * Simple emoji-based avatars with unlock criteria
 */
export const AVATARS = {
  // Starting avatar (always unlocked)
  novice: {
    id: 'novice',
    name: 'Trivia Novice',
    emoji: '🎯',
    description: 'Every expert was once a beginner',
    unlockCriteria: 'Default',
    unlocked: true
  },
  
  // Achievement-based avatars
  speedDemon: {
    id: 'speedDemon',
    name: 'Speed Demon',
    emoji: '⚡',
    description: 'Answer 10 questions under 3 seconds each',
    unlockCriteria: 'achievement:speed_demon',
    unlocked: false
  },
  
  perfectGame: {
    id: 'perfectGame',
    name: 'Perfect Game',
    emoji: '🌟',
    description: 'Achieve 100% accuracy in a session',
    unlockCriteria: 'achievement:perfect_game',
    unlocked: false
  },
  
  streakMaster: {
    id: 'streakMaster',
    name: 'Streak Master',
    emoji: '🔥',
    description: 'Achieve a 10-question streak',
    unlockCriteria: 'achievement:streak_master',
    unlocked: false
  },
  
  scholar: {
    id: 'scholar',
    name: 'Scholar',
    emoji: '📚',
    description: 'Answer 100 total questions correctly',
    unlockCriteria: 'stat:total_correct_100',
    unlocked: false
  },
  
  // Category specialist avatars
  scienceWizard: {
    id: 'scienceWizard',
    name: 'Science Wizard',
    emoji: '🧪',
    description: '80% accuracy in Science category',
    unlockCriteria: 'category:science:80',
    unlocked: false
  },
  
  historyBuff: {
    id: 'historyBuff',
    name: 'History Buff',
    emoji: '📜',
    description: '80% accuracy in History category',
    unlockCriteria: 'category:history:80',
    unlocked: false
  },
  
  popCultureKing: {
    id: 'popCultureKing',
    name: 'Pop Culture King',
    emoji: '🎬',
    description: '80% accuracy in Pop Culture category',
    unlockCriteria: 'category:pop_culture:80',
    unlocked: false
  },
  
  // Era explorer avatars
  decadeExplorer: {
    id: 'decadeExplorer',
    name: 'Decade Explorer',
    emoji: '🕰',
    description: 'Play clues from 10 different decades',
    unlockCriteria: 'stat:decades_10',
    unlocked: false
  },
  
  // Milestone avatars
  jeopardyMaster: {
    id: 'jeopardyMaster',
    name: 'Jeopardy Master',
    emoji: '🏆',
    description: 'Reach 10,000 total score',
    unlockCriteria: 'stat:score_10000',
    unlocked: false
  },
  
  categorySpecialist: {
    id: 'categorySpecialist',
    name: 'Category Specialist',
    emoji: '🎭',
    description: 'Master 3 different categories',
    unlockCriteria: 'stat:categories_mastered_3',
    unlocked: false
  }
};

/**
 * Avatar System Service
 * Manages avatar unlocking and selection
 */
export class AvatarSystem {
  constructor() {
    this.avatars = { ...AVATARS };
    this.currentAvatar = this.avatars.novice;
    this.eventBus = eventBus;
    this.loadAvatarState();
  }
  
  /**
   * Load avatar state from localStorage
   */
  loadAvatarState() {
    try {
      const saved = localStorage.getItem('jeoparody_avatars');
      if (saved) {
        const state = JSON.parse(saved);
        // Merge saved unlocked state
        Object.keys(state.unlocked || {}).forEach(avatarId => {
          if (this.avatars[avatarId]) {
            this.avatars[avatarId].unlocked = true;
          }
        });
        // Set current avatar
        if (state.currentAvatar && this.avatars[state.currentAvatar]) {
          this.currentAvatar = this.avatars[state.currentAvatar];
        }
      }
    } catch (error) {
      console.warn('[🎭 Avatar] Failed to load avatar state:', error);
    }
  }
  
  /**
   * Save avatar state to localStorage
   */
  saveAvatarState() {
    try {
      const state = {
        currentAvatar: this.currentAvatar.id,
        unlocked: Object.fromEntries(
          Object.entries(this.avatars)
            .filter(([_, avatar]) => avatar.unlocked)
            .map(([id, _]) => [id, true])
        )
      };
      localStorage.setItem('jeoparody_avatars', JSON.stringify(state));
    } catch (error) {
      console.warn('[🎭 Avatar] Failed to save avatar state:', error);
    }
  }
  
  /**
   * Check unlock criteria based on game state
   */
  checkUnlockCriteria(gameState) {
    let newUnlocks = [];
    
    // Check achievement-based criteria
    if (gameState.stats.achievements.has('speed_demon')) {
      newUnlocks.push(this.unlockAvatar('speedDemon'));
    }
    
    if (gameState.stats.achievements.has('perfect_game')) {
      newUnlocks.push(this.unlockAvatar('perfectGame'));
    }
    
    if (gameState.stats.achievements.has('streak_master')) {
      newUnlocks.push(this.unlockAvatar('streakMaster'));
    }
    
    // Check stat-based criteria
    if (gameState.stats.correctAnswers >= 100) {
      newUnlocks.push(this.unlockAvatar('scholar'));
    }
    
    if (gameState.score.current >= 10000) {
      newUnlocks.push(this.unlockAvatar('jeopardyMaster'));
    }
    
    // Save state if any new unlocks
    if (newUnlocks.some(unlocked => unlocked)) {
      this.saveAvatarState();
    }
    
    return newUnlocks;
  }
  
  /**
   * Check category accuracy for category specialist avatars
   */
  checkCategoryAccuracy(categoryAccuracy) {
    let newUnlocks = [];
    
    Object.entries(categoryAccuracy).forEach(([category, accuracy]) => {
      if (accuracy >= 0.8) {
        const categoryMap = {
          'SCIENCE': 'scienceWizard',
          'HISTORY': 'historyBuff',
          'POP CULTURE': 'popCultureKing'
        };
        
        const avatarId = categoryMap[category.toUpperCase()];
        if (avatarId) {
          newUnlocks.push(this.unlockAvatar(avatarId));
        }
      }
    });
    
    if (newUnlocks.some(unlocked => unlocked)) {
      this.saveAvatarState();
    }
    
    return newUnlocks;
  }
  
  /**
   * Unlock an avatar
   */
  unlockAvatar(avatarId) {
    if (!this.avatars[avatarId]) return false;
    
    if (!this.avatars[avatarId].unlocked) {
      this.avatars[avatarId].unlocked = true;
      this.eventBus.emit('avatar:unlocked', { avatar: this.avatars[avatarId] });
      console.log(`[🎭 Avatar] Unlocked: ${this.avatars[avatarId].name}`);
      return true;
    }
    
    return false;
  }
  
  /**
   * Set current avatar
   */
  setCurrentAvatar(avatarId) {
    if (!this.avatars[avatarId]) return false;
    
    if (!this.avatars[avatarId].unlocked) {
      console.warn(`[🎭 Avatar] Avatar ${avatarId} not unlocked yet`);
      return false;
    }
    
    this.currentAvatar = this.avatars[avatarId];
    this.saveAvatarState();
    this.eventBus.emit('avatar:changed', { avatar: this.currentAvatar });
    console.log(`[🎭 Avatar] Set current avatar: ${this.currentAvatar.name}`);
    return true;
  }
  
  /**
   * Get current avatar
   */
  getCurrentAvatar() {
    return this.currentAvatar;
  }
  
  /**
   * Get all avatars
   */
  getAllAvatars() {
    return this.avatars;
  }
  
  /**
   * Get unlocked avatars
   */
  getUnlockedAvatars() {
    return Object.fromEntries(
      Object.entries(this.avatars)
        .filter(([_, avatar]) => avatar.unlocked)
    );
  }
}

/**
 * Create an avatar system instance
 */
export function createAvatarSystem() {
  return new AvatarSystem();
}

/**
 * Global avatar system instance
 */
let globalAvatarSystem = null;

/**
 * Get or create the global avatar system instance
 */
export function getAvatarSystem() {
  if (!globalAvatarSystem) {
    globalAvatarSystem = createAvatarSystem();
  }
  return globalAvatarSystem;
}
