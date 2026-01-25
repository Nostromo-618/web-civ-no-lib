'use strict';

import { ResourceManager, ResourceType } from '../data/resources.js';
import { AgeType } from '../data/ages.js';
import { getTerrainYields } from '../data/yields.js';

/**
 * Represents a player nation in the game
 */
export class Nation {
    /**
     * Create a new nation
     * @param {string} name - Nation name (e.g., "Red", "Blue")
     * @param {string} color - Nation color identifier
     */
    constructor(name, color) {
        this.name = name;
        this.color = color;
        this.resources = new ResourceManager();
        this.cities = [];
        this.units = [];
        this.currentAge = AgeType.ANCIENT;
        this.technologies = [];
    }

    /**
     * Get nation name
     * @returns {string} Nation name
     */
    getName() {
        return this.name;
    }

    /**
     * Get nation color
     * @returns {string} Color identifier
     */
    getColor() {
        return this.color;
    }

    /**
     * Get current age
     * @returns {string} Current age type
     */
    getAge() {
        return this.currentAge;
    }

    /**
     * Advance to the next age
     * @returns {boolean} True if age was advanced
     */
    advanceAge() {
        // Basic implementation - will be expanded with AgeManager
        if (this.currentAge === AgeType.ANCIENT) {
            this.currentAge = AgeType.MODERN;
            return true;
        } else if (this.currentAge === AgeType.MODERN) {
            this.currentAge = AgeType.INFORMATION;
            return true;
        }
        return false;
    }

    /**
     * Get all cities
     * @returns {Array<City>} Array of city objects
     */
    getCities() {
        return this.cities;
    }

    /**
     * Add a city to this nation
     * @param {City} city - City object to add
     */
    addCity(city) {
        this.cities.push(city);
    }

    /**
     * Remove a city from this nation
     * @param {City} city - City to remove
     */
    removeCity(city) {
        const index = this.cities.indexOf(city);
        if (index > -1) {
            this.cities.splice(index, 1);
        }
    }

    /**
     * Get all units
     * @returns {Array<Unit>} Array of unit objects
     */
    getUnits() {
        return this.units;
    }

    /**
     * Add a unit to this nation
     * @param {Unit} unit - Unit object to add
     */
    addUnit(unit) {
        this.units.push(unit);
    }

    /**
     * Remove a unit from this nation
     * @param {Unit} unit - Unit to remove
     */
    removeUnit(unit) {
        const index = this.units.indexOf(unit);
        if (index > -1) {
            this.units.splice(index, 1);
        }
    }

    /**
     * Get resource manager
     * @returns {ResourceManager} Resource manager instance
     */
    getResources() {
        return this.resources;
    }

    /**
     * Add resources
     * @param {string} resourceType - Resource type
     * @param {number} amount - Amount to add
     */
    addResource(resourceType, amount) {
        this.resources.add(resourceType, amount);
    }

    /**
     * Spend resources
     * @param {string} resourceType - Resource type
     * @param {number} amount - Amount to spend
     * @returns {boolean} True if successful
     */
    spendResource(resourceType, amount) {
        return this.resources.spend(resourceType, amount);
    }

    /**
     * Check if nation has enough resources
     * @param {string} resourceType - Resource type
     * @param {number} amount - Required amount
     * @returns {boolean} True if enough resources
     */
    hasEnoughResources(resourceType, amount) {
        return this.resources.hasEnough(resourceType, amount);
    }

    /**
     * Process turn for this nation (collect resources, update cities, etc.)
     * @param {Map} dataMap - Map of hex data for resource collection
     */
    processTurn(dataMap = null) {
        // Collect resources from cities
        for (const city of this.cities) {
            const population = city.getPopulation();
            // Cities generate base resources
            this.addResource(ResourceType.FOOD, population);
            this.addResource(ResourceType.PRODUCTION, population);
            this.addResource(ResourceType.GOLD, population);
            
            // Collect resources from city borders (controlled hexes)
            if (dataMap) {
                const borders = city.getBorders();
                for (const borderHex of borders) {
                    const hexId = `${borderHex.q},${borderHex.r}`;
                    const hexData = dataMap.get(hexId);
                    if (hexData && hexData.isOwnedBy(this)) {
                        const terrainType = hexData.terrain.type;
                        const yields = getTerrainYields(terrainType);
                        this.addResource(ResourceType.FOOD, yields.food);
                        this.addResource(ResourceType.PRODUCTION, yields.production);
                        this.addResource(ResourceType.GOLD, yields.gold);
                    }
                }
            }
            
            // Update city production
            city.addProduction(population);
        }
        
        // Reset unit movement points
        for (const unit of this.units) {
            unit.resetMovement();
        }
    }

    /**
     * Get researched technologies
     * @returns {Array<string>} Array of technology names
     */
    getTechnologies() {
        return this.technologies;
    }

    /**
     * Research a technology
     * @param {string} techName - Technology name
     */
    researchTechnology(techName) {
        if (!this.technologies.includes(techName)) {
            this.technologies.push(techName);
        }
    }

    /**
     * Check if nation has researched a technology
     * @param {string} techName - Technology name
     * @returns {boolean} True if researched
     */
    hasTechnology(techName) {
        return this.technologies.includes(techName);
    }
}
