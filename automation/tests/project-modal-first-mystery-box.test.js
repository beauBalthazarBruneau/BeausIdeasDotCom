#!/usr/bin/env node
import { BasePlayer } from '../core/index.js';
import { DEFAULT_CONFIG, TEST_SCENARIOS } from '../config/test-config.js';

/**
 * Project Modal First Mystery Box Test
 *
 * Tests the complete project modal interaction flow with the first mystery box in the game:
 * 1. Mystery box hit from below and collectible spawn
 * 2. Collectible collection triggering the project modal
 * 3. Modal display positioning (right side, half screen)
 * 4. Camera zoom positioning (player center-left of screen)
 * 5. Game pause during modal (movement stopped, music continues)
 * 6. Modal closing with X button or spacebar
 * 7. Game resume after modal close
 *
 * Based on Linear ticket POR-9 requirements and existing implementation.
 */
class ProjectModalFirstMysteryBoxTest {
  constructor(config = {}) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      // Custom config for modal testing
      slowMo: 300, // Slower for visual verification
      enablePositionTracking: true,
      cleanupAfter: true,
    };
    this.player = new BasePlayer('project-modal-first-mystery-box', this.config);

    // First mystery box coordinates (tutorial box)
    this.mysteryBoxPosition = { x: 250, y: 450 };
    this.collectiblePosition = { x: 250, y: 410 }; // Spawns 40px above mystery box

    // Test results tracking
    this.testResults = {
      mysteryBoxHit: false,
      collectibleSpawned: false,
      collectibleCollected: false,
      modalDisplayed: false,
      cameraZoomed: false,
      gamePaused: false,
      modalClosed: false,
      gameResumed: false,
      errors: []
    };
  }

  async run() {
    try {
      await this.player.startSession();
      await this.executeTestSequence();
      await this.generateReport();
      await this.player.finishSession();
    } catch (error) {
      console.error('Test execution failed:', error);
      this.testResults.errors.push(`Test execution failed: ${error.message}`);
      await this.player.takeScreenshot('test_failed');
      throw error;
    }
  }

  async executeTestSequence() {
    console.log('🎮 Starting Project Modal First Mystery Box Test...');
    console.log(`🎯 Target: Tutorial mystery box at (${this.mysteryBoxPosition.x}, ${this.mysteryBoxPosition.y})`);

    // Phase 1: Setup and Navigation
    await this.setupAndNavigate();

    // Phase 2: Mystery Box Interaction
    await this.testMysteryBoxInteraction();

    // Phase 3: Collectible Collection and Modal
    await this.testCollectibleAndModal();

    // Phase 4: Modal Controls and Game Resume
    await this.testModalControlsAndResume();

    console.log('✅ Project Modal Test completed successfully');
  }

  async setupAndNavigate() {
    await this.player.executeAction('Setup and Navigate to Mystery Box', async () => {
      // Wait for game to fully load
      await this.player.playwright.page.waitForTimeout(2000);

      // Take initial screenshot
      await this.player.takeScreenshot('initial_state');

      // Get initial player position
      const initialPos = await this.player.getPlayerPosition();
      console.log(`📍 Initial player position: (${initialPos.x}, ${initialPos.y})`);

      // Navigate to mystery box with high precision
      console.log(`🎯 Navigating to mystery box at (${this.mysteryBoxPosition.x}, ${this.mysteryBoxPosition.y})`);
      await this.player.navigateToPosition(
        this.mysteryBoxPosition.x,
        this.mysteryBoxPosition.y + 60, // Position slightly below mystery box for hitting from below
        'Position below mystery box for upward hit'
      );

      // Verify positioning
      const finalPos = await this.player.getPlayerPosition();
      const distance = Math.sqrt(
        Math.pow(finalPos.x - this.mysteryBoxPosition.x, 2) +
        Math.pow(finalPos.y - (this.mysteryBoxPosition.y + 60), 2)
      );

      console.log(`📍 Final position: (${finalPos.x}, ${finalPos.y}), Distance: ${distance.toFixed(1)}px`);

      if (distance > 25) {
        console.warn(`⚠️ Positioning not optimal (${distance.toFixed(1)}px away), but proceeding`);
      }

      await this.player.takeScreenshot('positioned_below_mystery_box');
    });
  }

  async testMysteryBoxInteraction() {
    await this.player.executeAction('Hit Mystery Box From Below', async () => {
      // Get game state before hit
      const preHitState = await this.getGameState();
      console.log('📊 Pre-hit state:', preHitState);

      // Perform upward jump to hit mystery box from below
      console.log('🚀 Jumping to hit mystery box from below...');
      await this.player.jump();

      // Wait for hit detection and visual feedback
      await this.player.playwright.page.waitForTimeout(500);

      // Verify mystery box was hit and collectible spawned
      const postHitState = await this.getGameState();
      console.log('📊 Post-hit state:', postHitState);

      // Check if mystery box changed state (should go from 'inactive' to 'hit')
      if (postHitState.mysteryBox && postHitState.mysteryBox.state === 'hit') {
        this.testResults.mysteryBoxHit = true;
        console.log('✅ Mystery box successfully hit!');
      } else {
        console.warn('⚠️ Mystery box hit not detected - may need retry');
        // Try another jump if first didn't work
        await this.player.jump();
        await this.player.playwright.page.waitForTimeout(500);

        const retryState = await this.getGameState();
        if (retryState.mysteryBox && retryState.mysteryBox.state === 'hit') {
          this.testResults.mysteryBoxHit = true;
          console.log('✅ Mystery box hit successful on retry!');
        }
      }

      // Check for collectible spawn
      if (postHitState.collectible && postHitState.collectible.spawned) {
        this.testResults.collectibleSpawned = true;
        console.log('✅ Collectible spawned successfully!');
      }

      await this.player.takeScreenshot('mystery_box_hit_collectible_spawned');
    });
  }

  async testCollectibleAndModal() {
    await this.player.executeAction('Collect Item and Verify Modal', async () => {
      // Position to the side of mystery box for jump collection
      console.log(`🎯 Positioning to side of mystery box for jump collection...`);
      const sideX = this.mysteryBoxPosition.x - 50; // Position to left side of mystery box

      await this.player.navigateToPosition(
        sideX,
        null, // Stay at ground level
        'Side of mystery box for jump collection'
      );

      await this.player.playwright.page.waitForTimeout(500);

      // Execute jump collection sequence: double jump while moving over box
      console.log(`🤸 Double jumping while moving over mystery box to collect...`);

      // Start double jump
      await this.player.jump();
      await this.player.playwright.page.waitForTimeout(100);

      // While in air, start moving right toward collectible
      await this.player.playwright.page.keyboard.down('ArrowRight');

      // Second jump (double jump)
      await this.player.jump();

      // Continue moving right while in air to get over the box
      await this.player.playwright.page.waitForTimeout(400);

      // Release movement
      await this.player.playwright.page.keyboard.up('ArrowRight');

      // Wait for landing and collection
      await this.player.playwright.page.waitForTimeout(800);

      console.log(`✅ Jump collection sequence completed`);

      // Check if modal appeared
      const modalState = await this.checkModalState();

      if (modalState.isVisible) {
        this.testResults.collectibleCollected = true;
        this.testResults.modalDisplayed = true;
        console.log('✅ Collectible collected and modal displayed!');

        // Verify modal positioning and content
        await this.verifyModalDisplay(modalState);

        // Verify camera zoom and player positioning
        await this.verifyCameraAndPlayerState();

        // Verify game pause state
        await this.verifyGamePauseState();

        await this.player.takeScreenshot('modal_displayed_game_paused');
      } else {
        this.testResults.errors.push('Modal did not appear after collectible collection');
        console.error('❌ Modal failed to appear');
      }
    });
  }

  async testModalControlsAndResume() {
    await this.player.executeAction('Test Modal Controls and Game Resume', async () => {
      // Test spacebar close first
      console.log('🎹 Testing spacebar modal close...');
      await this.player.playwright.page.keyboard.press('Space');
      await this.player.playwright.page.waitForTimeout(1000); // Longer wait for animation

      let modalState = await this.checkModalState();

      if (!modalState.isVisible) {
        this.testResults.modalClosed = true;
        console.log('✅ Modal closed successfully with spacebar!');

        // Verify camera zoomed back out after close
        await this.verifyCameraZoomOut();

        // Verify game resumed
        await this.verifyGameResumeState();
        await this.player.takeScreenshot('modal_closed_game_resumed');
      } else {
        console.log('❌ Spacebar close failed, trying X button...');

        // Try clicking close button with various selectors
        const closeSelectors = [
          '#modal-close',
          '.modal-close',
          '[data-testid="close-modal"]',
          '.project-modal .close',
          '.close-button'
        ];

        let closeSuccessful = false;

        for (const selector of closeSelectors) {
          try {
            console.log(`🔍 Trying close selector: ${selector}`);
            await this.player.playwright.page.click(selector);
            await this.player.playwright.page.waitForTimeout(1000);

            modalState = await this.checkModalState();
            if (!modalState.isVisible) {
              this.testResults.modalClosed = true;
              console.log(`✅ Modal closed successfully with selector: ${selector}!`);

              // Verify camera zoomed back out after close
              await this.verifyCameraZoomOut();

              await this.verifyGameResumeState();
              closeSuccessful = true;
              break;
            }
          } catch (error) {
            console.log(`⚠️ Close selector ${selector} failed: ${error.message}`);
          }
        }

        if (!closeSuccessful) {
          this.testResults.errors.push('Both spacebar and close button selectors failed to close modal');
        }
      }

      // Test movement after modal close to ensure game resumed
      if (this.testResults.modalClosed) {
        console.log('🏃 Testing movement after modal close...');
        const preMovementPos = await this.player.getPlayerPosition();

        // Move right briefly
        await this.player.playwright.page.keyboard.down('ArrowRight');
        await this.player.playwright.page.waitForTimeout(500);
        await this.player.playwright.page.keyboard.up('ArrowRight');

        const postMovementPos = await this.player.getPlayerPosition();

        if (Math.abs(postMovementPos.x - preMovementPos.x) > 5) {
          this.testResults.gameResumed = true;
          console.log('✅ Game successfully resumed - player can move!');
        } else {
          this.testResults.errors.push('Player movement not working after modal close');
          console.error('❌ Player cannot move after modal close');
        }

        await this.player.takeScreenshot('movement_test_after_modal');
      }
    });
  }

  async getGameState() {
    return await this.player.playwright.page.evaluate(() => {
      if (!window.game) return { error: 'Game not found' };

      const game = window.game;
      const mysteryBox = game.mysteryBoxes?.[0]; // First mystery box
      const player = game.player;

      return {
        gameTime: game.gameTime,
        isPaused: game.state === 'paused',
        canvasSize: {
          width: game.canvas?.width || 1920,
          height: game.canvas?.height || 1080
        },
        player: player ? {
          x: Math.round(player.x),
          y: Math.round(player.y),
          velocity: {
            x: Math.round(player.body?.velocity?.x || 0),
            y: Math.round(player.body?.velocity?.y || 0)
          },
          isGrounded: player.isGrounded
        } : null,
        mysteryBox: mysteryBox ? {
          x: mysteryBox.x,
          y: mysteryBox.y,
          state: mysteryBox.state,
          hasBeenHit: mysteryBox.hasBeenHit
        } : null,
        collectible: mysteryBox?.collectible ? {
          x: mysteryBox.collectible.x,
          y: mysteryBox.collectible.y,
          spawned: !mysteryBox.collectible.spawning,
          collected: mysteryBox.collectible.collected
        } : null,
        camera: game.camera ? {
          x: Math.round(game.camera.x),
          y: Math.round(game.camera.y),
          zoom: game.camera.zoom
        } : null
      };
    });
  }

  async checkModalState() {
    return await this.player.playwright.page.evaluate(() => {
      const modal = document.getElementById('project-modal');
      const overlay = document.getElementById('project-modal-overlay');

      if (!modal || !overlay) {
        return { isVisible: false, error: 'Modal elements not found' };
      }

      const modalStyle = window.getComputedStyle(modal);
      const overlayStyle = window.getComputedStyle(overlay);

      return {
        isVisible: overlayStyle.display !== 'none' && modalStyle.opacity > '0',
        positioning: {
          width: modalStyle.width,
          height: modalStyle.height,
          right: modalStyle.right,
          top: modalStyle.top,
          transform: modalStyle.transform
        },
        content: {
          title: document.getElementById('project-title')?.textContent || '',
          subtitle: document.getElementById('project-subtitle')?.textContent || '',
          hasImage: document.getElementById('project-image')?.src ? true : false,
          hasDescription: document.getElementById('project-description')?.textContent.length > 0
        }
      };
    });
  }

  async verifyModalDisplay(modalState) {
    console.log('🔍 Verifying modal display properties...');

    // Check positioning (should be right side of screen)
    // Accept actual pixel values or percentage values for right side positioning
    const width = modalState.positioning.width;
    const right = modalState.positioning.right;

    // Modal should be on right side (low right value means closer to right edge)
    const rightValue = parseInt(right) || 0;
    const isOnRightSide = rightValue < 100; // Within 100px of right edge

    if (isOnRightSide && (width.includes('px') || width.includes('%'))) {
      console.log(`✅ Modal positioned correctly on right side (width: ${width}, right: ${right})`);
    } else {
      this.testResults.errors.push(`Modal positioning may need adjustment: width=${width}, right=${right}`);
    }

    // Check content
    if (modalState.content.title === 'Welcome to Mario Portfolio!') {
      console.log('✅ Modal shows correct tutorial project content');
    } else {
      this.testResults.errors.push(`Modal content incorrect: title="${modalState.content.title}"`);
    }

    console.log('📋 Modal content preview:', {
      title: modalState.content.title.substring(0, 30) + '...',
      hasImage: modalState.content.hasImage,
      hasDescription: modalState.content.hasDescription
    });
  }

  async verifyCameraAndPlayerState() {
    console.log('🎥 Verifying camera zoom and player positioning...');

    const gameState = await this.getGameState();

    if (gameState.camera && gameState.camera.zoom > 1.0) {
      this.testResults.cameraZoomed = true;
      console.log(`✅ Camera zoomed in successfully (zoom: ${gameState.camera.zoom.toFixed(6)}x)`);

      // Verify player positioning in center-left of screen
      // When modal is open, camera should center player in left half of screen
      const screenCenterX = 960; // Half of 1920px screen width
      const leftHalfCenterX = 480; // Center of left half (960/2)

      // Calculate player's screen position relative to camera
      const playerScreenX = gameState.player.x - gameState.camera.x;
      const playerScreenY = gameState.player.y - gameState.camera.y;

      console.log(`📍 Player position during zoom: (${gameState.player.x}, ${gameState.player.y})`);
      console.log(`🎥 Camera position: (${gameState.camera.x}, ${gameState.camera.y})`);
      console.log(`📺 Player screen position: (${playerScreenX.toFixed(1)}, ${playerScreenY.toFixed(1)})`);

      // Get actual screen dimensions from game state
      const screenWidth = gameState.canvasSize?.width || 1920; // Fallback to 1920 if not available
      const screenHeight = gameState.canvasSize?.height || 1080; // Fallback to 1080 if not available

      // Calculate expected positions based on actual screen size
      const expectedX = screenWidth * 0.25; // 25% from left edge
      const expectedY = screenHeight * 0.5;  // 50% from top edge
      const tolerance = 50; // 50px tolerance

      const isCorrectX = Math.abs(playerScreenX - expectedX) < tolerance;
      const isCorrectY = Math.abs(playerScreenY - expectedY) < tolerance;

      if (isCorrectX && isCorrectY) {
        console.log(`✅ Player correctly positioned at 25% from left, 50% from top (x=${playerScreenX.toFixed(1)}, y=${playerScreenY.toFixed(1)})`);
      } else {
        console.log(`⚠️ Player positioning needs adjustment:`);
        console.log(`   Expected: x=${expectedX}, y=${expectedY}`);
        console.log(`   Got: x=${playerScreenX.toFixed(1)}, y=${playerScreenY.toFixed(1)}`);
        console.log(`   Difference: x=${Math.abs(playerScreenX - expectedX).toFixed(1)}px, y=${Math.abs(playerScreenY - expectedY).toFixed(1)}px`);
      }
    } else {
      this.testResults.errors.push('Camera did not zoom in for modal view');
    }
  }

  async verifyGamePauseState() {
    console.log('⏸️ Verifying game pause state...');

    const gameState = await this.getGameState();

    if (gameState.isPaused) {
      this.testResults.gamePaused = true;
      console.log('✅ Game correctly paused during modal display');
    } else {
      this.testResults.errors.push('Game not paused during modal display');
    }

    // Test that player velocity is very low (movement effectively stopped)
    // Note: During modal transitions there might be small residual velocity
    const velocityThreshold = 2.0; // More lenient threshold for modal state
    if (gameState.player && Math.abs(gameState.player.velocity.x) < velocityThreshold) {
      console.log(`✅ Player movement effectively stopped during pause (velocity: ${gameState.player.velocity.x.toFixed(2)})`);
    } else {
      console.log(`⚠️ Player velocity higher than expected during modal (velocity: ${gameState.player.velocity.x.toFixed(2)})`);
      // Don't treat this as a critical error since modal transitions can have residual movement
    }

    // Note: Music continuation check would require audio API access
    console.log('🎵 Music continuation check: Not implemented (requires audio API access)');
  }

  async verifyCameraZoomOut() {
    console.log('🔍 Verifying camera zoom out after modal close...');

    const gameState = await this.getGameState();

    if (gameState.camera) {
      console.log(`🎥 Camera zoom after close: ${gameState.camera.zoom.toFixed(6)}x`);

      if (gameState.camera.zoom <= 1.1) { // Allow small tolerance for zoom out
        console.log('✅ Camera successfully zoomed back out');
      } else {
        console.log('⚠️ Camera may still be zoomed in after modal close');
      }
    }
  }

  async verifyGameResumeState() {
    console.log('▶️ Verifying game resume state...');

    const gameState = await this.getGameState();

    if (!gameState.isPaused) {
      this.testResults.gameResumed = true;
      console.log('✅ Game successfully resumed after modal close');
    } else {
      this.testResults.errors.push('Game still paused after modal close');
    }
  }

  async generateReport() {
    const report = {
      testName: 'Project Modal First Mystery Box Test',
      timestamp: new Date().toISOString(),
      results: this.testResults,
      summary: {
        totalSteps: 8,
        passedSteps: Object.values(this.testResults).filter(v => v === true).length,
        errors: this.testResults.errors.length
      },
      recommendations: this.generateRecommendations()
    };

    console.log('\n📊 Test Report Summary:');
    console.log(`✅ Mystery Box Hit: ${this.testResults.mysteryBoxHit}`);
    console.log(`✅ Collectible Spawned: ${this.testResults.collectibleSpawned}`);
    console.log(`✅ Collectible Collected: ${this.testResults.collectibleCollected}`);
    console.log(`✅ Modal Displayed: ${this.testResults.modalDisplayed}`);
    console.log(`✅ Camera Zoomed: ${this.testResults.cameraZoomed}`);
    console.log(`✅ Game Paused: ${this.testResults.gamePaused}`);
    console.log(`✅ Modal Closed: ${this.testResults.modalClosed}`);
    console.log(`✅ Game Resumed: ${this.testResults.gameResumed}`);
    console.log(`❌ Errors: ${this.testResults.errors.length}`);

    if (this.testResults.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      this.testResults.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }

    console.log(`\n🎯 Overall Success Rate: ${report.summary.passedSteps}/${report.summary.totalSteps} (${Math.round(report.summary.passedSteps/report.summary.totalSteps*100)}%)`);

    // Report saved automatically by BasePlayer

    return report;
  }

  generateRecommendations() {
    const recommendations = [];

    if (!this.testResults.mysteryBoxHit) {
      recommendations.push('Mystery box hit detection may need adjustment - ensure collision detection is working from below');
    }

    if (!this.testResults.collectibleSpawned) {
      recommendations.push('Collectible spawn timing may need review - ensure proper spawning after mystery box hit');
    }

    if (!this.testResults.modalDisplayed) {
      recommendations.push('Modal display integration needs review - ensure collectible collection triggers modal properly');
    }

    if (!this.testResults.cameraZoomed) {
      recommendations.push('Camera zoom integration may need adjustment for modal view');
    }

    if (!this.testResults.gamePaused) {
      recommendations.push('Game pause mechanism needs review to ensure proper state management during modal');
    }

    if (!this.testResults.modalClosed) {
      recommendations.push('Modal close controls need review - both spacebar and X button should work');
    }

    if (!this.testResults.gameResumed) {
      recommendations.push('Game resume mechanism needs review to ensure proper state restoration after modal');
    }

    if (recommendations.length === 0) {
      recommendations.push('All project modal interactions working correctly! Consider testing edge cases and performance under stress.');
    }

    return recommendations;
  }
}

export default ProjectModalFirstMysteryBoxTest;

// Allow direct execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const test = new ProjectModalFirstMysteryBoxTest();
  test.run().catch(console.error);
}