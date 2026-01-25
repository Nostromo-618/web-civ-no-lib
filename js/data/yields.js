'use strict';

import { TerrainType } from './terrain.js';

/**
 * Terrain yields - resources generated per turn from each terrain type
 */
export const TERRAIN_YIELDS = Object.freeze({
    [TerrainType.GRASSLAND]: {
        food: 2,
        production: 0,
        gold: 0
    },
    [TerrainType.PLAINS]: {
        food: 1,
        production: 1,
        gold: 0
    },
    [TerrainType.DESERT]: {
        food: 0,
        production: 1,
        gold: 0
    },
    [TerrainType.TUNDRA]: {
        food: 1,
        production: 0,
        gold: 0
    },
    [TerrainType.SNOW]: {
        food: 0,
        production: 0,
        gold: 0
    },
    [TerrainType.COAST]: {
        food: 1,
        production: 0,
        gold: 0
    },
    [TerrainType.OCEAN]: {
        food: 0,
        production: 0,
        gold: 0
    },
    [TerrainType.MOUNTAIN]: {
        food: 0,
        production: 0,
        gold: 0
    }
});

/**
 * Movement costs for units based on terrain
 * Higher cost = harder to move through
 */
export const TERRAIN_MOVEMENT_COSTS = Object.freeze({
    [TerrainType.GRASSLAND]: 1,
    [TerrainType.PLAINS]: 1,
    [TerrainType.DESERT]: 1,
    [TerrainType.TUNDRA]: 1,
    [TerrainType.SNOW]: 2,
    [TerrainType.COAST]: 1,
    [TerrainType.OCEAN]: 999, // Impassable for land units
    [TerrainType.MOUNTAIN]: 999 // Impassable
});

/**
 * Check if terrain is passable for land units
 * @param {string} terrainType - Terrain type
 * @returns {boolean} True if passable
 */
export function isPassable(terrainType) {
    const cost = TERRAIN_MOVEMENT_COSTS[terrainType];
    return cost !== undefined && cost < 999;
}

/**
 * Get movement cost for terrain
 * @param {string} terrainType - Terrain type
 * @returns {number} Movement cost
 */
export function getMovementCost(terrainType) {
    return TERRAIN_MOVEMENT_COSTS[terrainType] ?? 999;
}

/**
 * Get terrain yields
 * @param {string} terrainType - Terrain type
 * @returns {Object} Yields object {food, production, gold}
 */
export function getTerrainYields(terrainType) {
    return TERRAIN_YIELDS[terrainType] || { food: 0, production: 0, gold: 0 };
}
