/**
 * Fullboard Game Service
 * 
 * Creates structured full Jeopardy-style game boards with 6 categories
 * and 5 questions each (30 questions total)
 */

import questionService from './api/questionService.js';
import { shuffleArray } from '../utils/helpers.js';

export class FullboardGameService {
  constructor() {
    this.cache = new Map();
    this.gameHistory = [];
  }

  /**
   * Create a full game board with 6 categories and 5 questions each
   * @param {Object} options - Game configuration options
   * @returns {Object} Complete game board structure
   */
  async createGameBoard(options = {}) {
    const {
      date = null,
      year = null,
      month = null,
      randomize = true,
      preferredCategories = null
    } = options;

    console.log('🎯 Creating full game board...', options);

    try {
      // Initialize question service if not already done
      await questionService.initialize();

      let gameBoard;

      if (date || year || month) {
        // Create board based on date criteria
        gameBoard = await this.createDateBasedBoard({ date, year, month });
      } else {
        // Create random board
        gameBoard = await this.createRandomBoard({ randomize, preferredCategories });
      }

      // Store in history
      this.gameHistory.unshift({
        id: `game_${Date.now()}`,
        timestamp: Date.now(),
        date: date || new Date().toISOString().split('T')[0],
        categories: gameBoard.categories.map(cat => cat.name),
        totalQuestions: gameBoard.totalQuestions
      });

      // Keep only last 50 games
      if (this.gameHistory.length > 50) {
        this.gameHistory = this.gameHistory.slice(0, 50);
      }

      console.log('✅ Game board created successfully!', gameBoard);
      return gameBoard;

    } catch (error) {
      console.error('❌ Error creating game board:', error);
      throw error;
    }
  }

  /**
   * Create a random game board
   * @param {Object} options - Random board options
   * @returns {Object} Random game board
   */
  async createRandomBoard({ randomize = true, preferredCategories = null }) {
    console.log('🎲 Creating random game board...');

    // Get all available questions
    const allQuestions = await questionService.getAllQuestions();
    
    if (!allQuestions || allQuestions.length === 0) {
      throw new Error('No questions available for board creation');
    }

    // Group questions by category
    const questionsByCategory = this.groupQuestionsByCategory(allQuestions);
    const availableCategories = Object.keys(questionsByCategory);

    if (availableCategories.length < 6) {
      console.warn('⚠️ Not enough categories, using available ones:', availableCategories.length);
    }

    // Select 6 categories
    let selectedCategories;
    if (preferredCategories && preferredCategories.length > 0) {
      selectedCategories = this.selectPreferredCategories(
        availableCategories, 
        preferredCategories
      );
    } else {
      selectedCategories = randomize ? 
        shuffleArray(availableCategories).slice(0, 6) :
        availableCategories.slice(0, 6);
    }

    // Create board structure
    const categories = [];
    const values = [200, 400, 600, 800, 1000];

    for (const categoryName of selectedCategories) {
      const categoryQuestions = questionsByCategory[categoryName];
      
      if (!categoryQuestions || categoryQuestions.length === 0) {
        console.warn(`⚠️ No questions for category: ${categoryName}`);
        continue;
      }

      const category = {
        name: categoryName,
        questions: []
      };

      // Select 5 questions for this category, one for each value
      for (const value of values) {
        const suitableQuestions = categoryQuestions.filter(q => 
          !category.questions.find(existing => existing.id === q.id)
        );

        if (suitableQuestions.length === 0) {
          console.warn(`⚠️ No more questions for ${categoryName} at $${value}`);
          continue;
        }

        const question = randomize ? 
          suitableQuestions[Math.floor(Math.random() * suitableQuestions.length)] :
          suitableQuestions[0];

        // Ensure question has proper value
        const boardQuestion = {
          ...question,
          value: value,
          boardPosition: {
            category: categoryName,
            row: values.indexOf(value),
            column: selectedCategories.indexOf(categoryName)
          },
          completed: false
        };

        category.questions.push(boardQuestion);
      }

      categories.push(category);
    }

    return {
      id: `board_${Date.now()}`,
      type: 'random',
      date: new Date().toISOString().split('T')[0],
      categories: categories,
      totalQuestions: categories.reduce((total, cat) => total + cat.questions.length, 0),
      values: values,
      metadata: {
        created: Date.now(),
        preferredCategories: preferredCategories,
        randomized: randomize
      }
    };
  }

