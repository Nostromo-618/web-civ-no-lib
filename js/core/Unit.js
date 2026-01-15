'use strict';

/**
 * Represents a unit (military or civilian) on the map
 */
export class Unit {
    /**
     * Create a new unit
     * @param {string} unitType - Type of unit (warrior, settler, worker, etc.)
     * @param {Object} position - Hex coordinates {q, r}
     * @param {Nation} owner - The nation that owns this unit
     */
    constructor(unitType, position, owner) {
        this.unitType = unitType;
        this.position = position; // {q, r}
        this.owner = owner;
        
        // TODO: Initialize unit properties
        // - movementPoints: Current movement points (resets each turn)
        // - maxMovement: Maximum movement points per turn
        // - health: Current health (0-100 or similar)
        // - maxHealth: Maximum health
        // - strength: Combat strength
        // - hasActed: Boolean if unit has acted this turn
    }

    /**
     * Get the current position
     * @returns {{q: number, r: number}} Hex coordinates
     */
    getPosition() {
        // TODO: Return position
    }

    /**
     * Get current movement points
     * @returns {number} Remaining movement points
     */
    getMovement() {
        // TODO: Return current movement points
    }

    /**
     * Get maximum movement points
     * @returns {number} Max movement per turn
     */
    getMaxMovement() {
        // TODO: Return max movement
    }

    /**
     * Move unit to a new hex
     * @param {number} q - Target hex column
     * @param {number} r - Target hex row
     * @param {number} movementCost - Movement cost to reach target
     * @returns {boolean} True if move was successful
     */
    move(q, r, movementCost) {
        // TODO: Check if enough movement points
        // Update position, subtract movement cost
        // Return true if successful
    }

    /**
     * Attack another unit
     * @param {Unit} target - Unit to attack
     * @returns {Object} Combat result {success: boolean, damage: number}
     */
    attack(target) {
        // TODO: Calculate combat based on strength, terrain, etc.
        // Apply damage to target
        // Return combat result
    }

    /**
     * Reset movement points for new turn
     */
    resetMovement() {
        // TODO: Reset movement points to max, set hasActed to false
    }

    /**
     * Check if unit can move
     * @returns {boolean} True if has movement points remaining
     */
    canMove() {
        // TODO: Check if movement points > 0 and has not acted
    }

    /**
     * Check if unit can attack
     * @returns {boolean} True if can attack
     */
    canAttack() {
        // TODO: Check if unit has not acted and has attack capability
    }

    /**
     * Take damage
     * @param {number} damage - Amount of damage
     */
    takeDamage(damage) {
        // TODO: Reduce health, check if unit is destroyed
    }

    /**
     * Check if unit is destroyed
     * @returns {boolean} True if health <= 0
     */
    isDestroyed() {
        // TODO: Check if health <= 0
    }

    /**
     * Get unit's combat strength
     * @returns {number} Combat strength value
     */
    getStrength() {
        // TODO: Return strength (may include bonuses)
    }
}
