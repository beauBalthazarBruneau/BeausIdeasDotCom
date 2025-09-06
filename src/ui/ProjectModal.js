// Project Details Modal
// Displays full project information when a collectible is collected

import { gsap } from 'gsap';

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
      background: transparent;
      display: none;
      z-index: 1000;
      pointer-events: none;
    `;
    
    // Create modal content
    const modal = document.createElement('div');
    modal.id = 'project-modal';
    modal.className = 'project-modal';
    modal.style.cssText = `
      background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
      border-radius: 15px;
      padding: 30px;
      width: 45%;
      height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.8);
      border: 2px solid #FFD700;
      position: fixed;
      top: 5vh;
      right: 2.5%;
      font-family: 'Arial', sans-serif;
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
        color: #FFD700;
        cursor: pointer;
        font-weight: bold;
        transition: color 0.3s ease;
      ">×</button>
      
      <div id="modal-content">
        <h2 id="project-title" style="
          color: #FFD700;
          font-size: 24px;
          margin: 0 0 10px 0;
          text-align: center;
        "></h2>
        
        <div id="project-subtitle" style="
          color: #aaa;
          font-size: 16px;
          text-align: center;
          margin-bottom: 20px;
        "></div>
        
        <div id="project-image-container" style="
          text-align: center;
          margin-bottom: 20px;
        ">
          <img id="project-image" style="
            max-width: 100%;
            max-height: 200px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
          ">
        </div>
        
        <div id="project-description" style="
          line-height: 1.6;
          margin-bottom: 20px;
          color: #ddd;
        "></div>
        
        <div id="project-technologies" style="
          margin-bottom: 20px;
        ">
          <h4 style="color: #FFD700; margin-bottom: 10px;">Technologies:</h4>
          <div id="tech-tags" style="
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          "></div>
        </div>
        
        <div id="project-links" style="
          text-align: center;
          margin-top: 25px;
        "></div>
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
  
  show(projectData, game = null) {
    if (this.isVisible) return;
    
    this.currentProject = projectData;
    this.currentGame = game; // Store game reference
    this.populateModal(projectData);
    
    // Update event handlers with current game reference
    if (this.updateGameReference) {
      this.updateGameReference(game);
    }
    
    this.isVisible = true;
    this.modalElement.style.display = 'block';
    
    // Zoom camera on player if game reference is provided
    if (game && game.camera && game.player) {
      game.camera.zoomToPlayer(1.5, 0.8); // 1.5x zoom, 0.8s duration
    }
    
    // Animate in - slide from right
    gsap.to(this.modal, {
      x: 0,
      opacity: 1,
      duration: 0.6,
      ease: "power3.out"
    });
    
    gsap.from('#modal-content > *', {
      x: 50,
      opacity: 0,
      duration: 0.7,
      stagger: 0.08,
      ease: "power2.out",
      delay: 0.3
    });
    
    console.log('Showing project modal for:', projectData.title);
  }
  
  hide(game = null) {
    if (!this.isVisible) return;
    
    // Zoom camera back out if game reference is provided
    if (game && game.camera) {
      game.camera.zoomOut(0.5); // 0.5s duration to zoom back out
    }
    
    // Animate out - slide to right
    gsap.to(this.modal, {
      x: '100%',
      opacity: 0,
      duration: 0.4,
      ease: "power2.in",
      onComplete: () => {
        this.modalElement.style.display = 'none';
        this.isVisible = false;
        // Reset position for next time
        gsap.set(this.modal, { x: '100%' });
      }
    });
    
    console.log('Hiding project modal');
  }
  
  populateModal(project) {
    // Title and subtitle
    document.getElementById('project-title').textContent = project.title;
    document.getElementById('project-subtitle').textContent = project.subtitle || '';
    
    // Image
    const imageContainer = document.getElementById('project-image-container');
    const imageElement = document.getElementById('project-image');
    if (project.image) {
      imageElement.src = project.image;
      imageElement.alt = project.title;
      imageContainer.style.display = 'block';
    } else {
      imageContainer.style.display = 'none';
    }
    
    // Description
    document.getElementById('project-description').textContent = project.description;
    
    // Technologies
    const techContainer = document.getElementById('tech-tags');
    techContainer.innerHTML = '';
    
    if (project.collectible) {
      // Split collectible string into individual technologies
      const technologies = project.collectible.split(/[,&+]/).map(tech => tech.trim());
      
      technologies.forEach(tech => {
        const tag = document.createElement('span');
        tag.style.cssText = `
          background: linear-gradient(135deg, #FFD700, #FFA500);
          color: #000;
          padding: 4px 12px;
          border-radius: 15px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
        `;
        tag.textContent = tech;
        techContainer.appendChild(tag);
      });
    }
    
    // Links
    const linksContainer = document.getElementById('project-links');
    linksContainer.innerHTML = '';
    
    if (project.links && project.links.length > 0) {
      project.links.forEach(link => {
        const linkButton = document.createElement('a');
        linkButton.href = link.url;
        linkButton.target = '_blank';
        linkButton.rel = 'noopener noreferrer';
        linkButton.textContent = link.title;
        linkButton.style.cssText = `
          display: inline-block;
          background: linear-gradient(135deg, #FF6B6B, #FF5722);
          color: white;
          padding: 12px 24px;
          margin: 0 8px;
          border-radius: 25px;
          text-decoration: none;
          font-weight: bold;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
        `;
        
        linkButton.addEventListener('mouseenter', () => {
          gsap.to(linkButton, { scale: 1.05, duration: 0.2 });
        });
        
        linkButton.addEventListener('mouseleave', () => {
          gsap.to(linkButton, { scale: 1, duration: 0.2 });
        });
        
        linksContainer.appendChild(linkButton);
      });
    }
  }
  
  destroy() {
    if (this.modalElement) {
      document.body.removeChild(this.modalElement);
      this.modalElement = null;
    }
  }
}
