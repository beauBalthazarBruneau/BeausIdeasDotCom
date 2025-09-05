// Door entity for world transitions
// Handles player collision detection and triggers world changes

import { Bodies } from 'matter-js';

export class Door {
  constructor(x, y, worldTransitionManager, transitionData) {
    this.x = x;
    this.y = y;
    this.worldTransitionManager = worldTransitionManager;
    this.transitionData = transitionData; // { targetWorld, spawnPoint, doorType }
    
    // Door properties
    this.width = 60;
    this.height = 80;
    
    // Visual properties
    this.color = transitionData.themeColor || '#8B4513';
    this.isOpen = true;
    this.glowIntensity = 0;
    
    // Animation properties
    this.hoverEffect = 0;
    this.idleAnimation = 0;
    
    // Create physics body as sensor (triggers collision but doesn't block movement)
    this.body = Bodies.rectangle(x + this.width/2, y + this.height/2, this.width, this.height, {
      isSensor: true, // Allows player to pass through while detecting collision
      isStatic: true,
      label: 'door'
    });
    
    // Store reference to this door in the physics body
    this.body.gameObject = this;
    
    console.log(`Created ${transitionData.doorType} door to ${transitionData.targetWorld} at (${x}, ${y})`);
  }
  
  update(deltaTime) {
    // Update idle animation for visual appeal
    this.idleAnimation += deltaTime * 0.002;
    
    // Update glow effect
    this.glowIntensity = 0.5 + Math.sin(this.idleAnimation) * 0.3;
    
    // Update hover effect (will be triggered by proximity)
    if (this.hoverEffect > 0) {
      this.hoverEffect -= deltaTime * 0.003;
      if (this.hoverEffect < 0) this.hoverEffect = 0;
    }
  }
  
  draw(ctx) {
    ctx.save();
    
    // Apply hover scale effect
    const scale = 1 + (this.hoverEffect * 0.1);
    ctx.translate(this.x + this.width/2, this.y + this.height/2);
    ctx.scale(scale, scale);
    
    // Draw glow effect
    if (this.glowIntensity > 0) {
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 20 * this.glowIntensity;
    }
    
    // Draw door frame
    ctx.fillStyle = '#4A4A4A';
    ctx.fillRect(-this.width/2 - 4, -this.height/2 - 4, this.width + 8, this.height + 8);
    
    // Draw door background
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
    
    // Draw door details based on type
    this.drawDoorDetails(ctx);
    
    // Draw entry indicator
    if (this.transitionData.doorType === 'entry') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('ENTER', 0, 10);
      
      // Draw world name above door
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = '10px Arial';
      ctx.fillText(this.transitionData.targetWorld.replace('-', ' ').toUpperCase(), 0, -this.height/2 - 15);
    } else {
      // Exit door
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('EXIT', 0, 10);
    }
    
    ctx.restore();
  }
  
  drawDoorDetails(ctx) {
    // Draw door panels
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    
    // Vertical center line
    ctx.beginPath();
    ctx.moveTo(0, -this.height/2 + 10);
    ctx.lineTo(0, this.height/2 - 10);
    ctx.stroke();
    
    // Door panels
    ctx.strokeRect(-this.width/2 + 8, -this.height/2 + 10, this.width/2 - 12, this.height/2 - 15);
    ctx.strokeRect(4, -this.height/2 + 10, this.width/2 - 12, this.height/2 - 15);
    ctx.strokeRect(-this.width/2 + 8, -5, this.width/2 - 12, this.height/2 - 15);
    ctx.strokeRect(4, -5, this.width/2 - 12, this.height/2 - 15);
    
    // Door handles
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(-8, -3, 4, 6);
    ctx.fillRect(4, -3, 4, 6);
  }
  
  // Called when player collides with this door
  onPlayerCollision(player) {
    console.log(`Player entered ${this.transitionData.doorType} door to ${this.transitionData.targetWorld}`);
    
    // Trigger hover effect
    this.hoverEffect = 1;
    
    // Trigger world transition
    this.worldTransitionManager.transitionToWorld(
      this.transitionData.targetWorld,
      this.transitionData.spawnPoint,
      this.transitionData.doorType
    );
  }
  
  // Check if player is near this door
  checkPlayerProximity(player) {
    const distance = Math.sqrt(
      Math.pow(player.x - (this.x + this.width/2), 2) + 
      Math.pow(player.y - (this.y + this.height/2), 2)
    );
    
    if (distance < 100) {
      this.hoverEffect = Math.max(this.hoverEffect, 0.5);
    }
  }
  
  // Cleanup when door is removed
  destroy() {
    // Remove from physics world if needed
    if (this.body && this.body.world) {
      // This will be handled by the world manager
    }
  }
}
