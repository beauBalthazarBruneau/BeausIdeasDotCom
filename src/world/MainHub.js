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

    // Level dimensions - single continuous platform world
    this.width = 5000; // Full 5000px width
    this.height = 1200;
    this.groundLevel = 650; // Platform centers at 650

    // Simplified level data with single continuous platform
    this.levelData = {
      mainPlatform: {
        platforms: [
          {
            id: 'continuous-ground',
            x: 2500, // Center the platform at middle of 5000px world
            y: this.groundLevel,
            width: 5000, // Single platform spanning entire world
            height: 60,
            type: PLATFORM_TYPES.ROAD,
          },
        ],
        decorations: [],
      },
    };

    this.createLevel();
    this.createBoundaries();
    this.createDecorations();
  }

  createDecorations() {
    // Create decorative elements from simplified level data
    Object.values(this.levelData).forEach((area) => {
      if (area.decorations) {
        area.decorations.forEach((decoration) => {
          this.decorativeElements.push(decoration);
        });
      }
    });
  }

  createLevel() {
    // Create all platforms from simplified level data
    Object.values(this.levelData).forEach((area) => {
      area.platforms.forEach((platformData) => {
        this.createPlatform(platformData);
      });
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
