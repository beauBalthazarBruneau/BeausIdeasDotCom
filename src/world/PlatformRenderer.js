// PlatformRenderer - Handles rendering of all platform types with theme integration
// Works with both the existing platform system and the new enhanced features

import { PLATFORM_TYPES } from './PlatformTypes.js';

export class PlatformRenderer {
  constructor(game, worldTheme = null) {
    this.game = game;
    this.worldTheme = worldTheme;
    this.debugMode = false;
  }

  setDebugMode(enabled) {
    this.debugMode = enabled;
  }

  setWorldTheme(theme) {
    this.worldTheme = theme;
  }

  // Main rendering method for a platform
  renderPlatform(ctx, platform) {
    if (!platform.visible && !this.debugMode) {
      return; // Skip invisible platforms unless in debug mode
    }

    const { body, data, config, animationState } = platform;
    const pos = body.position;
    const { width, height, type } = data;

    ctx.save();

    // Apply platform transformations
    ctx.translate(pos.x, pos.y);

    // Apply rotation if present
    if (platform.currentRotation !== 0) {
      ctx.rotate(platform.currentRotation);
    }

    // Apply scaling for pulsing platforms
    if (animationState.pulsing) {
      const scale = animationState.pulsing.currentScale;
      ctx.scale(scale, scale);
    }

    // Handle invisible platforms in debug mode
    if (!platform.visible && this.debugMode) {
      this.renderDebugInvisiblePlatform(ctx, width, height, platform);
    } else {
      // Normal platform rendering
      this.renderPlatformBody(ctx, width, height, type, platform);
      this.renderPlatformDetails(ctx, width, height, type, platform);
    }

    ctx.restore();
  }

  renderPlatformBody(ctx, width, height, type, platform) {
    // Use world theme if available, otherwise use default styling
    if (this.worldTheme && this.worldTheme.getPlatformMaterials) {
      const materials = this.worldTheme.getPlatformMaterials();
      const material = materials[type] || materials.default;

      if (material) {
        ctx.fillStyle =
          material.baseColor || this.getDefaultPlatformColor(type);
      } else {
        ctx.fillStyle = this.getDefaultPlatformColor(type);
      }
    } else {
      ctx.fillStyle = this.getDefaultPlatformColor(type);
    }

    // Draw platform rectangle
    ctx.fillRect(-width / 2, -height / 2, width, height);

    // Add breakable platform visual state
    if (platform.animationState.breakable) {
      this.renderBreakableState(ctx, width, height, platform);
    }
  }

  renderPlatformDetails(ctx, width, height, type, platform) {
    // Use world theme renderer if available
    if (this.worldTheme && this.worldTheme.createPlatformRenderer) {
      const renderer = this.worldTheme.createPlatformRenderer();
      if (renderer.drawPlatformDetails) {
        const material = this.worldTheme.getPlatformMaterials()[type];
        renderer.drawPlatformDetails(
          ctx,
          { x: 0, y: 0 },
          width,
          height,
          type,
          material
        );
        return;
      }
    }

    // Default platform details rendering
    this.renderDefaultPlatformDetails(ctx, width, height, type, platform);
  }

  getDefaultPlatformColor(type) {
    switch (type) {
      case PLATFORM_TYPES.GRASS:
        return '#8B4513'; // Brown base
      case PLATFORM_TYPES.STONE:
        return '#708090'; // Slate gray
      case PLATFORM_TYPES.ROAD:
        return '#404040'; // Dark gray asphalt
      case PLATFORM_TYPES.FLOATING:
        return '#DDA0DD'; // Plum - magical floating platforms
      case PLATFORM_TYPES.CHECKPOINT:
        return '#FFD700'; // Gold - special checkpoint platforms
      case PLATFORM_TYPES.VICTORY:
        return '#98FB98'; // Pale green - victory platform

      // World-specific defaults
      case PLATFORM_TYPES.ACADEMIC_GROUND:
      case PLATFORM_TYPES.ACADEMIC_FLOATING:
        return '#B3A369'; // Georgia Tech gold
      case PLATFORM_TYPES.MEDICAL_GROUND:
      case PLATFORM_TYPES.MEDICAL_FLOATING:
        return '#E0E0E0'; // Clean medical white/gray
      case PLATFORM_TYPES.TECH_GROUND:
      case PLATFORM_TYPES.TECH_FLOATING:
        return '#2F4F4F'; // Dark slate gray - tech theme

      // Enhanced platform types
      case PLATFORM_TYPES.INVISIBLE:
        return 'rgba(255, 255, 255, 0.1)'; // Nearly transparent
      case PLATFORM_TYPES.ROTATING:
      case PLATFORM_TYPES.MOVING:
      case PLATFORM_TYPES.ANIMATED:
        return '#9370DB'; // Medium slate blue for special platforms
      case PLATFORM_TYPES.BREAKABLE:
        return '#CD853F'; // Peru - earthy breakable color
      case PLATFORM_TYPES.CONDITIONAL:
        return '#20B2AA'; // Light sea green

      default:
        return '#8B4513'; // Default brown
    }
  }

