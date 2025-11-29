// WorldLoader - Loads world configurations from JSON
// Replaces individual world classes with data-driven approach

import { Bodies } from 'matter-js';
import { WorldManager } from '../managers/ProjectData.js';
import { createPlatform, drawPlatform } from './Platform.js';
import { BackgroundRenderer } from '../systems/BackgroundRenderer.js';

export class WorldLoader {
  /**
   * Load a world from JSON configuration
   * @param {string} worldId - The ID of the world to load
   * @param {Physics} physics - Physics engine instance
   * @param {WorldTransitionManager} worldTransitionManager - World transition manager
   * @returns {Object} World instance with all necessary methods
   */
  static async loadWorld(worldId, physics, worldTransitionManager) {
    // Load world-specific config from its own directory
    const configPath = `/src/data/worlds/${worldId}/config.json`;
    let config;

    try {
      const response = await fetch(configPath);
      if (!response.ok) {
        throw new Error(`Failed to load world config: ${response.statusText}`);
      }
      config = await response.json();
    } catch (error) {
      console.error(`Error loading world ${worldId}:`, error);
      throw new Error(`World configuration not found for: ${worldId}`);
    }

    console.log(`Loading world: ${config.name} (${worldId})`);

    // Load background from JSON config
    const background = config.background
      ? new BackgroundRenderer(
          worldTransitionManager.game.canvas,
          config.dimensions,
          config.background,
          worldId // Pass worldId for asset path prefixing
        )
      : null;

    // Create world instance
    const world = {
      id: worldId,
      config,
      physics,
      worldTransitionManager,
      platforms: new Map(),
      boundaries: new Map(),
      decorativeElements: config.decorations || [],
      projects: WorldManager.getProjectsByWorld(worldId),
      background, // Add background to world

      // World API methods
      getDimensions: function () {
        return this.config.dimensions;
      },

      draw: function (ctx) {
        this.drawDecorations(ctx, 'background');
        this.drawPlatforms(ctx);
        this.drawDecorations(ctx, 'foreground');
      },

      drawPlatforms: function (ctx) {
        this.platforms.forEach((platform) => {
          drawPlatform(ctx, platform, worldId);
        });
      },

      drawDecorations: function (ctx, layer) {
        this.decorativeElements.forEach((decoration) => {
          const { type, x, y } = decoration;

          const isBackground = WorldLoader.isBackgroundDecoration(type);

          if (
            (layer === 'background' && isBackground) ||
            (layer === 'foreground' && !isBackground)
          ) {
            ctx.save();
            WorldLoader.drawDecoration(ctx, type, x, y, this);
            ctx.restore();
          }
        });
      },

      destroy: function () {
        this.platforms.forEach((platform, id) => {
          this.physics.removeBody(id);
        });

        this.boundaries.forEach((boundary, id) => {
          this.physics.removeBody(`boundary-${id}`);
        });

        this.platforms.clear();
        this.boundaries.clear();
      },
    };

    // Create platforms
    config.platforms.forEach((platformData) => {
      WorldLoader.createPlatform(world, platformData);
    });

    // Create boundaries
    WorldLoader.createBoundaries(world);

    // Create mystery boxes if enabled
    if (config.mysteryBoxes && config.mysteryBoxes.enabled) {
      await WorldLoader.createMysteryBoxes(world);
    }

    // Create doors
    if (config.doors) {
      await WorldLoader.createDoors(world);
    }

    console.log(
      `${config.name} loaded with ${world.projects.length} projects`
    );

    return world;
  }

  /**
   * Create a platform in the world
   */
  static createPlatform(world, platformData) {
    const { id, x, y, width, height, type } = platformData;

    const body = Bodies.rectangle(x, y, width, height, {
      label: 'platform',
      isStatic: true,
      friction: 0.8,
      restitution: 0.1,
    });

    world.platforms.set(id, { body, data: platformData });
    world.physics.addBody(id, body);
  }

  /**
   * Create world boundaries (walls, ceiling, floor)
   */
  static createBoundaries(world) {
    const { width, height, groundLevel } = world.config.dimensions;

    const boundaries = [
      { id: 'left', x: -50, y: height / 2, w: 100, h: height },
      { id: 'right', x: width + 50, y: height / 2, w: 100, h: height },
      { id: 'top', x: width / 2, y: -50, w: width * 2, h: 100 },
      { id: 'bottom', x: width / 2, y: groundLevel + 400, w: width * 2, h: 100 },
    ];

    boundaries.forEach(({ id, x, y, w, h }) => {
      const body = Bodies.rectangle(x, y, w, h, {
        label: 'boundary',
        isStatic: true,
        render: { visible: false },
      });

      world.boundaries.set(id, body);
      world.physics.addBody(`boundary-${id}`, body);
    });
  }

