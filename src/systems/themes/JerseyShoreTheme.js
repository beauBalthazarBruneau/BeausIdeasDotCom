// Jersey Shore Beach Theme
// Main hub world with beach/boardwalk aesthetic

import {
  WorldTheme,
  ThemedBackground,
  ThemedPlatformRenderer,
  ForegroundEffects,
} from '../WorldTheme.js';
import { PixelText } from '../../utils/PixelText.js';

export class JerseyShoreTheme extends WorldTheme {
  getThemeId() {
    return 'jersey-shore';
  }

  createBackground() {
    return new JerseyShoreBackground(this.canvas, this.dimensions.width, this);
  }

  createPlatformRenderer() {
    return new JerseyShorePlatformRenderer(this);
  }

  createForegroundEffects() {
    return new JerseyShoreForegroundEffects(this);
  }

  getPlatformMaterials() {
    return {
      default: {
        baseColor: '#CD853F',
        surfacePattern: 'wooden_planks',
        edgeStyle: 'weathered',
        texture: 'boardwalk',
      },
      sand: {
        baseColor: '#F4A460',
        surfacePattern: 'grainy',
        edgeStyle: 'soft',
        texture: 'sand',
      },
      boardwalk: {
        baseColor: '#8B7355',
        surfacePattern: 'wooden_planks',
        edgeStyle: 'weathered',
        texture: 'aged_wood',
      },
      pier: {
        baseColor: '#696969',
        surfacePattern: 'concrete',
        edgeStyle: 'worn',
        texture: 'concrete',
      },
    };
  }

  getDecorationTypes() {
    return {
      seagulls: { frequency: 0.3, animated: true },
      umbrellas: { frequency: 0.2, colors: ['#FF6B6B', '#4ECDC4', '#45B7D1'] },
      beachBalls: { frequency: 0.15, animated: true },
      lifeguardStands: { frequency: 0.1 },
      palmTrees: { frequency: 0.25 },
      boardwalkLamps: { frequency: 0.4 },
    };
  }

  getForegroundEffects() {
    return [
      { type: 'seagull_calls', frequency: 0.3 },
      { type: 'wind_particles', intensity: 0.4 },
      { type: 'sun_glare', intensity: 0.5 },
    ];
  }

  getAudioTheme() {
    return {
      ambient: 'ocean_waves',
      music: 'beach_relaxation',
    };
  }
}

class JerseyShoreBackground extends ThemedBackground {
  constructor(canvas, levelWidth, theme) {
    super(canvas, levelWidth, theme);
    this.images = new Map();
    this.pixelText = new PixelText();
    this.preloadImages();
  }

  // Override to use custom 5-layer Jersey Shore system
  async getCustomLayers() {
    // Import responsive utility for mobile/desktop detection
    const { isMobile } = await import('@utils/responsive.js');

    // Responsive text positioning and scaling
    const isMobileDevice = isMobile();
    const textY = isMobileDevice ? 20 : 80;
    const leftSideX = isMobileDevice ? textY : 50; // textX = textY for mobile

    // Scale reduction for mobile (75% smaller)
    const mobileScaleReduction = isMobileDevice ? 0.4 : 1;
    const largeTextScale = 2 * mobileScaleReduction;
    const smallTextScale = 0.75 * mobileScaleReduction;

    return [
      // Sky layer (slowest parallax)
      this.createLayer('sky', 0.1, [
        { type: 'gradient_sky', colors: ['#87CEEB', '#E0F6FF', '#FFE4B5'] },
        { type: 'sun', x: this.levelWidth * 0.8, y: 100, animated: true },
        { type: 'clouds', count: 8, animated: true },
      ]),

      // Distant layer
      this.createLayer('distant', 0.25, [
        // Sprite-based pixel text (responsive)
        { type: 'pixeltext', method: 'sprite', text: 'BEAU', x: leftSideX, y: textY, scale: largeTextScale, color: '#808080', spacing: 12 * mobileScaleReduction },
        { type: 'pixeltext', method: 'sprite', text: 'BRUNEAU', x: leftSideX, y: textY + (150 * mobileScaleReduction), scale: largeTextScale, color: '#808080', spacing: 12 * mobileScaleReduction },
        { type: 'pixeltext', method: 'sprite', text: 'A PERSONAL PORTFOLIO', x: leftSideX, y: textY + (300 * mobileScaleReduction), scale: smallTextScale, color: '#606060', spacing: 6 * mobileScaleReduction },
      ]),

      // Landmarks layer (NEW - for major landmarks)
      this.createLayer('landmarks', 0.35, [
        { type: 'lighthouse', x: this.levelWidth * 0.9, y: 350 },
      ]),

      // Midground beach activities
      this.createLayer('midground', 0.5, [
        { type: 'beach_crowds', density: 0.3 },
        { type: 'pier_structures', count: 3 },
        { type: 'beach_grass', density: 0.4 },
        { type: 'driftwood', count: 5 },
        { type: 'seashells', density: 0.2 },
      ]),

      // Gameplay foreground (same as platforms - no parallax)
      this.createLayer('foreground', 1.0, [
        { type: 'beach_house', x: 400, y: 720, image: '/assets/heritage.png' },
      ])
    ];
  }

