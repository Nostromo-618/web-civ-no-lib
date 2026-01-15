'use strict';

/**
 * Extended hex data that includes game state information
 * Extends the basic terrain data with ownership, improvements, units, and cities
 */
export class HexData {
    /**
     * Create hex data
     * @param {string} hexId - Hex identifier (e.g., "q,r")
     * @param {Object} terrainData - Base terrain data (type, etc.)
     */
    constructor(hexId, terrainData) {
        this.hexId = hexId;
        this.terrain = terrainData;
        
        // TODO: Initialize game state properties
        // - owner: Nation that controls this hex (null if unclaimed)
        // - improvements: Array of improvements (farm, mine, etc.)
        // - units: Array of units present on this hex
        // - city: City object if a city exists here (null otherwise)
    }

    /**
     * Set the owner of this hex
     * @param {Nation} nation - The nation that owns this hex
     */
    setOwner(nation) {
        // TODO: Set owner, update any visual/state changes
    }

    /**
     * Get the owner of this hex
     * @returns {Nation|null} The owning nation, or null if unclaimed
     */
    getOwner() {
        // TODO: Return owner
    }

    /**
     * Check if hex is owned by a nation
     * @param {Nation} nation - Nation to check
     * @returns {boolean} True if owned by this nation
     */
    isOwnedBy(nation) {
        // TODO: Check if owner matches nation
    }

    /**
     * Add an improvement to this hex
     * @param {string} improvementType - Type of improvement (farm, mine, etc.)
     */
    addImprovement(improvementType) {
        // TODO: Add improvement to improvements array
    }

    /**
     * Get all improvements on this hex
     * @returns {Array<string>} Array of improvement types
     */
    getImprovements() {
        // TODO: Return improvements array
    }

    /**
     * Add a unit to this hex
     * @param {Unit} unit - Unit to add
     */
    addUnit(unit) {
        // TODO: Add unit to units array
    }

    /**
     * Remove a unit from this hex
     * @param {Unit} unit - Unit to remove
     */
    removeUnit(unit) {
        // TODO: Remove unit from units array
    }

    /**
     * Get all units on this hex
     * @returns {Array<Unit>} Array of units
     */
    getUnits() {
        // TODO: Return units array
    }

    /**
     * Set a city on this hex
     * @param {City} city - City object
     */
    setCity(city) {
        // TODO: Set city, update owner if needed
    }

    /**
     * Get the city on this hex
     * @returns {City|null} City object, or null if no city
     */
    getCity() {
        // TODO: Return city
    }

    /**
     * Check if this hex has a city
     * @returns {boolean} True if city exists
     */
    hasCity() {
        // TODO: Check if city is not null
    }
}
