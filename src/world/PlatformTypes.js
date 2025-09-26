// Platform Type Definitions
// Defines all supported platform types and their properties

export const PLATFORM_TYPES = {
  // Basic platform types
  GRASS: 'grass',
  STONE: 'stone',
  ROAD: 'road',
  FLOATING: 'floating',
  CHECKPOINT: 'checkpoint',
  VICTORY: 'victory',

  // World-specific platform types
  ACADEMIC_GROUND: 'academic-ground',
  ACADEMIC_FLOATING: 'academic-floating',
  MEDICAL_GROUND: 'medical-ground',
  MEDICAL_FLOATING: 'medical-floating',
  TECH_GROUND: 'tech-ground',
  TECH_FLOATING: 'tech-floating',

  // New enhanced platform types
  INVISIBLE: 'invisible',
  ROTATING: 'rotating',
  MOVING: 'moving',
  BREAKABLE: 'breakable',
  ANIMATED: 'animated',
  CONDITIONAL: 'conditional',
};

export const PLATFORM_PHYSICS_PRESETS = {
  default: {
    isStatic: true,
    friction: 0.8,
    frictionStatic: 0.2,
    restitution: 0.1,
  },
  bouncy: {
    isStatic: true,
    friction: 0.3,
    frictionStatic: 0.1,
    restitution: 0.8,
  },
  slippery: {
    isStatic: true,
    friction: 0.1,
    frictionStatic: 0.05,
    restitution: 0.0,
  },
  breakable: {
    isStatic: true,
    friction: 0.8,
    frictionStatic: 0.2,
    restitution: 0.0,
  },
};

export const MOVEMENT_PATTERNS = {
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical',
  CIRCULAR: 'circular',
  ELEVATOR: 'elevator',
  PENDULUM: 'pendulum',
  CUSTOM: 'custom',
};

export const PLATFORM_BEHAVIORS = {
  STATIC: 'static',
  ROTATING: 'rotating',
  MOVING: 'moving',
  BOBBING: 'bobbing',
  PULSING: 'pulsing',
  BREAKABLE: 'breakable',
  INVISIBLE: 'invisible',
  CONDITIONAL: 'conditional',
};

// Default platform configurations
export const DEFAULT_PLATFORM_CONFIG = {
  physics: PLATFORM_PHYSICS_PRESETS.default,
  behavior: PLATFORM_BEHAVIORS.STATIC,
  visible: true,
  debugVisible: true,
  theme: 'default',

  // Animation properties
  rotation: 0,
  rotationSpeed: 0,
  movement: null,
  bobbing: null,
  pulsing: null,

  // Conditional visibility
  conditional: null,

  // Breakable properties
  breakable: null,

  // Audio/effects
  sounds: null,
  particles: null,
};

// Helper function to create platform configuration
export function createPlatformConfig(overrides = {}) {
  return {
    ...DEFAULT_PLATFORM_CONFIG,
    ...overrides,
    physics: {
      ...DEFAULT_PLATFORM_CONFIG.physics,
      ...(overrides.physics || {}),
    },
  };
}

// Validation function for platform data
export function validatePlatformData(data) {
  const required = ['id', 'x', 'y', 'width', 'height'];
  for (const field of required) {
    if (!(field in data)) {
      throw new Error(`Platform data missing required field: ${field}`);
    }
  }

  if (data.type && !Object.values(PLATFORM_TYPES).includes(data.type)) {
    console.warn(`Unknown platform type: ${data.type}. Using default styling.`);
  }

  return true;
}
