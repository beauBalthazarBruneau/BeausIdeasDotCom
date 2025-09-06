// GeorgiaTechWorld - A linear sub-world showcasing Georgia Tech projects
// Projects are displayed left-to-right with academic/university theming

import { Bodies } from 'matter-js';
import { WorldManager } from '../../managers/ProjectData.js';

export class GeorgiaTechWorld {
  constructor(physics, worldTransitionManager) {
    this.physics = physics;
    this.worldTransitionManager = worldTransitionManager;
    this.platforms = new Map();
    this.boundaries = new Map();
    this.decorativeElements = [];
    
    this.width = 2000;
    this.height = 1200;
    this.groundLevel = 600;
    
    this.projects = WorldManager.getProjectsByWorld('georgia-tech');
    
    this.createWorld();
    this.createBoundaries();
    this.createDecorations();
    this.createDoors();
    
    console.log(`GeorgiaTechWorld created with ${this.projects.length} projects`);
  }

  createWorld() {
    // Create main ground platform
    const groundPlatform = {
      id: 'gt-ground',
      x: this.width / 2,
      y: this.groundLevel,
      width: this.width,
      height: 60,
      type: 'academic-ground'
    };
    
    this.createPlatform(groundPlatform);
    
    // Create mystery boxes for each project
    this.createProjectMysteryBoxes();
  }

  async createProjectMysteryBoxes() {
    const { MysteryBox } = await import('../../entities/MysteryBox.js');
    
    this.projects.forEach((project, index) => {
      const xPos = 300 + (index * 400);
      
      const mysteryBox = new MysteryBox(
        xPos,
        this.groundLevel - 100,
        this.worldTransitionManager.game,
        {
          collectible: project.collectible,
          audioManager: this.worldTransitionManager.game.audioManager,
          project: project // Pass project data for modal display
        }
      );
      
      this.worldTransitionManager.game.mysteryBoxes = this.worldTransitionManager.game.mysteryBoxes || [];
      this.worldTransitionManager.game.mysteryBoxes.push(mysteryBox);
      this.physics.addBody(`mystery-box-${index}`, mysteryBox.body);
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
    
    this.platforms.set(id, { body, data });
    this.physics.addBody(id, body);
  }

  createBoundaries() {
    const boundaries = [
      { id: 'left', x: -50, y: this.height / 2, w: 100, h: this.height },
      { id: 'right', x: this.width + 50, y: this.height / 2, w: 100, h: this.height },
      { id: 'top', x: this.width / 2, y: -50, w: this.width * 2, h: 100 },
      { id: 'bottom', x: this.width / 2, y: this.groundLevel + 400, w: this.width * 2, h: 100 }
    ];
    
    boundaries.forEach(({ id, x, y, w, h }) => {
      const body = Bodies.rectangle(x, y, w, h, {
        label: 'boundary',
        isStatic: true,
        render: { visible: false }
      });
      
      this.boundaries.set(id, body);
      this.physics.addBody(`boundary-${id}`, body);
    });
  }

  createDecorations() {
    this.decorativeElements.push(
      { type: 'academic-pillar', x: 100, y: this.groundLevel - 150 },
      { type: 'academic-pillar', x: this.width - 100, y: this.groundLevel - 150 },
      { type: 'academic-cloud', x: 500, y: this.groundLevel - 300 },
      { type: 'academic-cloud', x: 1200, y: this.groundLevel - 280 },
      { type: 'academic-cloud', x: 1600, y: this.groundLevel - 320 }
    );
  }

  async createDoors() {
    const { Door } = await import('../../entities/Door.js');
    
    const exitDoor = new Door(
      this.width - 150,
      this.groundLevel - 50,
      this.worldTransitionManager,
      {
        targetWorld: 'main-hub',
        doorType: 'exit',
        themeColor: '#B3A369',
        name: 'Return to Hub'
      }
    );
    
    this.worldTransitionManager.game.doors = this.worldTransitionManager.game.doors || [];
    this.worldTransitionManager.game.doors.push(exitDoor);
    this.physics.addBody(`door-exit-georgia-tech`, exitDoor.body);
  }

  draw(ctx) {
    this.drawDecorations(ctx, 'background');
    
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
    
    this.drawDecorations(ctx, 'foreground');
  }

  setPlatformStyle(ctx, type) {
    switch (type) {
      case 'academic-ground':
        ctx.fillStyle = '#B3A369'; // Georgia Tech gold
        break;
      case 'academic-floating':
        ctx.fillStyle = '#003057'; // Georgia Tech navy
        break;
      default:
        ctx.fillStyle = '#708090';
    }
  }

  drawPlatformDetails(ctx, pos, width, height, type) {
    const { x, y } = pos;
    
    if (type === 'academic-ground') {
      // GT logo pattern
      ctx.strokeStyle = '#003057';
      ctx.lineWidth = 3;
      ctx.beginPath();
      
      // Draw GT letters along the platform
      ctx.font = 'bold 20px Arial';
      ctx.fillStyle = '#003057';
      ctx.textAlign = 'center';
      for (let i = 0; i < width / 150; i++) {
        const letterX = x - width/2 + 75 + (i * 150);
        ctx.fillText('GT', letterX, y - 5);
      }
    } else if (type === 'academic-floating') {
      // Add academic border
      ctx.strokeStyle = '#B3A369';
      ctx.lineWidth = 2;
      ctx.strokeRect(x - width/2, y - height/2, width, height);
      
      // Add academic pattern
      ctx.fillStyle = '#B3A369';
      for (let i = 0; i < 3; i++) {
        const dotX = x - 20 + (i * 20);
        ctx.fillRect(dotX - 2, y - 2, 4, 4);
      }
    }
  }

  drawDecorations(ctx, layer) {
    this.decorativeElements.forEach(decoration => {
      const { type, x, y } = decoration;
      
      const isBackground = ['academic-cloud', 'academic-pillar'].includes(type);
      
      if ((layer === 'background' && isBackground) || (layer === 'foreground' && !isBackground)) {
        ctx.save();
        
        switch (type) {
          case 'project-display':
            this.drawProjectDisplay(ctx, x, y, decoration.project);
            break;
          case 'lecture-podium':
            this.drawLecturePodium(ctx, x, y);
            break;
          case 'research-board':
            this.drawResearchBoard(ctx, x, y);
            break;
          case 'academic-pillar':
            this.drawAcademicPillar(ctx, x, y);
            break;
          case 'academic-cloud':
            this.drawAcademicCloud(ctx, x, y);
            break;
        }
        
        ctx.restore();
      }
    });
  }

  drawProjectDisplay(ctx, x, y, project) {
    ctx.fillStyle = '#F8F8FF';
    ctx.fillRect(x - 75, y - 40, 150, 80);
    
    ctx.strokeStyle = '#B3A369';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 75, y - 40, 150, 80);
    
    ctx.fillStyle = '#003057';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(project.title, x, y - 15);
    
    ctx.fillStyle = '#333333';
    ctx.font = '10px Arial';
    const desc = project.description.length > 40 ? 
      project.description.substring(0, 37) + '...' : 
      project.description;
    ctx.fillText(desc, x, y + 5);
    
    ctx.fillStyle = '#B3A369';
    ctx.font = '8px Arial';
    ctx.fillText(project.collectible, x, y + 25);
  }

  drawLecturePodium(ctx, x, y) {
    // Podium base
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x - 15, y + 40, 30, 40);
    
    // Podium top
    ctx.fillStyle = '#D2B48C';
    ctx.fillRect(x - 20, y + 20, 40, 20);
    
    // GT emblem
    ctx.fillStyle = '#B3A369';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GT', x, y + 35);
  }

