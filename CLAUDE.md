# CLAUDE.md - Project Context

## Project Overview
A web browser-based clone of the classic 1982 arcade game Joust, built with Phaser 3.

## Tech Stack
- **Framework:** Phaser 3 (HTML5 game framework)
- **Language:** JavaScript (ES6+)
- **Build Tool:** Vite (fast dev server and bundling)
- **Deployment Target:** GitHub Pages

## Project Structure
```
game-1/
├── src/
│   ├── scenes/          # Phaser scenes (menu, game, game-over)
│   ├── entities/        # Game objects (player, enemies, platforms)
│   ├── systems/         # Game systems (physics, spawning, collision)
│   └── utils/           # Helpers (storage, constants)
├── assets/
│   ├── sprites/         # Character and environment art
│   ├── audio/           # Sound effects and music
│   └── fonts/           # Pixel/arcade fonts
├── docs/
│   └── game-design.md   # Full game design document
├── index.html
└── package.json
```

## Coding Conventions
- Use ES6 modules (import/export)
- Prefer composition over inheritance for game entities
- Keep scenes thin - delegate to entity and system classes
- Use constants for magic numbers (physics values, spawn rates, etc.)
- Comment complex physics calculations

## Game Scope (MVP)
Core features only:
- Single player
- Player knight on ostrich with flap-to-fly mechanics
- Enemy knights on buzzards (3 difficulty tiers)
- Platform collisions
- Combat: higher player wins collision
- Egg drops and collection
- Lava pit with grabbing hand
- Wave-based progression
- Local high score (localStorage)
- Screen shake on collisions
- Particle effects (feathers, sparks)

## Post-MVP Features (do not implement yet)
- Mobile touch controls
- 2-player mode
- Online leaderboard
- Additional enemy types
- Power-ups
- Survival/endless mode

## Commands
```bash
npm install      # Install dependencies
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
```

## References
- Original Joust gameplay: https://www.youtube.com/results?search_query=joust+arcade+1982+gameplay
- Phaser 3 docs: https://phaser.io/docs/3.60.0
