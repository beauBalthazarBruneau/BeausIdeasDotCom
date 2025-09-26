// MainHub - The main world that serves as the hub for world transitions
// Now using the enhanced PlatformFactory system with backward compatibility

import { Bodies } from 'matter-js';
import { PlatformFactory } from './PlatformFactory.js';
import { PlatformRenderer } from './PlatformRenderer.js';
import {
  PLATFORM_TYPES,
  MOVEMENT_PATTERNS,
  createPlatformConfig,
} from './PlatformTypes.js';

export class MainHub {
  constructor(physics, game) {
    this.physics = physics;
    this.game = game;
    this.boundaries = new Map();
    this.decorativeElements = [];
    this.checkpointAreas = [];

    // Initialize new platform system
    this.platformFactory = new PlatformFactory(physics, game);
    this.platformRenderer = new PlatformRenderer(game);

    // Level dimensions - expanded to accommodate door positions
    this.width = 3500; // Increased width for door spacing
    this.height = 1200;
    this.groundLevel = 650; // Platform centers at 650

    // Hub level data with sections for different doors - now with enhanced platform features
    this.levelData = {
      // Starting area - tutorial/intro with basic ground
      startingArea: {
        platforms: [
          {
            id: 'start-ground',
            x: 0,
            y: this.groundLevel,
            width: 800,
            height: 60,
            type: PLATFORM_TYPES.ROAD,
          },
        ],
        decorations: [],
      },

      // World doors area - where entry doors are located
      worldDoorsArea: {
        platforms: [
          {
            id: 'doors-ground',
            x: 800,
            y: this.groundLevel,
            width: 1200,
            height: 60,
            type: PLATFORM_TYPES.ROAD,
          },
        ],
        decorations: [],
      },

      // Elevated section - jumping challenges with enhanced platforms
      elevatedSection: {
        platforms: [
          {
            id: 'elevated-ground',
            x: 2100,
            y: this.groundLevel,
            width: 500,
            height: 60,
            type: PLATFORM_TYPES.ROAD,
          },
          // Demo: Floating platform with bobbing animation
          {
            id: 'floating-demo',
            x: 2300,
            y: this.groundLevel - 100,
            width: 120,
            height: 20,
            type: PLATFORM_TYPES.FLOATING,
          },
          // Demo: Rotating platform
          {
            id: 'rotating-demo',
            x: 2000,
            y: this.groundLevel - 150,
            width: 80,
            height: 20,
            type: PLATFORM_TYPES.ROTATING,
          },
        ],
        decorations: [
          { type: 'cloud', x: 2200, y: this.groundLevel - 300 },
          { type: 'cloud', x: 2400, y: this.groundLevel - 320 },
        ],
      },

      // Canyon crossing - challenging platforming with moving platforms
      canyonCrossing: {
        platforms: [
          {
            id: 'canyon-ground',
            x: 2700,
            y: this.groundLevel,
            width: 400,
            height: 60,
            type: PLATFORM_TYPES.ROAD,
          },
          // Demo: Moving platform (horizontal)
          {
            id: 'moving-horizontal-demo',
            x: 2850,
            y: this.groundLevel - 120,
            width: 100,
            height: 20,
            type: PLATFORM_TYPES.MOVING,
          },
          // Demo: Invisible platform (easter egg)
          {
            id: 'invisible-demo',
            x: 2950,
            y: this.groundLevel - 80,
            width: 80,
            height: 20,
            type: PLATFORM_TYPES.INVISIBLE,
          },
        ],
        decorations: [],
      },

      // Victory area - final destination
      victoryArea: {
        platforms: [
          {
            id: 'victory-ground',
            x: 3200,
            y: this.groundLevel,
            width: 400,
            height: 60,
            type: PLATFORM_TYPES.VICTORY,
          },
          // Demo: Breakable platform
          {
            id: 'breakable-demo',
            x: 3100,
            y: this.groundLevel - 80,
            width: 60,
            height: 20,
            type: PLATFORM_TYPES.BREAKABLE,
          },
        ],
        decorations: [
          { type: 'flag', x: 3350, y: this.groundLevel - 180 },
          { type: 'tree', x: 3150, y: this.groundLevel - 60 },
          { type: 'tree', x: 3450, y: this.groundLevel - 60 },
        ],
      },
    };

    this.createLevel();
    this.createBoundaries();
    this.createDecorations();
  }

  createDecorations() {
    // Create decorative elements from level data
    Object.values(this.levelData).forEach((area) => {
      if (area.decorations) {
        area.decorations.forEach((decoration) => {
          this.decorativeElements.push(decoration);
        });
      }
    });
  }

  createLevel() {
    // Create all platforms from level data using the new platform factory
    Object.values(this.levelData).forEach((area) => {
      area.platforms.forEach((platformData) => {
        this.createPlatform(platformData);
      });

      // Store checkpoint areas for later use
      if (area.checkpoint) {
        this.checkpointAreas.push(area.checkpoint);
      }
    });
  }

