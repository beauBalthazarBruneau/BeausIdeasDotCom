import { InputHandler } from './InputHandler.js';
import { Camera } from './Camera.js';
import { Physics } from './Physics.js';
import { Player } from './Player.js';
import { ParticleSystem, Particle } from './ParticleSystem.js';
import { Level } from './Level.js';
import { Background } from './Background.js';
import { AudioManager } from './AudioManager.js';
import { gsap } from 'gsap';

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
    this.particleSystem = new ParticleSystem();
    
    // Create level first (defines spawn point and platforms)
    this.level = new Level(this.physics);
    
    // Create background with parallax layers
    this.background = new Background(canvas, this.level.getDimensions().width);
    
    // Set spawn point and death system from level
    this.spawnPoint = this.level.getSpawnPoint();
    this.deathY = this.level.getDimensions().groundLevel + 200; // Below ground level
    this.respawnCount = 0;
    
    // Create player at level spawn point
    this.player = new Player(this.spawnPoint.x, this.spawnPoint.y, this.physics, this.particleSystem);
    
    // Initialize audio manager
    this.audioManager = new AudioManager();
    
    // Set up camera boundaries based on level
    this.camera.setBoundaries(0, this.level.getDimensions().width, -200, this.level.getDimensions().groundLevel);
    
    // Setup player event listeners for audio and effects
    this.setupPlayerEvents();
    
    // Setup debug toggle
    this.setupDebugToggle();
    
    // Setup audio controls
    this.setupAudioControls();
    
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
    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Set canvas to full viewport
    this.canvas.width = viewportWidth;
    this.canvas.height = viewportHeight;
    
    // Update CSS size to match
    this.canvas.style.width = viewportWidth + 'px';
    this.canvas.style.height = viewportHeight + 'px';
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
    if (this.background) {
      this.background.resize(this.canvas);
    }
  }

  gameLoop(currentTime) {
    // Calculate delta time
    this.deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    this.gameTime += this.deltaTime;
    
    // Cap delta time to prevent issues
    const cappedDelta = Math.min(this.deltaTime, 16.667); // Cap at 16.667ms (60 FPS)
    
    // Update
    this.update(cappedDelta);
    
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
    
    // Update particle system with enhanced environmental effects
    this.particleSystem.update(deltaTime, this.camera, this.level.getDimensions().width, this.gameTime);
    
    // Update background (for animated elements like clouds)
    this.background.update(deltaTime);
    
    // Check for death (falling off the world)
    this.checkPlayerDeath();
    
    // Update camera to follow player
    this.camera.follow(this.player);
    this.camera.update();
  }

  render() {
    // Clear canvas with temporary solid color (will be replaced by background)
    this.ctx.fillStyle = '#87CEEB';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw parallax background layers (before camera transform)
    this.background.draw(this.ctx, this.camera);
    
    // Apply camera transform for world objects
    this.camera.apply(this.ctx);
    
    // Draw level platforms
    this.level.draw(this.ctx);
    
    // Draw particles behind player
    this.particleSystem.draw(this.ctx);
    
    // Draw player
    this.player.draw(this.ctx);
    
    // Restore camera transform
    this.camera.restore(this.ctx);
    
    // Draw UI (after camera restore so it's in screen space)
    this.drawUI();
  }


  drawUI() {
    // Draw simple UI elements
    this.ctx.fillStyle = 'white';
    this.ctx.font = '16px monospace';
    this.ctx.fillText('Arrow Keys/WASD: Move | Space/Up: Double Jump | F1: Debug', 10, 30);
    
    if (this.debugMode) {
      this.ctx.fillText('Debug Mode ON', 10, 50);
    }
  }

  checkPlayerDeath() {
    // Check if player has fallen off the world
    if (this.player.y > this.deathY) {
      this.respawnPlayer();
    }
  }

  respawnPlayer() {
    console.log('Player died! Respawning...');
    
    // Increment respawn counter
    this.respawnCount++;
    
    // Create death particle effect
    if (this.particleSystem) {
      this.createDeathEffect(this.player.x, this.player.y);
    }
    
    // Reset player position and state
    this.player.respawn(this.spawnPoint.x, this.spawnPoint.y);
    
    // Reset camera to follow respawned player smoothly
    this.camera.x = 0;
    this.camera.y = 0;
    this.camera.targetX = 0;
    this.camera.targetY = 0;
  }

  createDeathEffect(x, y) {
    // Create a burst of particles at death location
    const numParticles = 15;
    
    for (let i = 0; i < numParticles; i++) {
      const angle = (Math.PI * 2 * i) / numParticles;
      const speed = 4 + Math.random() * 6;
      const size = 3 + Math.random() * 5;
      
      const particle = new Particle(x, y, {
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2, // Slight upward bias
        life: 800 + Math.random() * 400, // 800-1200ms
        size: size,
        color: '#FF4444', // Red death particles
        gravity: 0.1,
        friction: 0.98,
        fadeOut: true
      });
      
      this.particleSystem.particles.push(particle);
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
      <div class="debug-line">Jumps: ${this.player.jumpsRemaining}/${this.player.maxJumps}</div>
      <div class="debug-line">Deaths: ${this.respawnCount}</div>
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

  // Setup player event listeners for audio and visual effects
  setupPlayerEvents() {
    // Store previous player state to detect changes
    this.prevPlayerState = {
      isGrounded: false,
      jumpsRemaining: 2,
      animationState: 'idle'
    };
    
    // We'll check these in the update loop since we don't have direct events
    this.playerEventChecks = true;
  }

  // Check for player events and trigger audio/effects
  checkPlayerEvents() {
    const currentState = {
      isGrounded: this.player.isGrounded,
      jumpsRemaining: this.player.jumpsRemaining,
      animationState: this.player.animationState
    };
    
    // Detect jump
    if (currentState.jumpsRemaining < this.prevPlayerState.jumpsRemaining) {
      if (currentState.jumpsRemaining === 1) {
        // First jump
        this.audioManager.playJump();
        this.camera.lightShake();
      } else if (currentState.jumpsRemaining === 0) {
        // Double jump
        this.audioManager.playDoubleJump();
        this.camera.lightShake();
      }
    }
    
    // Detect landing
    if (currentState.isGrounded && !this.prevPlayerState.isGrounded) {
      this.audioManager.playLand();
      this.camera.lightShake();
    }
    
    this.prevPlayerState = { ...currentState };
  }

  // Setup audio control keys
  setupAudioControls() {
    document.addEventListener('keydown', (e) => {
      switch (e.code) {
        case 'KeyM':
          e.preventDefault();
          this.audioManager.toggleMute();
          this.showAudioFeedback(this.audioManager.isMuted() ? 'Audio Muted' : 'Audio Unmuted');
          break;
        case 'Equal': // + key
        case 'NumpadAdd':
          e.preventDefault();
          this.audioManager.setSFXVolume(Math.min(1, this.audioManager.getSFXVolume() + 0.1));
          this.showAudioFeedback(`Volume: ${Math.round(this.audioManager.getSFXVolume() * 100)}%`);
          break;
        case 'Minus':
        case 'NumpadSubtract':
          e.preventDefault();
          this.audioManager.setSFXVolume(Math.max(0, this.audioManager.getSFXVolume() - 0.1));
          this.showAudioFeedback(`Volume: ${Math.round(this.audioManager.getSFXVolume() * 100)}%`);
          break;
        case 'KeyB': // B for background music (debug)
          e.preventDefault();
          this.audioManager.forceStartMusic();
          this.showAudioFeedback('Force starting background music');
          break;
      }
    });
    
    // Start background music on first user interaction
    const startAudio = () => {
      this.audioManager.startBackgroundMusic();
      document.removeEventListener('click', startAudio);
      document.removeEventListener('keydown', startAudio);
    };
    document.addEventListener('click', startAudio, { once: true });
    document.addEventListener('keydown', startAudio, { once: true });
  }

  // Show temporary audio feedback
  showAudioFeedback(message) {
    // Create temporary UI element for feedback
    const feedback = document.createElement('div');
    feedback.textContent = message;
    feedback.style.cssText = `
      position: fixed;
      top: 70px;
      left: 10px;
      color: white;
      background: rgba(0, 0, 0, 0.7);
      padding: 10px 15px;
      border-radius: 5px;
      font-family: monospace;
      font-size: 14px;
      z-index: 1000;
      pointer-events: none;
    `;
    
    document.body.appendChild(feedback);
    
    // Animate in
    gsap.fromTo(feedback, 
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.3 }
    );
    
    // Animate out and remove
    gsap.to(feedback, {
      opacity: 0,
      y: -20,
      duration: 0.3,
      delay: 1.5,
      onComplete: () => {
        if (feedback.parentNode) {
          feedback.parentNode.removeChild(feedback);
        }
      }
    });
  }

  // Enhanced update method with player event checking
  update(deltaTime) {
    if (this.state !== 'playing') return;
    
    // Update input handler
    this.inputHandler.update();
    
    // Update physics
    this.physics.update(deltaTime);
    
    // Update player
    this.player.update(deltaTime, this.inputHandler);
    
    // Check for player events (audio and effects)
    if (this.playerEventChecks) {
      this.checkPlayerEvents();
    }
    
    // Update particle system with enhanced environmental effects
    this.particleSystem.update(deltaTime, this.camera, this.level.getDimensions().width, this.gameTime);
    
    // Update background (for animated elements like clouds)
    this.background.update(deltaTime);
    
    // Check for death (falling off the world)
    this.checkPlayerDeath();
    
    // Update camera to follow player
    this.camera.follow(this.player);
    this.camera.update();
  }

  // Enhanced respawn with audio and screen shake
  respawnPlayer() {
    console.log('Player died! Respawning...');
    
    // Audio and visual effects
    this.audioManager.playDeath();
    this.camera.heavyShake();
    
    // Increment respawn counter
    this.respawnCount++;
    
    // Create death particle effect
    if (this.particleSystem) {
      this.createDeathEffect(this.player.x, this.player.y);
    }
    
    // Reset player position and state with delay for effect
    setTimeout(() => {
      this.player.respawn(this.spawnPoint.x, this.spawnPoint.y);
      this.audioManager.playRespawn();
      this.camera.mediumShake();
      
      // Reset camera to follow respawned player smoothly
      this.camera.x = 0;
      this.camera.y = 0;
      this.camera.targetX = 0;
      this.camera.targetY = 0;
    }, 200); // Small delay for dramatic effect
  }

  // Enhanced UI with audio controls
  drawUI() {
    // Draw main UI elements
    this.ctx.fillStyle = 'white';
    this.ctx.font = '16px monospace';
    this.ctx.fillText('Arrow Keys/WASD: Move | Space/Up: Double Jump | F1: Debug', 10, 30);
    
    // Audio controls
    this.ctx.fillText('M: Mute | +/-: Volume', 10, 50);
    
    if (this.debugMode) {
      this.ctx.fillText('Debug Mode ON', 10, 70);
      
      // Enhanced debug info with audio status
      const audioStatus = this.audioManager.isMuted() ? 'MUTED' : `${Math.round(this.audioManager.getSFXVolume() * 100)}%`;
      this.ctx.fillText(`Audio: ${audioStatus}`, 10, 90);
    }
  }

  // Enhanced pause/resume with audio
  pause() {
    this.state = 'paused';
    this.audioManager.onGamePause();
  }

  resume() {
    this.state = 'playing';
    this.audioManager.onGameResume();
  }

  destroy() {
    // Enhanced cleanup
    this.audioManager.destroy();
    this.physics.destroy();
    this.camera.stopShake();
  }
}
