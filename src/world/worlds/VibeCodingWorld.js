// VibeCodingWorld - A linear sub-world showcasing Vibe Coding projects
// Projects are displayed left-to-right with entry and exit doors

import { Bodies } from 'matter-js';
import { WorldManager } from '../../managers/ProjectData.js';

export class VibeCodingWorld {
  constructor(physics, worldTransitionManager) {
    this.physics = physics;
    this.worldTransitionManager = worldTransitionManager;
    this.platforms = new Map();
    this.boundaries = new Map();
    this.decorativeElements = [];
    
    // Sub-world dimensions (smaller, linear layout)
    this.width = 2000;
    this.height = 1200;
    this.groundLevel = 600;
    
    // Get Vibe Coding projects
    this.projects = WorldManager.getProjectsByWorld('vibe-coding');
    
    // Create the linear world layout
    this.createWorld();
    this.createBoundaries();
    this.createDecorations();
    this.createDoors();
    
    console.log(`VibeCodingWorld created with ${this.projects.length} projects`);
  }

  createWorld() {
    // Create continuous ground platform
    const groundPlatform = {
      id: 'vibe-coding-ground',
      x: this.width / 2,
      y: this.groundLevel,
      width: this.width,
      height: 60,
      type: 'tech-ground'
    };
    
    this.createPlatform(groundPlatform);
    
    // Create project showcase platforms at intervals
    this.projects.forEach((project, index) => {
      const xPos = 300 + (index * 400); // Space projects 400px apart
      
      // Project platform
      const projectPlatform = {
        id: `project-platform-${index}`,
        x: xPos,
        y: this.groundLevel - 100,
        width: 200,
        height: 20,
        type: 'floating'
      };
      
      this.createPlatform(projectPlatform);
      
      // Add decorative elements for each project
      this.decorativeElements.push({
        type: 'project-display',
        x: xPos,
        y: this.groundLevel - 150,
        project: project
      });
      
      // Add tech-themed decorations
      if (index % 2 === 0) {
        this.decorativeElements.push({
          type: 'server-rack',
          x: xPos + 100,
          y: this.groundLevel - 60
        });
      } else {
        this.decorativeElements.push({
          type: 'code-screen',
          x: xPos - 100,
          y: this.groundLevel - 80
        });
      }
    });
  }

  createPlatform(data) {
    const { id, x, y, width, height, type } = data;
    
    const body = Bodies.rectangle(x, y, width, height, {
      label: 'platform',
      isStatic: true,
      friction: 0.8,
      restitution: 0.1
    });
    
    this.platforms.set(id, {
      body: body,
      data: data
    });
    
    this.physics.addBody(id, body);
  }

  createBoundaries() {
    const leftWall = Bodies.rectangle(-50, this.height / 2, 100, this.height, {
      label: 'boundary',
      isStatic: true,
      render: { visible: false }
    });
    
    const rightWall = Bodies.rectangle(this.width + 50, this.height / 2, 100, this.height, {
      label: 'boundary',
      isStatic: true,
      render: { visible: false }
    });
    
    const ceiling = Bodies.rectangle(this.width / 2, -50, this.width * 2, 100, {
      label: 'boundary',
      isStatic: true,
      render: { visible: false }
    });
    
    const floor = Bodies.rectangle(this.width / 2, this.groundLevel + 400, this.width * 2, 100, {
      label: 'boundary',
      isStatic: true,
      render: { visible: false }
    });
    
    this.boundaries.set('left', leftWall);
    this.boundaries.set('right', rightWall);
    this.boundaries.set('top', ceiling);
    this.boundaries.set('bottom', floor);
    
    this.physics.addBody('boundary-left', leftWall);
    this.physics.addBody('boundary-right', rightWall);
    this.physics.addBody('boundary-top', ceiling);
    this.physics.addBody('boundary-bottom', floor);
  }

  createDecorations() {
    // Add world-themed background decorations
    this.decorativeElements.push(
      { type: 'tech-pillar', x: 100, y: this.groundLevel - 150 },
      { type: 'tech-pillar', x: this.width - 100, y: this.groundLevel - 150 },
      { type: 'digital-cloud', x: 500, y: this.groundLevel - 300 },
      { type: 'digital-cloud', x: 1200, y: this.groundLevel - 280 },
      { type: 'digital-cloud', x: 1600, y: this.groundLevel - 320 }
    );
  }

  async createDoors() {
    const { Door } = await import('../../entities/Door.js');
    
    // Entry door (player spawns here from main hub)
    // This door is just visual - player spawns next to it
    
    // Exit door (returns to main hub with progression)
    const exitDoor = new Door(
      this.width - 150,
      this.groundLevel - 50,
      this.worldTransitionManager,
      {
        targetWorld: 'main-hub',
        doorType: 'exit',
        themeColor: '#00D4FF',
        name: 'Return to Hub'
      }
    );
    
    // Add exit door to game doors array
    this.worldTransitionManager.game.doors = this.worldTransitionManager.game.doors || [];
    this.worldTransitionManager.game.doors.push(exitDoor);
    this.physics.addBody(`door-exit-vibe-coding`, exitDoor.body);
  }

  draw(ctx) {
    // Draw background elements first
    this.drawDecorations(ctx, 'background');
    
    // Draw platforms
    this.platforms.forEach((platform) => {
      const { body, data } = platform;
      const pos = body.position;
      const { width, height, type } = data;
      
      ctx.save();
      this.setPlatformStyle(ctx, type);
      ctx.fillRect(pos.x - width/2, pos.y - height/2, width, height);
      this.drawPlatformDetails(ctx, pos, width, height, type);
      ctx.restore();
    });
    
    // Draw foreground elements
    this.drawDecorations(ctx, 'foreground');
  }

