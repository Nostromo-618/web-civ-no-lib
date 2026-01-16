# Web Civ Game - Development Plan

## Current State

### ✅ Working
- Hex grid system with terrain generation
- Render engine with pan/zoom and hex selection
- Basic UI (HUD, selection panel)
- Core class structures (stubs with TODOs)
- Data definitions (Terrain, Resources, Ages)

### ❌ Missing
- All core game logic implementations (marked with TODOs)

---

## Development Phases

### Phase 1: Foundation (START HERE)

#### 1. ResourceManager (`js/data/resources.js`)
- **Priority**: Critical - needed by everything
- **Tasks**:
  - Implement resource storage (Map or object)
  - `get()`, `add()`, `spend()`, `hasEnough()`, `getAll()`
  - Basic validation (amount >= 0)
- **Dependencies**: None
- **Enables**: Nation, City resource management

#### 2. GameState (`js/core/GameState.js`)
- **Priority**: Critical - core game loop
- **Tasks**:
  - Initialize properties (nations array, currentTurn, activeNationIndex, gamePhase)
  - Implement `createDefault()` - create Red and Blue nations
  - Implement `getTurn()`, `getCurrentNation()`, `getNations()`, `getNationByName()`
  - Implement `nextTurn()` - process current nation, advance to next
  - Implement `nextNation()` - cycle through nations
  - Implement `processCurrentNationTurn()`
  - Basic phase management (`getPhase()`, `setPhase()`)
- **Dependencies**: Nation class (basic structure)
- **Enables**: Turn-based gameplay, nation cycling

#### 3. Nation (`js/core/Nation.js`)
- **Priority**: Critical - player representation
- **Tasks**:
  - Initialize properties (resources: ResourceManager, cities: [], units: [], currentAge, technologies: [])
  - Implement basic getters (`getName()`, `getColor()`, `getAge()`, `getCities()`, `getUnits()`, `getResources()`)
  - Implement resource methods (`addResource()`, `spendResource()`, `hasEnoughResources()`)
  - Implement city/unit management (`addCity()`, `removeCity()`, `addUnit()`, `removeUnit()`)
  - Basic `processTurn()` stub (will expand later)
- **Dependencies**: ResourceManager
- **Enables**: Player entities, resource tracking

---

### Phase 2: Core Entities

#### 4. HexData (`js/core/HexData.js`)
- **Priority**: High - map ownership system
- **Tasks**:
  - Initialize properties (owner: null, improvements: [], units: [], city: null)
  - Implement ownership methods (`setOwner()`, `getOwner()`, `isOwnedBy()`)
  - Implement improvement methods (`addImprovement()`, `getImprovements()`)
  - Implement unit methods (`addUnit()`, `removeUnit()`, `getUnits()`)
  - Implement city methods (`setCity()`, `getCity()`, `hasCity()`)
- **Dependencies**: Nation, City, Unit (basic structure)
- **Enables**: Territory control, unit placement, city placement

#### 5. City (`js/core/City.js`)
- **Priority**: High - core gameplay element
- **Tasks**:
  - Initialize properties (population: 1, productionQueue: [], currentProduction: null, productionProgress: 0, borders: [], buildings: [])
  - Implement basic getters (`getName()`, `getPosition()`, `getPopulation()`)
  - Implement `growPopulation()` - increase population
  - Implement production system (`getProduction()`, `addProduction()`, `setProduction()`, `getCurrentProduction()`)
  - Implement queue methods (`getProductionQueue()`, `queueProduction()`)
  - Implement border methods (`getBorders()`, `expandBorders()`)
  - Implement building methods (`getBuildings()`, `addBuilding()`, `hasBuilding()`)
- **Dependencies**: Nation
- **Enables**: City founding, production, growth

#### 6. Unit (`js/core/Unit.js`)
- **Priority**: High - player interaction
- **Tasks**:
  - Initialize properties (movementPoints: maxMovement, maxMovement: based on type, health: maxHealth, maxHealth: 100, strength: based on type, hasActed: false)
  - Implement position methods (`getPosition()`)
  - Implement movement methods (`getMovement()`, `getMaxMovement()`, `canMove()`, `resetMovement()`)
  - Implement basic `move()` - validate and update position
  - Implement combat methods (`getStrength()`, `canAttack()`, `attack()` - stub, `takeDamage()`, `isDestroyed()`)
