// Responsive state management
// Provides consistent mobile/desktop detection across the app

/**
 * Detect if device is a phone (not tablet)
 * @returns {boolean} True if phone
 */
export function isMobile() {
  const hasTouch = navigator.maxTouchPoints > 0;
  const isSmallScreen = window.innerWidth < 768;
  return hasTouch && isSmallScreen;
}

/**
 * Detect if device is a tablet
 * @returns {boolean} True if tablet
 */
export function isTablet() {
  const hasTouch = navigator.maxTouchPoints > 0;
  const isMediumScreen =
    window.innerWidth >= 768 && window.innerWidth <= 1024;
  return hasTouch && isMediumScreen;
}

/**
 * Detect if device has touch capabilities
 * @returns {boolean} True if touch-capable
 */
export function isTouchDevice() {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  );
}

/**
 * Detect if device is iOS
 * @returns {boolean} True if iOS
 */
export function isIOS() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

/**
 * Detect if device is Android
 * @returns {boolean} True if Android
 */
export function isAndroid() {
  return /Android/.test(navigator.userAgent);
}

/**
 * Get current screen size
 * @returns {{width: number, height: number}} Screen dimensions
 */
export function getScreenSize() {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

/**
 * Get current device orientation
 * @returns {'portrait'|'landscape'} Current orientation
 */
export function getOrientation() {
  if (window.screen?.orientation?.type) {
    return window.screen.orientation.type.startsWith('portrait')
      ? 'portrait'
      : 'landscape';
  }
  return window.innerWidth < window.innerHeight ? 'portrait' : 'landscape';
}

/**
 * Get safe area insets for notched devices
 * @returns {{top: number, right: number, bottom: number, left: number}} Insets in pixels
 */
export function getSafeAreaInsets() {
  // Create a temporary element to read CSS env() values
  const div = document.createElement('div');
  div.style.position = 'fixed';
  div.style.top = 'env(safe-area-inset-top)';
  div.style.right = 'env(safe-area-inset-right)';
  div.style.bottom = 'env(safe-area-inset-bottom)';
  div.style.left = 'env(safe-area-inset-left)';
  document.body.appendChild(div);

  const computed = getComputedStyle(div);
  const insets = {
    top: parseInt(computed.top) || 0,
    right: parseInt(computed.right) || 0,
    bottom: parseInt(computed.bottom) || 0,
    left: parseInt(computed.left) || 0,
  };

  document.body.removeChild(div);
  return insets;
}

/**
 * Calculate viewport scale factor for canvas
 * @param {number} gameWidth - Target game width
 * @param {number} gameHeight - Target game height
 * @returns {number} Scale factor
 */
export function getViewportScale(gameWidth, gameHeight) {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  return Math.min(windowWidth / gameWidth, windowHeight / gameHeight);
}

/**
 * Check if rotation prompt should be shown
 * (phones in portrait mode)
 * @returns {boolean} True if should force rotation
 */
export function shouldForceRotation() {
  return isMobile() && getOrientation() === 'portrait';
}

export class ResponsiveManager {
  constructor() {
    this.mobileBreakpoint = 768;
    this.isMobile = this.checkIsMobile();

    // Listen for resize events to update state
    this.setupResizeListener();
  }

  checkIsMobile() {
    return window.innerWidth < this.mobileBreakpoint;
  }

  setupResizeListener() {
    let resizeTimeout;

    window.addEventListener('resize', () => {
      // Debounce resize events
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const wasMobile = this.isMobile;
        this.isMobile = this.checkIsMobile();

        // Dispatch custom event if state changed
        if (wasMobile !== this.isMobile) {
          window.dispatchEvent(
            new CustomEvent('responsiveStateChange', {
              detail: {
                isMobile: this.isMobile,
                wasMobile: wasMobile,
              },
            })
          );
        }
      }, 150);
    });
  }

  // Getter for current state
  get mobile() {
    return this.isMobile;
  }

  // Static method for one-off checks (backwards compatibility)
  static isMobile() {
    return window.innerWidth < 768;
  }
}

// Create singleton instance
export const responsive = new ResponsiveManager();
