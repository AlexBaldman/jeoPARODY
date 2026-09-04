/**
 * Asset Library & Tagging System
 * 
 * Carmack's principle: "Simple cataloging, no complex databases."
 * 
 * Provides:
 * - Asset metadata cataloging
 * - Tag-based organization and filtering
 * - Usage tracking and optimization hints
 * - Asset discovery and search
 * 
 * @module services/AssetLibrary
 */

import { eventBus } from '../utils/events.js';

/**
 * Asset types
 */
export const ASSET_TYPES = {
  IMAGE: 'image',
  AUDIO: 'audio',
  FONT: 'font',
  VIDEO: 'video',
  DATA: 'data',
  SCRIPT: 'script'
};

/**
 * Asset tags
 */
export const ASSET_TAGS = {
  // Eras/Periods
  ERA_80S: 'era:80s',
  ERA_90S: 'era:90s',
  ERA_2000S: 'era:2000s',
  ERA_MODERN: 'era:modern',
  
  // Moods
  MOOD_FRIENDLY: 'mood:friendly',
  MOOD_SERIOUS: 'mood:serious',
  MOOD_PLAYFUL: 'mood:playful',
  MOOD_DRAMATIC: 'mood:dramatic',
  MOOD_COSMIC: 'mood:cosmic',
  
  // Categories
  CATEGORY_HOST: 'category:host',
  CATEGORY_TITLE: 'category:title',
  CATEGORY_UI: 'category:ui',
  CATEGORY_BACKGROUND: 'category:background',
  CATEGORY_ICON: 'category:icon',
  
  // Audio types
  AUDIO_CORRECT: 'audio:correct',
  AUDIO_WRONG: 'audio:wrong',
  AUDIO_STREAK: 'audio:streak',
  AUDIO_THEME: 'audio:theme',
  AUDIO_HOST: 'audio:host',
  
  // Usage
  USAGE_SPLASH: 'usage:splash',
  USAGE_GAMEPLAY: 'usage:gameplay',
  USAGE_MENU: 'usage:menu',
  USAGE_PRINT: 'usage:print',
  
  // Quality
  HIGH_RES: 'quality:high-res',
  OPTIMIZED: 'quality:optimized',
  LEGACY: 'quality:legacy',
  
  // Format
  FORMAT_PNG: 'format:png',
  FORMAT_JPG: 'format:jpg',
  FORMAT_WEBP: 'format:webp',
  FORMAT_SVG: 'format:svg',
  FORMAT_MP3: 'format:mp3',
  FORMAT_WAV: 'format:wav',
  FORMAT_WOFF2: 'format:woff2',
  FORMAT_TTF: 'format:ttf'
};

/**
 * Asset metadata structure
 */
export class AssetMetadata {
  constructor({
    id,
    path,
    type,
    tags = [],
    size = 0,
    dimensions = null,
    duration = null,
    lastModified = null,
    usageCount = 0,
    lastUsed = null,
    description = ''
  }) {
    this.id = id;
    this.path = path;
    this.type = type;
    this.tags = new Set(tags);
    this.size = size;
    this.dimensions = dimensions; // { width, height } for images
    this.duration = duration; // seconds for audio/video
    this.lastModified = lastModified;
    this.usageCount = usageCount;
    this.lastUsed = lastUsed;
    this.description = description;
  }
  
  /**
   * Check if asset has a specific tag
   */
  hasTag(tag) {
    return this.tags.has(tag);
  }
  
  /**
   * Add a tag
   */
  addTag(tag) {
    this.tags.add(tag);
  }
  
  /**
   * Remove a tag
   */
  removeTag(tag) {
    this.tags.delete(tag);
  }
  
  /**
   * Get all tags as array
   */
  getTags() {
    return Array.from(this.tags);
  }
  
  /**
   * Increment usage count
   */
  recordUsage() {
    this.usageCount++;
    this.lastUsed = new Date().toISOString();
  }
  
