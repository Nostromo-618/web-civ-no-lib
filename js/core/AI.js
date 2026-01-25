'use strict';

import { getAdjacentHexes } from '../utils/hex-math.js';
import { TerrainType } from '../data/terrain.js';
import { getMovementCost, isPassable } from '../data/yields.js';
import { City } from './City.js';
import { Unit } from './Unit.js';
import { initializeUnitStats } from '../data/units.js';

/**
 * Strategic AI Controller
 * Manages AI behavior for computer-controlled nations
 */
export class AI {
    #nation;
    #gameState;
    #dataMap;
    #grid;

    // AI personality weights
    #aggression = 0.5;      // 0-1: tendency to attack
    #expansion = 0.7;       // 0-1: tendency to expand territory
    #defense = 0.6;         // 0-1: tendency to build military

    /**
     * Create AI controller for a nation
     * @param {Nation} nation - The nation to control
     * @param {GameState} gameState - Game state reference
     * @param {Map} dataMap - Hex data map
     * @param {HexGrid} grid - Hex grid
     */
    constructor(nation, gameState, dataMap, grid) {
        this.#nation = nation;
        this.#gameState = gameState;
        this.#dataMap = dataMap;
        this.#grid = grid;
    }

    /**
     * Execute the AI's turn
     * Makes decisions for all units and cities
     */
    executeTurn() {
        // 1. Process city production decisions
        this.#processCities();

        // 2. Move and act with units
        this.#processUnits();
    }

    /**
     * Process city decisions (production)
     */
    #processCities() {
        const cities = this.#nation.getCities();
        const units = this.#nation.getUnits();

