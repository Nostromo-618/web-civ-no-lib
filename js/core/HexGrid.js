'use strict';

import { hexToPixel, pixelToHex } from '../utils/hex-math.js';

/**
 * Manages a rectangular hex grid with flat-top orientation
 */
export class HexGrid {
    #hexes = new Map();
    #size;
    #width;
    #height;

    /**
     * Create a new hex grid
     * @param {number} size - Hex radius in pixels
     * @param {number} width - Grid width in hexes
     * @param {number} height - Grid height in hexes
     */
    constructor(size, width, height) {
        this.#size = size;
        this.#width = width;
        this.#height = height;

        this.#generateGrid();
    }

    #generateGrid() {
        for (let r = 0; r < this.#height; r++) {
            for (let q = 0; q < this.#width; q++) {
                const pixel = hexToPixel(q, r, this.#size);
                this.#hexes.set(`${q},${r}`, { q, r, x: pixel.x, y: pixel.y });
            }
        }
    }

    /**
     * Convert hex coordinates to pixel coordinates
     * @param {number} q - Hex column
     * @param {number} r - Hex row
     * @returns {{x: number, y: number}} Pixel coordinates
     */
    hexToPixel(q, r) {
        return hexToPixel(q, r, this.#size);
    }

    /**
     * Convert pixel coordinates to hex coordinates
     * @param {number} px - Pixel X
     * @param {number} py - Pixel Y
     * @returns {{q: number, r: number}} Hex coordinates
     */
    pixelToHex(px, py) {
        return pixelToHex(px, py, this.#size);
    }

    /**
     * Iterate over all hexes in the grid
     * @param {function} callback - Called with each hex object
     */
    forEach(callback) {
        this.#hexes.forEach((hex) => callback(hex));
    }

    /**
     * Check if a hex exists at the given coordinates
     * @param {number} q - Hex column
     * @param {number} r - Hex row
     * @returns {boolean}
     */
    hasHex(q, r) {
        return this.#hexes.has(`${q},${r}`);
    }

    /**
     * Get hex data at the given coordinates
     * @param {number} q - Hex column
     * @param {number} r - Hex row
     * @returns {{q: number, r: number, x: number, y: number}|undefined}
     */
    getHex(q, r) {
        return this.#hexes.get(`${q},${r}`);
    }

    get width() {
        return this.#width;
    }

    get height() {
        return this.#height;
    }

    get size() {
        return this.#size;
    }
}
