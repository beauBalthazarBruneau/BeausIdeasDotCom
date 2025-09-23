#!/usr/bin/env node

import PlaywrightRealIntegration from './playwright-real-integration.js';
import fs from 'fs/promises';
import path from 'path';

class AdvancedMarioAIPlayer {
  constructor() {
    this.playwright = new PlaywrightRealIntegration({
      baseUrl: 'http://localhost:5173', // Use standard Vite port
      headless: false, // Keep visible so we can watch the AI play
      outputDir: './ai-gameplay-results'
    });
    
    this.gameState = {
      playerPosition: { x: 0, y: 0 },
      discoveredMysteryBoxes: [],
      completedChallenges: [],
      levelProgress: 0,
      deaths: 0
    };
    
    this.strategy = {
      exploration: 0.3,  // 30% exploration vs exploitation
      riskTolerance: 0.5, // Moderate risk taking
      completionFocus: 0.8 // High focus on completing objectives
    };
  }

  async startAIGameplay() {
    console.log('🤖 Starting Advanced Mario AI Player...');
    console.log('🎮 The AI will analyze and play your Mario game intelligently!');
    
    try {
      await this.playwright.startBrowser();
      await this.initializeGame();
      await this.playGameIntelligently();
      await this.generateAIReport();
    } catch (error) {
      console.error('❌ AI gameplay failed:', error.message);
    } finally {
      await this.playwright.stopBrowser();
    }
  }

  async initializeGame() {
    console.log('🎯 Initializing game for AI analysis...');
    
    await this.playwright.executeAction({ type: 'navigate', url: '/?dev=true' });
    await this.playwright.executeAction({ type: 'wait', duration: 3000 });
    
    // Enable debug mode for better game state analysis
    await this.playwright.executeAction({ type: 'keyPress', key: 'F1' });
    await this.playwright.executeAction({ type: 'wait', duration: 500 });
    
    await this.takeAnalysisScreenshot('game_initialized');
    
    // Get initial game state
    this.gameState = await this.analyzeCurrentGameState();
    console.log('📊 Initial game state analyzed:', this.gameState);
  }

  async playGameIntelligently() {
    console.log('🧠 Beginning intelligent gameplay sequence...');
    
    const maxGameplayTime = 60000; // 60 seconds of AI gameplay
    const startTime = Date.now();
    let actionCount = 0;
    
    while (Date.now() - startTime < maxGameplayTime) {
      actionCount++;
      console.log(`\n🎬 AI Action ${actionCount}:`);
      
      // Analyze current situation
      const currentState = await this.analyzeCurrentGameState();
      
      // Decide on next action using AI strategy
      const nextAction = await this.decideNextAction(currentState);
      
      // Execute the action
      await this.executeIntelligentAction(nextAction);
      
      // Update our understanding of the game
      await this.updateGameKnowledge();
      
      // Take periodic screenshots for analysis
      if (actionCount % 10 === 0) {
        await this.takeAnalysisScreenshot(`ai_action_${actionCount}`);
      }
      
      // Brief pause between actions for more realistic gameplay
      await this.playwright.executeAction({ type: 'wait', duration: 200 });
    }
    
    console.log(`🏁 AI gameplay completed! Executed ${actionCount} intelligent actions.`);
  }

  async analyzeCurrentGameState() {
    const gameAnalysis = await this.playwright.page.evaluate(() => {
      console.log('AI: Analyzing game state...');
      console.log('AI: window.game exists?', !!window.game);
      
      // Check if game object exists at all
      if (!window.game) {
        console.log('AI: No window.game object found');
        return { 
          gameExists: false,
          reason: 'no_game_object',
          canvasExists: !!document.querySelector('#game-canvas'),
          maintenanceHidden: document.querySelector('#maintenance-overlay')?.classList.contains('hidden')
        };
      }
      
      console.log('AI: Game object found, checking player...');
      console.log('AI: window.game.player exists?', !!window.game.player);
      
      // Game exists, check player
      const player = window.game.player;
      const gameObj = window.game;
      
      if (!player) {
        console.log('AI: Game exists but no player object');
        return {
          gameExists: true,
          playerExists: false,
          reason: 'no_player_object',
          gameInfo: {
            debugMode: gameObj.debugMode || false,
            respawnCount: gameObj.respawnCount || 0,
            gameTime: gameObj.gameTime || 0
          }
        };
      }
      
      console.log('AI: Player found at position:', player.x, player.y);
      console.log('AI: Player alive status:', player.alive);
      
      return {
        gameExists: true,
        playerExists: true,
        playerPosition: {
          x: Math.round(player.x || 0),
          y: Math.round(player.y || 0)
        },
        playerState: {
          alive: player.alive !== false,
          onGround: player.onGround || false,
          velocity: {
            x: player.velocityX || 0,
            y: player.velocityY || 0
          }
        },
        gameInfo: {
          debugMode: gameObj.debugMode || false,
          respawnCount: gameObj.respawnCount || 0,
          gameTime: gameObj.gameTime || 0
        },
        mysteryBoxes: gameObj.mysteryBoxes ? gameObj.mysteryBoxes.map(box => ({
          x: Math.round(box.x),
          y: Math.round(box.y),
          activated: box.activated || false,
          content: box.content || 'unknown'
        })) : [],
        canvasSize: {
          width: document.querySelector('#game-canvas')?.width || 0,
          height: document.querySelector('#game-canvas')?.height || 0
        }
      };
    });
    
    return gameAnalysis;
  }

