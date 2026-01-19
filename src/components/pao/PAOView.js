// PAOView.js - PAO deck manager and quiz mode (self-contained state)

import QwenImageService from '../../services/ai/QwenImageService.js';

class PAOView {
  constructor() {
    this.root = null;
    this.state = {
      decks: [],
      currentDeckId: 'default',
      search: '',
      filters: { number: '', initials: '', emoji: '' },
      selectedIds: new Set(),
      quiz: { active: false, score: 0, total: 0, current: null, answers: { person: '', action: '', object: '' } }
    };
    this.qwen = new QwenImageService();
    this.handleKeydown = this.handleKeydown.bind(this);
  }

  init(container) {
    this.root = document.createElement('div');
    this.root.className = 'pao-screen';
    container.appendChild(this.root);

    this.load();
    this.render();
    document.addEventListener('keydown', this.handleKeydown);
  }

  destroy() {
    document.removeEventListener('keydown', this.handleKeydown);
    if (this.root && this.root.parentNode) this.root.parentNode.removeChild(this.root);
  }

  handleKeydown(e) {
    if (e.key === 'Escape' && this.state.quiz.active) {
      this.endQuiz();
    }
  }

  load() {
    const saved = localStorage.getItem('pao_decks');
    if (saved) {
      this.state.decks = JSON.parse(saved);
    } else {
      // Seed with a tiny sample deck
      this.state.decks = [
        {
          id: 'default',
          name: 'Default PAO',
          cards: [
            { id: 'pao-00', number: '00', initials: 'AA', emoji: '🦸', person: 'Albert Einstein', action: 'solving', object: 'blackboard', imageUrl: '' },
            { id: 'pao-01', number: '01', initials: 'BB', emoji: '🎸', person: 'Beyoncé', action: 'singing', object: 'microphone', imageUrl: '' },
            { id: 'pao-02', number: '02', initials: 'CC', emoji: '🏆', person: 'Cristiano Ronaldo', action: 'kicking', object: 'soccer ball', imageUrl: '' }
          ]
        }
      ];
      this.save();
    }
  }

  save() {
    localStorage.setItem('pao_decks', JSON.stringify(this.state.decks));
  }

  get currentDeck() {
    return this.state.decks.find(d => d.id === this.state.currentDeckId) || this.state.decks[0];
  }

  setState(partial) {
    this.state = { ...this.state, ...partial };
    this.render();
    this.save();
  }

  updateFilter(key, value) {
    const filters = { ...this.state.filters, [key]: value };
    this.setState({ filters });
  }

  toggleSelect(cardId) {
    const selected = new Set(this.state.selectedIds);
    if (selected.has(cardId)) selected.delete(cardId); else selected.add(cardId);
    this.setState({ selectedIds: selected });
  }

  clearSelection() {
    this.setState({ selectedIds: new Set() });
  }

  filteredCards() {
    const { search, filters } = this.state;
    const query = search.trim().toLowerCase();
    return this.currentDeck.cards.filter(c => {
      const matchesSearch = !query || [c.person, c.action, c.object, c.number, c.initials, c.emoji]
        .filter(Boolean)
        .some(v => String(v).toLowerCase().includes(query));
      const matchesNumber = !filters.number || String(c.number).includes(filters.number);
      const matchesInitials = !filters.initials || (c.initials || '').toLowerCase().includes(filters.initials.toLowerCase());
      const matchesEmoji = !filters.emoji || (c.emoji || '').includes(filters.emoji);
      return matchesSearch && matchesNumber && matchesInitials && matchesEmoji;
    });
  }

  deleteSelected() {
    if (!this.state.selectedIds.size) return;
    const deck = this.currentDeck;
    deck.cards = deck.cards.filter(c => !this.state.selectedIds.has(c.id));
    this.clearSelection();
    this.render();
    this.save();
  }

  batchEditMetadata() {
    if (!this.state.selectedIds.size) return;
    const emoji = prompt('Set emoji for selected (leave blank to skip):', '');
    const initials = prompt('Set initials for selected (leave blank to skip):', '');
    const deck = this.currentDeck;
    deck.cards = deck.cards.map(c => {
      if (!this.state.selectedIds.has(c.id)) return c;
      return { ...c, emoji: emoji !== null && emoji !== '' ? emoji : c.emoji, initials: initials !== null && initials !== '' ? initials : c.initials };
    });
    this.clearSelection();
    this.render();
    this.save();
  }

