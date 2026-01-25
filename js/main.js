'use strict';

import { HexGrid } from './core/HexGrid.js';
import { RenderEngine } from './core/RenderEngine.js';
import { GameState } from './core/GameState.js';
import { HexData } from './core/HexData.js';
import { City } from './core/City.js';
import { Unit } from './core/Unit.js';
import { TerrainType } from './data/terrain.js';
import { getAdjacentHexes } from './utils/hex-math.js';
import { getMovementCost, isPassable } from './data/yields.js';
import { initializeUnitStats, UNIT_TYPES } from './data/units.js';
import { HEX_SIZE, GRID_WIDTH, GRID_HEIGHT } from './config.js';
import { showToast, updateActionButtons, updateGameUIWithAnimations } from './ui-controller.js';
import { processAITurn } from './core/AI.js';
import { spriteManager } from './utils/sprites.js';

/**
 * Generate terrain data for the grid using procedural noise
 * @param {HexGrid} grid - The hex grid
 * @returns {Map} Map of hex id to terrain data
 */
function generateTerrain(grid) {
    const dataMap = new Map();

    grid.forEach((hex) => {
        const noise = Math.sin(hex.q * 0.4) + Math.cos(hex.r * 0.4 + hex.q * 0.2);
        let type = TerrainType.OCEAN;

        if (noise > 1.2) {
            type = TerrainType.MOUNTAIN;
        } else if (noise > 1.0) {
            type = TerrainType.SNOW;
        } else if (noise > 0.6) {
            type = TerrainType.TUNDRA;
        } else if (noise > 0.1) {
            type = TerrainType.GRASSLAND;
        } else if (noise > -0.3) {
            type = TerrainType.PLAINS;
        } else if (noise > -0.5) {
            type = TerrainType.DESERT;
        } else if (noise > -0.8) {
            type = TerrainType.COAST;
        }

        dataMap.set(`${hex.q},${hex.r}`, { type });
    });

    return dataMap;
}

// Game state variables
let selectedUnit = null;
let validMoveHexes = [];

/**
 * Get unit at a specific hex
 * @param {Map} dataMap - Map of hex data
 * @param {number} q - Hex column
 * @param {number} r - Hex row
 * @param {Nation} nation - Nation to check (null for any)
 * @returns {Unit|null} Unit at hex, or null
 */
function getUnitAtHex(dataMap, q, r, nation = null) {
    const hexId = `${q},${r}`;
    const hexData = dataMap.get(hexId);
    if (!hexData) return null;

    const units = hexData.getUnits();
    if (units.length === 0) return null;

    if (nation) {
        return units.find(u => u.owner === nation) || null;
    }

    return units[0]; // Return first unit if no nation specified
}

/**
 * Calculate valid movement hexes for a unit
 * @param {HexGrid} grid - The hex grid
 * @param {Map} dataMap - Map of hex data
 * @param {Unit} unit - The unit
 * @returns {Array<{q: number, r: number}>} Array of valid hex coordinates
 */
function calculateValidMoves(grid, dataMap, unit) {
    const validHexes = [];
    const pos = unit.getPosition();
    const adjacent = getAdjacentHexes(pos.q, pos.r);

    for (const hex of adjacent) {
        if (!grid.hasHex(hex.q, hex.r)) continue;

        const hexId = `${hex.q},${hex.r}`;
        const hexData = dataMap.get(hexId);
        if (!hexData) continue;

        const terrainType = hexData.terrain.type;
        if (!isPassable(terrainType)) continue;

        const cost = getMovementCost(terrainType);
        if (unit.getMovement() >= cost) {
            validHexes.push(hex);
        }
    }

    return validHexes;
}

/**
 * Move a unit to a new hex
 * @param {HexGrid} grid - The hex grid
 * @param {Map} dataMap - Map of hex data
 * @param {Unit} unit - The unit to move
 * @param {number} q - Target hex column
 * @param {number} r - Target hex row
 * @returns {boolean} True if move was successful
 */
