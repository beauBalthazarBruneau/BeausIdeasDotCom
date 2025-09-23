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
    console.log('🎯 This will test the tutorial mystery box interaction specifically');

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
      slowMo: 200 // Slow down actions to see what's happening
    });
    
    const context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    
    this.page = await context.newPage();
    
    // Listen to console messages
    this.page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      if (text.includes('mystery') || text.includes('Mystery') || text.includes('collectible')) {
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
      timeout: 10000 
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
        playerPosition: window.game?.player ? {
          x: window.game.player.body.position.x,
          y: window.game.player.body.position.y
        } : null,
        mysteryBoxCount: window.game?.mysteryBoxes ? window.game.mysteryBoxes.length : 0
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
          hasBeenHit: box.hasBeenHit
        }))
      };
    });
    
    console.log('📦 Mystery box analysis:', mysteryBoxAnalysis);
    this.addResult('Mystery Box Analysis', mysteryBoxAnalysis.found, mysteryBoxAnalysis);
    
    await this.takeScreenshot('mystery_box_analysis');
    
    return mysteryBoxAnalysis;
  }

  async testTutorialMysteryBox() {
    console.log('🎯 Testing tutorial mystery box interaction...');
    
    // Get initial player and mystery box positions
    const initialState = await this.page.evaluate(() => {
      const player = window.game?.player;
      const mysteryBoxes = window.game?.mysteryBoxes;
      const tutorialBox = mysteryBoxes?.find(box => 
        box.projectData?.title?.includes('Welcome') || box.x < 300
      );
      
      return {
        playerPos: player ? {
          x: player.body.position.x,
          y: player.body.position.y
        } : null,
        tutorialBox: tutorialBox ? {
          x: tutorialBox.x,
          y: tutorialBox.y,
          state: tutorialBox.state,
          title: tutorialBox.projectData?.title
        } : null
      };
    });
    
    console.log('📍 Initial positions:', initialState);
    
    if (!initialState.tutorialBox) {
      console.log('⚠️  No tutorial mystery box found, testing first available box');
    }
    
    // Navigate to mystery box
    await this.navigateToMysteryBox(initialState.tutorialBox || { x: 250, y: 450 });
    
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
    console.log(`🏃 Navigating to mystery box at (${mysteryBox.x}, ${mysteryBox.y})...`);
    
    // Move player directly under the mystery box for optimal hitting position  
    const targetX = mysteryBox.x + 20; // Center of mystery box (box is 40px wide, so center is +20)
    console.log(`🎯 Mystery box center calculated at x=${targetX} (box.x=${mysteryBox.x} + 20)`);
    
    // Get current player position
    const currentPos = await this.page.evaluate(() => {
      return window.game?.player ? {
        x: window.game.player.body.position.x,
        y: window.game.player.body.position.y
      } : null;
    });
    
    console.log(`📍 Player at (${currentPos.x}, ${currentPos.y}), moving to (${targetX}, ${mysteryBox.y})`);
    
    // Move towards the mystery box using key holding with better precision
    const distance = Math.abs(currentPos.x - targetX);
    
    if (distance > 10) { // Only move if we're not already close
      if (currentPos.x < targetX) {
        // Move right by holding the key
        console.log('➡️  Moving right towards mystery box (holding key)...');
        await this.page.keyboard.down('ArrowRight');
        
        // Hold the key until we get close, but stop much earlier to account for momentum
        let attempts = 0;
        while (attempts < 50) { // Safety limit
          await this.page.waitForTimeout(30); // Even shorter intervals for better control
          
          const pos = await this.page.evaluate(() => {
            return window.game?.player ? window.game.player.body.position.x : null;
          });
          
          if (pos && pos >= targetX - 30) { // Stop much earlier to account for momentum
            break;
          }
          attempts++;
        }
        
        await this.page.keyboard.up('ArrowRight');
        
        // Wait longer for momentum to settle
        await this.page.waitForTimeout(800);
        
      } else {
        // Move left by holding the key
        console.log('⬅️  Moving left towards mystery box (holding key)...');
        await this.page.keyboard.down('ArrowLeft');
        
        // Hold the key until we get close, but stop much earlier to account for momentum
        let attempts = 0;
        while (attempts < 50) { // Safety limit
          await this.page.waitForTimeout(30); // Even shorter intervals for better control
          
          const pos = await this.page.evaluate(() => {
            return window.game?.player ? window.game.player.body.position.x : null;
          });
          
          if (pos && pos <= targetX + 30) { // Stop much earlier to account for momentum
            break;
          }
          attempts++;
        }
        
        await this.page.keyboard.up('ArrowLeft');
        
        // Wait longer for momentum to settle
        await this.page.waitForTimeout(800);
      }
      
      // Fine-tune position with small adjustments
      const finalCheck = await this.page.evaluate(() => {
        return window.game?.player ? window.game.player.body.position.x : null;
      });
      
      if (finalCheck && Math.abs(finalCheck - targetX) > 3) {
        console.log('🎯 Fine-tuning position with small movements...');
        
        for (let i = 0; i < 10; i++) { // More adjustment attempts
          const currentX = await this.page.evaluate(() => {
            return window.game?.player ? window.game.player.body.position.x : null;
          });
          
          if (!currentX || Math.abs(currentX - targetX) <= 3) {
            console.log(`✅ Perfect position achieved: ${currentX.toFixed(1)} (target: ${targetX})`);
            break;
          }
          
          const distance = Math.abs(currentX - targetX);
          console.log(`🔄 Adjustment ${i+1}: Current=${currentX.toFixed(1)}, Target=${targetX}, Distance=${distance.toFixed(1)}`);
          
          if (currentX < targetX - 3) {
            // Need to move right, use short key press
            await this.page.keyboard.down('ArrowRight');
            await this.page.waitForTimeout(distance > 20 ? 150 : 50); // Longer press for larger distances
            await this.page.keyboard.up('ArrowRight');
          } else if (currentX > targetX + 3) {
            // Need to move left, use short key press
            await this.page.keyboard.down('ArrowLeft');
            await this.page.waitForTimeout(distance > 20 ? 150 : 50); // Longer press for larger distances
            await this.page.keyboard.up('ArrowLeft');
          }
          
          await this.page.waitForTimeout(400); // Wait for movement to settle
        }
      }
    }
    
    await this.takeScreenshot('positioned_near_mystery_box');
    
    const finalPos = await this.page.evaluate(() => {
      return window.game?.player ? {
        x: window.game.player.body.position.x,
        y: window.game.player.body.position.y
      } : null;
    });
    
    console.log(`📍 Player positioned at (${finalPos.x}, ${finalPos.y})`);
  }

  async hitMysteryBoxFromBelow() {
    console.log('⬆️  Attempting to hit mystery box from below...');
    
    // Get precise positions before attempting hit
    const beforeHit = await this.page.evaluate(() => {
      const player = window.game?.player;
      const mysteryBoxes = window.game?.mysteryBoxes;
      const targetBox = mysteryBoxes?.find(box => !box.hasBeenHit);
      
      return {
        playerPos: player ? {
          x: player.body.position.x,
          y: player.body.position.y
        } : null,
        boxPos: targetBox ? {
          x: targetBox.x,
          y: targetBox.y
        } : null
      };
    });
    
    console.log('📍 Positions before hit:', beforeHit);
    
    // Fine-tune position to be directly under the mystery box
    if (beforeHit.boxPos) {
      const boxCenterX = beforeHit.boxPos.x + 20; // Center of box
      const playerX = beforeHit.playerPos.x;
      const boxY = beforeHit.boxPos.y;
      const playerY = beforeHit.playerPos.y;
      
      console.log(`📍 Box center: (${boxCenterX}, ${boxY}), Player: (${playerX}, ${playerY})`);
      console.log(`📏 Distance: horizontal=${Math.abs(playerX - boxCenterX).toFixed(1)}, vertical=${Math.abs(playerY - boxY).toFixed(1)}`);
      
      // Position player more precisely under the mystery box
      const horizontalDistance = Math.abs(playerX - boxCenterX);
      if (horizontalDistance > 2) {
        console.log(`🏃 Fine-tuning horizontal position... Distance: ${horizontalDistance.toFixed(1)} pixels`);
        
        // Multiple fine-tuning attempts for perfect positioning
        for (let attempt = 0; attempt < 8; attempt++) {
          const currentPos = await this.page.evaluate(() => {
            const player = window.game?.player;
            return player ? player.body.position.x : null;
          });
          
          const currentDistance = Math.abs(currentPos - boxCenterX);
          
          if (currentDistance <= 2) {
            console.log(`✅ Perfect horizontal position: ${currentPos.toFixed(1)} (target: ${boxCenterX})`);
            break;
          }
          
          console.log(`🔄 Fine-tune attempt ${attempt + 1}: Current=${currentPos.toFixed(1)}, Target=${boxCenterX}, Distance=${currentDistance.toFixed(1)}`);
          
          if (currentPos < boxCenterX - 2) {
            // Move right with controlled movement
            await this.page.keyboard.down('ArrowRight');
            await this.page.waitForTimeout(currentDistance > 15 ? 100 : 40);
            await this.page.keyboard.up('ArrowRight');
          } else if (currentPos > boxCenterX + 2) {
            // Move left with controlled movement
            await this.page.keyboard.down('ArrowLeft');
            await this.page.waitForTimeout(currentDistance > 15 ? 100 : 40);
            await this.page.keyboard.up('ArrowLeft');
          }
          
          await this.page.waitForTimeout(250); // Let physics settle
        }
        
        // Final position check
        const finalPos = await this.page.evaluate(() => {
          const player = window.game?.player;
          return player ? player.body.position.x : null;
        });
        
        console.log(`🎯 Final jump position: ${finalPos.toFixed(1)} (target: ${boxCenterX}, distance: ${Math.abs(finalPos - boxCenterX).toFixed(1)})`);
      }
    }
    
    // Multiple jump attempts with different timings and positioning
    for (let attempt = 1; attempt <= 5; attempt++) {
      console.log(`🤘 Jump attempt ${attempt}: Jumping UP to hit mystery box from below...`);
      
      // Get current position before jump
      const preJumpPos = await this.page.evaluate(() => {
        const player = window.game?.player;
        return player ? {
          x: player.body.position.x.toFixed(1),
          y: player.body.position.y.toFixed(1),
          velocity: {
            x: player.body.velocity.x.toFixed(2),
            y: player.body.velocity.y.toFixed(2)
          }
        } : null;
      });
      
      console.log(`🚀 Pre-jump: pos(${preJumpPos.x}, ${preJumpPos.y}) vel(${preJumpPos.velocity.x}, ${preJumpPos.velocity.y})`);
      
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
        const hitBox = mysteryBoxes?.find(box => box.hasBeenHit);
        
        return {
          playerPos: player ? {
            x: player.body.position.x.toFixed(1),
            y: player.body.position.y.toFixed(1),
            velocity: {
              x: player.body.velocity.x.toFixed(2),
              y: player.body.velocity.y.toFixed(2)
            }
          } : null,
          hit: !!hitBox,
          hitBox
        };
      });
      
      console.log(`⬆️  Mid-jump: pos(${midJumpCheck.playerPos.x}, ${midJumpCheck.playerPos.y}) vel(${midJumpCheck.playerPos.velocity.x}, ${midJumpCheck.playerPos.velocity.y})`);
      
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
        const hitBox = mysteryBoxes?.find(box => box.hasBeenHit);
        
        return {
          playerPos: player ? {
            x: player.body.position.x.toFixed(1),
            y: player.body.position.y.toFixed(1)
          } : null,
          hit: !!hitBox,
          hitBox: hitBox ? {
            title: hitBox.projectData?.title,
            state: hitBox.state,
            collectibleSpawned: hitBox.collectibleSpawned
          } : null
        };
      });
      
      console.log(`🎯 Post-jump: pos(${postJumpResult.playerPos.x}, ${postJumpResult.playerPos.y}) - Hit: ${postJumpResult.hit}`);
      
      if (postJumpResult.hit) {
        console.log('✅ Successfully hit mystery box!');
        await this.takeScreenshot('mystery_box_hit_success');
        this.addResult('Mystery Box Hit', true, postJumpResult);
        return;
      }
      
      // If not hit, try different positioning for next attempt
      if (attempt < 5) {
        console.log(`🔄 Attempt ${attempt} failed, adjusting position for next attempt...`);
        
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
      const boxWithCollectible = mysteryBoxes.find(box => 
        box.collectible && !box.collectible.collected
      );
      
      return {
        found: !!boxWithCollectible,
        collectible: boxWithCollectible ? {
          position: {
            x: boxWithCollectible.collectible.x,
            y: boxWithCollectible.collectible.y
          },
          collected: boxWithCollectible.collectible.collected
        } : null
      };
    });
    
    console.log('🎁 Collectible spawn check:', collectibleCheck);
    this.addResult('Collectible Spawned', collectibleCheck.found, collectibleCheck);
    
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
    
    // Move around to try to collect the collectible
    const movements = ['ArrowLeft', 'ArrowRight', 'Space', 'ArrowLeft', 'ArrowRight'];
    
    for (const movement of movements) {
      await this.page.keyboard.press(movement);
      await this.page.waitForTimeout(300);
      
      // Check if collected
      const collectionCheck = await this.page.evaluate(() => {
        const mysteryBoxes = window.game?.mysteryBoxes;
        if (!mysteryBoxes) return { collected: false };
        
        const boxWithCollectible = mysteryBoxes.find(box => 
          box.collectible && box.collectible.collected
        );
        
        return { collected: !!boxWithCollectible };
      });
      
      if (collectionCheck.collected) {
        console.log('✅ Collectible collected!');
        await this.takeScreenshot('collectible_collected');
        this.addResult('Collectible Collected', true, collectionCheck);
        return true;
      }
    }
    
    console.log('❌ Failed to collect collectible');
    await this.takeScreenshot('collectible_not_collected');
    this.addResult('Collectible Collected', false, { collected: false });
    return false;
  }

  async verifyMysteryBoxCompletion() {
    console.log('🏁 Verifying mystery box completion...');
    
    const completionCheck = await this.page.evaluate(() => {
      const mysteryBoxes = window.game?.mysteryBoxes;
      if (!mysteryBoxes) return { completed: false };
      
      const completedBox = mysteryBoxes.find(box => box.state === 'completed');
      
      return {
        completed: !!completedBox,
        completedBox: completedBox ? {
          title: completedBox.projectData?.title,
          state: completedBox.state,
          color: completedBox.currentColor
        } : null
      };
    });
    
    console.log('🎯 Mystery box completion check:', completionCheck);
    this.addResult('Mystery Box Completed', completionCheck.completed, completionCheck);
    
    if (completionCheck.completed) {
      console.log('✅ Mystery box completed successfully!');
      await this.takeScreenshot('mystery_box_completed');
    } else {
      console.log('❌ Mystery box not completed');
      await this.takeScreenshot('mystery_box_not_completed');
    }
    
    return completionCheck.completed;
  }

  async takeScreenshot(name) {
    const filename = `${name}-${Date.now()}.png`;
    const filepath = path.join(this.outputDir, filename);
    
    await this.page.screenshot({ 
      path: filepath,
      fullPage: false // Just viewport for faster screenshots
    });
    
    console.log(`📸 Screenshot saved: ${filename}`);
    return { filename, filepath };
  }

  addResult(testName, success, details) {
    this.testResults.push({
      testName,
      success,
      details,
      timestamp: Date.now()
    });
  }

  async generateReport() {
    console.log('\n📊 Generating Mystery Box Test Report...');
    
    const report = {
      testType: 'Mystery Box Interaction Test',
      timestamp: new Date().toISOString(),
      totalTests: this.testResults.length,
      passedTests: this.testResults.filter(r => r.success).length,
      failedTests: this.testResults.filter(r => r.success === false).length,
      results: this.testResults
    };
    
    // Save report
    const reportPath = path.join(this.outputDir, `mystery-box-report-${Date.now()}.json`);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    // Print summary
    console.log('\n🎮 MYSTERY BOX TEST SUMMARY');
    console.log('================================');
    console.log(`📊 Total Tests: ${report.totalTests}`);
    console.log(`✅ Passed: ${report.passedTests}`);
    console.log(`❌ Failed: ${report.failedTests}`);
    console.log(`📈 Success Rate: ${((report.passedTests / report.totalTests) * 100).toFixed(1)}%`);
    
    console.log('\n📋 Individual Test Results:');
    this.testResults.forEach(result => {
      const icon = result.success ? '✅' : '❌';
      console.log(`   ${icon} ${result.testName}`);
    });
    
    const overallSuccess = report.passedTests === report.totalTests;
    const rating = overallSuccess ? 'EXCELLENT 🌟' : 
                  report.passedTests / report.totalTests > 0.7 ? 'GOOD 👍' : 'NEEDS WORK 🔧';
    
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
  tester.startTest().catch(error => {
    console.error('Mystery box test error:', error);
    process.exit(1);
  });
}

export default MysteryBoxTester;