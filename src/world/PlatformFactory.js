// PlatformFactory - Centralized platform creation and management system
// Supports all existing platform types plus new enhanced features

import { Bodies, Body } from 'matter-js';
import {
  PLATFORM_TYPES,
  PLATFORM_PHYSICS_PRESETS,
  MOVEMENT_PATTERNS,
  PLATFORM_BEHAVIORS,
  createPlatformConfig,
  validatePlatformData,
} from './PlatformTypes.js';

export class PlatformFactory {
  constructor(physics, game) {
    this.physics = physics;
    this.game = game;
    this.platforms = new Map();
    this.animatedPlatforms = new Set();
    this.conditionalPlatforms = new Set();

    // Debug mode for invisible platforms
    this.debugMode = false;
  }

  setDebugMode(enabled) {
    this.debugMode = enabled;
    // Update visibility of all invisible platforms
    this.updateInvisiblePlatforms();
  }

  // Main platform creation method - backward compatible with existing data
  createPlatform(data, config = {}) {
    validatePlatformData(data);

    // Merge platform configuration
    const platformConfig = createPlatformConfig({
      ...config,
      // Map old platform types to new system
      type: data.type || PLATFORM_TYPES.GRASS,
    });

    // Create the platform object
    const platform = {
      id: data.id,
      data: { ...data },
      config: platformConfig,
      body: null,

      // Enhanced properties
      originalPosition: { x: data.x, y: data.y },
      currentRotation: platformConfig.rotation,
      animationState: {},
      isDestroyed: false,

      // Visibility state
      visible: platformConfig.visible,
      debugVisible: platformConfig.debugVisible,
    };

    // Create physics body
    platform.body = this.createPhysicsBody(platform);

    // Store platform reference in physics body
    platform.body.gameObject = platform;
    platform.body.platformId = data.id;

    // Add to physics world
    this.physics.addBody(data.id, platform.body);

    // Store platform
    this.platforms.set(data.id, platform);

    // Setup enhanced behaviors
    this.setupPlatformBehaviors(platform);

    console.log(
      `Created platform: ${data.id} (type: ${data.type || 'default'}) - Enhanced features: ${this.getPlatformFeatures(platform)}`
    );
    return platform;
  }

  createPhysicsBody(platform) {
    const { data, config } = platform;

    // Create basic rectangle body
    const body = Bodies.rectangle(data.x, data.y, data.width, data.height, {
      label: 'platform',
      ...config.physics,
    });

    // Apply initial rotation if specified
    if (config.rotation !== 0) {
      Bodies.rotate(body, config.rotation);
    }

    return body;
  }

  setupPlatformBehaviors(platform) {
    const { config } = platform;

    // Setup rotating platforms
    if (
      config.behavior === PLATFORM_BEHAVIORS.ROTATING ||
      config.rotationSpeed !== 0
    ) {
      platform.animationState.rotationSpeed = config.rotationSpeed || 1;
      this.animatedPlatforms.add(platform);
    }

    // Setup moving platforms
    if (config.behavior === PLATFORM_BEHAVIORS.MOVING && config.movement) {
      this.setupMovingPlatform(platform);
      this.animatedPlatforms.add(platform);
    }

    // Setup bobbing platforms
    if (config.behavior === PLATFORM_BEHAVIORS.BOBBING || config.bobbing) {
      this.setupBobbingPlatform(platform);
      this.animatedPlatforms.add(platform);
    }

    // Setup pulsing platforms
    if (config.behavior === PLATFORM_BEHAVIORS.PULSING || config.pulsing) {
      this.setupPulsingPlatform(platform);
      this.animatedPlatforms.add(platform);
    }

    // Setup breakable platforms
    if (config.behavior === PLATFORM_BEHAVIORS.BREAKABLE || config.breakable) {
      this.setupBreakablePlatform(platform);
    }

    // Setup invisible platforms
    if (
      config.behavior === PLATFORM_BEHAVIORS.INVISIBLE ||
      platform.data.type === PLATFORM_TYPES.INVISIBLE
    ) {
      this.setupInvisiblePlatform(platform);
    }

    // Setup conditional platforms
    if (
      config.behavior === PLATFORM_BEHAVIORS.CONDITIONAL ||
      config.conditional
    ) {
      this.setupConditionalPlatform(platform);
      this.conditionalPlatforms.add(platform);
    }
  }

