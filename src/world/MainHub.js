// MainHub - The main world that serves as the hub for world transitions
// This is the original level adapted to work with the world system

import { Bodies } from 'matter-js';

export class MainHub {
  constructor(physics) {
    this.physics = physics;
    this.platforms = new Map();
    this.boundaries = new Map();
    this.decorativeElements = [];
    this.checkpointAreas = [];

    // Level dimensions - expanded to accommodate door positions
    this.width = 3500; // Increased width for door spacing
    this.height = 1200;
    this.groundLevel = 650; // Platform centers at 650

    // Hub level data with sections for different doors
    this.levelData = {
      // Starting area - tutorial/intro with basic ground
      startingArea: {
        platforms: [
          {
            id: 'start-ground',
            x: 0,
            y: this.groundLevel,
            width: 800,
            height: 60,
            type: 'road',
          },
        ],
        decorations: [],
      },

      // World doors area - where entry doors are located
      worldDoorsArea: {
        platforms: [
          {
            id: 'doors-ground',
            x: 800,
            y: this.groundLevel,
            width: 1200,
            height: 60,
            type: 'road',
          },
        ],
        decorations: [],
      },

      // Elevated section - jumping challenges
      elevatedSection: {
        platforms: [
          {
            id: 'elevated-ground',
            x: 2100,
            y: this.groundLevel,
            width: 500,
            height: 60,
            type: 'road',
          },
        ],
        decorations: [
          { type: 'cloud', x: 2200, y: this.groundLevel - 300 },
          { type: 'cloud', x: 2400, y: this.groundLevel - 320 },
        ],
      },

      // Canyon crossing - challenging platforming
      canyonCrossing: {
        platforms: [
          {
            id: 'canyon-ground',
            x: 2700,
            y: this.groundLevel,
            width: 400,
            height: 60,
            type: 'road',
          },
        ],
        decorations: [],
      },

      // Victory area - final destination
      victoryArea: {
        platforms: [
          {
            id: 'victory-ground',
            x: 3200,
            y: this.groundLevel,
            width: 400,
            height: 60,
            type: 'victory',
          },
        ],
        decorations: [
          { type: 'flag', x: 3350, y: this.groundLevel - 180 },
          { type: 'tree', x: 3150, y: this.groundLevel - 60 },
          { type: 'tree', x: 3450, y: this.groundLevel - 60 },
        ],
      },
    };

    this.createLevel();
    this.createBoundaries();
    this.createDecorations();
  }

  createDecorations() {
    // Create decorative elements from level data
    Object.values(this.levelData).forEach((area) => {
      if (area.decorations) {
        area.decorations.forEach((decoration) => {
          this.decorativeElements.push(decoration);
        });
      }
    });
  }

  createLevel() {
    // Create all platforms from level data
    Object.values(this.levelData).forEach((area) => {
      area.platforms.forEach((platformData) => {
        this.createPlatform(platformData);
      });

      // Store checkpoint areas for later use
      if (area.checkpoint) {
        this.checkpointAreas.push(area.checkpoint);
      }
    });
  }

  createPlatform(data) {
    const { id, x, y, width, height, type } = data;

    // Create Matter.js body
    const body = Bodies.rectangle(x, y, width, height, {
      label: 'platform',
      isStatic: true,
      friction: 0.3,
      frictionStatic: 0.2,
      restitution: 0,
    });

    // Store platform with its data
    this.platforms.set(id, {
      body: body,
      data: data,
    });

    // Add to physics world
    this.physics.addBody(id, body);
  }

