import { Bodies } from 'matter-js';

export class Level {
  constructor(physics) {
    this.physics = physics;
    this.platforms = new Map();
    this.boundaries = new Map();
    this.checkpointAreas = [];
    
    // Level dimensions
    this.width = 3000; // Total level width
    this.height = 1200; // Total level height
    this.groundLevel = 600; // Base ground level
    
    // Level data - designed for portfolio navigation with 5 checkpoint areas
    this.levelData = {
      // Starting area - tutorial/intro platforms
      startingArea: {
        platforms: [
          { id: 'start-ground', x: 200, y: this.groundLevel, width: 400, height: 60, type: 'grass' },
          { id: 'start-platform1', x: 450, y: this.groundLevel - 120, width: 200, height: 40, type: 'stone' },
        ],
        checkpoint: { x: 300, y: this.groundLevel - 100 }
      },
      
      // First project area
      project1Area: {
        platforms: [
          { id: 'p1-ground', x: 700, y: this.groundLevel, width: 300, height: 60, type: 'grass' },
          { id: 'p1-platform1', x: 800, y: this.groundLevel - 140, width: 180, height: 40, type: 'checkpoint' },
          { id: 'p1-platform2', x: 900, y: this.groundLevel - 260, width: 160, height: 30, type: 'floating' },
        ],
        checkpoint: { x: 800, y: this.groundLevel - 200 }
      },
      
      // Second project area - elevated section
      project2Area: {
        platforms: [
          { id: 'p2-platform1', x: 1100, y: this.groundLevel - 80, width: 200, height: 40, type: 'stone' },
          { id: 'p2-platform2', x: 1200, y: this.groundLevel - 200, width: 220, height: 40, type: 'checkpoint' },
          { id: 'p2-platform3', x: 1350, y: this.groundLevel - 320, width: 180, height: 30, type: 'floating' },
        ],
        checkpoint: { x: 1200, y: this.groundLevel - 260 }
      },
      
      // Third project area - challenging jumps
      project3Area: {
        platforms: [
          { id: 'p3-ground', x: 1600, y: this.groundLevel + 40, width: 280, height: 80, type: 'grass' },
          { id: 'p3-platform1', x: 1750, y: this.groundLevel - 100, width: 160, height: 40, type: 'stone' },
          { id: 'p3-checkpoint', x: 1850, y: this.groundLevel - 240, width: 200, height: 40, type: 'checkpoint' },
        ],
        checkpoint: { x: 1850, y: this.groundLevel - 300 }
      },
      
      // Fourth project area - final approach
      project4Area: {
        platforms: [
          { id: 'p4-platform1', x: 2100, y: this.groundLevel - 60, width: 200, height: 50, type: 'stone' },
          { id: 'p4-platform2', x: 2250, y: this.groundLevel - 180, width: 180, height: 40, type: 'floating' },
          { id: 'p4-checkpoint', x: 2400, y: this.groundLevel - 120, width: 240, height: 50, type: 'checkpoint' },
        ],
        checkpoint: { x: 2400, y: this.groundLevel - 180 }
      },
      
      // End area - victory platform
      endArea: {
        platforms: [
          { id: 'end-ground', x: 2750, y: this.groundLevel, width: 400, height: 60, type: 'grass' },
          { id: 'end-victory', x: 2750, y: this.groundLevel - 140, width: 300, height: 40, type: 'victory' },
        ],
        checkpoint: { x: 2750, y: this.groundLevel - 200 }
      }
    };
    
    this.createLevel();
    this.createBoundaries();
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