  setupMovingPlatform(platform) {
    const movement = platform.config.movement;

    platform.animationState.movement = {
      pattern: movement.pattern || MOVEMENT_PATTERNS.HORIZONTAL,
      speed: movement.speed || 1,
      range: movement.range || 100,
      time: 0,
      direction: 1,
    };

    // Set initial waypoints based on pattern
    switch (movement.pattern) {
      case MOVEMENT_PATTERNS.HORIZONTAL:
        platform.animationState.movement.waypoints = [
          { x: platform.originalPosition.x, y: platform.originalPosition.y },
          {
            x: platform.originalPosition.x + movement.range,
            y: platform.originalPosition.y,
          },
        ];
        break;
      case MOVEMENT_PATTERNS.VERTICAL:
        platform.animationState.movement.waypoints = [
          { x: platform.originalPosition.x, y: platform.originalPosition.y },
          {
            x: platform.originalPosition.x,
            y: platform.originalPosition.y - movement.range,
          },
        ];
        break;
      case MOVEMENT_PATTERNS.CIRCULAR:
        platform.animationState.movement.radius = movement.range / 2;
        platform.animationState.movement.centerX = platform.originalPosition.x;
        platform.animationState.movement.centerY = platform.originalPosition.y;
        break;
    }
  }

  setupBobbingPlatform(platform) {
    const bobbing = platform.config.bobbing || { amplitude: 10, speed: 2 };

    platform.animationState.bobbing = {
      amplitude: bobbing.amplitude,
      speed: bobbing.speed,
      time: 0,
      originalY: platform.originalPosition.y,
    };
  }

  setupPulsingPlatform(platform) {
    const pulsing = platform.config.pulsing || {
      minScale: 0.9,
      maxScale: 1.1,
      speed: 1,
    };

    platform.animationState.pulsing = {
      minScale: pulsing.minScale,
      maxScale: pulsing.maxScale,
      speed: pulsing.speed,
      time: 0,
      currentScale: 1,
    };
  }

  setupBreakablePlatform(platform) {
    const breakable = platform.config.breakable || {
      hits: 3,
      respawnTime: 5000,
    };

    platform.animationState.breakable = {
      maxHits: breakable.hits,
      currentHits: 0,
      respawnTime: breakable.respawnTime,
      broken: false,
      respawnTimer: 0,
    };
  }

  setupInvisiblePlatform(platform) {
    platform.visible = this.debugMode;
    platform.config.invisible = true;

    // Add special properties for invisible platforms
    platform.animationState.invisible = {
      discovered: false,
      discoveryEffect: false,
    };
  }

  setupConditionalPlatform(platform) {
    const conditional = platform.config.conditional;

    platform.animationState.conditional = {
      condition: conditional.condition,
      conditionMet: false,
      checkFunction: conditional.checkFunction || (() => false),
    };

    // Initially hide if condition not met
    platform.visible = this.checkConditionalVisibility(platform);
  }

  // Update all animated platforms
  update(deltaTime) {
    for (const platform of this.animatedPlatforms) {
      if (platform.isDestroyed) continue;

      this.updatePlatformAnimation(platform, deltaTime);
    }

    // Update conditional platforms
    for (const platform of this.conditionalPlatforms) {
      if (platform.isDestroyed) continue;

      this.updateConditionalPlatform(platform);
    }
  }

  updatePlatformAnimation(platform, deltaTime) {
    const { animationState, body } = platform;

    // Update rotation
    if (animationState.rotationSpeed) {
      const rotationDelta = animationState.rotationSpeed * deltaTime * 0.001;
      platform.currentRotation += rotationDelta;

      // Apply rotation to physics body
      Body.setAngle(body, platform.currentRotation);
    }

    // Update movement
    if (animationState.movement) {
      this.updateMovingPlatform(platform, deltaTime);
    }

    // Update bobbing
    if (animationState.bobbing) {
      this.updateBobbingPlatform(platform, deltaTime);
    }

    // Update pulsing
    if (animationState.pulsing) {
      this.updatePulsingPlatform(platform, deltaTime);
    }

    // Update breakable state
    if (animationState.breakable) {
      this.updateBreakablePlatform(platform, deltaTime);
    }
  }