  createBoundaries() {
    // Left boundary
    const leftWall = Bodies.rectangle(-50, this.height / 2, 100, this.height, {
      label: 'boundary',
      isStatic: true,
      render: { visible: false },
    });

    // Right boundary
    const rightWall = Bodies.rectangle(
      this.width + 50,
      this.height / 2,
      100,
      this.height,
      {
        label: 'boundary',
        isStatic: true,
        render: { visible: false },
      }
    );

    // Top boundary (ceiling)
    const ceiling = Bodies.rectangle(this.width / 2, -50, this.width * 2, 100, {
      label: 'boundary',
      isStatic: true,
      render: { visible: false },
    });

    // Bottom boundary (death zone - but higher than our death Y)
    const floor = Bodies.rectangle(
      this.width / 2,
      this.groundLevel + 400,
      this.width * 2,
      100,
      {
        label: 'boundary',
        isStatic: true,
        render: { visible: false },
      }
    );

    // Add boundaries to physics
    this.boundaries.set('left', leftWall);
    this.boundaries.set('right', rightWall);
    this.boundaries.set('top', ceiling);
    this.boundaries.set('bottom', floor);

    this.physics.addBody('boundary-left', leftWall);
    this.physics.addBody('boundary-right', rightWall);
    this.physics.addBody('boundary-top', ceiling);
    this.physics.addBody('boundary-bottom', floor);
  }

  draw(ctx) {
    // First draw decorative background elements (so platforms appear on top)
    this.drawDecorations(ctx, 'background');

    // Draw platforms with different styles based on type
    this.platforms.forEach((platform, id) => {
      const { body, data } = platform;
      const pos = body.position;
      const { width, height, type } = data;

      ctx.save();

      // Set style based on platform type
      this.setPlatformStyle(ctx, type);

      // Draw platform
      ctx.fillRect(pos.x - width / 2, pos.y - height / 2, width, height);

      // Draw platform details/decorations
      this.drawPlatformDetails(ctx, pos, width, height, type);

      ctx.restore();
    });

    // Draw foreground decorative elements (on top of platforms)
    this.drawDecorations(ctx, 'foreground');
  }

  drawDecorations(ctx, layer) {
    this.decorativeElements.forEach((decoration) => {
      const { type, x, y } = decoration;

      // Check if the decoration should be drawn in the current layer
      const isBackground = [
        'cloud',
        'bridge_support',
        'distant_mountain',
      ].includes(type);

      if (
        (layer === 'background' && isBackground) ||
        (layer === 'foreground' && !isBackground)
      ) {
        ctx.save();

        switch (type) {
          case 'tree':
            this.drawTree(ctx, x, y);
            break;
          case 'bush':
            this.drawBush(ctx, x, y);
            break;
          case 'cloud':
            this.drawCloud(ctx, x, y);
            break;
          case 'pillar':
            this.drawPillar(ctx, x, y);
            break;
          case 'bridge_support':
            this.drawBridgeSupport(ctx, x, y);
            break;
          case 'flag':
            this.drawFlag(ctx, x, y);
            break;
          case 'street_lamp':
            this.drawStreetLamp(ctx, x, y);
            break;
          case 'road_sign':
            this.drawRoadSign(ctx, x, y);
            break;
          case 'traffic_cone':
            this.drawTrafficCone(ctx, x, y);
            break;
        }

        ctx.restore();
      }
    });
  }

  setPlatformStyle(ctx, type) {
    switch (type) {
      case 'road':
        ctx.fillStyle = '#404040'; // Dark gray asphalt base
        break;
      case 'grass':
        ctx.fillStyle = '#8B4513'; // Brown base
        break;
      case 'stone':
        ctx.fillStyle = '#708090'; // Slate gray
        break;
      case 'floating':
        ctx.fillStyle = '#DDA0DD'; // Plum - magical floating platforms
        break;
      case 'checkpoint':
        ctx.fillStyle = '#FFD700'; // Gold - special checkpoint platforms
        break;
      case 'victory':
        ctx.fillStyle = '#98FB98'; // Pale green - victory platform
        break;
      default:
        ctx.fillStyle = '#8B4513';
    }
  }

