// Touch Controls
// Virtual joystick and jump button for mobile devices

import { isTouchDevice, getSafeAreaInsets } from '../utils/responsive.js';

export class VirtualJoystick {
  constructor(inputHandler) {
    this.inputHandler = inputHandler;
    this.container = null;
    this.outer = null;
    this.inner = null;

    this.isActive = false;
    this.touchId = null;
    this.startX = 0;
    this.startY = 0;
    this.currentX = 0;
    this.currentY = 0;

    // Configuration
    this.outerRadius = 60; // 120px diameter
    this.innerRadius = 30; // 60px diameter
    this.deadZone = 10; // Minimum movement to register
    this.maxDistance = 50; // Maximum drag distance

    this.create();
  }

  create() {
    // Create container
    this.container = document.createElement('div');
    this.container.id = 'virtual-joystick';
    this.container.className = 'virtual-joystick';

    // Create outer circle
    this.outer = document.createElement('div');
    this.outer.className = 'joystick-outer';

    // Create inner circle (thumb)
    this.inner = document.createElement('div');
    this.inner.className = 'joystick-inner';

    this.outer.appendChild(this.inner);
    this.container.appendChild(this.outer);
    document.body.appendChild(this.container);

    // Add styles
    this.addStyles();

    // Add event listeners
    this.addEventListeners();

    console.log('Virtual joystick created');
  }

  addStyles() {
    const style = document.createElement('style');
    const safeArea = getSafeAreaInsets();

    style.textContent = `
      .virtual-joystick {
        position: fixed;
        bottom: calc(20px + ${safeArea.bottom}px);
        left: calc(20px + ${safeArea.left}px);
        width: ${this.outerRadius * 2}px;
        height: ${this.outerRadius * 2}px;
        z-index: 1000;
        display: none;
      }

      .virtual-joystick.visible {
        display: block;
      }

      .joystick-outer {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.1);
        border: 2px solid rgba(255, 255, 255, 0.3);
        position: relative;
        transition: background 0.1s;
      }

      .joystick-outer.active {
        background: rgba(255, 255, 255, 0.15);
        border-color: rgba(255, 255, 255, 0.5);
      }

      .joystick-inner {
        width: ${this.innerRadius * 2}px;
        height: ${this.innerRadius * 2}px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.4);
        border: 2px solid rgba(255, 255, 255, 0.6);
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        transition: background 0.1s;
        pointer-events: none;
      }

      .joystick-inner.active {
        background: rgba(255, 255, 255, 0.6);
      }

      /* Hide on desktop */
      @media (hover: hover) and (pointer: fine) {
        .virtual-joystick {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  addEventListeners() {
    this.container.addEventListener('touchstart', (e) =>
      this.handleTouchStart(e)
    );
    document.addEventListener('touchmove', (e) => this.handleTouchMove(e));
    document.addEventListener('touchend', (e) => this.handleTouchEnd(e));
    document.addEventListener('touchcancel', (e) => this.handleTouchEnd(e));
  }

  handleTouchStart(e) {
    e.preventDefault();
    const touch = e.changedTouches[0];
    this.touchId = touch.identifier;

    const rect = this.container.getBoundingClientRect();
    this.startX = rect.left + this.outerRadius;
    this.startY = rect.top + this.outerRadius;

    this.isActive = true;
    this.outer.classList.add('active');
    this.inner.classList.add('active');
  }

  handleTouchMove(e) {
    if (!this.isActive) return;

    const touch = Array.from(e.changedTouches).find(
      (t) => t.identifier === this.touchId
    );
    if (!touch) return;

    e.preventDefault();

    // Calculate drag offset from center
    const deltaX = touch.clientX - this.startX;
    const deltaY = touch.clientY - this.startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Clamp to max distance
    const clampedDistance = Math.min(distance, this.maxDistance);
    const angle = Math.atan2(deltaY, deltaX);

    // Calculate final position
    this.currentX = Math.cos(angle) * clampedDistance;
    this.currentY = Math.sin(angle) * clampedDistance;

    // Update inner circle position
    this.inner.style.transform = `translate(calc(-50% + ${this.currentX}px), calc(-50% + ${this.currentY}px))`;

    // Calculate normalized direction (-1 to 1)
    const normalizedX = this.currentX / this.maxDistance;

    // Apply dead zone
    if (Math.abs(normalizedX) < this.deadZone / this.maxDistance) {
      this.inputHandler.keys.left = false;
      this.inputHandler.keys.right = false;
    } else {
      // Emit movement to input handler
      if (normalizedX < 0) {
        this.inputHandler.keys.left = true;
        this.inputHandler.keys.right = false;
      } else {
        this.inputHandler.keys.left = false;
        this.inputHandler.keys.right = true;
      }
    }
  }

  handleTouchEnd(e) {
    const touch = Array.from(e.changedTouches).find(
      (t) => t.identifier === this.touchId
    );
    if (!touch) return;

    this.isActive = false;
    this.outer.classList.remove('active');
    this.inner.classList.remove('active');

    // Reset position
    this.inner.style.transform = 'translate(-50%, -50%)';
    this.currentX = 0;
    this.currentY = 0;

    // Stop movement
    this.inputHandler.keys.left = false;
    this.inputHandler.keys.right = false;

    this.touchId = null;
  }

  show() {
    if (this.container) {
      this.container.classList.add('visible');
    }
  }

  hide() {
    if (this.container) {
      this.container.classList.remove('visible');
    }
  }

  destroy() {
    if (this.container) {
      this.container.remove();
    }
  }
}

export class JumpButton {
  constructor(inputHandler, player) {
    this.inputHandler = inputHandler;
    this.player = player;
    this.button = null;
    this.isPressed = false;
    this.touchId = null;

    this.create();
  }

  create() {
    // Create button
    this.button = document.createElement('div');
    this.button.id = 'jump-button';
    this.button.className = 'jump-button';
    this.button.innerHTML = `
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <path d="M 20 10 L 20 30 M 10 20 L 20 10 L 30 20" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    document.body.appendChild(this.button);

    // Add styles
    this.addStyles();

    // Add event listeners
    this.addEventListeners();

    console.log('Jump button created');
  }

