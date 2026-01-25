'use strict';

/**
 * UI Controller - Manages notifications, modals, and UI updates
 */

/**
 * Show a toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type: 'success', 'warning', 'info'
 * @param {number} duration - Duration in ms (default 3000)
 */
export function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    // Remove after animation
    setTimeout(() => {
        toast.remove();
    }, duration);
}

/**
 * Flash a resource value to show change
 * @param {string} elementId - ID of the stat-value element
 * @param {number} oldValue - Previous value
 * @param {number} newValue - New value
 */
export function flashResourceChange(elementId, oldValue, newValue) {
    const el = document.getElementById(elementId);
    if (!el) return;
    
    el.textContent = Math.floor(newValue);
    
    if (newValue > oldValue) {
        el.classList.add('increased');
        setTimeout(() => el.classList.remove('increased'), 500);
    } else if (newValue < oldValue) {
        el.classList.add('decreased');
        setTimeout(() => el.classList.remove('decreased'), 500);
    }
}

/**
 * Update action buttons for selected unit/city
 * @param {Object} options - Button configuration
 * @param {Unit} options.unit - Selected unit (optional)
 * @param {City} options.city - Selected city (optional) 
 * @param {Function} options.onFoundCity - Handler for found city action
 * @param {Function} options.onSetProduction - Handler for production selection
 */
export function updateActionButtons(options = {}) {
    const container = document.getElementById('action-buttons');
    if (!container) return;
    
    container.innerHTML = '';
    
    const { unit, city, onFoundCity, onSetProduction } = options;
    
    // Unit actions
    if (unit) {
        if (unit.canFoundCity) {
            const btn = document.createElement('button');
            btn.className = 'action-btn primary';
            btn.textContent = '🏛️ Found City';
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (onFoundCity) onFoundCity();
            });
            container.appendChild(btn);
        }
        
        if (unit.strength > 0) {
            const btn = document.createElement('button');
            btn.className = 'action-btn';
            btn.textContent = '⚔️ Fortify';
            container.appendChild(btn);
        }
    }
    
    // City production selection
    if (city && onSetProduction) {
        const productionDiv = document.createElement('div');
        productionDiv.className = 'production-select';
        productionDiv.innerHTML = '<span style="font-size:10px;color:#94a3b8;width:100%">Build:</span>';
        
        const units = ['WARRIOR', 'SETTLER', 'WORKER'];
        units.forEach(unitType => {
            const btn = document.createElement('button');
            btn.className = 'production-btn' + (city.getCurrentProduction() === unitType ? ' active' : '');
            btn.textContent = unitType.charAt(0) + unitType.slice(1).toLowerCase();
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                onSetProduction(city, unitType);
            });
            productionDiv.appendChild(btn);
        });
        
        container.appendChild(productionDiv);
    }
    
    // Show/hide container
    if (container.children.length > 0) {
        container.classList.remove('hidden');
    } else {
        container.classList.add('hidden');
    }
}

/**
 * Store previous resource values for change detection
 */
let previousResources = { Gold: 0, Food: 0, Production: 0 };

/**
 * Update game UI with resource change animations
 * @param {GameState} gameState - Current game state
 */
export function updateGameUIWithAnimations(gameState) {
    const currentNation = gameState.getCurrentNation();
    if (!currentNation) return;
    
    const resources = currentNation.getResources().getAll();
    
    // Flash changed resources
    if (resources.Gold !== previousResources.Gold) {
        flashResourceChange('gold-value', previousResources.Gold, resources.Gold);
    } else {
        const goldEl = document.getElementById('gold-value');
        if (goldEl) goldEl.textContent = Math.floor(resources.Gold || 0);
    }
    
    if (resources.Food !== previousResources.Food) {
        flashResourceChange('food-value', previousResources.Food, resources.Food);
    } else {
        const foodEl = document.getElementById('food-value');
        if (foodEl) foodEl.textContent = Math.floor(resources.Food || 0);
    }
    
    if (resources.Production !== previousResources.Production) {
        flashResourceChange('production-value', previousResources.Production, resources.Production);
    } else {
        const prodEl = document.getElementById('production-value');
        if (prodEl) prodEl.textContent = Math.floor(resources.Production || 0);
    }
    
    // Store for next comparison
    previousResources = { ...resources };
    
    // Update other HUD elements
    const activeNationEl = document.getElementById('active-nation');
    if (activeNationEl) {
        activeNationEl.textContent = currentNation.getName();
        activeNationEl.style.color = currentNation.getColor() === 'red' ? '#ef4444' : '#3b82f6';
    }
    
    const turnEl = document.getElementById('turn-value');
    if (turnEl) turnEl.textContent = gameState.getTurn();
}
