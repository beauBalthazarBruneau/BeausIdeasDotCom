#!/usr/bin/env node

import PlaywrightRealIntegration from './playwright-real-integration.js';

class DebugAIPlayer {
  constructor() {
    this.playwright = new PlaywrightRealIntegration({
      baseUrl: 'http://localhost:5173',
      headless: false,
      outputDir: './debug-results'
    });
  }

  async startDebugSession() {
    console.log('🐛 Starting Debug AI Player...');
    console.log('🔍 This will help us figure out what went wrong');
    
    try {
      await this.playwright.startBrowser();
      console.log('✅ Browser started successfully');
      
      // Navigate to game
      console.log('🌐 Navigating to game...');
      await this.playwright.executeAction({ type: 'navigate', url: '/?dev=true' });
      console.log('✅ Navigation completed');
      
      // Wait for game to load
      console.log('⏳ Waiting for game to load...');
      await this.playwright.executeAction({ type: 'wait', duration: 5000 });
      
      // Take initial screenshot
      console.log('📸 Taking initial screenshot...');
      await this.playwright.executeAction({ type: 'screenshot', name: 'debug_initial' });
      
      // Check if game exists
      console.log('🎮 Checking game state...');
      const gameState = await this.playwright.page.evaluate(() => {
        console.log('DEBUG: Checking window.game...');
        if (window.game) {
          console.log('DEBUG: Game object exists!');
          console.log('DEBUG: Game player:', window.game.player);
          return {
            gameExists: true,
            playerExists: !!window.game.player,
            playerPosition: window.game.player ? {
              x: window.game.player.x,
              y: window.game.player.y
            } : null,
            canvasElement: !!document.querySelector('#game-canvas'),
            maintenanceHidden: document.querySelector('#maintenance-overlay')?.classList.contains('hidden')
          };
        } else {
          console.log('DEBUG: No game object found');
          return {
            gameExists: false,
            canvasElement: !!document.querySelector('#game-canvas'),
            maintenanceOverlay: !!document.querySelector('#maintenance-overlay'),
            maintenanceHidden: document.querySelector('#maintenance-overlay')?.classList.contains('hidden')
          };
        }
      });
      
      console.log('📊 Game State Analysis:', JSON.stringify(gameState, null, 2));
      
      if (!gameState.gameExists) {
        console.log('❌ Game object not found! This is likely the issue.');
        console.log('💡 Possible causes:');
        console.log('   - Game hasn\'t loaded yet');
        console.log('   - Game initialization failed');
        console.log('   - Dev mode not working');
        
        // Wait longer and try again
        console.log('⏳ Waiting longer for game to initialize...');
        await this.playwright.executeAction({ type: 'wait', duration: 5000 });
        
        const retryGameState = await this.playwright.page.evaluate(() => {
          return {
            gameExists: !!window.game,
            consoleErrors: console.error.toString(),
          };
        });
        
        console.log('🔄 Retry Game State:', JSON.stringify(retryGameState, null, 2));
      }
      
      if (gameState.gameExists) {
        console.log('✅ Game found! Testing player movement...');
        
        // Try a simple movement
        console.log('➡️ Trying to move right...');
        await this.playwright.executeAction({ type: 'keyPress', key: 'ArrowRight' });
        await this.playwright.executeAction({ type: 'wait', duration: 1000 });
        
        // Check if player moved
        const afterMoveState = await this.playwright.page.evaluate(() => {
          return window.game && window.game.player ? {
            x: window.game.player.x,
            y: window.game.player.y
          } : null;
        });
        
        console.log('📍 Player position after movement:', afterMoveState);
        
        if (afterMoveState && afterMoveState.x !== gameState.playerPosition.x) {
          console.log('✅ SUCCESS! Player moved successfully');
          console.log(`   Moved from x=${gameState.playerPosition.x} to x=${afterMoveState.x}`);
        } else {
          console.log('❌ Player did not move');
          console.log('💡 This suggests key events aren\'t being processed');
        }
        
        // Try jumping
        console.log('⬆️ Trying to jump...');
        await this.playwright.executeAction({ type: 'keyPress', key: 'Space' });
        await this.playwright.executeAction({ type: 'wait', duration: 1000 });
        
        await this.playwright.executeAction({ type: 'screenshot', name: 'debug_after_actions' });
      }
      
      // Get console messages
      const consoleMessages = this.playwright.consoleMessages.slice(-10); // Last 10 messages
      console.log('📝 Recent Console Messages:');
      consoleMessages.forEach((msg, i) => {
        console.log(`   ${i + 1}. [${msg.type}] ${msg.text}`);
      });
      
    } catch (error) {
      console.error('❌ Debug session failed:', error.message);
      console.error('Stack trace:', error.stack);
    } finally {
      console.log('🔚 Closing browser...');
      await this.playwright.stopBrowser();
    }
  }
}

// Run debug session
const debugPlayer = new DebugAIPlayer();
debugPlayer.startDebugSession().catch(error => {
  console.error('Debug error:', error);
  process.exit(1);
});