  /**
   * Create a date-based game board
   * @param {Object} dateOptions - Date selection criteria
   * @returns {Object} Date-based game board
   */
  async createDateBasedBoard({ date, year, month }) {
    console.log('📅 Creating date-based game board...', { date, year, month });

    // Get all available questions
    const allQuestions = await questionService.getAllQuestions();
    
    // Filter questions by date if they have airdate information
    let filteredQuestions = allQuestions;

    if (date) {
      // Exact date match
      filteredQuestions = allQuestions.filter(q => {
        return q.airdate && q.airdate.startsWith(date);
      });
    } else if (year && month) {
      // Year and month match
      const datePrefix = `${year}-${String(month).padStart(2, '0')}`;
      filteredQuestions = allQuestions.filter(q => {
        return q.airdate && q.airdate.startsWith(datePrefix);
      });
    } else if (year) {
      // Year match
      filteredQuestions = allQuestions.filter(q => {
        return q.airdate && q.airdate.startsWith(year.toString());
      });
    }

    // If not enough date-specific questions, fall back to random selection
    if (filteredQuestions.length < 30) {
      console.warn('⚠️ Not enough date-specific questions, using random selection');
      filteredQuestions = allQuestions;
    }

    // Create board using filtered questions
    const questionsByCategory = this.groupQuestionsByCategory(filteredQuestions);
    const availableCategories = Object.keys(questionsByCategory);
    const selectedCategories = shuffleArray(availableCategories).slice(0, 6);

    const categories = [];
    const values = [200, 400, 600, 800, 1000];

    for (const categoryName of selectedCategories) {
      const categoryQuestions = questionsByCategory[categoryName];
      
      const category = {
        name: categoryName,
        questions: []
      };

      for (const value of values) {
        const availableQuestions = categoryQuestions.filter(q => 
          !category.questions.find(existing => existing.id === q.id)
        );

        if (availableQuestions.length === 0) continue;

        const question = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];

        category.questions.push({
          ...question,
          value: value,
          boardPosition: {
            category: categoryName,
            row: values.indexOf(value),
            column: selectedCategories.indexOf(categoryName)
          },
          completed: false
        });
      }

      categories.push(category);
    }

