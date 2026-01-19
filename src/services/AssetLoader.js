/**
 * AssetLoader - Preloading Service
 * 
 * Ensures all critical assets (images, fonts, sounds) are memory-resident
 * before the game interaction begins. eliminates "pop-in" and layout jank.
 */

import { soundManager } from './soundManager.js';

// Global asset manifest
const ASSET_MANIFEST = {
	images: [
		'assets/images/host/alex-trebek-pixel.png',
		'assets/images/host/trebek-idle.png',
		'assets/images/host/trebek-reaction.png'
	],
	fonts: [
		// Fonts are usually handled by CSS, but we can verify load here
		'Korinna',
		'Press Start 2P'
	]
};

export class AssetLoader {
	constructor() {
		this.total = 0;
		this.loaded = 0;
		this.errors = 0;
	}

	/**
	 * Start the loading process
	 * @returns {Promise<void>}
	 */
	async loadAll() {
		console.time('[AssetLoader]');

		// 1. Initialize Audio Context (requires user interaction usually, 
		// strictly speaking we prep the buffers here, context resumes later)
		await soundManager.init();

		// 2. Queue Critical Sounds
		const sounds = ['click', 'hover', 'correct', 'incorrect', 'buzzer', 'theme'];
		const soundPromises = sounds.map(s => soundManager.loadSound(s));

		// 3. Queue Images
		const imagePromises = ASSET_MANIFEST.images.map(src => this.loadImage(src));

		// 4. Wait for Fonts
		const fontPromise = document.fonts.ready;

		// Execute
		const tasks = [...soundPromises, ...imagePromises, fontPromise];
		this.total = tasks.length;

		await Promise.allSettled(tasks);

		console.timeEnd('[AssetLoader]');
		console.log(`[🚀] AssetLoader finished. ${this.loaded}/${this.total} loaded.`);
	}

	loadImage(src) {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = () => {
				this.loaded++;
				resolve(src);
			};
			img.onerror = () => {
				this.errors++;
				console.warn(`[AssetLoader] Failed to load image: ${src}`);
				reject(src);
			};
			img.src = src;
		});
	}
}

export const assetLoader = new AssetLoader();
