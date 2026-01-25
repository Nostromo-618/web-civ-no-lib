'use strict';

/**
 * Sprite Manager - Loads and manages sprite images
 */
class SpriteManager {
    #sprites = new Map();
    #loaded = false;
    #loadPromise = null;

    /**
     * Load all game sprites
     * @returns {Promise} Resolves when all sprites are loaded
     */
    async loadAll() {
        if (this.#loadPromise) return this.#loadPromise;

        const spriteList = [
            { name: 'warrior', path: 'assets/sprites/warrior.png' },
            { name: 'settler', path: 'assets/sprites/settler.png' },
            { name: 'city', path: 'assets/sprites/city.png' }
        ];

        this.#loadPromise = Promise.all(
            spriteList.map(sprite => this.#loadSprite(sprite.name, sprite.path))
        ).then(() => {
            this.#loaded = true;
        });

        return this.#loadPromise;
    }

    /**
     * Load a single sprite
     */
    async #loadSprite(name, path) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.#sprites.set(name, img);
                resolve();
            };
            img.onerror = () => {
                console.warn(`Failed to load sprite: ${path}`);
                resolve(); // Don't fail the whole load
            };
            img.src = path;
        });
    }

    /**
     * Get a sprite by name
     * @param {string} name - Sprite name
     * @returns {Image|null} The sprite image or null
     */
    get(name) {
        return this.#sprites.get(name) || null;
    }

    /**
     * Check if sprites are loaded
     */
    isLoaded() {
        return this.#loaded;
    }
}

// Singleton instance
export const spriteManager = new SpriteManager();
