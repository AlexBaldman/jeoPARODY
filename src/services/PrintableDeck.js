/**
 * Printable Card Deck System - Generate printable Jeopardy cards
 * 
 * Carmack's principle: "Simple, useful, no dependencies."
 * 
 * Generates printable HTML card decks for offline play or classroom use.
 * No PDF libraries needed - uses CSS print media queries.
 * 
 * @module services/PrintableDeck
 */

import { eventBus } from '../utils/events.js';

/**
 * Printable Card Deck Service
 * Generates printable HTML pages with Jeopardy cards
 */
export class PrintableDeck {
  constructor() {
    this.eventBus = eventBus;
  }
  
  /**
   * Generate a printable deck from a set of questions
   * @param {Array} questions - Array of question objects
   * @param {Object} options - Generation options
   */
  generatePrintableDeck(questions, options = {}) {
    const {
      title = 'Jeopardy Printable Deck',
      includeAnswers = true,
      pageSize = 'letter', // letter or a4
      cardsPerPage = 6,
      doubleSided = true
    } = options;
    
    // Group questions by category
    const groupedByCategory = this.groupByCategory(questions);
    
    // Generate HTML for printable deck
    const html = this.generatePrintableHTML({
      title,
      groupedByCategory,
      includeAnswers,
      pageSize,
      cardsPerPage,
      doubleSided
    });
    
    return html;
  }
  
  /**
   * Group questions by category
   */
  groupByCategory(questions) {
    const groups = {};
    
    questions.forEach(q => {
      const category = q.category || 'Miscellaneous';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(q);
    });
    
    return groups;
  }
  
  /**
   * Generate printable HTML
   */
  generatePrintableHTML({ title, groupedByCategory, includeAnswers, pageSize, cardsPerPage, doubleSided }) {
    const categories = Object.keys(groupedByCategory);
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: Georgia, 'Times New Roman', serif;
      background: #fff;
      color: #000;
      line-height: 1.4;
    }
    
    @page {
      size: ${pageSize === 'a4' ? 'A4' : 'letter'};
      margin: 0.5in;
    }
    
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      .no-print {
        display: none !important;
      }
      
      .page-break {
        page-break-after: always;
      }
      
      .card {
        break-inside: avoid;
      }
    }
    
    .header {
      text-align: center;
      padding: 20px;
      border-bottom: 3px solid #0033a0;
      margin-bottom: 20px;
    }
    
    .header h1 {
      font-size: 36px;
      color: #0033a0;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    
    .header p {
      font-size: 14px;
      color: #666;
      margin-top: 10px;
    }
    
    .controls {
      text-align: center;
      padding: 20px;
      background: #f5f5f5;
      margin-bottom: 20px;
    }
    
    .controls button {
      padding: 12px 24px;
      font-size: 16px;
      background: #0033a0;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin: 0 10px;
    }
    
    .controls button:hover {
      background: #002580;
    }
    
    .deck-container {
      display: grid;
      grid-template-columns: repeat(${cardsPerPage === 6 ? 2 : 3}, 1fr);
      gap: 20px;
      padding: 20px;
    }
    
    .category-section {
      grid-column: 1 / -1;
      page-break-after: always;
      margin-bottom: 30px;
    }
    
    .category-header {
      background: #0033a0;
      color: white;
      padding: 15px;
      font-size: 24px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 20px;
    }
    
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
    }
    
    .card {
      border: 2px solid #0033a0;
      border-radius: 8px;
      padding: 15px;
      background: white;
      min-height: 200px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      padding-bottom: 10px;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .card-value {
      font-size: 24px;
      font-weight: bold;
      color: #0033a0;
      font-family: 'Arial Black', sans-serif;
    }
    
    .card-number {
      font-size: 12px;
      color: #999;
    }
    
    .card-clue {
      flex: 1;
      font-size: 14px;
      line-height: 1.5;
      margin-bottom: 10px;
    }
    
    .card-answer {
      background: #f0f0f0;
      padding: 10px;
      border-radius: 4px;
      font-size: 13px;
      font-weight: bold;
      color: #333;
    }
    
    .card-answer.hidden {
      display: none;
    }
    
    .answer-toggle {
      text-align: center;
      margin-top: 10px;
    }
    
    .answer-toggle label {
      font-size: 12px;
      color: #666;
      cursor: pointer;
    }
    
    .footer {
      text-align: center;
      padding: 20px;
      margin-top: 40px;
      border-top: 1px solid #e0e0e0;
      font-size: 12px;
      color: #999;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${title}</h1>
    <p>Generated by JeoPARODY • ${new Date().toLocaleDateString()}</p>
  </div>
  
  <div class="controls no-print">
    <button onclick="window.print()">🖨️ Print Deck</button>
    <button onclick="toggleAnswers()">👁️ Toggle Answers</button>
    <button onclick="window.close()">✖️ Close</button>
  </div>
  
  <div class="deck-container">
    ${categories.map(category => `
      <div class="category-section">
        <div class="category-header">${category}</div>
        <div class="cards-grid">
          ${groupedByCategory[category].map((q, index) => `
            <div class="card">
              <div class="card-header">
                <span class="card-value">$${q.value || 200}</span>
                <span class="card-number">#${index + 1}</span>
              </div>
              <div class="card-clue">${q.clue || q.question || 'No clue text'}</div>
              ${includeAnswers ? `
                <div class="card-answer ${!includeAnswers ? 'hidden' : ''}">
                  <strong>Answer:</strong> ${q.answer || 'No answer'}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `).join('')}
  </div>
  
  <div class="footer">
    <p>Print this deck for offline play or classroom use • Cut along card borders for individual cards</p>
  </div>
  
  <script>
    function toggleAnswers() {
      const answers = document.querySelectorAll('.card-answer');
      answers.forEach(answer => {
        answer.classList.toggle('hidden');
      });
    }
  </script>
</body>
</html>`;
  }
  
  /**
   * Open printable deck in new window
   */
  openPrintableDeck(questions, options = {}) {
    const html = this.generatePrintableDeck(questions, options);
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    
    this.eventBus.emit('printable:deck:opened', { count: questions.length });
    console.log('[📄 Printable] Printable deck opened with', questions.length, 'cards');
  }
  
  /**
   * Generate a quick printable deck from current game state
   */
  generateQuickDeck() {
    // This would integrate with the current game state
    // For now, return a placeholder
    console.log('[📄 Printable] Quick deck generation - integrate with GameEngine');
  }
}

/**
 * Create a printable deck instance
 */
export function createPrintableDeck() {
  return new PrintableDeck();
}

/**
 * Global printable deck instance
 */
let globalPrintableDeck = null;

/**
 * Get or create the global printable deck instance
 */
export function getPrintableDeck() {
  if (!globalPrintableDeck) {
    globalPrintableDeck = createPrintableDeck();
  }
  return globalPrintableDeck;
}
