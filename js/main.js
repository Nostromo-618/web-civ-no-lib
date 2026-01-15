'use strict';

import { HexGrid } from './core/HexGrid.js';
import { RenderEngine } from './core/RenderEngine.js';
import { GameState } from './core/GameState.js';
import { HexData } from './core/HexData.js';
import { TerrainType } from './data/terrain.js';
import { HEX_SIZE, GRID_WIDTH, GRID_HEIGHT } from './config.js';

/**
 * Generate terrain data for the grid using procedural noise
 * @param {HexGrid} grid - The hex grid
 * @returns {Map} Map of hex id to terrain data
 */
function generateTerrain(grid) {
    const dataMap = new Map();

    grid.forEach((hex) => {
        const noise = Math.sin(hex.q * 0.4) + Math.cos(hex.r * 0.4 + hex.q * 0.2);
        let type = TerrainType.OCEAN;

        if (noise > 1.2) {
            type = TerrainType.MOUNTAIN;
        } else if (noise > 1.0) {
            type = TerrainType.SNOW;
        } else if (noise > 0.6) {
            type = TerrainType.TUNDRA;
        } else if (noise > 0.1) {
            type = TerrainType.GRASSLAND;
        } else if (noise > -0.3) {
            type = TerrainType.PLAINS;
        } else if (noise > -0.5) {
            type = TerrainType.DESERT;
        } else if (noise > -0.8) {
            type = TerrainType.COAST;
        }

        dataMap.set(`${hex.q},${hex.r}`, { type });
    });

    return dataMap;
}

/**
 * Update the UI selection panel
 * @param {Object} hexData - The selected hex data
 */
function updateUI(hexData) {
    const panel = document.getElementById('selection-panel');
    const hexInfo = document.getElementById('hex-info');

    panel.classList.remove('hidden');
    hexInfo.textContent = hexData.type;
}

/**
 * Initialize the game
 */
function init() {
    const canvas = document.getElementById('game-canvas');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }

    // Create grid and generate terrain
    const grid = new HexGrid(HEX_SIZE, GRID_WIDTH, GRID_HEIGHT);
    const terrainMap = generateTerrain(grid);

    // Convert terrain data to HexData objects
    const dataMap = new Map();
    terrainMap.forEach((terrainData, hexId) => {
        dataMap.set(hexId, new HexData(hexId, terrainData));
    });

    // Initialize game state with Red and Blue nations
    const gameState = GameState.createDefault();

    // Create renderer
    const engine = new RenderEngine(canvas);
    engine.setData(grid, dataMap);
    engine.setGameState(gameState);

    // Handle hex selection
    engine.onHexSelect((hexData) => {
        updateUI(hexData);
    });

    // Initial render
    engine.render();
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', init);