  drawPlatformDetails(ctx, pos, width, height, type) {
    const { x, y } = pos;

    switch (type) {
      case 'road':
        this.drawPixelArtRoad(ctx, x, y, width, height);
        break;
        
      case 'grass':
        // Draw grass on top
        ctx.fillStyle = '#228B22'; // Forest green grass
        ctx.fillRect(x - width / 2, y - height / 2 - 5, width, 10);

        // Add some grass blades
        ctx.fillStyle = '#32CD32'; // Lime green highlights
        for (let i = 0; i < width / 20; i++) {
          const grassX = x - width / 2 + i * 20 + Math.random() * 10;
          ctx.fillRect(grassX, y - height / 2 - 7, 2, 4);
        }
        break;

      case 'stone':
        // Draw stone texture lines
        ctx.strokeStyle = '#2F4F4F'; // Dark slate gray
        ctx.lineWidth = 2;
        ctx.beginPath();
        // Horizontal lines
        ctx.moveTo(x - width / 2, y - height / 6);
        ctx.lineTo(x + width / 2, y - height / 6);
        ctx.moveTo(x - width / 2, y + height / 6);
        ctx.lineTo(x + width / 2, y + height / 6);
        ctx.stroke();
        break;

      case 'floating':
        // Add magical sparkle effect
        ctx.fillStyle = '#E6E6FA'; // Lavender sparkles
        for (let i = 0; i < 6; i++) {
          const sparkleX = x - width / 3 + Math.random() * ((width * 2) / 3);
          const sparkleY = y - height / 3 + Math.random() * ((height * 2) / 3);
          ctx.fillRect(sparkleX, sparkleY, 3, 3);
        }
        break;

      case 'checkpoint':
        // Draw special checkpoint border
        ctx.strokeStyle = '#FF6347'; // Tomato red border
        ctx.lineWidth = 3;
        ctx.strokeRect(x - width / 2, y - height / 2, width, height);

        // Add corner decorations
        ctx.fillStyle = '#FF6347';
        const cornerSize = 8;
        // Top-left corner
        ctx.fillRect(x - width / 2, y - height / 2, cornerSize, cornerSize);
        // Top-right corner
        ctx.fillRect(
          x + width / 2 - cornerSize,
          y - height / 2,
          cornerSize,
          cornerSize
        );
        // Bottom-left corner
        ctx.fillRect(
          x - width / 2,
          y + height / 2 - cornerSize,
          cornerSize,
          cornerSize
        );
        // Bottom-right corner
        ctx.fillRect(
          x + width / 2 - cornerSize,
          y + height / 2 - cornerSize,
          cornerSize,
          cornerSize
        );
        break;

      case 'victory':
        // Draw victory platform with special effects
        ctx.strokeStyle = '#00FF00'; // Bright green border
        ctx.lineWidth = 4;
        ctx.strokeRect(x - width / 2, y - height / 2, width, height);

        // Add victory stars
        ctx.fillStyle = '#FFFF00'; // Yellow stars
        this.drawStar(ctx, x - width / 3, y, 8);
        this.drawStar(ctx, x, y, 10);
        this.drawStar(ctx, x + width / 3, y, 8);
        break;
    }
  }

