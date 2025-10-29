/**
 * Compatibility Bridge
 * Connects the old DOM-based architecture with the new component system
 * This is a temporary solution while we migrate to the new architecture
 */

import questionService from './services/api/questionService.js';
import { eventBus } from './utils/events.js';
import dialogManager from './services/DialogManager.js';
import { logger as console } from './utils/logger.js';

console.info('🌉 Loading compatibility bridge...');

// Initialize when DOM is ready
function initBridge() {
  if (window.JEOPARODY_DISABLE_COMPAT_BRIDGE) {
    console.warn('🌉 Compatibility bridge disabled by flag');
    return;
  }
  console.info('🌉 Initializing compatibility bridge...');
  
  // Initialize question service
  questionService.initialize().then(() => {
    console.info('✅ Question service initialized');
  }).catch(err => {
    console.error('❌ Failed to initialize question service:', err);
  });
  
  // Legacy DOM bindings are deprecated; rely on main.js/component wiring
  // Keep minimal forwarding only if legacy HTML requires it
  // setupOldDOMBindings();
  
  // Set up startup logs (dev only)
  setupConsoleLogs();
}



let currentQuestion = null;

async function handleNewQuestion() {
  console.log('🎯 Getting new question...');
  
  try {
    // Clear previous content
    const inputBox = document.getElementById('inputBox');
    if (inputBox) inputBox.value = '';
    
    const answerBox = document.getElementById('answerBox');
    if (answerBox) {
      answerBox.style.display = 'none';
      answerBox.classList.remove('visible');
    }
    
    // Get new question
    const question = await questionService.getQuestion();
    if (!question) {
      console.error('❌ No question received');
      return;
    }
    
    currentQuestion = question;
    console.log('📝 Got question:', question);
    
    // Display question
    displayQuestion(question);
    
    // Emit events (new + component-aligned)
    eventBus.emit('question:new', question);
    eventBus.emit('game:question:loaded', { question });
    
    // Update ticker
    eventBus.emit('ticker:update', { event: 'idle' });
    
  } catch (error) {
    console.error('❌ Error getting question:', error);
  }
}

function displayQuestion(question) {
  console.log('🎨 Displaying question:', question);
  
  const categoryBox = document.getElementById('categoryBox');
  const valueBox = document.getElementById('valueBox');
  const questionBox = document.getElementById('questionBox');
  const answerBox = document.getElementById('answerBox');
  
  if (categoryBox) categoryBox.textContent = question.category;
  if (valueBox) valueBox.textContent = `${question.value}`;
  if (questionBox) questionBox.textContent = question.question;
  if (answerBox) {
    answerBox.textContent = question.answer;
    answerBox.style.display = 'none';
    answerBox.classList.remove('visible');
  }
  
  // Play sound
  playSound('stairs');
  
  // Component-aligned event for display
  eventBus.emit('game:question:displayed', { question });
}

function handleShowAnswer() {
  console.log('👁️ Showing answer...');
  const answerBox = document.getElementById('answerBox');
  if (answerBox) {
    const isHidden = answerBox.style.display === 'none' && !answerBox.classList.contains('visible');
    if (isHidden) {
      answerBox.style.display = 'block';
      answerBox.classList.add('visible');
      eventBus.emit('answer:revealed', currentQuestion);
      eventBus.emit('game:answer:revealed', { question: currentQuestion });
    } else {
      answerBox.style.display = 'none';
      answerBox.classList.remove('visible');
    }
  }
}

function handleCheckAnswer() {
  console.log('✅ Checking answer...');
  
  const inputBox = document.getElementById('inputBox');
  const userAnswer = inputBox?.value?.trim();
  
  if (!userAnswer) {
    console.log('❌ No answer provided');
    return;
  }
  
  if (!currentQuestion) {
    console.log('❌ No current question');
    return;
  }
  
  // Simple answer checking (can be improved)
  const correctAnswer = currentQuestion.answer.toLowerCase();
  const isCorrect = userAnswer.toLowerCase().includes(correctAnswer) || 
                    correctAnswer.includes(userAnswer.toLowerCase());
  
  console.log(`🎯 Answer check: "${userAnswer}" vs "${currentQuestion.answer}" = ${isCorrect}`);
  
  // Update UI
  const answerBox = document.getElementById('answerBox');
  if (answerBox) {
    answerBox.classList.add('visible');
    answerBox.style.display = 'block';
  }
  
  // Update score
  updateScore(isCorrect);
  
  // Emit answer events for host animations
  if (isCorrect) {
    eventBus.emit('answer:correct', { 
      question: currentQuestion,
      answer: userAnswer,
      value: currentQuestion.value || 200
    });
    // Also fire legacy event for compatibility
    document.dispatchEvent(new Event('correctAnswer'));
  } else {
    eventBus.emit('answer:incorrect', { 
      question: currentQuestion,
      userAnswer: userAnswer,
      correctAnswer: currentQuestion.answer
    });
    // Also fire legacy event for compatibility
    document.dispatchEvent(new Event('incorrectAnswer'));
  }
  
  // Update ticker
  eventBus.emit('ticker:update', { event: isCorrect ? 'correct' : 'incorrect' });
  
  // Play sound
  eventBus.emit('sound:play', { sound: isCorrect ? 'correct' : 'incorrect' });
  
  // Clear input
  if (inputBox) inputBox.value = '';
}

function updateScore(isCorrect) {
  const scoreEl = document.getElementById('score');
  const streakEl = document.getElementById('streak');
  
  if (!scoreEl || !streakEl) return;
  
  // Get current values
  const score = parseInt(scoreEl.textContent || '0', 10);
  const streak = parseInt(streakEl.textContent || '0', 10);
  
  const delta = isCorrect ? 200 : 0;
  const newScore = score + delta;
  const newStreak = isCorrect ? streak + 1 : 0;
  
  scoreEl.textContent = newScore;
  streakEl.textContent = newStreak;
  
  // Emit event for scoreboard animation (component-aligned)
  eventBus.emit('game:score:updated', { score: newScore, streak: newStreak });
  
  console.log(`📊 Score: $${score}, Streak: ${streak}`);
}

function playSound(soundName) {
  console.log(`🔊 Playing sound: ${soundName}`);
  // Sound playing will be handled by the sound manager when it's ready
  eventBus.emit('sound:play', { sound: soundName });
}

function setupConsoleLogs() {
  console.info('🎮 Welcome to Jeopardish!!!');
  console.info('❓ Click the "new question" button to get a random Jeopardy-style question & test your knowledge.');
  console.info('🔥 Multiple correct answers in a row will start a streak...');
  console.info('💔 ...but get one wrong & the streak will reset.');
  console.info('🏆 Let\'s see how many correct answers you can string together!');
  console.info('📊 Streak is currently at 0');
  console.info('✨ HAVE FUN YA MANIAC!');
}





// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initBridge();
    // Initialize dialog manager
    dialogManager.init();
  });
} else {
  initBridge();
  // Initialize dialog manager
  dialogManager.init();
}

// Export for debugging
window.compatibilityBridge = {
  questionService,
  eventBus,
  currentQuestion: () => currentQuestion,
  handleNewQuestion,
  handleShowAnswer,
  handleCheckAnswer
};

console.info('🌉 Compatibility bridge loaded (deprecated; use main.js wiring).');
