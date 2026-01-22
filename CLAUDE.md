# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Web-Civ is a browser-based Civilization-style strategy game built with vanilla JavaScript and Canvas. It uses a flat-top hexagon grid system with axial coordinates.

**No build system** - This is a pure ES6 modules project that runs directly in the browser. Open `index.html` in a browser to run.

## Architecture

```
js/
├── main.js           # Entry point, terrain generation, game initialization
├── config.js         # All game constants (hex size, grid dimensions, colors)
├── core/             # Core game systems
│   ├── HexGrid.js    # Hex grid management with axial coordinates (q, r)
│   ├── HexData.js    # Per-hex game state (ownership, improvements, units)
│   ├── RenderEngine.js # Canvas rendering with pan/zoom/selection
│   ├── GameState.js  # Turn management, nation cycling
│   ├── Nation.js     # Player civilization state
│   ├── City.js       # City mechanics
│   └── Unit.js       # Unit mechanics
├── data/             # Game data definitions
│   ├── terrain.js    # Terrain types and colors
│   ├── resources.js  # Resource system definitions
│   └── ages.js       # Age progression system
└── utils/
    └── hex-math.js   # Hex coordinate math (hex-to-pixel, pixel-to-hex)
```

## Key Patterns

- **Hex Coordinates**: Uses axial coordinate system (q, r) with flat-top hexagons
- **Separation of Layers**: Data (HexData, Nation, City, Unit), Rendering (RenderEngine), Utilities (hex-math)
- **Configuration-Driven**: All constants in `config.js`, game data in `data/` directory
- **Private Fields**: Classes use `#` notation for private fields

## Implementation Status

**Complete**: HexGrid, RenderEngine (terrain/selection), hex-math utilities, terrain data

**Skeleton (TODO)**: GameState, Nation, HexData, City, Unit, ResourceManager, AgeManager - these classes exist but methods are not implemented

## Development Roadmap

See `plan-sketch-steps.md` for the detailed implementation plan with 4 phases:
1. Foundation: ResourceManager, GameState, Nation
2. Core Entities: HexData, City, Unit
3. Gameplay: Movement, city founding, turn processing
4. Polish: Rendering entities, combat, tech tree

## Hex Math Reference

Flat-top hexagon math is in `js/utils/hex-math.js`:
- `hexToPixel(q, r, size)` - converts axial coords to canvas position
- `pixelToHex(x, y, size)` - converts canvas position to axial coords
- `hexCorners(cx, cy, size)` - returns 6 corner points for drawing