function moveUnit(grid, dataMap, unit, q, r) {
    const oldPos = unit.getPosition();
    const hexId = `${q},${r}`;
    const hexData = dataMap.get(hexId);

    if (!hexData) return false;

    const terrainType = hexData.terrain.type;
    const cost = getMovementCost(terrainType);

    if (!unit.move(q, r, cost)) {
        return false;
    }

    // Update HexData
    const oldHexId = `${oldPos.q},${oldPos.r}`;
    const oldHexData = dataMap.get(oldHexId);
    if (oldHexData) {
        oldHexData.removeUnit(unit);
    }

    hexData.addUnit(unit);
    return true;
}

/**
 * Found a city at a settler's position
 * @param {HexGrid} grid - The hex grid
 * @param {Map} dataMap - Map of hex data
 * @param {GameState} gameState - Game state
 * @param {Unit} settler - The settler unit
 * @returns {boolean} True if city was founded
 */
function foundCity(grid, dataMap, gameState, settler) {
    if (!settler.canFoundCity) return false;

    const pos = settler.getPosition();
    const hexId = `${pos.q},${pos.r}`;
    const hexData = dataMap.get(hexId);

    if (!hexData) return false;

    // Check if terrain is valid (not ocean, not mountain)
    const terrainType = hexData.terrain.type;
    if (terrainType === TerrainType.OCEAN || terrainType === TerrainType.MOUNTAIN) {
        return false;
    }

    // Check if too close to other cities (min 3 hexes away)
    const currentNation = gameState.getCurrentNation();
    const allCities = currentNation.getCities();

    for (const city of allCities) {
        const cityPos = city.getPosition();
        const distance = Math.abs(pos.q - cityPos.q) + Math.abs(pos.r - cityPos.r);
        if (distance < 3) {
            return false; // Too close to another city
        }
    }

    // Create city
    const cityName = `${currentNation.getName()} City ${allCities.length + 1}`;
    const city = new City(cityName, pos, currentNation);

    // Expand initial borders (city hex + 6 adjacent)
    const adjacent = getAdjacentHexes(pos.q, pos.r);
    const borderHexes = [{ q: pos.q, r: pos.r }, ...adjacent];
    city.expandBorders(borderHexes);

    // Update hex data
    hexData.setCity(city);
    hexData.setOwner(currentNation);

    // Update borders ownership
    for (const borderHex of borderHexes) {
        const borderHexId = `${borderHex.q},${borderHex.r}`;
        const borderHexData = dataMap.get(borderHexId);
        if (borderHexData) {
            borderHexData.setOwner(currentNation);
        }
    }

    // Add city to nation
    currentNation.addCity(city);

    // Show success notification
    showToast(`${cityName} has been founded!`, 'success');

    // Set up production completion handler
    if (window.setupCityProduction) {
        window.setupCityProduction(city);
    }

    // Remove settler
    currentNation.removeUnit(settler);
    hexData.removeUnit(settler);

    return true;
}

/**
 * Update the UI with current game state
 * @param {GameState} gameState - Game state
 */
function updateGameUI(gameState) {
    updateGameUIWithAnimations(gameState);
}

/**
 * Update the UI selection panel
 * @param {Object} hexData - The selected hex data
 * @param {GameState} gameState - Game state
 * @param {HexGrid} grid - The hex grid
 * @param {Map} dataMap - Map of hex data
 * @param {Object} callbacks - Callback functions for actions
 */
