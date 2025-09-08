// UI System for portfolio Mario game
// Handles volume controls, debug info, progress tracking, and visual polish

import { gsap } from 'gsap';

export class UI {
  constructor(canvas, audioManager, mysteryBoxStateManager) {
    this.canvas = canvas;
    this.audioManager = audioManager;
    this.mysteryBoxStateManager = mysteryBoxStateManager;

    this.elements = new Map();
    this.isSetup = false;
    this.debugVisible = false;

    // Animation timelines for smooth UI transitions
    this.fadeInTimeline = null;
    this.fadeOutTimeline = null;
  }

  // Simple notification system for basic feedback
  showNotification(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
  }

  // Screen flash effect
  flashScreen(color = 'white', duration = 0.2) {
    document.body.style.backgroundColor = color;
    setTimeout(() => {
      document.body.style.backgroundColor = '';
    }, duration * 1000);
  }

  // Toggle debug display
  toggleDebug() {
    this.debugVisible = !this.debugVisible;
    console.log('Debug mode:', this.debugVisible ? 'ON' : 'OFF');
  }

  // Update method for game state
  update(gameState = {}) {
    // Could update UI elements here
  }

  // Cleanup
  destroy() {
    // Cleanup any UI elements
  }
}
