import { Bodies, Body } from 'matter-js';

export class Player {
  constructor(x, y, physics, particleSystem = null) {
    this.physics = physics;
    this.particleSystem = particleSystem;
    this.width = 32;
    this.height = 48;
    
    // Create physics body
    this.body = Bodies.rectangle(x, y, this.width, this.height, {
      label: 'player',
      friction: 0.001,
      frictionAir: 0.01,
      restitution: 0.1
    });
    
    // Add to physics world
    this.physics.addBody('player', this.body);
    
    // Movement properties
    this.speed = 0.02;
    this.jumpVelocity = -7.5; // Reduced by half from -15
    this.isGrounded = false;
    this.jumpCooldown = 0;
    this.maxJumpCooldown = 200; // ms
    
    // Double jump properties
    this.jumpsRemaining = 2;
    this.maxJumps = 2;
    
    // Animation properties
    this.facing = 1; // 1 for right, -1 for left
    this.animationState = 'idle'; // idle, walking, jumping
    this.animationFrame = 0;
    this.animationSpeed = 0.15;
    this.animationTimer = 0;
    
    // For drawing simple rectangle (will be replaced with sprites later)
    this.color = '#FF6B6B';
    
    // Setup collision detection
    this.setupCollisions();
  }

  setupCollisions() {
    this.physics.onCollisionStart((event) => {
      const pairs = event.pairs;
      
      for (let pair of pairs) {
        const { bodyA, bodyB } = pair;
        
        if (bodyA === this.body || bodyB === this.body) {
          const otherBody = bodyA === this.body ? bodyB : bodyA;
          
          if (otherBody.label === 'ground') {
            // Check if player is landing on top of ground
            const playerBottom = this.body.position.y + this.height / 2;
            const groundTop = otherBody.position.y - 30; // Using known ground height/2
            
            if (playerBottom >= groundTop - 5 && this.body.velocity.y >= 0) {
              this.isGrounded = true;
            }
          }
        }
      }
    });
  }

  update(deltaTime, inputHandler) {
    // Update jump cooldown
    if (this.jumpCooldown > 0) {
      this.jumpCooldown -= deltaTime;
    }
    
    // Handle input
    this.handleInput(inputHandler);
    
    // Update animation
    this.updateAnimation(deltaTime);
    
    // Check if still grounded (simple ground check)
    this.checkGrounded();
  }

  handleInput(inputHandler) {
    const currentVelocity = this.body.velocity;
    
    // Horizontal movement using forces
    if (inputHandler.isPressed('left')) {
      Body.applyForce(this.body, this.body.position, { x: -0.001, y: 0 });
      this.facing = -1;
      this.animationState = this.isGrounded ? 'walking' : 'jumping';
    } else if (inputHandler.isPressed('right')) {
      Body.applyForce(this.body, this.body.position, { x: 0.001, y: 0 });
      this.facing = 1;
      this.animationState = this.isGrounded ? 'walking' : 'jumping';
    } else {
      // Apply friction when no input
      Body.setVelocity(this.body, { 
        x: currentVelocity.x * 0.8, 
        y: currentVelocity.y 
      });
      if (this.isGrounded) {
        this.animationState = 'idle';
      }
    }
    
    // Limit horizontal velocity
    if (Math.abs(currentVelocity.x) > 5) {
      Body.setVelocity(this.body, { 
        x: Math.sign(currentVelocity.x) * 5, 
        y: currentVelocity.y 
      });
    }
    
    // Jumping (now with double jump!)
    if ((inputHandler.isPressed('up') || inputHandler.isPressed('space')) && 
        this.jumpsRemaining > 0 && this.jumpCooldown <= 0) {
      Body.setVelocity(this.body, { x: currentVelocity.x, y: this.jumpVelocity });
      
      // Create particle effects
      if (this.particleSystem) {
        if (this.jumpsRemaining === 2) {
          // First jump from ground - create dust cloud at feet level
          this.particleSystem.createJumpDust(this.body.position.x, this.body.position.y + this.height/2 - 5, this.facing);
        } else {
          // Double jump in air - create puff effect
          this.particleSystem.createDoubleJumpPuff(this.body.position.x, this.body.position.y);
        }
      }
      
      this.jumpsRemaining--;
      this.isGrounded = false;
      this.jumpCooldown = this.maxJumpCooldown;
      this.animationState = 'jumping';
    }
  }