function updateUI(hexData, gameState, grid, dataMap, callbacks = {}) {
    const panel = document.getElementById('selection-panel');
    if (!panel) return;

    const hexInfo = document.getElementById('hex-info');
    const hexSubtitle = document.getElementById('hex-subtitle');
    const unitInfo = document.getElementById('unit-info');
    const cityInfo = document.getElementById('city-info');

    const terrainType = hexData.terrain ? hexData.terrain.type : hexData.type;
    if (hexInfo) hexInfo.textContent = terrainType;

    // Check for unit
    const currentNation = gameState.getCurrentNation();
    const pos = hexData.hexId ? hexData.hexId.split(',').map(Number) : null;
    let unit = null;
    let city = null;

    if (pos) {
        unit = getUnitAtHex(dataMap, pos[0], pos[1], currentNation);
        city = hexData.getCity ? hexData.getCity() : null;
    }

    // Show unit info
    if (unit && unitInfo) {
        unitInfo.classList.remove('hidden');
        unitInfo.innerHTML = `
            <div><span class="label">Unit:</span> ${unit.unitType}</div>
            <div><span class="label">Movement:</span> ${unit.getMovement()}/${unit.getMaxMovement()}</div>
            <div><span class="label">Health:</span> ${unit.health}/${unit.maxHealth}</div>
        `;
    } else if (unitInfo) {
        unitInfo.classList.add('hidden');
    }

    // Show city info
    if (city && cityInfo) {
        cityInfo.classList.remove('hidden');
        const currentProd = city.getCurrentProduction();
        const prodCost = currentProd ? (UNIT_TYPES[currentProd]?.cost || 50) : 0;
        cityInfo.innerHTML = `
            <div><span class="label">City:</span> ${city.getName()}</div>
            <div><span class="label">Population:</span> ${city.getPopulation()}</div>
            <div><span class="label">Building:</span> ${currentProd || 'Nothing'}</div>
            ${currentProd ? `<div><span class="label">Progress:</span> ${Math.floor(city.getProduction())}/${prodCost}</div>` : ''}
        `;
    } else if (cityInfo) {
        cityInfo.classList.add('hidden');
    }

    if (hexSubtitle) {
        hexSubtitle.textContent = unit ? 'Unit Selected' : city ? 'City' : 'Terrain';
    }

    // Update action buttons
    updateActionButtons({
        unit: unit,
        city: city,
        onFoundCity: callbacks.onFoundCity,
        onSetProduction: callbacks.onSetProduction
    });

    panel.classList.remove('hidden');
}

/**
 * Initialize the game
 */
