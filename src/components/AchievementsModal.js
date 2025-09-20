/**
 * AchievementsModal Component
 * Modern achievement system with progress tracking and animations
 * 
 * Carmack principle: "Simple mechanics, complex emergent behavior"
 */

import Modal from './Modal.js';
import { createElement } from '../utils/helpers.js';

export class AchievementsModal extends Modal {
    constructor(store, eventBus) {
        super(store, eventBus, {
            modalId: 'achievements-modal',
            title: 'Achievements'
        });
        
        // Achievement definitions
        this.achievements = [
            {
                id: 'first-correct',
                icon: 'trophy',
                name: 'First Victory',
                description: 'Answer your first question correctly',
                requirement: { type: 'correct', value: 1 },
                rarity: 'common'
            },
            {
                id: 'streak-5',
                icon: 'fire',
                name: 'Hot Streak',
                description: 'Get a 5-question streak',
                requirement: { type: 'streak', value: 5 },
                rarity: 'uncommon'
            },
            {
                id: 'score-1000',
                icon: 'star',
                name: 'Big Money',
                description: 'Score $1000 in a single game',
                requirement: { type: 'score', value: 1000 },
                rarity: 'rare'
            },
            {
                id: 'perfect-game',
                icon: 'crown',
                name: 'Flawless Victory',
                description: 'Answer 10 questions correctly without any mistakes',
                requirement: { type: 'perfect', value: 10 },
                rarity: 'legendary'
            },
            {
                id: 'speed-demon',
                icon: 'bolt',
                name: 'Lightning Round',
                description: 'Answer 5 questions in under 60 seconds',
                requirement: { type: 'speed', value: 5, time: 60 },
                rarity: 'rare'
            },
            {
                id: 'category-master',
                icon: 'brain',
                name: 'Subject Expert',
                description: 'Get 20 correct answers in any single category',
                requirement: { type: 'category', value: 20 },
                rarity: 'epic'
            },
            {
                id: 'persistence',
                icon: 'shield-alt',
                name: 'Dedicated Scholar',
                description: 'Play on 7 different days',
                requirement: { type: 'days', value: 7 },
                rarity: 'uncommon'
            },
            {
                id: 'trivia-master',
                icon: 'graduation-cap',
                name: 'Trivia Master',
                description: 'Answer 100 questions correctly',
                requirement: { type: 'total_correct', value: 100 },
                rarity: 'epic'
            },
            {
                id: 'high-roller',
                icon: 'gem',
                name: 'High Roller',
                description: 'Score $5000 total across all games',
                requirement: { type: 'total_score', value: 5000 },
                rarity: 'legendary'
            }
        ];
        
        this.loadProgress();
    }

    setupEventListeners() {
        super.setupEventListeners();
        
        // Listen for game events to check achievements
        this.eventBus.on('game:answer:correct', this.handleCorrectAnswer.bind(this));
        this.eventBus.on('game:streak:updated', this.handleStreakUpdate.bind(this));
        this.eventBus.on('game:score:updated', this.handleScoreUpdate.bind(this));
        this.eventBus.on('game:ended', this.checkAllAchievements.bind(this));
    }

    loadProgress() {
        const saved = localStorage.getItem('jeopardish_achievements');
        if (saved) {
            try {
                this.earnedAchievements = JSON.parse(saved);
            } catch (e) {
                this.earnedAchievements = {};
            }
        } else {
            this.earnedAchievements = {};
        }
        
        // Load statistics
        const stats = localStorage.getItem('jeopardish_stats');
        if (stats) {
            try {
                this.stats = JSON.parse(stats);
            } catch (e) {
                this.stats = this.getDefaultStats();
            }
        } else {
            this.stats = this.getDefaultStats();
        }
    }

    getDefaultStats() {
        return {
            totalCorrect: 0,
            totalScore: 0,
            bestStreak: 0,
            currentStreak: 0,
            gamesPlayed: 0,
            categoryStats: {},
            playDates: [],
            speedAnswers: 0,
            perfectGames: 0
        };
    }

    saveProgress() {
        localStorage.setItem('jeopardish_achievements', JSON.stringify(this.earnedAchievements));
        localStorage.setItem('jeopardish_stats', JSON.stringify(this.stats));
    }

    handleCorrectAnswer(data) {
        this.stats.totalCorrect++;
        this.stats.currentStreak++;
        this.stats.bestStreak = Math.max(this.stats.bestStreak, this.stats.currentStreak);
        
        // Track category stats
        if (data.category) {
            if (!this.stats.categoryStats[data.category]) {
                this.stats.categoryStats[data.category] = 0;
            }
            this.stats.categoryStats[data.category]++;
        }
        
        // Track speed answers (if answered quickly)
        if (data.answerTime && data.answerTime < 10000) { // 10 seconds
            this.stats.speedAnswers++;
        }
        
        this.saveProgress();
        this.checkAchievements(['first-correct', 'streak-5', 'category-master', 'speed-demon', 'trivia-master']);
    }

