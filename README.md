# 🎮 Portfolio Mario Game

A Mario-style platformer game that serves as an interactive portfolio showcase, built with a professional, scalable architecture.

## ✨ Features
- 🏃‍♂️ **Physics-based movement** with Matter.js double jump mechanics
- 🎯 **Interactive checkpoints** linked to portfolio projects  
- 💎 **Collectible system** with different collectible types per world
- 🌍 **Multiple themed worlds** (Tech, Entertainment, Sports, Education, Healthcare, Finance, Georgia Tech)
- 🎨 **Parallax backgrounds** with environmental particle effects
- 🎵 **Immersive audio** with sound effects and background music
- 🐛 **Advanced debug mode** with comprehensive game state monitoring
- 📱 **Responsive design** ready for mobile optimization
- 🚀 **Performance optimized** with code splitting and asset optimization

## 🏗️ Architecture

This project follows a professional, scalable architecture:

```
src/
├── 🎮 core/           # Reusable game engine (Physics, Camera, Input, Game)
├── 🎯 entities/       # Game objects (Player, Checkpoints, Collectibles)
├── ⚙️  systems/        # Services (Audio, Particles, Background)
├── 🌍 world/          # Level and world management
├── 🖥️  ui/            # User interface components and screens
├── 📊 managers/       # Data and state management
├── 📂 data/           # Configuration and project data
├── 🔧 utils/          # Utility functions (math, storage, animation)
└── 📋 constants/      # Game configuration and constants
```

### Key Benefits:
- ✅ **Separation of concerns** - each folder has a clear purpose
- ✅ **Scalable** - easy to add new features without refactoring
- ✅ **Maintainable** - find and modify code quickly
- ✅ **Team-friendly** - clear ownership boundaries
- ✅ **Enterprise-ready** - professional structure for complex applications

## 🚀 Development

### Quick Start
```bash
npm install
npm run dev
```

### Build for Production
```bash
npm run build
npm run preview
```

### Path Aliases
The project includes Vite path aliases for clean imports:
```javascript
import { Player } from '@entities';
import { GAME, PLAYER } from '@constants';
import { lerp, clamp } from '@utils';
```

## 🎮 Game Controls
- **Arrow Keys / WASD**: Move Mario
- **Space / Up Arrow**: Jump (double jump available)
- **F1**: Toggle comprehensive debug mode
- **M**: Toggle audio mute
- **+/-**: Adjust volume
- **B**: Force start background music (debug)

## 🌍 Portfolio Integration

The game features a world-based portfolio system:
- **7 themed worlds** each representing different project categories
- **Mystery box checkpoints** that spawn collectibles when hit
- **Collectible types** vary by world (mystery-box, star, coin, book, trophy, gem)
- **Project data structure** supports title, subtitle, image, and description
- **Progress tracking** with persistent localStorage saves

## 🛠️ Technical Features

### Performance
- **Code splitting** - separate chunks for core, entities, systems
- **Asset optimization** - inline small assets, optimize large ones
- **60 FPS targeting** with delta time normalization
- **Efficient particle system** with environmental and action particles

### Developer Experience
- **Hot reload** during development
- **Source maps** for debugging
- **Comprehensive constants** - no magic numbers
- **Utility functions** for common game math and operations
- **Type-safe data structures** with clear interfaces

### Audio System
- **Howler.js integration** for cross-browser audio
- **Multiple audio types** (SFX, music) with independent volume controls
- **Audio context management** with proper browser policy handling
- **Fade effects** and audio state persistence

### Physics & Animation
- **Matter.js physics** with optimized collision detection
- **GSAP animations** for smooth UI transitions and effects
- **Custom easing functions** and animation utilities
- **Screen shake** system with multiple intensity levels
- **Particle effects** for environmental atmosphere and feedback

## 📝 Adding New Features

### New Game Entity
1. Create in `src/entities/NewEntity.js`
2. Export from `src/entities/index.js`
3. Import in Game.js: `import { NewEntity } from '@entities';`

### New Game System
1. Create in `src/systems/NewSystem.js`
2. Export from `src/systems/index.js`
3. Initialize in Game constructor

### New UI Component
1. Create in `src/ui/components/NewComponent.js`
2. Export from `src/ui/index.js`
3. Use with clean imports: `import { NewComponent } from '@ui';`

## 🎯 Next Steps

Ready for advanced features:
- 📱 **Mobile responsiveness** and touch controls
- 🏆 **Achievement system** with unlock conditions
- 💾 **Cloud save integration** for progress sync
- 🎨 **Theme customization** per world
- 🔊 **Advanced audio** with positional sound
- 🌟 **Particle effects** expansion
- 📊 **Analytics integration** for gameplay metrics

## 📜 License

MIT License - feel free to use this architecture for your own projects!
