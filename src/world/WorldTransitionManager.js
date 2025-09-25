// World Transition Manager
// Handles world state, transitions, and player position management

import { WorldManager } from '../managers/ProjectData.js';
import { WorldThemeFactory } from '../systems/WorldTheme.js';

export class WorldTransitionManager {
  constructor(game) {
    this.game = game;
    this.currentWorldId = 'main-hub';
    this.currentWorld = null;
    this.currentTheme = null; // Current world theme
    this.worlds = new Map();
    this.playerPositions = new Map();
    this.loadedAssets = new Map(); // Track loaded world assets

    // Transition state
    this.isTransitioning = false;
    this.transitionCallback = null;
    this.initialLevelCleared = false; // Flag to prevent multiple clears

    // Initialize main hub position tracking
    this.playerPositions.set('main-hub', { x: 100, y: 550 });

    // Initialize URL routing
    this.initializeUrlRouting();

    console.log('WorldTransitionManager initialized');
  }

  // Register a world instance
  registerWorld(worldId, worldInstance) {
    this.worlds.set(worldId, worldInstance);
    console.log(`Registered world: ${worldId}`);
  }

  // Get current world
  getCurrentWorld() {
    return this.currentWorld;
  }

  // Get current world theme
  getCurrentTheme() {
    return this.currentTheme;
  }

  // Get current world ID
  getCurrentWorldId() {
    return this.currentWorldId;
  }

  // Check if currently in main hub
  isInMainHub() {
    return this.currentWorldId === 'main-hub';
  }

  // Save current player position
  savePlayerPosition() {
    const player = this.game.player;
    this.playerPositions.set(this.currentWorldId, {
      x: player.x,
      y: player.y,
    });
    console.log(`Saved player position for ${this.currentWorldId}:`, {
      x: player.x,
      y: player.y,
    });
  }

  // Get saved position for a world
  getSavedPosition(worldId) {
    return this.playerPositions.get(worldId) || { x: 100, y: 550 };
  }

  // Transition to main hub
  async transitionToMainHub(spawnPosition) {
    console.log('Loading main hub world');

    // Only clear initial Level, don't clear if we're already in MainHub
    this.clearInitialLevel();

    // Load main hub (the original level)
    const MainHub = await import('./MainHub.js');
    this.currentWorld = new MainHub.MainHub(this.game.physics);

    // Create theme for main hub
    this.currentTheme = await this.createThemeForWorld('main-hub');

    // Create entry doors for sub-worlds
    await this.createMainHubDoors();

    // Recreate mystery boxes in main hub
    this.game.createMysteryBoxes();

    // Position player if provided
    if (this.game.player && spawnPosition) {
      this.game.player.setPosition(spawnPosition.x, spawnPosition.y);

      // Initialize camera to prevent parallax sliding on load
      if (this.game.camera) {
        const dimensions = this.currentWorld.getDimensions();

        // Import responsive utility for mobile/desktop detection
        const { isMobile } = await import('@utils/responsive.js');

        // Position player based on device type
        let cameraX;
        if (isMobile()) {
          // Mobile: player at center of screen
          cameraX = spawnPosition.x - (this.game.canvas.width * 0.5);
        } else {
          // Desktop: player at 10% from left edge of screen
          cameraX = spawnPosition.x - (this.game.canvas.width * 0.1);
        }

        // Position platform bottom at bottom of screen
        const cameraY = dimensions.groundLevel - this.game.canvas.height + 60; // +60 for platform height

        this.game.camera.x = cameraX;
        this.game.camera.y = cameraY;
        this.game.camera.targetX = cameraX;
        this.game.camera.targetY = cameraY;
      }
    }

    // Update camera boundaries if camera exists
    if (this.game.camera) {
      const dimensions = this.currentWorld.getDimensions();
      this.game.camera.setBoundaries(
        0,
        dimensions.width,
        -200,
        dimensions.groundLevel
      );
    }

    console.log('Main hub loaded successfully');
    return this.currentWorld;
  }

