// Core game constants - all magic numbers in one place!

// 🎮 GAME SETTINGS
export const GAME = {
  TARGET_FPS: 60,
  MAX_DELTA_TIME: 16.667, // Cap at 60 FPS (16.667ms per frame)
  DEBUG_TOGGLE_KEY: 'F1',
};

// 🏃 PLAYER CONSTANTS
export const PLAYER = {
  WIDTH: 32,
  HEIGHT: 32,
  SPEED: 5,
  JUMP_FORCE: -12,
  MAX_JUMPS: 2,
  FRICTION: 0.8,
  AIR_RESISTANCE: 0.95,
  COYOTE_TIME: 150, // milliseconds
  JUMP_BUFFER_TIME: 150, // milliseconds
};

// 🌍 PHYSICS CONSTANTS
export const PHYSICS = {
  GRAVITY: 0.8,
  GRAVITY_SCALE: 0.001,
  GROUND_FRICTION: 0.8,
  AIR_FRICTION: 0.95,
  DEATH_ZONE_OFFSET: 200, // pixels below ground level
};

// 📷 CAMERA CONSTANTS
export const CAMERA = {
  SMOOTHING: 0.1,
  SHAKE_LIGHT: { intensity: 3, duration: 0.15 },
  SHAKE_MEDIUM: { intensity: 6, duration: 0.25 },
  SHAKE_HEAVY: { intensity: 12, duration: 0.4 },
};

// 🎯 CHECKPOINT CONSTANTS
export const CHECKPOINT = {
  WIDTH: 40,
  HEIGHT: 40,
  COLORS: {
    BASE: '#8B4513', // Brown mystery box
    HIT: '#654321', // Darker brown when hit
    COMPLETED: '#FFD700', // Gold when completed
  },
  HIT_BOUNCE_HEIGHT: 8,
  COLLECTIBLE_SPAWN_OFFSET: { x: 0, y: -20 },
};

// 💎 COLLECTIBLE CONSTANTS
export const COLLECTIBLE = {
  WIDTH: 16,
  HEIGHT: 16,
  FLOAT_SPEED: 2,
  FLOAT_AMPLITUDE: 8,
  COLLECTION_DISTANCE: 24,
  SPAWN_VELOCITY: { x: 0, y: -3 },
  GRAVITY: 0.2,
  BOUNCE_DAMPING: 0.7,
};

// ✨ PARTICLE CONSTANTS
export const PARTICLES = {
  JUMP_DUST: {
    COUNT: 6,
    SPEED_RANGE: [3, 5],
    SIZE_RANGE: [4, 8],
    LIFE_RANGE: [400, 700],
    COLOR: '#F5F5DC',
    GRAVITY: 0.05,
    FRICTION: 0.95,
  },
  DOUBLE_JUMP_PUFF: {
    COUNT: 6,
    SPEED_RANGE: [3, 5],
    SIZE_RANGE: [4, 8],
    LIFE_RANGE: [400, 700],
    COLOR: '#F5F5DC',
    GRAVITY: 0.05,
    FRICTION: 0.95,
  },
  ENVIRONMENTAL: {
    FLOATING_DUST: {
      COUNT: 3,
      SPEED_RANGE: [0.25, 0.8],
      SIZE_RANGE: [1, 3],
      LIFE_RANGE: [8000, 12000],
      COLOR: '#F5F5DC',
      GRAVITY: -0.001,
      FRICTION: 0.999,
    },
    MAGIC_SPARKLES: {
      COUNT: 2,
      SPEED_RANGE: [0.5, 1.5],
      SIZE_RANGE: [2, 5],
      LIFE_RANGE: [3000, 5000],
      COLOR: '#E6E6FA',
      GRAVITY: -0.002,
      FRICTION: 0.998,
    },
  },
  SPAWN_RATE: 2000, // milliseconds between environmental spawns
};

// 🎵 AUDIO CONSTANTS
export const AUDIO = {
  DEFAULT_SFX_VOLUME: 0.7,
  DEFAULT_MUSIC_VOLUME: 0.3,
  FADE_DURATION: 1000, // milliseconds
  AUDIO_CONTEXT_UNLOCK_EVENTS: ['click', 'keydown', 'touchstart'],
};

// 🎨 UI CONSTANTS
export const UI = {
  COLORS: {
    PRIMARY: '#FFFFFF',
    SECONDARY: '#CCCCCC',
    DEBUG: '#00FF00',
    ERROR: '#FF0000',
    WARNING: '#FFAA00',
  },
  FONTS: {
    MAIN: '16px monospace',
    DEBUG: '12px monospace',
    TITLE: 'bold 24px Arial',
  },
  DEBUG_SECTIONS: {
    GAME: '🎮 GAME INFO',
    PLAYER: '🏃 PLAYER',
    CAMERA: '📷 CAMERA',
    AUDIO: '🎵 AUDIO',
    PARTICLES: '✨ PARTICLES',
    CONTROLS: '🎮 CONTROLS',
  },
};

// 🌍 WORLD CONSTANTS
export const WORLD = {
  GROUND_LEVEL: 500,
  PLATFORM_THICKNESS: 20,
  BACKGROUND_LAYERS: 3,
  PARALLAX_SPEEDS: [0.2, 0.5, 0.8], // Background layer speeds
};

// ⌨️ INPUT CONSTANTS
export const INPUT = {
  KEYS: {
    LEFT: ['ArrowLeft', 'KeyA'],
    RIGHT: ['ArrowRight', 'KeyD'],
    JUMP: ['ArrowUp', 'KeyW', 'Space'],
    DEBUG: ['F1'],
    MUTE: ['KeyM'],
    VOLUME_UP: ['Equal', 'NumpadAdd'],
    VOLUME_DOWN: ['Minus', 'NumpadSubtract'],
    FORCE_MUSIC: ['KeyB'],
  },
};

// 💾 STORAGE CONSTANTS
export const STORAGE = {
  CHECKPOINT_STATES_KEY: 'portfolioCheckpointStates',
  AUDIO_SETTINGS_KEY: 'portfolioAudioSettings',
  GAME_PROGRESS_KEY: 'portfolioGameProgress',
};

// 🎯 WORLD THEMES (for future world-based features)
export const WORLD_THEMES = {
  TECH: {
    PRIMARY_COLOR: '#00D4FF',
    SECONDARY_COLOR: '#0099CC',
    ACCENT_COLOR: '#66E6FF',
  },
  ENTERTAINMENT: {
    PRIMARY_COLOR: '#FF6B9D',
    SECONDARY_COLOR: '#CC5580',
    ACCENT_COLOR: '#FF99BB',
  },
  SPORTS: {
    PRIMARY_COLOR: '#4CAF50',
    SECONDARY_COLOR: '#388E3C',
    ACCENT_COLOR: '#66BB6A',
  },
  EDUCATION: {
    PRIMARY_COLOR: '#9C27B0',
    SECONDARY_COLOR: '#7B1FA2',
    ACCENT_COLOR: '#BA68C8',
  },
  HEALTHCARE: {
    PRIMARY_COLOR: '#FF5722',
    SECONDARY_COLOR: '#E64A19',
    ACCENT_COLOR: '#FF8A65',
  },
  FINANCE: {
    PRIMARY_COLOR: '#FFC107',
    SECONDARY_COLOR: '#FFA000',
    ACCENT_COLOR: '#FFD54F',
  },
  GEORGIA_TECH: {
    PRIMARY_COLOR: '#B3A369',
    SECONDARY_COLOR: '#8D7A4A',
    ACCENT_COLOR: '#D4C285',
  },
};