  /**
   * Check if asset is large (needs optimization)
   */
  isLarge() {
    if (this.type === ASSET_TYPES.IMAGE) {
      return this.size > 500000; // 500KB
    }
    if (this.type === ASSET_TYPES.AUDIO) {
      return this.size > 1000000; // 1MB
    }
    return false;
  }
  
  /**
   * Get optimization suggestions
   */
  getOptimizationSuggestions() {
    const suggestions = [];
    
    if (this.isLarge()) {
      if (this.type === ASSET_TYPES.IMAGE) {
        if (this.hasTag(ASSET_TAGS.FORMAT_PNG)) {
          suggestions.push('Consider converting to WebP for better compression');
        }
        if (this.dimensions && (this.dimensions.width > 2000 || this.dimensions.height > 2000)) {
          suggestions.push('Consider resizing to reduce dimensions');
        }
      }
      if (this.type === ASSET_TYPES.AUDIO) {
        if (this.hasTag(ASSET_TAGS.FORMAT_WAV)) {
          suggestions.push('Consider converting to MP3 for better compression');
        }
      }
    }
    
    if (this.usageCount === 0) {
      suggestions.push('Asset not used - consider removing');
    }
    
    return suggestions;
  }
}

/**
 * Asset Library Service
 * Manages asset cataloging, tagging, and discovery
 */
export class AssetLibrary {
  constructor() {
    this.assets = new Map();
    this.eventBus = eventBus;
    this.initialized = false;
  }
  
  /**
   * Initialize the asset library
   */
  async initialize() {
    if (this.initialized) return;
    
    // Load asset manifest if exists
    await this.loadAssetManifest();
    
    // Scan assets if manifest doesn't exist
    if (this.assets.size === 0) {
      await this.scanAssets();
    }
    
    this.initialized = true;
    console.log('[📚 AssetLibrary] Initialized with', this.assets.size, 'assets');
  }
  
  /**
   * Scan assets directory and catalog them
   */
  async scanAssets() {
    // This would normally scan the file system
    // For now, we'll create a manual catalog of known assets
    
    this.catalogKnownAssets();
    await this.saveAssetManifest();
  }
  