  // Transition to sub-world
  async transitionToSubWorld(worldId, spawnPosition) {
    console.log(`Loading sub-world: ${worldId}`);

    // Clear current world content
    this.clearCurrentWorld();

    // Use preloaded assets for better performance
    const worldModule = await this.preloadWorldAssets(worldId);
    let WorldClass;

    switch (worldId) {
      case 'vibe-coding':
        WorldClass = worldModule.VibeCodingWorld;
        break;
      case 'healthcare':
        WorldClass = worldModule.HealthcareWorld;
        break;
      case 'georgia-tech':
        WorldClass = worldModule.GeorgiaTechWorld;
        break;
      default:
        throw new Error(`Unknown world: ${worldId}`);
    }

    // Create world instance
    this.currentWorld = new WorldClass(this.game.physics, this);

    // Create theme for sub-world
    this.currentTheme = await this.createThemeForWorld(worldId);

    // Position player at spawn point
    this.game.player.setPosition(spawnPosition.x, spawnPosition.y);

    // Update camera boundaries for sub-world
    const dimensions = this.currentWorld.getDimensions();
    this.game.camera.setBoundaries(
      0,
      dimensions.width,
      -200,
      dimensions.groundLevel
    );

    console.log(`Sub-world ${worldId} loaded successfully`);
  }

  // Clear only the initial Level (not currentWorld)
  clearInitialLevel() {
    if (
      !this.initialLevelCleared &&
      this.game.level &&
      this.game.level !== this.currentWorld
    ) {
      console.log('Clearing initial Level platforms');
      if (this.game.level.destroy) {
        this.game.level.destroy();
      } else {
        // Manually clear Level platforms if no destroy method
        if (this.game.level.platforms) {
          this.game.level.platforms.forEach((platform, id) => {
            this.game.physics.removeBody(id);
          });
        }
        if (this.game.level.boundaries) {
          this.game.level.boundaries.forEach((boundary, id) => {
            this.game.physics.removeBody(`boundary-${id}`);
          });
        }
      }
      this.initialLevelCleared = true;
    }
  }

  // Clear current world (remove physics bodies, checkpoints, etc.)
  clearCurrentWorld() {
    // Clear the currentWorld if it exists
    if (this.currentWorld) {
      // Clear physics bodies
      if (this.currentWorld.destroy) {
        this.currentWorld.destroy();
      }
    }

    // Clear mystery boxes
    this.game.mysteryBoxes.forEach((mysteryBox) => {
      if (mysteryBox.body) {
        this.game.physics.removeBody(mysteryBox.id);
      }
    });
    this.game.mysteryBoxes = [];

    // Clear doors
    if (this.game.doors) {
      this.game.doors.forEach((door) => {
        if (door.body) {
          this.game.physics.removeBody(`door-${door.x}-${door.y}`);
        }
      });
      this.game.doors = [];
    }
  }

  // Create entry doors in main hub
  async createMainHubDoors() {
    const { Door } = await import('../entities/Door.js');

    this.game.doors = this.game.doors || [];

    // Create entry doors for each sub-world
    const doorConfigs = [
      {
        worldId: 'vibe-coding',
        position: { x: 800, y: 520 },
        themeColor: '#00D4FF',
        name: 'Vibe Coding',
      },
      {
        worldId: 'healthcare',
        position: { x: 1200, y: 520 },
        themeColor: '#FF5722',
        name: 'Healthcare',
      },
      {
        worldId: 'georgia-tech',
        position: { x: 1600, y: 520 },
        themeColor: '#B3A369',
        name: 'Georgia Tech',
      },
    ];

    doorConfigs.forEach((config) => {
      const door = new Door(config.position.x, config.position.y, this, {
        targetWorld: config.worldId,
        spawnPoint: { x: 100, y: 550 },
        doorType: 'entry',
        themeColor: config.themeColor,
        name: config.name,
      });

      this.game.doors.push(door);
      this.game.physics.addBody(`door-entry-${config.worldId}`, door.body);
    });

    console.log(`Created ${doorConfigs.length} entry doors in main hub`);
  }

