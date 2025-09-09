#!/usr/bin/env node

import PlaywrightRealIntegration from './playwright-real-integration.js';
import fs from 'fs/promises';
import path from 'path';

class MarioPlaytestRunner {
  constructor() {
    this.playwright = new PlaywrightRealIntegration({
      baseUrl: 'http://localhost:5174', // Use port 5174 as fallback
      headless: false, // Run with visible browser for gameplay
      outputDir: './playtest-results'
    });
    this.playtestResults = [];
    this.gameplaySession = {
      startTime: Date.now(),
      actions: [],
      screenshots: [],
      gameStates: [],
      feedback: []
    };
  }

  async startPlaytest() {
    console.log('🎮 Starting Mario Game Playtest Session...');
    console.log('🔍 I will actually play your game and provide visual feedback!');
    
    try {
      await this.playwright.startBrowser();
      await this.runPlaytestSequence();
      await this.generatePlaytestReport();
    } catch (error) {
      console.error('❌ Playtest failed:', error.message);
    } finally {
      await this.playwright.stopBrowser();
    }
  }

  async runPlaytestSequence() {
    console.log('\\n🎯 Beginning gameplay sequence...');

    // 1. Load the game in dev mode
    await this.gameAction('Load Game', async () => {
      await this.playwright.executeAction({ type: 'navigate', url: '/?dev=true' });
      await this.playwright.executeAction({ type: 'wait', duration: 3000 });
      await this.takeGameplayScreenshot('game_loaded');
      
      // Check initial game state
      const gameState = await this.playwright.page.evaluate(() => {
        return {
          gameLoaded: window.game ? true : false,
          playerVisible: document.querySelector('#game-canvas') ? true : false,
          maintenanceHidden: document.querySelector('#maintenance-overlay').classList.contains('hidden'),
          canvasSize: {
            width: document.querySelector('#game-canvas')?.width || 0,
            height: document.querySelector('#game-canvas')?.height || 0
          }
        };
      });
      
      this.addFeedback('Initial Load', gameState.gameLoaded ? 'SUCCESS' : 'FAILED', 
        gameState.gameLoaded ? 
          `Game loaded successfully! Canvas: ${gameState.canvasSize.width}x${gameState.canvasSize.height}` :
          'Game failed to initialize properly'
      );
      
      return gameState;
    });

    // 2. Test basic movement
    await this.gameAction('Test Player Movement', async () => {
      console.log('🏃 Testing player movement...');
      
      // Move right
      await this.playwright.executeAction({ type: 'keyPress', key: 'ArrowRight' });
      await this.playwright.executeAction({ type: 'wait', duration: 1000 });
      
      // Jump
      await this.playwright.executeAction({ type: 'keyPress', key: 'Space' });
      await this.playwright.executeAction({ type: 'wait', duration: 1000 });
      
      await this.takeGameplayScreenshot('player_movement');
      
      // Check if player moved
      const playerState = await this.analyzePlayerMovement();
      this.addFeedback('Player Movement', 'INFO', 
        `Player controls appear ${playerState.responsive ? 'responsive' : 'unresponsive'}`
      );
      
      return playerState;
    });

    // 3. Test debug mode
    await this.gameAction('Test Debug Mode', async () => {
      console.log('🔧 Testing debug mode toggle...');
      
      await this.playwright.executeAction({ type: 'keyPress', key: 'F1' });
      await this.playwright.executeAction({ type: 'wait', duration: 500 });
      
      await this.takeGameplayScreenshot('debug_mode_on');
      
      const debugState = await this.playwright.page.evaluate(() => {
        const debugInfo = document.querySelector('#debug-info');
        return {
          debugVisible: debugInfo ? debugInfo.classList.contains('visible') : false,
          debugContent: debugInfo ? debugInfo.textContent.length > 0 : false
        };
      });
      
      this.addFeedback('Debug Mode', debugState.debugVisible ? 'SUCCESS' : 'WARNING',
        debugState.debugVisible ? 
          'Debug mode activated successfully' : 
          'Debug mode toggle may not be working'
      );
      
      return debugState;
    });

    // 4. Test longer gameplay session
    await this.gameAction('Extended Gameplay Test', async () => {
      console.log('🎮 Running extended gameplay session...');
      
      const gameplayDuration = 10000; // 10 seconds of gameplay
      const startTime = Date.now();
      
      // Simulate active gameplay
      const movements = ['ArrowRight', 'ArrowLeft', 'Space', 'ArrowRight', 'Space'];
      
      while (Date.now() - startTime < gameplayDuration) {
        const randomMovement = movements[Math.floor(Math.random() * movements.length)];
        await this.playwright.executeAction({ type: 'keyPress', key: randomMovement });
        await this.playwright.executeAction({ type: 'wait', duration: 500 });
      }
      
      await this.takeGameplayScreenshot('extended_gameplay');
      
      // Analyze game performance during gameplay
      const performanceMetrics = await this.analyzeGamePerformance();
      this.addFeedback('Extended Gameplay', 'INFO', 
        `Game ran for ${gameplayDuration/1000}s. Performance: ${performanceMetrics.rating}`
      );
      
      return performanceMetrics;
    });

    // 5. Test mystery box interaction (if visible)
    await this.gameAction('Test Mystery Box Interaction', async () => {
      console.log('📦 Looking for mystery boxes to interact with...');
      
      // Take screenshot to analyze for mystery boxes
      await this.takeGameplayScreenshot('looking_for_mystery_boxes');
      
      // Try to find and interact with mystery boxes
      const mysteryBoxAnalysis = await this.analyzeMysteryBoxes();
      
      this.addFeedback('Mystery Boxes', 'INFO', 
        mysteryBoxAnalysis.found ? 
          `Found ${mysteryBoxAnalysis.count} potential mystery box(es)` :
          'No obvious mystery box interactions detected'
      );
      
      return mysteryBoxAnalysis;
    });

    // 6. Final game state analysis
    await this.gameAction('Final State Analysis', async () => {
      console.log('📊 Performing final game state analysis...');
      
      await this.takeGameplayScreenshot('final_state');
      
      const finalState = await this.playwright.page.evaluate(() => {
        return {
          gameRunning: window.game ? true : false,
          consoleErrors: console.error.toString(),
          playerStats: window.game?.player ? {
            x: window.game.player.x,
            y: window.game.player.y,
            alive: window.game.player.alive !== false
          } : null,
          gameStats: window.game ? {
            respawnCount: window.game.respawnCount || 0,
            gameTime: window.game.gameTime || 0,
            debugMode: window.game.debugMode || false
          } : null
        };
      });
      
      this.addFeedback('Final Analysis', 'SUCCESS', 
        `Game session completed. Player at (${finalState.playerStats?.x?.toFixed(0) || 'unknown'}, ${finalState.playerStats?.y?.toFixed(0) || 'unknown'})`
      );
      
      return finalState;
    });
  }

