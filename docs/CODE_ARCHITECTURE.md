# Portfolio Mario Game - Code Architecture & Filesystem Guide

## 📁 Project Structure

```
portfolio-mario-game/
├── index.html              # Main HTML entry point
├── style.css              # Global styles and debug UI
├── package.json           # Dependencies and scripts
├── vite.config.js        # Vite build configuration
├── src/                  # Source code directory
│   ├── main.js           # Application entry point
│   ├── Game.js           # Main game controller class
│   ├── InputHandler.js   # Keyboard/input management
│   ├── Player.js         # Player character logic
│   ├── Physics.js        # Matter.js physics integration
│   ├── Camera.js         # Camera system with following/shake
│   ├── Level.js          # Level design and platform generation
│   ├── Background.js     # Multi-layer parallax backgrounds
│   ├── ParticleSystem.js # Visual effects and particles
│   ├── AudioManager.js   # Sound effects and music
│   ├── Checkpoint.js     # Mystery box (project) entities
│   ├── Collectible.js    # Spawned collectibles from mystery boxes
│   ├── ProjectData.js    # Portfolio project data and state
│   └── UI.js             # User interface and debug panel
└── README.md             # Project documentation
```

## 🏗️ Core Architecture

### Game Flow Overview

1. **Initialization**: `main.js` → `Game.js` constructor
2. **System Setup**: Physics, Camera, Level, Player, Audio, UI
3. **Game Loop**: Update physics → Handle input → Update entities → Render
4. **Interaction**: Player movement, checkpoint collision, collectible spawning

---

## 📝 File Descriptions

### **Core Files**

#### `index.html`

- Basic HTML5 structure with canvas element
- Loads Vite for module bundling
- Contains debug info div for F1 debug panel
- Responsive viewport configuration

#### `style.css`

- CSS reset and responsive canvas styling
- Debug panel styling (hidden by default, shown with F1)
- Pixelated image rendering for retro game feel

#### `package.json`

- Dependencies: Vite, Matter.js, GSAP, Howler.js
- Scripts: `npm run dev` for development server
- Modern web game development stack

---

### **Game Systems**

#### `src/main.js`

**Purpose**: Application entry point

```javascript
// Creates canvas, initializes Game instance
const canvas = document.getElementById('game-canvas');
const game = new Game(canvas);
```

#### `src/Game.js`

**Purpose**: Main game controller and orchestrator

- **Responsibilities**:
  - Initialize all game systems
  - Run main game loop (update/render cycle)
  - Handle window resizing and canvas management
  - Coordinate system interactions
  - Debug mode management (F1 toggle)

- **Key Properties**:
  - `gameTime`, `deltaTime` - Time management
  - `debugMode` - Toggle for debug information
  - All system references (physics, camera, player, etc.)

- **Game Loop**:
  ```javascript
  gameLoop(currentTime) {
    this.update(deltaTime);  // Update all systems
    this.render();           // Draw everything
    this.updateDebugInfo();  // Update debug panel
  }
  ```

#### `src/Physics.js`

**Purpose**: Matter.js physics engine wrapper

- **Features**:
  - World creation and body management
  - Collision event system
  - Optional debug renderer
  - Body registration with unique IDs

- **Usage**: All game entities register physics bodies here

```javascript
this.physics.addBody('player', playerBody);
this.physics.onCollisionStart(callback);
```

#### `src/Camera.js`

**Purpose**: Camera system with smooth following and effects

- **Features**:
  - Smooth player following with lerp
  - GSAP-powered screen shake (light/medium/heavy)
  - Boundary constraints
  - World-to-screen coordinate transformation

- **Screen Shake Types**:
  ```javascript
  this.camera.lightShake(); // Jumping, landing
  this.camera.mediumShake(); // Respawning
  this.camera.heavyShake(); // Death
  ```

---

### **Game Entities**

#### `src/Player.js`

**Purpose**: Player character with physics and controls

- **Movement System**:
  - WASD/Arrow key controls
  - Double jump mechanic (2 jumps total)
  - Force-based physics movement
  - Ground detection via collision events

- **Collision Detection**:

  ```javascript
  // Detects both platforms and checkpoints as valid ground
  if (otherBody.label === 'platform' || otherBody.label === 'checkpoint') {
    this.isGrounded = true;
    this.jumpsRemaining = this.maxJumps;
  }
  ```

- **Animation States**: `'idle'`, `'walking'`, `'jumping'`
- **Particle Integration**: Jump dust, double-jump effects

#### `src/Level.js`

**Purpose**: Level design and platform generation

- **Level Structure**:
  - **Starting Area**: Tutorial ground (0-600px)
  - **Mystery Box Area**: Main platform with checkpoints (600-1600px)
  - **Extended Sections**: Continuous platforms to end
  - **Victory Area**: Special styled end zone

- **Platform Types**:

  ```javascript
  'grass'; // Standard brown platforms with green grass
  'victory'; // Special green platforms with gold stars
  ```

- **Decorative Elements**: Trees, bushes, clouds, pillars, flags

#### `src/Checkpoint.js`

**Purpose**: Mystery box entities representing portfolio projects

- **Visual States**:
  - `'inactive'` - Brown box with question mark
  - `'hit'` - Empty brown box (after being hit from below)
  - `'completed'` - Gold box with project name

- **Interaction System**:

  ```javascript
  // Hit from below spawns collectible
  onHitFromBelow() → spawnCollectible()

  // Standing on top works as normal platform
  // (handled by Player collision detection)
  ```

