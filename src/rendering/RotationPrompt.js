// Rotation Prompt
// Shows a full-screen prompt asking users to rotate their device to landscape

import { shouldForceRotation, getOrientation } from '../utils/responsive.js';

export class RotationPrompt {
  constructor() {
    this.overlay = null;
    this.isShowing = false;
    this.checkInterval = null;
  }

  create() {
    // Create overlay element
    this.overlay = document.createElement('div');
    this.overlay.id = 'rotation-prompt';
    this.overlay.className = 'rotation-prompt';
    this.overlay.innerHTML = `
      <div class="rotation-prompt-content">
        <div class="rotation-icon">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <rect x="15" y="25" width="50" height="30" rx="4" stroke="white" stroke-width="2" fill="none"/>
            <path d="M 60 40 L 70 35 L 70 45 Z" fill="white"/>
          </svg>
        </div>
        <p class="rotation-message">Please rotate your device</p>
        <p class="rotation-submessage">This game works best in landscape mode</p>
      </div>
    `;

    document.body.appendChild(this.overlay);

    // Add CSS styles
    this.addStyles();

    // Start checking orientation
    this.startOrientationCheck();
  }

  addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .rotation-prompt {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        font-family: 'Press Start 2P', monospace, system-ui, -apple-system;
      }

      .rotation-prompt.visible {
        display: flex;
      }

      .rotation-prompt-content {
        text-align: center;
        color: white;
        padding: 2rem;
      }

      .rotation-icon {
        margin: 0 auto 2rem;
        animation: rotate-phone 2s ease-in-out infinite;
      }

      .rotation-message {
        font-size: 1.2rem;
        margin: 1rem 0 0.5rem;
        line-height: 1.6;
      }

      .rotation-submessage {
        font-size: 0.7rem;
        opacity: 0.7;
        margin: 0;
        line-height: 1.4;
      }

      @keyframes rotate-phone {
        0%, 100% {
          transform: rotate(0deg);
        }
        25% {
          transform: rotate(-90deg);
        }
        75% {
          transform: rotate(-90deg);
        }
      }

      @media (orientation: landscape) {
        .rotation-prompt {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  show() {
    if (!this.overlay) {
      this.create();
    }
    this.overlay.classList.add('visible');
    this.isShowing = true;
  }

  hide() {
    if (this.overlay) {
      this.overlay.classList.remove('visible');
      this.isShowing = false;
    }
  }

  startOrientationCheck() {
    // Initial check
    this.checkOrientation();

    // Check on orientation change
    window.addEventListener('orientationchange', () => {
      setTimeout(() => this.checkOrientation(), 100);
    });

    // Also check on resize (for browsers that don't support orientationchange)
    window.addEventListener('resize', () => {
      clearTimeout(this.checkInterval);
      this.checkInterval = setTimeout(() => this.checkOrientation(), 150);
    });
  }

  checkOrientation() {
    if (shouldForceRotation()) {
      this.show();
    } else {
      this.hide();
    }
  }

  destroy() {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
    this.isShowing = false;
  }
}