  async decideNextAction(currentState) {
    // AI Decision Making Algorithm
    
    // Priority 0: If no game or no player, wait and try again
    if (!currentState.gameExists) {
      return { type: 'wait', reason: 'waiting_for_game_load', duration: 1000 };
    }
    
    if (!currentState.playerExists) {
      return { type: 'wait', reason: 'waiting_for_player_spawn', duration: 1000 };
    }
    
    // Priority 1: If player is dead, wait for respawn
    if (!currentState.playerState?.alive) {
      return { type: 'wait', reason: 'waiting_for_respawn', duration: 1000 };
    }
    
    // Priority 2: Explore for mystery boxes
    const nearbyMysteryBox = this.findNearestMysteryBox(currentState);
    if (nearbyMysteryBox && !nearbyMysteryBox.activated) {
      return this.planMovementToTarget(currentState, nearbyMysteryBox);
    }
    
    // Priority 3: General exploration
    const explorationMove = this.calculateExplorationMove(currentState);
    if (explorationMove) {
      return explorationMove;
    }
    
    // Priority 4: Random movement if stuck
    const randomMoves = ['ArrowLeft', 'ArrowRight', 'Space'];
    const randomMove = randomMoves[Math.floor(Math.random() * randomMoves.length)];
    
    return { 
      type: 'keyPress', 
      key: randomMove, 
      reason: 'random_exploration' 
    };
  }

