import { Bodies } from 'matter-js';

export class Level {
  constructor(physics) {
    this.physics = physics;
    this.platforms = new Map();
    this.boundaries = new Map();
    this.decorativeElements = [];
    this.checkpointAreas = [];
    
    // Level dimensions
    this.width = 3000; // Total level width
    this.height = 1200; // Total level height
    this.groundLevel = 600; // Base ground level
    
    // Level progression data designed for portfolio navigation
    this.levelData = {
      // Starting area - tutorial/intro with basic ground
      startingArea: {
        platforms: [
          { id: 'start-ground', x: 0, y: this.groundLevel, width: 600, height: 60, type: 'grass' },
        ],
        decorations: [
          { type: 'tree', x: 50, y: this.groundLevel - 60 },
          { type: 'bush', x: 450, y: this.groundLevel - 30 }
        ]
      },
      
      // Mystery box area - where all project checkpoints are located
      mysteryBoxArea: {
        platforms: [
          { id: 'mystery-ground', x: 600, y: this.groundLevel, width: 1000, height: 60, type: 'grass' },
        ],
        decorations: [
          { type: 'pillar', x: 150, y: this.groundLevel - 150 },
          { type: 'pillar', x: 850, y: this.groundLevel - 150 }
        ]
      },
      
      // Elevated section - jumping challenges
      elevatedSection: {
        platforms: [
          { id: 'elevated-ground', x: 1700, y: this.groundLevel, width: 500, height: 60, type: 'grass' },
        ],
        decorations: [
          { type: 'cloud', x: 1800, y: this.groundLevel - 300 },
          { type: 'cloud', x: 2000, y: this.groundLevel - 320 }
        ]
      },
      
      // Canyon crossing - challenging platforming
      canyonCrossing: {
        platforms: [
          { id: 'canyon-ground', x: 2300, y: this.groundLevel, width: 400, height: 60, type: 'grass' },
        ],
        decorations: [
          { type: 'bridge_support', x: 2400, y: this.groundLevel + 50 },
          { type: 'bridge_support', x: 2600, y: this.groundLevel + 50 }
        ]
      },
      
      // Victory area - final destination
      victoryArea: {
        platforms: [
          { id: 'victory-ground', x: 2800, y: this.groundLevel, width: 400, height: 60, type: 'victory' },
        ],
        decorations: [
          { type: 'flag', x: 2950, y: this.groundLevel - 180 },
          { type: 'tree', x: 2750, y: this.groundLevel - 60 },
          { type: 'tree', x: 3050, y: this.groundLevel - 60 }
        ]
      }
    };
    
    this.createLevel();
    this.createBoundaries();
    this.createDecorations();
  }

  createDecorations() {
    // Create decorative elements from level data
    Object.values(this.levelData).forEach(area => {
      if (area.decorations) {
        area.decorations.forEach(decoration => {
          this.decorativeElements.push(decoration);
        });
      }
    });
  }

  createLevel() {
    // Create all platforms from level data
    Object.values(this.levelData).forEach(area => {
      area.platforms.forEach(platformData => {
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
      friction: 0.8,
      restitution: 0.1
    });
    
    // Store platform with its data
    this.platforms.set(id, {
      body: body,
      data: data
    });
    
    // Add to physics world
    this.physics.addBody(id, body);
  }

  createBoundaries() {
    // Left boundary
    const leftWall = Bodies.rectangle(-50, this.height / 2, 100, this.height, {
      label: 'boundary',
      isStatic: true,
      render: { visible: false }
    });
    
    // Right boundary
    const rightWall = Bodies.rectangle(this.width + 50, this.height / 2, 100, this.height, {
      label: 'boundary',
      isStatic: true,
      render: { visible: false }
    });
    
    // Top boundary (ceiling)
    const ceiling = Bodies.rectangle(this.width / 2, -50, this.width * 2, 100, {
      label: 'boundary',
      isStatic: true,
      render: { visible: false }
    });
    
    // Bottom boundary (death zone - but higher than our death Y)
    const floor = Bodies.rectangle(this.width / 2, this.groundLevel + 400, this.width * 2, 100, {
      label: 'boundary',
      isStatic: true,
      render: { visible: false }
    });
    
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
      ctx.fillRect(pos.x - width/2, pos.y - height/2, width, height);
      
      // Draw platform details/decorations
      this.drawPlatformDetails(ctx, pos, width, height, type);
      
      ctx.restore();
    });
    
    // Draw foreground decorative elements (on top of platforms)
    this.drawDecorations(ctx, 'foreground');
  }
  
