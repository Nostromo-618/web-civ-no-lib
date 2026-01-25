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
        this.nations = nations;
        this.currentTurn = 1;
        this.activeNationIndex = 0;
        this.gamePhase = 'playing';
    }

    /**
     * Initialize game with default nations (Red and Blue)
     * @returns {GameState} This game state instance
     */
    static createDefault() {
        const redNation = new Nation('Red', 'red');
        const blueNation = new Nation('Blue', 'blue');
        
        // Give starting resources
        redNation.addResource('Gold', 100);
        redNation.addResource('Food', 50);
        redNation.addResource('Production', 50);
        
        blueNation.addResource('Gold', 100);
        blueNation.addResource('Food', 50);
        blueNation.addResource('Production', 50);
        
        return new GameState([redNation, blueNation]);
    }

    /**
     * Get current turn number
     * @returns {number} Current turn
     */
    getTurn() {
        return this.currentTurn;
    }

    /**
     * Get currently active nation
     * @returns {Nation} Active nation
     */
    getCurrentNation() {
        if (this.nations.length === 0) return null;
        return this.nations[this.activeNationIndex];
    }

    /**
     * Get all nations
     * @returns {Array<Nation>} Array of all nations
     */
    getNations() {
        return this.nations;
    }

    /**
     * Get a nation by name
     * @param {string} name - Nation name
     * @returns {Nation|undefined} Nation object, or undefined
     */
    getNationByName(name) {
        return this.nations.find(nation => nation.getName() === name);
    }


    /**
     * Process turn for the current active nation
     * @param {Map} dataMap - Map of hex data for resource collection
     */
    processCurrentNationTurn(dataMap = null) {
        const currentNation = this.getCurrentNation();
        if (currentNation) {
            currentNation.processTurn(dataMap);
        }
    }

    /**
     * Advance to the next turn
     * @param {Map} dataMap - Map of hex data for resource collection
     */
    nextTurn(dataMap = null) {
        // Process turn for current active nation
        this.processCurrentNationTurn(dataMap);
        
        // Advance to next nation
        this.nextNation();
    }

    /**
     * Advance to the next nation
     */
    nextNation() {
        this.activeNationIndex++;
        
        // If at end of nations array, cycle to 0 and increment turn
        if (this.activeNationIndex >= this.nations.length) {
            this.activeNationIndex = 0;
            this.currentTurn++;
        }
    }

    /**
     * Check if game is over
     * @returns {boolean} True if game has ended
     */
    isGameOver() {
        // Game ends when one nation has no cities
        const nationsWithCities = this.nations.filter(nation => nation.getCities().length > 0);
        return nationsWithCities.length <= 1;
    }

    /**
     * Get game phase
     * @returns {string} Current game phase
     */
    getPhase() {
        return this.gamePhase;
    }

    /**
     * Set game phase
     * @param {string} phase - New game phase
     */
    setPhase(phase) {
        this.gamePhase = phase;
    }
}
