import { gsap } from 'gsap';

export class Camera {
  constructor(canvas) {
    this.canvas = canvas;
    this.x = 0;
    this.y = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.smoothing = 0.1;

    // Screen shake properties
    this.shakeX = 0;
    this.shakeY = 0;
    this.isShaking = false;

    // Zoom properties
    this.zoom = 1;
    this.targetZoom = 1;
    this.baseZoom = 1;
    this.zoomSmoothing = 0.08;
    this.isZooming = false;

    // Camera boundaries
    this.minX = 0;
    this.maxX = 2000; // Will be updated based on level size
    this.minY = -200;
    this.maxY = 600;

    // Viewport offset to center player
    this.offsetX = this.canvas.width / 2;
    this.offsetY = this.canvas.height / 2;

    // Camera mode state
    this.mode = 'follow'; // 'follow' | 'modal'
  }

  follow(target) {
    if (this.mode !== 'follow') {
      // Not in follow mode - camera is controlled elsewhere
      return;
    }

    // Follow mode: Center player in viewport
    this.targetX = target.x - this.offsetX;
    this.targetY = target.y - this.offsetY;

    // Apply boundaries
    this.targetX = Math.max(
      this.minX,
      Math.min(this.maxX - this.canvas.width, this.targetX)
    );
    this.targetY = Math.max(
      this.minY,
      Math.min(this.maxY - this.canvas.height, this.targetY)
    );
  }

  update() {
    // Smooth camera movement
    this.x += (this.targetX - this.x) * this.smoothing;
    this.y += (this.targetY - this.y) * this.smoothing;

    // Smooth zoom
    if (this.isZooming) {
      this.zoom += (this.targetZoom - this.zoom) * this.zoomSmoothing;

      // Stop zooming when close enough
      if (Math.abs(this.targetZoom - this.zoom) < 0.01) {
        this.zoom = this.targetZoom;
        this.isZooming = false;
      }
    }
  }

  apply(ctx) {
    ctx.save();

    // Apply zoom from center of screen
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;

    // Translate to center, scale, then translate back
    ctx.translate(centerX, centerY);
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-centerX, -centerY);

