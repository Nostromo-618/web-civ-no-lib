# Web-Civ

A browser-based Civilization-style strategy game built with pure HTML, CSS, and JavaScript.

## Philosophy: Zero Dependencies

This project intentionally uses **no frameworks, no build tools, no npm packages**. Just vanilla web technologies.

### Why?

**Simplicity** — Open `index.html` in a browser. That's it. No `npm install`, no webpack config, no transpilation step. The code you write is the code that runs.

**Longevity** — Frameworks rise and fall. Build tools change. But HTML, CSS, and JavaScript in the browser will work the same way in 10 years. This project will still run when today's frameworks are forgotten.

**Learning** — No magic, no abstractions hiding the fundamentals. Every line of code is visible and understandable. If you want to learn how games work in the browser, you can trace the entire flow from canvas pixel to game logic.

**Performance** — No framework overhead, no virtual DOM diffing, no bundle bloat. Direct canvas rendering and native browser APIs.

**Portability** — Copy the folder anywhere. Host it on any static file server. No server-side runtime needed.

### The Stack

- **HTML5** — Single page, semantic structure
- **CSS3** — Glass morphism UI, flexbox/grid layout
- **ES6 Modules** — Native browser module system, no bundler
- **Canvas 2D API** — All game rendering
- **Pointer Events API** — Input handling (pan, zoom, click)

## Running the Game

```
# Just open index.html in your browser
# Or use any static file server:

python -m http.server 8000
# then visit http://localhost:8000
```

## Project Structure

```
web-civ/
├── index.html          # Entry point
├── css/styles.css      # All styling
├── js/
│   ├── main.js         # Game initialization
│   ├── config.js       # Constants
│   ├── core/           # Game systems (HexGrid, RenderEngine, etc.)
│   ├── data/           # Game data (terrain, resources, ages)
│   └── utils/          # Utilities (hex math)
└── plan-sketch-steps.md # Development roadmap
```

## Status

Early development. The hex grid renders and responds to input. Core game mechanics (cities, units, combat, tech tree) are scaffolded but not yet implemented. See `plan-sketch-steps.md` for the roadmap.

## License

MIT — See [LICENSE](LICENSE)