  updateMovingPlatform(platform, deltaTime) {
    const movement = platform.animationState.movement;
    movement.time += deltaTime * 0.001;

    let newX = platform.body.position.x;
    let newY = platform.body.position.y;

    switch (movement.pattern) {
      case MOVEMENT_PATTERNS.HORIZONTAL:
        newX =
          platform.originalPosition.x +
          (Math.sin(movement.time * movement.speed) * movement.range) / 2;
        break;
      case MOVEMENT_PATTERNS.VERTICAL:
        newY =
          platform.originalPosition.y +
          (Math.sin(movement.time * movement.speed) * movement.range) / 2;
        break;
      case MOVEMENT_PATTERNS.CIRCULAR:
        newX =
          movement.centerX +
          Math.cos(movement.time * movement.speed) * movement.radius;
        newY =
          movement.centerY +
          Math.sin(movement.time * movement.speed) * movement.radius;
        break;
    }

    // Update physics body position
    Body.setPosition(platform.body, { x: newX, y: newY });
  }

  updateBobbingPlatform(platform, deltaTime) {
    const bobbing = platform.animationState.bobbing;
    bobbing.time += deltaTime * 0.001;

    const newY =
      bobbing.originalY +
      Math.sin(bobbing.time * bobbing.speed) * bobbing.amplitude;
    Body.setPosition(platform.body, { x: platform.body.position.x, y: newY });
  }

  updatePulsingPlatform(platform, deltaTime) {
    const pulsing = platform.animationState.pulsing;
    pulsing.time += deltaTime * 0.001;

    const scaleRange = pulsing.maxScale - pulsing.minScale;
    pulsing.currentScale =
      pulsing.minScale +
      (Math.sin(pulsing.time * pulsing.speed) + 1) * 0.5 * scaleRange;

    // Note: Scale will be applied during rendering
  }

  updateBreakablePlatform(platform, deltaTime) {
    const breakable = platform.animationState.breakable;

    if (breakable.broken) {
      breakable.respawnTimer -= deltaTime;
      if (breakable.respawnTimer <= 0) {
        this.respawnBreakablePlatform(platform);
      }
    }
  }

  updateConditionalPlatform(platform) {
    const conditional = platform.animationState.conditional;
    const conditionMet = conditional.checkFunction(this.game);

    if (conditionMet !== conditional.conditionMet) {
      conditional.conditionMet = conditionMet;
      platform.visible = conditionMet;

      // Trigger appear/disappear effects
      if (conditionMet) {
        this.triggerPlatformAppear(platform);
      } else {
        this.triggerPlatformDisappear(platform);
      }
    }
  }

  // Platform interaction methods
  onPlayerCollision(platform, player) {
    // Handle breakable platforms
    if (
      platform.animationState.breakable &&
      !platform.animationState.breakable.broken
    ) {
      this.hitBreakablePlatform(platform);
    }

    // Handle invisible platform discovery
    if (
      platform.config.invisible &&
      !platform.animationState.invisible.discovered
    ) {
      this.discoverInvisiblePlatform(platform);
    }
  }

  hitBreakablePlatform(platform) {
    const breakable = platform.animationState.breakable;
    breakable.currentHits++;

    // Trigger hit effects
    this.triggerPlatformHitEffect(platform);

    if (breakable.currentHits >= breakable.maxHits) {
      this.breakPlatform(platform);
    }
  }

  breakPlatform(platform) {
    const breakable = platform.animationState.breakable;
    breakable.broken = true;
    breakable.respawnTimer = breakable.respawnTime;

    // Hide platform visually and disable physics
    platform.visible = false;
    this.physics.removeBody(platform.id);

    // Trigger break effects
    this.triggerPlatformBreakEffect(platform);
  }