  /**
   * Create mystery boxes from project data
   */
  static async createMysteryBoxes(world) {
    const { MysteryBox } = await import('../entities/MysteryBox.js');
    const { startX, spacing, y } = world.config.mysteryBoxes;

    world.projects.forEach((project, index) => {
      const xPos = startX + index * spacing;

      const mysteryBox = new MysteryBox(
        xPos,
        y,
        world.worldTransitionManager.game,
        {
          collectible: project.collectible,
          audioManager: world.worldTransitionManager.game.audioManager,
          project: project,
        }
      );

      world.worldTransitionManager.game.mysteryBoxes =
        world.worldTransitionManager.game.mysteryBoxes || [];
      world.worldTransitionManager.game.mysteryBoxes.push(mysteryBox);
      world.physics.addBody(`mystery-box-${world.id}-${index}`, mysteryBox.body);
    });
  }

  /**
   * Create doors for world transitions
   */
  static async createDoors(world) {
    const { Door } = await import('../entities/Door.js');
    const { doors } = world.config;

    if (!doors) return;

    // Initialize doors array if needed
    world.worldTransitionManager.game.doors =
      world.worldTransitionManager.game.doors || [];

    // Handle both exit doors and entry doors (for main hub)
    Object.entries(doors).forEach(([doorKey, doorConfig]) => {
      const { x, y, targetWorld, doorType, themeColor, name } = doorConfig;

      const door = new Door(x, y, world.worldTransitionManager, {
        targetWorld,
        doorType,
        themeColor,
        name,
        spawnPoint: doorConfig.spawnPoint,
      });

      world.worldTransitionManager.game.doors.push(door);
      world.physics.addBody(`door-${doorKey}-${world.id}`, door.body);
    });
  }

  /**
   * Set platform visual style based on type and world
   */
  static setPlatformStyle(ctx, type, worldId) {
    // Define platform styles per world and type
    const styles = {
      'jersey-shore': {
        road: '#8B7355',
        floating: '#CD853F',
        rotating: '#DEB887',
        moving: '#D2691E',
        breakable: '#F4A460',
        invisible: 'rgba(255, 255, 255, 0.1)',
        victory: '#FFD700',
        default: '#8B7355',
      },
      'vibe-coding': {
        'tech-ground': '#2F4F4F',
        floating: '#00D4FF',
        default: '#708090',
      },
      healthcare: {
        'medical-ground': '#E0E0E0',
        'medical-floating': '#FF5722',
        default: '#708090',
      },
      'georgia-tech': {
        'academic-ground': '#B3A369',
        'academic-floating': '#003057',
        default: '#708090',
      },
    };

    const worldStyles = styles[worldId] || {};
    ctx.fillStyle = worldStyles[type] || worldStyles.default || '#708090';
  }

  /**
   * Draw platform details (decorative elements on platforms)
   */
  static drawPlatformDetails(ctx, pos, width, height, type, worldId) {
    const { x, y } = pos;

    switch (worldId) {
      case 'vibe-coding':
        if (type === 'tech-ground') {
          // Circuit pattern
          ctx.strokeStyle = '#00FFFF';
          ctx.lineWidth = 2;
          ctx.beginPath();
          for (let i = 0; i < width / 50; i++) {
            const lineX = x - width / 2 + i * 50;
            ctx.moveTo(lineX, y - height / 2);
            ctx.lineTo(lineX, y + height / 2);
          }
          ctx.stroke();

          // Circuit nodes
          ctx.fillStyle = '#00FFFF';
          for (let i = 0; i < width / 100; i++) {
            const nodeX = x - width / 2 + 25 + i * 100;
            ctx.fillRect(nodeX - 2, y - 2, 4, 4);
          }
        }
        break;

      case 'healthcare':
        if (type === 'medical-ground') {
          // Medical cross pattern
          ctx.strokeStyle = '#FF0000';
          ctx.lineWidth = 3;
          ctx.beginPath();
          for (let i = 0; i < width / 100; i++) {
            const crossX = x - width / 2 + 50 + i * 100;
            ctx.moveTo(crossX, y - 15);
            ctx.lineTo(crossX, y + 15);
            ctx.moveTo(crossX - 10, y);
            ctx.lineTo(crossX + 10, y);
          }
          ctx.stroke();
        }
        break;

      case 'georgia-tech':
        if (type === 'academic-ground') {
          // GT logo pattern
          ctx.font = 'bold 20px Arial';
          ctx.fillStyle = '#003057';
          ctx.textAlign = 'center';
          for (let i = 0; i < width / 150; i++) {
            const letterX = x - width / 2 + 75 + i * 150;
            ctx.fillText('GT', letterX, y - 5);
          }
        }
        break;
    }
  }

