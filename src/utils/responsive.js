// Responsive state management
// Provides consistent mobile/desktop detection across the app

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
          window.dispatchEvent(new CustomEvent('responsiveStateChange', {
            detail: {
              isMobile: this.isMobile,
              wasMobile: wasMobile
            }
          }));
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

// Export convenience function
export const isMobile = () => responsive.mobile;