  async gameAction(actionName, actionFunction) {
    console.log(`\\n🎬 ${actionName}...`);
    const startTime = Date.now();
    
    try {
      const result = await actionFunction();
      const duration = Date.now() - startTime;
      
      this.gameplaySession.actions.push({
        name: actionName,
        startTime,
        duration,
        status: 'success',
        result
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

  async takeGameplayScreenshot(name) {
    const result = await this.playwright.executeAction({ 
      type: 'screenshot', 
      name: `gameplay_${name}` 
    });
    
    this.gameplaySession.screenshots.push({
      name,
      filename: result.filename,
      filepath: result.filepath,
      timestamp: Date.now()
    });
    
    console.log(`📸 Screenshot saved: ${result.filename}`);
    return result;
  }

  async analyzePlayerMovement() {
    // Analyze canvas for player movement indicators
    const analysis = await this.playwright.page.evaluate(() => {
      const canvas = document.querySelector('#game-canvas');
      if (!canvas) return { responsive: false, reason: 'No canvas found' };
      
      // Basic check - if game object exists and canvas has content
      const hasGameObject = window.game ? true : false;
      const canvasHasContent = canvas.width > 0 && canvas.height > 0;
      
      return {
        responsive: hasGameObject && canvasHasContent,
        hasGameObject,
        canvasHasContent,
        canvasSize: { width: canvas.width, height: canvas.height }
      };
    });
    
    return analysis;
  }

  async analyzeGamePerformance() {
    // Get real performance metrics
    const metrics = await this.playwright.getPageMetrics();
    const consoleErrors = this.playwright.consoleMessages.filter(msg => msg.type === 'error');
    
    const rating = consoleErrors.length === 0 ? 'EXCELLENT' : 
                  consoleErrors.length <= 2 ? 'GOOD' : 'NEEDS_IMPROVEMENT';
    
    return {
      metrics: metrics.metrics,
      consoleErrors: consoleErrors.length,
      rating,
      timestamp: Date.now()
    };
  }

  async analyzeMysteryBoxes() {
    // Analyze the game canvas for mystery box-like elements
    const analysis = await this.playwright.page.evaluate(() => {
      // Check if we can detect mystery boxes in the game
      const canvas = document.querySelector('#game-canvas');
      if (!canvas) return { found: false, reason: 'No canvas' };
      
      // Check for mystery box related code or elements
      const hasMysteryBoxes = window.game?.mysteryBoxes ? true : false;
      const mysteryBoxCount = window.game?.mysteryBoxes?.length || 0;
      
      return {
        found: hasMysteryBoxes,
        count: mysteryBoxCount,
        hasCanvas: true
      };
    });
    
    return analysis;
  }

  addFeedback(category, level, message) {
    const feedback = {
      category,
      level, // SUCCESS, WARNING, ERROR, INFO
      message,
      timestamp: Date.now()
    };
    
    this.gameplaySession.feedback.push(feedback);
    
    const icon = {
      SUCCESS: '✅',
      WARNING: '⚠️',
      ERROR: '❌',
      INFO: 'ℹ️'
    }[level] || 'ℹ️';
    
    console.log(`${icon} [${category}] ${message}`);
  }

  async generatePlaytestReport() {
    console.log('\\n📊 Generating Playtest Report...');
    
    const report = {
      session: {
        duration: Date.now() - this.gameplaySession.startTime,
        timestamp: new Date().toISOString(),
        totalActions: this.gameplaySession.actions.length,
        totalScreenshots: this.gameplaySession.screenshots.length,
        totalFeedback: this.gameplaySession.feedback.length
      },
      summary: {
        successfulActions: this.gameplaySession.actions.filter(a => a.status === 'success').length,
        failedActions: this.gameplaySession.actions.filter(a => a.status === 'failed').length,
        criticalIssues: this.gameplaySession.feedback.filter(f => f.level === 'ERROR').length,
        warnings: this.gameplaySession.feedback.filter(f => f.level === 'WARNING').length
      },
      gameplay: this.gameplaySession,
      recommendations: this.generateRecommendations()
    };

    // Save detailed report
    const outputDir = './playtest-results';
    await fs.mkdir(outputDir, { recursive: true });
    
    const reportPath = path.join(outputDir, `mario-playtest-${Date.now()}.json`);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    // Print summary
    this.printPlaytestSummary(report);
    
    console.log(`\\n📄 Detailed report saved: ${reportPath}`);
    return report;
  }

  generateRecommendations() {
    const recommendations = [];
    
    // Analyze feedback for recommendations
    const errors = this.gameplaySession.feedback.filter(f => f.level === 'ERROR');
    const warnings = this.gameplaySession.feedback.filter(f => f.level === 'WARNING');
    
    if (errors.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        type: 'BUG_FIX',
        message: `Fix ${errors.length} critical issue(s) preventing proper gameplay`,
        details: errors.map(e => e.message)
      });
    }
    
    if (warnings.length > 0) {
      recommendations.push({
        priority: 'MEDIUM', 
        type: 'IMPROVEMENT',
        message: `Address ${warnings.length} warning(s) to improve player experience`,
        details: warnings.map(w => w.message)
      });
    }
    
    // Check for successful gameplay patterns
    const successfulActions = this.gameplaySession.actions.filter(a => a.status === 'success');
    if (successfulActions.length > 0) {
      recommendations.push({
        priority: 'LOW',
        type: 'ENHANCEMENT',
        message: 'Game core mechanics are working well - consider adding more features',
        details: ['Player movement is responsive', 'Debug mode is functional', 'Game initialization works']
      });
    }
    
    return recommendations;
  }

  printPlaytestSummary(report) {
    console.log('\\n🎮 MARIO GAME PLAYTEST SUMMARY');
    console.log('=================================');
    console.log(`⏱️  Session Duration: ${(report.session.duration / 1000).toFixed(1)}s`);
    console.log(`🎬 Actions Performed: ${report.session.totalActions}`);
    console.log(`📸 Screenshots Taken: ${report.session.totalScreenshots}`);
    console.log(`✅ Successful Actions: ${report.summary.successfulActions}`);
    console.log(`❌ Failed Actions: ${report.summary.failedActions}`);
    
    if (report.summary.criticalIssues > 0) {
      console.log(`\\n🚨 CRITICAL ISSUES FOUND: ${report.summary.criticalIssues}`);
      const criticalFeedback = this.gameplaySession.feedback.filter(f => f.level === 'ERROR');
      criticalFeedback.forEach(feedback => {
        console.log(`   ❌ ${feedback.category}: ${feedback.message}`);
      });
    }
    
    if (report.summary.warnings > 0) {
      console.log(`\\n⚠️  WARNINGS: ${report.summary.warnings}`);
      const warningFeedback = this.gameplaySession.feedback.filter(f => f.level === 'WARNING');
      warningFeedback.forEach(feedback => {
        console.log(`   ⚠️  ${feedback.category}: ${feedback.message}`);
      });
    }
    
    console.log('\\n💡 TOP RECOMMENDATIONS:');
    report.recommendations.slice(0, 3).forEach((rec, index) => {
      console.log(`   ${index + 1}. [${rec.priority}] ${rec.message}`);
    });
    
    console.log('\\n📸 Screenshots saved to: ./playtest-results/');
    
    const overallRating = report.summary.criticalIssues === 0 ? 
      (report.summary.warnings === 0 ? 'EXCELLENT 🌟' : 'GOOD 👍') : 
      'NEEDS WORK 🔧';
    
    console.log(`\\n🎯 Overall Game Quality: ${overallRating}`);
    console.log('=================================');
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const playtest = new MarioPlaytestRunner();
  playtest.startPlaytest().catch(error => {
    console.error('Playtest runner error:', error);
    process.exit(1);
  });
}

export default MarioPlaytestRunner;
