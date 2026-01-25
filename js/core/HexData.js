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
        this.owner = null;
        this.improvements = [];
        this.units = [];
        this.city = null;
    }

    /**
     * Set the owner of this hex
     * @param {Nation} nation - The nation that owns this hex
     */
    setOwner(nation) {
        this.owner = nation;
    }

    /**
     * Get the owner of this hex
     * @returns {Nation|null} The owning nation, or null if unclaimed
     */
    getOwner() {
        return this.owner;
    }

    /**
     * Check if hex is owned by a nation
     * @param {Nation} nation - Nation to check
     * @returns {boolean} True if owned by this nation
     */
    isOwnedBy(nation) {
        return this.owner === nation;
    }

    /**
     * Add an improvement to this hex
     * @param {string} improvementType - Type of improvement (farm, mine, etc.)
     */
    addImprovement(improvementType) {
        if (!this.improvements.includes(improvementType)) {
            this.improvements.push(improvementType);
        }
    }

    /**
     * Get all improvements on this hex
     * @returns {Array<string>} Array of improvement types
     */
    getImprovements() {
        return this.improvements;
    }

    /**
     * Add a unit to this hex
     * @param {Unit} unit - Unit to add
     */
    addUnit(unit) {
        if (!this.units.includes(unit)) {
            this.units.push(unit);
        }
    }

    /**
     * Remove a unit from this hex
     * @param {Unit} unit - Unit to remove
     */
    removeUnit(unit) {
        const index = this.units.indexOf(unit);
        if (index > -1) {
            this.units.splice(index, 1);
        }
    }

    /**
     * Get all units on this hex
     * @returns {Array<Unit>} Array of units
     */
    getUnits() {
        return this.units;
    }

    /**
     * Set a city on this hex
     * @param {City} city - City object
     */
    setCity(city) {
        this.city = city;
        if (city && city.owner) {
            this.setOwner(city.owner);
        }
    }

    /**
     * Get the city on this hex
     * @returns {City|null} City object, or null if no city
     */
    getCity() {
        return this.city;
    }

    /**
     * Check if this hex has a city
     * @returns {boolean} True if city exists
     */
    hasCity() {
        return this.city !== null;
    }
}
