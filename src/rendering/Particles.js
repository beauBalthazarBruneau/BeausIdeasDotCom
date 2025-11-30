export class Particle {
  constructor(x, y, options = {}) {
    this.x = x;
    this.y = y;
    this.vx = options.vx || 0;
    this.vy = options.vy || 0;
    this.life = options.life || 1000; // milliseconds
    this.maxLife = this.life;
    this.size = options.size || 3;
    this.color = options.color || '#FFFFFF';
    this.gravity = options.gravity || 0;
    this.friction = options.friction || 1;
    this.fadeOut = options.fadeOut !== false;
  }

  update(deltaTime) {
    // Update position
    this.x += (this.vx * deltaTime) / 16.67; // Normalize to 60fps
    this.y += (this.vy * deltaTime) / 16.67;

    // Apply gravity and friction
    this.vy += (this.gravity * deltaTime) / 16.67;
    this.vx *= this.friction;
    this.vy *= this.friction;

    // Update life
    this.life -= deltaTime;

    return this.life > 0; // Return false when particle should be removed
  }

  draw(ctx) {
    if (this.life <= 0) return;

    ctx.save();

    // Calculate alpha for fade out
    const alpha = this.fadeOut ? this.life / this.maxLife : 1;

    // Parse color and add alpha
    if (this.color.startsWith('#')) {
      const hex = this.color.slice(1);
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
    } else {
      ctx.fillStyle = this.color;
    }

    // Draw particle as circle
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

export class Particles {
  constructor() {
    this.particles = [];
    this.environmentalParticles = [];
    this.lastEnvironmentalSpawn = 0;
    this.environmentalSpawnRate = 2000; // milliseconds between spawns
  }

  // Create a dust cloud effect for jumping
  createJumpDust(x, y, direction = 1) {
    const numParticles = 6;

    for (let i = 0; i < numParticles; i++) {
      // Spread particles more horizontally, less downward
      const angle = Math.PI * 0.75 + (Math.PI * 0.5 * i) / numParticles; // More horizontal spread
      const speed = 3 + Math.random() * 2;
      const size = 4 + Math.random() * 4; // Bigger particles

      const particle = new Particle(x + (Math.random() - 0.5) * 20, y + 15, {
        vx: Math.cos(angle) * speed * direction + (Math.random() - 0.5) * 3,
        vy: -Math.abs(Math.sin(angle)) * speed * 0.3, // Less upward velocity
        life: 400 + Math.random() * 300, // 400-700ms - longer lasting
        size: size,
        color: '#F5F5DC', // Beige/cream dust color instead of gray
        gravity: 0.05, // Less gravity so they float more
        friction: 0.95, // More air resistance
        fadeOut: true,
      });

      this.particles.push(particle);
    }
  }

  // Create a puff effect for double jump (same as ground jump dust)
  createDoubleJumpPuff(x, y) {
    const numParticles = 6;

    for (let i = 0; i < numParticles; i++) {
      // Same horizontal spread as ground jump
      const angle = Math.PI * 0.75 + (Math.PI * 0.5 * i) / numParticles; // More horizontal spread
      const speed = 3 + Math.random() * 2;
      const size = 4 + Math.random() * 4; // Same bigger particles

      const particle = new Particle(x + (Math.random() - 0.5) * 20, y, {
        vx:
          Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1) +
          (Math.random() - 0.5) * 3,
        vy: -Math.abs(Math.sin(angle)) * speed * 0.3, // Same less upward velocity
        life: 400 + Math.random() * 300, // Same 400-700ms
        size: size,
        color: '#F5F5DC', // Same beige/cream dust color
        gravity: 0.05, // Same less gravity
        friction: 0.95, // Same more air resistance
        fadeOut: true,
      });

      this.particles.push(particle);
    }
  }

  // Generic method to create a single particle (used by checkpoints and other systems)
  createParticle(x, y, options = {}) {
    const particle = new Particle(x, y, options);
    this.particles.push(particle);
    return particle;
  }

  // Environmental particle effects
  createFloatingDust(x, y, width = 100) {
    const numParticles = 3;

    for (let i = 0; i < numParticles; i++) {
      const particle = new Particle(
        x + (Math.random() - 0.5) * width,
        y + (Math.random() - 0.5) * 50,
        {
          vx: (Math.random() - 0.5) * 0.5, // Very slow horizontal movement
          vy: -0.2 + Math.random() * -0.3, // Slow upward drift
          life: 8000 + Math.random() * 4000, // Long-lasting 8-12 seconds
          size: 1 + Math.random() * 2, // Small particles
          color: '#F5F5DC', // Beige dust
          gravity: -0.001, // Negative gravity for floating effect
          friction: 0.999, // Almost no friction
          fadeOut: true,
        }
      );

      this.environmentalParticles.push(particle);
    }
  }

  // Magic sparkles for floating platforms
  createMagicSparkles(x, y, width = 160) {
    const numParticles = 2;

    for (let i = 0; i < numParticles; i++) {
      const particle = new Particle(
        x + (Math.random() - 0.5) * width,
        y + (Math.random() - 0.5) * 30,
        {
          vx: (Math.random() - 0.5) * 1, // Gentle floating
          vy: -0.3 + Math.random() * -0.5, // Upward drift
          life: 3000 + Math.random() * 2000, // 3-5 seconds
          size: 2 + Math.random() * 3, // Small to medium
          color: '#E6E6FA', // Lavender sparkle
          gravity: -0.002, // Float upward
          friction: 0.998,
          fadeOut: true,
        }
      );

      this.environmentalParticles.push(particle);
    }
  }

  // Wind effect particles
  createWindEffect(x, y, direction = 1) {
    const numParticles = 4;

    for (let i = 0; i < numParticles; i++) {
      const particle = new Particle(
        x + (Math.random() - 0.5) * 200,
        y + (Math.random() - 0.5) * 100,
        {
          vx: direction * (2 + Math.random() * 3), // Wind direction
          vy: (Math.random() - 0.5) * 0.5, // Slight vertical variation
          life: 4000 + Math.random() * 3000, // 4-7 seconds
          size: 1 + Math.random() * 1.5, // Very small
          color: '#F0F8FF', // Alice blue (very light)
          gravity: 0,
          friction: 0.999,
          fadeOut: true,
        }
      );

      this.environmentalParticles.push(particle);
    }
  }

  // Spawn environmental particles based on camera position
  spawnEnvironmentalParticles(cameraX, cameraY, levelWidth, gameTime) {
    // Only spawn every so often
    if (gameTime - this.lastEnvironmentalSpawn < this.environmentalSpawnRate) {
      return;
    }

    this.lastEnvironmentalSpawn = gameTime;

    // Spawn floating dust across the visible area
    const visibleStartX = cameraX - 100;
    const visibleEndX = cameraX + 1000;
    const numAreas = 4;

    for (let i = 0; i < numAreas; i++) {
      const x = visibleStartX + (visibleEndX - visibleStartX) * Math.random();
      const y = cameraY + 200 + Math.random() * 400; // Middle to lower area

      // Randomly choose effect type based on location
      const rand = Math.random();

      if (x < 600) {
        // Starting area - gentle dust and occasional sparkles
        if (rand < 0.7) {
          this.createFloatingDust(x, y);
        } else {
          this.createMagicSparkles(x, y - 50);
        }
      } else if (x >= 200 && x <= 1000) {
        // Mystery box area - more magical effects
        if (rand < 0.4) {
          this.createFloatingDust(x, y);
        } else if (rand < 0.7) {
          this.createMagicSparkles(x, y - 100);
        } else {
          this.createWindEffect(x, y, Math.random() > 0.5 ? 1 : -1);
        }
      } else if (x > 1100 && x < 1600) {
        // Elevated section - wind and floating effects
        if (rand < 0.5) {
          this.createWindEffect(x, y - 100, Math.random() > 0.5 ? 1 : -1);
        } else if (rand < 0.8) {
          this.createFloatingDust(x, y);
        } else {
          this.createMagicSparkles(x, y - 150);
        }
      } else {
        // Victory area - triumphant sparkles
        if (rand < 0.6) {
          this.createMagicSparkles(x, y - 50);
        } else {
          this.createFloatingDust(x, y);
        }
      }
    }

    // Occasionally create special atmospheric effects
    if (Math.random() < 0.1) {
      // 10% chance
      this.createAtmosphericBeam(cameraX + Math.random() * 800, cameraY + 100);
    }
  }

  // Create atmospheric light beam effect
  createAtmosphericBeam(x, y) {
    const numParticles = 12;

    for (let i = 0; i < numParticles; i++) {
      const particle = new Particle(
        x + (Math.random() - 0.5) * 30,
        y - Math.random() * 200, // Start higher up
        {
          vx: (Math.random() - 0.5) * 0.3, // Minimal horizontal movement
          vy: 0.8 + Math.random() * 0.4, // Downward drift like sunbeam
          life: 6000 + Math.random() * 3000, // 6-9 seconds
          size: 2 + Math.random() * 4, // Medium particles
          color: '#FFFACD', // Lemon chiffon (warm light)
          gravity: 0.001, // Very slight downward pull
          friction: 0.999,
          fadeOut: true,
        }
      );

      this.environmentalParticles.push(particle);
    }
  }

  update(deltaTime, camera = null, levelWidth = 3000, gameTime = 0) {
    // Update all particles and remove dead ones
    this.particles = this.particles.filter((particle) =>
      particle.update(deltaTime)
    );
    this.environmentalParticles = this.environmentalParticles.filter(
      (particle) => particle.update(deltaTime)
    );

    // Spawn environmental particles if camera is provided
    if (camera) {
      this.spawnEnvironmentalParticles(
        camera.x,
        camera.y,
        levelWidth,
        gameTime
      );
    }

    // Limit environmental particles to prevent performance issues
    if (this.environmentalParticles.length > 50) {
      this.environmentalParticles = this.environmentalParticles.slice(-50);
    }
  }

  draw(ctx) {
    // Draw environmental particles behind action particles
    this.environmentalParticles.forEach((particle) => particle.draw(ctx));
    this.particles.forEach((particle) => particle.draw(ctx));
  }

  // Get particle count for debugging
  getParticleCount() {
    return this.particles.length;
  }

  // Clear all particles
  clear() {
    this.particles = [];
  }
}