    return {
      id: `board_${Date.now()}`,
      type: 'date-based',
      date: date || `${year || 'unknown'}-${month || 'unknown'}`,
      categories: categories,
      totalQuestions: categories.reduce((total, cat) => total + cat.questions.length, 0),
      values: values,
      metadata: {
        created: Date.now(),
        requestedDate: date,
        requestedYear: year,
        requestedMonth: month,
        questionsFiltered: filteredQuestions.length,
        totalQuestions: allQuestions.length
      }
    };
  }

  /**
   * Group questions by category
   * @param {Array} questions - Array of questions
   * @returns {Object} Questions grouped by category
   */
  groupQuestionsByCategory(questions) {
    const grouped = {};
    
    for (const question of questions) {
      const category = question.category || 'GENERAL';
      
      if (!grouped[category]) {
        grouped[category] = [];
      }
      
      grouped[category].push(question);
    }
    
    return grouped;
  }

  /**
   * Select preferred categories with fallbacks
   * @param {Array} availableCategories - All available categories
   * @param {Array} preferredCategories - Preferred category names
   * @returns {Array} Selected categories
   */
  selectPreferredCategories(availableCategories, preferredCategories) {
    const selected = [];
    
    // First, add any exact matches
    for (const preferred of preferredCategories) {
      if (availableCategories.includes(preferred) && !selected.includes(preferred)) {
        selected.push(preferred);
      }
    }
    
    // Then add partial matches
    for (const preferred of preferredCategories) {
      if (selected.length >= 6) break;
      
      const partialMatch = availableCategories.find(cat => 
        cat.toLowerCase().includes(preferred.toLowerCase()) && 
        !selected.includes(cat)
      );
      
      if (partialMatch) {
        selected.push(partialMatch);
      }
    }
    
    // Fill remaining slots with random categories
    const remaining = availableCategories.filter(cat => !selected.includes(cat));
    const shuffledRemaining = shuffleArray(remaining);
    
    while (selected.length < 6 && shuffledRemaining.length > 0) {
      selected.push(shuffledRemaining.shift());
    }
    
    return selected.slice(0, 6);
  }

  /**
   * Get game history
   * @returns {Array} Recent game history
   */
  getGameHistory() {
    return this.gameHistory;
  }

  /**
   * Get available date ranges
   * @returns {Object} Available years and months with question counts
   */
  async getAvailableDateRanges() {
    const allQuestions = await questionService.getAllQuestions();
    const dateRanges = {
      years: {},
      months: {},
      totalQuestionsWithDates: 0
    };

    for (const question of allQuestions) {
      if (question.airdate) {
        const [year, month] = question.airdate.split('-');
        
        if (year) {
          dateRanges.years[year] = (dateRanges.years[year] || 0) + 1;
        }
        
        if (year && month) {
          const yearMonth = `${year}-${month}`;
          dateRanges.months[yearMonth] = (dateRanges.months[yearMonth] || 0) + 1;
        }
        
        dateRanges.totalQuestionsWithDates++;
      }
    }

    return dateRanges;
  }

  /**
   * Get a question from a specific board position
   * @param {Object} gameBoard - Game board structure
   * @param {number} categoryIndex - Category column index
   * @param {number} questionIndex - Question row index
   * @returns {Object|null} Question at that position
   */
  getQuestionAtPosition(gameBoard, categoryIndex, questionIndex) {
    if (!gameBoard || !gameBoard.categories) {
      return null;
    }

    const category = gameBoard.categories[categoryIndex];
    if (!category || !category.questions) {
      return null;
    }

    return category.questions[questionIndex] || null;
  }

  /**
   * Mark a question as completed
   * @param {Object} gameBoard - Game board structure
   * @param {number} categoryIndex - Category column index
   * @param {number} questionIndex - Question row index
   */
  markQuestionCompleted(gameBoard, categoryIndex, questionIndex) {
    const question = this.getQuestionAtPosition(gameBoard, categoryIndex, questionIndex);
    if (question) {
      question.completed = true;
    }
  }

  /**
   * Check if game board is complete
   * @param {Object} gameBoard - Game board structure
   * @returns {boolean} True if all questions are completed
   */
  isBoardComplete(gameBoard) {
    if (!gameBoard || !gameBoard.categories) {
      return false;
    }

    return gameBoard.categories.every(category => 
      category.questions.every(question => question.completed)
    );
  }

  /**
   * Get board completion stats
   * @param {Object} gameBoard - Game board structure
   * @returns {Object} Completion statistics
   */
  getBoardStats(gameBoard) {
    if (!gameBoard || !gameBoard.categories) {
      return { total: 0, completed: 0, remaining: 0, percentage: 0 };
    }

    let total = 0;
    let completed = 0;

    for (const category of gameBoard.categories) {
      for (const question of category.questions) {
        total++;
        if (question.completed) {
          completed++;
        }
      }
    }

    return {
      total,
      completed,
      remaining: total - completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }
}

// Create singleton instance
const fullboardGameService = new FullboardGameService();

export default fullboardGameService;