// Background - Generic renderer that draws backgrounds from JSON config
// Fully data-driven approach - no world-specific code needed

import { PixelText } from './PixelText.js';

export class Background {
  constructor(canvas, dimensions, backgroundConfig, worldId) {
    this.canvas = canvas;
    this.dimensions = dimensions;
    this.config = backgroundConfig;
    this.worldId = worldId; // Used to prefix asset paths
    this.pixelText = new PixelText();
    this.images = new Map();
    this.isMobile = false;

    this.preloadImages();
    this.detectMobile();
  }

  async detectMobile() {
    const { isTouchDevice } = await import('@utils/responsive.js');
    this.isMobile = isTouchDevice();
  }

  async preloadImages() {
    if (!this.config || !this.config.layers) return;

    // Find all image elements and preload them
    for (const layer of this.config.layers) {
      for (const element of layer.elements) {
        if (element.type === 'image' && element.src) {
          try {
            // Auto-prefix asset paths with world directory
            const fullPath = `/src/data/worlds/${this.worldId}/assets/${element.src}`;
            const img = new Image();
            img.src = fullPath;
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
            });
            this.images.set(element.src, img);
            console.log(`Loaded background image: ${fullPath}`);
          } catch (error) {
            console.warn(`Failed to load background image ${element.src}:`, error);
          }
        }
      }
    }
  }

  draw(ctx, camera) {
    if (!this.config) return;

    // Draw sky background
    this.drawSky(ctx, camera);

    // Draw all layers
    if (this.config.layers) {
      this.config.layers.forEach((layer) => {
        this.drawLayer(ctx, layer, camera);
      });
    }
  }

  drawSky(ctx, camera) {
    if (!this.config.sky) return;

    const parallaxX = camera.x * 0.1;
    const parallaxY = camera.y * 0.05;

    if (this.config.sky.type === 'gradient') {
      const gradient = ctx.createLinearGradient(
        0,
        -parallaxY,
        0,
        this.canvas.height - parallaxY
      );
      this.config.sky.colors.forEach((color, index) => {
        gradient.addColorStop(index / (this.config.sky.colors.length - 1), color);
      });
      ctx.fillStyle = gradient;
    } else {
      ctx.fillStyle = this.config.sky.color || '#87CEEB';
    }

    ctx.fillRect(
      -parallaxX,
      -parallaxY,
      this.canvas.width + parallaxX * 2,
      this.canvas.height + parallaxY * 2
    );
  }

  drawLayer(ctx, layer, camera) {
    ctx.save();

    // Calculate parallax offset
    const parallaxX = camera.x * layer.scrollSpeed;
    const parallaxY = camera.y * layer.scrollSpeed * 0.5;

    // Apply parallax transform
    ctx.translate(-parallaxX, -parallaxY);

    // Draw all elements in this layer
    layer.elements.forEach((element) => {
      this.drawElement(ctx, element);
    });

    ctx.restore();
  }

  drawElement(ctx, element) {
    switch (element.type) {
      case 'sun':
        this.drawSun(ctx, element);
        break;
      case 'clouds':
        this.drawClouds(ctx, element);
        break;
      case 'lighthouse':
        this.drawLighthouse(ctx, element);
        break;
      case 'image':
        this.drawImage(ctx, element);
        break;
      case 'pixeltext':
        this.drawPixelText(ctx, element);
        break;
    }
  }

  drawSun(ctx, element) {
    const time = element.animated ? Date.now() * 0.001 : 0;
    const pulse = element.animated ? Math.sin(time * 0.5) * 0.1 + 1 : 1;

    ctx.save();
    ctx.shadowColor = element.color || '#FFD700';
    ctx.shadowBlur = 20;
    ctx.fillStyle = element.color || '#FFD700';
    ctx.beginPath();
    ctx.arc(element.x, element.y, (element.size || 30) * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawClouds(ctx, element) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    const count = element.count || 5;
    const levelWidth = this.dimensions.width;

    for (let i = 0; i < count; i++) {
      const baseX = (levelWidth / count) * i;
      const x = element.animated
        ? baseX + Math.sin(Date.now() * 0.0005 + i) * 50
        : baseX;
      const y = element.animated
        ? 50 + Math.sin(Date.now() * 0.0003 + i) * 20
        : 50 + i * 10;

      ctx.beginPath();
      ctx.arc(x, y, 25, 0, Math.PI * 2);
      ctx.arc(x + 25, y, 35, 0, Math.PI * 2);
      ctx.arc(x + 50, y, 25, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawLighthouse(ctx, element) {
    // Simple lighthouse
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(element.x, element.y, 20, 100);

    ctx.fillStyle = '#FF0000';
    ctx.fillRect(element.x, element.y, 20, 20);

    // Light beam animation
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

  drawImage(ctx, element) {
    const image = this.images.get(element.src);
    if (image && image.complete) {
      const scale = element.scale || 1;
      const scaledWidth = image.width * scale;
      const scaledHeight = image.height * scale;

      ctx.save();
      ctx.imageSmoothingEnabled = false;

      ctx.drawImage(
        image,
        element.x - scaledWidth / 2,
        element.y - scaledHeight,
        scaledWidth,
        scaledHeight
      );

      ctx.restore();
    }
  }

  drawPixelText(ctx, element) {
    // Support mobile positioning
    const x = this.isMobile && element.mobileX !== undefined ? element.mobileX : element.x;
    const y = this.isMobile && element.mobileY !== undefined ? element.mobileY : element.y;
    const scale = this.isMobile && element.mobileScale !== undefined
      ? element.scale * element.mobileScale
      : element.scale || 1;
    const spacing = element.spacing || 8;

    this.pixelText.drawSpriteText(
      ctx,
      element.text,
      x,
      y,
      scale,
      element.color || '#FFFFFF',
      spacing
    );
  }

  update(deltaTime) {
    // Update animated elements if needed in the future
  }

  resize(canvas) {
    this.canvas = canvas;
  }
}
