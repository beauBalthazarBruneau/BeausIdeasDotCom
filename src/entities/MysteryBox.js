// MysteryBox entity for the portfolio Mario game
// Represents mystery boxes that spawn collectibles when hit from below

import { Bodies } from 'matter-js';
import { gsap } from 'gsap';
import { Collectible } from './Collectible.js';

export class MysteryBox {
  constructor(x, y, game, options = {}) {
    this.x = x;
    this.y = y;
    this.game = game; // Store game reference
    this.projectData = options.project;
    this.physics = game.physics;
    this.particleSystem = game.particleSystem;
    this.audioManager = options.audioManager || game.audioManager;
    this.camera = game.camera;
    this.projectModal = game.projectModal;

    // Mystery box properties
    this.id = this.projectData.id;
    this.width = 40;
    this.height = 40;

    // Mystery box states: 'inactive' (has ?), 'hit' (empty), 'completed' (shows project name)
    this.state = 'inactive';
    this.hasBeenHit = false;

    // Visual properties
    this.baseColor = '#8B4513'; // Brown mystery box color
    this.hitColor = '#654321'; // Darker brown when hit
    this.completedColor = '#FFD700'; // Gold when completed
    this.currentColor = this.baseColor;

    // Animation properties
    this.scale = 1;
    this.hitBounce = 0;

    // Question mark properties
    this.questionMarkVisible = true;

    // Collectible tracking
    this.collectible = null;
    this.collectibleSpawned = false;

    // Create physics body as a static rectangle (solid, not sensor)
    this.body = Bodies.rectangle(
      x + this.width / 2,
      y + this.height / 2,
      this.width,
      this.height,
      {
        isStatic: true,
        label: 'mysteryBox',
      }
    );

    // Add to physics world
    this.physics.addBody(this.id, this.body);

    // Store reference to this mystery box in the physics body
    this.body.gameObject = this;

    console.log(
      `Created mystery box: ${this.projectData.title} at (${x}, ${y})`
    );
  }

  update(deltaTime) {
    // Update hit bounce animation
    if (this.hitBounce > 0) {
      this.hitBounce -= deltaTime * 0.01;
      if (this.hitBounce < 0) this.hitBounce = 0;
    }

    // Update collectible if it exists
    if (this.collectible && !this.collectible.collected) {
      this.collectible.update(deltaTime);

      // Check if collectible should be removed
      if (this.collectible.shouldRemove()) {
        this.onCollectibleCollected();
      }
    }
  }

  draw(ctx) {
    ctx.save();

    // Apply transformations (hit bounce effect)
    ctx.translate(
      this.x + this.width / 2,
      this.y + this.height / 2 - this.hitBounce
    );
    ctx.scale(this.scale, this.scale);

    // Draw mystery box
    ctx.fillStyle = this.currentColor;
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

    // Draw border
    ctx.strokeStyle = '#4A4A4A';
    ctx.lineWidth = 2;
    ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);

    // Draw content based on state
    if (this.state === 'inactive' && this.questionMarkVisible) {
      // Draw question mark
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('?', 0, 0);
    } else if (this.state === 'completed') {
      // Draw project name
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Simple text rendering for project name
      const title = this.projectData.title;
      if (title.length <= 12) {
        ctx.fillText(title, 0, 0);
      } else {
        // Split into two lines for longer names
        const words = title.split(' ');
        const midPoint = Math.ceil(words.length / 2);
        const line1 = words.slice(0, midPoint).join(' ');
        const line2 = words.slice(midPoint).join(' ');

        ctx.fillText(line1, 0, -6);
        ctx.fillText(line2, 0, 6);
      }
    }
    // If hit but not completed, draw empty box (no content)

    ctx.restore();

