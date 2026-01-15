'use strict';

import { Nation } from './Nation.js';
import { AgeType } from '../data/ages.js';

/**
 * Manages the overall game state, turns, and active player
 */
export class GameState {
    /**
     * Create a new game state
     * @param {Array<Nation>} nations - Array of nations in the game
     */
    constructor(nations = []) {
        // TODO: Initialize game state properties
        // - nations: Array of Nation objects
        // - currentTurn: Current turn number (starts at 1)
        // - activeNationIndex: Index of currently active nation
        // - gamePhase: Current phase (e.g., 'setup', 'playing', 'ended')
    }

    /**
     * Initialize game with default nations (Red and Blue)
     * @returns {GameState} This game state instance
     */
    static createDefault() {
        // TODO: Create Red and Blue nations
        // Initialize them with starting resources
        // Return new GameState with these nations
    }

    /**
     * Get current turn number
     * @returns {number} Current turn
     */
    getTurn() {
        // TODO: Return current turn number
    }

    /**
     * Get currently active nation
     * @returns {Nation} Active nation
     */
    getCurrentNation() {
        // TODO: Return nation at activeNationIndex
    }

    /**
     * Get all nations
     * @returns {Array<Nation>} Array of all nations
     */
    getNations() {
        // TODO: Return nations array
    }

    /**
     * Get a nation by name
     * @param {string} name - Nation name
     * @returns {Nation|undefined} Nation object, or undefined
     */
    getNationByName(name) {
        // TODO: Find and return nation with matching name
    }

    /**
     * Advance to the next turn
     */
    nextTurn() {
        // TODO: Process turn logic
        // 1. Process turn for current active nation
        // 2. Advance to next nation (or cycle back to first)
        // 3. If all nations have played, increment turn number
        // 4. Reset active nation index if needed
    }

    /**
     * Process turn for the current active nation
     */
    processCurrentNationTurn() {
        // TODO: Get current nation and call processTurn()
    }

    /**
     * Advance to the next nation
     */
    nextNation() {
        // TODO: Increment activeNationIndex
        // If at end of nations array, cycle to 0 and increment turn
    }

    /**
     * Check if game is over
     * @returns {boolean} True if game has ended
     */
    isGameOver() {
        // TODO: Check win/loss conditions
        // Return true if game should end
    }

    /**
     * Get game phase
     * @returns {string} Current game phase
     */
    getPhase() {
        // TODO: Return current game phase
    }

    /**
     * Set game phase
     * @param {string} phase - New game phase
     */
    setPhase(phase) {
        // TODO: Set game phase
    }
}
