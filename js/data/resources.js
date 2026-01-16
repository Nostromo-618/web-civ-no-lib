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
        // TODO: Initialize resource storage
        this.resources = initialResources || {
            [ResourceType.GOLD]: 0,
            [ResourceType.FOOD]: 0,
            [ResourceType.PRODUCTION]: 0,
            [ResourceType.SCIENCE]: 0,
        };
    }

    /**
     * Add resources
     * @param {string} resourceType - The resource type
     * @param {number} amount - Amount to add
     */
    add(resourceType, amount) {
        // TODO: Add resources (validate amount >= 0)
    }

    /**
     * Spend resources (subtract)
     * @param {string} resourceType - The resource type
     * @param {number} amount - Amount to spend
     * @returns {boolean} True if successful, false if insufficient
     */
    spend(resourceType, amount) {
        // TODO: Check if enough resources, subtract if yes, return success
    }

    /**
     * Check if enough resources are available
     * @param {string} resourceType - The resource type
     * @param {number} amount - Required amount
     * @returns {boolean} True if enough resources
     */
    hasEnough(resourceType, amount) {
        // TODO: Check if current amount >= required amount
    }

    /**
     * Get all resources as an object
     * @returns {Object} All resource values
     */
    getAll() {
        // TODO: Return object with all resource types and their values
    }
}
