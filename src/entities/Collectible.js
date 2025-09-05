// Collectible item that appears when mystery boxes are hit
// For now this is a simple black box that the player can collect

import { Bodies, Body, World } from 'matter-js';
import { gsap } from 'gsap';

export class Collectible {
  constructor(x, y, physics, particleSystem, audioManager, projectData) {
    this.x = x;
    this.y = y;
    this.physics = physics;
    this.particleSystem = particleSystem;
    this.audioManager = audioManager;
    this.projectData = projectData;
    
    // Visual properties
    this.width = 16;
    this.height = 16;
    this.color = '#000000'; // Simple black box for now
    
    // Animation properties
    this.bobOffset = 0;
    this.bobSpeed = 4; // Slower bobbing
    this.bobAmplitude = 8; // Less dramatic bobbing
    this.scale = 1;
    
    // Collection state
    this.collected = false;
    this.spawning = true;
    
    // Physics body (sensor for collection detection)
    this.body = Bodies.rectangle(x + this.width/2, y + this.height/2, this.width, this.height, {
      isSensor: true,
      isStatic: false,
      label: 'collectible'
    });
    
    // Add to physics world
    this.physics.addBody(`collectible-${Date.now()}`, this.body);
    
    // Store reference for collision detection
    this.body.gameObject = this;
    
    // Spawn animation - appears from the mystery box
    this.initialY = y;
    this.targetY = y - 40; // Float above the mystery box
    
    gsap.fromTo(this, {
      y: this.initialY,
      scale: 0
    }, {
      y: this.targetY,
      scale: 1,
      duration: 0.5,
      ease: "back.out(1.7)",
      onComplete: () => {
        this.spawning = false;
      }
    });
  }
  
  update(deltaTime) {
    if (this.collected) return;
    
    // Update bobbing animation
    this.bobOffset += (deltaTime / 1000) * this.bobSpeed;
    
    // Update physics body position
    if (this.body) {
      // Apply bobbing motion
      const bobY = this.targetY + Math.sin(this.bobOffset) * this.bobAmplitude;
      Body.setPosition(this.body, { x: this.x + this.width/2, y: bobY + this.height/2 });
      this.y = bobY;
    }
  }
  
  draw(ctx) {
    if (this.collected) return;
    
    ctx.save();
    
    // Apply scale transformation
    ctx.translate(this.x + this.width/2, this.y + this.height/2);
    ctx.scale(this.scale, this.scale);
    
    // Draw simple black box (for now)
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
    
    // Add a subtle highlight for visibility
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;
    ctx.strokeRect(-this.width/2, -this.height/2, this.width, this.height);
    
    ctx.restore();
  }
  
  // Called when player collides with this collectible
  collect() {
    if (this.collected || this.spawning) return false;
    
    console.log(`Collecting ${this.projectData.title} collectible!`);
    
    this.collected = true;
    
    // Play collection sound
    this.audioManager.playCheckpointComplete();
    
    // Create collection particles
    this.createCollectionEffect();
    
    // Remove physics body
    if (this.body && this.physics) {
      World.remove(this.physics.world, this.body);
      this.body = null;
    }
    
    // Animate collection
    gsap.to(this, {
      y: this.y - 30,
      scale: 0,
      duration: 0.4,
      ease: "back.in(1.7)"
    });
    
    return true; // Successfully collected
  }
  
  createCollectionEffect() {
    // Create particle burst effect
    const numParticles = 8;
    const centerX = this.x + this.width/2;
    const centerY = this.y + this.height/2;
    
    for (let i = 0; i < numParticles; i++) {
      const angle = (Math.PI * 2 * i) / numParticles;
      const speed = 2 + Math.random() * 3;
      
      this.particleSystem.createParticle(centerX, centerY, {
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1, // Slight upward bias
        life: 600 + Math.random() * 300,
        size: 2 + Math.random() * 3,
        color: '#FFD700', // Gold particles for collection
        gravity: 0.05,
        friction: 0.99,
        fadeOut: true
      });
    }
  }
  
  // Check if this collectible should be removed
  shouldRemove() {
    return this.collected;
  }
  
  destroy() {
    // Clean up physics body if it still exists
    if (this.body && this.physics) {
      // Remove directly from Matter.js World
      World.remove(this.physics.world, this.body);
      this.body = null;
    }
  }
}
