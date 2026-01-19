/**
 * UserManager - Handles User Identity & Persistence
 * 
 * "Identity is the root of engagement."
 */

import { eventBus } from '../utils/events.js';
import { getGameEngine } from '../core/GameEngine.js';

const STORAGE_KEY = 'jeopardish_user_profile';

export class UserManager {
	constructor() {
		this.engine = getGameEngine();
		this.setupListeners();
	}

	/**
	 * Initialize User Manager
	 */
	init() {
		const savedProfile = this.loadProfile();
		if (savedProfile) {
			console.log('[UserManager] Loaded profile:', savedProfile.name);
			this.engine.updateUser(savedProfile);
		} else {
			console.log('[UserManager] No profile found, using Guest.');
			// Optionally auto-create a profile or stay as guest
		}
	}

	setupListeners() {
		// Auto-save on meaningful updates
		eventBus.on('user:updated', (user) => {
			this.saveProfile(user);
		});

		eventBus.on('user:level-up', () => {
			this.saveProfile(this.engine.state.user);
		});

		eventBus.on('game:engine-stopped', () => {
			this.saveProfile(this.engine.state.user);
		});
	}

	loadProfile() {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			return raw ? JSON.parse(raw) : null;
		} catch (e) {
			console.error('Failed to load user profile', e);
			return null;
		}
	}

	saveProfile(user) {
		if (!user) return;
		// Don't save transient state if any
		const storageData = {
			id: user.id,
			name: user.name,
			xp: user.xp,
			level: user.level,
			avatar: user.avatar,
			preferences: user.preferences
		};
		localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
	}

	/**
	 * Update user name
	 * @param {string} newName 
	 */
	updateName(newName) {
		if (!newName) return;
		this.engine.updateUser({ name: newName });
	}

	/**
	 * Update avatar
	 * @param {string} avatarId 
	 */
	updateAvatar(avatarId) {
		this.engine.updateUser({ avatar: avatarId });
	}

	/**
	 * Factory method for generating a UUID (simple version)
	 */
	generateId() {
		return 'user_' + Math.random().toString(36).substr(2, 9);
	}
}

export const userManager = new UserManager();
