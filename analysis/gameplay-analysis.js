#!/usr/bin/env node

import { chromium } from 'playwright';
import fs from 'fs/promises';

async function analyzeGameplayExperience() {
  console.log('🔍 ANALYZING YOUR MARIO GAME FOR IMPROVEMENT OPPORTUNITIES...');
  
  let browser, page;
  
  try {
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage();
    
    const consoleMessages = [];
    page.on('console', msg => {
      consoleMessages.push({ 
        type: msg.type(), 
        text: msg.text(), 
        timestamp: Date.now() 
      });
    });
    
    // Load the game
    await page.goto('http://localhost:5176/?dev=true', { 
      waitUntil: 'domcontentloaded',
      timeout: 10000 
    });
    
    await page.waitForTimeout(3000);
    
    console.log('📊 ANALYZING GAME STATE...');
    
    // Deep game state analysis
    const detailedGameState = await page.evaluate(() => {
      const canvas = document.querySelector('#game-canvas');
      const debugInfo = document.querySelector('#debug-info');
      
      // Try to access more game internals
      let gameAnalysis = {
        canvas: {
          exists: !!canvas,
          width: canvas?.width || 0,
          height: canvas?.height || 0,
          style: canvas ? {
            width: canvas.style.width,
            height: canvas.style.height,
            position: canvas.style.position
          } : null
        },
        debugInfo: {
          exists: !!debugInfo,
          visible: debugInfo?.classList.contains('visible') || false,
          content: debugInfo?.textContent || ''
        },
        windowGame: {
          exists: !!window.game,
          properties: window.game ? Object.keys(window.game) : []
        },
        dom: {
          maintenanceOverlay: {
            exists: !!document.querySelector('#maintenance-overlay'),
            hidden: document.querySelector('#maintenance-overlay')?.classList.contains('hidden') || false
          },
          gameContainer: {
            exists: !!document.querySelector('#game-container'),
            style: document.querySelector('#game-container')?.style || {}
          }
        }
      };
      
      // If game exists, get more details
      if (window.game) {
        try {
          gameAnalysis.gameDetails = {
            player: window.game.player ? {
              x: window.game.player.x,
              y: window.game.player.y,
              exists: true
            } : { exists: false },
            camera: window.game.camera ? {
              x: window.game.camera.x,
              y: window.game.camera.y,
              exists: true
            } : { exists: false },
            debugMode: window.game.debugMode || false,
            state: window.game.state || 'unknown'
          };
        } catch (e) {
          gameAnalysis.gameDetailsError = e.message;
        }
      }
      
      return gameAnalysis;
    });
    
    console.log('🎮 TESTING GAMEPLAY RESPONSIVENESS...');
    
    // Test player responsiveness with timing
    const gameplayTests = [];
    
    // Test 1: Movement responsiveness
    const startTime = Date.now();
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(100);
    const moveTime = Date.now() - startTime;
    
    gameplayTests.push({
      test: 'right_movement',
      responseTime: moveTime,
      acceptable: moveTime < 50
    });
    
    // Test 2: Jump responsiveness
    const jumpStart = Date.now();
    await page.keyboard.press('Space');
    await page.waitForTimeout(100);
    const jumpTime = Date.now() - jumpStart;
    
    gameplayTests.push({
      test: 'jump_response',
      responseTime: jumpTime,
      acceptable: jumpTime < 50
    });
    
    // Test 3: Debug toggle responsiveness
    const debugStart = Date.now();
    await page.keyboard.press('F1');
    await page.waitForTimeout(200);
    const debugTime = Date.now() - debugStart;
    
    const debugToggled = await page.evaluate(() => {
      return document.querySelector('#debug-info')?.classList.contains('visible') || false;
    });
    
    gameplayTests.push({
      test: 'debug_toggle',
      responseTime: debugTime,
      successful: debugToggled,
      acceptable: debugTime < 100 && debugToggled
    });
    
    console.log('⚡ PERFORMANCE ANALYSIS...');
    
    // Performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');
      
      return {
        loadTime: navigation ? navigation.loadEventEnd - navigation.fetchStart : 0,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        memoryUsage: performance.memory ? {
          used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
          limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
        } : null
      };
    });
    
    // Take screenshots at different stages
    await page.screenshot({ path: './analysis-screenshot-1.png' });
    
    // Test extended gameplay
    console.log('🎯 EXTENDED GAMEPLAY TEST...');
    
    const extendedGameplayStart = Date.now();
    const moves = ['ArrowLeft', 'ArrowRight', 'Space', 'ArrowRight', 'Space', 'ArrowLeft'];
    
    for (const move of moves) {
      await page.keyboard.press(move);
      await page.waitForTimeout(300);
    }
    
    const extendedGameplayTime = Date.now() - extendedGameplayStart;
    await page.screenshot({ path: './analysis-screenshot-final.png' });
    
    // Final game state
    const finalGameState = await page.evaluate(() => {
      return {
        timestamp: Date.now(),
        gameStillRunning: !!window.game,
        canvasStillActive: !!document.querySelector('#game-canvas'),
        anyErrors: console.error.length || 0
      };
    });
    
    // Analyze console messages for issues
    const errors = consoleMessages.filter(msg => msg.type === 'error');
    const warnings = consoleMessages.filter(msg => msg.type === 'warning');
    const gameInitMessages = consoleMessages.filter(msg => 
      msg.text.includes('Portfolio Mario Game') || 
      msg.text.includes('initialized') || 
      msg.text.includes('loaded')
    );
    
    const analysis = {
      timestamp: new Date().toISOString(),
      gameState: detailedGameState,
      performanceMetrics,
      gameplayTests,
      extendedGameplayTime,
      finalGameState,
      console: {
        totalMessages: consoleMessages.length,
        errors: errors.length,
        warnings: warnings.length,
        gameInitMessages: gameInitMessages.length,
        errorDetails: errors,
        warningDetails: warnings
      },
      recommendations: []
    };
    
    // Generate specific recommendations based on analysis
    console.log('💡 GENERATING RECOMMENDATIONS...');
    
    // Performance recommendations
    if (performanceMetrics.loadTime > 3000) {
      analysis.recommendations.push({
        priority: 'HIGH',
        category: 'PERFORMANCE',
        issue: 'Slow initial load time',
        detail: `Game takes ${performanceMetrics.loadTime}ms to load`,
        suggestion: 'Consider code splitting and lazy loading of game assets',
        impact: 'Poor first impression for users'
      });
    }
    
    if (performanceMetrics.memoryUsage?.used > 100) {
      analysis.recommendations.push({
        priority: 'MEDIUM',
        category: 'PERFORMANCE', 
        issue: 'High memory usage',
        detail: `Using ${performanceMetrics.memoryUsage.used}MB of memory`,
        suggestion: 'Review asset loading and cleanup unused objects',
        impact: 'May cause performance issues on lower-end devices'
      });
    }
    
    // Gameplay recommendations
    const slowResponses = gameplayTests.filter(test => !test.acceptable);
    if (slowResponses.length > 0) {
      analysis.recommendations.push({
        priority: 'HIGH',
        category: 'GAMEPLAY',
        issue: 'Slow input response',
        detail: `${slowResponses.length} input(s) had slow response times`,
        suggestion: 'Optimize input handling and reduce frame processing time',
        impact: 'Frustrating player experience'
      });
    }
    
    // Technical recommendations
    if (!detailedGameState.windowGame.exists) {
      analysis.recommendations.push({
        priority: 'MEDIUM',
        category: 'TECHNICAL',
        issue: 'Game object not globally accessible',
        detail: 'window.game is undefined, making debugging difficult',
        suggestion: 'Expose game object to window for easier debugging and testing',
        impact: 'Harder to debug and extend'
      });
    }
    
    if (errors.length > 0) {
      analysis.recommendations.push({
        priority: 'HIGH',
        category: 'BUGS',
        issue: `${errors.length} JavaScript error(s) found`,
        detail: errors.map(e => e.text).join('; '),
        suggestion: 'Fix JavaScript errors that may affect gameplay',
        impact: 'Potential game crashes or broken functionality'
      });
    }
    
    if (warnings.length > 2) {
      analysis.recommendations.push({
        priority: 'LOW',
        category: 'OPTIMIZATION',
        issue: `${warnings.length} warning(s) found`,
        detail: 'Multiple warnings suggest optimization opportunities',
        suggestion: 'Address warnings to improve code quality',
        impact: 'Better performance and maintainability'
      });
    }
    
    // User Experience recommendations
    if (detailedGameState.canvas.width !== window.innerWidth) {
      analysis.recommendations.push({
        priority: 'MEDIUM',
        category: 'USER_EXPERIENCE',
        issue: 'Canvas not fullscreen',
        detail: `Canvas is ${detailedGameState.canvas.width}x${detailedGameState.canvas.height}, viewport is larger`,
        suggestion: 'Consider making canvas responsive to viewport size',
        impact: 'Suboptimal screen utilization'
      });
    }
    
    // Save analysis
    await fs.writeFile('./detailed-gameplay-analysis.json', JSON.stringify(analysis, null, 2));
    
    console.log('\n🎯 GAMEPLAY ANALYSIS COMPLETE!');
    console.log('=================================');
    
    console.log(`📊 Performance: Load time ${performanceMetrics.loadTime}ms`);
    console.log(`💾 Memory usage: ${performanceMetrics.memoryUsage?.used || 'unknown'}MB`);
    console.log(`🎮 Input tests: ${gameplayTests.filter(t => t.acceptable).length}/${gameplayTests.length} passed`);
    console.log(`❌ Errors: ${errors.length}`);
    console.log(`⚠️  Warnings: ${warnings.length}`);
    console.log(`💡 Recommendations: ${analysis.recommendations.length}`);
    
    if (analysis.recommendations.length > 0) {
      console.log('\n🎯 TOP RECOMMENDATIONS:');
      analysis.recommendations.slice(0, 5).forEach((rec, i) => {
        console.log(`${i + 1}. [${rec.priority}] ${rec.issue}`);
        console.log(`   ${rec.suggestion}`);
      });
    }
    
    console.log('\n📄 Detailed analysis saved: ./detailed-gameplay-analysis.json');
    
    return analysis;
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

analyzeGameplayExperience();
