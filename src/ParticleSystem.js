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
    this.x += this.vx * deltaTime / 16.67; // Normalize to 60fps
    this.y += this.vy * deltaTime / 16.67;
    
    // Apply gravity and friction
    this.vy += this.gravity * deltaTime / 16.67;
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

export class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  // Create a dust cloud effect for jumping
  createJumpDust(x, y, direction = 1) {
    const numParticles = 6;
    
    for (let i = 0; i < numParticles; i++) {
      // Spread particles more horizontally, less downward
      const angle = Math.PI * 0.75 + (Math.PI * 0.5 * i / numParticles); // More horizontal spread
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
        fadeOut: true
      });
      
      this.particles.push(particle);
    }
  }

  // Create a puff effect for double jump (same as ground jump dust)
  createDoubleJumpPuff(x, y) {
    const numParticles = 6;
    
    for (let i = 0; i < numParticles; i++) {
      // Same horizontal spread as ground jump
      const angle = Math.PI * 0.75 + (Math.PI * 0.5 * i / numParticles); // More horizontal spread
      const speed = 3 + Math.random() * 2;
      const size = 4 + Math.random() * 4; // Same bigger particles
      
      const particle = new Particle(x + (Math.random() - 0.5) * 20, y, {
        vx: Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1) + (Math.random() - 0.5) * 3,
        vy: -Math.abs(Math.sin(angle)) * speed * 0.3, // Same less upward velocity
        life: 400 + Math.random() * 300, // Same 400-700ms
        size: size,
        color: '#F5F5DC', // Same beige/cream dust color
        gravity: 0.05, // Same less gravity
        friction: 0.95, // Same more air resistance
        fadeOut: true
      });
      
      this.particles.push(particle);
    }
  }

  update(deltaTime) {
    // Update all particles and remove dead ones
    this.particles = this.particles.filter(particle => particle.update(deltaTime));
  }

  draw(ctx) {
    this.particles.forEach(particle => particle.draw(ctx));
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
