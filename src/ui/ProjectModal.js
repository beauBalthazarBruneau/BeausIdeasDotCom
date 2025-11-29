// Project Details Modal
// Displays full project information when a collectible is collected

import { gsap } from 'gsap';
import { isMobile } from '@utils/responsive';

export class ProjectModal {
  constructor() {
    this.isVisible = false;
    this.modalElement = null;
    this.currentProject = null;

    this.createModalHTML();
    this.setupEventListeners();
  }

  createModalHTML() {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.id = 'project-modal-overlay';
    overlay.className = 'project-modal-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.3);
      display: none;
      z-index: 1000;
      pointer-events: none;
    `;

    // Create modal content
    const modal = document.createElement('div');
    modal.id = 'project-modal';
    modal.className = 'project-modal';
    // Use responsive state manager

    modal.style.cssText = `
      background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
      border-radius: 15px;
      padding: 30px;
      width: calc(50% - 40px);
      height: calc(100vh - 40px);
      overflow-y: auto;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.8);
      border: 2px solid #666;
      position: fixed;
      top: 20px;
      right: 20px;
      font-family: monospace;
      color: white;
      transform: translateX(100%);
      opacity: 0;
      pointer-events: auto;
    `;

    modal.innerHTML = `
      <button id="modal-close" style="
        position: absolute;
        top: 15px;
        right: 20px;
        background: none;
        border: none;
        font-size: 24px;
        color: #aaa;
        cursor: pointer;
        font-weight: bold;
        transition: color 0.3s ease;
      ">×</button>
      
      <div id="modal-content">
        <h2 id="project-title" style="
          color: #ccc;
          font-size: 24px;
          margin: 0 0 20px 0;
          text-align: center;
          font-family: monospace;
        "></h2>

