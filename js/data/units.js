'use strict';

/**
 * Unit type definitions with properties
 */
export const UNIT_TYPES = Object.freeze({
    WARRIOR: {
        name: 'Warrior',
        movement: 2,
        strength: 6,
        maxHealth: 100,
        cost: 30, // Production cost
        canFoundCity: false
    },
    SETTLER: {
        name: 'Settler',
        movement: 2,
        strength: 0,
        maxHealth: 100,
        cost: 50, // Production cost
        canFoundCity: true
    },
    WORKER: {
        name: 'Worker',
        movement: 2,
        strength: 0,
        maxHealth: 100,
        cost: 40, // Production cost
        canFoundCity: false
    }
});

/**
 * Get unit type definition
 * @param {string} unitType - Unit type key (e.g., 'WARRIOR', 'SETTLER', 'WORKER')
 * @returns {Object} Unit type definition
 */
export function getUnitType(unitType) {
    return UNIT_TYPES[unitType];
}

/**
 * Initialize a unit with stats from unit type definition
 * This should be called after creating a Unit instance
 * @param {Unit} unit - Unit instance
 * @param {string} unitType - Unit type key
 */
export function initializeUnitStats(unit, unitType) {
    const typeDef = UNIT_TYPES[unitType];
    
    if (!typeDef) {
        throw new Error(`Unknown unit type: ${unitType}`);
    }
    
    unit.maxMovement = typeDef.movement;
    unit.movementPoints = typeDef.movement;
    unit.maxHealth = typeDef.maxHealth;
    unit.health = typeDef.maxHealth;
    unit.strength = typeDef.strength;
    unit.canFoundCity = typeDef.canFoundCity;
}