  addStyles() {
    const style = document.createElement('style');
    const safeArea = getSafeAreaInsets();

    style.textContent = `
      .jump-button {
        position: fixed;
        bottom: calc(20px + ${safeArea.bottom}px);
        right: calc(20px + ${safeArea.right}px);
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.2);
        border: 2px solid rgba(255, 255, 255, 0.4);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        transition: all 0.1s;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
      }

      .jump-button.visible {
        display: flex;
      }

      .jump-button.pressed {
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0.95);
      }

      .jump-button.disabled {
        opacity: 0.3;
      }

      .jump-button svg {
        pointer-events: none;
      }

      /* Hide on desktop */
      @media (hover: hover) and (pointer: fine) {
        .jump-button {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  addEventListeners() {
    this.button.addEventListener('touchstart', (e) => this.handleTouchStart(e));
    this.button.addEventListener('touchend', (e) => this.handleTouchEnd(e));
    this.button.addEventListener('touchcancel', (e) => this.handleTouchEnd(e));
  }

  handleTouchStart(e) {
    e.preventDefault();
    const touch = e.changedTouches[0];
    this.touchId = touch.identifier;

    this.isPressed = true;
    this.button.classList.add('pressed');

    // Trigger jump (use 'space' key like keyboard)
    this.inputHandler.keys.space = true;

    // Haptic feedback (if supported)
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  }

  handleTouchEnd(e) {
    const touch = Array.from(e.changedTouches).find(
      (t) => t.identifier === this.touchId
    );
    if (!touch) return;

    this.isPressed = false;
    this.button.classList.remove('pressed');

    // Release jump key (use 'space' key like keyboard)
    this.inputHandler.keys.space = false;

    this.touchId = null;
  }

  update() {
    // Update disabled state based on player's double jump availability
    if (this.player && !this.player.isGrounded && !this.player.canDoubleJump) {
      this.button.classList.add('disabled');
    } else {
      this.button.classList.remove('disabled');
    }
  }

  show() {
    if (this.button) {
      this.button.classList.add('visible');
    }
  }

  hide() {
    if (this.button) {
      this.button.classList.remove('visible');
    }
  }

  destroy() {
    if (this.button) {
      this.button.remove();
    }
  }
}

export class TouchControls {
  constructor(game) {
    this.game = game;
    this.joystick = null;
    this.jumpButton = null;

    if (isTouchDevice()) {
      this.initialize();
    }
  }

  initialize() {
    console.log('Initializing touch controls');

    // Create joystick
    this.joystick = new VirtualJoystick(this.game.inputHandler);
    this.joystick.show();

    // Create jump button
    this.jumpButton = new JumpButton(
      this.game.inputHandler,
      this.game.player
    );
    this.jumpButton.show();
  }

  update() {
    if (this.jumpButton) {
      this.jumpButton.update();
    }
  }

  destroy() {
    if (this.joystick) {
      this.joystick.destroy();
    }
    if (this.jumpButton) {
      this.jumpButton.destroy();
    }
  }
}