  findNearestMysteryBox(currentState) {
    if (!currentState.mysteryBoxes || currentState.mysteryBoxes.length === 0) {
      return null;
    }
    
    const playerPos = currentState.playerPosition;
    let nearest = null;
    let minDistance = Infinity;
    
    for (const box of currentState.mysteryBoxes) {
      if (box.activated) continue;
      
      const distance = Math.sqrt(
        Math.pow(box.x - playerPos.x, 2) + 
        Math.pow(box.y - playerPos.y, 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        nearest = box;
      }
    }
    
    return nearest;
  }

  planMovementToTarget(currentState, target) {
    const playerPos = currentState.playerPosition;
    const dx = target.x - playerPos.x;
    const dy = target.y - playerPos.y;
    
    // If we're close horizontally, try to get closer vertically
    if (Math.abs(dx) < 50) {
      if (dy < -20) {
        return { type: 'keyPress', key: 'Space', reason: 'jump_to_mystery_box' };
      }
      return { type: 'wait', reason: 'near_mystery_box', duration: 300 };
    }
    
    // Move toward the target horizontally
    if (dx > 20) {
      return { type: 'keyPress', key: 'ArrowRight', reason: 'move_to_mystery_box' };
    } else if (dx < -20) {
      return { type: 'keyPress', key: 'ArrowLeft', reason: 'move_to_mystery_box' };
    }
    
    return { type: 'wait', reason: 'positioning_for_mystery_box', duration: 200 };
  }

  calculateExplorationMove(currentState) {
    const playerPos = currentState.playerPosition;
    
    // Encourage movement to unexplored areas
    // Simple strategy: if we haven't moved much, try moving right
    if (Math.random() < this.strategy.exploration) {
      const explorationMoves = ['ArrowRight', 'ArrowLeft'];
      
      // Prefer moving right to explore new areas
      if (Math.random() < 0.7) {
        return { type: 'keyPress', key: 'ArrowRight', reason: 'explore_right' };
      } else {
        return { type: 'keyPress', key: 'ArrowLeft', reason: 'explore_left' };
      }
    }
    
    // Occasionally jump to overcome obstacles
    if (Math.random() < 0.2) {
      return { type: 'keyPress', key: 'Space', reason: 'exploratory_jump' };
    }
    
    return null;
  }

  async executeIntelligentAction(action) {
    console.log(`   🎯 AI Decision: ${action.reason} -> ${action.type}${action.key ? ` (${action.key})` : ''}`);
    
    try {
      if (action.type === 'keyPress') {
        await this.playwright.executeAction({ 
          type: 'keyPress', 
          key: action.key 
        });
      } else if (action.type === 'wait') {
        await this.playwright.executeAction({ 
          type: 'wait', 
          duration: action.duration 
        });
      }
      
      // Record the action for learning
      this.recordActionResult(action);
      
    } catch (error) {
      console.error(`   ❌ Failed to execute action: ${error.message}`);
    }
  }

  recordActionResult(action) {
    // This could be extended to build a learning database
    // For now, just track basic statistics
    if (!this.actionHistory) {
      this.actionHistory = [];
    }
    
    this.actionHistory.push({
      ...action,
      timestamp: Date.now(),
      gameState: this.gameState
    });
  }

  async updateGameKnowledge() {
    // Update our persistent knowledge about the game
    const newState = await this.analyzeCurrentGameState();
    
    if (newState.gameExists !== false) {
      // Track position changes
      const oldPos = this.gameState.playerPosition;
      const newPos = newState.playerPosition;
      
      if (oldPos && newPos) {
        const distance = Math.sqrt(
          Math.pow(newPos.x - oldPos.x, 2) + 
          Math.pow(newPos.y - oldPos.y, 2)
        );
        
        if (distance > 5) {
          console.log(`   📍 Player moved ${distance.toFixed(1)} units to (${newPos.x}, ${newPos.y})`);
        }
      }
      
      // Update mystery box knowledge
      if (newState.mysteryBoxes) {
        const activatedBoxes = newState.mysteryBoxes.filter(box => box.activated);
        const previouslyActivated = this.gameState.mysteryBoxes ? 
          this.gameState.mysteryBoxes.filter(box => box.activated).length : 0;
        
        if (activatedBoxes.length > previouslyActivated) {
          console.log(`   ✨ AI discovered a mystery box! Total found: ${activatedBoxes.length}`);
        }
      }
      
      this.gameState = newState;
    }
  }

  async takeAnalysisScreenshot(name) {
    const result = await this.playwright.executeAction({ 
      type: 'screenshot', 
      name: `ai_${name}` 
    });
    
    console.log(`📸 AI Analysis Screenshot: ${result.filename}`);
    return result;
  }

  async generateAIReport() {
    console.log('\n📊 Generating AI Gameplay Report...');
    
    const report = {
      aiSession: {
        timestamp: new Date().toISOString(),
        duration: Date.now() - this.startTime,
        strategy: this.strategy,
        finalGameState: this.gameState,
        actionHistory: this.actionHistory || []
      },
      discoveries: {
        mysteryBoxesFound: this.gameState.mysteryBoxes ? 
          this.gameState.mysteryBoxes.filter(box => box.activated).length : 0,
        totalMysteryBoxes: this.gameState.mysteryBoxes ? 
          this.gameState.mysteryBoxes.length : 0,
        deathCount: this.gameState.gameInfo?.respawnCount || 0
      },
      aiInsights: this.generateAIInsights(),
      recommendations: this.generateGameRecommendations()
    };
    
    // Save AI report
    const outputDir = './ai-gameplay-results';
    await fs.mkdir(outputDir, { recursive: true });
    
    const reportPath = path.join(outputDir, `ai-gameplay-${Date.now()}.json`);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    // Print summary
    this.printAISummary(report);
    
    console.log(`\n📄 AI Report saved: ${reportPath}`);
    return report;
  }

  generateAIInsights() {
    return {
      gameplayEffectiveness: this.calculateGameplayEffectiveness(),
      explorationCoverage: this.calculateExplorationCoverage(),
      mysteryBoxDiscoveryRate: this.calculateDiscoveryRate(),
      aiLearnings: this.extractAILearnings()
    };
  }

  calculateGameplayEffectiveness() {
    const actions = this.actionHistory || [];
    const meaningfulActions = actions.filter(action => 
      action.reason !== 'random_exploration' && action.reason !== 'waiting_for_respawn'
    ).length;
    
    const effectiveness = actions.length > 0 ? meaningfulActions / actions.length : 0;
    
    return {
      score: effectiveness,
      rating: effectiveness > 0.7 ? 'EXCELLENT' : 
              effectiveness > 0.5 ? 'GOOD' : 'NEEDS_IMPROVEMENT'
    };
  }

  calculateExplorationCoverage() {
    // Simple metric based on position diversity
    if (!this.actionHistory || this.actionHistory.length === 0) {
      return { coverage: 0, rating: 'NO_DATA' };
    }
    
    const positions = this.actionHistory
      .map(action => action.gameState?.playerPosition)
      .filter(pos => pos && pos.x !== undefined);
    
    if (positions.length === 0) {
      return { coverage: 0, rating: 'NO_POSITION_DATA' };
    }
    
    const uniquePositions = new Set(positions.map(pos => `${Math.floor(pos.x/50)},${Math.floor(pos.y/50)}`));
    const coverage = uniquePositions.size / Math.max(positions.length / 10, 1);
    
    return {
      coverage,
      uniqueAreas: uniquePositions.size,
      rating: coverage > 0.5 ? 'EXCELLENT_EXPLORER' : 
              coverage > 0.3 ? 'GOOD_EXPLORER' : 'LIMITED_EXPLORATION'
    };
  }

  calculateDiscoveryRate() {
    const mysteryBoxes = this.gameState.mysteryBoxes || [];
    const total = mysteryBoxes.length;
    const discovered = mysteryBoxes.filter(box => box.activated).length;
    
    return {
      total,
      discovered,
      rate: total > 0 ? discovered / total : 0,
      rating: total === 0 ? 'NO_MYSTERY_BOXES' :
              discovered === total ? 'MASTER_EXPLORER' :
              discovered > total * 0.7 ? 'EXCELLENT_EXPLORER' :
              discovered > 0 ? 'DECENT_EXPLORER' : 'MISSED_OPPORTUNITIES'
    };
  }

  extractAILearnings() {
    const learnings = [];
    
    // Analyze action patterns
    const actions = this.actionHistory || [];
    const jumpActions = actions.filter(a => a.key === 'Space').length;
    const movementActions = actions.filter(a => ['ArrowLeft', 'ArrowRight'].includes(a.key)).length;
    
    if (jumpActions > movementActions) {
      learnings.push("AI tends to jump frequently - may indicate obstacle navigation challenges");
    }
    
    if (this.gameState.gameInfo?.respawnCount > 0) {
      learnings.push(`AI died ${this.gameState.gameInfo.respawnCount} times - suggests difficulty areas in game`);
    }
    
    return learnings;
  }

  generateGameRecommendations() {
    const recommendations = [];
    
    // Analyze AI performance for game design insights
    const effectiveness = this.calculateGameplayEffectiveness();
    if (effectiveness.score < 0.5) {
      recommendations.push({
        priority: 'MEDIUM',
        type: 'GAME_DESIGN',
        message: 'AI struggled with navigation - consider adding more visual cues for players',
        category: 'User Experience'
      });
    }
    
    const discoveryRate = this.calculateDiscoveryRate();
    if (discoveryRate.rate < 0.5 && discoveryRate.total > 0) {
      recommendations.push({
        priority: 'LOW',
        type: 'GAME_DESIGN', 
        message: 'Mystery boxes may be hard to discover - consider better placement or hints',
        category: 'Game Balance'
      });
    }
    
    return recommendations;
  }

  printAISummary(report) {
    console.log('\n🤖 AI MARIO GAMEPLAY SUMMARY');
    console.log('=====================================');
    console.log(`🎮 AI Strategy: Exploration ${(this.strategy.exploration * 100).toFixed(0)}%, Risk ${(this.strategy.riskTolerance * 100).toFixed(0)}%`);
    console.log(`⏱️  Session Duration: ${(report.aiSession.duration / 1000).toFixed(1)}s`);
    console.log(`🎬 Total AI Actions: ${report.aiSession.actionHistory.length}`);
    console.log(`📍 Final Position: (${report.finalGameState.playerPosition?.x || 'unknown'}, ${report.finalGameState.playerPosition?.y || 'unknown'})`);
    
    console.log(`\n✨ DISCOVERIES:`);
    console.log(`   Mystery Boxes Found: ${report.discoveries.mysteryBoxesFound}/${report.discoveries.totalMysteryBoxes}`);
    console.log(`   Deaths: ${report.discoveries.deathCount}`);
    
    console.log(`\n🧠 AI PERFORMANCE:`);
    console.log(`   Effectiveness: ${report.aiInsights.gameplayEffectiveness.rating}`);
    console.log(`   Exploration: ${report.aiInsights.explorationCoverage.rating}`);
    console.log(`   Discovery Rate: ${report.aiInsights.mysteryBoxDiscoveryRate.rating}`);
    
    if (report.aiInsights.aiLearnings.length > 0) {
      console.log(`\n💡 AI LEARNINGS:`);
      report.aiInsights.aiLearnings.forEach((learning, index) => {
        console.log(`   ${index + 1}. ${learning}`);
      });
    }
    
    console.log('=====================================');
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const aiPlayer = new AdvancedMarioAIPlayer();
  aiPlayer.startAIGameplay().catch(error => {
    console.error('AI Player error:', error);
    process.exit(1);
  });
}

export default AdvancedMarioAIPlayer;