  async generateImageFor(card) {
    const prompt = `${card.person} ${card.action} ${card.object}`.trim();
    let url;

    // Use img2img if we already have an image
    if (card.imageUrl && card.imageUrl.startsWith('http')) {
      try {
        console.log(`[PAOView] Requesting image edit for: "${prompt}"`);
        const response = await fetch(card.imageUrl);
        const blob = await response.blob();
        url = await this.qwen.editImage(prompt, blob);
      } catch (e) {
        console.warn('[PAOView] Image edit failed, falling back to generation:', e);
        url = await this.qwen.generateImage(prompt);
      }
    } else {
      console.log(`[PAOView] Requesting new image for: "${prompt}"`);
      url = await this.qwen.generateImage(prompt);
    }

    if (url) {
      card.imageUrl = url;
      this.render();
      this.save();
    }
  }

  startQuiz() {
    const pool = this.filteredCards();
    if (pool.length === 0) return;
    const current = pool[Math.floor(Math.random() * pool.length)];
    this.setState({ quiz: { active: true, score: 0, total: 0, current, answers: { person: '', action: '', object: '' } } });
  }

  submitQuizAnswer() {
    const { quiz } = this.state;
    if (!quiz.active || !quiz.current) return;
    const { person, action, object } = quiz.answers;
    let points = 0;
    if ((person || '').trim().toLowerCase() === (quiz.current.person || '').trim().toLowerCase()) points += 1;
    if ((action || '').trim().toLowerCase() === (quiz.current.action || '').trim().toLowerCase()) points += 1;
    if ((object || '').trim().toLowerCase() === (quiz.current.object || '').trim().toLowerCase()) points += 1;
    const score = quiz.score + points;
    const total = quiz.total + 3;
    // Next question
    const pool = this.filteredCards();
    const next = pool[Math.floor(Math.random() * pool.length)];
    this.setState({ quiz: { active: true, score, total, current: next, answers: { person: '', action: '', object: '' } } });
    // Persist lightweight progress
    const progress = JSON.parse(localStorage.getItem('pao_quiz_progress') || '[]');
    progress.push({ ts: Date.now(), deckId: this.currentDeck.id, points, total: 3 });
    localStorage.setItem('pao_quiz_progress', JSON.stringify(progress.slice(-200)));
  }

  endQuiz() {
    this.setState({ quiz: { active: false, score: 0, total: 0, current: null, answers: { person: '', action: '', object: '' } } });
  }