  renderDefaultPlatformDetails(ctx, width, height, type, platform) {
    switch (type) {
      case PLATFORM_TYPES.GRASS:
        this.renderGrassDetails(ctx, width, height);
        break;
      case PLATFORM_TYPES.STONE:
        this.renderStoneDetails(ctx, width, height);
        break;
      case PLATFORM_TYPES.ROAD:
        this.renderRoadDetails(ctx, width, height);
        break;
      case PLATFORM_TYPES.FLOATING:
        this.renderFloatingDetails(ctx, width, height);
        break;
      case PLATFORM_TYPES.CHECKPOINT:
        this.renderCheckpointDetails(ctx, width, height);
        break;
      case PLATFORM_TYPES.VICTORY:
        this.renderVictoryDetails(ctx, width, height);
        break;
      case PLATFORM_TYPES.BREAKABLE:
        this.renderBreakableDetails(ctx, width, height, platform);
        break;
      case PLATFORM_TYPES.ROTATING:
      case PLATFORM_TYPES.MOVING:
      case PLATFORM_TYPES.ANIMATED:
        this.renderAnimatedDetails(ctx, width, height, platform);
        break;
    }
  }

  renderGrassDetails(ctx, width, height) {
    // Draw grass on top
    ctx.fillStyle = '#228B22'; // Forest green grass
    ctx.fillRect(-width / 2, -height / 2 - 5, width, 10);

    // Add some grass blades
    ctx.fillStyle = '#32CD32'; // Lime green highlights
    for (let i = 0; i < width / 20; i++) {
      const grassX = -width / 2 + i * 20 + Math.random() * 10;
      ctx.fillRect(grassX, -height / 2 - 7, 2, 4);
    }
  }

  renderStoneDetails(ctx, width, height) {
    // Draw stone texture lines
    ctx.strokeStyle = '#2F4F4F'; // Dark slate gray
    ctx.lineWidth = 2;
    ctx.beginPath();
    // Horizontal lines
    ctx.moveTo(-width / 2, -height / 6);
    ctx.lineTo(width / 2, -height / 6);
    ctx.moveTo(-width / 2, height / 6);
    ctx.lineTo(width / 2, height / 6);
    ctx.stroke();
  }

  renderRoadDetails(ctx, width, height) {
    // Lane divider (dashed yellow line)
    ctx.fillStyle = '#f4e66a'; // Faded yellow
    const dashWidth = 20;
    const gapWidth = 16;
    for (
      let xPos = -width / 2 + 10;
      xPos < width / 2 - 10;
      xPos += dashWidth + gapWidth
    ) {
      ctx.fillRect(xPos, -2, dashWidth, 4);
    }

    // Side stripes (white)
    ctx.fillStyle = '#e9e9e9';
    ctx.fillRect(-width / 2 + 6, -height / 2 + 10, width - 12, 2);
    ctx.fillRect(-width / 2 + 6, height / 2 - 12, width - 12, 2);
  }

  renderFloatingDetails(ctx, width, height) {
    // Add magical sparkle effect
    ctx.fillStyle = '#E6E6FA'; // Lavender sparkles
    for (let i = 0; i < 6; i++) {
      const sparkleX = -width / 3 + Math.random() * ((width * 2) / 3);
      const sparkleY = -height / 3 + Math.random() * ((height * 2) / 3);
      ctx.fillRect(sparkleX, sparkleY, 3, 3);
    }
  }

  renderCheckpointDetails(ctx, width, height) {
    // Draw special checkpoint border
    ctx.strokeStyle = '#FF6347'; // Tomato red border
    ctx.lineWidth = 3;
    ctx.strokeRect(-width / 2, -height / 2, width, height);

    // Add corner decorations
    ctx.fillStyle = '#FF6347';
    const cornerSize = 8;
    // Corner rectangles
    ctx.fillRect(-width / 2, -height / 2, cornerSize, cornerSize);
    ctx.fillRect(width / 2 - cornerSize, -height / 2, cornerSize, cornerSize);
    ctx.fillRect(-width / 2, height / 2 - cornerSize, cornerSize, cornerSize);
    ctx.fillRect(
      width / 2 - cornerSize,
      height / 2 - cornerSize,
      cornerSize,
      cornerSize
    );
  }

