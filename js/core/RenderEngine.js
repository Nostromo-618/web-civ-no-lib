'use strict';

import { getHexCorners } from '../utils/hex-math.js';
import { TERRAIN_COLORS, DEFAULT_TERRAIN_COLOR } from '../data/terrain.js';
import { spriteManager } from '../utils/sprites.js';
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
    #validMoveHexes = [];

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
     * Set valid move hexes for highlighting
     * @param {Array<{q: number, r: number}>} hexes - Array of valid hex coordinates
     */
    setValidMoveHexes(hexes) {
        this.#validMoveHexes = hexes;
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

        // Draw valid move hexes
        for (const moveHex of this.#validMoveHexes) {
            const hex = this.#grid.getHex(moveHex.q, moveHex.r);
            if (hex) {
                ctx.globalAlpha = 0.3;
                ctx.fillStyle = '#4ade80';
                this.#drawHexagon(hex.x, hex.y, HEX_SIZE, '#4ade80', null, 0);
                ctx.globalAlpha = 1.0;
            }
        }

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
     */
    #renderNations() {
        if (!this.#gameState || !this.#dataMap) return;

        const ctx = this.#ctx;
        const nations = this.#gameState.getNations();

        // Nation colors
        const nationColors = {
            'red': '#ef4444',
            'blue': '#3b82f6'
        };

        // Draw ownership overlay (semi-transparent)
        ctx.globalAlpha = 0.12;
        for (const nation of nations) {
            const color = nationColors[nation.getColor()] || '#888888';
            ctx.fillStyle = color;

            // Iterate through all hexes to find owned ones
            this.#dataMap.forEach((hexData, hexId) => {
                if (hexData.isOwnedBy(nation)) {
                    const [q, r] = hexId.split(',').map(Number);
                    const hex = this.#grid.getHex(q, r);
                    if (hex) {
                        this.#drawHexagon(hex.x, hex.y, HEX_SIZE, color, null, 0);
                    }
                }
            });
        }
        ctx.globalAlpha = 1.0;

        // Draw territory border lines (solid lines around territory edges)
        this.#renderTerritoryBorders(nations, nationColors);
    }

    /**
     * Draw border lines around the edges of nation territory
     */
    #renderTerritoryBorders(nations, nationColors) {
        const ctx = this.#ctx;

        // Adjacent hex direction offsets (matches getAdjacentHexes order)
        const directions = [
            { q: 1, r: 0 },   // East
            { q: 1, r: -1 },  // Northeast
            { q: 0, r: -1 },  // Northwest
            { q: -1, r: 0 },  // West
            { q: -1, r: 1 },  // Southwest
            { q: 0, r: 1 }    // Southeast
        ];

        for (const nation of nations) {
            const color = nationColors[nation.getColor()] || '#888888';

            // Collect all territory border edges
            const borderEdges = [];

            this.#dataMap.forEach((hexData, hexId) => {
                if (!hexData.isOwnedBy(nation)) return;

                const [q, r] = hexId.split(',').map(Number);
                const hex = this.#grid.getHex(q, r);
                if (!hex) return;

                // Check each of the 6 directions
                for (let i = 0; i < 6; i++) {
                    const dir = directions[i];
                    const neighborId = `${q + dir.q},${r + dir.r}`;
                    const neighborData = this.#dataMap.get(neighborId);

                    // Draw border if neighbor is not owned by same nation
                    const isEdge = !neighborData || !neighborData.isOwnedBy(nation);

                    if (isEdge) {
                        borderEdges.push({ hex, edgeIndex: i });
                    }
                }
            });

            // Draw all border edges for this nation
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            for (const { hex, edgeIndex } of borderEdges) {
                const corners = this.#getHexCorners(hex.x, hex.y, HEX_SIZE);
                const startCorner = corners[edgeIndex];
                const endCorner = corners[(edgeIndex + 1) % 6];

                ctx.beginPath();
                ctx.moveTo(startCorner.x, startCorner.y);
                ctx.lineTo(endCorner.x, endCorner.y);
                ctx.stroke();
            }
        }
    }

    /**
     * Get hex corner points (internal helper)
     */
    #getHexCorners(x, y, size) {
        const corners = [];
        for (let i = 0; i < 6; i++) {
            const angleDeg = 60 * i;
            const angleRad = (Math.PI / 180) * angleDeg;
            corners.push({
                x: x + size * Math.cos(angleRad),
                y: y + size * Math.sin(angleRad)
            });
        }
        return corners;
    }

    /**
     * Render cities on the map
     */
    #renderCities() {
        if (!this.#gameState || !this.#dataMap) return;

        const ctx = this.#ctx;
        const nations = this.#gameState.getNations();
        const citySprite = spriteManager.get('city');

        // Nation colors
        const nationColors = {
            'red': '#ef4444',
            'blue': '#3b82f6'
        };

        for (const nation of nations) {
            const cities = nation.getCities();
            const color = nationColors[nation.getColor()] || '#888888';

            for (const city of cities) {
                const pos = city.getPosition();
                const hex = this.#grid.getHex(pos.q, pos.r);
                if (!hex) continue;

                const spriteSize = HEX_SIZE * 0.9;

                if (citySprite) {
                    // Draw sprite with color tint
                    ctx.save();
                    ctx.globalAlpha = 0.9;
                    ctx.drawImage(
                        citySprite,
                        hex.x - spriteSize,
                        hex.y - spriteSize,
                        spriteSize * 2,
                        spriteSize * 2
                    );
                    // Add color overlay
                    ctx.globalCompositeOperation = 'source-atop';
                    ctx.fillStyle = color;
                    ctx.globalAlpha = 0.3;
                    ctx.fillRect(hex.x - spriteSize, hex.y - spriteSize, spriteSize * 2, spriteSize * 2);
                    ctx.restore();
                } else {
                    // Fallback: circle marker
                    ctx.fillStyle = color;
                    ctx.beginPath();
                    ctx.arc(hex.x, hex.y, HEX_SIZE * 0.4, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }

                // Draw city name
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 10px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.shadowColor = '#000000';
                ctx.shadowBlur = 3;
                ctx.fillText(city.getName(), hex.x, hex.y - HEX_SIZE * 0.6);
                ctx.shadowBlur = 0;

                // Draw population indicator
                ctx.fillStyle = '#facc15';
                ctx.font = '8px sans-serif';
                ctx.textBaseline = 'top';
                ctx.fillText(`Pop: ${city.getPopulation()}`, hex.x, hex.y + HEX_SIZE * 0.6);
            }
        }
    }

    /**
     * Render units on the map
     */
    #renderUnits() {
        if (!this.#gameState || !this.#dataMap) return;

        const ctx = this.#ctx;
        const nations = this.#gameState.getNations();
        const warriorSprite = spriteManager.get('warrior');
        const settlerSprite = spriteManager.get('settler');

        // Nation colors
        const nationColors = {
            'red': '#ef4444',
            'blue': '#3b82f6'
        };

        for (const nation of nations) {
            const units = nation.getUnits();
            const color = nationColors[nation.getColor()] || '#888888';

            for (const unit of units) {
                const pos = unit.getPosition();
                const hex = this.#grid.getHex(pos.q, pos.r);
                if (!hex) continue;

                const spriteSize = HEX_SIZE * 0.55;
                const sprite = unit.unitType === 'WARRIOR' ? warriorSprite : settlerSprite;

                if (sprite) {
                    // Draw sprite
                    ctx.save();
                    ctx.drawImage(
                        sprite,
                        hex.x - spriteSize,
                        hex.y - spriteSize,
                        spriteSize * 2,
                        spriteSize * 2
                    );
                    // Add nation color ring
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.arc(hex.x, hex.y, spriteSize * 0.9, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.restore();
                } else {
                    // Fallback: geometric shapes
                    ctx.fillStyle = color;
                    if (unit.unitType === 'WARRIOR') {
                        ctx.beginPath();
                        ctx.moveTo(hex.x, hex.y - HEX_SIZE * 0.3);
                        ctx.lineTo(hex.x - HEX_SIZE * 0.25, hex.y + HEX_SIZE * 0.2);
                        ctx.lineTo(hex.x + HEX_SIZE * 0.25, hex.y + HEX_SIZE * 0.2);
                        ctx.closePath();
                        ctx.fill();
                    } else {
                        ctx.beginPath();
                        ctx.arc(hex.x, hex.y, HEX_SIZE * 0.25, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                }

                // Show movement indicator if unit can move
                if (unit.canMove()) {
                    ctx.fillStyle = '#4ade80';
                    ctx.beginPath();
                    ctx.arc(hex.x + HEX_SIZE * 0.35, hex.y - HEX_SIZE * 0.35, 4, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }
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
