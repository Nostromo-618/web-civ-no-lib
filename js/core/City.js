'use strict';

import { UNIT_TYPES } from '../data/units.js';

/**
 * Represents a city on the map
 */
export class City {
    /**
     * Create a new city
     * @param {string} name - City name
     * @param {Object} position - Hex coordinates {q, r}
     * @param {Nation} owner - The nation that owns this city
     */
    constructor(name, position, owner) {
        this.name = name;
        this.position = position; // {q, r}
        this.owner = owner;
        this.population = 1;
        this.productionQueue = [];
        this.currentProduction = null;
        this.productionProgress = 0;
        this.borders = [];
        this.buildings = [];
        this.onProductionComplete = null; // Callback for when production completes
    }

    /**
     * Get city name
     * @returns {string} City name
     */
    getName() {
        return this.name;
    }

    /**
     * Get city position
     * @returns {{q: number, r: number}} Hex coordinates
     */
    getPosition() {
        return this.position;
    }

    /**
     * Get current population
     * @returns {number} Population count
     */
    getPopulation() {
        return this.population;
    }

    /**
     * Increase population
     * @param {number} amount - Amount to increase (default 1)
     */
    growPopulation(amount = 1) {
        this.population += amount;
    }

    /**
     * Get current production progress
     * @returns {number} Production points accumulated
     */
    getProduction() {
        return this.productionProgress;
    }

    /**
     * Add production points
     * @param {number} amount - Production points to add
     */
    addProduction(amount) {
        if (!this.currentProduction) {
            // If no current production, try to start next item from queue
            if (this.productionQueue.length > 0) {
                this.currentProduction = this.productionQueue.shift();
                this.productionProgress = 0;
            } else {
                return; // Nothing to produce
            }
        }

        this.productionProgress += amount;
        
        // Check if production is complete (costs from unit types)
        let cost = 50; // Default cost
        if (this.currentProduction === 'WARRIOR' && UNIT_TYPES.WARRIOR) {
            cost = UNIT_TYPES.WARRIOR.cost;
        } else if (this.currentProduction === 'SETTLER' && UNIT_TYPES.SETTLER) {
            cost = UNIT_TYPES.SETTLER.cost;
        } else if (this.currentProduction === 'WORKER' && UNIT_TYPES.WORKER) {
            cost = UNIT_TYPES.WORKER.cost;
        }
        
        if (this.productionProgress >= cost) {
            // Production complete
            const completedItem = this.currentProduction;
            this.productionProgress = 0;
            this.currentProduction = null;
            
            // Notify completion
            if (this.onProductionComplete) {
                this.onProductionComplete(completedItem, this);
            }
            
            // Start next item from queue if available
            if (this.productionQueue.length > 0) {
                this.currentProduction = this.productionQueue.shift();
            }
        }
    }

    /**
     * Set what the city is producing
     * @param {string} itemType - Type of item (unit type, building type)
     */
    setProduction(itemType) {
        this.currentProduction = itemType;
        this.productionProgress = 0;
    }

    /**
     * Get current production item
     * @returns {string|null} Current production type, or null
     */
    getCurrentProduction() {
        return this.currentProduction;
    }

    /**
     * Get production queue
     * @returns {Array<string>} Array of queued production items
     */
    getProductionQueue() {
        return this.productionQueue;
    }

    /**
     * Add item to production queue
     * @param {string} itemType - Item to queue
     */
    queueProduction(itemType) {
        this.productionQueue.push(itemType);
    }

    /**
     * Get city borders (controlled hexes)
     * @returns {Array<{q: number, r: number}>} Array of hex coordinates
     */
    getBorders() {
        return this.borders;
    }

    /**
     * Expand city borders
     * @param {Array<{q: number, r: number}>} newHexes - Hexes to add to borders
     */
    expandBorders(newHexes) {
        for (const hex of newHexes) {
            // Check if hex is already in borders
            const exists = this.borders.some(b => b.q === hex.q && b.r === hex.r);
            if (!exists) {
                this.borders.push(hex);
            }
        }
    }

    /**
     * Get buildings in this city
     * @returns {Array<string>} Array of building types
     */
    getBuildings() {
        return this.buildings;
    }

    /**
     * Add a building to the city
     * @param {string} buildingType - Type of building
     */
    addBuilding(buildingType) {
        if (!this.buildings.includes(buildingType)) {
            this.buildings.push(buildingType);
        }
    }

    /**
     * Check if city has a specific building
     * @param {string} buildingType - Building type to check
     * @returns {boolean} True if building exists
     */
    hasBuilding(buildingType) {
        return this.buildings.includes(buildingType);
    }
}
