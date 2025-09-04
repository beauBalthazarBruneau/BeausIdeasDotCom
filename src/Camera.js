export class Camera {
  constructor(canvas) {
    this.canvas = canvas;
    this.x = 0;
    this.y = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.smoothing = 0.1;
    
    // Camera boundaries
    this.minX = 0;
    this.maxX = 2000; // Will be updated based on level size
    this.minY = -200;
    this.maxY = 600;
    
    // Viewport offset to center player
    this.offsetX = this.canvas.width / 2;
    this.offsetY = this.canvas.height / 2;
  }

  follow(target) {
    // Calculate target camera position (center target in viewport)
    this.targetX = target.x - this.offsetX;
    this.targetY = target.y - this.offsetY;
    
    // Apply boundaries
    this.targetX = Math.max(this.minX, Math.min(this.maxX - this.canvas.width, this.targetX));
    this.targetY = Math.max(this.minY, Math.min(this.maxY - this.canvas.height, this.targetY));
  }

  update() {
    // Smooth camera movement
    this.x += (this.targetX - this.x) * this.smoothing;
    this.y += (this.targetY - this.y) * this.smoothing;
  }

  apply(ctx) {
    ctx.save();
    ctx.translate(-this.x, -this.y);
  }

  restore(ctx) {
    ctx.restore();
  }

  // Convert screen coordinates to world coordinates
  screenToWorld(screenX, screenY) {
    return {
      x: screenX + this.x,
      y: screenY + this.y
    };
  }

  // Convert world coordinates to screen coordinates
  worldToScreen(worldX, worldY) {
    return {
      x: worldX - this.x,
      y: worldY - this.y
    };
  }

  // Update viewport size when canvas resizes
  resize(width, height) {
    this.offsetX = width / 2;
    this.offsetY = height / 2;
  }

  // Check if object is visible in camera view
  isVisible(x, y, width, height) {
    return !(x + width < this.x || 
             x > this.x + this.canvas.width ||
             y + height < this.y ||
             y > this.y + this.canvas.height);
  }
}
