# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
npm run dev              # Start development server on localhost:5173
npm run build            # Build for production
npm run preview          # Preview production build on localhost:4173
```

### Code Quality
```bash
npm run lint             # Run ESLint
npm run lint:fix         # Run ESLint with auto-fix
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
```

### Testing & Automation
```bash
# Legacy testing (still available)
npm run test             # Run automated test suite
npm run test:watch       # Run tests in watch mode
npm run test:dev         # Start dev server and run tests concurrently
npm run mcp-ai           # Run MCP AI player
npm run mcp-ai:dev       # Start dev server and run AI player
npm run analyze          # Run gameplay analysis
npm run visual-test      # Run visual testing suite

# New advanced testing system
node automation/tests/mystery-box-hybrid.test.js                    # Run specific test
node automation/runners/test-runner.js run <test-path>             # Managed test execution
node automation/runners/test-runner.js list                        # List available tests
node automation/runners/test-runner.js run-all                     # Run complete test suite
node automation/runners/test-runner.js cleanup                     # Clean old results
```

## Architecture Overview

### Core Structure
The codebase follows a modular architecture with clean separation of concerns:

- **`src/core/`** - Core game engine (Game.js, Physics.js, Camera.js, InputHandler.js)
- **`src/entities/`** - Game objects (Player.js, MysteryBox.js, Collectible.js, Door.js)
- **`src/systems/`** - Game systems (AudioManager.js, ParticleSystem.js, Background.js, WorldTheme.js)
- **`src/world/`** - Level design and world management (Level.js, MainHub.js, WorldTransitionManager.js)
- **`src/ui/`** - User interface components (UI.js, ProjectModal.js)
- **`src/managers/`** - Data management (ProjectData.js)
- **`src/utils/`** - Utility functions (math.js, animation.js, storage.js)
- **`src/constants/`** - Game constants and configuration

### Key Systems

**Physics Engine**: Built on Matter.js with custom collision detection and body management in `src/core/Physics.js`

**Game Loop**: Centralized in `src/core/Game.js` - handles update/render cycle, system coordination, and debug mode

**Camera System**: `src/core/Camera.js` provides smooth following, GSAP-powered screen shake (light/medium/heavy), and world-to-screen transformations

**Input Handling**: `src/core/InputHandler.js` manages WASD/Arrow keys, Space/Jump, F1 debug toggle, and audio controls (M/+/-/B)

**World System**: Multi-world architecture with themed levels (GeorgiaTech, Healthcare, VibeCoding) managed by WorldTransitionManager

**Audio**: Howler.js-based AudioManager with auto-start on user interaction, spatial audio, and browser compatibility handling

### Import Path Aliases
The project uses Vite path aliases for clean imports:
```javascript
'@' → './src'
'@core' → './src/core'
'@entities' → './src/entities'
'@systems' → './src/systems'
'@world' → './src/world'
'@ui' → './src/ui'
'@managers' → './src/managers'
'@utils' → './src/utils'
'@constants' → './src/constants'
```

### Testing & Automation Architecture

**Advanced Testing System**: `automation/` directory with modular architecture
- **BasePlayer** (`automation/core/BasePlayer.js`): Hybrid automation engine combining smart movement from mystery-box-test with comprehensive monitoring from mario-playtest-runner
- **Smart Navigation**: Sub-20px positioning accuracy with overshoot prevention, momentum stopping, and multiple movement strategies
- **Real-time Monitoring**: 100ms position/velocity tracking, game state analysis, performance metrics
- **Visual Documentation**: Automatic screenshots at key moments with organized per-test storage
- **Data Export**: JSON reports with position tracking, action logs, and intelligent recommendations

**Legacy Systems** (still available):
- **MCP AI Player**: `automation/mcp-ai-player.js` - Intelligent browser automation with priority-based decision making
- **Original Test Framework**: Playwright-based testing with 13 test scenarios
- **Analysis Tools**: `analysis/` directory with gameplay analysis and visual testing

**Results Management**:
- **New**: `automation/results/[test-name]/` - Per-test organized with automatic cleanup
- **Legacy**: Global `results/` directory with manual management

### Game Architecture

**Entity System**: Player physics-based movement with double-jump, ground detection via collision events, particle effects integration

**Mystery Box Interaction**: Two-state system - hit from below spawns collectibles, standing on top acts as platform

**Project Portfolio Integration**: Mystery boxes represent portfolio projects with states (inactive/hit/completed) and persistent progress via localStorage

**Multi-layer Parallax**: Background system with 5 layers (sky, mountains, clouds, hills, trees) at different parallax speeds

**Particle Effects**: Jump dust, double-jump puffs, atmospheric effects with performance-conscious cleanup

## Creating Custom Tests

### Quick Test Creation
1. Copy the template: `cp automation/templates/test-template.js automation/tests/my-test.js`
2. Edit the test logic using BasePlayer methods:
   - `navigateToPosition(x, y, description)` - Smart movement with precision
   - `hitMysteryBoxFromBelow(boxPosition)` - Strategic mystery box interaction
   - `collectItem(itemPosition)` - Collectible collection with multiple strategies
   - `jump()` - Jump with timing control
   - `getPlayerPosition()` - Real-time position/velocity data
   - `takeScreenshot(name)` - Visual documentation
   - `executeAction(name, function)` - Timed action with logging
3. Run: `node automation/tests/my-test.js`

### BasePlayer Configuration
```javascript
const config = {
  baseUrl: 'http://localhost:5173',
  headless: false,                    // Show browser
  slowMo: 200,                       // Slow down for visibility
  enablePositionTracking: true,       // Real-time position data
  cleanupAfter: true,                // Auto-cleanup old results
  positioning: {
    tolerance: 20,                   // Positioning accuracy (pixels)
    maxAttempts: 15                  // Max positioning attempts
  }
};
```

## Development Notes

### Technology Stack
- **Vite**: Modern build tool with HMR and ES modules
- **Matter.js**: 2D physics engine
- **GSAP**: Smooth animations and screen shake effects
- **Howler.js**: Cross-browser web audio
- **Playwright**: Browser automation and testing

### Code Conventions
- ES6+ modules with clean imports
- Class-based entity architecture
- Event-driven collision system
- Consistent error handling and logging
- Performance-conscious particle and physics management

### Build Configuration
- Code splitting into vendor, core, entities, and systems chunks
- Asset optimization with 4kb inline limit
- Terser minification with source maps
- ES2018 target for broad compatibility

### Browser Requirements
- Modern ES6+ support
- Canvas 2D rendering
- Web Audio API
- localStorage persistence
- Matter.js physics compatibility