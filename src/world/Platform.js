// Simple Platform system for JSON-based worlds
import { Bodies } from 'matter-js';

/**
 * Create a platform physics body
 */
export function createPlatform(platformData) {
  const { x, y, width, height } = platformData;

  return Bodies.rectangle(x, y, width, height, {
    label: 'platform',
    isStatic: true,
    friction: 0.8,
    restitution: 0.1,
  });
}

/**
 * Get platform style based on type and world
 */
export function getPlatformStyle(type, worldId) {
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
  return worldStyles[type] || worldStyles.default || '#708090';
}

/**
 * Draw a platform
 */
export function drawPlatform(ctx, platform, worldId) {
  const { body, data } = platform;
  const pos = body.position;
  const { width, height, type } = data;

  ctx.save();
  ctx.fillStyle = getPlatformStyle(type, worldId);
  ctx.fillRect(pos.x - width / 2, pos.y - height / 2, width, height);
  ctx.restore();
}