  async preloadImages() {
    const imagesToLoad = [{ key: 'beach_house', src: '/assets/heritage.png' }];

    for (const imageData of imagesToLoad) {
      try {
        const img = new Image();
        img.src = imageData.src;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
        this.images.set(imageData.key, img);
        console.log(`Loaded beach house image`);
      } catch (error) {
        console.warn(`Failed to load beach house image:`, error);
      }
    }
  }


  drawSkyBackground(ctx, layer, parallaxX, parallaxY) {
    // Gradient sky from beach blue to sandy yellow
    const gradient = ctx.createLinearGradient(
      0,
      -parallaxY,
      0,
      this.canvas.height - parallaxY
    );
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.6, '#E0F6FF');
    gradient.addColorStop(1, '#FFE4B5');

    ctx.fillStyle = gradient;
    ctx.fillRect(
      -parallaxX,
      -parallaxY,
      this.canvas.width + parallaxX * 2,
      this.canvas.height + parallaxY * 2
    );
  }

  drawElement(ctx, element) {
    switch (element.type) {
      case 'sun':
        this.drawSun(ctx, element);
        break;
      case 'clouds':
        this.drawClouds(ctx, element);
        break;
      case 'ocean_horizon':
        this.drawOceanHorizon(ctx, element);
        break;
      case 'ocean_waves':
        this.drawOceanWaves(ctx, element);
        break;
      case 'lighthouse':
        this.drawLighthouse(ctx, element);
        break;
      case 'beach_house':
        this.drawBeachHouse(ctx, element);
        break;
      case 'pixeltext':
        this.drawPixelText(ctx, element);
        break;
      // Add more element drawing methods as needed
    }
  }

  drawSun(ctx, element) {
    const time = Date.now() * 0.001;
    const pulse = Math.sin(time * 0.5) * 0.1 + 1;

    ctx.save();
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(element.x, element.y, 30 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawClouds(ctx, element) {
    // Simple cloud drawing - can be enhanced
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < element.count; i++) {
      const x =
        (this.levelWidth / element.count) * i +
        Math.sin(Date.now() * 0.0005 + i) * 50;
      const y = 50 + Math.sin(Date.now() * 0.0003 + i) * 20;

      ctx.beginPath();
      ctx.arc(x, y, 25, 0, Math.PI * 2);
      ctx.arc(x + 25, y, 35, 0, Math.PI * 2);
      ctx.arc(x + 50, y, 25, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawOceanHorizon(ctx, element) {
    ctx.fillStyle = '#4682B4';
    ctx.fillRect(0, element.y, this.levelWidth, this.canvas.height - element.y);
  }

  drawOceanWaves(ctx, element) {
    // Removed wave animations for cleaner look
  }

  drawLighthouse(ctx, element) {
    // Simple lighthouse
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(element.x, element.y, 20, 100);

    ctx.fillStyle = '#FF0000';
    ctx.fillRect(element.x, element.y, 20, 20);

    // Light beam
    const time = Date.now() * 0.005;
    if (Math.sin(time) > 0) {
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = '#FFFF00';
      ctx.beginPath();
      ctx.moveTo(element.x + 10, element.y + 10);
      ctx.lineTo(element.x - 100, element.y - 50);
      ctx.lineTo(element.x - 100, element.y + 70);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  drawBeachHouse(ctx, element) {
    const image = this.images.get('beach_house');
    if (image && image.complete) {
      const x = element.x;
      const y = element.y;

      // Scale to 50% size
      const scaledWidth = image.width * 0.5;
      const scaledHeight = image.height * 0.5;

      ctx.save();
      ctx.imageSmoothingEnabled = false; // Keep pixel art crisp

      // Draw image at 50% size with bottom touching the specified y coordinate
      ctx.drawImage(
        image,
        x - scaledWidth / 2, // Center horizontally
        y - scaledHeight, // Position so bottom of scaled image is at y coordinate
        scaledWidth,
        scaledHeight
      );

      ctx.restore();
    } else {
      // Simple fallback if image not loaded
      ctx.fillStyle = '#D2B48C';
      ctx.fillRect(element.x - 20, element.y - 30, 40, 30); // Also scaled down fallback
    }
  }

  drawPixelText(ctx, element) {
    const { text, x, y, color, scale, spacing } = element;
    this.pixelText.drawSpriteText(ctx, text, x, y, scale, color, spacing);
  }


}

class JerseyShorePlatformRenderer extends ThemedPlatformRenderer {
  drawPlatformDetails(ctx, pos, width, height, type, material) {
    switch (material.texture) {
      case 'boardwalk':
        this.drawBoardwalkPlanks(ctx, pos, width, height);
        break;
      case 'sand':
        this.drawSandTexture(ctx, pos, width, height);
        break;
      case 'aged_wood':
        this.drawAgedWood(ctx, pos, width, height);
        break;
      case 'concrete':
        this.drawConcreteTexture(ctx, pos, width, height);
        break;
    }
  }

  drawBoardwalkPlanks(ctx, pos, width, height) {
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 1;

    // Draw vertical plank lines
    for (let x = pos.x - width / 2; x < pos.x + width / 2; x += 15) {
      ctx.beginPath();
      ctx.moveTo(x, pos.y - height / 2);
      ctx.lineTo(x, pos.y + height / 2);
      ctx.stroke();
    }

    // Add weathering marks
    ctx.strokeStyle = 'rgba(101, 67, 33, 0.3)';
    for (let i = 0; i < 3; i++) {
      const x = pos.x - width / 2 + Math.random() * width;
      const y = pos.y - height / 2 + Math.random() * height;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 10, y);
      ctx.stroke();
    }
  }

  drawSandTexture(ctx, pos, width, height) {
    // Add sand grain effect
    ctx.fillStyle = 'rgba(218, 165, 32, 0.3)';
    for (let i = 0; i < 20; i++) {
      const x = pos.x - width / 2 + Math.random() * width;
      const y = pos.y - height / 2 + Math.random() * height;
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawAgedWood(ctx, pos, width, height) {
    // Draw wood grain lines
    ctx.strokeStyle = 'rgba(139, 115, 85, 0.5)';
    ctx.lineWidth = 0.5;

    for (let y = pos.y - height / 2; y < pos.y + height / 2; y += 3) {
      ctx.beginPath();
      ctx.moveTo(pos.x - width / 2, y + Math.sin(y * 0.1) * 2);
      ctx.lineTo(pos.x + width / 2, y + Math.sin(y * 0.1) * 2);
      ctx.stroke();
    }
  }

  drawConcreteTexture(ctx, pos, width, height) {
    // Simple concrete texture with small cracks
    ctx.strokeStyle = 'rgba(85, 85, 85, 0.3)';
    ctx.lineWidth = 1;

    for (let i = 0; i < 5; i++) {
      const startX = pos.x - width / 2 + Math.random() * width;
      const startY = pos.y - height / 2 + Math.random() * height;
      const endX = startX + (Math.random() - 0.5) * 20;
      const endY = startY + (Math.random() - 0.5) * 20;

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }
  }
}

class JerseyShoreForegroundEffects extends ForegroundEffects {
  constructor(theme) {
    super(theme);
    this.windParticles = [];
    this.initializeEffects();
  }

  initializeEffects() {
    // Initialize wind particles (sand/salt in the air)
    for (let i = 0; i < 30; i++) {
      this.windParticles.push({
        x: -10,
        y: Math.random() * 400,
        vx: 1 + Math.random() * 2,
        vy: Math.random() * 0.5 - 0.25,
        life: Math.random() * 120,
        maxLife: 120,
      });
    }
  }

  update(deltaTime) {
    super.update(deltaTime);

    // Update wind particles
    this.windParticles.forEach((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life--;

      if (particle.life <= 0 || particle.x > 850) {
        particle.x = -10;
        particle.y = Math.random() * 400;
        particle.life = particle.maxLife;
      }
    });
  }

  draw(ctx, camera) {
    super.draw(ctx, camera);

    // Draw wind particles (sand/salt in the air)
    ctx.fillStyle = 'rgba(244, 164, 96, 0.4)';
    this.windParticles.forEach((particle) => {
      const alpha = particle.life / particle.maxLife;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(particle.x - camera.x, particle.y - camera.y, 1, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalAlpha = 1;
  }
}