  // Get progression-based spawn point when returning from sub-world
  getProgressionSpawnPoint(fromWorldId) {
    // Return to a position further along the main world based on which world was completed
    const spawnPoints = {
      'vibe-coding': { x: 900, y: 550 }, // Just past the Vibe Coding door
      healthcare: { x: 1300, y: 550 }, // Just past the Healthcare door
      'georgia-tech': { x: 1700, y: 550 }, // Just past the Georgia Tech door
    };

    return spawnPoints[fromWorldId] || { x: 100, y: 550 };
  }

  // Get current world instance
  getCurrentWorldInstance() {
    return this.currentWorld;
  }

  // Handle door collision detection
  checkDoorCollisions(player) {
    if (!this.game.doors || this.isTransitioning) return;

    this.game.doors.forEach((door) => {
      // Check proximity for hover effects
      door.checkPlayerProximity(player);

      // Check actual collision
      const playerBounds = {
        x: player.x - 16,
        y: player.y - 16,
        width: 32,
        height: 32,
      };

      const doorBounds = {
        x: door.x,
        y: door.y,
        width: door.width,
        height: door.height,
      };

      if (this.isColliding(playerBounds, doorBounds)) {
        door.onPlayerCollision(player);
      }
    });
  }

  // Simple collision detection helper
  isColliding(rect1, rect2) {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }

  // Clear all cached worlds (useful for resets)
  clearAllWorlds() {
    console.log('Clearing all cached worlds');
    this.worlds.clear();
    this.playerPositions.clear();
    // Reset to main hub defaults
    this.playerPositions.set('main-hub', { x: 100, y: 550 });
  }

  // Initialize URL-based routing
  initializeUrlRouting() {
    // Listen for URL changes (back/forward navigation)
    window.addEventListener('popstate', (event) => {
      if (event.state && event.state.worldId) {
        this.transitionToWorldFromUrl(
          event.state.worldId,
          event.state.position
        );
      }
    });

    // Check initial URL for world parameter
    this.checkInitialUrl();
  }

  // Check URL parameters on page load
  checkInitialUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const worldParam = urlParams.get('world');
    const x = parseFloat(urlParams.get('x')) || null;
    const y = parseFloat(urlParams.get('y')) || null;