async function init() {
    const canvas = document.getElementById('game-canvas');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }

    // Load sprites
    try {
        await spriteManager.loadAll();
        console.log('Sprites loaded successfully');
    } catch (e) {
        console.warn('Some sprites failed to load, using fallback rendering');
    }

    // Create grid and generate terrain
    const grid = new HexGrid(HEX_SIZE, GRID_WIDTH, GRID_HEIGHT);
    const terrainMap = generateTerrain(grid);

    // Convert terrain data to HexData objects
    const dataMap = new Map();
    terrainMap.forEach((terrainData, hexId) => {
        dataMap.set(hexId, new HexData(hexId, terrainData));
    });

    // Initialize game state with Red and Blue nations
    const gameState = GameState.createDefault();

    // Place starting units for each nation
    const nations = gameState.getNations();
    const startingPositions = [
        { q: 10, r: 10 }, // Red starting position (left side)
        { q: 40, r: 25 }  // Blue starting position (right side)
    ];

    for (let i = 0; i < nations.length && i < startingPositions.length; i++) {
        const nation = nations[i];
        const startPos = startingPositions[i];

        // Find valid terrain near starting position
        let validPos = null;
        for (let offsetQ = -2; offsetQ <= 2 && !validPos; offsetQ++) {
            for (let offsetR = -2; offsetR <= 2 && !validPos; offsetR++) {
                const testQ = startPos.q + offsetQ;
                const testR = startPos.r + offsetR;
                if (grid.hasHex(testQ, testR)) {
                    const hexId = `${testQ},${testR}`;
                    const hexData = dataMap.get(hexId);
                    if (hexData) {
                        const terrainType = hexData.terrain.type;
                        if (terrainType !== TerrainType.OCEAN &&
                            terrainType !== TerrainType.MOUNTAIN &&
                            terrainType !== TerrainType.SNOW) {
                            validPos = { q: testQ, r: testR };
                        }
                    }
                }
            }
        }

        if (validPos) {
            // Create starting Settler
            const settler = new Unit('SETTLER', validPos, nation);
            initializeUnitStats(settler, 'SETTLER');
            nation.addUnit(settler);
            const settlerHexId = `${validPos.q},${validPos.r}`;
            const settlerHexData = dataMap.get(settlerHexId);
            if (settlerHexData) {
                settlerHexData.addUnit(settler);
            }

            // Create starting Warrior (one hex away)
            const warriorPos = getAdjacentHexes(validPos.q, validPos.r)[0];
            if (grid.hasHex(warriorPos.q, warriorPos.r)) {
                const warrior = new Unit('WARRIOR', warriorPos, nation);
                initializeUnitStats(warrior, 'WARRIOR');
                nation.addUnit(warrior);
                const warriorHexId = `${warriorPos.q},${warriorPos.r}`;
                const warriorHexData = dataMap.get(warriorHexId);
                if (warriorHexData) {
                    warriorHexData.addUnit(warrior);
                }
            }
        }
    }

    // Create renderer
    const engine = new RenderEngine(canvas);
    engine.setData(grid, dataMap);
    engine.setGameState(gameState);

    // Set up city production completion handler
    const setupCityProduction = (city) => {
        city.onProductionComplete = (itemType, cityInstance) => {
            // Create unit when production completes
            const pos = cityInstance.getPosition();
            const owner = cityInstance.owner;

            // Create unit
            const unit = new Unit(itemType, pos, owner);
            initializeUnitStats(unit, itemType);

            // Add unit to nation and hex
            owner.addUnit(unit);
            const hexId = `${pos.q},${pos.r}`;
            const hexData = dataMap.get(hexId);
            if (hexData) {
                hexData.addUnit(unit);
            }

            engine.render();
        };
    };

    // Set up production handlers for any existing cities
    for (const nation of gameState.getNations()) {
        for (const city of nation.getCities()) {
            setupCityProduction(city);
        }
    }

    // Handle hex selection and unit movement
    engine.onHexSelect((hexData, hexCoord) => {
        const currentNation = gameState.getCurrentNation();

        // Check if clicking on a unit
        const unit = getUnitAtHex(dataMap, hexCoord.q, hexCoord.r, currentNation);

        if (unit && unit.owner === currentNation) {
            // Select unit
            selectedUnit = unit;
            validMoveHexes = calculateValidMoves(grid, dataMap, unit);
            engine.setValidMoveHexes(validMoveHexes);
        } else if (selectedUnit) {
            // Check if clicking on an enemy unit
            const targetUnit = getUnitAtHex(dataMap, hexCoord.q, hexCoord.r);
            const isEnemy = targetUnit && targetUnit.owner !== currentNation;

            if (isEnemy && selectedUnit.canAttack()) {
                // Try to attack
                const adjacent = getAdjacentHexes(selectedUnit.getPosition().q, selectedUnit.getPosition().r);
                const canReach = adjacent.some(h => h.q === hexCoord.q && h.r === hexCoord.r);

                if (canReach) {
                    const result = selectedUnit.attack(targetUnit);
                    if (result.success) {
                        // Check if target was destroyed
                        if (targetUnit.isDestroyed()) {
                            // Remove from nation and hex
                            targetUnit.owner.removeUnit(targetUnit);
                            const targetHexId = `${hexCoord.q},${hexCoord.r}`;
                            const targetHexData = dataMap.get(targetHexId);
                            if (targetHexData) {
                                targetHexData.removeUnit(targetUnit);
                            }
                        }
                        selectedUnit = null;
                        validMoveHexes = [];
                        engine.setValidMoveHexes([]);
                    }
                }
            } else {
                // Try to move selected unit
                const targetHex = validMoveHexes.find(h => h.q === hexCoord.q && h.r === hexCoord.r);

                if (targetHex) {
                    // Valid move
                    moveUnit(grid, dataMap, selectedUnit, hexCoord.q, hexCoord.r);
                    selectedUnit = null;
                    validMoveHexes = [];
                    engine.setValidMoveHexes([]);
                } else if (hexCoord.q === selectedUnit.getPosition().q &&
                    hexCoord.r === selectedUnit.getPosition().r) {
                    // Clicked on same hex - keep unit selected for action buttons
                    // City founding is now handled by the action button
                } else {
                    // Invalid move - deselect
                    selectedUnit = null;
                    validMoveHexes = [];
                    engine.setValidMoveHexes([]);
                }
            }
        }

        // Create callbacks for action buttons
        const actionCallbacks = {
            onFoundCity: () => {
                if (selectedUnit && selectedUnit.canFoundCity) {
                    if (foundCity(grid, dataMap, gameState, selectedUnit)) {
                        selectedUnit = null;
                        validMoveHexes = [];
                        engine.setValidMoveHexes([]);
                        updateGameUI(gameState);
                        engine.render();
                    } else {
                        showToast('Cannot found city here!', 'warning');
                    }
                }
            },
            onSetProduction: (city, unitType) => {
                city.setProduction(unitType);
                showToast(`${city.getName()} now building ${unitType}`, 'info');
                // Refresh the city info display
                const cityInfo = document.getElementById('city-info');
                if (cityInfo) {
                    const currentProd = city.getCurrentProduction();
                    const prodCost = currentProd ? (UNIT_TYPES[currentProd]?.cost || 50) : 0;
                    cityInfo.innerHTML = `
                        <div><span class="label">City:</span> ${city.getName()}</div>
                        <div><span class="label">Population:</span> ${city.getPopulation()}</div>
                        <div><span class="label">Building:</span> ${currentProd || 'Nothing'}</div>
                        ${currentProd ? `<div><span class="label">Progress:</span> ${Math.floor(city.getProduction())}/${prodCost}</div>` : ''}
                    `;
                }
                // Update production button states
                document.querySelectorAll('.production-btn').forEach(btn => {
                    btn.classList.toggle('active', btn.textContent.toUpperCase() === unitType);
                });
                engine.render();
            }
        };

        updateUI(hexData, gameState, grid, dataMap, actionCallbacks);
        engine.render();
    });

    // Next Turn button
    const nextTurnBtn = document.getElementById('next-turn-btn');
    if (nextTurnBtn) {
        nextTurnBtn.addEventListener('click', () => {
            // Process current nation's turn
            gameState.nextTurn(dataMap);

            // If it's now the AI nation's turn (Blue), run AI
            const currentNation = gameState.getCurrentNation();
            if (currentNation && currentNation.getName() === 'Blue') {
                // Run AI turn with slight delay for visual feedback
                setTimeout(() => {
                    processAITurn(currentNation, gameState, dataMap, grid);
                    showToast('Blue nation completed their turn', 'info');

                    // Auto-advance to next turn
                    gameState.nextTurn(dataMap);
                    updateGameUI(gameState);
                    engine.render();
                }, 300);
            }

            updateGameUI(gameState);
            selectedUnit = null;
            validMoveHexes = [];
            engine.setValidMoveHexes([]);
            engine.render();
        });
    }

    // Initial UI update
    updateGameUI(gameState);

    // Initial render
    engine.render();

    // Store references globally for access
    window.gameState = gameState;
    window.dataMap = dataMap;
    window.grid = grid;
    window.engine = engine;
    window.updateGameUI = () => updateGameUI(gameState);
    window.setupCityProduction = setupCityProduction;
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', init);