  createPlatform(data) {
    // Create platform configuration based on type
    const config = this.getPlatformConfig(data);

    // Use the platform factory to create the platform
    return this.platformFactory.createPlatform(data, config);
  }

  getPlatformConfig(data) {
    // Configure enhanced platform features based on type
    switch (data.type) {
      case PLATFORM_TYPES.FLOATING:
        return createPlatformConfig({
          bobbing: { amplitude: 8, speed: 1.5 },
        });

      case PLATFORM_TYPES.ROTATING:
        return createPlatformConfig({
          rotationSpeed: 0.5, // Slow rotation in radians per second
        });

      case PLATFORM_TYPES.MOVING:
        return createPlatformConfig({
          movement: {
            pattern: MOVEMENT_PATTERNS.HORIZONTAL,
            speed: 1,
            range: 100,
          },
        });

      case PLATFORM_TYPES.BREAKABLE:
        return createPlatformConfig({
          breakable: {
            hits: 3,
            respawnTime: 8000, // 8 seconds
          },
        });

      case PLATFORM_TYPES.INVISIBLE:
        return createPlatformConfig({
          visible: false,
          debugVisible: true,
        });

      default:
        return createPlatformConfig();
    }
  }

  createBoundaries() {
    // Left boundary
    const leftWall = Bodies.rectangle(-50, this.height / 2, 100, this.height, {
      label: 'boundary',
      isStatic: true,
      render: { visible: false },
    });

    // Right boundary
    const rightWall = Bodies.rectangle(
      this.width + 50,
      this.height / 2,
      100,
      this.height,
      {
        label: 'boundary',
        isStatic: true,
        render: { visible: false },
      }
    );

    // Top boundary (ceiling)
    const ceiling = Bodies.rectangle(this.width / 2, -50, this.width * 2, 100, {
      label: 'boundary',
      isStatic: true,
      render: { visible: false },
    });

    // Bottom boundary (death zone - but higher than our death Y)
    const floor = Bodies.rectangle(
      this.width / 2,
      this.groundLevel + 400,
      this.width * 2,
      100,
      {
        label: 'boundary',
        isStatic: true,
        render: { visible: false },
      }
    );

    // Add boundaries to physics
    this.boundaries.set('left', leftWall);
    this.boundaries.set('right', rightWall);
    this.boundaries.set('top', ceiling);
    this.boundaries.set('bottom', floor);

    this.physics.addBody('boundary-left', leftWall);
    this.physics.addBody('boundary-right', rightWall);
    this.physics.addBody('boundary-top', ceiling);
    this.physics.addBody('boundary-bottom', floor);
  }

  // Add update method for animated platforms
  update(deltaTime) {
    // Update platform animations
    this.platformFactory.update(deltaTime);
  }

  draw(ctx) {
    // First draw decorative background elements (so platforms appear on top)
    this.drawDecorations(ctx, 'background');

    // Draw platforms using the new renderer
    const platforms = this.platformFactory.getAllPlatforms();
    this.platformRenderer.renderPlatforms(ctx, platforms);

    // Draw foreground decorative elements (on top of platforms)
    this.drawDecorations(ctx, 'foreground');
  }

  // Method to enable/disable debug mode for invisible platforms
  setDebugMode(enabled) {
    this.platformFactory.setDebugMode(enabled);
    this.platformRenderer.setDebugMode(enabled);
  }

  drawDecorations(ctx, layer) {
    // All decoration rendering is disabled for cleaner visual style
    // This preserves the decoration system architecture but renders nothing
    // this.decorativeElements.forEach((decoration) => {
    //   const { type, x, y } = decoration;
    //   // Decoration rendering commented out for minimal visual style
    // });
  }

  // Get all platform bodies for collision detection
  getAllPlatformBodies() {
    return this.platformFactory.getAllPlatforms().map((p) => p.body);
  }

  // Get platforms by type (useful for game logic)
  getPlatformsByType(type) {
    return this.platformFactory.getPlatformsByType(type);
  }

  // Get a specific platform by ID
  getPlatform(id) {
    return this.platformFactory.getPlatform(id);
  }

  // Handle player collision with platforms (for special platform behaviors)
  onPlayerCollision(platform, player) {
    this.platformFactory.onPlayerCollision(platform, player);
  }

  // Get checkpoint positions for game logic
  getCheckpointAreas() {
    return this.checkpointAreas;
  }

  // Get level dimensions
  getDimensions() {
    return {
      width: this.width,
      height: this.height,
      groundLevel: this.groundLevel,
    };
  }

  // Get spawn point (start of level)
  getSpawnPoint() {
    return { x: 200, y: this.groundLevel - 100 };
  }

  destroy() {
    // Clean up platform factory
    if (this.platformFactory) {
      this.platformFactory.destroy();
    }

    // Clean up boundaries
    this.boundaries.forEach((boundary, id) => {
      this.physics.removeBody(`boundary-${id}`);
    });

    this.boundaries.clear();
  }
}
