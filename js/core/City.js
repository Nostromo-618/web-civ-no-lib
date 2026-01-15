'use strict';

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
        
        // TODO: Initialize city properties
        // - population: Current population
        // - productionQueue: Array of items being produced
        // - currentProduction: Current item in production
        // - productionProgress: Progress toward current production
        // - borders: Array of hex coordinates controlled by city
        // - buildings: Array of building types constructed
    }

    /**
     * Get city name
     * @returns {string} City name
     */
    getName() {
        // TODO: Return name
    }

    /**
     * Get city position
     * @returns {{q: number, r: number}} Hex coordinates
     */
    getPosition() {
        // TODO: Return position
    }

    /**
     * Get current population
     * @returns {number} Population count
     */
    getPopulation() {
        // TODO: Return population
    }

    /**
     * Increase population
     * @param {number} amount - Amount to increase (default 1)
     */
    growPopulation(amount = 1) {
        // TODO: Increase population, check for growth requirements
    }

    /**
     * Get current production progress
     * @returns {number} Production points accumulated
     */
    getProduction() {
        // TODO: Return production progress
    }

    /**
     * Add production points
     * @param {number} amount - Production points to add
     */
    addProduction(amount) {
        // TODO: Add to production progress
        // Check if current production is complete
        // If complete, add to queue or notify, start next item
    }

    /**
     * Set what the city is producing
     * @param {string} itemType - Type of item (unit type, building type)
     */
    setProduction(itemType) {
        // TODO: Set current production item
        // Reset production progress
    }

    /**
     * Get current production item
     * @returns {string|null} Current production type, or null
     */
    getCurrentProduction() {
        // TODO: Return current production item
    }

    /**
     * Get production queue
     * @returns {Array<string>} Array of queued production items
     */
    getProductionQueue() {
        // TODO: Return production queue
    }

    /**
     * Add item to production queue
     * @param {string} itemType - Item to queue
     */
    queueProduction(itemType) {
        // TODO: Add to production queue
    }

    /**
     * Get city borders (controlled hexes)
     * @returns {Array<{q: number, r: number}>} Array of hex coordinates
     */
    getBorders() {
        // TODO: Return borders array
    }

    /**
     * Expand city borders
     * @param {Array<{q: number, r: number}>} newHexes - Hexes to add to borders
     */
    expandBorders(newHexes) {
        // TODO: Add hexes to borders, update ownership
    }

    /**
     * Get buildings in this city
     * @returns {Array<string>} Array of building types
     */
    getBuildings() {
        // TODO: Return buildings array
    }

    /**
     * Add a building to the city
     * @param {string} buildingType - Type of building
     */
    addBuilding(buildingType) {
        // TODO: Add building to buildings array
    }

    /**
     * Check if city has a specific building
     * @param {string} buildingType - Building type to check
     * @returns {boolean} True if building exists
     */
    hasBuilding(buildingType) {
        // TODO: Check if building is in buildings array
    }
}
