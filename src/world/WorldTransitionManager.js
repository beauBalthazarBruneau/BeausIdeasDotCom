// World Transition Manager
// Handles world state, transitions, and player position management

import { WorldManager } from '../managers/ProjectData.js';

export class WorldTransitionManager {
  constructor(game) {
    this.game = game;
    this.currentWorldId = 'main-hub';
    this.currentWorld = null;
    this.worlds = new Map();
    this.playerPositions = new Map();

    // Transition state
    this.isTransitioning = false;
    this.transitionCallback = null;

    // Initialize main hub position tracking
    this.playerPositions.set('main-hub', { x: 100, y: 300 });

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
    return this.playerPositions.get(worldId) || { x: 100, y: 300 };
  }

  // Main transition method
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
          // Exiting to main hub - use progression-based position
          newPosition = this.getProgressionSpawnPoint(this.currentWorldId);
        } else {
          // Entering sub-world - use default spawn
          newPosition = { x: 100, y: 300 };
        }
      }

      // Handle world-specific transitions
      if (targetWorldId === 'main-hub') {
        await this.transitionToMainHub(newPosition);
      } else {
        await this.transitionToSubWorld(targetWorldId, newPosition);
      }

      // Update current world tracking
      this.currentWorldId = targetWorldId;
    } catch (error) {
      console.error('Error during world transition:', error);
    } finally {
      this.isTransitioning = false;
    }
  }

  // Transition to main hub
  async transitionToMainHub(spawnPosition) {
    console.log('Loading main hub world');

    // Clear current world content
    this.clearCurrentWorld();

    // Load main hub (the original level)
    const MainHub = await import('./MainHub.js');
    this.currentWorld = new MainHub.MainHub(this.game.physics);

    // Create entry doors for sub-worlds
    await this.createMainHubDoors();

    // Recreate mystery boxes in main hub
    this.game.createMysteryBoxes();

    // Position player if provided
    if (this.game.player && spawnPosition) {
      this.game.player.setPosition(spawnPosition.x, spawnPosition.y);
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

    // Load the appropriate sub-world
    let WorldClass;
    switch (worldId) {
      case 'vibe-coding':
        WorldClass = (await import('./worlds/VibeCodingWorld.js'))
          .VibeCodingWorld;
        break;
      case 'healthcare':
        WorldClass = (await import('./worlds/HealthcareWorld.js'))
          .HealthcareWorld;
        break;
      case 'georgia-tech':
        WorldClass = (await import('./worlds/GeorgiaTechWorld.js'))
          .GeorgiaTechWorld;
        break;
      default:
        throw new Error(`Unknown world: ${worldId}`);
    }

    // Create world instance
    this.currentWorld = new WorldClass(this.game.physics, this);

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

  // Clear current world (remove physics bodies, checkpoints, etc.)
  clearCurrentWorld() {
    if (this.currentWorld) {
      // Clear physics bodies
      if (this.currentWorld.destroy) {
        this.currentWorld.destroy();
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
        spawnPoint: { x: 100, y: 300 },
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
      'vibe-coding': { x: 900, y: 520 }, // Just past the Vibe Coding door
      healthcare: { x: 1300, y: 520 }, // Just past the Healthcare door
      'georgia-tech': { x: 1700, y: 520 }, // Just past the Georgia Tech door
    };

    return spawnPoints[fromWorldId] || { x: 100, y: 300 };
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
    this.playerPositions.set('main-hub', { x: 100, y: 300 });
  }

  // Cleanup
  destroy() {
    this.clearCurrentWorld();
    this.worlds.clear();
    this.playerPositions.clear();
  }
}
