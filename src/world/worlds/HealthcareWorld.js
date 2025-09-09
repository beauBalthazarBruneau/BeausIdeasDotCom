// HealthcareWorld - A linear sub-world showcasing Healthcare projects
// Projects are displayed left-to-right with medical/healthcare theming

import { Bodies } from 'matter-js';
import { WorldManager } from '../../managers/ProjectData.js';

export class HealthcareWorld {
  constructor(physics, worldTransitionManager) {
    this.physics = physics;
    this.worldTransitionManager = worldTransitionManager;
    this.platforms = new Map();
    this.boundaries = new Map();
    this.decorativeElements = [];

    this.width = 2000;
    this.height = 1200;
    this.groundLevel = 600;

    this.projects = WorldManager.getProjectsByWorld('healthcare');

    this.createWorld();
    this.createBoundaries();
    this.createDecorations();
    this.createDoors();

    console.log(
      `HealthcareWorld created with ${this.projects.length} projects`
    );
  }

  createWorld() {
    // Create main ground platform
    const groundPlatform = {
      id: 'healthcare-ground',
      x: this.width / 2,
      y: this.groundLevel,
      width: this.width,
      height: 60,
      type: 'medical-ground',
    };

    this.createPlatform(groundPlatform);

    // Create mystery boxes for each project
    this.createProjectMysteryBoxes();
  }

  async createProjectMysteryBoxes() {
    const { MysteryBox } = await import('../../entities/MysteryBox.js');

    this.projects.forEach((project, index) => {
      const xPos = 300 + index * 400;

      const mysteryBox = new MysteryBox(
        xPos,
        450,
        this.worldTransitionManager.game,
        {
          collectible: project.collectible,
          audioManager: this.worldTransitionManager.game.audioManager,
          project: project, // Pass project data for modal display
        }
      );

      this.worldTransitionManager.game.mysteryBoxes =
        this.worldTransitionManager.game.mysteryBoxes || [];
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
      restitution: 0.1,
    });

    this.platforms.set(id, { body, data });
    this.physics.addBody(id, body);
  }

  createBoundaries() {
    const boundaries = [
      { id: 'left', x: -50, y: this.height / 2, w: 100, h: this.height },
      {
        id: 'right',
        x: this.width + 50,
        y: this.height / 2,
        w: 100,
        h: this.height,
      },
      { id: 'top', x: this.width / 2, y: -50, w: this.width * 2, h: 100 },
      {
        id: 'bottom',
        x: this.width / 2,
        y: this.groundLevel + 400,
        w: this.width * 2,
        h: 100,
      },
    ];

    boundaries.forEach(({ id, x, y, w, h }) => {
      const body = Bodies.rectangle(x, y, w, h, {
        label: 'boundary',
        isStatic: true,
        render: { visible: false },
      });

      this.boundaries.set(id, body);
      this.physics.addBody(`boundary-${id}`, body);
    });
  }

  createDecorations() {
    this.decorativeElements.push(
      { type: 'medical-pillar', x: 100, y: this.groundLevel - 150 },
      {
        type: 'medical-pillar',
        x: this.width - 100,
        y: this.groundLevel - 150,
      },
      { type: 'health-cloud', x: 500, y: this.groundLevel - 300 },
      { type: 'health-cloud', x: 1200, y: this.groundLevel - 280 },
      { type: 'health-cloud', x: 1600, y: this.groundLevel - 320 }
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
        themeColor: '#FF5722',
        name: 'Return to Hub',
      }
    );

