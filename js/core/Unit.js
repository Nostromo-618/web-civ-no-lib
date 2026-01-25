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
        
        // Initialize unit properties based on type (defaults, will be overridden by unit types)
        // Default stats - will be set properly when unit types are defined
        this.maxMovement = 2;
        this.movementPoints = this.maxMovement;
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.strength = 0; // Will be set based on unit type
        this.hasActed = false;
        this.canFoundCity = false; // Only settlers can found cities
    }

    /**
     * Get the current position
     * @returns {{q: number, r: number}} Hex coordinates
     */
    getPosition() {
        return this.position;
    }

    /**
     * Get current movement points
     * @returns {number} Remaining movement points
     */
    getMovement() {
        return this.movementPoints;
    }

    /**
     * Get maximum movement points
     * @returns {number} Max movement per turn
     */
    getMaxMovement() {
        return this.maxMovement;
    }

    /**
     * Move unit to a new hex
     * @param {number} q - Target hex column
     * @param {number} r - Target hex row
     * @param {number} movementCost - Movement cost to reach target
     * @returns {boolean} True if move was successful
     */
    move(q, r, movementCost) {
        if (this.movementPoints < movementCost) {
            return false;
        }
        
        this.position = { q, r };
        this.movementPoints -= movementCost;
        return true;
    }

    /**
     * Attack another unit
     * @param {Unit} target - Unit to attack
     * @returns {Object} Combat result {success: boolean, damage: number}
     */
    attack(target) {
        if (!this.canAttack() || this.strength === 0) {
            return { success: false, damage: 0 };
        }
        
        // Calculate damage: base strength + random variance (80-120%)
        const variance = 0.8 + Math.random() * 0.4;
        const damage = Math.floor(this.strength * variance);
        
        target.takeDamage(damage);
        this.hasActed = true;
        
        return { success: true, damage };
    }

    /**
     * Reset movement points for new turn
     */
    resetMovement() {
        this.movementPoints = this.maxMovement;
        this.hasActed = false;
    }

    /**
     * Check if unit can move
     * @returns {boolean} True if has movement points remaining
     */
    canMove() {
        return this.movementPoints > 0 && !this.hasActed;
    }

    /**
     * Check if unit can attack
     * @returns {boolean} True if can attack
     */
    canAttack() {
        return !this.hasActed && this.strength > 0;
    }

    /**
     * Take damage
     * @param {number} damage - Amount of damage
     */
    takeDamage(damage) {
        this.health = Math.max(0, this.health - damage);
    }

    /**
     * Check if unit is destroyed
     * @returns {boolean} True if health <= 0
     */
    isDestroyed() {
        return this.health <= 0;
    }

    /**
     * Get unit's combat strength
     * @returns {number} Combat strength value
     */
    getStrength() {
        return this.strength;
    }
}