  // Draw a pixel art road with lane markers and curb
  drawPixelArtRoad(ctx, centerX, centerY, width, height) {
    const left = centerX - width / 2;
    const top = centerY - height / 2;

    // Base asphalt
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(left, top, width, height);

    // Textured asphalt (dithered speckles)
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    for (let i = 0; i < Math.floor(width / 8); i++) {
      const sx = left + (i * 8) + (Math.random() * 8);
      const sy = top + 6 + Math.random() * (height - 12);
      ctx.fillRect(Math.floor(sx), Math.floor(sy), 1, 1);
    }
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    for (let i = 0; i < Math.floor(width / 10); i++) {
      const sx = left + (i * 10) + (Math.random() * 10);
      const sy = top + 6 + Math.random() * (height - 12);
      ctx.fillRect(Math.floor(sx), Math.floor(sy), 1, 1);
    }

    // Curbs (top and bottom edges)
    ctx.fillStyle = '#6b6b6b';
    ctx.fillRect(left, top, width, 6); // top curb
    ctx.fillRect(left, top + height - 6, width, 6); // bottom curb

    // Inner curb highlights
    ctx.fillStyle = '#8a8a8a';
    ctx.fillRect(left, top + 1, width, 2);
    ctx.fillRect(left, top + height - 3, width, 2);

    // Lane divider (dashed)
    const laneY = centerY - 1;
    ctx.fillStyle = '#f4e66a'; // faded yellow
    const dashWidth = 20;
    const gapWidth = 16;
    for (let xPos = left + 10; xPos < left + width - 10; xPos += dashWidth + gapWidth) {
      ctx.fillRect(Math.floor(xPos), Math.floor(laneY - 2), dashWidth, 4);
    }

    // Side stripes (white)
    ctx.fillStyle = '#e9e9e9';
    ctx.fillRect(left + 6, top + 10, width - 12, 2);
    ctx.fillRect(left + 6, top + height - 12, width - 12, 2);

    // Occasional cracks
    ctx.strokeStyle = '#2f2f2f';
    ctx.lineWidth = 1;
    for (let i = 0; i < Math.floor(width / 200); i++) {
      const cx = left + 40 + Math.random() * (width - 80);
      const cy = top + 10 + Math.random() * (height - 20);
      ctx.beginPath();
      ctx.moveTo(Math.floor(cx), Math.floor(cy));
      ctx.lineTo(Math.floor(cx + (Math.random() * 30 - 15)), Math.floor(cy + (Math.random() * 6 - 3)));
      ctx.stroke();
    }
  }

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

  // Get all platform bodies for collision detection
  getAllPlatformBodies() {
    return Array.from(this.platforms.values()).map((p) => p.body);
  }

  // Get checkpoint positions for game logic
  getCheckpointAreas() {
    return this.checkpointAreas;
  }

  // Get level dimensions
  getDimensions() {
    return {
      width: this.width,
      height: this.height,
      groundLevel: this.groundLevel,
    };
  }

  // Get spawn point (start of level)
  getSpawnPoint() {
    return { x: 200, y: this.groundLevel - 100 };
  }

  // Decoration drawing methods (same as Level.js)
  drawTree(ctx, x, y) {
    // Tree trunk
    ctx.fillStyle = '#8B4513'; // Brown trunk
    ctx.fillRect(x - 8, y, 16, 60);

    // Tree foliage (multiple circles for fuller look)
    ctx.fillStyle = '#228B22'; // Forest green
    ctx.beginPath();
    ctx.arc(x, y - 10, 25, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x - 15, y - 5, 20, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x + 15, y - 5, 20, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x, y - 30, 22, 0, Math.PI * 2);
    ctx.fill();
  }

  drawBush(ctx, x, y) {
    // Small bush with multiple bumps
    ctx.fillStyle = '#32CD32'; // Lime green

    ctx.beginPath();
    ctx.arc(x - 10, y, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x, y - 5, 15, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x + 12, y, 10, 0, Math.PI * 2);
    ctx.fill();
  }

  drawCloud(ctx, x, y) {
    ctx.fillStyle = '#F0F8FF'; // Alice blue
    ctx.globalAlpha = 0.8;

    // Multiple circles to form cloud shape
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x - 25, y + 5, 25, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x + 25, y + 5, 25, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x - 10, y - 15, 20, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x + 15, y - 10, 18, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1.0;
  }