  setPlatformStyle(ctx, type) {
    switch (type) {
      case 'tech-ground':
        ctx.fillStyle = '#2F4F4F'; // Dark slate gray - tech theme
        break;
      case 'floating':
        ctx.fillStyle = '#00D4FF'; // Cyan - matches vibe coding theme
        break;
      default:
        ctx.fillStyle = '#708090';
    }
  }

  drawPlatformDetails(ctx, pos, width, height, type) {
    const { x, y } = pos;
    
    if (type === 'tech-ground') {
      // Draw tech-style ground with circuit patterns
      ctx.strokeStyle = '#00FFFF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      // Draw circuit lines
      for (let i = 0; i < width / 50; i++) {
        const lineX = x - width/2 + (i * 50);
        ctx.moveTo(lineX, y - height/2);
        ctx.lineTo(lineX, y + height/2);
      }
      ctx.stroke();
      
      // Add circuit nodes
      ctx.fillStyle = '#00FFFF';
      for (let i = 0; i < width / 100; i++) {
        const nodeX = x - width/2 + 25 + (i * 100);
        ctx.fillRect(nodeX - 2, y - 2, 4, 4);
      }
    } else if (type === 'floating') {
      // Add holographic effect
      ctx.strokeStyle = '#00D4FF';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(x - width/2, y - height/2, width, height);
      ctx.setLineDash([]);
    }
  }

  drawDecorations(ctx, layer) {
    this.decorativeElements.forEach(decoration => {
      const { type, x, y } = decoration;
      
      const isBackground = ['digital-cloud', 'tech-pillar'].includes(type);
      
      if ((layer === 'background' && isBackground) || (layer === 'foreground' && !isBackground)) {
        ctx.save();
        
        switch (type) {
          case 'project-display':
            this.drawProjectDisplay(ctx, x, y, decoration.project);
            break;
          case 'server-rack':
            this.drawServerRack(ctx, x, y);
            break;
          case 'code-screen':
            this.drawCodeScreen(ctx, x, y);
            break;
          case 'tech-pillar':
            this.drawTechPillar(ctx, x, y);
            break;
          case 'digital-cloud':
            this.drawDigitalCloud(ctx, x, y);
            break;
        }
        
        ctx.restore();
      }
    });
  }

  drawProjectDisplay(ctx, x, y, project) {
    // Draw project info display
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x - 75, y - 40, 150, 80);
    
    // Border
    ctx.strokeStyle = '#00D4FF';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 75, y - 40, 150, 80);
    
    // Project title
    ctx.fillStyle = '#00D4FF';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(project.title, x, y - 15);
    
    // Project description (truncated)
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px Arial';
    const desc = project.description.length > 40 ? 
      project.description.substring(0, 37) + '...' : 
      project.description;
    ctx.fillText(desc, x, y + 5);
    
    // Tech indicator
    ctx.fillStyle = '#00FF00';
    ctx.font = '8px Arial';
    ctx.fillText(project.collectible, x, y + 25);
  }

  drawServerRack(ctx, x, y) {
    // Server rack
    ctx.fillStyle = '#333333';
    ctx.fillRect(x - 15, y, 30, 80);
    
    // Server units
    ctx.fillStyle = '#666666';
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(x - 12, y + 5 + (i * 18), 24, 15);
    }
    
    // LED lights
    ctx.fillStyle = '#00FF00';
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(x + 8, y + 8 + (i * 18), 3, 3);
    }
  }

  drawCodeScreen(ctx, x, y) {
    // Monitor
    ctx.fillStyle = '#000000';
    ctx.fillRect(x - 25, y - 15, 50, 35);
    
    // Screen border
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 25, y - 15, 50, 35);
    
    // Code lines
    ctx.fillStyle = '#00FF00';
    ctx.font = '8px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('function()', x - 20, y - 5);
    ctx.fillText('{code}', x - 20, y + 5);
    ctx.fillText('return;', x - 20, y + 15);
  }

  drawTechPillar(ctx, x, y) {
    // Metallic pillar with tech details
    ctx.fillStyle = '#708090';
    ctx.fillRect(x - 12, y, 24, 150);
    
    // Tech panels
    ctx.fillStyle = '#2F4F4F';
    ctx.fillRect(x - 8, y + 20, 16, 20);
    ctx.fillRect(x - 8, y + 60, 16, 20);
    ctx.fillRect(x - 8, y + 100, 16, 20);
    
    // LED strips
    ctx.fillStyle = '#00D4FF';
    ctx.fillRect(x - 10, y + 10, 2, 130);
    ctx.fillRect(x + 8, y + 10, 2, 130);
  }

  drawDigitalCloud(ctx, x, y) {
    // Pixelated cloud effect
    ctx.fillStyle = '#B0E0E6';
    ctx.globalAlpha = 0.7;
    
    // Draw pixelated cloud shape
    const pixelSize = 8;
    const cloudData = [
      [0,0,1,1,1,1,0,0],
      [0,1,1,1,1,1,1,0],
      [1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1],
      [0,1,1,1,1,1,1,0],
      [0,0,1,1,1,1,0,0]
    ];
    
    cloudData.forEach((row, rowIndex) => {
      row.forEach((pixel, colIndex) => {
        if (pixel) {
          ctx.fillRect(
            x - 32 + (colIndex * pixelSize),
            y - 24 + (rowIndex * pixelSize),
            pixelSize,
            pixelSize
          );
        }
      });
    });
    
    ctx.globalAlpha = 1.0;
  }

  getDimensions() {
    return {
      width: this.width,
      height: this.height,
      groundLevel: this.groundLevel
    };
  }

  destroy() {
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