  /**
   * Catalog known assets (manual catalog for now)
   */
  catalogKnownAssets() {
    // Host images
    this.addAsset(new AssetMetadata({
      id: 'trebek-dope-01',
      path: 'assets/images/trebek/trebek-dope-01.png',
      type: ASSET_TYPES.IMAGE,
      tags: [ASSET_TAGS.CATEGORY_HOST, ASSET_TAGS.MOOD_FRIENDLY, ASSET_TAGS.ERA_90S, ASSET_TAGS.FORMAT_PNG],
      description: 'Trebek in dope pose #1'
    }));
    
    this.addAsset(new AssetMetadata({
      id: 'trebek-dope-02',
      path: 'assets/images/trebek/trebek-dope-02.png',
      type: ASSET_TYPES.IMAGE,
      tags: [ASSET_TAGS.CATEGORY_HOST, ASSET_TAGS.MOOD_PLAYFUL, ASSET_TAGS.ERA_90S, ASSET_TAGS.FORMAT_PNG],
      description: 'Trebek in dope pose #2'
    }));
    
    this.addAsset(new AssetMetadata({
      id: 'trebek-good-01',
      path: 'assets/images/trebek/trebek-good-01.png',
      type: ASSET_TYPES.IMAGE,
      tags: [ASSET_TAGS.CATEGORY_HOST, ASSET_TAGS.MOOD_SERIOUS, ASSET_TAGS.ERA_2000S, ASSET_TAGS.FORMAT_PNG],
      description: 'Trebek in good pose #1'
    }));
    
    this.addAsset(new AssetMetadata({
      id: 'trebek-coy-angel',
      path: 'assets/images/trebek/trebek-coy-angel.png',
      type: ASSET_TYPES.IMAGE,
      tags: [ASSET_TAGS.CATEGORY_HOST, ASSET_TAGS.MOOD_PLAYFUL, ASSET_TAGS.ERA_90S, ASSET_TAGS.FORMAT_PNG],
      description: 'Trebek coy angel pose'
    }));
    
    this.addAsset(new AssetMetadata({
      id: 'trebek-smarmy-mafioso',
      path: 'assets/images/trebek/trebek-smarmy-mafioso.png',
      type: ASSET_TYPES.IMAGE,
      tags: [ASSET_TAGS.CATEGORY_HOST, ASSET_TAGS.MOOD_DRAMATIC, ASSET_TAGS.ERA_80S, ASSET_TAGS.FORMAT_PNG],
      description: 'Trebek smarmy mafioso pose'
    }));
    
    // Title images
    this.addAsset(new AssetMetadata({
      id: 'title-pixelart',
      path: 'assets/images/title/title-jeopardish!-pixelart.png',
      type: ASSET_TYPES.IMAGE,
      tags: [ASSET_TAGS.CATEGORY_TITLE, ASSET_TAGS.USAGE_SPLASH, ASSET_TAGS.FORMAT_PNG],
      description: 'Pixel art title screen'
    }));
    
    // Favicon
    this.addAsset(new AssetMetadata({
      id: 'favicon-svg',
      path: 'assets/images/favicon/favicon.svg',
      type: ASSET_TYPES.IMAGE,
      tags: [ASSET_TAGS.CATEGORY_ICON, ASSET_TAGS.FORMAT_SVG, ASSET_TAGS.OPTIMIZED],
      description: 'SVG favicon'
    }));
    
    // Audio files
    this.addAsset(new AssetMetadata({
      id: 'audio-player-select',
      path: 'assets/audio/trebek/3018895-alx-player-select.mp3',
      type: ASSET_TYPES.AUDIO,
      tags: [ASSET_TAGS.AUDIO_HOST, ASSET_TAGS.USAGE_GAMEPLAY, ASSET_TAGS.FORMAT_MP3],
      description: 'Player select sound effect'
    }));
    
    this.addAsset(new AssetMetadata({
      id: 'audio-final-clue',
      path: 'assets/audio/trebek/3018574-alx-final-clue-1000.mp3',
      type: ASSET_TYPES.AUDIO,
      tags: [ASSET_TAGS.AUDIO_DRAMATIC, ASSET_TAGS.USAGE_GAMEPLAY, ASSET_TAGS.FORMAT_MP3],
      description: 'Final clue sound effect'
    }));
    
    // Fonts
    this.addAsset(new AssetMetadata({
      id: 'font-korinna-normal',
      path: 'assets/fonts/KorinnaNormal.woff2',
      type: ASSET_TYPES.FONT,
      tags: [ASSET_TAGS.FORMAT_WOFF2, ASSET_TAGS.OPTIMIZED],
      description: 'Korinna Normal font'
    }));
    
    this.addAsset(new AssetMetadata({
      id: 'font-korinna-bold',
      path: 'assets/fonts/KorinnaBold.woff2',
      type: ASSET_TYPES.FONT,
      tags: [ASSET_TAGS.FORMAT_WOFF2, ASSET_TAGS.OPTIMIZED],
      description: 'Korinna Bold font'
    }));
  }
  
  /**
   * Add an asset to the library
   */
  addAsset(asset) {
    this.assets.set(asset.id, asset);
  }
  
  /**
   * Get an asset by ID
   */
  getAsset(id) {
    return this.assets.get(id);
  }
  
  /**
   * Get all assets
   */
  getAllAssets() {
    return Array.from(this.assets.values());
  }
  
  /**
   * Filter assets by tags
   */
  filterByTags(tags) {
    const tagSet = new Set(Array.isArray(tags) ? tags : [tags]);
    return this.getAllAssets().filter(asset => {
      return Array.from(tagSet).every(tag => asset.hasTag(tag));
    });
  }
  
  /**
   * Filter assets by type
   */
  filterByType(type) {
    return this.getAllAssets().filter(asset => asset.type === type);
  }
  
  /**
   * Search assets by description or ID
   */
  search(query) {
    const lowerQuery = query.toLowerCase();
    return this.getAllAssets().filter(asset => {
      return asset.id.toLowerCase().includes(lowerQuery) ||
             asset.description.toLowerCase().includes(lowerQuery) ||
             asset.path.toLowerCase().includes(lowerQuery);
    });
  }
  
