#!/usr/bin/env node

import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';

class MysteryBoxTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.outputDir = './mystery-box-results';
    this.testResults = [];
  }

  async startTest() {
    console.log('📦 Starting Mystery Box Interaction Test...');
    console.log(
      '🎯 This will test the tutorial mystery box interaction specifically'
    );

    try {
      await this.setupBrowser();
      await this.runMysteryBoxTests();
      await this.generateReport();
    } catch (error) {
      console.error('❌ Mystery box test failed:', error.message);
    } finally {
      await this.cleanup();
    }
  }

  async setupBrowser() {
    console.log('🚀 Setting up browser...');
    this.browser = await chromium.launch({
      headless: false, // Show the browser for visual feedback
      slowMo: 200, // Slow down actions to see what's happening
    });

    const context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });

    this.page = await context.newPage();

    // Listen to console messages
    this.page.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();
      if (
        text.includes('mystery') ||
        text.includes('Mystery') ||
        text.includes('collectible')
      ) {
        console.log(`[GAME] ${type}: ${text}`);
      }
    });

    // Setup output directory
    await fs.mkdir(this.outputDir, { recursive: true });
    console.log('✅ Browser setup complete');
  }

  async runMysteryBoxTests() {
    console.log('🎮 Loading game...');

    // Load the game
    await this.page.goto('http://localhost:9000?dev=true', {
      waitUntil: 'networkidle',
      timeout: 10000,
    });

    // Wait for game to initialize
    await this.page.waitForTimeout(3000);

    // Click on canvas to ensure keyboard focus for controls
    await this.page.click('#game-canvas');
    await this.page.waitForTimeout(500);
    console.log('🎯 Clicked on game canvas for keyboard focus');

    // Take initial screenshot
    await this.takeScreenshot('initial_load');

    // Verify game loaded
    const gameState = await this.page.evaluate(() => {
      return {
        gameLoaded: typeof window.game !== 'undefined',
        playerExists: window.game?.player ? true : false,
        playerPosition: window.game?.player
          ? {
              x: window.game.player.body.position.x,
              y: window.game.player.body.position.y,
            }
          : null,
        mysteryBoxCount: window.game?.mysteryBoxes
          ? window.game.mysteryBoxes.length
          : 0,
      };
    });

    console.log('📊 Initial game state:', gameState);
    this.addResult('Game Load', gameState.gameLoaded, gameState);

    if (!gameState.gameLoaded) {
      throw new Error('Game failed to load properly');
    }

    // Find and analyze mystery boxes
    await this.analyzeMysteryBoxes();

    // Test the tutorial mystery box specifically
    await this.testTutorialMysteryBox();
  }

  async analyzeMysteryBoxes() {
    console.log('🔍 Analyzing mystery boxes...');

    const mysteryBoxAnalysis = await this.page.evaluate(() => {
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
          hasBeenHit: box.hasBeenHit,
        })),
      };
    });

    console.log('📦 Mystery box analysis:', mysteryBoxAnalysis);
    this.addResult(
      'Mystery Box Analysis',
      mysteryBoxAnalysis.found,
      mysteryBoxAnalysis
    );

    await this.takeScreenshot('mystery_box_analysis');

    return mysteryBoxAnalysis;
  }

  async testTutorialMysteryBox() {
    console.log('🎯 Testing tutorial mystery box interaction...');

    // Get initial player and mystery box positions
    const initialState = await this.page.evaluate(() => {
      const player = window.game?.player;
      const mysteryBoxes = window.game?.mysteryBoxes;
      const tutorialBox = mysteryBoxes?.find(
        (box) => box.projectData?.title?.includes('Welcome') || box.x < 300
      );

      return {
        playerPos: player
          ? {
              x: player.body.position.x,
              y: player.body.position.y,
            }
          : null,
        tutorialBox: tutorialBox
          ? {
              x: tutorialBox.x,
              y: tutorialBox.y,
              state: tutorialBox.state,
              title: tutorialBox.projectData?.title,
            }
          : null,
      };
    });

    console.log('📍 Initial positions:', initialState);

    if (!initialState.tutorialBox) {
      console.log(
        '⚠️  No tutorial mystery box found, testing first available box'
      );
    }

    // Navigate to mystery box
    await this.navigateToMysteryBox(
      initialState.tutorialBox || { x: 250, y: 450 }
    );

    // Test hitting the mystery box from below
    await this.hitMysteryBoxFromBelow();

    // Verify collectible spawned
    await this.verifyCollectibleSpawned();

    // Collect the collectible
    await this.collectCollectible();

    // Verify mystery box completion
    await this.verifyMysteryBoxCompletion();
  }

  async navigateToMysteryBox(mysteryBox) {
    console.log(
      `🏃 Navigating to mystery box at (${mysteryBox.x}, ${mysteryBox.y})...`
    );

    // Move player directly under the mystery box for optimal hitting position
    const targetX = mysteryBox.x + 20; // Center of mystery box (box is 40px wide, so center is +20)
    console.log(
      `🎯 Mystery box center calculated at x=${targetX} (box.x=${mysteryBox.x} + 20)`
    );

    // Get current player position
    const currentPos = await this.page.evaluate(() => {
      return window.game?.player
        ? {
            x: window.game.player.body.position.x,
            y: window.game.player.body.position.y,
          }
        : null;
    });

    console.log(
      `📍 Player at (${currentPos.x}, ${currentPos.y}), moving to (${targetX}, ${mysteryBox.y})`
    );

    // Smart positioning with real-time feedback to minimize back-and-forth movement
    await this.smartPositioning(targetX, 'Mystery Box Center');

    await this.takeScreenshot('positioned_near_mystery_box');

    const finalPos = await this.page.evaluate(() => {
      return window.game?.player
        ? {
            x: window.game.player.body.position.x,
            y: window.game.player.body.position.y,
          }
        : null;
    });

    console.log(`📍 Player positioned at (${finalPos.x}, ${finalPos.y})`);
  }

  async hitMysteryBoxFromBelow() {
    console.log('⬆️  Attempting to hit mystery box from below...');

    // Get precise positions and collision info before attempting hit
    const beforeHit = await this.page.evaluate(() => {
      const player = window.game?.player;
      const mysteryBoxes = window.game?.mysteryBoxes;
      const targetBox = mysteryBoxes?.find((box) => !box.hasBeenHit);

      return {
        playerPos: player
          ? {
              x: player.body.position.x,
              y: player.body.position.y,
              width: 32, // Typical player width
              height: 32, // Typical player height
            }
          : null,
        boxPos: targetBox
          ? {
              x: targetBox.x,
              y: targetBox.y,
              width: 40, // Mystery box width
              height: 40, // Mystery box height
              centerX: targetBox.x + 20,
              centerY: targetBox.y + 20,
              bottom: targetBox.y + 40,
              top: targetBox.y,
              left: targetBox.x,
              right: targetBox.x + 40,
            }
          : null,
      };
    });

    console.log('📍 Positions before hit:');
    console.log(
      `   Player: (${beforeHit.playerPos.x.toFixed(1)}, ${beforeHit.playerPos.y.toFixed(1)}) ${beforeHit.playerPos.width}x${beforeHit.playerPos.height}`
    );
    console.log(
      `   Box: (${beforeHit.boxPos.x}, ${beforeHit.boxPos.y}) ${beforeHit.boxPos.width}x${beforeHit.boxPos.height}`
    );
    console.log(
      `   Box bounds: left=${beforeHit.boxPos.left}, right=${beforeHit.boxPos.right}, top=${beforeHit.boxPos.top}, bottom=${beforeHit.boxPos.bottom}`
    );

    // Fine-tune position to be directly under the mystery box
    if (beforeHit.boxPos) {
      const boxCenterX = beforeHit.boxPos.centerX;
      const playerX = beforeHit.playerPos.x;
      const boxY = beforeHit.boxPos.y;
      const playerY = beforeHit.playerPos.y;

      console.log(
        `📍 Box center: (${boxCenterX}, ${beforeHit.boxPos.centerY}), Player: (${playerX.toFixed(1)}, ${playerY.toFixed(1)})`
      );
      console.log(
        `📏 Distance: horizontal=${Math.abs(playerX - boxCenterX).toFixed(1)}, vertical=${Math.abs(playerY - boxY).toFixed(1)}`
      );

      // Check if player is within horizontal collision range
      const playerLeft = playerX - beforeHit.playerPos.width / 2;
      const playerRight = playerX + beforeHit.playerPos.width / 2;
      const horizontalOverlap = !(
        playerRight < beforeHit.boxPos.left ||
        playerLeft > beforeHit.boxPos.right
      );
      console.log(
        `🔍 Horizontal collision check: Player(${playerLeft.toFixed(1)}-${playerRight.toFixed(1)}) vs Box(${beforeHit.boxPos.left}-${beforeHit.boxPos.right}) = ${horizontalOverlap ? 'OVERLAP' : 'NO OVERLAP'}`
      );

      // Use smart positioning for precise jump alignment if not overlapping
      if (!horizontalOverlap) {
        console.log(`🏃 Fine-tuning jump position for horizontal overlap...`);
        await this.smartPositioning(boxCenterX, 'Jump Position');
      } else {
        console.log(`✅ Player already positioned for collision!`);
      }
    }

    // Multiple jump attempts with different timings and positioning
    for (let attempt = 1; attempt <= 5; attempt++) {
      console.log(
        `🤘 Jump attempt ${attempt}: Jumping UP to hit mystery box from below...`
      );

      // Get current position before jump
      const preJumpPos = await this.page.evaluate(() => {
        const player = window.game?.player;
        return player
          ? {
              x: player.body.position.x.toFixed(1),
              y: player.body.position.y.toFixed(1),
              velocity: {
                x: player.body.velocity.x.toFixed(2),
                y: player.body.velocity.y.toFixed(2),
              },
            }
          : null;
      });

      console.log(
        `🚀 Pre-jump: pos(${preJumpPos.x}, ${preJumpPos.y}) vel(${preJumpPos.velocity.x}, ${preJumpPos.velocity.y})`
      );

      // Jump to hit the mystery box from below (using ArrowUp for reliable automation)
      await this.page.keyboard.down('ArrowUp');
      await this.page.waitForTimeout(100);
      await this.page.keyboard.up('ArrowUp');

      // Wait a bit and then check for collision during jump
      await this.page.waitForTimeout(200); // Wait for jump to start

      // Check during jump arc
      const midJumpCheck = await this.page.evaluate(() => {
        const player = window.game?.player;
        const mysteryBoxes = window.game?.mysteryBoxes;
        const hitBox = mysteryBoxes?.find((box) => box.hasBeenHit);

        return {
          playerPos: player
            ? {
                x: player.body.position.x.toFixed(1),
                y: player.body.position.y.toFixed(1),
                velocity: {
                  x: player.body.velocity.x.toFixed(2),
                  y: player.body.velocity.y.toFixed(2),
                },
              }
            : null,
          hit: !!hitBox,
          hitBox,
        };
      });

      console.log(
        `⬆️  Mid-jump: pos(${midJumpCheck.playerPos.x}, ${midJumpCheck.playerPos.y}) vel(${midJumpCheck.playerPos.velocity.x}, ${midJumpCheck.playerPos.velocity.y})`
      );

      if (midJumpCheck.hit) {
        console.log('✅ Hit detected during jump arc!');
        await this.takeScreenshot('mystery_box_hit_success');
        this.addResult('Mystery Box Hit', true, midJumpCheck);
        return;
      }

      // Wait for jump to complete
      await this.page.waitForTimeout(600);

      // Check final result after jump completes
      const postJumpResult = await this.page.evaluate(() => {
        const player = window.game?.player;
        const mysteryBoxes = window.game?.mysteryBoxes;
        const hitBox = mysteryBoxes?.find((box) => box.hasBeenHit);

        return {
          playerPos: player
            ? {
                x: player.body.position.x.toFixed(1),
                y: player.body.position.y.toFixed(1),
              }
            : null,
          hit: !!hitBox,
          hitBox: hitBox
            ? {
                title: hitBox.projectData?.title,
                state: hitBox.state,
                collectibleSpawned: hitBox.collectibleSpawned,
              }
            : null,
        };
      });

      console.log(
        `🎯 Post-jump: pos(${postJumpResult.playerPos.x}, ${postJumpResult.playerPos.y}) - Hit: ${postJumpResult.hit}`
      );

      if (postJumpResult.hit) {
        console.log('✅ Successfully hit mystery box!');
        await this.takeScreenshot('mystery_box_hit_success');
        this.addResult('Mystery Box Hit', true, postJumpResult);
        return;
      }

      // If not hit, try different positioning for next attempt
      if (attempt < 5) {
        console.log(
          `🔄 Attempt ${attempt} failed, adjusting position for next attempt...`
        );

        // Small positioning adjustments between attempts
        if (attempt % 2 === 0) {
          // Even attempts: move slightly left
          await this.page.keyboard.press('ArrowLeft');
          await this.page.waitForTimeout(100);
        } else {
          // Odd attempts: move slightly right
          await this.page.keyboard.press('ArrowRight');
          await this.page.waitForTimeout(100);
        }

        await this.page.waitForTimeout(200); // Brief pause between attempts
      }
    }

    // If all attempts failed, take final screenshot and record failure
    await this.takeScreenshot('mystery_box_hit_failed');
    console.log('❌ All jump attempts failed to hit mystery box');
    this.addResult('Mystery Box Hit', false, { attempts: 3, hit: false });
  }

  async verifyCollectibleSpawned() {
    console.log('🔍 Checking if collectible spawned...');

    const collectibleCheck = await this.page.evaluate(() => {
      const mysteryBoxes = window.game?.mysteryBoxes;
      if (!mysteryBoxes) return { found: false };

      // Find a box that has spawned a collectible
      const boxWithCollectible = mysteryBoxes.find(
        (box) => box.collectible && !box.collectible.collected
      );

      return {
        found: !!boxWithCollectible,
        collectible: boxWithCollectible
          ? {
              position: {
                x: boxWithCollectible.collectible.x,
                y: boxWithCollectible.collectible.y,
              },
              collected: boxWithCollectible.collectible.collected,
            }
          : null,
      };
    });

    console.log('🎁 Collectible spawn check:', collectibleCheck);
    this.addResult(
      'Collectible Spawned',
      collectibleCheck.found,
      collectibleCheck
    );

    if (collectibleCheck.found) {
      await this.takeScreenshot('collectible_spawned');
      console.log('✅ Collectible spawned successfully!');
    } else {
      console.log('❌ No collectible found');
      await this.takeScreenshot('no_collectible_found');
    }

    return collectibleCheck.found;
  }

  async collectCollectible() {
    console.log('🎁 Attempting to collect the collectible...');
    console.log(
      '🏃 Strategy: Double jump to get on top of mystery box where collectible spawned'
    );

    // Get collectible and mystery box positions
    const gameState = await this.page.evaluate(() => {
      const mysteryBoxes = window.game?.mysteryBoxes;
      const player = window.game?.player;

      if (!mysteryBoxes || !player) return null;

      const boxWithCollectible = mysteryBoxes.find(
        (box) => box.collectible && !box.collectible.collected
      );

      return {
        playerPos: {
          x: player.body.position.x,
          y: player.body.position.y,
        },
        collectible: boxWithCollectible
          ? {
              x: boxWithCollectible.collectible.x,
              y: boxWithCollectible.collectible.y,
              collected: boxWithCollectible.collectible.collected,
            }
          : null,
        mysteryBox: boxWithCollectible
          ? {
              x: boxWithCollectible.x,
              y: boxWithCollectible.y,
            }
          : null,
      };
    });

    if (!gameState?.collectible) {
      console.log('❌ No collectible found to collect');
      this.addResult('Collectible Collected', false, {
        reason: 'No collectible found',
      });
      return false;
    }

    console.log(
      `🎯 Collectible at (${gameState.collectible.x}, ${gameState.collectible.y})`
    );
    console.log(
      `📍 Mystery box at (${gameState.mysteryBox.x}, ${gameState.mysteryBox.y})`
    );
    console.log(
      `📍 Player at (${gameState.playerPos.x.toFixed(1)}, ${gameState.playerPos.y.toFixed(1)})`
    );

    // Position player under the collectible for precise collection
    const collectibleX = gameState.collectible.x;
    const horizontalDistance = Math.abs(gameState.playerPos.x - collectibleX);

    console.log(
      `🎯 Collectible at x=${collectibleX}, player at x=${gameState.playerPos.x.toFixed(1)}, distance=${horizontalDistance.toFixed(1)}`
    );

    if (horizontalDistance > 10) {
      console.log(`🏃 Positioning directly under collectible...`);
      await this.smartPositioning(
        collectibleX,
        'Collectible Collection Position'
      );
    } else {
      console.log(`✅ Player already positioned under collectible!`);
    }

    // Double jump to get on top of mystery box
    console.log('🤸 Double jumping to reach collectible...');

    // First jump
    await this.page.keyboard.down('ArrowUp');
    await this.page.waitForTimeout(100);
    await this.page.keyboard.up('ArrowUp');
    await this.page.waitForTimeout(200); // Wait to reach peak of first jump

    // Second jump (double jump)
    await this.page.keyboard.down('ArrowUp');
    await this.page.waitForTimeout(100);
    await this.page.keyboard.up('ArrowUp');
    await this.page.waitForTimeout(300); // Wait for double jump arc

    // Check if collectible was collected during double jump
    let collectionCheck = await this.page.evaluate(() => {
      const mysteryBoxes = window.game?.mysteryBoxes;
      if (!mysteryBoxes) return { collected: false, playerPos: null };

      const boxWithCollectible = mysteryBoxes.find(
        (box) => box.collectible && box.collectible.collected
      );

      const player = window.game?.player;

      return {
        collected: !!boxWithCollectible,
        playerPos: player
          ? {
              x: player.body.position.x,
              y: player.body.position.y,
            }
          : null,
      };
    });

    if (collectionCheck.collected) {
      console.log('✅ Collectible collected during double jump!');
      await this.takeScreenshot('collectible_collected');
      this.addResult('Collectible Collected', true, collectionCheck);
      return true;
    }

    console.log(
      `🔄 First double jump attempt failed. Player at (${collectionCheck.playerPos?.x.toFixed(1)}, ${collectionCheck.playerPos?.y.toFixed(1)})`
    );

    // Try moving around on top of mystery box to collect
    console.log('🔄 Trying to move around to collect collectible...');

    const collectAttempts = [
      'ArrowLeft',
      'ArrowRight',
      'ArrowLeft',
      'ArrowRight',
    ];

    for (let i = 0; i < collectAttempts.length; i++) {
      const movement = collectAttempts[i];
      console.log(`🔄 Collection attempt ${i + 1}: ${movement}`);

      await this.page.keyboard.down(movement);
      await this.page.waitForTimeout(100);
      await this.page.keyboard.up(movement);
      await this.page.waitForTimeout(200);

      // Check if collected
      collectionCheck = await this.page.evaluate(() => {
        const mysteryBoxes = window.game?.mysteryBoxes;
        if (!mysteryBoxes) return { collected: false };

        const boxWithCollectible = mysteryBoxes.find(
          (box) => box.collectible && box.collectible.collected
        );

        return { collected: !!boxWithCollectible };
      });

      if (collectionCheck.collected) {
        console.log(`✅ Collectible collected on attempt ${i + 1}!`);
        await this.takeScreenshot('collectible_collected');
        this.addResult('Collectible Collected', true, collectionCheck);
        return true;
      }
    }

    // Final attempt: Another double jump in case collectible moved
    console.log('🔄 Final attempt: Another double jump...');

    await this.page.keyboard.down('ArrowUp');
    await this.page.waitForTimeout(100);
    await this.page.keyboard.up('ArrowUp');
    await this.page.waitForTimeout(200);

    await this.page.keyboard.down('ArrowUp');
    await this.page.waitForTimeout(100);
    await this.page.keyboard.up('ArrowUp');
    await this.page.waitForTimeout(400);

    // Final check
    collectionCheck = await this.page.evaluate(() => {
      const mysteryBoxes = window.game?.mysteryBoxes;
      if (!mysteryBoxes) return { collected: false };

      const boxWithCollectible = mysteryBoxes.find(
        (box) => box.collectible && box.collectible.collected
      );

      return { collected: !!boxWithCollectible };
    });

    if (collectionCheck.collected) {
      console.log('✅ Collectible collected on final attempt!');
      await this.takeScreenshot('collectible_collected');
      this.addResult('Collectible Collected', true, collectionCheck);
      return true;
    }

    console.log('❌ Failed to collect collectible after all attempts');
    await this.takeScreenshot('collectible_not_collected');
    this.addResult('Collectible Collected', false, {
      collected: false,
      attempts: 'double_jump_and_movement',
      finalPlayerPos: collectionCheck.playerPos,
    });
    return false;
  }

  async verifyMysteryBoxCompletion() {
    console.log('🏁 Verifying mystery box completion...');

    const completionCheck = await this.page.evaluate(() => {
      const mysteryBoxes = window.game?.mysteryBoxes;
      if (!mysteryBoxes) return { completed: false };

      const completedBox = mysteryBoxes.find(
        (box) => box.state === 'completed'
      );

      return {
        completed: !!completedBox,
        completedBox: completedBox
          ? {
              title: completedBox.projectData?.title,
              state: completedBox.state,
              color: completedBox.currentColor,
            }
          : null,
      };
    });

    console.log('🎯 Mystery box completion check:', completionCheck);
    this.addResult(
      'Mystery Box Completed',
      completionCheck.completed,
      completionCheck
    );

    if (completionCheck.completed) {
      console.log('✅ Mystery box completed successfully!');
      await this.takeScreenshot('mystery_box_completed');
    } else {
      console.log('❌ Mystery box not completed');
      await this.takeScreenshot('mystery_box_not_completed');
    }

    return completionCheck.completed;
  }

  async smartPositioning(targetX, description) {
    console.log(`🎯 Smart positioning to ${description} at x=${targetX}`);

    // More lenient tolerance - player head (32px) + mystery box (40px) gives good collision range
    const tolerance = 20; // More forgiving tolerance to reduce oscillation
    const maxAttempts = 15; // Fewer attempts since we have better control

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      // Get current position
      const currentX = await this.page.evaluate(() => {
        return window.game?.player ? window.game.player.body.position.x : null;
      });

      if (!currentX) {
        console.log('❌ Unable to get player position');
        return;
      }

      const distance = Math.abs(currentX - targetX);

      // Check if we're close enough
      if (distance <= tolerance) {
        console.log(
          `✅ Perfect position achieved: ${currentX.toFixed(1)} (target: ${targetX}, distance: ${distance.toFixed(1)})`
        );
        return;
      }

      // Determine movement direction and duration based on distance
      const direction = currentX < targetX ? 'right' : 'left';
      const key = direction === 'right' ? 'ArrowRight' : 'ArrowLeft';

      console.log(
        `🏃 Attempt ${attempt}: Moving ${direction} to reach target (current: ${currentX.toFixed(1)}, target: ${targetX}, distance: ${distance.toFixed(1)})`
      );

      // Use different strategies based on distance
      if (distance > 120) {
        // Very large distance: use holding method for initial approach
        console.log(
          `📏 Very large distance (${distance.toFixed(1)}): Using hold method`
        );
        await this.moveWithHolding(key, targetX, 30); // Stop when within 30 pixels
      } else {
        // Medium to small distance: use single presses for precision
        console.log(
          `⚡ Medium/small distance (${distance.toFixed(1)}): Using single presses`
        );
        await this.moveWithPresses(key, targetX, tolerance, distance);
      }

      await this.page.keyboard.up(key);

      // Get final position to see if we need momentum stopping
      const finalPosition = await this.page.evaluate(() => {
        return window.game?.player ? window.game.player.body.position.x : null;
      });

      const finalDistance = Math.abs(finalPosition - targetX);

      // Only use momentum stopping if we're not close enough
      if (finalDistance > tolerance) {
        // Stop momentum by quickly pressing opposite direction
        const oppositeKey = key === 'ArrowRight' ? 'ArrowLeft' : 'ArrowRight';
        await this.page.keyboard.press(oppositeKey);
      }

      // Much shorter settle time
      await this.page.waitForTimeout(100);
    }

    // Final position check
    const finalX = await this.page.evaluate(() => {
      return window.game?.player ? window.game.player.body.position.x : null;
    });

    const finalDistance = Math.abs(finalX - targetX);

    if (finalDistance <= tolerance) {
      console.log(
        `✅ Final position achieved: ${finalX.toFixed(1)} (distance: ${finalDistance.toFixed(1)})`
      );
    } else {
      console.log(
        `⚠️  Close enough: ${finalX.toFixed(1)} (distance: ${finalDistance.toFixed(1)}) after ${maxAttempts} attempts`
      );
    }
  }

  async moveWithHolding(key, targetX, tolerance) {
    // Start movement
    await this.page.keyboard.down(key);

    // Keep moving until we reach the target or get close enough
    const checkInterval = 15; // Check position every 15ms for responsive control
    const maxMovementTime = 1500; // Safety timeout
    let elapsed = 0;
    let lastPosition = null;
    let stuckCount = 0;

    while (elapsed < maxMovementTime) {
      await this.page.waitForTimeout(checkInterval);
      elapsed += checkInterval;

      // Get current position
      const currentPos = await this.page.evaluate(() => {
        return window.game?.player ? window.game.player.body.position.x : null;
      });

      if (!currentPos) break;

      // Check if we've reached the target (within tolerance)
      const currentDistance = Math.abs(currentPos - targetX);
      if (currentDistance <= tolerance) {
        console.log(
          `🎯 Target reached: ${currentPos.toFixed(1)} (distance: ${currentDistance.toFixed(1)})`
        );
        break;
      }

      // Check if we're moving in the wrong direction (overshot)
      const direction = key === 'ArrowRight' ? 'right' : 'left';
      const wasMovingRight = direction === 'right';
      const nowPastTarget = wasMovingRight
        ? currentPos > targetX
        : currentPos < targetX;
      if (nowPastTarget) {
        console.log(
          `🎯 Target passed: ${currentPos.toFixed(1)} (overshot by ${Math.abs(currentPos - targetX).toFixed(1)})`
        );
        break;
      }

      // Check if player is stuck (not moving)
      if (lastPosition !== null && Math.abs(currentPos - lastPosition) < 0.5) {
        stuckCount++;
        if (stuckCount > 5) {
          console.log(`⚠️ Player seems stuck at ${currentPos.toFixed(1)}`);
          break;
        }
      } else {
        stuckCount = 0;
      }
      lastPosition = currentPos;
    }

    await this.page.keyboard.up(key);
  }

  async moveWithShortHold(key, targetX, tolerance, distance) {
    const direction = key === 'ArrowRight' ? 'right' : 'left';

    // Calculate hold duration based on observed movement (~95px per 27ms = ~3.5px/ms)
    // Target: move approximately the distance requested
    let holdDuration;
    if (distance > 60) {
      holdDuration = Math.ceil(distance / 4.0); // ~4px per ms for large distances
    } else if (distance > 30) {
      holdDuration = Math.ceil(distance / 3.8); // ~3.8px per ms for medium distances
    } else if (distance > 15) {
      holdDuration = Math.ceil(distance / 3.5); // ~3.5px per ms for small distances
    } else {
      holdDuration = Math.max(4, Math.ceil(distance / 3.0)); // Minimum 4ms, ~3px per ms for tiny adjustments
    }

    console.log(
      `🎯 Short hold: ${holdDuration}ms to move ${direction} ${distance.toFixed(1)} pixels`
    );

    // Add player state debugging
    const preMove = await this.page.evaluate(() => {
      const player = window.game?.player;
      return player
        ? {
            position: { x: player.body.position.x, y: player.body.position.y },
            velocity: { x: player.body.velocity.x, y: player.body.velocity.y },
            onGround: player.body.position.y > 590, // Rough ground check
          }
        : null;
    });

    console.log(
      `   Pre-move: pos(${preMove.position.x.toFixed(1)}, ${preMove.position.y.toFixed(1)}) vel(${preMove.velocity.x.toFixed(2)}, ${preMove.velocity.y.toFixed(2)}) onGround=${preMove.onGround}`
    );

    // Perform the short hold
    await this.page.keyboard.down(key);
    await this.page.waitForTimeout(holdDuration);
    await this.page.keyboard.up(key);

    // Wait a bit for movement to take effect
    await this.page.waitForTimeout(120);

    // Check post-movement state
    const postMove = await this.page.evaluate(() => {
      const player = window.game?.player;
      return player
        ? {
            position: { x: player.body.position.x, y: player.body.position.y },
            velocity: { x: player.body.velocity.x, y: player.body.velocity.y },
          }
        : null;
    });

    const actualMovement = Math.abs(postMove.position.x - preMove.position.x);
    console.log(
      `   Post-move: pos(${postMove.position.x.toFixed(1)}, ${postMove.position.y.toFixed(1)}) vel(${postMove.velocity.x.toFixed(2)}, ${postMove.velocity.y.toFixed(2)}) moved=${actualMovement.toFixed(1)}px`
    );
  }

  async moveWithPresses(key, targetX, tolerance, distance) {
    const direction = key === 'ArrowRight' ? 'right' : 'left';

    // Based on observation: 10ms moves ~90px, so 4ms should move ~36px
    const pixelsPerPress = 36; // 4ms hold estimate

    // Calculate number of presses needed
    let pressCount = Math.ceil(distance / pixelsPerPress);
    pressCount = Math.min(pressCount, 3); // Cap at 3 presses to prevent overshooting

    console.log(
      `⚡ Using ${pressCount} single presses to move ${direction} (target: ${distance.toFixed(1)}px, expect: ~${(pressCount * pixelsPerPress).toFixed(1)}px)`
    );

    for (let press = 1; press <= pressCount; press++) {
      console.log(`   Press ${press}: Single ${direction} press`);

      // Get position before press
      const beforePress = await this.page.evaluate(() => {
        return window.game?.player ? window.game.player.body.position.x : null;
      });

      // Single ultra-precise key press using down/up for better control
      await this.page.keyboard.down(key);
      await this.page.waitForTimeout(4); // Ultra-precise 4ms hold (~30px movement)
      await this.page.keyboard.up(key);

      // Wait for movement to settle
      await this.page.waitForTimeout(150);

      // Check position after press
      const afterPress = await this.page.evaluate(() => {
        return window.game?.player ? window.game.player.body.position.x : null;
      });

      if (!afterPress || !beforePress) break;

      const actualMovement = Math.abs(afterPress - beforePress);
      const distanceToTarget = Math.abs(afterPress - targetX);

      console.log(
        `   Press ${press} result: ${beforePress.toFixed(1)} -> ${afterPress.toFixed(1)} (moved ${actualMovement.toFixed(1)}px, ${distanceToTarget.toFixed(1)}px from target)`
      );

      // Check if we've reached the target
      if (distanceToTarget <= tolerance) {
        console.log(`🎯 Target reached with ${press} presses!`);
        return;
      }

      // Check if we overshot - if so, stop
      const wasMovingRight = direction === 'right';
      const nowPastTarget = wasMovingRight
        ? afterPress > targetX
        : afterPress < targetX;
      if (nowPastTarget) {
        console.log(
          `⚠️ Overshot target on press ${press} by ${Math.abs(afterPress - targetX).toFixed(1)}px`
        );
        return;
      }

      // If this is not the last press, check if remaining distance is too small for another full press
      if (press < pressCount) {
        const remainingDistance = Math.abs(afterPress - targetX);
        if (remainingDistance < pixelsPerPress * 0.7) {
          console.log(
            `⚡ Stopping early: remaining distance ${remainingDistance.toFixed(1)}px too small for another press`
          );
          return;
        }
      }
    }
  }

  async moveWithTaps(key, targetX, tolerance, distance) {
    const direction = key === 'ArrowRight' ? 'right' : 'left';

    // Calculate number of taps based on distance - extremely conservative
    // Each tap seems to move ~80-100 pixels based on testing
    let tapCount;
    if (distance > 150) {
      tapCount = Math.ceil(distance / 100); // Large movements - ~100 pixels per tap
    } else if (distance > 80) {
      tapCount = Math.ceil(distance / 80); // Medium movements - ~80 pixels per tap
    } else if (distance > 40) {
      tapCount = Math.ceil(distance / 60); // Small movements - ~60 pixels per tap
    } else if (distance > 20) {
      tapCount = Math.ceil(distance / 40); // Tiny movements - ~40 pixels per tap
    } else {
      tapCount = 1; // For very small distances, just try one tap
    }
    tapCount = Math.min(tapCount, 5); // Very low cap - max 5 taps

    console.log(
      `⚡ Using ${tapCount} discrete taps to move ${direction} (${distance.toFixed(1)} pixels)`
    );

    for (let tap = 1; tap <= tapCount; tap++) {
      // Ultra-precise single instantaneous key press
      await this.page.keyboard.press(key); // Instantaneous press/release
      await this.page.waitForTimeout(100); // Wait for physics to settle

      // Check position after every few taps
      if (tap % 3 === 0 || tap === tapCount) {
        const currentPos = await this.page.evaluate(() => {
          return window.game?.player
            ? window.game.player.body.position.x
            : null;
        });

        if (!currentPos) break;

        const currentDistance = Math.abs(currentPos - targetX);
        console.log(
          `   Tap ${tap}: Position ${currentPos.toFixed(1)} (distance: ${currentDistance.toFixed(1)})`
        );

        // Check if we've reached the target
        if (currentDistance <= tolerance) {
          console.log(
            `🎯 Target reached with discrete taps: ${currentPos.toFixed(1)}`
          );
          return;
        }

        // Check if we overshot
        const wasMovingRight = direction === 'right';
        const nowPastTarget = wasMovingRight
          ? currentPos > targetX
          : currentPos < targetX;
        if (nowPastTarget) {
          console.log(
            `🎯 Target passed with taps: ${currentPos.toFixed(1)} (overshot by ${Math.abs(currentPos - targetX).toFixed(1)})`
          );
          return;
        }
      }
    }
  }

  async takeScreenshot(name) {
    const filename = `${name}-${Date.now()}.png`;
    const filepath = path.join(this.outputDir, filename);

    await this.page.screenshot({
      path: filepath,
      fullPage: false, // Just viewport for faster screenshots
    });

    console.log(`📸 Screenshot saved: ${filename}`);
    return { filename, filepath };
  }

  addResult(testName, success, details) {
    // Sanitize details to prevent circular references
    const sanitizedDetails = this.sanitizeForJSON(details);

    this.testResults.push({
      testName,
      success,
      details: sanitizedDetails,
      timestamp: Date.now(),
    });
  }

  sanitizeForJSON(obj, depth = 0, maxDepth = 5) {
    // Prevent infinite recursion
    if (depth > maxDepth) {
      return '[Max Depth Reached]';
    }

    if (obj === null || obj === undefined) return obj;
    if (typeof obj !== 'object') return obj;

    // Handle arrays
    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeForJSON(item, depth + 1, maxDepth));
    }

    // Handle objects - create clean copy without circular references
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== null && typeof value === 'object') {
        // Skip potentially problematic references
        if (
          key.includes('body') ||
          key.includes('element') ||
          key.includes('gameObject') ||
          key.includes('physics') ||
          key.includes('Matter') ||
          key.includes('hitBox')
        ) {
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
    console.log('\n📊 Generating Mystery Box Test Report...');

    const report = {
      testType: 'Mystery Box Interaction Test',
      timestamp: new Date().toISOString(),
      totalTests: this.testResults.length,
      passedTests: this.testResults.filter((r) => r.success).length,
      failedTests: this.testResults.filter((r) => r.success === false).length,
      results: this.testResults,
    };

    // Save report
    const reportPath = path.join(
      this.outputDir,
      `mystery-box-report-${Date.now()}.json`
    );
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    // Print summary
    console.log('\n🎮 MYSTERY BOX TEST SUMMARY');
    console.log('================================');
    console.log(`📊 Total Tests: ${report.totalTests}`);
    console.log(`✅ Passed: ${report.passedTests}`);
    console.log(`❌ Failed: ${report.failedTests}`);
    console.log(
      `📈 Success Rate: ${((report.passedTests / report.totalTests) * 100).toFixed(1)}%`
    );

    console.log('\n📋 Individual Test Results:');
    this.testResults.forEach((result) => {
      const icon = result.success ? '✅' : '❌';
      console.log(`   ${icon} ${result.testName}`);
    });

    const overallSuccess = report.passedTests === report.totalTests;
    const rating = overallSuccess
      ? 'EXCELLENT 🌟'
      : report.passedTests / report.totalTests > 0.7
        ? 'GOOD 👍'
        : 'NEEDS WORK 🔧';

    console.log(`\n🎯 Overall Mystery Box Test Result: ${rating}`);
    console.log(`📄 Detailed report saved: ${reportPath}`);
    console.log('================================\n');

    return report;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      console.log('🛑 Browser closed');
    }
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new MysteryBoxTester();
  tester.startTest().catch((error) => {
    console.error('Mystery box test error:', error);
    process.exit(1);
  });
}

export default MysteryBoxTester;
