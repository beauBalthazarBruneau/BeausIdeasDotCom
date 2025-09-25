// Core World Theming System
// Base classes for world-specific visual themes

export class WorldTheme {
  constructor(canvas, dimensions) {
    this.canvas = canvas;
    this.dimensions = dimensions;
    this.id = this.getThemeId();
  }

  getThemeId() {
    return 'default';
  }

  createBackground() {
    return new ThemedBackground(this.canvas, this.dimensions.width, this);
  }

  createPlatformRenderer() {
    return new ThemedPlatformRenderer(this);
  }

  createForegroundEffects() {
    return new ForegroundEffects(this);
  }

  // Override in specific themes
  getPlatformMaterials() {
    return {
      default: {
        baseColor: '#8B4513',
        surfacePattern: 'none',
        edgeStyle: 'simple',
      },
    };
  }

  getDecorationTypes() {
    return {};
  }

  getForegroundEffects() {
    return [];
  }

  getAudioTheme() {
    return {
      ambient: null,
      music: null,
    };
  }
}

export class ThemedBackground {
  constructor(canvas, levelWidth, theme) {
    this.canvas = canvas;
    this.levelWidth = levelWidth;
    this.theme = theme;
    this.layers = [];
    this.layersReady = false;
    this.initializeLayers();
  }

  async initializeLayers() {
    this.layers = await this.createThemedLayers();
    this.layersReady = true;
  }

  async createThemedLayers() {
    // Default 4-layer system that themes can override
    const defaultLayers = [
      this.createSkyLayer(),
      this.createDistantLayer(),
      this.createMidgroundLayer(),
      this.createNeargroundLayer(),
    ];

    // Allow themes to add more layers or customize
    const customLayers = await this.getCustomLayers();
    return customLayers.length > 0 ? customLayers : defaultLayers;
  }

  // Override this in themes to define custom layer structure
  async getCustomLayers() {
    return [];
  }

  // Flexible layer factory method
  createLayer(name, scrollSpeed, elements = [], options = {}) {
    return {
      name,
      scrollSpeed,
      elements,
      hasBackground: options.hasBackground || false,
      backgroundColor: options.backgroundColor || null,
      gradient: options.gradient || null,
      ...options
    };
  }

  createSkyLayer() {
    return {
      name: 'sky',
      scrollSpeed: 0.1,
      elements: [],
    };
  }

  createDistantLayer() {
    return {
      name: 'distant',
      scrollSpeed: 0.3,
      elements: [],
    };
  }

  createMidgroundLayer() {
    return {
      name: 'midground',
      scrollSpeed: 0.5,
      elements: [],
    };
  }

  createNeargroundLayer() {
    return {
      name: 'nearground',
      scrollSpeed: 0.7,
      elements: [],
    };
  }

  draw(ctx, camera) {
    if (!this.layersReady) return;

    this.layers.forEach((layer) => {
      this.drawLayer(ctx, layer, camera);
    });
  }

  drawLayer(ctx, layer, camera) {
    ctx.save();

    // Calculate parallax offset
    const parallaxX = camera.x * layer.scrollSpeed;
    const parallaxY = camera.y * layer.scrollSpeed * 0.5;

    // Apply parallax transform
    ctx.translate(-parallaxX, -parallaxY);

    // Draw layer background based on layer configuration
    if (layer.name === 'sky') {
      // Sky layer always has background
      this.drawSkyBackground(ctx, layer, parallaxX, parallaxY);
    } else if (layer.hasBackground) {
      // Custom layer backgrounds
      this.drawLayerBackground(ctx, layer, parallaxX, parallaxY);
    }

    // Draw all elements in this layer
    layer.elements.forEach((element) => {
      this.drawElement(ctx, element);
    });

    ctx.restore();
  }

  // Generic layer background renderer
  drawLayerBackground(ctx, layer, parallaxX, parallaxY) {
    const width = this.canvas.width + parallaxX * 2;
    const height = this.canvas.height + parallaxY * 2;

    if (layer.gradient) {
      // Gradient background
      const gradient = ctx.createLinearGradient(0, -parallaxY, 0, height - parallaxY);
      layer.gradient.forEach((stop, index) => {
        gradient.addColorStop(stop.position || index / (layer.gradient.length - 1), stop.color);
      });
      ctx.fillStyle = gradient;
    } else if (layer.backgroundColor) {
      // Solid color background
      ctx.fillStyle = layer.backgroundColor;
    }

    ctx.fillRect(-parallaxX, -parallaxY, width, height);
  }

  drawSkyBackground(ctx, layer, parallaxX, parallaxY) {
    // Default sky - override in specific themes
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(
      -parallaxX,
      -parallaxY,
      this.canvas.width + parallaxX * 2,
      this.canvas.height + parallaxY * 2
    );
  }

  drawElement(ctx, element) {
    // Override in specific theme backgrounds
  }

  update(deltaTime) {
    // Update animated elements
    this.layers.forEach((layer) => {
      layer.elements.forEach((element) => {
        if (element.update) {
          element.update(deltaTime);
        }
      });
    });
  }

  resize(canvas) {
    this.canvas = canvas;
  }
}

export class ThemedPlatformRenderer {
  constructor(theme) {
    this.theme = theme;
    this.materials = theme.getPlatformMaterials();
  }

  renderPlatform(ctx, platform) {
    const { body, data } = platform;
    const pos = body.position;
    const { width, height, type } = data;

    const material = this.materials[type] || this.materials.default;

    ctx.save();

    // Set base style
    ctx.fillStyle = material.baseColor;
    ctx.fillRect(pos.x - width / 2, pos.y - height / 2, width, height);

    // Draw platform details
    this.drawPlatformDetails(ctx, pos, width, height, type, material);

    ctx.restore();
  }

  drawPlatformDetails(ctx, pos, width, height, type, material) {
    // Override in specific theme renderers
  }
}

export class ForegroundEffects {
  constructor(theme) {
    this.theme = theme;
    this.effects = theme.getForegroundEffects();
    this.particles = [];
  }

  update(deltaTime) {
    this.effects.forEach((effect) => {
      if (effect.update) {
        effect.update(deltaTime);
      }
    });
  }

  draw(ctx, camera) {
    this.effects.forEach((effect) => {
      if (effect.draw) {
        effect.draw(ctx, camera);
      }
    });
  }
}

export class WorldThemeFactory {
  static async create(worldId, canvas, dimensions) {
    try {
      // Only load Jersey Shore theme for now, use default for others
      if (worldId === 'main-hub') {
        const { JerseyShoreTheme } = await import(
          './themes/JerseyShoreTheme.js'
        );
        return new JerseyShoreTheme(canvas, dimensions);
      }

      // TODO: Add other theme imports as they are created
      // 'georgia-tech': UrbanAtlantaTheme,
      // 'healthcare': UndergroundCaveTheme,
      // 'vibe-coding': TechnoBinaryTheme

      console.log(`Theme not implemented for ${worldId}, using default`);
      return new WorldTheme(canvas, dimensions);
    } catch (error) {
      console.warn(`Failed to load theme for ${worldId}:`, error);
      return new WorldTheme(canvas, dimensions);
    }
  }
}
