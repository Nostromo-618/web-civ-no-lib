'use strict';

import { getHexCorners } from '../utils/hex-math.js';
import { TERRAIN_COLORS, DEFAULT_TERRAIN_COLOR } from '../data/terrain.js';
import {
    HEX_SIZE,
    BLEED,
    ZOOM_MIN,
    ZOOM_MAX,
    BACKGROUND_COLOR,
    GRID_LINE_COLOR,
    GRID_LINE_ALPHA,
    HIGHLIGHT_COLOR,
    HIGHLIGHT_WIDTH
} from '../config.js';

/**
 * Canvas-based render engine with pan/zoom support
 */
export class RenderEngine {
    #canvas;
    #ctx;
    #transform = { x: 0, y: 0, scale: 1 };
    #grid = null;
    #dataMap = null;
    #gameState = null;
    #selectedHex = null;
    #onHexSelectCallback = null;
    #initialPositionSet = false;

    /**
     * Create a new render engine
     * @param {HTMLCanvasElement} canvas - The canvas element to render to
     */
    constructor(canvas) {
        this.#canvas = canvas;
        this.#ctx = canvas.getContext('2d');

        this.#resize();
        window.addEventListener('resize', () => this.#resize());
        this.#setupInput();
    }

    /**
     * Set the grid and data to render
     * @param {HexGrid} grid - The hex grid
     * @param {Map} dataMap - Map of hex id to data
     */
    setData(grid, dataMap) {
        this.#grid = grid;
        this.#dataMap = dataMap;
    }

    /**
     * Set the game state for rendering nations, cities, and units
     * @param {GameState} gameState - The game state
     */
    setGameState(gameState) {
        this.#gameState = gameState;
    }

    /**
     * Register a callback for hex selection events
     * @param {function} callback - Called with hex data when a hex is selected
     */
    onHexSelect(callback) {
        this.#onHexSelectCallback = callback;
    }

    /**
     * Render the current frame
     */
    render() {
        if (!this.#grid || !this.#dataMap) return;

        const ctx = this.#ctx;
        const dpr = window.devicePixelRatio || 1;

        // Clear canvas
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
        ctx.fillStyle = BACKGROUND_COLOR;
        ctx.fillRect(0, 0, this.#canvas.width, this.#canvas.height);

        // Apply transform (pan/zoom)
        ctx.translate(this.#transform.x, this.#transform.y);
        ctx.scale(this.#transform.scale, this.#transform.scale);

        // Draw terrain (with bleed for seamless look)
        this.#grid.forEach((hex) => {
            const id = `${hex.q},${hex.r}`;
            const data = this.#dataMap.get(id);
            // Handle both HexData objects and plain terrain data for backwards compatibility
            const terrainType = data.terrain ? data.terrain.type : data.type;
            const color = TERRAIN_COLORS[terrainType] || DEFAULT_TERRAIN_COLOR;
            this.#drawHexagon(hex.x, hex.y, HEX_SIZE + BLEED, color, null, 0);
        });

        // Draw grid lines
        this.#grid.forEach((hex) => {
            ctx.globalAlpha = GRID_LINE_ALPHA;
            this.#drawHexagon(hex.x, hex.y, HEX_SIZE, null, GRID_LINE_COLOR, 1);
            ctx.globalAlpha = 1.0;
        });

        // Draw highlight
        if (this.#selectedHex) {
            const hex = this.#grid.getHex(this.#selectedHex.q, this.#selectedHex.r);
            if (hex) {
                this.#drawHexagon(hex.x, hex.y, HEX_SIZE, null, HIGHLIGHT_COLOR, HIGHLIGHT_WIDTH);
            }
        }

        // Draw game entities (nations, cities, units)
        if (this.#gameState) {
            this.#renderNations();
            this.#renderCities();
            this.#renderUnits();
        }
    }

    /**
     * Render nation borders and ownership
     * TODO: Implement rendering of nation-controlled hexes
     * - Draw borders around owned territory
     * - Show nation colors on hexes
     */
    #renderNations() {
        // TODO: Iterate through all nations
        // For each nation, get owned hexes and render borders/colors
    }