    // Apply camera position with screen shake offset
    ctx.translate(-this.x + this.shakeX, -this.y + this.shakeY);
  }

  restore(ctx) {
    ctx.restore();
  }

  // Convert screen coordinates to world coordinates
  screenToWorld(screenX, screenY) {
    return {
      x: screenX + this.x,
      y: screenY + this.y,
    };
  }

  // Convert world coordinates to screen coordinates
  worldToScreen(worldX, worldY) {
    return {
      x: worldX - this.x,
      y: worldY - this.y,
    };
  }

  // Update viewport size when canvas resizes
  resize(width, height) {
    this.offsetX = width / 2;
    this.offsetY = height / 2;
  }

  // Check if object is visible in camera view
  isVisible(x, y, width, height) {
    return !(
      x + width < this.x ||
      x > this.x + this.canvas.width ||
      y + height < this.y ||
      y > this.y + this.canvas.height
    );
  }

  // Screen shake effects
  shake(intensity = 10, duration = 0.3) {
    if (this.isShaking) {
      // Kill existing shake animation
      gsap.killTweensOf(this);
    }

    this.isShaking = true;

    // Create shake animation with GSAP
    gsap.to(this, {
      duration: duration,
      shakeX: `random(-${intensity}, ${intensity})`,
      shakeY: `random(-${intensity}, ${intensity})`,
      ease: 'power2.out',
      repeat: Math.floor(duration * 10), // Higher frequency for more shake
      yoyo: true,
      onComplete: () => {
        this.stopShake();
      },
    });
  }

  // Light shake for small impacts
  lightShake() {
    this.shake(3, 0.15);
  }

  // Medium shake for jumps and landings
  mediumShake() {
    this.shake(6, 0.25);
  }

  // Heavy shake for deaths and big impacts
  heavyShake() {
    this.shake(12, 0.4);
  }

  // Directional shake (for specific impact directions)
  shakeDirection(directionX, directionY, intensity = 8, duration = 0.2) {
    if (this.isShaking) {
      gsap.killTweensOf(this);
    }

    this.isShaking = true;

    // Normalize direction
    const length = Math.sqrt(directionX * directionX + directionY * directionY);
    if (length > 0) {
      directionX /= length;
      directionY /= length;
    }

    // Apply shake in specific direction
    const shakeX = directionX * intensity;
    const shakeY = directionY * intensity;

    gsap.to(this, {
      duration: duration,
      shakeX: shakeX,
      shakeY: shakeY,
      ease: 'power2.out',
      yoyo: true,
      repeat: Math.floor(duration * 8),
      onComplete: () => {
        this.stopShake();
      },
    });
  }

  // Stop shake immediately
  stopShake() {
    this.isShaking = false;
    this.shakeX = 0;
    this.shakeY = 0;
    gsap.killTweensOf(this);
  }

  // Zoom to specific player with animation
  zoomToPlayer(zoomLevel, duration = 1.0) {
    this.targetZoom = zoomLevel;
    this.isZooming = true;

    // Animate zoom with GSAP for smoother control
    gsap.to(this, {
      zoom: zoomLevel,
      duration: duration,
      ease: 'power2.out',
      onComplete: () => {
        this.isZooming = false;
      },
    });
  }

  // Zoom out to normal view
  zoomOut(duration = 0.6) {
    this.targetZoom = this.baseZoom;
    this.isZooming = true;

    gsap.to(this, {
      zoom: this.baseZoom,
      duration: duration,
      ease: 'power2.out',
      onComplete: () => {
        this.isZooming = false;
      },
    });
  }

  // Set zoom instantly without animation
  setZoom(zoomLevel) {
    this.zoom = zoomLevel;
    this.targetZoom = zoomLevel;
    this.isZooming = false;
  }

  // Update camera boundaries (call this when level loads)
  setBoundaries(minX, maxX, minY, maxY) {
    this.minX = minX;
    this.maxX = maxX;
    this.minY = minY;
    this.maxY = maxY;
  }

  // Enter modal mode - switch to modal state
  enterModalMode() {
    this.mode = 'modal';
    console.log('Camera entering modal mode');
  }

  // Exit modal mode - return to follow state
  exitModalMode() {
    this.mode = 'follow';
    console.log('Camera exiting modal mode - returning to follow');
  }

  // Combined zoom and modal positioning for showing modal
  zoomToPlayerWithModal(zoomLevel, duration = 0.8) {
    // Enter modal mode first (this stops follow() from updating camera)
    this.enterModalMode();

    // Calculate and set camera frame directly
    if (window.game && window.game.player) {
      const target = window.game.player;
      const targetScreenX = this.canvas.width * 0.25; // 25% from left
      const targetScreenY = this.canvas.height * 0.5;  // 50% from top

      // Calculate camera position: player world - desired screen position
      const cameraX = target.x - targetScreenX;
      const cameraY = target.y - targetScreenY;

      console.log('Setting camera frame directly:', {
        screenSize: { width: this.canvas.width, height: this.canvas.height },
        playerWorld: { x: target.x, y: target.y },
        desiredScreenPos: { x: targetScreenX, y: targetScreenY },
        desiredPercentage: { x: '25%', y: '50%' },
        cameraPosition: { x: cameraX, y: cameraY },
        zoom: zoomLevel
      });

      // Set camera position and zoom directly - no animation, no boundaries
      this.x = cameraX;
      this.y = cameraY;
      this.targetX = cameraX;
      this.targetY = cameraY;
      this.zoom = zoomLevel;
      this.targetZoom = zoomLevel;

      // Verify the calculation worked
      console.log('Player should now be at screen:', {
        x: target.x - this.x,
        y: target.y - this.y
      });
    } else {
      // Fallback to regular zoom if no player found
      this.zoomToPlayer(zoomLevel, duration);
    }
  }

  // Combined zoom out and exit modal mode for hiding modal
  zoomOutFromModal(duration = 0.5) {
    // Exit modal mode
    this.exitModalMode();

    // Then zoom out
    this.zoomOut(duration);
  }
}
