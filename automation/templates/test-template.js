#!/usr/bin/env node

import { BasePlayer } from '../core/index.js';
import { DEFAULT_CONFIG } from '../config/test-config.js';

/**
 * Template for creating new tests using the BasePlayer
 * Copy this file and customize for your specific test scenario
 */
class YourCustomTest {
  constructor(config = {}) {
    // Merge your custom config with defaults
    this.config = {
      ...DEFAULT_CONFIG,
      // Add your test-specific config here
      duration: 60000, // 1 minute
      ...config
    };

    // Create BasePlayer instance
    this.player = new BasePlayer('your-test-name', this.config);
  }

  async run() {
    console.log('🎮 Starting Your Custom Test...');

    try {
      // Initialize the test session
      await this.player.startSession();

      // Execute your test logic
      await this.executeYourTestLogic();

      // Finish and generate comprehensive report
      await this.player.finishSession();

      console.log('✅ Your Custom Test completed!');

    } catch (error) {
      console.error('❌ Test failed:', error.message);
      throw error;
    }
  }

  async executeYourTestLogic() {
    // Example 1: Navigate to a specific position
    await this.player.executeAction('Navigate to Position', async () => {
      return await this.player.navigateToPosition(400, null, 'Target Area');
    });

    // Example 2: Take a screenshot
    await this.player.takeScreenshot('custom_checkpoint');

    // Example 3: Analyze game state
    await this.player.executeAction('Analyze Game State', async () => {
      const gameState = await this.player.playwright.page.evaluate(() => {
        return {
          playerPos: window.game?.player ? {
            x: window.game.player.body.position.x,
            y: window.game.player.body.position.y
          } : null,
          // Add your custom game state analysis here
        };
      });

      console.log('🔍 Custom game state:', gameState);
      return gameState;
    });

    // Example 4: Test specific functionality
    await this.player.executeAction('Test Custom Feature', async () => {
      // Implement your custom test logic here
      // Use this.player.jump(), this.player.navigateToPosition(), etc.

      // Example: Jump test
      await this.player.jump();
      await this.player.playwright.executeAction({ type: 'wait', duration: 500 });

      const result = await this.player.getPlayerPosition();
      console.log('🤘 Jump result:', result);

      return result;
    });

    // Example 5: Performance check
    await this.player.executeAction('Check Performance', async () => {
      return await this.player.getGamePerformance();
    });
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const test = new YourCustomTest();
  test.run().catch(error => {
    console.error('Test error:', error);
    process.exit(1);
  });
}

export default YourCustomTest;