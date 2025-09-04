# Portfolio Mario Game

A 2D Mario-style platformer game built with JavaScript that serves as an interactive portfolio website. Users navigate through levels to discover portfolio projects at various checkpoints.

## 🎮 Current Implementation (PER-5)

This implements the **Core Game Foundation & Player Movement** ticket with the following features:

### ✅ Completed Features

- **Vite Project Setup**: Hot reloading development environment
- **HTML5 Canvas**: Responsive canvas that fills the viewport without scroll bars
- **Matter.js Physics Engine**: Complete physics world with gravity and collision detection
- **Player Character**: 
  - Physics-based movement with Matter.js body
  - Arrow key and WASD controls
  - Jumping with cooldown system
  - Facing direction changes
- **Camera System**: Smooth camera that follows the player with boundaries
- **Animation System**: Player state animations (idle, walking, jumping) with frame timing
- **Game Loop**: 60 FPS targeting with requestAnimationFrame
- **Modular Architecture**: Clean separation with Player, Camera, InputHandler, Physics, and Game classes
- **Debug Mode**: F1 toggles physics debug rendering and performance info
- **Basic World**: Multi-platform level with visual grass details

### 🎯 Controls

- **Arrow Keys** or **WASD** - Move left/right and jump
- **Space** or **Up Arrow** - Jump
- **F1** - Toggle debug mode

### 🏗️ Architecture

```
src/
├── Game.js         - Main game class with game loop and rendering
├── Player.js       - Player character with physics and animations  
├── Camera.js       - Camera system that follows the player
├── InputHandler.js - Keyboard input management
├── Physics.js      - Matter.js physics world management
└── main.js         - Game initialization
```

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🔧 Development

The game uses:
- **Vite** - Build tool and dev server
- **Matter.js** - 2D physics engine
- **HTML5 Canvas** - Rendering
- **ES6 Modules** - Modern JavaScript architecture

## 📋 Next Steps

This completes **PER-5: Core Game Foundation & Player Movement**. The next tickets to implement are:

1. **PER-6**: Level Design & World Environment
2. **PER-7**: Audio System & Visual Polish  
3. **PER-8**: Interactive Project Checkpoints
4. **PER-9**: Complete Portfolio Modal System
5. **PER-10**: Production Optimization & Cross-Device Support

## 🎨 Technical Highlights

- **Physics-Based Movement**: Realistic player physics with friction and air resistance
- **Smooth Camera**: Interpolated camera following with configurable boundaries
- **Performance Optimized**: 60 FPS game loop with delta time calculations
- **Responsive Design**: Canvas automatically scales to viewport size
- **Debug Tools**: Toggle-able physics visualization and performance metrics
- **Modular Code**: Clean separation of concerns for easy expansion

---

*This game will eventually feature interactive checkpoints that showcase portfolio projects in a Mario-style adventure!*
