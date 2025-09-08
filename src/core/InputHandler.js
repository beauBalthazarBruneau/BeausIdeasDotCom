// Input handler for portfolio Mario game
export class InputHandler {
  constructor() {
    this.keys = {
      left: false,
      right: false,
      up: false,
      space: false,
      d: false, // debug mode toggle
    };

    this.previousKeys = { ...this.keys }; // Initialize previousKeys

    this.keyMap = {
      ArrowLeft: 'left',
      KeyA: 'left',
      ArrowRight: 'right',
      KeyD: 'right',
      ArrowUp: 'up',
      KeyW: 'up',
      Space: 'space',
    };

    this.setupEventListeners();
  }

  setupEventListeners() {
    document.addEventListener('keydown', (e) => {
      const action = this.keyMap[e.code];
      if (action && this.keys.hasOwnProperty(action)) {
        this.keys[action] = true;
        e.preventDefault();
      }
    });

    document.addEventListener('keyup', (e) => {
      const action = this.keyMap[e.code];
      if (action && this.keys.hasOwnProperty(action)) {
        this.keys[action] = false;
        e.preventDefault();
      }
    });

    // Prevent context menu on right click
    document.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  isPressed(key) {
    return this.keys[key] || false;
  }

  // For single press detection (useful for jumping)
  wasPressed(key) {
    if (this.keys[key] && !this.previousKeys[key]) {
      return true;
    }
    return false;
  }

  update() {
    // Store previous frame keys for single press detection
    this.previousKeys = { ...this.keys };
  }
}