  drawResearchBoard(ctx, x, y) {
    // Board background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x - 30, y - 25, 60, 50);
    
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 3;
    ctx.strokeRect(x - 30, y - 25, 60, 50);
    
    // Research diagrams
    ctx.strokeStyle = '#003057';
    ctx.lineWidth = 1;
    ctx.beginPath();
    
    // Draw graph lines
    ctx.moveTo(x - 20, y + 15);
    ctx.lineTo(x - 10, y - 5);
    ctx.lineTo(x, y + 10);
    ctx.lineTo(x + 10, y - 15);
    ctx.lineTo(x + 20, y + 5);
    ctx.stroke();
    
    // Add data points
    ctx.fillStyle = '#B3A369';
    ctx.fillRect(x - 10, y - 5, 3, 3);
    ctx.fillRect(x, y + 10, 3, 3);
    ctx.fillRect(x + 10, y - 15, 3, 3);
  }

  drawAcademicPillar(ctx, x, y) {
    // Classical column
    ctx.fillStyle = '#F5F5DC';
    ctx.fillRect(x - 15, y, 30, 140);
    
    // Column base
    ctx.fillStyle = '#D3D3D3';
    ctx.fillRect(x - 18, y + 130, 36, 20);
    
    // Column capital
    ctx.fillRect(x - 18, y - 10, 36, 20);
    
    // Fluting (vertical lines)
    ctx.strokeStyle = '#D3D3D3';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const lineX = x - 12 + (i * 6);
      ctx.moveTo(lineX, y + 10);
      ctx.lineTo(lineX, y + 120);
    }
    ctx.stroke();
    
    // GT logo
    ctx.fillStyle = '#B3A369';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GT', x, y + 75);
  }

  drawAcademicCloud(ctx, x, y) {
    // Scholarly cloud with book-like texture
    ctx.fillStyle = '#E6E6FA';
    ctx.globalAlpha = 0.9;
    
    ctx.beginPath();
    ctx.arc(x, y, 32, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(x - 25, y + 8, 25, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(x + 25, y + 8, 25, 0, Math.PI * 2);
    ctx.fill();
    
    // Add academic symbols
    ctx.fillStyle = '#4B0082';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('📚', x, y + 5);
    
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