    handleStreakUpdate(data) {
        if (data.streak === 0) {
            // Streak broken
            this.stats.currentStreak = 0;
        }
        this.saveProgress();
    }

    handleScoreUpdate(data) {
        this.stats.totalScore += data.scoreChange;
        this.saveProgress();
        this.checkAchievements(['score-1000', 'high-roller']);
    }

    checkAchievements(achievementIds = null) {
        const toCheck = achievementIds || this.achievements.map(a => a.id);
        
        toCheck.forEach(id => {
            if (!this.earnedAchievements[id] && this.isAchievementEarned(id)) {
                this.unlockAchievement(id);
            }
        });
    }

    checkAllAchievements() {
        this.checkAchievements();
    }

    isAchievementEarned(id) {
        const achievement = this.achievements.find(a => a.id === id);
        if (!achievement) return false;

        const req = achievement.requirement;
        
        switch (req.type) {
            case 'correct':
                return this.stats.totalCorrect >= req.value;
            case 'streak':
                return this.stats.bestStreak >= req.value;
            case 'score':
                // Check current game score from store
                const currentScore = this.store.getState().game?.score || 0;
                return currentScore >= req.value;
            case 'total_score':
                return this.stats.totalScore >= req.value;
            case 'total_correct':
                return this.stats.totalCorrect >= req.value;
            case 'category':
                return Object.values(this.stats.categoryStats).some(count => count >= req.value);
            case 'days':
                return this.stats.playDates.length >= req.value;
            case 'speed':
                return this.stats.speedAnswers >= req.value;
            case 'perfect':
                return this.stats.perfectGames >= req.value;
            default:
                return false;
        }
    }

    unlockAchievement(id) {
        const achievement = this.achievements.find(a => a.id === id);
        if (!achievement) return;

        this.earnedAchievements[id] = {
            unlockedAt: Date.now(),
            date: new Date().toISOString()
        };

        this.saveProgress();

        // Emit achievement unlocked event
        this.eventBus.emit('achievement:unlocked', { achievement });

        // Show notification
        this.showAchievementNotification(achievement);

        // Update display if modal is open
        if (this.isOpen) {
            this.render();
        }
    }

