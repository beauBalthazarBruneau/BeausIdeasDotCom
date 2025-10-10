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
      frictionStatic: 0.2,
      frictionAir: 0.005,
      restitution: 0,
      chamfer: { radius: 4 },
    });

    // Add to physics world
    this.physics.addBody('player', this.body);

    // Prevent rotation so the player doesn't snag on edges
    Body.setInertia(this.body, Infinity);
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

      for (const pair of pairs) {
        const { bodyA, bodyB } = pair;

        if (bodyA === this.body || bodyB === this.body) {
          const otherBody = bodyA === this.body ? bodyB : bodyA;

          // Check for platforms AND mystery boxes as valid ground
          if (
            otherBody.label === 'platform' ||
            otherBody.label === 'mysteryBox'
          ) {
            // More robust ground detection - check if player is landing on or touching surface
            const playerBottom = this.body.position.y + this.height / 2;
            const surfaceTop =
              otherBody.position.y -
              (otherBody.bounds.max.y - otherBody.bounds.min.y) / 2;

            // Check if player is on top of surface (more lenient landing detection)
            if (
              playerBottom <= surfaceTop + 10 && // More lenient distance threshold
              this.body.velocity.y >= -2.0 // More lenient velocity threshold
            ) {
              this.isGrounded = true;
              this.jumpsRemaining = this.maxJumps;
            }

            // Special handling for mystery box collision from below (hitting mystery box)
            if (otherBody.label === 'mysteryBox') {
              const playerCenter = this.body.position.y;
              const mysteryBoxCenter = otherBody.position.y;

              // If player hits mystery box from below (player center is below mystery box center)
              if (
                playerCenter > mysteryBoxCenter + 10 &&
                this.body.velocity.y < 0
              ) {
                const mysteryBox = otherBody.gameObject;
                if (mysteryBox && mysteryBox.onHitFromBelow) {
                  mysteryBox.onHitFromBelow(this);
                }
              }
            }
          }
        }
      }
    });

    // Also listen for collision end to detect when leaving ground
    this.physics.onCollisionEnd((event) => {
      const pairs = event.pairs;

      for (const pair of pairs) {
        const { bodyA, bodyB } = pair;

        if (bodyA === this.body || bodyB === this.body) {
          const otherBody = bodyA === this.body ? bodyB : bodyA;

          // Check for leaving platforms OR mystery boxes
          if (
            otherBody.label === 'platform' ||
            otherBody.label === 'mysteryBox'
          ) {
            // Check if we're no longer in contact with any solid surfaces
            this.checkGroundedStatus();
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
      Body.applyForce(this.body, this.body.position, { x: -0.003, y: 0 });
      this.facing = -1;
      this.animationState = this.isGrounded ? 'walking' : 'jumping';
    } else if (inputHandler.isPressed('right')) {
      Body.applyForce(this.body, this.body.position, { x: 0.003, y: 0 });
      this.facing = 1;
      this.animationState = this.isGrounded ? 'walking' : 'jumping';
    } else {
      // Apply lighter friction when no input - let natural physics handle stopping
      if (this.isGrounded) {
        Body.setVelocity(this.body, {
          x: currentVelocity.x * 0.92,
          y: currentVelocity.y,
        });
        this.animationState = 'idle';
      }
    }

    // Limit horizontal velocity
    if (Math.abs(currentVelocity.x) > 5) {
      Body.setVelocity(this.body, {
        x: Math.sign(currentVelocity.x) * 5,
        y: currentVelocity.y,
      });
    }

    // Jumping (now with double jump!)
    if (
      (inputHandler.isPressed('up') || inputHandler.isPressed('space')) &&
      this.jumpsRemaining > 0 &&
      this.jumpCooldown <= 0
    ) {
      Body.setVelocity(this.body, {
        x: currentVelocity.x,
        y: this.jumpVelocity,
      });

      // Create particle effects
      if (this.particleSystem) {
        if (this.jumpsRemaining === 2) {
          // First jump from ground - create dust cloud at feet level
          this.particleSystem.createJumpDust(
            this.body.position.x,
            this.body.position.y + this.height / 2 - 5,
            this.facing
          );
        } else {
          // Double jump in air - create puff effect
          this.particleSystem.createDoubleJumpPuff(
            this.body.position.x,
            this.body.position.y
          );
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
      case 'idle':
        return 4;
      case 'walking':
        return 6;
      case 'jumping':
        return 1;
      default:
        return 1;
    }
  }

  checkGrounded() {
    // If player is falling, they're not grounded
    if (this.body.velocity.y > 0.1) {
      this.isGrounded = false;
    }

    // If grounded and velocity is stable, reset jumps
    if (this.isGrounded && Math.abs(this.body.velocity.y) < 0.1) {
      this.jumpsRemaining = this.maxJumps;
    }
  }

  checkGroundedStatus() {
    // This method checks if the player is still touching ground after collision ends
    // For now, we'll set a small delay to check if player is falling
    setTimeout(() => {
      if (this.body.velocity.y > 0.8) {
        this.isGrounded = false;
      }
    }, 30);
  }

  draw(ctx) {
    const pos = this.body.position;

    ctx.save();

    // Draw player as rectangle for now (sprites will be added later)
    ctx.fillStyle = this.color;

    // Apply facing direction
    if (this.facing === -1) {
      ctx.scale(-1, 1);
      ctx.fillRect(
        -pos.x - this.width / 2,
        pos.y - this.height / 2,
        this.width,
        this.height
      );
    } else {
      ctx.fillRect(
        pos.x - this.width / 2,
        pos.y - this.height / 2,
        this.width,
        this.height
      );
    }

    // Draw simple face
    ctx.fillStyle = 'white';
    const eyeSize = 4;
    const eyeOffsetX = this.facing === 1 ? 8 : -8;
    const eyeOffsetY = -10;

    if (this.facing === -1) {
      ctx.fillRect(-pos.x + eyeOffsetX, pos.y + eyeOffsetY, eyeSize, eyeSize);
      ctx.fillRect(
        -pos.x + eyeOffsetX + 10,
        pos.y + eyeOffsetY,
        eyeSize,
        eyeSize
      );
    } else {
      ctx.fillRect(pos.x + eyeOffsetX, pos.y + eyeOffsetY, eyeSize, eyeSize);
      ctx.fillRect(
        pos.x + eyeOffsetX + 10,
        pos.y + eyeOffsetY,
        eyeSize,
        eyeSize
      );
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

  // Respawn player at specific position with full state reset
  respawn(x, y) {
    // Reset position and velocity
    Body.setPosition(this.body, { x, y });
    Body.setVelocity(this.body, { x: 0, y: 0 });

    // Reset player state
    this.isGrounded = false;
    this.jumpsRemaining = this.maxJumps;
    this.jumpCooldown = 0;

    // Reset animation
    this.animationState = 'idle';
    this.animationFrame = 0;
    this.animationTimer = 0;
    this.facing = 1;
  }
}