  drawPillar(ctx, x, y) {
    // Stone pillar
    ctx.fillStyle = '#708090'; // Slate gray
    ctx.fillRect(x - 12, y, 24, 150);

    // Pillar base
    ctx.fillStyle = '#2F4F4F'; // Dark slate gray
    ctx.fillRect(x - 16, y + 140, 32, 20);

    // Pillar capital
    ctx.fillRect(x - 16, y - 10, 32, 20);

    // Add some texture lines
    ctx.strokeStyle = '#2F4F4F';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const lineY = y + 30 + i * 25;
      ctx.moveTo(x - 12, lineY);
      ctx.lineTo(x + 12, lineY);
    }
    ctx.stroke();
  }

  drawBridgeSupport(ctx, x, y) {
    // Vertical support beam
    ctx.fillStyle = '#8B4513'; // Brown wood
    ctx.fillRect(x - 6, y - 100, 12, 100);

    // Diagonal braces
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x - 20, y);
    ctx.lineTo(x, y - 60);
    ctx.lineTo(x + 20, y);
    ctx.stroke();
  }

  drawFlag(ctx, x, y) {
    // Flag pole
    ctx.fillStyle = '#8B4513'; // Brown pole
    ctx.fillRect(x - 3, y, 6, 120);

    // Flag
    ctx.fillStyle = '#FF0000'; // Red flag
    ctx.fillRect(x + 3, y, 40, 25);

    // Flag details
    ctx.fillStyle = '#FFFFFF'; // White star
  }

  // Draw pixel art street lamp
  drawStreetLamp(ctx, x, y) {
    // Lamp post (dark gray metal)
    ctx.fillStyle = '#505050';
    ctx.fillRect(x - 4, y, 8, 120);
    
    // Post highlights
    ctx.fillStyle = '#707070';
    ctx.fillRect(x - 4, y, 2, 120);
    
    // Lamp housing (darker gray)
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(x - 20, y - 25, 40, 25);
    
    // Light source (warm yellow)
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(x - 16, y - 21, 32, 17);
    
    // Light glow effect
    ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
    ctx.fillRect(x - 24, y - 30, 48, 35);
    
    // Base of post
    ctx.fillStyle = '#404040';
    ctx.fillRect(x - 8, y + 115, 16, 8);
  }

  // Draw pixel art road sign
  drawRoadSign(ctx, x, y) {
    // Sign post
    ctx.fillStyle = '#606060';
    ctx.fillRect(x - 3, y, 6, 80);
    
    // Sign board (white background)
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(x - 25, y - 40, 50, 30);
    
    // Sign border
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 25, y - 40, 50, 30);
    
    // Sign text/symbol (simple arrow)
    ctx.fillStyle = '#333';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('→', x, y - 20);
  }

  // Draw pixel art traffic cone
  drawTrafficCone(ctx, x, y) {
    // Cone base (black)
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(x - 12, y + 20, 24, 8);
    
    // Cone body (orange)
    ctx.fillStyle = '#ff6600';
    // Draw cone as trapezoid using path
    ctx.beginPath();
    ctx.moveTo(x - 10, y + 20); // bottom left
    ctx.lineTo(x + 10, y + 20); // bottom right
    ctx.lineTo(x + 4, y - 10);  // top right
    ctx.lineTo(x - 4, y - 10);  // top left
    ctx.closePath();
    ctx.fill();
    
    // White reflective stripes
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - 8, y + 10, 16, 3);
    ctx.fillRect(x - 6, y, 12, 3);
    
    // Cone tip highlight
    ctx.fillStyle = '#ffaa44';
    ctx.fillRect(x - 2, y - 10, 4, 4);
    ctx.beginPath();
    ctx.arc(x + 23, y + 12, 6, 0, Math.PI * 2);
    ctx.fill();

    // Flag wave effect (simple triangle)
    ctx.fillStyle = '#FF0000';
    ctx.beginPath();
    ctx.moveTo(x + 43, y);
    ctx.lineTo(x + 50, y + 12);
    ctx.lineTo(x + 43, y + 25);
    ctx.fill();
  }

  destroy() {
    // Clean up physics bodies
    this.platforms.forEach((platform, id) => {
      this.physics.removeBody(id);
    });

    this.boundaries.forEach((boundary, id) => {
      this.physics.removeBody(`boundary-${id}`);
    });

    this.platforms.clear();
    this.boundaries.clear();
  }
}
