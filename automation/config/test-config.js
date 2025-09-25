// Global test configuration
export const DEFAULT_CONFIG = {
  baseUrl: 'http://localhost:5173',
  headless: false,
  slowMo: 200,
  enableVideo: true,
  enablePositionTracking: true,
  cleanupAfter: true,
  screenshots: {
    quality: 90,
    fullPage: false,
  },
  positioning: {
    tolerance: 20,
    maxAttempts: 15,
    movementTimeout: 1500,
  },
  performance: {
    trackFPS: true,
    trackMemory: true,
    errorThreshold: 2,
  },
};

export const TEST_SCENARIOS = {
  basic: {
    description: 'Basic game functionality test',
    duration: 30000, // 30 seconds
    actions: ['load', 'movement', 'debug'],
  },
  mysteryBox: {
    description: 'Mystery box interaction test',
    duration: 60000, // 1 minute
    actions: ['load', 'navigate', 'hit', 'collect', 'verify'],
  },
  performance: {
    description: 'Extended performance test',
    duration: 120000, // 2 minutes
    actions: ['load', 'extended_gameplay', 'performance_analysis'],
  },
  comprehensive: {
    description: 'Full feature test suite',
    duration: 300000, // 5 minutes
    actions: ['load', 'movement', 'mysterybox', 'worlds', 'performance'],
  },
};