    showAchievementNotification(achievement) {
        // Create notification element
        const notification = createElement('div', {
            className: `achievement-notification ${achievement.rarity}`,
            style: `
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(145deg, #2a2a2a, #1e1e1e);
                border: 2px solid #FFD700;
                border-radius: 10px;
                padding: 1rem;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);
                z-index: 10000;
                animation: slideInRight 0.5s ease-out;
                min-width: 300px;
            `
        }, [
            createElement('div', {
                style: 'display: flex; align-items: center; gap: 1rem;'
            }, [
                createElement('i', {
                    className: `fas fa-${achievement.icon}`,
                    style: 'font-size: 2rem; color: #FFD700;'
                }),
                createElement('div', {}, [
                    createElement('h4', {
                        style: 'margin: 0; color: #FFD700; font-size: 1.1rem;'
                    }, ['Achievement Unlocked!']),
                    createElement('h3', {
                        style: 'margin: 0.25rem 0; color: white; font-size: 1.2rem;'
                    }, [achievement.name]),
                    createElement('p', {
                        style: 'margin: 0; color: #ccc; font-size: 0.9rem;'
                    }, [achievement.description])
                ])
            ])
        ]);

        document.body.appendChild(notification);

        // Remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.5s ease-out';
                setTimeout(() => {
                    notification.parentNode.removeChild(notification);
                }, 500);
            }
        }, 5000);
    }

    getProgress(achievement) {
        const req = achievement.requirement;
        
        switch (req.type) {
            case 'correct':
            case 'total_correct':
                return {
                    current: this.stats.totalCorrect,
                    target: req.value
                };
            case 'streak':
                return {
                    current: this.stats.bestStreak,
                    target: req.value
                };
            case 'score':
                const currentScore = this.store.getState().game?.score || 0;
                return {
                    current: currentScore,
                    target: req.value
                };
            case 'total_score':
                return {
                    current: this.stats.totalScore,
                    target: req.value
                };
            case 'category':
                const maxCategory = Math.max(...Object.values(this.stats.categoryStats), 0);
                return {
                    current: maxCategory,
                    target: req.value
                };
            case 'days':
                return {
                    current: this.stats.playDates.length,
                    target: req.value
                };
            case 'speed':
                return {
                    current: this.stats.speedAnswers,
                    target: req.value
                };
            default:
                return { current: 0, target: req.value };
        }
    }

    renderContent() {
        const totalAchievements = this.achievements.length;
        const earnedAchievements = Object.keys(this.earnedAchievements).length;
        const completionPercentage = Math.round((earnedAchievements / totalAchievements) * 100);

        return createElement('div', { className: 'modal-body achievements-content' }, [
            // Summary section
            createElement('div', { 
                className: 'achievements-summary',
                style: `
                    display: flex;
                    justify-content: space-around;
                    text-align: center;
                    margin-bottom: 2rem;
                    padding: 1rem;
                    background: rgba(255, 215, 0, 0.1);
                    border-radius: 10px;
                `
            }, [
                createElement('div', {}, [
                    createElement('div', { 
                        style: 'font-size: 2rem; font-weight: bold; color: #FFD700;' 
                    }, [earnedAchievements.toString()]),
                    createElement('div', { style: 'color: #ccc;' }, ['Earned'])
                ]),
                createElement('div', {}, [
                    createElement('div', { 
                        style: 'font-size: 2rem; font-weight: bold; color: #FFD700;' 
                    }, [totalAchievements.toString()]),
                    createElement('div', { style: 'color: #ccc;' }, ['Total'])
                ]),
                createElement('div', {}, [
                    createElement('div', { 
                        style: 'font-size: 2rem; font-weight: bold; color: #FFD700;' 
                    }, [`${completionPercentage}%`]),
                    createElement('div', { style: 'color: #ccc;' }, ['Complete'])
                ])
            ]),

            // Achievements grid
            createElement('div', {
                className: 'achievements-grid',
                style: `
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 1rem;
                    max-height: 400px;
                    overflow-y: auto;
                `
            }, this.achievements.map(achievement => this.renderAchievement(achievement)))
        ]);
    }

    renderAchievement(achievement) {
        const isEarned = !!this.earnedAchievements[achievement.id];
        const progress = this.getProgress(achievement);
        const progressPercentage = Math.min(100, Math.round((progress.current / progress.target) * 100));
        
        const rarityColors = {
            common: '#95a5a6',
            uncommon: '#27ae60',
            rare: '#3498db',
            epic: '#9b59b6',
            legendary: '#f39c12'
        };
        
        const borderColor = rarityColors[achievement.rarity] || '#95a5a6';

        return createElement('div', {
            className: `achievement-item ${isEarned ? 'earned' : 'locked'}`,
            style: `
                background: linear-gradient(145deg, ${isEarned ? '#2a2a2a' : '#1a1a1a'}, #1e1e1e);
                border: 2px solid ${isEarned ? borderColor : '#444'};
                border-radius: 10px;
                padding: 1rem;
                transition: all 0.3s ease;
                opacity: ${isEarned ? '1' : '0.7'};
            `
        }, [
            createElement('div', {
                style: 'display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;'
            }, [
                createElement('i', {
                    className: `fas fa-${achievement.icon}`,
                    style: `
                        font-size: 2rem;
                        color: ${isEarned ? borderColor : '#666'};
                        ${isEarned ? 'filter: drop-shadow(0 0 10px currentColor);' : ''}
                    `
                }),
                createElement('div', {}, [
                    createElement('h3', {
                        style: `margin: 0; color: ${isEarned ? '#FFD700' : '#ccc'}; font-size: 1.1rem;`
                    }, [achievement.name]),
                    createElement('span', {
                        className: `rarity ${achievement.rarity}`,
                        style: `
                            background: ${borderColor};
                            color: white;
                            padding: 2px 6px;
                            border-radius: 3px;
                            font-size: 0.7rem;
                            text-transform: uppercase;
                        `
                    }, [achievement.rarity])
                ])
            ]),
            
            createElement('p', {
                style: 'margin: 0.5rem 0; color: #ccc; font-size: 0.9rem;'
            }, [achievement.description]),

            // Progress bar (if not earned)
            !isEarned && createElement('div', {
                style: 'margin-top: 1rem;'
            }, [
                createElement('div', {
                    style: `
                        background: #333;
                        height: 8px;
                        border-radius: 4px;
                        overflow: hidden;
                        margin-bottom: 0.5rem;
                    `
                }, [
                    createElement('div', {
                        style: `
                            background: linear-gradient(90deg, ${borderColor}, ${borderColor}aa);
                            height: 100%;
                            width: ${progressPercentage}%;
                            transition: width 0.3s ease;
                        `
                    })
                ]),
                createElement('div', {
                    style: 'display: flex; justify-content: space-between; font-size: 0.8rem; color: #999;'
                }, [
                    createElement('span', {}, [`${progress.current} / ${progress.target}`]),
                    createElement('span', {}, [`${progressPercentage}%`])
                ])
            ]),

            // Earned date (if earned)
            isEarned && createElement('div', {
                style: 'margin-top: 1rem; display: flex; align-items: center; gap: 0.5rem; color: #28a745;'
            }, [
                createElement('i', { className: 'fas fa-check' }),
                createElement('span', { style: 'font-size: 0.8rem;' }, [
                    `Earned ${new Date(this.earnedAchievements[achievement.id].unlockedAt).toLocaleDateString()}`
                ])
            ])
        ]);
    }
}

export default AchievementsModal;
