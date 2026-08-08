/**
 * ReviewMode - Missed clue review for learning
 * 
 * Migrated from Jeopardish Review Misses feature.
 * "Turn trivia into learning by letting players practice what they missed."
 * 
 * @module modes/ReviewMode
 */

import { GameMode } from './BaseMode.js';

export class ReviewMode extends GameMode {
  constructor(dependencies) {
    super(dependencies);
    this.modeState = {
      missedClueIds: [],
      currentIndex: 0,
      reviewedCount: 0
    };
  }
  
  async enter() {
    console.log('[ReviewMode] Entering review mode');
    // Load missed clue IDs from storage or session
    const savedMisses = this.loadMissedClues();
    this.modeState.missedClueIds = savedMisses;
    this.modeState.currentIndex = 0;
    this.modeState.reviewedCount = 0;
    
    if (this.modeState.missedClueIds.length === 0) {
      console.log('[ReviewMode] No missed clues to review');
    }
    
    // Notify Stage of mode entry
    if (this.stage) {
      this.stage.enterScene('board', { mode: 'review' });
    }
  }
  
  async getNextClue() {
    if (this.modeState.currentIndex >= this.modeState.missedClueIds.length) {
      console.log('[ReviewMode] Review complete');
      return null;
    }
    
    const clueId = this.modeState.missedClueIds[this.modeState.currentIndex];
    try {
      const question = await this.questionService.getQuestionById(clueId);
      if (question) {
        this.modeState.currentIndex++;
        return question;
      }
    } catch (error) {
      console.error('[ReviewMode] Failed to load missed clue:', error);
    }
    
    // Skip to next if this one fails
    this.modeState.currentIndex++;
    return this.getNextClue();
  }
  
  handleAnswer(result) {
    if (result.isCorrect) {
      // Remove from missed queue on correct answer
      const clueId = this.gameEngine?.state?.question?.data?.id;
      if (clueId) {
        this.modeState.missedClueIds = this.modeState.missedClueIds.filter(id => id !== clueId);
        this.saveMissedClues(this.modeState.missedClueIds);
      }
      this.modeState.reviewedCount++;
      return { action: 'continue', nextState: 'next_question' };
    } else {
      // Keep in missed queue
      return { action: 'continue', nextState: 'next_question' };
    }
  }
  
  loadMissedClues() {
    try {
      const saved = localStorage.getItem('jeoparody_missed_clues');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }
  
  saveMissedClues(missedIds) {
    try {
      localStorage.setItem('jeoparody_missed_clues', JSON.stringify(missedIds));
    } catch (error) {
      console.warn('[ReviewMode] Failed to save missed clues:', error);
    }
  }
}