    // Draw collectible if it exists
    if (this.collectible && !this.collectible.collected) {
      this.collectible.draw(ctx);
    }
  }

  // Called when player hits this mystery box from below
  onHitFromBelow(player) {
    if (this.hasBeenHit) {
      console.log(`Mystery box already hit: ${this.projectData.title}`);
      return; // Can only be hit once
    }

    console.log(`Player hit mystery box from below: ${this.projectData.title}`);

    this.hasBeenHit = true;
    this.state = 'hit';
    this.currentColor = this.hitColor;
    this.questionMarkVisible = false;

    // Play hit sound
    this.audioManager.playMysteryBoxActivate();

    // Camera shake
    this.camera.lightShake();

    // Hit animation
    this.animateHit();

    // Spawn collectible
    this.spawnCollectible();
  }

  // Called when the collectible is collected
  onCollectibleCollected() {
    console.log(`Collectible collected for: ${this.projectData.title}`);

    this.state = 'completed';
    this.currentColor = this.completedColor;

    // Clean up collectible reference
    if (this.collectible) {
      this.collectible.destroy();
      this.collectible = null;
    }

    // Completion animation
    this.animateCompletion();
  }

  spawnCollectible() {
    if (this.collectibleSpawned) return;

    this.collectibleSpawned = true;

    // Create collectible above the mystery box
    const collectibleX = this.x + (this.width - 16) / 2; // Center the 16px collectible
    const collectibleY = this.y - 20; // Start above the box

    this.collectible = new Collectible(
      collectibleX,
      collectibleY,
      this.physics,
      this.particleSystem,
      this.audioManager,
      this.projectData,
      this.projectModal,
      this.game
    );

    console.log(`Spawned collectible for ${this.projectData.title}`);
  }

  animateHit() {
    // Bounce up slightly when hit
    this.hitBounce = 8;

    // Scale pulse
    gsap.to(this, {
      scale: 1.1,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: 'power2.inOut',
    });
  }

  animateCompletion() {
    // Golden glow effect
    gsap.to(this, {
      scale: 1.05,
      duration: 0.3,
      ease: 'power2.out',
    });

    // Create completion particles around the box
    this.createCompletionEffect();
  }

  createCompletionEffect() {
    const numParticles = 15;
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;

    for (let i = 0; i < numParticles; i++) {
      const angle = (Math.PI * 2 * i) / numParticles;
      const speed = 2 + Math.random() * 3;

      this.particleSystem.createParticle(centerX, centerY, {
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        life: 1000 + Math.random() * 500,
        size: 3 + Math.random() * 2,
        color: '#FFD700', // Gold particles
        gravity: 0.05,
        friction: 0.98,
        fadeOut: true,
      });
    }
  }

  // Check if player is hitting from below (for collision detection)
  checkPlayerCollision(player) {
    if (this.hasBeenHit) return; // Already been hit

    // Get player position from physics body
    const playerX = player.body.position.x;
    const playerY = player.body.position.y;
    const playerWidth = player.width;
    const playerHeight = player.height;

    // Check if player is close to the mystery box
    const boxCenterX = this.x + this.width / 2;
    const boxCenterY = this.y + this.height / 2;

    // Simple AABB collision detection first
    const playerLeft = playerX - playerWidth / 2;
    const playerRight = playerX + playerWidth / 2;
    const playerTop = playerY - playerHeight / 2;
    const playerBottom = playerY + playerHeight / 2;

    const boxLeft = this.x;
    const boxRight = this.x + this.width;
    const boxTop = this.y;
    const boxBottom = this.y + this.height;

    // Check for any collision first
    const collision =
      playerLeft < boxRight &&
      playerRight > boxLeft &&
      playerTop < boxBottom &&
      playerBottom > boxTop;

    if (collision) {
      // Check if player is hitting from below
      const hitFromBelow = playerTop > boxCenterY;

      // More forgiving velocity check - allow small positive velocities too (at peak of jump)
      const playerMovingUp = player.body.velocity.y < 2; // Allow near-zero velocities at jump peak

      console.log(
        `Collision detected! Moving up: ${playerMovingUp}, From below: ${hitFromBelow}, Velocity: ${player.body.velocity.y}`
      );

      if (hitFromBelow && playerMovingUp) {
        this.onHitFromBelow(player);
      }
    }
  }

  // Check if player is collecting the spawned collectible
  checkCollectibleCollection(player) {
    if (!this.collectible || this.collectible.collected) return;

    // Simple AABB collision detection
    const playerLeft = player.x;
    const playerRight = player.x + player.width;
    const playerTop = player.y;
    const playerBottom = player.y + player.height;

    const collectibleLeft = this.collectible.x;
    const collectibleRight = this.collectible.x + this.collectible.width;
    const collectibleTop = this.collectible.y;
    const collectibleBottom = this.collectible.y + this.collectible.height;

    const collision =
      playerLeft < collectibleRight &&
      playerRight > collectibleLeft &&
      playerTop < collectibleBottom &&
      playerBottom > collectibleTop;

    if (collision) {
      this.collectible.collect();
    }
  }

  // Get current state
  getState() {
    return this.state;
  }

  // Set state (for loading saved progress)
  setState(newState) {
    if (['inactive', 'hit', 'completed'].includes(newState)) {
      this.state = newState;

      // Update visual state
      switch (newState) {
        case 'inactive':
          this.currentColor = this.baseColor;
          this.questionMarkVisible = true;
          this.hasBeenHit = false;
          break;
        case 'hit':
          this.currentColor = this.hitColor;
          this.questionMarkVisible = false;
          this.hasBeenHit = true;
          break;
        case 'completed':
          this.currentColor = this.completedColor;
          this.questionMarkVisible = false;
          this.hasBeenHit = true;
          break;
      }
    }
  }

  // Clean up physics body when mystery box is destroyed
  destroy() {
    if (this.body && this.physics) {
      this.physics.removeBody(this.id);
      this.body = null;
    }

    if (this.collectible) {
      this.collectible.destroy();
      this.collectible = null;
    }
  }
}