  /**
   * Check if a decoration type should be drawn in background layer
   */
  static isBackgroundDecoration(type) {
    const backgroundTypes = [
      'digital-cloud',
      'tech-pillar',
      'health-cloud',
      'medical-pillar',
      'academic-cloud',
      'academic-pillar',
    ];
    return backgroundTypes.includes(type);
  }

  /**
   * Draw a decoration element
   */
  static drawDecoration(ctx, type, x, y, world) {
    const worldId = world.id;

    // World-specific decoration rendering
    switch (type) {
      // Vibe Coding decorations
      case 'tech-pillar':
        WorldLoader.drawTechPillar(ctx, x, y);
        break;
      case 'digital-cloud':
        WorldLoader.drawDigitalCloud(ctx, x, y);
        break;

      // Healthcare decorations
      case 'medical-pillar':
        WorldLoader.drawMedicalPillar(ctx, x, y);
        break;
      case 'health-cloud':
        WorldLoader.drawHealthCloud(ctx, x, y);
        break;

      // Georgia Tech decorations
      case 'academic-pillar':
        WorldLoader.drawAcademicPillar(ctx, x, y);
        break;
      case 'academic-cloud':
        WorldLoader.drawAcademicCloud(ctx, x, y);
        break;
    }
  }

  // ========================================
  // Vibe Coding Decoration Renderers
  // ========================================

  static drawTechPillar(ctx, x, y) {
    ctx.fillStyle = '#708090';
    ctx.fillRect(x - 12, y, 24, 150);

    ctx.fillStyle = '#2F4F4F';
    ctx.fillRect(x - 8, y + 20, 16, 20);
    ctx.fillRect(x - 8, y + 60, 16, 20);
    ctx.fillRect(x - 8, y + 100, 16, 20);

    ctx.fillStyle = '#00D4FF';
    ctx.fillRect(x - 10, y + 10, 2, 130);
    ctx.fillRect(x + 8, y + 10, 2, 130);
  }

  static drawDigitalCloud(ctx, x, y) {
    ctx.fillStyle = '#B0E0E6';
    ctx.globalAlpha = 0.7;

    const pixelSize = 8;
    const cloudData = [
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
    ];

    cloudData.forEach((row, rowIndex) => {
      row.forEach((pixel, colIndex) => {
        if (pixel) {
          ctx.fillRect(
            x - 32 + colIndex * pixelSize,
            y - 24 + rowIndex * pixelSize,
            pixelSize,
            pixelSize
          );
        }
      });
    });

    ctx.globalAlpha = 1.0;
  }

  // ========================================
  // Healthcare Decoration Renderers
  // ========================================

  static drawMedicalPillar(ctx, x, y) {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x - 12, y, 24, 150);

    ctx.strokeStyle = '#CCCCCC';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 12, y, 24, 150);

    ctx.fillStyle = '#FF0000';
    for (let i = 0; i < 3; i++) {
      const symbolY = y + 30 + i * 40;
      ctx.fillRect(x - 3, symbolY, 6, 20);
      ctx.fillRect(x - 10, symbolY + 7, 20, 6);
    }
  }

  static drawHealthCloud(ctx, x, y) {
    ctx.fillStyle = '#FFE4E1';
    ctx.globalAlpha = 0.8;

    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x - 25, y + 5, 25, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x + 25, y + 5, 25, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1.0;
  }

  // ========================================
  // Georgia Tech Decoration Renderers
  // ========================================

  static drawAcademicPillar(ctx, x, y) {
    ctx.fillStyle = '#F5F5DC';
    ctx.fillRect(x - 15, y, 30, 140);

    ctx.fillStyle = '#D3D3D3';
    ctx.fillRect(x - 18, y + 130, 36, 20);
    ctx.fillRect(x - 18, y - 10, 36, 20);

    ctx.strokeStyle = '#D3D3D3';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const lineX = x - 12 + i * 6;
      ctx.moveTo(lineX, y + 10);
      ctx.lineTo(lineX, y + 120);
    }
    ctx.stroke();

    ctx.fillStyle = '#B3A369';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GT', x, y + 75);
  }

  static drawAcademicCloud(ctx, x, y) {
    ctx.fillStyle = '#E6E6FA';
    ctx.globalAlpha = 0.9;

    ctx.beginPath();
    ctx.arc(x, y, 32, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x - 25, y + 8, 25, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x + 25, y + 8, 25, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#4B0082';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('📚', x, y + 5);

    ctx.globalAlpha = 1.0;
  }
}