        <div id="project-content" style="
          line-height: 1.6;
          color: #ddd;
          overflow-y: auto;
          height: calc(100% - 60px);
          padding-right: 10px;
          margin-right: -10px;
          scrollbar-width: none;
          -ms-overflow-style: none;
        "></div>
      </div>
      <style>
        #project-content::-webkit-scrollbar {
          display: none;
        }
        #project-content img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 10px 0;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }
        #project-content a {
          color: #4A9EFF;
          text-decoration: none;
          transition: color 0.3s ease;
        }
        #project-content a:hover {
          color: #66B3FF;
        }
        #project-content blockquote {
          background: rgba(255, 255, 255, 0.05);
          border-left: 4px solid #4A9EFF;
          margin: 15px 0;
          padding: 10px 15px;
          font-style: italic;
          border-radius: 0 8px 8px 0;
        }
        #project-content h2, #project-content h3, #project-content h4 {
          color: #fff;
          margin-top: 20px;
          margin-bottom: 10px;
        }
      </style>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    this.modalElement = overlay;
    this.modal = modal;
  }

  setupEventListeners() {
    // Store current game reference for event handlers
    let currentGame = null;

    // Close modal when clicking overlay
    this.modalElement.addEventListener('click', (e) => {
      if (e.target === this.modalElement) {
        this.hide(currentGame);
      }
    });

    // Close button
    document.getElementById('modal-close').addEventListener('click', () => {
      this.hide(currentGame);
    });

    // Close with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible) {
        this.hide(currentGame);
      }
    });

    // Store method to update game reference
    this.updateGameReference = (game) => {
      currentGame = game;
    };
  }

  show(projectData, game = null, collectibleData = null) {
    if (this.isVisible) return;

    this.currentProject = projectData;
    this.currentGame = game; // Store game reference
    this.currentCollectible = collectibleData; // Store collectible data
    this.populateModal(projectData);

    // Add collectible sprite to modal if available
    this.addCollectibleSprite();

    // Update event handlers with current game reference
    if (this.updateGameReference) {
      this.updateGameReference(game);
    }

    this.isVisible = true;
    this.modalElement.style.display = 'block';

    // Pause the game and zoom camera on player and enter modal mode if game reference is provided
    if (game && game.camera && game.player) {
      game.pause(); // Pause game updates and input
      game.camera.zoomToPlayerWithModal(1.5, 0.8); // 1.5x zoom, 0.8s duration, positioned in left half
    }

    // Animate overlay fade in
    gsap.to(this.modalElement, {
      opacity: 1,
      duration: 0.4,
      ease: 'power2.out',
    });

    // Animate in - slide from right
    gsap.to(this.modal, {
      x: 0,
      opacity: 1,
      duration: 0.6,
      ease: 'power3.out',
    });

    gsap.from('#modal-content > *', {
      x: 50,
      opacity: 0,
      duration: 0.7,
      stagger: 0.08,
      ease: 'power2.out',
      delay: 0.3,
    });

    console.log('Showing project modal for:', projectData.title);
  }

  addCollectibleSprite() {
    // Remove any existing collectible sprite
    const existingSprite = document.getElementById('modal-collectible-sprite');
    if (existingSprite) {
      existingSprite.remove();
    }

    if (!this.currentCollectible || !this.currentCollectible.collectibleType) {
      return;
    }

    // Try to load larger version first, fallback to regular sprite
    this.loadLargeCollectibleSprite();
  }

  loadLargeCollectibleSprite() {
    const collectibleType = this.currentCollectible.collectibleType;

    // Try loading larger version first
    const largeSprite = new Image();
    largeSprite.onload = () => {
      this.renderCollectibleSprite(largeSprite);
    };
    largeSprite.onerror = () => {
      // Fallback to regular sprite if large version fails
      if (
        this.currentCollectible.spriteLoaded &&
        this.currentCollectible.sprite
      ) {
        this.renderCollectibleSprite(this.currentCollectible.sprite);
      }
    };
    largeSprite.src = `/images/collectibles/${collectibleType}-125.png`;
  }

  renderCollectibleSprite(spriteImage) {
    // Create canvas for collectible sprite (4x scale = 160x160)
    const canvas = document.createElement('canvas');
    canvas.id = 'modal-collectible-sprite';
    canvas.width = 160;
    canvas.height = 160;
    canvas.style.cssText = `
      position: fixed;
      bottom: 50%;
      left: 25%;
      transform: translate(-50%, 50%);
      z-index: 1001;
      pointer-events: none;
    `;

    const ctx = canvas.getContext('2d');

    // Apply intense effects like in the collectible
    ctx.save();

    // Center the drawing (4x scale)
    ctx.translate(80, 80);

    // Intense shadow effect (scaled up)
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 50;
    ctx.shadowOffsetX = 12;
    ctx.shadowOffsetY = 12;

    // Draw shadow layer (4x scale = 160x160)
    ctx.drawImage(spriteImage, -80, -80, 160, 160);

    // Intense white glow (scaled up)
    ctx.shadowColor = 'rgba(255, 255, 255, 1.0)';
    ctx.shadowBlur = 60;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Draw glow layer (4x scale = 160x160)
    ctx.drawImage(spriteImage, -80, -80, 160, 160);

    // Golden glow (scaled up)
    ctx.shadowColor = 'rgba(255, 215, 0, 0.8)';
    ctx.shadowBlur = 40;

    // Draw final sprite (4x scale = 160x160)
    ctx.drawImage(spriteImage, -80, -80, 160, 160);

    ctx.restore();

    // Add canvas to modal overlay (not modal itself)
    this.modalElement.appendChild(canvas);

    // Animate the collectible sprite in
    gsap.fromTo(
      canvas,
      {
        scale: 0,
        rotation: -180,
        opacity: 0,
      },
      {
        scale: 1,
        rotation: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'back.out(1.7)',
        delay: 0.2,
      }
    );

    // Add floating animation
    gsap.to(canvas, {
      y: -10,
      duration: 2,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });
  }

  hide(game = null) {
    // Remove collectible sprite
    const collectibleSprite = document.getElementById(
      'modal-collectible-sprite'
    );
    if (collectibleSprite) {
      collectibleSprite.remove();
    }
    if (!this.isVisible) return;

    // Resume game and zoom camera back out and exit modal mode if game reference is provided
    if (game && game.camera) {
      game.resume(); // Resume game updates and input
      game.camera.zoomOutFromModal(0.5); // 0.5s duration to zoom back out and exit modal mode
    }

    // Animate overlay fade out
    gsap.to(this.modalElement, {
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in',
    });

    // Animate out - slide to right
    gsap.to(this.modal, {
      x: '100%',
      opacity: 0,
      duration: 0.4,
      ease: 'power2.in',
      onComplete: () => {
        this.modalElement.style.display = 'none';
        this.isVisible = false;
        // Reset position for next time
        gsap.set(this.modal, { x: '100%' });
      },
    });

    console.log('Hiding project modal');
  }

  populateModal(project) {
    // Title
    document.getElementById('project-title').textContent = project.title;

    // Rich content - support both new 'content' field and legacy 'description' field
    const contentContainer = document.getElementById('project-content');
    const content =
      project.content || project.description || 'No content available.';

    // For now, treat content as HTML (in the future, could add markdown parsing)
    // Basic XSS protection - sanitize dangerous elements
    const sanitizedContent = this.sanitizeHTML(content);
    contentContainer.innerHTML = sanitizedContent;
  }

  // Basic HTML sanitization to prevent XSS attacks
  sanitizeHTML(html) {
    // Create a temporary div to parse the HTML
    const temp = document.createElement('div');
    temp.innerHTML = html;

    // Remove potentially dangerous elements and attributes
    const dangerousElements = ['script', 'iframe', 'object', 'embed', 'form'];
    dangerousElements.forEach((tag) => {
      const elements = temp.querySelectorAll(tag);
      elements.forEach((el) => el.remove());
    });

    // Remove dangerous attributes
    const allElements = temp.querySelectorAll('*');
    allElements.forEach((el) => {
      // Remove event handlers and dangerous attributes
      const attrs = el.attributes;
      for (let i = attrs.length - 1; i >= 0; i--) {
        const attr = attrs[i];
        if (attr.name.startsWith('on') || attr.name === 'javascript:') {
          el.removeAttribute(attr.name);
        }
      }
    });

    return temp.innerHTML;
  }

  destroy() {
    if (this.modalElement) {
      document.body.removeChild(this.modalElement);
      this.modalElement = null;
    }
  }
}
