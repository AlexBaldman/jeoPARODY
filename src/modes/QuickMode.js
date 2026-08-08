/**
 * QuickMode - Classic random question gameplay
 * 
 * Simple baseline mode for testing the mode system.
 * "Start simple, then add complexity only when needed."
 * 
 * @module modes/QuickMode
 */

import { GameMode } from './BaseMode.js';
import { STAGE_SCENES } from '../core/Stage.js';

export class QuickMode extends GameMode {
  constructor(dependencies) {
    super(dependencies);
    this.modeState = {
      questionsAnswered: 0,
      lastClueId: null
    };
  }
  
  async enter() {
    console.log('[QuickMode] Entering classic quick play mode');
    this.modeState = {
      questionsAnswered: 0,
      lastClueId: null
    };
    
    // Notify Stage of mode entry
    if (this.stage) {
      this.stage.enterScene('board', { mode: 'quick' });
    }
  }
  
  async getNextClue() {
    try {
      const question = await this.questionService.getRandomQuestion();
      if (question) {
        this.modeState.lastClueId = question.id;
        this.modeState.questionsAnswered++;
        return question;
      }
    } catch (error) {
      console.error('[QuickMode] Failed to get question:', error);
    }
    return null;
  }
  
  handleAnswer(result) {
    if (result.isCorrect) {
      return { action: 'continue', nextState: 'next_question' };
    } else {
      return { action: 'continue', nextState: 'next_question' };
    }
  }
}