  respawnBreakablePlatform(platform) {
    const breakable = platform.animationState.breakable;
    breakable.broken = false;
    breakable.currentHits = 0;

    // Show platform and re-enable physics
    platform.visible = true;
    this.physics.addBody(platform.id, platform.body);

    // Trigger respawn effects
    this.triggerPlatformRespawnEffect(platform);
  }

  discoverInvisiblePlatform(platform) {
    const invisible = platform.animationState.invisible;
    invisible.discovered = true;

    // Make platform visible
    platform.visible = true;

    // Trigger discovery effects
    this.triggerPlatformDiscoveryEffect(platform);
  }

  // Effect methods (to be implemented with particle system)
  triggerPlatformHitEffect(platform) {
    // TODO: Add particle effects, screen shake, sound
    console.log(`Platform hit: ${platform.id}`);
  }

  triggerPlatformBreakEffect(platform) {
    // TODO: Add break particles, sound
    console.log(`Platform broken: ${platform.id}`);
  }

  triggerPlatformRespawnEffect(platform) {
    // TODO: Add respawn particles, sound
    console.log(`Platform respawned: ${platform.id}`);
  }

  triggerPlatformDiscoveryEffect(platform) {
    // TODO: Add discovery particles, sound
    console.log(`Invisible platform discovered: ${platform.id}`);
  }

  triggerPlatformAppear(platform) {
    // TODO: Add appear effect
    console.log(`Platform appeared: ${platform.id}`);
  }

  triggerPlatformDisappear(platform) {
    // TODO: Add disappear effect
    console.log(`Platform disappeared: ${platform.id}`);
  }

  updateInvisiblePlatforms() {
    for (const platform of this.platforms.values()) {
      if (platform.config.invisible) {
        platform.visible =
          this.debugMode || platform.animationState.invisible.discovered;
      }
    }
  }

  // Helper method to describe platform features for logging
  getPlatformFeatures(platform) {
    const features = [];

    if (platform.config.rotationSpeed !== 0) {
      features.push(`rotating(${platform.config.rotationSpeed}rad/s)`);
    }

    if (platform.config.movement) {
      const movement = platform.config.movement;
      features.push(
        `moving(${movement.pattern}, ${movement.speed}, ${movement.range})`
      );
    }

    if (platform.config.bobbing) {
      features.push(
        `bobbing(${platform.config.bobbing.amplitude}, ${platform.config.bobbing.speed})`
      );
    }

    if (platform.config.pulsing) {
      features.push(`pulsing`);
    }

    if (platform.config.breakable) {
      features.push(`breakable(${platform.config.breakable.hits} hits)`);
    }

    if (platform.config.invisible) {
      features.push(`invisible`);
    }

    if (platform.config.conditional) {
      features.push(`conditional`);
    }

    return features.length > 0 ? features.join(', ') : 'none';
  }

  // Utility methods
  getPlatform(id) {
    return this.platforms.get(id);
  }

  getAllPlatforms() {
    return Array.from(this.platforms.values());
  }

  getVisiblePlatforms() {
    return this.getAllPlatforms().filter((platform) => platform.visible);
  }

  getPlatformsByType(type) {
    return this.getAllPlatforms().filter(
      (platform) => platform.data.type === type
    );
  }

  destroyPlatform(id) {
    const platform = this.platforms.get(id);
    if (!platform) return;

    // Remove from physics
    this.physics.removeBody(id);

    // Remove from animation sets
    this.animatedPlatforms.delete(platform);
    this.conditionalPlatforms.delete(platform);

    // Mark as destroyed
    platform.isDestroyed = true;

    // Remove from map
    this.platforms.delete(id);

    console.log(`Destroyed platform: ${id}`);
  }

  destroy() {
    // Clean up all platforms
    for (const platform of this.platforms.values()) {
      this.physics.removeBody(platform.id);
    }

    this.platforms.clear();
    this.animatedPlatforms.clear();
    this.conditionalPlatforms.clear();
  }
}