  renderVictoryDetails(ctx, width, height) {
    // Draw victory platform with special effects
    ctx.strokeStyle = '#00FF00'; // Bright green border
    ctx.lineWidth = 4;
    ctx.strokeRect(-width / 2, -height / 2, width, height);

    // Add victory stars
    ctx.fillStyle = '#FFFF00'; // Yellow stars
    this.drawStar(ctx, -width / 3, 0, 8);
    this.drawStar(ctx, 0, 0, 10);
    this.drawStar(ctx, width / 3, 0, 8);
  }

  renderBreakableDetails(ctx, width, height, platform) {
    if (!platform.animationState.breakable) return;

    const breakable = platform.animationState.breakable;
    const damageRatio = breakable.currentHits / breakable.maxHits;

    // Add cracks based on damage
    if (damageRatio > 0) {
      ctx.strokeStyle = '#8B4513';
      ctx.lineWidth = 2;
      ctx.globalAlpha = damageRatio;

      ctx.beginPath();
      // Simple crack pattern
      for (let i = 0; i < breakable.currentHits; i++) {
        const startX = -width / 2 + Math.random() * width;
        const startY = -height / 2 + Math.random() * height;
        const endX = startX + (Math.random() - 0.5) * 30;
        const endY = startY + (Math.random() - 0.5) * 30;

        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  renderAnimatedDetails(ctx, width, height, platform) {
    // Add animated platform indicators
    ctx.strokeStyle = '#9370DB';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(-width / 2, -height / 2, width, height);
    ctx.setLineDash([]);

    // Add movement indicators
    if (platform.animationState.movement) {
      const movement = platform.animationState.movement;
      ctx.fillStyle = '#9370DB';

      switch (movement.pattern) {
        case 'horizontal':
          // Arrow pointing left-right
          this.drawArrow(ctx, -10, 0, 0, 0);
          this.drawArrow(ctx, 10, 0, 0, 0);
          break;
        case 'vertical':
          // Arrow pointing up-down
          this.drawArrow(ctx, 0, -10, Math.PI / 2, 0);
          this.drawArrow(ctx, 0, 10, -Math.PI / 2, 0);
          break;
        case 'circular':
          // Circular indicator
          ctx.beginPath();
          ctx.arc(0, 0, 8, 0, Math.PI * 2);
          ctx.stroke();
          break;
      }
    }
  }

  renderBreakableState(ctx, width, height, platform) {
    const breakable = platform.animationState.breakable;
    const damageRatio = breakable.currentHits / breakable.maxHits;

    // Darken platform based on damage
    if (damageRatio > 0) {
      ctx.fillStyle = `rgba(0, 0, 0, ${damageRatio * 0.3})`;
      ctx.fillRect(-width / 2, -height / 2, width, height);
    }
  }

  renderDebugInvisiblePlatform(ctx, width, height, platform) {
    // Render invisible platform with debug styling
    ctx.fillStyle = 'rgba(255, 0, 255, 0.3)'; // Semi-transparent magenta
    ctx.fillRect(-width / 2, -height / 2, width, height);

    // Debug border
    ctx.strokeStyle = '#FF00FF';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 5]);
    ctx.strokeRect(-width / 2, -height / 2, width, height);
    ctx.setLineDash([]);

    // Debug text
    ctx.fillStyle = '#FF00FF';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('INVISIBLE', 0, 0);

    // Discovery state
    if (platform.animationState.invisible?.discovered) {
      ctx.fillText('DISCOVERED', 0, 15);
    }
  }

  // Helper drawing methods
  drawStar(ctx, x, y, size) {
    const spikes = 5;
    const outerRadius = size;
    const innerRadius = size * 0.5;
    let rotation = (Math.PI / 2) * 3;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(x, y - outerRadius);

    for (let i = 0; i < spikes; i++) {
      let x1 = x + Math.cos(rotation) * outerRadius;
      let y1 = y + Math.sin(rotation) * outerRadius;
      ctx.lineTo(x1, y1);
      rotation += step;

      x1 = x + Math.cos(rotation) * innerRadius;
      y1 = y + Math.sin(rotation) * innerRadius;
      ctx.lineTo(x1, y1);
      rotation += step;
    }

    ctx.lineTo(x, y - outerRadius);
    ctx.closePath();
    ctx.fill();
  }

  drawArrow(ctx, x, y, rotation, size = 8) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    ctx.beginPath();
    ctx.moveTo(-size, -size / 2);
    ctx.lineTo(0, 0);
    ctx.lineTo(-size, size / 2);
    ctx.stroke();

    ctx.restore();
  }

  // Batch rendering method for performance
  renderPlatforms(ctx, platforms) {
    for (const platform of platforms) {
      this.renderPlatform(ctx, platform);
    }
  }
}
