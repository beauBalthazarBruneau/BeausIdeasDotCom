// WorldLoader - Loads world configurations from JSON
// Data-driven world loading for jersey-shore level

import { Bodies } from 'matter-js';
import { WorldManager as WorldDataManager } from './ProjectData.js';
import { drawPlatform } from '../game/Platform.js';
import { Background } from '../rendering/Background.js';

export class WorldLoader {
  /**
   * Load a world from JSON configuration
   * @param {string} worldId - The ID of the world to load
   * @param {Physics} physics - Physics engine instance
   * @param {WorldManager} worldManager - World manager
   * @returns {Object} World instance with all necessary methods
   */
  static async loadWorld(worldId, physics, worldManager) {
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
      ? new Background(
          worldManager.game.canvas,
          config.dimensions,
          config.background,
          worldId
        )
      : null;

    // Create world instance
    const world = {
      id: worldId,
      config,
      physics,
      worldManager,
      platforms: new Map(),
      boundaries: new Map(),
      decorativeElements: config.decorations || [],
      projects: WorldDataManager.getProjectsByWorld(worldId),
      background,

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

          // All jersey-shore decorations are foreground
          if (layer === 'foreground') {
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

    console.log(
      `${config.name} loaded with ${world.projects.length} projects`
    );

    return world;
  }

  /**
   * Create a platform in the world
   */
  static createPlatform(world, platformData) {
    const { id, x, y, width, height } = platformData;

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
    const { MysteryBox } = await import('../game/MysteryBox.js');
    const { startX, spacing, y } = world.config.mysteryBoxes;

    world.projects.forEach((project, index) => {
      const xPos = startX + index * spacing;

      const mysteryBox = new MysteryBox(
        xPos,
        y,
        world.worldManager.game,
        {
          collectible: project.collectible,
          audioManager: world.worldManager.game.audioManager,
          project: project,
        }
      );

      world.worldManager.game.mysteryBoxes =
        world.worldManager.game.mysteryBoxes || [];
      world.worldManager.game.mysteryBoxes.push(mysteryBox);
      world.physics.addBody(`mystery-box-${world.id}-${index}`, mysteryBox.body);
    });
  }

  /**
   * Set platform visual style based on type and world
   */
  static setPlatformStyle(ctx, type, worldId) {
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
    };

    const worldStyles = styles[worldId] || {};
    ctx.fillStyle = worldStyles[type] || worldStyles.default || '#708090';
  }

  /**
   * Draw a decoration element
   */
  static drawDecoration() {
    // Jersey-shore decorations (cloud, flag, tree) are handled by the background system
  }
}
