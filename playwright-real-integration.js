import { chromium, firefox, webkit } from 'playwright';
import fs from 'fs/promises';
import path from 'path';

class PlaywrightRealIntegration {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || 'http://localhost:5173';
    this.timeout = options.timeout || 30000;
    this.outputDir = options.outputDir || './test-results';
    this.browser = null;
    this.context = null;
    this.page = null;
    this.browserType = options.browserType || 'chromium';
    this.headless = options.headless !== false; // Default to headless
    this.consoleMessages = [];
  }

  async startBrowser() {
    console.log(`🚀 Starting ${this.browserType} browser (headless: ${this.headless})...`);
    
    // Select browser based on type
    const browserEngine = {
      chromium,
      firefox, 
      webkit
    }[this.browserType] || chromium;

    this.browser = await browserEngine.launch({
      headless: this.headless,
      slowMo: this.headless ? 0 : 100, // Slow down actions when not headless
    });

    this.context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
    });

    this.page = await this.context.newPage();

    // Set up console message collection
    this.page.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();
      this.consoleMessages.push({ type, text, timestamp: Date.now() });
      
      if (type === 'error' || type === 'warning') {
        console.log(`[BROWSER ${type.toUpperCase()}] ${text}`);
      }
    });

    // Set up error handling
    this.page.on('pageerror', (error) => {
      console.error(`[PAGE ERROR] ${error.message}`);
      this.consoleMessages.push({ type: 'pageerror', text: error.message, timestamp: Date.now() });
    });

    console.log('✅ Browser started successfully');
  }

  async stopBrowser() {
    if (this.browser) {
      console.log('🛑 Stopping browser...');
      await this.browser.close();
      this.browser = null;
      this.context = null;
      this.page = null;
    }
  }

  async executeAction(action) {
    if (!this.page) {
      throw new Error('Browser not started - call startBrowser() first');
    }

    console.log(`🎭 Executing Playwright action: ${action.type}`);

    try {
      switch (action.type) {
        case 'navigate':
          return await this.navigate(action.url);
        
        case 'waitFor':
          return await this.waitFor(action.selector, action.timeout);
        
        case 'screenshot':
          return await this.screenshot(action.name);
        
        case 'click':
          return await this.click(action.selector);
        
        case 'type':
          return await this.type(action.selector, action.text);
        
        case 'wait':
          return await this.wait(action.duration);
        
        case 'keyPress':
          return await this.keyPress(action.key);
        
        case 'performanceMetrics':
          return await this.getPageMetrics();
        
        case 'scrollTo':
          return await this.scrollTo(action.x || 0, action.y || 0);
        
        case 'hover':
          return await this.hover(action.selector);
        
        default:
          throw new Error(`Unknown action type: ${action.type}`);
      }
    } catch (error) {
      console.error(`❌ Action failed: ${error.message}`);
      throw error;
    }
  }

  async executeAssertion(assertion) {
    if (!this.page) {
      throw new Error('Browser not started - call startBrowser() first');
    }

    console.log(`🔍 Executing Playwright assertion: ${assertion.type}`);

    try {
      switch (assertion.type) {
        case 'elementExists':
          return await this.elementExists(assertion.selector);
        
        case 'elementVisible':
          return await this.elementVisible(assertion.selector);
        
        case 'titleContains':
          return await this.titleContains(assertion.text);
        
        case 'canvasNotEmpty':
          return await this.canvasNotEmpty(assertion.selector);
        
        case 'noConsoleErrors':
          return await this.noConsoleErrors(assertion.severity);
        
        case 'textContains':
          return await this.textContains(assertion.selector, assertion.text);
        
        case 'consoleContains':
          return await this.consoleContains(assertion.text);
        
        case 'audioContextExists':
          return await this.audioContextExists();
        
        case 'fpsAbove':
          return await this.fpsAbove(assertion.threshold);
        
        case 'memoryUsageBelow':
          return await this.memoryUsageBelow(assertion.threshold);
        
        case 'gameElementsVisible':
          return await this.gameElementsVisible();
        
        default:
          throw new Error(`Unknown assertion type: ${assertion.type}`);
      }
    } catch (error) {
      console.error(`❌ Assertion failed: ${error.message}`);
      throw error;
    }
  }

  // Action implementations
  async navigate(url) {
    const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;
    console.log(`🌐 Navigating to: ${fullUrl}`);
    
    const response = await this.page.goto(fullUrl, { 
      waitUntil: 'domcontentloaded',
      timeout: this.timeout 
    });
    
    return { success: true, url: fullUrl, status: response.status() };
  }

  async waitFor(selector, timeout = 5000) {
    console.log(`⏳ Waiting for element: ${selector}`);
    
    try {
      await this.page.waitForSelector(selector, { timeout });
      return { success: true, selector, found: true };
    } catch (error) {
      return { success: false, selector, found: false, error: error.message };
    }
  }

  async screenshot(name) {
    console.log(`📸 Taking screenshot: ${name}`);
    
    // Ensure output directory exists
    await fs.mkdir(this.outputDir, { recursive: true });
    
    const filename = `${name}-${Date.now()}.png`;
    const filepath = path.join(this.outputDir, filename);
    
    await this.page.screenshot({ 
      path: filepath,
      fullPage: true
    });
    
    return { success: true, filename, filepath };
  }

  async click(selector) {
    console.log(`👆 Clicking element: ${selector}`);
    await this.page.click(selector);
    return { success: true, selector };
  }

  async type(selector, text) {
    console.log(`⌨️  Typing into ${selector}: ${text}`);
    await this.page.fill(selector, text);
    return { success: true, selector, text };
  }

  async wait(duration) {
    console.log(`⏲️  Waiting for ${duration}ms`);
    await this.page.waitForTimeout(duration);
    return { success: true, duration };
  }

  async keyPress(key) {
    console.log(`⌨️  Pressing key: ${key}`);
    await this.page.keyboard.press(key);
    return { success: true, key };
  }

  async scrollTo(x, y) {
    console.log(`📜 Scrolling to: ${x}, ${y}`);
    await this.page.evaluate(({ x, y }) => {
      window.scrollTo(x, y);
    }, { x, y });
    return { success: true, x, y };
  }

  async hover(selector) {
    console.log(`🖱️  Hovering over: ${selector}`);
    await this.page.hover(selector);
    return { success: true, selector };
  }

  // Assertion implementations
  async elementExists(selector) {
    console.log(`🔍 Checking if element exists: ${selector}`);
    
    const element = await this.page.$(selector);
    const exists = element !== null;
    return { success: exists, selector, exists };
  }

  async elementVisible(selector) {
    console.log(`👁️  Checking if element is visible: ${selector}`);
    
    try {
      const isVisible = await this.page.isVisible(selector);
      return { success: isVisible, selector, visible: isVisible };
    } catch (error) {
      return { success: false, selector, visible: false, error: error.message };
    }
  }

  async titleContains(text) {
    console.log(`📄 Checking if title contains: ${text}`);
    
    const title = await this.page.title();
    const contains = title.includes(text);
    return { success: contains, text, title, contains };
  }

  async canvasNotEmpty(selector) {
    console.log(`🎨 Checking if canvas has content: ${selector}`);
    
    const hasContent = await this.page.evaluate((sel) => {
      const canvas = document.querySelector(sel);
      if (!canvas) return false;
      
      const context = canvas.getContext('2d');
      if (!context) return false;
      
      // Get image data from canvas
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Check if any pixel is not transparent
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] > 0) return true; // Alpha channel > 0
      }
      return false;
    }, selector);
    
    return { success: hasContent, selector, hasContent };
  }

  async noConsoleErrors(severity = 'error') {
    console.log(`📋 Checking for console ${severity}s`);
    
    const errors = this.consoleMessages.filter(msg => 
      severity === 'error' ? msg.type === 'error' || msg.type === 'pageerror' : msg.type === severity
    );
    
    const hasErrors = errors.length > 0;
    
    if (hasErrors) {
      console.log(`Found ${errors.length} console ${severity}(s):`);
      errors.forEach(error => console.log(`  - ${error.text}`));
    }
    
    return { success: !hasErrors, severity, errors, hasErrors };
  }

  async textContains(selector, text) {
    console.log(`📝 Checking if ${selector} contains text: ${text}`);
    
    try {
      const elementText = await this.page.textContent(selector);
      const contains = elementText && elementText.includes(text);
      return { success: contains, selector, text, elementText, contains };
    } catch (error) {
      return { success: false, selector, text, error: error.message };
    }
  }

  async consoleContains(text) {
    console.log(`📝 Checking if console contains: ${text}`);
    
    const found = this.consoleMessages.some(msg => msg.text.includes(text));
    return { success: found, text, found };
  }

  async audioContextExists() {
    console.log(`🎵 Checking if audio context exists`);
    
    const exists = await this.page.evaluate(() => {
      return window.AudioContext || window.webkitAudioContext ? true : false;
    });
    
    return { success: exists, exists };
  }

  async fpsAbove(threshold) {
    console.log(`🎮 Checking if FPS is above ${threshold}`);
    
    // Measure FPS over 2 seconds
    const fps = await this.page.evaluate(async (thresh) => {
      return new Promise((resolve) => {
        let frames = 0;
        const startTime = performance.now();
        
        function countFrame() {
          frames++;
          const elapsed = performance.now() - startTime;
          
          if (elapsed >= 2000) { // 2 seconds
            resolve(frames / (elapsed / 1000));
          } else {
            requestAnimationFrame(countFrame);
          }
        }
        
        requestAnimationFrame(countFrame);
      });
    }, threshold);
    
    const above = fps > threshold;
    return { success: above, fps, threshold, above };
  }

  async memoryUsageBelow(threshold) {
    console.log(`📊 Checking if memory usage is below ${threshold}MB`);
    
    const memoryInfo = await this.page.evaluate(() => {
      if (performance.memory) {
        return {
          used: performance.memory.usedJSHeapSize / 1024 / 1024, // Convert to MB
          total: performance.memory.totalJSHeapSize / 1024 / 1024,
          limit: performance.memory.jsHeapSizeLimit / 1024 / 1024
        };
      }
      return null;
    });
    
    if (!memoryInfo) {
      return { success: false, error: 'Memory info not available' };
    }
    
    const below = memoryInfo.used < threshold;
    return { success: below, memoryUsage: memoryInfo.used, threshold, below, memoryInfo };
  }

  async gameElementsVisible() {
    console.log(`🎮 Checking if Mario game elements are visible`);
    
    const gameState = await this.page.evaluate(() => {
      const canvas = document.querySelector('#game-canvas');
      const debugInfo = document.querySelector('#debug-info');
      const maintenance = document.querySelector('#maintenance-overlay');
      
      return {
        canvasExists: !!canvas,
        canvasVisible: canvas ? !canvas.hidden && canvas.offsetParent !== null : false,
        debugExists: !!debugInfo,
        maintenanceVisible: maintenance ? !maintenance.classList.contains('hidden') : false,
        gameLoaded: window.game ? true : false
      };
    });
    
    const isReady = gameState.canvasExists && gameState.canvasVisible;
    return { success: isReady, gameState };
  }

  // Helper methods
  async getPageMetrics() {
    console.log('📊 Collecting page performance metrics...');
    
    const metrics = await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');
      
      const firstPaint = paint.find(p => p.name === 'first-paint');
      const firstContentfulPaint = paint.find(p => p.name === 'first-contentful-paint');
      
      return {
        loadTime: navigation ? navigation.loadEventEnd - navigation.fetchStart : 0,
        domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.fetchStart : 0,
        firstPaint: firstPaint ? firstPaint.startTime : 0,
        firstContentfulPaint: firstContentfulPaint ? firstContentfulPaint.startTime : 0,
        timestamp: Date.now()
      };
    });
    
    return { success: true, metrics };
  }

  async analyzeGameplay() {
    console.log('🎮 Analyzing Mario game gameplay...');
    
    const gameAnalysis = await this.page.evaluate(() => {
      // Try to extract game state if available
      if (window.game) {
        try {
          return {
            gameExists: true,
            playerPosition: window.game.player ? { 
              x: window.game.player.x, 
              y: window.game.player.y 
            } : null,
            debugMode: window.game.debugMode || false,
            gameTime: window.game.gameTime || 0,
            respawnCount: window.game.respawnCount || 0
          };
        } catch (error) {
          return { gameExists: true, error: error.message };
        }
      }
      return { gameExists: false };
    });
    
    return gameAnalysis;
  }
}

export default PlaywrightRealIntegration;
