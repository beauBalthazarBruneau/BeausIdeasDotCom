// Animation utility functions for game effects and transitions

import { lerp, clamp } from './math.js';

/**
 * Simple easing functions
 */
export const Easing = {
  linear: (t) => t,
  easeIn: (t) => t * t,
  easeOut: (t) => 1 - (1 - t) * (1 - t),
  easeInOut: (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  bounce: (t) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  },
  elastic: (t) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0
      ? 0
      : t === 1
      ? 1
      : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
};

/**
 * Animation state manager for simple tweens
 */
export class Tween {
  constructor(startValue, endValue, duration, easingFunc = Easing.linear) {
    this.startValue = startValue;
    this.endValue = endValue;
    this.duration = duration;
    this.easingFunc = easingFunc;
    this.currentTime = 0;
    this.isComplete = false;
    this.onComplete = null;
    this.onUpdate = null;
  }

  /**
   * Update the tween
   * @param {number} deltaTime - Time elapsed since last update
   * @returns {number} Current interpolated value
   */
  update(deltaTime) {
    if (this.isComplete) return this.endValue;

    this.currentTime += deltaTime;
    const progress = clamp(this.currentTime / this.duration, 0, 1);
    const easedProgress = this.easingFunc(progress);
    const currentValue = lerp(this.startValue, this.endValue, easedProgress);

    if (this.onUpdate) {
      this.onUpdate(currentValue, progress);
    }

    if (progress >= 1) {
      this.isComplete = true;
      if (this.onComplete) {
        this.onComplete();
      }
    }

    return currentValue;
  }

  /**
   * Reset the tween to start over
   */
  reset() {
    this.currentTime = 0;
    this.isComplete = false;
  }

  /**
   * Set completion callback
   * @param {Function} callback - Function to call when animation completes
   * @returns {Tween} This tween for chaining
   */
  then(callback) {
    this.onComplete = callback;
    return this;
  }

  /**
   * Set update callback
   * @param {Function} callback - Function to call on each update
   * @returns {Tween} This tween for chaining
   */
  onEachUpdate(callback) {
    this.onUpdate = callback;
    return this;
  }
}

/**
 * Create a simple tween
 * @param {number} start - Start value
 * @param {number} end - End value  
 * @param {number} duration - Duration in milliseconds
 * @param {Function} easing - Easing function
 * @returns {Tween} New tween instance
 */
export function tween(start, end, duration, easing = Easing.linear) {
  return new Tween(start, end, duration, easing);
}

/**
 * Animation frame manager for smooth animations
 */
export class AnimationFrame {
  constructor(frameDuration = 100) {
    this.frameDuration = frameDuration; // milliseconds per frame
    this.currentFrame = 0;
    this.frameCount = 0;
    this.elapsedTime = 0;
    this.isPlaying = true;
    this.loop = true;
  }

  /**
   * Update the animation frame
   * @param {number} deltaTime - Time elapsed since last update
   */
  update(deltaTime) {
    if (!this.isPlaying || this.frameCount === 0) return;

    this.elapsedTime += deltaTime;

    if (this.elapsedTime >= this.frameDuration) {
      this.currentFrame++;
      this.elapsedTime = 0;

      if (this.currentFrame >= this.frameCount) {
        if (this.loop) {
          this.currentFrame = 0;
        } else {
          this.currentFrame = this.frameCount - 1;
          this.isPlaying = false;
        }
      }
    }
  }

  /**
   * Set the total number of frames
   * @param {number} count - Frame count
   */
  setFrameCount(count) {
    this.frameCount = count;
    this.currentFrame = Math.min(this.currentFrame, count - 1);
  }

  /**
   * Play the animation
   */
  play() {
    this.isPlaying = true;
  }

  /**
   * Pause the animation
   */
  pause() {
    this.isPlaying = false;
  }

  /**
   * Reset to first frame
   */
  reset() {
    this.currentFrame = 0;
    this.elapsedTime = 0;
  }

  /**
   * Get current frame progress (0-1)
   * @returns {number} Frame progress
   */
  getProgress() {
    if (this.frameCount === 0) return 0;
    return this.currentFrame / (this.frameCount - 1);
  }
}

/**
 * Create a floating/bobbing animation
 * @param {number} amplitude - How high/low to float
 * @param {number} frequency - How fast to float
 * @param {number} offset - Phase offset
 * @returns {Function} Function that takes time and returns float offset
 */
export function createFloatAnimation(amplitude = 10, frequency = 0.002, offset = 0) {
  return (time) => {
    return Math.sin(time * frequency + offset) * amplitude;
  };
}

/**
 * Create a pulsing/scaling animation
 * @param {number} minScale - Minimum scale
 * @param {number} maxScale - Maximum scale
 * @param {number} frequency - Pulse frequency
 * @param {number} offset - Phase offset
 * @returns {Function} Function that takes time and returns scale value
 */
export function createPulseAnimation(minScale = 0.9, maxScale = 1.1, frequency = 0.003, offset = 0) {
  return (time) => {
    const normalized = (Math.sin(time * frequency + offset) + 1) / 2; // 0-1
    return lerp(minScale, maxScale, normalized);
  };
}

/**
 * Create a rotation animation
 * @param {number} speed - Rotation speed (radians per millisecond)
 * @param {number} offset - Starting angle offset
 * @returns {Function} Function that takes time and returns rotation angle
 */
export function createRotationAnimation(speed = 0.001, offset = 0) {
  return (time) => {
    return (time * speed + offset) % (Math.PI * 2);
  };
}

/**
 * Create a shake animation
 * @param {number} intensity - Shake intensity
 * @param {number} frequency - Shake frequency
 * @returns {Function} Function that takes time and returns shake offset {x, y}
 */
export function createShakeAnimation(intensity = 5, frequency = 0.01) {
  return (time) => {
    return {
      x: (Math.random() - 0.5) * intensity * Math.sin(time * frequency),
      y: (Math.random() - 0.5) * intensity * Math.cos(time * frequency),
    };
  };
}

/**
 * Smooth color transition between two hex colors
 * @param {string} color1 - Start color (hex)
 * @param {string} color2 - End color (hex)
 * @param {number} t - Interpolation factor (0-1)
 * @returns {string} Interpolated hex color
 */
export function lerpColor(color1, color2, t) {
  const hex1 = color1.replace('#', '');
  const hex2 = color2.replace('#', '');
  
  const r1 = parseInt(hex1.slice(0, 2), 16);
  const g1 = parseInt(hex1.slice(2, 4), 16);
  const b1 = parseInt(hex1.slice(4, 6), 16);
  
  const r2 = parseInt(hex2.slice(0, 2), 16);
  const g2 = parseInt(hex2.slice(2, 4), 16);
  const b2 = parseInt(hex2.slice(4, 6), 16);
  
  const r = Math.round(lerp(r1, r2, t));
  const g = Math.round(lerp(g1, g2, t));
  const b = Math.round(lerp(b1, b2, t));
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
