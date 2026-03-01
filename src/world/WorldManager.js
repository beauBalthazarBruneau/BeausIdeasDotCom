// World Manager
// Simplified single-world loader for jersey-shore level

import { WorldLoader } from './WorldLoader.js';

export class WorldManager {
  constructor(game) {
    this.game = game;
    this.currentWorldId = 'jersey-shore';
    this.currentWorld = null;
    this.initialLevelCleared = false;

    console.log('WorldManager initialized');
  }

  // Get current world
  getCurrentWorld() {
    return this.currentWorld;
  }

  // Get current world ID
  getCurrentWorldId() {
    return this.currentWorldId;
  }

  // Get current world instance
  getCurrentWorldInstance() {
    return this.currentWorld;
  }

  // Load the jersey-shore world
  async loadWorld(worldId, spawnPosition) {
    console.log(`Loading world: ${worldId}`);

    // Clear initial Level on first load only
    this.clearInitialLevel();

    // Load world using WorldLoader (JSON-driven)
    this.currentWorld = await WorldLoader.loadWorld(
      worldId,
      this.game.physics,
      this
    );

    // Use JSON spawn point if no position provided
    if (!spawnPosition && this.currentWorld.config.spawnPoint) {
      const { isTouchDevice } = await import('../utils/responsive.js');
      const sp = this.currentWorld.config.spawnPoint;
      const spawnY = isTouchDevice() && sp.mobileY ? sp.mobileY : sp.y;
      spawnPosition = { x: sp.x, y: spawnY };
    }

    // Position player if provided
    if (this.game.player && spawnPosition) {
      this.game.player.setPosition(spawnPosition.x, spawnPosition.y);

      // Initialize camera to prevent parallax sliding on load
      if (this.game.camera) {
        const dimensions = this.currentWorld.getDimensions();

        // Import responsive utility for mobile/desktop detection
        const { isMobile } = await import('../utils/responsive.js');

        // Position player based on device type
        let cameraX;
        if (isMobile()) {
          // Mobile: player at center of screen
          cameraX = spawnPosition.x - this.game.canvas.width * 0.5;
        } else {
          // Desktop: player at 10% from left edge of screen
          cameraX = spawnPosition.x - this.game.canvas.width * 0.1;
        }

        // Position platform bottom at bottom of screen
        const cameraY = dimensions.groundLevel - this.game.canvas.height + 60;

        this.game.camera.x = cameraX;
        this.game.camera.y = cameraY;
        this.game.camera.targetX = cameraX;
        this.game.camera.targetY = cameraY;
      }
    }

    // Update camera boundaries
    if (this.game.camera) {
      const dimensions = this.currentWorld.getDimensions();
      this.game.camera.setBoundaries(
        0,
        dimensions.width,
        -200,
        dimensions.groundLevel
      );
    }

    console.log(`World ${worldId} loaded successfully`);
    return this.currentWorld;
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

  // Clear current world (remove physics bodies, mystery boxes, etc.)
  clearCurrentWorld() {
    if (this.currentWorld) {
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
  }

  // Clear all worlds (useful for resets)
  clearAllWorlds() {
    console.log('Clearing all cached worlds');
    this.clearCurrentWorld();
  }

  // Cleanup
  destroy() {
    this.clearCurrentWorld();
  }
}
