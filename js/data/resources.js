'use strict';

/**
 * Resource types available in the game
 */
export const ResourceType = Object.freeze({
    GOLD: 'Gold',
    FOOD: 'Food',
    PRODUCTION: 'Production',
    SCIENCE: 'Science'
});

/**
 * Resource management utilities
 * TODO: Implement resource calculation helpers, validation, etc.
 */
export class ResourceManager {
    /**
     * Create a new resource manager
     * @param {Object} initialResources - Initial resource values
     */
    constructor(initialResources = {}) {
        // Initialize resource storage with defaults
        this.resources = {
            [ResourceType.GOLD]: initialResources[ResourceType.GOLD] ?? 0,
            [ResourceType.FOOD]: initialResources[ResourceType.FOOD] ?? 0,
            [ResourceType.PRODUCTION]: initialResources[ResourceType.PRODUCTION] ?? 0,
            [ResourceType.SCIENCE]: initialResources[ResourceType.SCIENCE] ?? 0,
        };
    }

    /**
     * Add resources
     * @param {string} resourceType - The resource type
     * @param {number} amount - Amount to add
     */
    add(resourceType, amount) {
        if (amount < 0) {
            console.warn('Cannot add negative resources');
            return;
        }
        if (this.resources.hasOwnProperty(resourceType)) {
            this.resources[resourceType] += amount;
        } else {
            this.resources[resourceType] = amount;
        }
    }

    /**
     * Spend resources (subtract)
     * @param {string} resourceType - The resource type
     * @param {number} amount - Amount to spend
     * @returns {boolean} True if successful, false if insufficient
     */
    spend(resourceType, amount) {
        if (amount < 0) {
            console.warn('Cannot spend negative resources');
            return false;
        }
        if (!this.hasEnough(resourceType, amount)) {
            return false;
        }
        this.resources[resourceType] -= amount;
        return true;
    }

    /**
     * Check if enough resources are available
     * @param {string} resourceType - The resource type
     * @param {number} amount - Required amount
     * @returns {boolean} True if enough resources
     */
    hasEnough(resourceType, amount) {
        const current = this.resources[resourceType] ?? 0;
        return current >= amount;
    }

    /**
     * Get a specific resource amount
     * @param {string} resourceType - The resource type
     * @returns {number} Current amount of the resource
     */
    get(resourceType) {
        return this.resources[resourceType] ?? 0;
    }

    /**
     * Get all resources as an object
     * @returns {Object} All resource values
     */
    getAll() {
        return { ...this.resources };
    }
}