  updateAnimation(deltaTime) {
    this.animationTimer += deltaTime;
    
    if (this.animationTimer >= this.animationSpeed * 1000) {
      this.animationFrame++;
      this.animationTimer = 0;
      
      // Reset frame based on animation type
      const maxFrames = this.getMaxFrames();
      if (this.animationFrame >= maxFrames) {
        this.animationFrame = 0;
      }
    }
  }

  getMaxFrames() {
    switch (this.animationState) {
      case 'idle': return 4;
      case 'walking': return 6;
      case 'jumping': return 1;
      default: return 1;
    }
  }

  checkGrounded() {
    // Simple ground check - if velocity is very small and near a platform
    if (Math.abs(this.body.velocity.y) < 0.1) {
      // Check if player is near any ground platform
      const playerBottom = this.body.position.y + this.height / 2;
      
      // Check against all ground platforms
      const ground1 = this.physics.getBody('ground1');
      const ground2 = this.physics.getBody('ground2');
      const ground3 = this.physics.getBody('ground3');
      
      const grounds = [ground1, ground2, ground3].filter(g => g);
      
      for (let ground of grounds) {
        const groundTop = ground.position.y - 30;
        const groundLeft = ground.position.x - (ground === ground2 ? 150 : 200);
        const groundRight = ground.position.x + (ground === ground2 ? 150 : 200);
        
        // Check if player is on this platform
        if (playerBottom >= groundTop - 10 && 
            playerBottom <= groundTop + 10 &&
            this.body.position.x >= groundLeft &&
            this.body.position.x <= groundRight) {
          this.isGrounded = true;
          this.jumpsRemaining = this.maxJumps; // Reset jumps when landing
          return;
        }
      }
    }
    
    if (this.body.velocity.y > 0.1) {
      this.isGrounded = false;
    }
  }

  draw(ctx) {
    const pos = this.body.position;
    
    ctx.save();
    
    // Draw player as rectangle for now (sprites will be added later)
    ctx.fillStyle = this.color;
    
    // Apply facing direction
    if (this.facing === -1) {
      ctx.scale(-1, 1);
      ctx.fillRect(-pos.x - this.width/2, pos.y - this.height/2, this.width, this.height);
    } else {
      ctx.fillRect(pos.x - this.width/2, pos.y - this.height/2, this.width, this.height);
    }
    
    // Draw simple face
    ctx.fillStyle = 'white';
    const eyeSize = 4;
    const eyeOffsetX = this.facing === 1 ? 8 : -8;
    const eyeOffsetY = -10;
    
    if (this.facing === -1) {
      ctx.fillRect(-pos.x + eyeOffsetX, pos.y + eyeOffsetY, eyeSize, eyeSize);
      ctx.fillRect(-pos.x + eyeOffsetX + 10, pos.y + eyeOffsetY, eyeSize, eyeSize);
    } else {
      ctx.fillRect(pos.x + eyeOffsetX, pos.y + eyeOffsetY, eyeSize, eyeSize);
      ctx.fillRect(pos.x + eyeOffsetX + 10, pos.y + eyeOffsetY, eyeSize, eyeSize);
    }
    
    ctx.restore();
  }

  // Get position for camera following
  get x() {
    return this.body.position.x;
  }

  get y() {
    return this.body.position.y;
  }

  // Reset player position
  setPosition(x, y) {
    Body.setPosition(this.body, { x, y });
    Body.setVelocity(this.body, { x: 0, y: 0 });
  }
}