        for (const city of cities) {
            if (!city.getCurrentProduction()) {
                // Decide what to build based on strategy
                const production = this.#decideCityProduction(city, units, cities);
                city.setProduction(production);
            }
        }
    }

    /**
     * Decide what a city should produce
     * @param {City} city - The city
     * @param {Array<Unit>} allUnits - All nation's units
     * @param {Array<City>} allCities - All nation's cities
     * @returns {string} Unit type to produce
     */
    #decideCityProduction(city, allUnits, allCities) {
        const warriors = allUnits.filter(u => u.unitType === 'WARRIOR').length;
        const settlers = allUnits.filter(u => u.unitType === 'SETTLER').length;

        // If we have few cities and no settlers, prioritize expansion
        if (allCities.length < 3 && settlers === 0 && this.#expansion > 0.5) {
            return 'SETTLER';
        }

        // If we have few warriors, build military
        if (warriors < allCities.length && this.#defense > 0.4) {
            return 'WARRIOR';
        }

        // Otherwise build warriors for defense
        return 'WARRIOR';
    }

    /**
     * Process all unit actions
     */
    #processUnits() {
        const units = [...this.#nation.getUnits()]; // Copy to avoid mutation issues

        for (const unit of units) {
            if (!unit.canMove()) continue;

            if (unit.canFoundCity) {
                this.#processSettler(unit);
            } else if (unit.strength > 0) {
                this.#processWarrior(unit);
            }
        }
    }

    /**
     * Process settler unit - find good location to found city
     * @param {Unit} settler - Settler unit
     */
    #processSettler(settler) {
        const pos = settler.getPosition();
        const cities = this.#nation.getCities();

        // Check if current location is good for city
        if (this.#isGoodCityLocation(pos.q, pos.r, cities)) {
            // Found city here
            this.#foundCity(settler);
            return;
        }

        // Otherwise, move toward a good location
        const bestMove = this.#findBestSettlerMove(settler, cities);
        if (bestMove) {
            this.#moveUnit(settler, bestMove.q, bestMove.r);
        }
    }

    /**
     * Check if a hex is a good location for a city
     */
    #isGoodCityLocation(q, r, existingCities) {
        const hexId = `${q},${r}`;
        const hexData = this.#dataMap.get(hexId);
        if (!hexData) return false;

        const terrain = hexData.terrain.type;

        // Must be passable land (not ocean or mountain)
        if (terrain === TerrainType.OCEAN || terrain === TerrainType.MOUNTAIN) {
            return false;
        }

        // Prefer grassland and plains
        if (terrain !== TerrainType.GRASSLAND && terrain !== TerrainType.PLAINS) {
            return false;
        }

        // Must be at least 4 hexes from other cities
        for (const city of existingCities) {
            const cityPos = city.getPosition();
            const dist = Math.abs(q - cityPos.q) + Math.abs(r - cityPos.r);
            if (dist < 4) return false;
        }

        return true;
    }

    /**
     * Find the best move for a settler
     */
    #findBestSettlerMove(settler, cities) {
        const pos = settler.getPosition();
        const adjacent = getAdjacentHexes(pos.q, pos.r);

        let bestHex = null;
        let bestScore = -Infinity;

        for (const hex of adjacent) {
            if (!this.#grid.hasHex(hex.q, hex.r)) continue;

            const hexId = `${hex.q},${hex.r}`;
            const hexData = this.#dataMap.get(hexId);
            if (!hexData) continue;

            const terrain = hexData.terrain.type;
            if (!isPassable(terrain)) continue;

            const cost = getMovementCost(terrain);
            if (settler.getMovement() < cost) continue;

            // Score based on distance from all cities (want to be far away)
            let score = 0;
            for (const city of cities) {
                const cityPos = city.getPosition();
                const dist = Math.abs(hex.q - cityPos.q) + Math.abs(hex.r - cityPos.r);
                score += dist;
            }

            // Bonus for good terrain
            if (terrain === TerrainType.GRASSLAND) score += 5;
            if (terrain === TerrainType.PLAINS) score += 3;

            if (score > bestScore) {
                bestScore = score;
                bestHex = hex;
            }
        }

        return bestHex;
    }

    /**
     * Process warrior unit - patrol, defend, or attack
     * @param {Unit} warrior - Warrior unit
     */
    #processWarrior(warrior) {
        const pos = warrior.getPosition();

        // 1. Check for adjacent enemies to attack
        const enemyTarget = this.#findAdjacentEnemy(pos.q, pos.r);
        if (enemyTarget && warrior.canAttack()) {
            warrior.attack(enemyTarget);
            return;
        }

        // 2. Move toward unexplored territory or enemies
        const bestMove = this.#findBestWarriorMove(warrior);
        if (bestMove) {
            this.#moveUnit(warrior, bestMove.q, bestMove.r);
        }
    }

    /**
     * Find adjacent enemy unit
     */
    #findAdjacentEnemy(q, r) {
        const adjacent = getAdjacentHexes(q, r);

        for (const hex of adjacent) {
            const hexId = `${hex.q},${hex.r}`;
            const hexData = this.#dataMap.get(hexId);
            if (!hexData) continue;

            const units = hexData.getUnits();
            for (const unit of units) {
                if (unit.owner !== this.#nation) {
                    return unit;
                }
            }
        }

        return null;
    }

    /**
     * Find best move for warrior (explore or defend)
     */
    #findBestWarriorMove(warrior) {
        const pos = warrior.getPosition();
        const adjacent = getAdjacentHexes(pos.q, pos.r);

        let bestHex = null;
        let bestScore = -Infinity;

        for (const hex of adjacent) {
            if (!this.#grid.hasHex(hex.q, hex.r)) continue;

            const hexId = `${hex.q},${hex.r}`;
            const hexData = this.#dataMap.get(hexId);
            if (!hexData) continue;

            const terrain = hexData.terrain.type;
            if (!isPassable(terrain)) continue;

            const cost = getMovementCost(terrain);
            if (warrior.getMovement() < cost) continue;

            // Score based on:
            let score = 0;

            // 1. Prefer unowned territory (exploration)
            if (!hexData.getOwner()) {
                score += 10;
            }

            // 2. Avoid own territory (spread out)
            if (hexData.isOwnedBy(this.#nation)) {
                score -= 5;
            }

            // 3. Move toward enemy territory
            const owner = hexData.getOwner();
            if (owner && owner !== this.#nation) {
                score += 15 * this.#aggression;
            }

            // 4. Random factor for variety
            score += Math.random() * 3;

            if (score > bestScore) {
                bestScore = score;
                bestHex = hex;
            }
        }

        return bestHex;
    }

    /**
     * Move a unit to a new position
     */
    #moveUnit(unit, q, r) {
        const oldPos = unit.getPosition();
        const hexId = `${q},${r}`;
        const hexData = this.#dataMap.get(hexId);

        if (!hexData) return false;

        const terrain = hexData.terrain.type;
        const cost = getMovementCost(terrain);

        if (!unit.move(q, r, cost)) {
            return false;
        }

        // Update HexData
        const oldHexId = `${oldPos.q},${oldPos.r}`;
        const oldHexData = this.#dataMap.get(oldHexId);
        if (oldHexData) {
            oldHexData.removeUnit(unit);
        }

        hexData.addUnit(unit);
        return true;
    }

    /**
     * Found a city with a settler
     */
    #foundCity(settler) {
        const pos = settler.getPosition();
        const hexId = `${pos.q},${pos.r}`;
        const hexData = this.#dataMap.get(hexId);

        if (!hexData) return false;

        const cities = this.#nation.getCities();
        const cityName = `${this.#nation.getName()} City ${cities.length + 1}`;
        const city = new City(cityName, pos, this.#nation);

        // Expand borders
        const adjacent = getAdjacentHexes(pos.q, pos.r);
        const borderHexes = [{ q: pos.q, r: pos.r }, ...adjacent];
        city.expandBorders(borderHexes);

        // Update hex data
        hexData.setCity(city);
        hexData.setOwner(this.#nation);

        for (const borderHex of borderHexes) {
            const borderHexId = `${borderHex.q},${borderHex.r}`;
            const borderHexData = this.#dataMap.get(borderHexId);
            if (borderHexData) {
                borderHexData.setOwner(this.#nation);
            }
        }

        // Add city to nation
        this.#nation.addCity(city);

        // Remove settler
        this.#nation.removeUnit(settler);
        hexData.removeUnit(settler);

        return true;
    }
}

/**
 * Process AI turn for a nation
 * @param {Nation} nation - Nation to process
 * @param {GameState} gameState - Game state
 * @param {Map} dataMap - Hex data map
 * @param {HexGrid} grid - Hex grid
 */
export function processAITurn(nation, gameState, dataMap, grid) {
    const ai = new AI(nation, gameState, dataMap, grid);
    ai.executeTurn();
}
