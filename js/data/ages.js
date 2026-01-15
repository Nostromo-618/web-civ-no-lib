'use strict';

/**
 * Age types in the game
 */
export const AgeType = Object.freeze({
    ANCIENT: 'Ancient',
    MODERN: 'Modern',
    INFORMATION: 'Information'
});

/**
 * Age definitions with properties and bonuses
 */
export const AGES = Object.freeze({
    [AgeType.ANCIENT]: {
        name: 'Ancient',
        // TODO: Define age-specific properties
        // Examples: unitTypes: [], buildingTypes: [], bonuses: {}
    },
    [AgeType.MODERN]: {
        name: 'Modern',
        // TODO: Define age-specific properties
    },
    [AgeType.INFORMATION]: {
        name: 'Information',
        // TODO: Define age-specific properties
    }
});

/**
 * Age progression rules
 * TODO: Implement logic for advancing to next age
 * 
 * Age order: Ancient -> Modern -> Information
 */
export class AgeManager {
    /**
     * Get the next age after the current one
     * @param {string} currentAge - Current age type
     * @returns {string|null} Next age type, or null if at max age
     */
    static getNextAge(currentAge) {
        // TODO: Return next age in progression
        // Ancient -> Modern -> Information -> null
    }

    /**
     * Check if an age can be advanced to
     * @param {string} currentAge - Current age type
     * @param {number} sciencePoints - Current science points
     * @returns {boolean} True if can advance
     */
    static canAdvanceAge(currentAge, sciencePoints) {
        // TODO: Check if enough science/research to advance
        // Return true if requirements met
    }

    /**
     * Get age-specific bonuses
     * @param {string} ageType - The age type
     * @returns {Object} Bonuses object
     */
    static getBonuses(ageType) {
        // TODO: Return bonuses for the given age
    }
}