  /**
   * Get assets that need optimization
   */
  getAssetsNeedingOptimization() {
    return this.getAllAssets().filter(asset => asset.isLarge());
  }
  
  /**
   * Get unused assets
   */
  getUnusedAssets() {
    return this.getAllAssets().filter(asset => asset.usageCount === 0);
  }
  
  /**
   * Get assets by category
   */
  getAssetsByCategory(category) {
    const categoryTag = `category:${category}`;
    return this.filterByTags(categoryTag);
  }
  
  /**
   * Get assets by era
   */
  getAssetsByEra(era) {
    const eraTag = `era:${era}`;
    return this.filterByTags(eraTag);
  }
  
  /**
   * Get assets by mood
   */
  getAssetsByMood(mood) {
    const moodTag = `mood:${mood}`;
    return this.filterByTags(moodTag);
  }
  
  /**
   * Record asset usage
   */
  recordUsage(assetId) {
    const asset = this.getAsset(assetId);
    if (asset) {
      asset.recordUsage();
      this.eventBus.emit('asset:used', { assetId });
    }
  }
  
  /**
   * Get library statistics
   */
  getStatistics() {
    const assets = this.getAllAssets();
    const typeStats = {};
    const tagStats = {};
    let totalSize = 0;
    
    assets.forEach(asset => {
      // Type stats
      typeStats[asset.type] = (typeStats[asset.type] || 0) + 1;
      
      // Tag stats
      asset.getTags().forEach(tag => {
        tagStats[tag] = (tagStats[tag] || 0) + 1;
      });
      
      // Size
      totalSize += asset.size;
    });
    
    return {
      totalAssets: assets.length,
      totalSize,
      typeStats,
      tagStats,
      largeAssets: assets.filter(a => a.isLarge()).length,
      unusedAssets: assets.filter(a => a.usageCount === 0).length
    };
  }
  
  /**
   * Save asset manifest to localStorage
   */
  async saveAssetManifest() {
    try {
      const manifest = Array.from(this.assets.entries()).map(([id, asset]) => ({
        id,
        path: asset.path,
        type: asset.type,
        tags: asset.getTags(),
        size: asset.size,
        dimensions: asset.dimensions,
        duration: asset.duration,
        lastModified: asset.lastModified,
        usageCount: asset.usageCount,
        lastUsed: asset.lastUsed,
        description: asset.description
      }));
      
      localStorage.setItem('jeoparody_asset_manifest', JSON.stringify(manifest));
    } catch (error) {
      console.error('[📚 AssetLibrary] Failed to save manifest:', error);
    }
  }
  
  /**
   * Load asset manifest from localStorage
   */
  async loadAssetManifest() {
    try {
      const manifest = localStorage.getItem('jeoparody_asset_manifest');
      if (manifest) {
        const assets = JSON.parse(manifest);
        assets.forEach(assetData => {
          const asset = new AssetMetadata(assetData);
          this.addAsset(asset);
        });
      }
    } catch (error) {
      console.error('[📚 AssetLibrary] Failed to load manifest:', error);
    }
  }
  
  /**
   * Export library as JSON
   */
  exportLibrary() {
    return {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      statistics: this.getStatistics(),
      assets: this.getAllAssets().map(asset => ({
        id: asset.id,
        path: asset.path,
        type: asset.type,
        tags: asset.getTags(),
        size: asset.size,
        description: asset.description,
        usageCount: asset.usageCount,
        lastUsed: asset.lastUsed,
        optimizationSuggestions: asset.getOptimizationSuggestions()
      }))
    };
  }
}

/**
 * Create an asset library instance
 */
export function createAssetLibrary() {
  return new AssetLibrary();
}

/**
 * Global asset library instance
 */
let globalAssetLibrary = null;

/**
 * Get or create the global asset library instance
 */
export function getAssetLibrary() {
  if (!globalAssetLibrary) {
    globalAssetLibrary = createAssetLibrary();
  }
  return globalAssetLibrary;
}