    /**
     * Render cities on the map
     * TODO: Implement city rendering
     * - Draw city markers at city positions
     * - Show city names
     * - Display city size/population indicator
     */
    #renderCities() {
        // TODO: Get all cities from all nations
        // For each city, get position and render city marker
    }

    /**
     * Render units on the map
     * TODO: Implement unit rendering
     * - Draw unit icons/sprites at unit positions
     * - Show unit type indicators
     * - Display movement/health status if needed
     */
    #renderUnits() {
        // TODO: Get all units from all nations
        // For each unit, get position and render unit marker
    }

    #resize() {
        const dpr = window.devicePixelRatio || 1;
        this.#canvas.width = window.innerWidth * dpr;
        this.#canvas.height = window.innerHeight * dpr;
        this.#canvas.style.width = `${window.innerWidth}px`;
        this.#canvas.style.height = `${window.innerHeight}px`;
        this.#ctx.scale(dpr, dpr);

        // Center the map initially
        if (!this.#initialPositionSet) {
            this.#transform.x = window.innerWidth / 2 - 400;
            this.#transform.y = window.innerHeight / 2 - 300;
            this.#initialPositionSet = true;
        }

        this.render();
    }

    #screenToWorld(screenX, screenY) {
        return {
            x: (screenX - this.#transform.x) / this.#transform.scale,
            y: (screenY - this.#transform.y) / this.#transform.scale
        };
    }

    #drawHexagon(x, y, size, fillColor, strokeColor, strokeWidth) {
        const corners = getHexCorners(x, y, size);
        const ctx = this.#ctx;

        ctx.beginPath();
        ctx.moveTo(corners[0].x, corners[0].y);
        for (let i = 1; i < 6; i++) {
            ctx.lineTo(corners[i].x, corners[i].y);
        }
        ctx.closePath();

        if (fillColor) {
            ctx.fillStyle = fillColor;
            ctx.fill();
        }

        if (strokeColor) {
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = strokeWidth || 1;
            ctx.stroke();
        }
    }

    #setupInput() {
        let dragging = false;
        let lastPos = null;
        let hasMoved = false;

        // Pan - pointer down
        this.#canvas.addEventListener('pointerdown', (e) => {
            dragging = true;
            hasMoved = false;
            lastPos = { x: e.clientX, y: e.clientY };
        });

        // Pan - pointer move
        this.#canvas.addEventListener('pointermove', (e) => {
            if (!dragging) return;

            const cur = { x: e.clientX, y: e.clientY };
            const dx = cur.x - lastPos.x;
            const dy = cur.y - lastPos.y;

            if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
                hasMoved = true;
            }

            this.#transform.x += dx;
            this.#transform.y += dy;
            lastPos = cur;
            this.render();
        });

        // Pan - pointer up
        const stopDrag = () => {
            dragging = false;
        };
        this.#canvas.addEventListener('pointerup', stopDrag);
        this.#canvas.addEventListener('pointerleave', stopDrag);

        // Click (tap without drag)
        this.#canvas.addEventListener('click', (e) => {
            if (hasMoved) return;
            if (!this.#grid) return;

            const worldPos = this.#screenToWorld(e.clientX, e.clientY);
            const hexCoord = this.#grid.pixelToHex(worldPos.x, worldPos.y);

            if (this.#grid.hasHex(hexCoord.q, hexCoord.r)) {
                this.#selectedHex = hexCoord;
                this.render();

                // Fire callback
                if (this.#onHexSelectCallback) {
                    const data = this.#dataMap.get(`${hexCoord.q},${hexCoord.r}`);
                    this.#onHexSelectCallback(data, hexCoord);
                }
            }
        });

        // Zoom
        this.#canvas.addEventListener('wheel', (e) => {
            e.preventDefault();

            const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
            const newScale = Math.max(ZOOM_MIN, Math.min(this.#transform.scale * zoomFactor, ZOOM_MAX));

            // Zoom toward cursor
            const mouseX = e.clientX;
            const mouseY = e.clientY;

            const scaleDiff = newScale / this.#transform.scale;
            this.#transform.x = mouseX - (mouseX - this.#transform.x) * scaleDiff;
            this.#transform.y = mouseY - (mouseY - this.#transform.y) * scaleDiff;
            this.#transform.scale = newScale;

            this.render();
        }, { passive: false });
    }
}