#### `src/Collectible.js`

**Purpose**: Items spawned from mystery boxes

- **Behavior**: Appears above mystery box, moves upward, then falls
- **Collection**: Auto-collected when player touches
- **Project Data**: Contains full portfolio project information

#### `src/ProjectData.js`

**Purpose**: Portfolio project data and state management

- **Project Structure**:

  ```javascript
  {
    id: 'project-slug',
    title: 'Project Name',
    description: 'Short description',
    techStack: ['React', 'Node.js'],
    position: { x: 280, y: 430 },  // Mystery box position
    // ... more project details
  }
  ```

- **State Management**: Tracks checkpoint states (inactive/active/completed)
- **Persistence**: Uses localStorage for progress saving

---

### **Visual & Audio Systems**

#### `src/Background.js`

**Purpose**: Multi-layer parallax background system

- **Layers** (back to front):
  1. **Sky**: Solid color gradient
  2. **Distant Mountains**: Slowest parallax
  3. **Clouds**: Medium parallax with movement
  4. **Hills**: Faster parallax
  5. **Trees**: Closest parallax

- **Parallax Math**:
  ```javascript
  layerX = camera.x * parallaxSpeed; // Speed 0.1-0.8
  ```

#### `src/ParticleSystem.js`

**Purpose**: Visual effects and particle management

- **Effect Types**:
  - **Jump Dust**: Ground impact particles
  - **Double Jump Puff**: Air jump effect
  - **Environmental**: Floating dust, wind, sparkles
  - **Atmospheric Beams**: Background light rays

- **Performance**: Automatic cleanup, limited particle counts

#### `src/AudioManager.js`

**Purpose**: Sound effects and music management

- **Audio Library**: Howler.js for cross-browser compatibility
- **Sound Categories**:
  - **SFX**: Jump, land, checkpoint, collect, death
  - **Music**: Background music with auto-start
  - **Controls**: Volume, mute, spatial audio

- **User Interaction**: Auto-starts on first user input (browser requirement)

#### `src/UI.js`

**Purpose**: User interface and debug information

- **Debug Panel** (F1 toggle):
  - Game stats (FPS, deaths, time)
  - Player info (position, velocity, grounded state)
  - Camera info (position, shaking)
  - Audio status (volume, context, playing)
  - Particle counts
  - Control reference

- **Audio Controls**:
  - `M` - Toggle mute
  - `+/-` - Adjust volume
  - `B` - Force start music (debug)

#### `src/InputHandler.js`

**Purpose**: Keyboard input management

- **Supported Keys**:
  - Movement: `WASD`, `Arrow Keys`
  - Jump: `Space`, `Up Arrow`, `W`
  - Debug: `F1` (handled in Game.js)
  - Audio: `M`, `+/-`, `B` (handled in Game.js)

- **Input Handling**: Tracks key states, prevents key repeat issues

---

## 🔄 System Interactions

### Game Loop Flow

```
1. InputHandler.update()      → Process keyboard input
2. Physics.update()          → Step physics simulation
3. Player.update()           → Handle movement, animation
4. Checkpoints.update()      → Update mystery boxes, collectibles
5. ParticleSystem.update()   → Update visual effects
6. Background.update()       → Animate background elements
7. Camera.follow()           → Update camera position
8. Game.render()             → Draw everything to canvas
```

### Collision System

```
Player ↔ Platform/Checkpoint → Ground detection, jump reset
Player ↔ Checkpoint (below)  → Mystery box hit, spawn collectible
Player ↔ Collectible         → Collection, project completion
```

### State Management

```
ProjectData ↔ CheckpointStateManager ↔ localStorage
     ↓                    ↓                ↓
Checkpoint.state    UI.updateStats    Persistent saves
```

---

## 🎮 Game Mechanics

### Movement System

- **Horizontal**: Force-based physics with friction
- **Vertical**: Jump velocity with gravity
- **Double Jump**: Air jump with visual effects
- **Ground Detection**: Collision-based with tolerance

### Checkpoint Interaction

1. **Hit from Below**: Mystery box → spawn collectible
2. **Stand on Top**: Acts as normal platform
3. **Collect Item**: Complete project, update state

### Visual Feedback

- **Particles**: Jump effects, environmental atmosphere
- **Screen Shake**: Impact feedback (jump, land, death)
- **Animation**: Player states, checkpoint states
- **Parallax**: Depth and movement immersion

---

## 🔧 Development Notes

### Key Technologies

- **Matter.js**: 2D physics engine
- **GSAP**: Animation and screen shake
- **Howler.js**: Web audio management
- **Vite**: Modern build tool and dev server

### Performance Considerations

- Particle system limits and cleanup
- Physics body management
- Canvas rendering optimization
- Audio preloading and context management

### Browser Compatibility

- Modern ES6+ features
- Web Audio API with fallbacks
- Canvas 2D rendering
- localStorage for persistence

---

## 🚀 Getting Started

### Development

```bash
npm install          # Install dependencies
npm run dev         # Start development server
```

### Building

```bash
npm run build       # Build for production
npm run preview     # Preview production build
```

### Controls

- **Movement**: WASD or Arrow Keys
- **Jump**: Space or Up Arrow (double jump available)
- **Debug**: F1 to toggle debug panel
- **Audio**: M (mute), +/- (volume), B (force music)

---

This architecture provides a solid foundation for a portfolio game with clear separation of concerns, robust physics, and engaging visual effects while maintaining clean, maintainable code structure.
