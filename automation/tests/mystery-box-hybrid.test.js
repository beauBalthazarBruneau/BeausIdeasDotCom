#!/usr/bin/env node

import { BasePlayer } from '../core/index.js';
import { DEFAULT_CONFIG, TEST_SCENARIOS } from '../config/test-config.js';

/**
 * Mystery Box Test using the new hybrid BasePlayer
 * Demonstrates smart navigation, precise interaction, and comprehensive monitoring
 */
class MysteryBoxHybridTest {
  constructor(config = {}) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...TEST_SCENARIOS.mysteryBox,
      ...config
    };

    this.player = new BasePlayer('mystery-box-hybrid', this.config);
  }

  async run() {
    console.log('🎯 Starting Mystery Box Hybrid Test...');
    console.log('💎 Features: Smart navigation + Comprehensive monitoring + Video recording');

    try {
      // Start the automation session
      await this.player.startSession();

      // Execute test sequence
      await this.executeTestSequence();

      // Finish and generate report
      await this.player.finishSession();

      console.log('✅ Mystery Box Hybrid Test completed successfully!');

    } catch (error) {
      console.error('❌ Mystery Box Hybrid Test failed:', error.message);
      throw error;
    }
  }

  async executeTestSequence() {
    // 1. Analyze available mystery boxes
    await this.player.executeAction('Analyze Mystery Boxes', async () => {
      const analysis = await this.player.analyzeMysteryBoxes();

      if (!analysis.found) {
        throw new Error('No mystery boxes found in game');
      }

      console.log(`📦 Found ${analysis.count} mystery boxes`);
      return analysis;
    });

    // 2. Find and navigate to the first unhit mystery box
    const targetBox = await this.player.executeAction('Find Target Mystery Box', async () => {
      const analysis = await this.player.analyzeMysteryBoxes();
      const availableBox = analysis.boxes.find(box => !box.hasBeenHit);

      if (!availableBox) {
        throw new Error('No available mystery boxes to test');
      }

      console.log(`🎯 Target: ${availableBox.title} at (${availableBox.position.x}, ${availableBox.position.y})`);
      return availableBox;
    });

    // 3. Navigate to optimal hitting position
    await this.player.executeAction('Navigate to Mystery Box', async () => {
      const targetX = targetBox.position.x + 20; // Center of box
      await this.player.navigateToPosition(targetX, null, 'Mystery Box Hit Zone');

      const finalPos = await this.player.getPlayerPosition();
      console.log(`✅ Positioned at (${finalPos.x.toFixed(1)}, ${finalPos.y.toFixed(1)})`);
      return finalPos;
    });

    // 4. Hit the mystery box from below
    const hitSuccess = await this.player.executeAction('Hit Mystery Box', async () => {
      return await this.player.hitMysteryBoxFromBelow(targetBox.position);
    });

    // 5. Check for collectible spawn
    if (hitSuccess) {
      await this.player.executeAction('Verify Collectible Spawn', async () => {
        const spawnCheck = await this.player.playwright.page.evaluate(() => {
          const mysteryBoxes = window.game?.mysteryBoxes;
          if (!mysteryBoxes) return { spawned: false };

          const boxWithCollectible = mysteryBoxes.find(box =>
            box.collectible && !box.collectible.collected
          );

          return {
            spawned: !!boxWithCollectible,
            collectible: boxWithCollectible ? {
              position: {
                x: boxWithCollectible.collectible.x,
                y: boxWithCollectible.collectible.y
              }
            } : null
          };
        });

        if (spawnCheck.spawned) {
          console.log('✅ Collectible spawned successfully!');
          await this.player.takeScreenshot('collectible_spawned');
        } else {
          console.log('⚠️ No collectible spawned');
        }

        return spawnCheck;
      });

      // 6. Collect the item if it spawned
      const spawnResult = await this.player.playwright.page.evaluate(() => {
        const mysteryBoxes = window.game?.mysteryBoxes;
        const boxWithCollectible = mysteryBoxes?.find(box =>
          box.collectible && !box.collectible.collected
        );
        return boxWithCollectible?.collectible;
      });

      if (spawnResult) {
        await this.player.executeAction('Collect Item', async () => {
          return await this.player.collectItem({
            x: spawnResult.x,
            y: spawnResult.y
          });
        });
      }
    }

    // 7. Verify mystery box completion
    await this.player.executeAction('Verify Completion', async () => {
      const completionCheck = await this.player.playwright.page.evaluate(() => {
        const mysteryBoxes = window.game?.mysteryBoxes;
        const completedBox = mysteryBoxes?.find(box => box.state === 'completed');

        return {
          completed: !!completedBox,
          completedBox: completedBox ? {
            title: completedBox.projectData?.title,
            state: completedBox.state
          } : null
        };
      });

      if (completionCheck.completed) {
        console.log('🏆 Mystery box completed successfully!');
        await this.player.takeScreenshot('mystery_box_completed');
      }

      this.player.addResult('Mystery Box Completion', completionCheck.completed, completionCheck);
      return completionCheck;
    });

    // 8. Performance analysis
    await this.player.executeAction('Performance Analysis', async () => {
      const performance = await this.player.getGamePerformance();
      console.log(`📊 Performance rating: ${performance.rating}`);
      console.log(`📊 Console errors: ${performance.consoleErrors}`);
      return performance;
    });
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const test = new MysteryBoxHybridTest();
  test.run().catch(error => {
    console.error('Test error:', error);
    process.exit(1);
  });
}

export default MysteryBoxHybridTest;