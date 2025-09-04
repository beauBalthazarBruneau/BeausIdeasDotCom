import { InputHandler } from './InputHandler.js';
import { Camera } from './Camera.js';
import { Physics } from './Physics.js';
import { Player } from './Player.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.lastTime = 0;
    this.gameTime = 0;
    this.deltaTime = 0;
    
    // Game state
    this.state = 'playing'; // playing, paused
    this.debugMode = false;
    
    // Initialize game systems
    this.setupCanvas();
    this.inputHandler = new InputHandler();
    this.physics = new Physics(canvas, { debug: this.debugMode });
    this.camera = new Camera(canvas);
    
    // Create player
    this.player = new Player(100, 300, this.physics);
    
    // Setup debug toggle
    this.setupDebugToggle();
    
    // Start game loop
    this.gameLoop = this.gameLoop.bind(this);
    requestAnimationFrame(this.gameLoop);
    
    // Handle resize
    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());
  }

  setupCanvas() {
    // Set canvas size to fill viewport while maintaining aspect ratio
    this.resizeCanvas();
  }

  resizeCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    
    this.ctx.scale(dpr, dpr);
    
    // Update CSS size
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
  }

  setupDebugToggle() {
    // Toggle debug mode with 'F1' key
    let debugPressed = false;
    
    document.addEventListener('keydown', (e) => {
      if (e.code === 'F1' && !debugPressed) {
        e.preventDefault();
        debugPressed = true;
        this.toggleDebug();
      }
    });
    
    document.addEventListener('keyup', (e) => {
      if (e.code === 'F1') {
        debugPressed = false;
      }
    });
  }

  toggleDebug() {
    this.debugMode = !this.debugMode;
    this.physics.toggleDebug();
    
    const debugInfo = document.getElementById('debug-info');
    if (this.debugMode) {
      debugInfo.classList.add('visible');
    } else {
      debugInfo.classList.remove('visible');
    }
  }

  handleResize() {
    this.resizeCanvas();
    this.camera.resize(this.canvas.width, this.canvas.height);
  }

  gameLoop(currentTime) {
    // Calculate delta time
    this.deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    this.gameTime += this.deltaTime;
    
    // Update
    this.update(this.deltaTime);
    
    // Render
    this.render();
    
    // Update debug info
    if (this.debugMode) {
      this.updateDebugInfo();
    }
    
    // Continue loop
    requestAnimationFrame(this.gameLoop);
  }

  update(deltaTime) {
    if (this.state !== 'playing') return;
    
    // Update input handler
    this.inputHandler.update();
    
    // Update physics
    this.physics.update(deltaTime);
    
    // Update player
    this.player.update(deltaTime, this.inputHandler);
    
    // Update camera to follow player
    this.camera.follow(this.player);
    this.camera.update();
  }

  render() {
    // Clear canvas
    this.ctx.fillStyle = '#87CEEB'; // Sky blue background
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Apply camera transform
    this.camera.apply(this.ctx);
    
    // Draw world (platforms will be drawn by physics debug or custom renderer)
    this.drawWorld();
    
    // Draw player
    this.player.draw(this.ctx);
    
    // Restore camera transform
    this.camera.restore(this.ctx);
    
    // Draw UI (after camera restore so it's in screen space)
    this.drawUI();
  }

  drawWorld() {
    // Draw platforms manually (since we're not using sprites yet)
    this.ctx.fillStyle = '#8B4513'; // Brown color for platforms
    
    // Get platform bodies from physics
    const ground1 = this.physics.getBody('ground1');
    const ground2 = this.physics.getBody('ground2');
    const ground3 = this.physics.getBody('ground3');
    
    if (ground1) {
      const pos = ground1.position;
      this.ctx.fillRect(pos.x - 200, pos.y - 30, 400, 60);
    }
    
    if (ground2) {
      const pos = ground2.position;
      this.ctx.fillRect(pos.x - 150, pos.y - 30, 300, 60);
    }
    
    if (ground3) {
      const pos = ground3.position;
      this.ctx.fillRect(pos.x - 200, pos.y - 30, 400, 60);
    }
    
    // Add some visual details
    this.ctx.fillStyle = '#228B22'; // Green grass on top
    if (ground1) {
      const pos = ground1.position;
      this.ctx.fillRect(pos.x - 200, pos.y - 35, 400, 10);
    }
    
    if (ground2) {
      const pos = ground2.position;
      this.ctx.fillRect(pos.x - 150, pos.y - 35, 300, 10);
    }
    
    if (ground3) {
      const pos = ground3.position;
      this.ctx.fillRect(pos.x - 200, pos.y - 35, 400, 10);
    }
  }

  drawUI() {
    // Draw simple UI elements
    this.ctx.fillStyle = 'white';
    this.ctx.font = '16px monospace';
    this.ctx.fillText('Arrow Keys/WASD: Move | Space/Up: Jump | F1: Debug', 10, 30);
    
    if (this.debugMode) {
      this.ctx.fillText('Debug Mode ON', 10, 50);
    }
  }

  updateDebugInfo() {
    const debugInfo = document.getElementById('debug-info');
    const fps = Math.round(1000 / this.deltaTime);
    
    debugInfo.innerHTML = `
      <div class="debug-line">FPS: ${fps}</div>
      <div class="debug-line">Player X: ${Math.round(this.player.x)}</div>
      <div class="debug-line">Player Y: ${Math.round(this.player.y)}</div>
      <div class="debug-line">Velocity X: ${this.player.body.velocity.x.toFixed(3)}</div>
      <div class="debug-line">Velocity Y: ${this.player.body.velocity.y.toFixed(3)}</div>
      <div class="debug-line">Grounded: ${this.player.isGrounded}</div>
      <div class="debug-line">Animation: ${this.player.animationState}</div>
      <div class="debug-line">Frame: ${this.player.animationFrame}</div>
      <div class="debug-line">Camera X: ${Math.round(this.camera.x)}</div>
      <div class="debug-line">Camera Y: ${Math.round(this.camera.y)}</div>
    `;
  }

  // Public methods for game control
  pause() {
    this.state = 'paused';
  }

  resume() {
    this.state = 'playing';
  }

  reset() {
    // Reset player position
    this.player.setPosition(100, 300);
    
    // Reset camera
    this.camera.x = 0;
    this.camera.y = 0;
    this.camera.targetX = 0;
    this.camera.targetY = 0;
  }

  destroy() {
    // Cleanup
    this.physics.destroy();
  }
}