  render() {
    if (!this.root) return;
    const cards = this.filteredCards();
    const hasSelection = this.state.selectedIds.size > 0;

    this.root.innerHTML = `
      <div class="pao-header">
        <div class="left">
          <button class="btn btn-arcade" data-action="close">⟵ Back</button>
        </div>
        <div class="center">
          <input class="pao-search" type="text" placeholder="Search person, action, object, number, initials, emoji" value="${this.state.search}">
          <div class="pao-filters">
            <input type="text" class="filter-number" placeholder="#" value="${this.state.filters.number}">
            <input type="text" class="filter-initials" placeholder="Initials" value="${this.state.filters.initials}">
            <input type="text" class="filter-emoji" placeholder="Emoji" value="${this.state.filters.emoji}">
          </div>
        </div>
        <div class="right">
          <button class="btn btn-neon" data-action="start-quiz">🧠 Start Quiz</button>
        </div>
      </div>

      <div class="pao-bulk ${hasSelection ? 'visible' : ''}">
        <span>${this.state.selectedIds.size} selected</span>
        <button class="btn" data-action="delete-selected">Delete</button>
        <button class="btn" data-action="batch-edit">Batch Edit Metadata</button>
      </div>

      <div class="pao-grid">
        ${cards.map(c => `
          <div class="pao-card">
            <label class="select">
              <input type="checkbox" data-select-id="${c.id}" ${this.state.selectedIds.has(c.id) ? 'checked' : ''}>
            </label>
            <div class="card-preview" data-card-id="${c.id}">
              <div class="card-inner">
                <div class="card-face card-front">
                  <div class="meta-row">
                    <span class="number">${c.number || ''}</span>
                    <span class="initials">${c.initials || ''}</span>
                    <span class="emoji">${c.emoji || ''}</span>
                  </div>
                  <div class="image" style="background-image:url('${c.imageUrl || ''}')"></div>
                  <div class="pao-text">
                    <div class="person">${c.person || ''}</div>
                    <div class="action">${c.action || ''}</div>
                    <div class="object">${c.object || ''}</div>
                  </div>
                  <div class="actions">
                    <button class="mini" data-generate-id="${c.id}">AI Image</button>
                  </div>
                </div>
                <div class="card-face card-back">
                  <div class="playing-back">PAO</div>
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      ${this.state.quiz.active ? `
        <div class="pao-quiz-overlay">
          <div class="pao-quiz">
            <div class="quiz-header">
              <div>Score: ${this.state.quiz.score}/${this.state.quiz.total}</div>
              <button class="mini" data-action="end-quiz">Exit</button>
            </div>
            <div class="quiz-body">
              <div class="quiz-prompt">Number: <strong>${this.state.quiz.current?.number || ''}</strong></div>
              <div class="quiz-inputs">
                <input type="text" class="quiz-input" data-q="person" placeholder="Person" value="${this.state.quiz.answers.person}">
                <input type="text" class="quiz-input" data-q="action" placeholder="Action" value="${this.state.quiz.answers.action}">
                <input type="text" class="quiz-input" data-q="object" placeholder="Object" value="${this.state.quiz.answers.object}">
              </div>
              <button class="btn btn-gradient" data-action="submit-quiz">Submit</button>
            </div>
          </div>
        </div>
      ` : ''}
    `;

    // Wire header controls
    this.root.querySelector('[data-action="close"]').onclick = () => this.hide();
    this.root.querySelector('[data-action="start-quiz"]').onclick = () => this.startQuiz();

    // Search + filters
    this.root.querySelector('.pao-search').oninput = (e) => this.setState({ search: e.target.value });
    this.root.querySelector('.filter-number').oninput = (e) => this.updateFilter('number', e.target.value);
    this.root.querySelector('.filter-initials').oninput = (e) => this.updateFilter('initials', e.target.value);
    this.root.querySelector('.filter-emoji').oninput = (e) => this.updateFilter('emoji', e.target.value);

    // Bulk actions
    const delBtn = this.root.querySelector('[data-action="delete-selected"]');
    if (delBtn) delBtn.onclick = () => this.deleteSelected();
    const batchBtn = this.root.querySelector('[data-action="batch-edit"]');
    if (batchBtn) batchBtn.onclick = () => this.batchEditMetadata();

    // Card interactions
    this.root.querySelectorAll('input[data-select-id]').forEach(cb => {
      cb.onchange = (e) => this.toggleSelect(e.target.getAttribute('data-select-id'));
    });
    this.root.querySelectorAll('.card-preview').forEach(el => {
      el.onclick = () => el.classList.toggle('flipped');
    });
    this.root.querySelectorAll('button[data-generate-id]').forEach(btn => {
      btn.onclick = async (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-generate-id');
        const card = this.currentDeck.cards.find(c => c.id === id);
        if (card) await this.generateImageFor(card);
      };
    });

    // Quiz controls
    const endQuizBtn = this.root.querySelector('[data-action="end-quiz"]');
    if (endQuizBtn) endQuizBtn.onclick = () => this.endQuiz();
    const submitQuizBtn = this.root.querySelector('[data-action="submit-quiz"]');
    if (submitQuizBtn) submitQuizBtn.onclick = () => this.submitQuizAnswer();
    this.root.querySelectorAll('.quiz-input').forEach(inp => {
      inp.oninput = (e) => {
        const key = e.target.getAttribute('data-q');
        const quiz = { ...this.state.quiz, answers: { ...this.state.quiz.answers, [key]: e.target.value } };
        this.setState({ quiz });
      };
      inp.onkeydown = (e) => { if (e.key === 'Enter') this.submitQuizAnswer(); };
    });
  }

  show() { if (this.root) this.root.classList.add('active'); }
  hide() { if (this.root) this.root.classList.remove('active'); }
}

export default PAOView;