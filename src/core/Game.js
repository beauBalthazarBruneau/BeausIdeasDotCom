// Portfolio Mario game main class
import { InputHandler } from './InputHandler.js';
import { Camera } from './Camera.js';
import { Physics } from './Physics.js';
import { Player } from '../entities/Player.js';
import { ParticleSystem, Particle } from '../systems/ParticleSystem.js';
import { Level } from '../world/Level.js';
import { WorldTransitionManager } from '../world/WorldTransitionManager.js';
import { Background } from '../systems/Background.js';
import { AudioManager } from '../systems/AudioManager.js';
import { MysteryBox } from '../entities/MysteryBox.js';
import { Collectible } from '../entities/Collectible.js';
import {
  ProjectManager,
  MysteryBoxStateManager,
} from '../managers/ProjectData.js';
import { UI, ProjectModal } from '../ui/index.js';
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
    this.showGrid = false; // Grid overlay toggle

    // Game statistics
    this.respawnCount = 0;
    this.startTime = Date.now();

    // Simple game state tracking
    this.gameState = {
      playerStartPosition: { x: 100, y: 550 },
      initialGameTime: 0,
      initialRespawnCount: 0,
    };

    // Initialize game systems
    this.setupCanvas();
    this.inputHandler = new InputHandler();
    this.physics = new Physics(canvas, { debug: this.debugMode });
    this.camera = new Camera(canvas);
    this.particleSystem = new ParticleSystem();

    // Initialize world transition system
    this.worldTransitionManager = new WorldTransitionManager(this);
    this.doors = []; // Array to track doors in current world

    // Initialize with fallback level for now (will be replaced by world system)
    this.level = new Level(this.physics);

    // Create background with parallax layers (will update when world changes)
    this.background = new Background(canvas, this.level.getDimensions().width);

    // Set spawn point and death system from level
    this.spawnPoint = this.level.getSpawnPoint();
    this.deathY = this.level.getDimensions().groundLevel + 200; // Below ground level

    // Create player at level spawn point
    this.player = new Player(
      this.spawnPoint.x,
      this.spawnPoint.y,
      this.physics,
      this.particleSystem
    );

    // Initialize main hub after setup
    this.initializeMainHub();

    // Initialize audio manager
    this.audioManager = new AudioManager();

    // Initialize mystery box system
    this.mysteryBoxStateManager = new MysteryBoxStateManager();
    this.mysteryBoxes = [];
    this.createMysteryBoxes();

    // Initialize UI system
    this.ui = new UI(canvas, this.audioManager, this.mysteryBoxStateManager);

    // Initialize project modal
    this.projectModal = new ProjectModal();

    // Set up camera boundaries based on level
    this.camera.setBoundaries(
      0,
      this.level.getDimensions().width,
      -200,
      this.level.getDimensions().groundLevel
    );

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
    let gridPressed = false;

    document.addEventListener('keydown', (e) => {
      if (e.code === 'F1' && !debugPressed) {
        e.preventDefault();
        debugPressed = true;
        this.toggleDebug();
      }
      if (e.code === 'F2' && !gridPressed) {
        e.preventDefault();
        gridPressed = true;
        this.toggleGrid();
      }
    });

    document.addEventListener('keyup', (e) => {
      if (e.code === 'F1') {
        debugPressed = false;
      }
      if (e.code === 'F2') {
        gridPressed = false;
      }
    });

    // Set up global click handler for debug reset button
    document.addEventListener('click', (e) => {
      if (e.target && e.target.id === 'reset-mystery-boxes-btn') {
        e.preventDefault();
        console.log('Reset button clicked!');
        this.resetGameState();
      }
    });
  }

  toggleDebug() {
    this.debugMode = !this.debugMode;
    this.physics.toggleDebug();

    const debugInfo = document.getElementById('debug-info');
    if (debugInfo) {
      if (this.debugMode) {
        debugInfo.classList.add('visible');
        console.log('Debug mode ON');
      } else {
        debugInfo.classList.remove('visible');
        console.log('Debug mode OFF');
      }
    } else {
      console.warn('Debug info element not found!');
    }
  }

  toggleGrid() {
    this.showGrid = !this.showGrid;
    console.log('Grid overlay:', this.showGrid ? 'ON' : 'OFF');
  }

  handleResize() {
    this.resizeCanvas();
    this.camera.resize(this.canvas.width, this.canvas.height);
    if (this.background) {
      this.background.resize(this.canvas);
    }
  }

  // Initialize main hub world
  async initializeMainHub() {
    console.log('Initializing main hub world');
    this.level = await this.worldTransitionManager.transitionToMainHub({
      x: 100,
      y: 550,
    });
  }

  // Create tutorial mystery box
  createMysteryBoxes() {
    console.log('Creating tutorial mystery box');

    // Tutorial "project" data
    const tutorialData = {
      id: 'tutorial',
      title: 'Welcome to Mario Portfolio!',
      description:
        'Learn how to navigate this interactive portfolio game and discover my projects across different worlds.',
      longDescription: `Welcome to my interactive portfolio! This is a Mario-style platformer where you can explore my projects across different themed worlds.

🎮 **How to Play:**
• Use ARROW KEYS or WASD to move
• Press SPACE or UP ARROW to jump (double jump available!)
• Hit mystery boxes from below by jumping underneath them
• Collect the items that appear to learn about projects
• Enter doors to explore different themed worlds

🌟 **What You'll Find:**
• **Georgia Tech World** - Academic and research projects
• **Healthcare World** - Medical and health-related applications
• **Vibe Coding World** - Personal coding projects and experiments

Each world contains mystery boxes with detailed information about specific projects, including technologies used, challenges overcome, and links to live demos or repositories.

🎯 **Goal:** Explore all the worlds and discover the full range of my technical skills and project experience!

Good luck, and have fun exploring!`,
      technologies: [
        'JavaScript',
        'HTML5 Canvas',
        'Matter.js Physics',
        'GSAP Animations',
      ],
      status: 'Active',
      category: 'Tutorial',
      world: 'main-hub',
      collectible: '🎓 Tutorial Complete',
      links: {
        demo: window.location.href,
        github: '#',
      },
      features: [
        'Interactive Mario-style platformer gameplay',
        'Physics-based character movement and collisions',
        'Multiple themed worlds to explore',
        'Dynamic mystery box system for project discovery',
        'Responsive design for various screen sizes',
      ],
      challenges: [
        'Implementing smooth physics-based movement',
        'Creating responsive canvas-based UI',
        'Managing game state across multiple worlds',
        'Optimizing performance for smooth 60fps gameplay',
      ],
    };

    // Create tutorial mystery box at the beginning of the main world
    const tutorialBox = new MysteryBox(
      250, // X position - near the start but after spawn
      450, // Y position - floating above platforms
      this,
      {
        project: tutorialData,
        audioManager: this.audioManager,
      }
    );

    // Check if tutorial has been completed
    const savedState = this.mysteryBoxStateManager.getState('tutorial');
    if (savedState !== 'inactive') {
      tutorialBox.setState(savedState);
    }

    this.mysteryBoxes.push(tutorialBox);

    console.log('Created tutorial mystery box');
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

  render() {
    // Clear canvas with temporary solid color (will be replaced by background)
    this.ctx.fillStyle = '#87CEEB';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw parallax background layers (before camera transform)
    this.background.draw(this.ctx, this.camera);

    // Apply camera transform for world objects
    this.camera.apply(this.ctx);

    // Draw level platforms (use current world if available)
    const currentWorld = this.worldTransitionManager.getCurrentWorldInstance();
    if (currentWorld) {
      currentWorld.draw(this.ctx);
    } else {
      this.level.draw(this.ctx);
    }

    // Draw mystery boxes
    this.mysteryBoxes.forEach((mysteryBox) => mysteryBox.draw(this.ctx));

    // Draw doors
    if (this.doors && this.doors.length > 0) {
      this.doors.forEach((door) => door.draw(this.ctx));
    }

    // Draw particles behind player
    this.particleSystem.draw(this.ctx);

    // Draw player
    this.player.draw(this.ctx);


    // Draw grid overlay (in world space, before camera restore)
    if (this.showGrid) {
      this.drawGrid();
    }

    // Restore camera transform
    this.camera.restore(this.ctx);

    // Draw UI (after camera restore so it's in screen space)
    this.drawUI();
  }

  checkPlayerDeath() {
    // Check if player has fallen off the world
    if (this.player.y > this.deathY) {
      this.respawnPlayer();
    }
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
        fadeOut: true,
      });

      this.particleSystem.particles.push(particle);
    }
  }

  updateDebugInfo() {
    const debugInfo = document.getElementById('debug-info');
    const fps = Math.round(1000 / this.deltaTime);

    // Get audio status
    const sfxVolume = Math.round(this.audioManager.getSFXVolume() * 100);
    const musicVolume = Math.round(this.audioManager.getMusicVolume() * 100);
    const audioUnlocked = this.audioManager.audioContextUnlocked ? '✓' : '✗';
    const musicPlaying =
      this.audioManager.music && this.audioManager.music.playing() ? '♪' : '•';

    // Get particle counts
    const actionParticles = this.particleSystem.particles.length;
    const envParticles = this.particleSystem.environmentalParticles.length;

    // Get mystery box stats
    const mysteryBoxStats = this.mysteryBoxStateManager.getStats();

    debugInfo.innerHTML = `
      <div class="debug-section">
        <div class="debug-title">🎮 GAME INFO</div>
        <div class="debug-line">FPS: ${fps}</div>
        <div class="debug-line">Deaths: ${this.respawnCount}</div>
        <div class="debug-line">Game Time: ${Math.round(this.gameTime / 1000)}s</div>
      </div>
      
      <div class="debug-section">
        <div class="debug-title">🏃 PLAYER</div>
        <div class="debug-line">Position: ${Math.round(this.player.x)}, ${Math.round(this.player.y)}</div>
        <div class="debug-line">Velocity: ${Math.round(this.player.body.velocity.x)}, ${Math.round(this.player.body.velocity.y)}</div>
        <div class="debug-line">Grounded: ${this.player.isGrounded ? '✓' : '✗'}</div>
        <div class="debug-line">Jumps: ${this.player.jumpsRemaining}/${this.player.maxJumps}</div>
        <div class="debug-line">Animation: ${this.player.animationState} (${this.player.animationFrame})</div>
      </div>
      
      <div class="debug-section">
        <div class="debug-title">📷 CAMERA</div>
        <div class="debug-line">Position: ${Math.round(this.camera.x)}, ${Math.round(this.camera.y)}</div>
        <div class="debug-line">Shaking: ${this.camera.isShaking ? '📳' : '•'}</div>
      </div>
      
      <div class="debug-section">
        <div class="debug-title">🎵 AUDIO</div>
        <div class="debug-line">Context: ${audioUnlocked} | Music: ${musicPlaying}</div>
        <div class="debug-line">SFX Vol: ${sfxVolume}% | Music Vol: ${musicVolume}%</div>
        <div class="debug-line">Muted: ${this.audioManager.isMuted() ? '🔇' : '🔊'}</div>
      </div>
      
      <div class="debug-section">
        <div class="debug-title">✨ PARTICLES</div>
        <div class="debug-line">Action: ${actionParticles} | Environment: ${envParticles}</div>
        <div class="debug-line">Total: ${actionParticles + envParticles}</div>
      </div>
      
      <div class="debug-section">
        <div class="debug-title">🎁 MYSTERY BOXES</div>
        <div class="debug-line">Completed: ${mysteryBoxStats.completed}/${mysteryBoxStats.total} (${Math.round(mysteryBoxStats.completionPercentage)}%)</div>
        <div class="debug-line">Hit: ${mysteryBoxStats.hit} | Inactive: ${mysteryBoxStats.inactive}</div>
        <div class="debug-line">
          <button id="reset-mystery-boxes-btn" style="
            background: #ff4444;
            color: white;
            border: none;
            padding: 4px 8px;
            border-radius: 3px;
            font-size: 10px;
            cursor: pointer;
            margin-top: 2px;
          ">Complete Game Reset</button>
        </div>
      </div>
      
      <div class="debug-section">
        <div class="debug-title">🎮 CONTROLS</div>
        <div class="debug-line">M: Toggle Mute | +/-: Volume</div>
        <div class="debug-line">B: Force Music | F1: Debug</div>
        <div class="debug-line">F2: Grid Overlay (${this.showGrid ? 'ON' : 'OFF'})</div>
        <div class="debug-line">Space: Jump | WASD: Move</div>
        <div class="debug-line">R: Complete Game Reset</div>
      </div>
    `;
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
      animationState: 'idle',
    };

    // We'll check these in the update loop since we don't have direct events
    this.playerEventChecks = true;
  }

  // Check for player events and trigger audio/effects
  checkPlayerEvents() {
    const currentState = {
      isGrounded: this.player.isGrounded,
      jumpsRemaining: this.player.jumpsRemaining,
      animationState: this.player.animationState,
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
          this.showAudioFeedback(
            this.audioManager.isMuted() ? 'Audio Muted' : 'Audio Unmuted'
          );
          break;
        case 'Equal': // + key
        case 'NumpadAdd':
          e.preventDefault();
          this.audioManager.setSFXVolume(
            Math.min(1, this.audioManager.getSFXVolume() + 0.1)
          );
          this.showAudioFeedback(
            `Volume: ${Math.round(this.audioManager.getSFXVolume() * 100)}%`
          );
          break;
        case 'Minus':
        case 'NumpadSubtract':
          e.preventDefault();
          this.audioManager.setSFXVolume(
            Math.max(0, this.audioManager.getSFXVolume() - 0.1)
          );
          this.showAudioFeedback(
            `Volume: ${Math.round(this.audioManager.getSFXVolume() * 100)}%`
          );
          break;
        case 'KeyB': // B for background music (debug)
          e.preventDefault();
          this.audioManager.forceStartMusic();
          this.showAudioFeedback('Force starting background music');
          break;
        case 'KeyR': // R for reset mystery boxes (debug)
          if (this.debugMode) {
            // Only allow in debug mode
            e.preventDefault();
            this.resetAllMysteryBoxes();
          }
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
    gsap.fromTo(
      feedback,
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
      },
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
    const currentWorld = this.worldTransitionManager.getCurrentWorldInstance();
    const worldWidth = currentWorld
      ? currentWorld.getDimensions().width
      : this.level.getDimensions().width;
    this.particleSystem.update(
      deltaTime,
      this.camera,
      worldWidth,
      this.gameTime
    );

    // Update background (for animated elements like clouds)
    this.background.update(deltaTime);

    // Update mystery boxes and handle collisions
    this.mysteryBoxes.forEach((mysteryBox) => {
      mysteryBox.update(deltaTime);

      // Check for player hitting mystery box from below
      mysteryBox.checkPlayerCollision(this.player);

      // Check for player collecting spawned collectible
      mysteryBox.checkCollectibleCollection(this.player);

      // Sync state with state manager
      const currentState = this.mysteryBoxStateManager.getState(mysteryBox.id);
      if (currentState !== mysteryBox.state) {
        this.mysteryBoxStateManager.setState(mysteryBox.id, mysteryBox.state);
      }
    });

    // Update doors
    if (this.doors && this.doors.length > 0) {
      this.doors.forEach((door) => door.update(deltaTime));
    }

    // Check for door collisions (world transitions)
    this.worldTransitionManager.checkDoorCollisions(this.player);

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
    this.ctx.fillText(
      'Arrow Keys/WASD: Move | Space/Up: Double Jump | F1: Debug | F2: Grid',
      10,
      30
    );

    // Audio controls
    this.ctx.fillText('M: Mute | +/-: Volume', 10, 50);

    if (this.debugMode) {
      this.ctx.fillText('Debug Mode ON', 10, 70);

      // Enhanced debug info with audio status
      const audioStatus = this.audioManager.isMuted()
        ? 'MUTED'
        : `${Math.round(this.audioManager.getSFXVolume() * 100)}%`;
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

  // Reset all mystery boxes to their initial unopened state
  resetAllMysteryBoxes() {
    this.resetGameState();
  }

  // Comprehensive game state reset
  resetGameState() {
    console.log('Resetting all game state...');

    // Reset game statistics
    this.gameTime = 0;
    this.startTime = Date.now();
    this.respawnCount = 0;

    // Reset player position
    this.player.setPosition(this.spawnPoint.x, this.spawnPoint.y);
    this.player.respawn(this.spawnPoint.x, this.spawnPoint.y);

    // Reset camera
    this.camera.x = 0;
    this.camera.y = 0;
    this.camera.targetX = 0;
    this.camera.targetY = 0;
    this.camera.stopShake();
    this.camera.setZoom(1.0); // Reset zoom

    // Clear particles
    this.particleSystem.particles = [];
    this.particleSystem.environmentalParticles = [];

    // Reset mystery box state manager (clears localStorage)
    this.mysteryBoxStateManager.resetAll();

    // Reset all currently loaded mystery boxes in memory
    this.mysteryBoxes.forEach((mysteryBox) => {
      mysteryBox.setState('inactive');

      // Clean up any spawned collectibles
      if (mysteryBox.collectible) {
        mysteryBox.collectible.destroy();
        mysteryBox.collectible = null;
        mysteryBox.collectibleSpawned = false;
      }

      // Reset mystery box properties
      mysteryBox.hasBeenHit = false;
      mysteryBox.questionMarkVisible = true;
      mysteryBox.currentColor = mysteryBox.baseColor;
    });

    // Clear all cached worlds and reset world manager
    this.worldTransitionManager.clearAllWorlds();

    // Return to main hub
    this.worldTransitionManager.currentWorldId = 'main-hub';
    this.initializeMainHub();

    // Show feedback
    this.showAudioFeedback('Complete game reset!');

    console.log('Game state reset complete');
  }

  drawGrid() {
    const ctx = this.ctx;
    
    // Get visible area bounds in world coordinates
    const leftBound = this.camera.x - 100; // Add some padding
    const rightBound = this.camera.x + this.canvas.width + 100;
    const topBound = this.camera.y - 100;
    const bottomBound = this.camera.y + this.canvas.height + 100;
    
    // Calculate grid start points (snap to grid)
    const gridSize10 = 10;
    const gridSize50 = 50;
    
    const startX = Math.floor(leftBound / gridSize10) * gridSize10;
    const startY = Math.floor(topBound / gridSize10) * gridSize10;
    
    ctx.save();
    
    // Draw 10px grid lines (light)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    
    // Vertical lines
    for (let x = startX; x <= rightBound; x += gridSize10) {
      if (x % gridSize50 !== 0) { // Skip 50px grid lines
        ctx.moveTo(x, topBound);
        ctx.lineTo(x, bottomBound);
      }
    }
    
    // Horizontal lines  
    for (let y = startY; y <= bottomBound; y += gridSize10) {
      if (y % gridSize50 !== 0) { // Skip 50px grid lines
        ctx.moveTo(leftBound, y);
        ctx.lineTo(rightBound, y);
      }
    }
    
    ctx.stroke();
    
    // Draw 50px grid lines (darker) and coordinates
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    ctx.beginPath();
    
    // Vertical 50px lines with coordinates
    for (let x = Math.floor(leftBound / gridSize50) * gridSize50; x <= rightBound; x += gridSize50) {
      ctx.moveTo(x, topBound);
      ctx.lineTo(x, bottomBound);
      
      // Add coordinate labels on every 50px line - fixed to top of screen
      ctx.fillText(x.toString(), x, this.camera.y + 15);
    }
    
    // Horizontal 50px lines with coordinates
    for (let y = Math.floor(topBound / gridSize50) * gridSize50; y <= bottomBound; y += gridSize50) {
      ctx.moveTo(leftBound, y);
      ctx.lineTo(rightBound, y);
      
      // Add coordinate labels on every 50px line - fixed to left side of screen
      ctx.save();
      ctx.textAlign = 'left';
      // Position at left edge of screen (camera position + small offset)
      ctx.fillText(y.toString(), this.camera.x + 5, y);
      ctx.restore();
    }
    
    ctx.stroke();
    
    // Draw origin (0,0) with special highlighting
    if (leftBound <= 0 && rightBound >= 0 && topBound <= 0 && bottomBound >= 0) {
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      // Red cross at origin
      ctx.moveTo(-20, 0);
      ctx.lineTo(20, 0);
      ctx.moveTo(0, -20);
      ctx.lineTo(0, 20);
      ctx.stroke();
      
      // Origin label
      ctx.fillStyle = 'rgba(255, 0, 0, 0.9)';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('(0,0)', 10, -10);
    }
    
    // Draw player position marker
    const playerX = this.player.x;
    const playerY = this.player.y;
    
    ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Player: (${Math.round(playerX)}, ${Math.round(playerY)})`, playerX + 20, playerY - 30);
    
    ctx.restore();
  }

  destroy() {
    // Enhanced cleanup
    this.audioManager.destroy();
    this.physics.destroy();
    this.camera.stopShake();
  }
}