    this.worldTransitionManager.game.doors =
      this.worldTransitionManager.game.doors || [];
    this.worldTransitionManager.game.doors.push(exitDoor);
    this.physics.addBody(`door-exit-healthcare`, exitDoor.body);
  }

  draw(ctx) {
    this.drawDecorations(ctx, 'background');

    this.platforms.forEach((platform) => {
      const { body, data } = platform;
      const pos = body.position;
      const { width, height, type } = data;

      ctx.save();
      this.setPlatformStyle(ctx, type);
      ctx.fillRect(pos.x - width / 2, pos.y - height / 2, width, height);
      this.drawPlatformDetails(ctx, pos, width, height, type);
      ctx.restore();
    });

    this.drawDecorations(ctx, 'foreground');
  }

  setPlatformStyle(ctx, type) {
    switch (type) {
      case 'medical-ground':
        ctx.fillStyle = '#E0E0E0'; // Clean medical white/gray
        break;
      case 'medical-floating':
        ctx.fillStyle = '#FF5722'; // Healthcare orange theme
        break;
      default:
        ctx.fillStyle = '#708090';
    }
  }

  drawPlatformDetails(ctx, pos, width, height, type) {
    const { x, y } = pos;

    if (type === 'medical-ground') {
      // Medical cross pattern
      ctx.strokeStyle = '#FF0000';
      ctx.lineWidth = 3;
      ctx.beginPath();

      // Draw red crosses along the platform
      for (let i = 0; i < width / 100; i++) {
        const crossX = x - width / 2 + 50 + i * 100;
        // Vertical line
        ctx.moveTo(crossX, y - 15);
        ctx.lineTo(crossX, y + 15);
        // Horizontal line
        ctx.moveTo(crossX - 10, y);
        ctx.lineTo(crossX + 10, y);
      }
      ctx.stroke();
    } else if (type === 'medical-floating') {
      // Add pulse effect
      ctx.strokeStyle = '#FF5722';
      ctx.lineWidth = 2;
      ctx.strokeRect(x - width / 2, y - height / 2, width, height);

      // Pulse line
      ctx.beginPath();
      ctx.moveTo(x - width / 2, y);
      ctx.lineTo(x - width / 4, y);
      ctx.lineTo(x - width / 6, y - 10);
      ctx.lineTo(x, y + 10);
      ctx.lineTo(x + width / 6, y - 10);
      ctx.lineTo(x + width / 4, y);
      ctx.lineTo(x + width / 2, y);
      ctx.stroke();
    }
  }

  drawDecorations(ctx, layer) {
    this.decorativeElements.forEach((decoration) => {
      const { type, x, y } = decoration;

      const isBackground = ['health-cloud', 'medical-pillar'].includes(type);

      if (
        (layer === 'background' && isBackground) ||
        (layer === 'foreground' && !isBackground)
      ) {
        ctx.save();

        switch (type) {
          case 'project-display':
            this.drawProjectDisplay(ctx, x, y, decoration.project);
            break;
          case 'medical-station':
            this.drawMedicalStation(ctx, x, y);
            break;
          case 'health-monitor':
            this.drawHealthMonitor(ctx, x, y);
            break;
          case 'medical-pillar':
            this.drawMedicalPillar(ctx, x, y);
            break;
          case 'health-cloud':
            this.drawHealthCloud(ctx, x, y);
            break;
        }

        ctx.restore();
      }
    });
  }

  drawProjectDisplay(ctx, x, y, project) {
    ctx.fillStyle = '#F5F5F5';
    ctx.fillRect(x - 75, y - 40, 150, 80);

    ctx.strokeStyle = '#FF5722';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 75, y - 40, 150, 80);

    ctx.fillStyle = '#FF5722';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(project.title, x, y - 15);

    ctx.fillStyle = '#333333';
    ctx.font = '10px Arial';
    const desc =
      project.description.length > 40
        ? project.description.substring(0, 37) + '...'
        : project.description;
    ctx.fillText(desc, x, y + 5);

    ctx.fillStyle = '#00AA00';
    ctx.font = '8px Arial';
    ctx.fillText(project.collectible, x, y + 25);
  }

  drawMedicalStation(ctx, x, y) {
    // Medical cabinet
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x - 20, y, 40, 80);

    ctx.strokeStyle = '#CCCCCC';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 20, y, 40, 80);

    // Red cross
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(x - 5, y + 20, 10, 30);
    ctx.fillRect(x - 15, y + 30, 30, 10);
  }

  drawHealthMonitor(ctx, x, y) {
    // Monitor screen
    ctx.fillStyle = '#000000';
    ctx.fillRect(x - 25, y - 15, 50, 35);

    ctx.strokeStyle = '#CCCCCC';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 25, y - 15, 50, 35);

    // Heart rate line
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 20, y + 5);
    ctx.lineTo(x - 10, y + 5);
    ctx.lineTo(x - 5, y - 5);
    ctx.lineTo(x, y + 10);
    ctx.lineTo(x + 5, y - 5);
    ctx.lineTo(x + 10, y + 5);
    ctx.lineTo(x + 20, y + 5);
    ctx.stroke();
  }

  drawMedicalPillar(ctx, x, y) {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x - 12, y, 24, 150);

    ctx.strokeStyle = '#CCCCCC';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 12, y, 24, 150);

    // Medical symbols
    ctx.fillStyle = '#FF0000';
    for (let i = 0; i < 3; i++) {
      const symbolY = y + 30 + i * 40;
      ctx.fillRect(x - 3, symbolY, 6, 20);
      ctx.fillRect(x - 10, symbolY + 7, 20, 6);
    }
  }

  drawHealthCloud(ctx, x, y) {
    ctx.fillStyle = '#FFE4E1';
    ctx.globalAlpha = 0.8;

    // Soft medical cloud
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x - 25, y + 5, 25, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x + 25, y + 5, 25, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1.0;
  }

  getDimensions() {
    return {
      width: this.width,
      height: this.height,
      groundLevel: this.groundLevel,
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