  drawDecorations(ctx, layer) {
    this.decorativeElements.forEach(decoration => {
      const { type, x, y } = decoration;
      
      // Check if the decoration should be drawn in the current layer
      const isBackground = ['cloud', 'bridge_support', 'distant_mountain'].includes(type);
      
      if ((layer === 'background' && isBackground) || (layer === 'foreground' && !isBackground)) {
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
        }
        
        ctx.restore();
      }
    });
  }

  setPlatformStyle(ctx, type) {
    switch (type) {
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
      case 'grass':
        // Draw grass on top
        ctx.fillStyle = '#228B22'; // Forest green grass
        ctx.fillRect(x - width/2, y - height/2 - 5, width, 10);
        
        // Add some grass blades
        ctx.fillStyle = '#32CD32'; // Lime green highlights
        for (let i = 0; i < width / 20; i++) {
          const grassX = x - width/2 + (i * 20) + Math.random() * 10;
          ctx.fillRect(grassX, y - height/2 - 7, 2, 4);
        }
        break;
        
      case 'stone':
        // Draw stone texture lines
        ctx.strokeStyle = '#2F4F4F'; // Dark slate gray
        ctx.lineWidth = 2;
        ctx.beginPath();
        // Horizontal lines
        ctx.moveTo(x - width/2, y - height/6);
        ctx.lineTo(x + width/2, y - height/6);
        ctx.moveTo(x - width/2, y + height/6);
        ctx.lineTo(x + width/2, y + height/6);
        ctx.stroke();
        break;
        
      case 'floating':
        // Add magical sparkle effect
        ctx.fillStyle = '#E6E6FA'; // Lavender sparkles
        for (let i = 0; i < 6; i++) {
          const sparkleX = x - width/3 + Math.random() * (width * 2/3);
          const sparkleY = y - height/3 + Math.random() * (height * 2/3);
          ctx.fillRect(sparkleX, sparkleY, 3, 3);
        }
        break;
        
      case 'checkpoint':
        // Draw special checkpoint border
        ctx.strokeStyle = '#FF6347'; // Tomato red border
        ctx.lineWidth = 3;
        ctx.strokeRect(x - width/2, y - height/2, width, height);
        
        // Add corner decorations
        ctx.fillStyle = '#FF6347';
        const cornerSize = 8;
        // Top-left corner
        ctx.fillRect(x - width/2, y - height/2, cornerSize, cornerSize);
        // Top-right corner
        ctx.fillRect(x + width/2 - cornerSize, y - height/2, cornerSize, cornerSize);
        // Bottom-left corner
        ctx.fillRect(x - width/2, y + height/2 - cornerSize, cornerSize, cornerSize);
        // Bottom-right corner
        ctx.fillRect(x + width/2 - cornerSize, y + height/2 - cornerSize, cornerSize, cornerSize);
        break;
        
      case 'victory':
        // Draw victory platform with special effects
        ctx.strokeStyle = '#00FF00'; // Bright green border
        ctx.lineWidth = 4;
        ctx.strokeRect(x - width/2, y - height/2, width, height);
        
        // Add victory stars
        ctx.fillStyle = '#FFFF00'; // Yellow stars
        this.drawStar(ctx, x - width/3, y, 8);
        this.drawStar(ctx, x, y, 10);
        this.drawStar(ctx, x + width/3, y, 8);
        break;
    }
  }

  drawStar(ctx, x, y, size) {
    const spikes = 5;
    const outerRadius = size;
    const innerRadius = size * 0.5;
    let rotation = Math.PI / 2 * 3;
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
    return Array.from(this.platforms.values()).map(p => p.body);
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
      groundLevel: this.groundLevel
    };
  }

  // Get spawn point (start of level)
  getSpawnPoint() {
    return { x: 200, y: this.groundLevel - 100 };
  }
  
  // Decoration drawing methods
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
      const lineY = y + 30 + (i * 25);
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
