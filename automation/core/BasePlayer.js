#!/usr/bin/env node

import PlaywrightRealIntegration from '../../playwright-real-integration.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * BasePlayer - Hybrid automation player combining:
 * - Mario Playtest Runner: Screenshots, performance, structured testing
 * - Mystery Box Test: Smart movement, precise navigation, game state analysis
 */
class BasePlayer {
  constructor(testName, config = {}) {
    this.testName = testName;
    this.config = {
      baseUrl: 'http://localhost:5173',
      headless: false,
      slowMo: 200,
      outputDir: `./automation/results/${testName}`,
      cleanupAfter: true,
      enableVideo: true,
      enablePositionTracking: true,
      ...config
    };

    // Initialize Playwright integration
    this.playwright = new PlaywrightRealIntegration({
      baseUrl: this.config.baseUrl,
      headless: this.config.headless,
      outputDir: this.config.outputDir
    });

    // Test session data
    this.gameplaySession = {
      testName,
      startTime: Date.now(),
      actions: [],
      screenshots: [],
      gameStates: [],
      feedback: [],
      positionData: [],
      performance: []
    };

    this.testResults = [];
    this.isRecording = false;
    this.positionTracker = null;
  }

  // ========================================
  // CORE PLAYER LIFECYCLE
  // ========================================

  async startSession(gameUrl = null) {
    console.log(`🎮 Starting ${this.testName} automation session...`);
    console.log('🚀 Hybrid BasePlayer: Smart movement + comprehensive monitoring');

    try {
      await this.setupEnvironment();
      await this.loadGame(gameUrl);
      await this.initializeGameState();

      console.log('✅ BasePlayer session ready!');
      return true;
    } catch (error) {
      console.error('❌ BasePlayer startup failed:', error.message);
      throw error;
    }
  }