- **Dependencies**: Nation
- **Enables**: Unit movement, combat system

---

### Phase 3: Gameplay Systems

#### 7. Unit Movement System
- **Priority**: High - core player interaction
- **Tasks**:
  - Implement pathfinding or adjacent hex movement
  - Calculate movement costs based on terrain
  - Validate movement (terrain passable, enough movement points)
  - Update HexData when units move
  - Handle unit stacking (multiple units per hex)
- **Dependencies**: Unit, HexData, HexGrid
- **Enables**: Player can move units around map

#### 8. City Founding
- **Priority**: High - expansion gameplay
- **Tasks**:
  - Create Settler unit type
  - Implement "Found City" action for settler
  - Validate city placement (not too close to other cities, valid terrain)
  - Create City object and add to Nation
  - Update HexData with city and ownership
  - Expand initial city borders
- **Dependencies**: City, Unit, HexData
- **Enables**: Nation expansion

#### 9. Turn Processing
- **Priority**: Medium - game progression
- **Tasks**:
  - Implement `Nation.processTurn()`:
    - Collect resources from cities and controlled hexes
    - Update city production
    - Reset unit movement points
    - Apply per-turn bonuses
  - Implement `City.addProduction()` - collect from tiles
  - Resource generation from terrain
  - City growth mechanics
- **Dependencies**: City, Unit, HexData, ResourceManager
- **Enables**: Game progression, resource accumulation

#### 10. Age System
- **Priority**: Medium - progression mechanic
- **Tasks**:
  - Implement `AgeManager.getNextAge()`, `canAdvanceAge()`, `getBonuses()`
  - Implement `Nation.advanceAge()` - check requirements, update age
  - Define age-specific properties in `AGES` object
  - Age progression requirements (science points, technologies)
- **Dependencies**: Nation, ResourceManager
- **Enables**: Technology progression

---

### Phase 4: Visual & Polish

#### 11. Render Cities & Units (`js/core/RenderEngine.js`)
- **Priority**: Medium - visual feedback
- **Tasks**:
  - Implement `#renderCities()`:
    - Draw city markers at positions
    - Show city names
    - Display population indicator
  - Implement `#renderUnits()`:
    - Draw unit icons/sprites
    - Show unit type indicators
    - Display movement/health status
  - Implement `#renderNations()`:
    - Draw borders around owned territory
    - Show nation colors on hexes
- **Dependencies**: City, Unit, HexData
- **Enables**: Visual representation of game state

#### 12. UI Updates
- **Priority**: Medium - user experience
- **Tasks**:
  - Update HUD with real game state (turn counter, resources)
  - Create city info panel (population, production, buildings)
  - Create unit info panel (type, movement, health)
  - Add "Next Turn" button
  - Display current active nation
- **Dependencies**: GameState, Nation, City, Unit
- **Enables**: Better user experience

#### 13. Combat System
- **Priority**: Low - advanced gameplay
- **Tasks**:
  - Implement `Unit.attack()` - calculate damage based on strength, terrain bonuses
  - Handle unit destruction
  - Capture cities on defeat
  - Combat animations/feedback
- **Dependencies**: Unit, City
- **Enables**: Military gameplay

#### 14. Technology System
- **Priority**: Low - advanced gameplay
- **Tasks**:
  - Define technology tree
  - Implement `Nation.researchTechnology()`, `hasTechnology()`
  - Technology requirements and costs
  - Technology effects (unit unlocks, bonuses)
- **Dependencies**: Nation, ResourceManager
- **Enables**: Strategic progression

---

## Quick Start Checklist

- [ ] Phase 1.1: Implement ResourceManager
- [ ] Phase 1.2: Implement GameState (basic structure)
- [ ] Phase 1.3: Implement Nation (basic structure)
- [ ] Phase 2.4: Implement HexData
- [ ] Phase 2.5: Implement City
- [ ] Phase 2.6: Implement Unit
- [ ] Phase 3.7: Unit Movement System
- [ ] Phase 3.8: City Founding
- [ ] Phase 3.9: Turn Processing
- [ ] Phase 4.11: Render Cities & Units
- [ ] Phase 4.12: UI Updates

---

## Notes

- Each phase builds on the previous one
- Start with ResourceManager - it's the foundation
- GameState enables the turn-based loop
- Focus on getting basic gameplay working before polish
- Test each component as you build it