    if (worldParam && this.isValidWorldId(worldParam)) {
      console.log(`Loading world from URL: ${worldParam}`);
      const position = x !== null && y !== null ? { x, y } : null;
      // Delay to allow game initialization
      setTimeout(() => {
        this.transitionToWorldFromUrl(worldParam, position);
      }, 100);
    }
  }

  // Validate world ID
  isValidWorldId(worldId) {
    return ['main-hub', 'vibe-coding', 'healthcare', 'georgia-tech'].includes(
      worldId
    );
  }

  // Transition from URL (no door interaction)
  async transitionToWorldFromUrl(worldId, position = null) {
    if (this.currentWorldId === worldId) {
      return; // Already in target world
    }

    await this.transitionToWorld(worldId, position, 'url');
  }

  // Update URL when world changes
  updateUrl(worldId, position = null) {
    const url = new URL(window.location.href);
    url.searchParams.set('world', worldId);

    if (position) {
      url.searchParams.set('x', Math.round(position.x).toString());
      url.searchParams.set('y', Math.round(position.y).toString());
    } else {
      url.searchParams.delete('x');
      url.searchParams.delete('y');
    }

    // Update browser history
    window.history.pushState(
      { worldId, position },
      `Portfolio Game - ${this.getWorldDisplayName(worldId)}`,
      url.toString()
    );

    // Update page title
    document.title = `Beau's Portfolio - ${this.getWorldDisplayName(worldId)}`;
  }

  // Get display name for world
  getWorldDisplayName(worldId) {
    const names = {
      'main-hub': 'Main Hub',
      'vibe-coding': 'Vibe Coding World',
      healthcare: 'Healthcare World',
      'georgia-tech': 'Georgia Tech World',
    };
    return names[worldId] || 'Unknown World';
  }

  // Preload world assets for better performance
  async preloadWorldAssets(worldId) {
    if (this.loadedAssets.has(worldId)) {
      return this.loadedAssets.get(worldId);
    }

    console.log(`Preloading assets for ${worldId}`);
    let worldModule;

    switch (worldId) {
      case 'vibe-coding':
        worldModule = await import('./worlds/VibeCodingWorld.js');
        break;
      case 'healthcare':
        worldModule = await import('./worlds/HealthcareWorld.js');
        break;
      case 'georgia-tech':
        worldModule = await import('./worlds/GeorgiaTechWorld.js');
        break;
      case 'main-hub':
        worldModule = await import('./MainHub.js');
        break;
    }

    this.loadedAssets.set(worldId, worldModule);
    return worldModule;
  }

  // Unload unused world assets to free memory
  unloadWorldAssets(worldId) {
    if (worldId !== this.currentWorldId && this.loadedAssets.has(worldId)) {
      console.log(`Unloading assets for ${worldId}`);
      this.loadedAssets.delete(worldId);
      // Force garbage collection hint
      if (window.gc) window.gc();
    }
  }

  // Enhanced transition method with URL updates
  async transitionToWorld(
    targetWorldId,
    spawnPoint = null,
    doorType = 'entry'
  ) {
    if (this.isTransitioning) {
      console.log('Transition already in progress, ignoring');
      return;
    }

    console.log(
      `Transitioning from ${this.currentWorldId} to ${targetWorldId}`
    );
    this.isTransitioning = true;

    try {
      // Save current player position
      this.savePlayerPosition();

      // Determine spawn position
      let newPosition = spawnPoint;
      if (!newPosition) {
        if (doorType === 'exit') {
          newPosition = this.getProgressionSpawnPoint(this.currentWorldId);
        } else if (doorType === 'url') {
          newPosition = this.getSavedPosition(targetWorldId);
        } else {
          newPosition = { x: 100, y: 550 };
        }
      }

      // Handle world-specific transitions
      if (targetWorldId === 'main-hub') {
        await this.transitionToMainHub(newPosition);
      } else {
        await this.transitionToSubWorld(targetWorldId, newPosition);
      }

      // Update URL (except for initial load)
      if (doorType !== 'initial') {
        this.updateUrl(targetWorldId, newPosition);
      }

      // Unload previous world assets for memory management
      const previousWorldId = this.currentWorldId;
      this.currentWorldId = targetWorldId;

      // Delay unloading to avoid issues during transition
      setTimeout(() => {
        this.unloadWorldAssets(previousWorldId);
      }, 1000);
    } catch (error) {
      console.error('Error during world transition:', error);
    } finally {
      this.isTransitioning = false;
    }
  }

  // Create theme for a world
  async createThemeForWorld(worldId) {
    console.log(`Creating theme for world: ${worldId}`);
    try {
      const dimensions = this.getCurrentWorldInstance()?.getDimensions() || {
        width: 3500,
        height: 1200,
      };
      const theme = await WorldThemeFactory.create(
        worldId,
        this.game.canvas,
        dimensions
      );
      console.log(
        `Theme created successfully for ${worldId}:`,
        theme.getThemeId()
      );
      return theme;
    } catch (error) {
      console.error(`Failed to create theme for ${worldId}:`, error);
      // Return default theme as fallback
      const { WorldTheme } = await import('../systems/WorldTheme.js');
      return new WorldTheme(this.game.canvas, { width: 3500, height: 1200 });
    }
  }

  // Cleanup
  destroy() {
    this.clearCurrentWorld();
    this.worlds.clear();
    this.playerPositions.clear();
    this.loadedAssets.clear();
    this.currentTheme = null;

    // Remove URL event listeners
    window.removeEventListener('popstate', this.handlePopState);
  }
}