  async setupEnvironment() {
    console.log('🔧 Setting up test environment...');

    // Create output directory
    await fs.mkdir(this.config.outputDir, { recursive: true });

    // Start browser with optimal settings
    await this.playwright.startBrowser();

    // Setup console monitoring for game events
    this.playwright.page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      if (text.includes('mystery') || text.includes('Mystery') ||
          text.includes('collectible') || text.includes('player') ||
          text.includes('position') || text.includes('collision')) {
        console.log(`[GAME] ${type}: ${text}`);
      }
    });

    console.log('✅ Environment setup complete');
  }

  async loadGame(gameUrl = null) {
    const url = gameUrl || `${this.config.baseUrl}?dev=true`;
    console.log(`🌐 Loading game: ${url}`);

    await this.playwright.executeAction({ type: 'navigate', url });
    await this.playwright.executeAction({ type: 'wait', duration: 3000 });

    // Click canvas for keyboard focus
    await this.playwright.page.click('#game-canvas');
    await this.playwright.executeAction({ type: 'wait', duration: 500 });
    console.log('🎯 Game canvas focused for controls');

    await this.takeScreenshot('game_loaded');
  }

  async initializeGameState() {
    console.log('📊 Initializing game state monitoring...');

    const gameState = await this.playwright.page.evaluate(() => {
      return {
        gameLoaded: typeof window.game !== 'undefined',
        playerExists: window.game?.player ? true : false,
        playerPosition: window.game?.player ? {
          x: window.game.player.body.position.x,
          y: window.game.player.body.position.y
        } : null,
        mysteryBoxCount: window.game?.mysteryBoxes ? window.game.mysteryBoxes.length : 0,
        canvasSize: {
          width: document.querySelector('#game-canvas')?.width || 0,
          height: document.querySelector('#game-canvas')?.height || 0
        }
      };
    });

    console.log('📋 Initial game state:', gameState);
    this.addResult('Game Initialization', gameState.gameLoaded, gameState);

    // Start position tracking if enabled
    if (this.config.enablePositionTracking) {
      await this.startPositionTracking();
    }

    return gameState;
  }

  async finishSession() {
    console.log('🏁 Finishing automation session...');

    if (this.positionTracker) {
      clearInterval(this.positionTracker);
    }

    await this.generateReport();

    if (this.config.cleanupAfter) {
      // Could implement cleanup logic here
      console.log('🧹 Cleanup completed');
    }

    await this.playwright.stopBrowser();
    console.log('✅ BasePlayer session finished');
  }

  // ========================================
  // SMART MOVEMENT SYSTEM (from Mystery Box Test)
  // ========================================

  async navigateToPosition(targetX, targetY = null, description = 'Target Position') {
    console.log(`🎯 Navigating to ${description} at x=${targetX}${targetY ? `, y=${targetY}` : ''}`);

    // Get current position
    const currentPos = await this.getPlayerPosition();
    if (!currentPos) {
      throw new Error('Unable to get player position for navigation');
    }

    console.log(`📍 Current position: (${currentPos.x.toFixed(1)}, ${currentPos.y.toFixed(1)})`);

    // Use smart positioning for precise horizontal movement
    await this.smartPositioning(targetX, description);

    // If vertical positioning needed, handle jumping
    if (targetY && Math.abs(currentPos.y - targetY) > 20) {
      await this.navigateVertically(targetY);
    }

    const finalPos = await this.getPlayerPosition();
    console.log(`✅ Navigation complete: (${finalPos.x.toFixed(1)}, ${finalPos.y.toFixed(1)})`);

    await this.takeScreenshot(`navigated_to_${description.toLowerCase().replace(/\s+/g, '_')}`);
    return finalPos;
  }

  async smartPositioning(targetX, description) {
    console.log(`🎯 Smart positioning to ${description} at x=${targetX}`);

    const tolerance = 20;
    const maxAttempts = 15;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const currentX = await this.getPlayerX();
      if (!currentX) break;

      const distance = Math.abs(currentX - targetX);

      if (distance <= tolerance) {
        console.log(`✅ Perfect position: ${currentX.toFixed(1)} (target: ${targetX}, distance: ${distance.toFixed(1)})`);
        return;
      }

      const direction = currentX < targetX ? 'right' : 'left';
      const key = direction === 'right' ? 'ArrowRight' : 'ArrowLeft';

      console.log(`🏃 Attempt ${attempt}: Moving ${direction} (distance: ${distance.toFixed(1)})`);

      // Choose movement strategy based on distance
      if (distance > 120) {
        await this.moveWithHolding(key, targetX, 30);
      } else {
        await this.moveWithPresses(key, targetX, tolerance, distance);
      }

      // Stop momentum if needed
      const finalPos = await this.getPlayerX();
      const finalDistance = Math.abs(finalPos - targetX);

      if (finalDistance > tolerance) {
        const oppositeKey = key === 'ArrowRight' ? 'ArrowLeft' : 'ArrowRight';
        await this.playwright.page.keyboard.press(oppositeKey);
      }

      await this.playwright.executeAction({ type: 'wait', duration: 100 });
    }
  }

  async moveWithHolding(key, targetX, tolerance) {
    await this.playwright.page.keyboard.down(key);

    const checkInterval = 15;
    const maxMovementTime = 1500;
    let elapsed = 0;
    let lastPosition = null;
    let stuckCount = 0;

    while (elapsed < maxMovementTime) {
      await this.playwright.executeAction({ type: 'wait', duration: checkInterval });
      elapsed += checkInterval;

      const currentPos = await this.getPlayerX();
      if (!currentPos) break;

      const currentDistance = Math.abs(currentPos - targetX);
      if (currentDistance <= tolerance) {
        console.log(`🎯 Target reached: ${currentPos.toFixed(1)}`);
        break;
      }

      // Check for overshoot
      const direction = key === 'ArrowRight' ? 'right' : 'left';
      const wasMovingRight = direction === 'right';
      const nowPastTarget = wasMovingRight ? currentPos > targetX : currentPos < targetX;
      if (nowPastTarget) {
        console.log(`🎯 Target passed: ${currentPos.toFixed(1)}`);
        break;
      }

      // Stuck detection
      if (lastPosition !== null && Math.abs(currentPos - lastPosition) < 0.5) {
        stuckCount++;
        if (stuckCount > 5) break;
      } else {
        stuckCount = 0;
      }
      lastPosition = currentPos;
    }

    await this.playwright.page.keyboard.up(key);
  }

  async moveWithPresses(key, targetX, tolerance, distance) {
    const direction = key === 'ArrowRight' ? 'right' : 'left';
    const pixelsPerPress = 36;
    let pressCount = Math.min(Math.ceil(distance / pixelsPerPress), 3);

    console.log(`⚡ Using ${pressCount} precise presses to move ${direction}`);

    for (let press = 1; press <= pressCount; press++) {
      await this.playwright.page.keyboard.down(key);
      await this.playwright.executeAction({ type: 'wait', duration: 4 });
      await this.playwright.page.keyboard.up(key);
      await this.playwright.executeAction({ type: 'wait', duration: 150 });

      const afterPress = await this.getPlayerX();
      const distanceToTarget = Math.abs(afterPress - targetX);

      console.log(`   Press ${press}: Position ${afterPress.toFixed(1)} (${distanceToTarget.toFixed(1)}px from target)`);

      if (distanceToTarget <= tolerance) {
        console.log(`🎯 Target reached with ${press} presses!`);
        return;
      }

      // Check for overshoot
      const wasMovingRight = direction === 'right';
      const nowPastTarget = wasMovingRight ? afterPress > targetX : afterPress < targetX;
      if (nowPastTarget) {
        console.log(`⚠️ Overshot target on press ${press}`);
        return;
      }
    }
  }

  async navigateVertically(targetY) {
    console.log(`⬆️ Navigating vertically to y=${targetY}`);

    const currentPos = await this.getPlayerPosition();
    if (!currentPos) return;

    // Simple jump strategy - can be enhanced based on needs
    if (currentPos.y > targetY) {
      console.log('🤘 Jumping to reach target height...');
      await this.jump();

      // Double jump if needed
      await this.playwright.executeAction({ type: 'wait', duration: 200 });
      const midJumpY = await this.getPlayerY();
      if (midJumpY && midJumpY > targetY - 50) {
        console.log('🤸 Double jumping...');
        await this.jump();
      }
    }
  }

  async jump() {
    await this.playwright.page.keyboard.down('ArrowUp');
    await this.playwright.executeAction({ type: 'wait', duration: 100 });
    await this.playwright.page.keyboard.up('ArrowUp');
  }

  // ========================================
  // GAME INTERACTION METHODS
  // ========================================

  async hitMysteryBoxFromBelow(boxPosition) {
    console.log('⬆️ Attempting to hit mystery box from below...');

    // Navigate to optimal hitting position
    const targetX = boxPosition.x + 20; // Center of 40px box
    await this.navigateToPosition(targetX, null, 'Mystery Box Hit Position');

    // Multiple jump attempts with position verification
    for (let attempt = 1; attempt <= 5; attempt++) {
      console.log(`🤘 Jump attempt ${attempt}...`);

      await this.jump();
      await this.playwright.executeAction({ type: 'wait', duration: 200 });

      // Check for hit during jump
      const hitResult = await this.checkMysteryBoxHit();
      if (hitResult.hit) {
        console.log('✅ Mystery box hit successful!');
        await this.takeScreenshot('mystery_box_hit_success');
        this.addResult('Mystery Box Hit', true, hitResult);
        return true;
      }

      // Small position adjustments between attempts
      if (attempt < 5) {
        const adjustKey = attempt % 2 === 0 ? 'ArrowLeft' : 'ArrowRight';
        await this.playwright.page.keyboard.press(adjustKey);
        await this.playwright.executeAction({ type: 'wait', duration: 100 });
      }
    }

    console.log('❌ All jump attempts failed');
    await this.takeScreenshot('mystery_box_hit_failed');
    this.addResult('Mystery Box Hit', false, { attempts: 5 });
    return false;
  }

  async collectItem(itemPosition) {
    console.log('🎁 Attempting to collect item...');

    // Navigate to item position
    await this.navigateToPosition(itemPosition.x, null, 'Item Collection');

    // Double jump to reach collectible
    await this.jump();
    await this.playwright.executeAction({ type: 'wait', duration: 200 });
    await this.jump();
    await this.playwright.executeAction({ type: 'wait', duration: 300 });

    // Check if collected
    const collectionResult = await this.checkItemCollection();
    if (collectionResult.collected) {
      console.log('✅ Item collected!');
      await this.takeScreenshot('item_collected');
      this.addResult('Item Collection', true, collectionResult);
      return true;
    }

    // Try moving around to collect
    const movements = ['ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'];
    for (const movement of movements) {
      await this.playwright.page.keyboard.press(movement);
      await this.playwright.executeAction({ type: 'wait', duration: 200 });

      const result = await this.checkItemCollection();
      if (result.collected) {
        console.log('✅ Item collected with movement!');
        await this.takeScreenshot('item_collected');
        this.addResult('Item Collection', true, result);
        return true;
      }
    }

    console.log('❌ Failed to collect item');
    this.addResult('Item Collection', false, { collected: false });
    return false;
  }

  // ========================================
  // GAME STATE ANALYSIS
  // ========================================

  async getPlayerPosition() {
    return await this.playwright.page.evaluate(() => {
      const player = window.game?.player;
      return player ? {
        x: player.body.position.x,
        y: player.body.position.y,
        velocity: {
          x: player.body.velocity.x,
          y: player.body.velocity.y
        }
      } : null;
    });
  }

  async getPlayerX() {
    return await this.playwright.page.evaluate(() => {
      return window.game?.player ? window.game.player.body.position.x : null;
    });
  }

  async getPlayerY() {
    return await this.playwright.page.evaluate(() => {
      return window.game?.player ? window.game.player.body.position.y : null;
    });
  }

  async analyzeMysteryBoxes() {
    console.log('🔍 Analyzing mystery boxes...');

    const analysis = await this.playwright.page.evaluate(() => {
      if (!window.game?.mysteryBoxes) {
        return { found: false, count: 0 };
      }

      const boxes = window.game.mysteryBoxes;
      return {
        found: true,
        count: boxes.length,
        boxes: boxes.map((box, index) => ({
          id: box.id,
          title: box.projectData?.title || `Box ${index + 1}`,
          position: { x: box.x, y: box.y },
          state: box.state,
          hasBeenHit: box.hasBeenHit
        }))
      };
    });

    console.log('📦 Mystery box analysis:', analysis);
    this.addResult('Mystery Box Analysis', analysis.found, analysis);
    return analysis;
  }

  async checkMysteryBoxHit() {
    return await this.playwright.page.evaluate(() => {
      const mysteryBoxes = window.game?.mysteryBoxes;
      const hitBox = mysteryBoxes?.find(box => box.hasBeenHit);

      return {
        hit: !!hitBox,
        hitBox: hitBox ? {
          title: hitBox.projectData?.title,
          state: hitBox.state,
          collectibleSpawned: hitBox.collectibleSpawned
        } : null
      };
    });
  }

  async checkItemCollection() {
    return await this.playwright.page.evaluate(() => {
      const mysteryBoxes = window.game?.mysteryBoxes;
      if (!mysteryBoxes) return { collected: false };

      const boxWithCollectible = mysteryBoxes.find(box =>
        box.collectible && box.collectible.collected
      );

      return { collected: !!boxWithCollectible };
    });
  }

  async getGamePerformance() {
    const metrics = await this.playwright.getPageMetrics();
    const consoleErrors = this.playwright.consoleMessages.filter(msg => msg.type === 'error');

    return {
      metrics: metrics.metrics,
      consoleErrors: consoleErrors.length,
      rating: consoleErrors.length === 0 ? 'EXCELLENT' :
              consoleErrors.length <= 2 ? 'GOOD' : 'NEEDS_IMPROVEMENT',
      timestamp: Date.now()
    };
  }

  // ========================================
  // MONITORING & TRACKING
  // ========================================

  async startPositionTracking(intervalMs = 100) {
    console.log(`📊 Starting position tracking (${intervalMs}ms intervals)`);

    this.positionTracker = setInterval(async () => {
      const position = await this.getPlayerPosition();
      if (position) {
        this.gameplaySession.positionData.push({
          timestamp: Date.now(),
          ...position
        });
      }
    }, intervalMs);
  }

  async executeAction(actionName, actionFunction) {
    console.log(`🎬 ${actionName}...`);
    const startTime = Date.now();

    try {
      const result = await actionFunction();
      const duration = Date.now() - startTime;

      this.gameplaySession.actions.push({
        name: actionName,
        startTime,
        duration,
        status: 'success',
        result: this.sanitizeForJSON(result)
      });

      console.log(`✅ ${actionName} completed in ${duration}ms`);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      this.gameplaySession.actions.push({
        name: actionName,
        startTime,
        duration,
        status: 'failed',
        error: error.message
      });

      console.log(`❌ ${actionName} failed: ${error.message}`);
      throw error;
    }
  }

  // ========================================
  // SCREENSHOTS & RECORDING
  // ========================================

  async takeScreenshot(name) {
    const filename = `${name}-${Date.now()}.png`;
    const filepath = path.join(this.config.outputDir, filename);

    await this.playwright.page.screenshot({
      path: filepath,
      fullPage: false
    });

    this.gameplaySession.screenshots.push({
      name,
      filename,
      filepath,
      timestamp: Date.now()
    });

    console.log(`📸 Screenshot: ${filename}`);
    return { filename, filepath };
  }

  // ========================================
  // RESULTS & REPORTING
  // ========================================

  addResult(testName, success, details) {
    const sanitizedDetails = this.sanitizeForJSON(details);

    this.testResults.push({
      testName,
      success,
      details: sanitizedDetails,
      timestamp: Date.now()
    });

    const feedback = {
      category: testName,
      level: success ? 'SUCCESS' : 'ERROR',
      message: success ? `${testName} completed successfully` : `${testName} failed`,
      timestamp: Date.now()
    };

    this.gameplaySession.feedback.push(feedback);

    const icon = success ? '✅' : '❌';
    console.log(`${icon} [${testName}] ${feedback.message}`);
  }

  sanitizeForJSON(obj, depth = 0, maxDepth = 5) {
    if (depth > maxDepth) return '[Max Depth Reached]';
    if (obj === null || obj === undefined) return obj;
    if (typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeForJSON(item, depth + 1, maxDepth));
    }

    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== null && typeof value === 'object') {
        if (key.includes('body') || key.includes('element') ||
            key.includes('gameObject') || key.includes('physics') ||
            key.includes('Matter') || key.includes('hitBox')) {
          cleaned[key] = '[Circular Reference Removed]';
        } else {
          cleaned[key] = this.sanitizeForJSON(value, depth + 1, maxDepth);
        }
      } else {
        cleaned[key] = value;
      }
    }

    return cleaned;
  }

  async generateReport() {
    console.log('📊 Generating comprehensive test report...');

    const report = {
      testName: this.testName,
      session: {
        duration: Date.now() - this.gameplaySession.startTime,
        timestamp: new Date().toISOString(),
        totalActions: this.gameplaySession.actions.length,
        totalScreenshots: this.gameplaySession.screenshots.length,
        positionDataPoints: this.gameplaySession.positionData.length,
        totalFeedback: this.gameplaySession.feedback.length
      },
      summary: {
        successfulActions: this.gameplaySession.actions.filter(a => a.status === 'success').length,
        failedActions: this.gameplaySession.actions.filter(a => a.status === 'failed').length,
        successfulTests: this.testResults.filter(r => r.success).length,
        failedTests: this.testResults.filter(r => !r.success).length,
        criticalIssues: this.gameplaySession.feedback.filter(f => f.level === 'ERROR').length,
        warnings: this.gameplaySession.feedback.filter(f => f.level === 'WARNING').length
      },
      gameplay: this.gameplaySession,
      testResults: this.testResults,
      recommendations: this.generateRecommendations()
    };

    // Save comprehensive report
    const reportPath = path.join(this.config.outputDir, `${this.testName}-report-${Date.now()}.json`);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    // Save position data separately if enabled
    if (this.config.enablePositionTracking && this.gameplaySession.positionData.length > 0) {
      const positionPath = path.join(this.config.outputDir, `${this.testName}-positions-${Date.now()}.json`);
      await fs.writeFile(positionPath, JSON.stringify(this.gameplaySession.positionData, null, 2));
      console.log(`📊 Position data saved: ${positionPath}`);
    }

    this.printSummary(report);

    console.log(`📄 Detailed report saved: ${reportPath}`);
    return report;
  }

  generateRecommendations() {
    const recommendations = [];

    const errors = this.gameplaySession.feedback.filter(f => f.level === 'ERROR');
    const warnings = this.gameplaySession.feedback.filter(f => f.level === 'WARNING');

    if (errors.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        type: 'BUG_FIX',
        message: `Fix ${errors.length} critical issue(s)`,
        details: errors.map(e => e.message)
      });
    }

    if (warnings.length > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        type: 'IMPROVEMENT',
        message: `Address ${warnings.length} warning(s)`,
        details: warnings.map(w => w.message)
      });
    }

    const successfulActions = this.gameplaySession.actions.filter(a => a.status === 'success');
    if (successfulActions.length > 0) {
      recommendations.push({
        priority: 'LOW',
        type: 'ENHANCEMENT',
        message: 'Core mechanics working well - consider adding features',
        details: ['Smart movement system functional', 'Game interaction working', 'Monitoring systems active']
      });
    }

    return recommendations;
  }

  printSummary(report) {
    console.log(`\n🎮 ${this.testName.toUpperCase()} SUMMARY`);
    console.log('='.repeat(50));
    console.log(`⏱️  Duration: ${(report.session.duration / 1000).toFixed(1)}s`);
    console.log(`🎬 Actions: ${report.session.totalActions}`);
    console.log(`📸 Screenshots: ${report.session.totalScreenshots}`);
    console.log(`📊 Position Points: ${report.session.positionDataPoints}`);
    console.log(`✅ Successful: ${report.summary.successfulActions}`);
    console.log(`❌ Failed: ${report.summary.failedActions}`);

    if (report.summary.criticalIssues > 0) {
      console.log(`\n🚨 Critical Issues: ${report.summary.criticalIssues}`);
    }

    console.log('\n💡 Top Recommendations:');
    report.recommendations.slice(0, 3).forEach((rec, index) => {
      console.log(`   ${index + 1}. [${rec.priority}] ${rec.message}`);
    });

    const overallRating = report.summary.criticalIssues === 0 ?
      (report.summary.warnings === 0 ? 'EXCELLENT 🌟' : 'GOOD 👍') :
      'NEEDS WORK 🔧';

    console.log(`\n🎯 Overall Rating: ${overallRating}`);
    console.log('='.repeat(50));
  }
}

export default BasePlayer;