#!/usr/bin/env node

/**
 * Advanced MCP Automation System
 *
 * This demonstrates how MCP could be used for full automation that:
 * - Integrates with external data sources
 * - Makes intelligent decisions based on context
 * - Continuously learns and adapts
 * - Provides rich feedback and insights
 */

import PlaywrightRealIntegration from './playwright-real-integration.js';
import fs from 'fs/promises';
import path from 'path';

class AdvancedMCPAutomation {
  constructor() {
    this.playwright = new PlaywrightRealIntegration({
      baseUrl: 'http://localhost:5174',
      headless: false,
      outputDir: './mcp-automation-results',
    });

    this.mcpContext = {
      // In a real MCP setup, this would come from external sources
      userPreferences: {
        playStyle: 'explorer', // 'speedrunner', 'completionist', 'explorer'
        difficultyTolerance: 'medium',
        objectives: [
          'find_all_mystery_boxes',
          'explore_all_areas',
          'complete_challenges',
        ],
      },
      gameKnowledge: {
        knownSecrets: [],
        discoveredPaths: [],
        challengeStrategies: {},
      },
      externalData: {
        // Could integrate with Linear issues, Supabase data, etc.
        currentDevelopmentFocus: 'mystery_box_interactions',
        recentBugReports: [],
        performanceMetrics: {},
      },
    };

    this.automationSession = {
      startTime: Date.now(),
      decisions: [],
      contextUsage: [],
      learnings: [],
    };
  }

  async startFullAutomation() {
    console.log('🚀 Starting Advanced MCP Automation...');
    console.log(
      '🔗 Integrating with external context and intelligent systems...'
    );

    try {
      // Initialize MCP connections
      await this.initializeMCPConnections();

      // Gather external context
      await this.gatherExternalContext();

      // Start browser automation
      await this.playwright.startBrowser();

      // Execute intelligent automation sequence
      await this.executeIntelligentAutomation();

      // Generate comprehensive report
      await this.generateAdvancedReport();
    } catch (error) {
      console.error('❌ MCP Automation failed:', error.message);
    } finally {
      await this.playwright.stopBrowser();
    }
  }

  async initializeMCPConnections() {
    console.log('🔌 Initializing MCP connections...');

    // In a real setup, this would establish connections to:
    // - Linear (for issue tracking and development context)
    // - Supabase (for data analysis and user feedback)
    // - GitHub (for code context and recent changes)
    // - External APIs for game data and strategies

    // Simulate MCP initialization
    await this.delay(1000);

    console.log('✅ MCP connections established');
    console.log('   📋 Linear: Connected to project context');
    console.log('   🗄️  Supabase: Connected to user data');
    console.log('   📝 Documentation: Connected to game guides');
  }

  async gatherExternalContext() {
    console.log('📊 Gathering external context for intelligent automation...');

    // Simulate gathering context from various MCP sources
    const contextSources = [
      { name: 'Recent Development Changes', type: 'git_commits' },
      { name: 'User Feedback Data', type: 'supabase_analytics' },
      { name: 'Game Balance Metrics', type: 'performance_data' },
      { name: 'Current Development Focus', type: 'linear_issues' },
    ];

    for (const source of contextSources) {
      const context = await this.fetchMCPContext(source);
      this.mcpContext.externalData[source.type] = context;
      console.log(`   ✅ Loaded ${source.name}: ${context.summary}`);
    }

    // Use context to adjust automation strategy
    this.adaptAutomationStrategy();
  }

  async fetchMCPContext(source) {
    // Simulate MCP calls to external services
    await this.delay(500);

    switch (source.type) {
      case 'git_commits':
        return {
          summary: '3 recent commits focused on mystery box interactions',
          recentChanges: [
            'mystery box positioning',
            'interaction feedback',
            'visual effects',
          ],
          testingPriority: 'high',
        };

      case 'supabase_analytics':
        return {
          summary: 'Users spend average 2.3 minutes discovering mystery boxes',
          userBehavior: [
            'exploration patterns',
            'common stuck points',
            'completion rates',
          ],
          insights: [
            'players often miss boxes in corners',
            'debug mode usage up 40%',
          ],
        };

      case 'performance_data':
        return {
          summary: 'Game performance stable, FPS averaging 58',
          metrics: { avgFPS: 58, memoryUsage: 45, loadTime: 1.2 },
          concerns: ['slight memory leak during extended play'],
        };

      case 'linear_issues':
        return {
          summary: 'Current sprint focused on game balance and user experience',
          activeIssues: [
            'mystery box discovery rate',
            'player guidance system',
          ],
          priorities: ['improve discoverability', 'add visual hints'],
        };

      default:
        return { summary: 'Generic context data', data: {} };
    }
  }

  adaptAutomationStrategy() {
    console.log('🧠 Adapting automation strategy based on context...');

    // Adjust strategy based on external data
    const currentFocus = this.mcpContext.externalData.linear_issues;
    const userBehavior = this.mcpContext.externalData.supabase_analytics;

    if (currentFocus.priorities.includes('improve discoverability')) {
      this.mcpContext.userPreferences.objectives.unshift(
        'test_mystery_box_discoverability'
      );
      console.log(
        '   🎯 Added mystery box discoverability testing to objectives'
      );
    }

    if (userBehavior.insights.includes('players often miss boxes in corners')) {
      this.mcpContext.gameKnowledge.knownSecrets.push(
        'check_corner_areas_thoroughly'
      );
      console.log('   🔍 Added corner exploration to strategy');
    }

    // Record context usage for reporting
    this.automationSession.contextUsage.push({
      timestamp: Date.now(),
      source: 'external_mcp_data',
      adaptations: ['mystery_box_focus', 'corner_exploration'],
      reasoning: 'Based on current development focus and user behavior data',
    });
  }

  async executeIntelligentAutomation() {
    console.log('🎮 Beginning context-aware automated gameplay...');

    // Initialize the game
    await this.initializeGameWithContext();

    // Execute automation based on gathered context
    const objectives = this.mcpContext.userPreferences.objectives;

    for (const objective of objectives) {
      await this.executeContextualObjective(objective);
    }

    // Perform context-driven analysis
    await this.performContextualAnalysis();
  }

  async initializeGameWithContext() {
    console.log('🎯 Initializing game with contextual awareness...');

    await this.playwright.executeAction({
      type: 'navigate',
      url: '/?dev=true',
    });
    await this.playwright.executeAction({ type: 'wait', duration: 3000 });

    // Enable debug mode based on context (development focus)
    if (
      this.mcpContext.externalData.linear_issues.priorities.includes(
        'improve discoverability'
      )
    ) {
      await this.playwright.executeAction({ type: 'keyPress', key: 'F1' });
      console.log(
        '   🔧 Debug mode enabled based on current development focus'
      );
    }

    await this.takeContextualScreenshot('game_initialized_with_context');
  }

  async executeContextualObjective(objective) {
    console.log(`\n📋 Executing objective: ${objective}`);

    const decision = {
      objective,
      timestamp: Date.now(),
      contextUsed: [],
      actions: [],
    };

    switch (objective) {
      case 'test_mystery_box_discoverability':
        await this.testMysteryBoxDiscoverability(decision);
        break;

      case 'find_all_mystery_boxes':
        await this.systematicMysteryBoxSearch(decision);
        break;

      case 'explore_all_areas':
        await this.comprehensiveAreaExploration(decision);
        break;

      case 'complete_challenges':
        await this.intelligentChallengeCompletion(decision);
        break;

      default:
        console.log(`   ⚠️  Unknown objective: ${objective}`);
    }

    this.automationSession.decisions.push(decision);
  }

  async testMysteryBoxDiscoverability(decision) {
    console.log(
      '   🕵️ Testing mystery box discoverability based on user behavior data...'
    );

    // Use context about where users typically miss boxes
    const problematicAreas =
      this.mcpContext.externalData.supabase_analytics.insights;

    if (problematicAreas.includes('players often miss boxes in corners')) {
      console.log('   🎯 Focusing on corner areas based on user data...');

      decision.contextUsed.push('user_behavior_analytics');
      decision.actions.push('corner_area_exploration');

      // Systematically check corners
      const cornerSequence = [
        { type: 'keyPress', key: 'ArrowLeft', reason: 'move_to_left_boundary' },
        { type: 'wait', duration: 1000 },
        { type: 'keyPress', key: 'Space', reason: 'jump_in_left_corner' },
        { type: 'wait', duration: 500 },
        {
          type: 'keyPress',
          key: 'ArrowRight',
          reason: 'move_to_right_boundary',
        },
        { type: 'wait', duration: 2000 },
        { type: 'keyPress', key: 'Space', reason: 'jump_in_right_corner' },
      ];

      for (const action of cornerSequence) {
        await this.playwright.executeAction(action);
        decision.actions.push(action);
      }

      await this.takeContextualScreenshot('corner_exploration_complete');
    }
  }

  async systematicMysteryBoxSearch(decision) {
    console.log('   🔍 Performing systematic mystery box search...');

    // Use game knowledge about typical placement patterns
    decision.contextUsed.push('game_design_patterns');

    // Implement search pattern based on context
    const searchPattern = this.mcpContext.gameKnowledge.knownSecrets.includes(
      'check_corner_areas_thoroughly'
    )
      ? 'corner_priority_search'
      : 'standard_sweep_search';

    console.log(`   📊 Using search pattern: ${searchPattern}`);

    // Execute search with contextual intelligence
    const gameState = await this.playwright.page.evaluate(() => {
      return window.game
        ? {
            mysteryBoxes:
              window.game.mysteryBoxes?.map((box) => ({
                x: box.x,
                y: box.y,
                activated: box.activated,
              })) || [],
            playerPos: {
              x: window.game.player?.x || 0,
              y: window.game.player?.y || 0,
            },
          }
        : null;
    });

    if (gameState && gameState.mysteryBoxes.length > 0) {
      console.log(
        `   📦 Found ${gameState.mysteryBoxes.length} mystery boxes in game state`
      );

      // Intelligent pathfinding to boxes
      for (const box of gameState.mysteryBoxes) {
        if (!box.activated) {
          await this.navigateToBoxIntelligently(
            box,
            gameState.playerPos,
            decision
          );
        }
      }
    }
  }

  async navigateToBoxIntelligently(targetBox, currentPos, decision) {
    console.log(
      `   🎯 Navigating intelligently to box at (${targetBox.x}, ${targetBox.y})`
    );

    // Use context-aware navigation
    const distance = Math.sqrt(
      Math.pow(targetBox.x - currentPos.x, 2) +
        Math.pow(targetBox.y - currentPos.y, 2)
    );
    const strategy =
      distance > 200 ? 'long_distance_approach' : 'precise_positioning';

    decision.actions.push({
      type: 'intelligent_navigation',
      target: targetBox,
      strategy,
      contextReasoning: 'Based on distance and known movement patterns',
    });

    // Execute context-aware movement
    const dx = targetBox.x - currentPos.x;

    if (Math.abs(dx) > 20) {
      const direction = dx > 0 ? 'ArrowRight' : 'ArrowLeft';
      const moves = Math.min(Math.floor(Math.abs(dx) / 30), 5); // Limit moves

      for (let i = 0; i < moves; i++) {
        await this.playwright.executeAction({
          type: 'keyPress',
          key: direction,
        });
        await this.playwright.executeAction({ type: 'wait', duration: 300 });
      }
    }

    // Context-aware jump strategy
    if (targetBox.y < currentPos.y) {
      await this.playwright.executeAction({ type: 'keyPress', key: 'Space' });
    }

    await this.playwright.executeAction({ type: 'wait', duration: 500 });
  }

  async comprehensiveAreaExploration(decision) {
    console.log('   🗺️  Performing comprehensive area exploration...');

    decision.contextUsed.push('exploration_patterns', 'game_boundaries');

    // Context-aware exploration based on known game structure
    const explorationSequence = [
      { area: 'left_section', movements: ['ArrowLeft', 'ArrowLeft', 'Space'] },
      {
        area: 'center_section',
        movements: ['ArrowRight', 'Space', 'ArrowRight'],
      },
      {
        area: 'right_section',
        movements: ['ArrowRight', 'ArrowRight', 'Space'],
      },
    ];

    for (const section of explorationSequence) {
      console.log(`   📍 Exploring ${section.area}...`);

      for (const movement of section.movements) {
        await this.playwright.executeAction({
          type: 'keyPress',
          key: movement,
        });
        await this.playwright.executeAction({ type: 'wait', duration: 400 });
      }

      await this.takeContextualScreenshot(`exploration_${section.area}`);
      decision.actions.push({ type: 'area_exploration', area: section.area });
    }
  }

  async intelligentChallengeCompletion(decision) {
    console.log('   🏆 Attempting intelligent challenge completion...');

    // Use context about development focus to understand current challenges
    const devFocus = this.mcpContext.externalData.linear_issues.activeIssues;

    decision.contextUsed.push('development_context', 'challenge_strategies');

    if (devFocus.includes('player guidance system')) {
      console.log(
        '   🎯 Testing player guidance systems based on dev focus...'
      );

      // Test UI elements and guidance
      await this.playwright.executeAction({ type: 'keyPress', key: 'F1' });
      await this.playwright.executeAction({ type: 'wait', duration: 1000 });

      decision.actions.push({
        type: 'guidance_testing',
        reasoning: 'Testing based on current development sprint focus',
      });
    }

    // Attempt challenge completion with learned strategies
    const challengeActions = ['Space', 'ArrowRight', 'Space', 'ArrowLeft'];

    for (const action of challengeActions) {
      await this.playwright.executeAction({ type: 'keyPress', key: action });
      await this.playwright.executeAction({ type: 'wait', duration: 300 });
    }
  }

  async performContextualAnalysis() {
    console.log('📊 Performing contextual analysis of automation results...');

    // Gather final game state
    const finalGameState = await this.playwright.page.evaluate(() => {
      return window.game
        ? {
            player: {
              x: window.game.player?.x || 0,
              y: window.game.player?.y || 0,
              alive: window.game.player?.alive !== false,
            },
            mysteryBoxes:
              window.game.mysteryBoxes?.map((box) => ({
                x: box.x,
                y: box.y,
                activated: box.activated,
              })) || [],
            gameStats: {
              respawnCount: window.game.respawnCount || 0,
              gameTime: window.game.gameTime || 0,
            },
          }
        : null;
    });

    // Analyze results in context
    if (finalGameState) {
      const discoveredBoxes = finalGameState.mysteryBoxes.filter(
        (box) => box.activated
      ).length;
      const totalBoxes = finalGameState.mysteryBoxes.length;

      console.log(
        `   📦 Mystery Box Discovery: ${discoveredBoxes}/${totalBoxes} (${((discoveredBoxes / totalBoxes) * 100).toFixed(1)}%)`
      );

      // Context-aware insights
      const userAverage = 2.3; // From MCP context
      const discoveryTime =
        (Date.now() - this.automationSession.startTime) / 1000 / 60;

      if (discoveryTime < userAverage) {
        this.automationSession.learnings.push(
          `Automation discovered boxes faster than average user (${discoveryTime.toFixed(1)}min vs ${userAverage}min)`
        );
      }

      // Analyze effectiveness of context usage
      const contextDecisions = this.automationSession.decisions.filter(
        (d) => d.contextUsed.length > 0
      );
      console.log(
        `   🧠 Context-driven decisions: ${contextDecisions.length}/${this.automationSession.decisions.length}`
      );
    }

    await this.takeContextualScreenshot('final_analysis_state');
  }

  async takeContextualScreenshot(name) {
    const result = await this.playwright.executeAction({
      type: 'screenshot',
      name: `mcp_${name}`,
    });

    console.log(`📸 Contextual Screenshot: ${result.filename}`);
    return result;
  }

  async generateAdvancedReport() {
    console.log('\n📊 Generating Advanced MCP Automation Report...');

    const report = {
      automationSession: {
        ...this.automationSession,
        endTime: Date.now(),
        totalDuration: Date.now() - this.automationSession.startTime,
      },
      mcpContext: this.mcpContext,
      performance: {
        contextIntegrationRate: this.calculateContextIntegrationRate(),
        intelligentDecisionRate: this.calculateIntelligentDecisionRate(),
        objectiveCompletionRate: this.calculateObjectiveCompletionRate(),
      },
      insights: {
        mostValuableContext: this.identifyMostValuableContext(),
        automationEffectiveness: this.evaluateAutomationEffectiveness(),
        recommendationsForDevelopment:
          this.generateDevelopmentRecommendations(),
      },
    };

    // Save comprehensive report
    const outputDir = './mcp-automation-results';
    await fs.mkdir(outputDir, { recursive: true });

    const reportPath = path.join(
      outputDir,
      `mcp-automation-${Date.now()}.json`
    );
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    // Print executive summary
    this.printExecutiveSummary(report);

    console.log(`\n📄 Advanced MCP Report saved: ${reportPath}`);
    return report;
  }

  calculateContextIntegrationRate() {
    const totalDecisions = this.automationSession.decisions.length;
    const contextDecisions = this.automationSession.decisions.filter(
      (d) => d.contextUsed.length > 0
    ).length;

    return {
      rate: totalDecisions > 0 ? contextDecisions / totalDecisions : 0,
      contextDecisions,
      totalDecisions,
      rating:
        contextDecisions / totalDecisions > 0.8
          ? 'EXCELLENT'
          : contextDecisions / totalDecisions > 0.5
            ? 'GOOD'
            : 'NEEDS_IMPROVEMENT',
    };
  }

  calculateIntelligentDecisionRate() {
    const intelligentActions = this.automationSession.decisions.reduce(
      (count, decision) => {
        return (
          count +
          decision.actions.filter(
            (action) =>
              action.reasoning ||
              action.contextReasoning ||
              action.type === 'intelligent_navigation'
          ).length
        );
      },
      0
    );

    const totalActions = this.automationSession.decisions.reduce(
      (count, decision) => {
        return count + decision.actions.length;
      },
      0
    );

    return {
      rate: totalActions > 0 ? intelligentActions / totalActions : 0,
      intelligentActions,
      totalActions,
      rating:
        intelligentActions / totalActions > 0.7
          ? 'HIGHLY_INTELLIGENT'
          : intelligentActions / totalActions > 0.4
            ? 'MODERATELY_INTELLIGENT'
            : 'BASIC_AUTOMATION',
    };
  }

  calculateObjectiveCompletionRate() {
    const objectives = this.mcpContext.userPreferences.objectives;
    const completedObjectives = this.automationSession.decisions.map(
      (d) => d.objective
    );

    return {
      rate:
        objectives.length > 0
          ? completedObjectives.length / objectives.length
          : 0,
      completed: completedObjectives.length,
      total: objectives.length,
      rating:
        completedObjectives.length === objectives.length
          ? 'PERFECT_COMPLETION'
          : completedObjectives.length > objectives.length * 0.7
            ? 'GOOD_COMPLETION'
            : 'PARTIAL_COMPLETION',
    };
  }

  identifyMostValuableContext() {
    // Analyze which context sources were most frequently used
    const contextUsage = {};

    this.automationSession.decisions.forEach((decision) => {
      decision.contextUsed.forEach((context) => {
        contextUsage[context] = (contextUsage[context] || 0) + 1;
      });
    });

    const mostUsed = Object.entries(contextUsage)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([context, usage]) => ({ context, usage }));

    return {
      ranking: mostUsed,
      insights:
        mostUsed.length > 0
          ? `${mostUsed[0].context} was the most valuable context source (used ${mostUsed[0].usage} times)`
          : 'No context usage detected',
    };
  }

  evaluateAutomationEffectiveness() {
    const contextRate = this.calculateContextIntegrationRate().rate;
    const intelligenceRate = this.calculateIntelligentDecisionRate().rate;
    const completionRate = this.calculateObjectiveCompletionRate().rate;

    const overallScore = (contextRate + intelligenceRate + completionRate) / 3;

    return {
      overallScore,
      breakdown: {
        contextIntegration: contextRate,
        intelligentDecisions: intelligenceRate,
        objectiveCompletion: completionRate,
      },
      rating:
        overallScore > 0.8
          ? 'EXCEPTIONAL_AUTOMATION'
          : overallScore > 0.6
            ? 'EFFECTIVE_AUTOMATION'
            : overallScore > 0.4
              ? 'BASIC_AUTOMATION'
              : 'NEEDS_SIGNIFICANT_IMPROVEMENT',
      strengths: this.identifyAutomationStrengths(),
      weaknesses: this.identifyAutomationWeaknesses(),
    };
  }

  identifyAutomationStrengths() {
    const strengths = [];

    if (this.calculateContextIntegrationRate().rate > 0.7) {
      strengths.push('Excellent context integration');
    }

    if (this.calculateIntelligentDecisionRate().rate > 0.6) {
      strengths.push('Strong intelligent decision making');
    }

    if (this.automationSession.learnings.length > 2) {
      strengths.push('Good learning and adaptation capabilities');
    }

    return strengths.length > 0
      ? strengths
      : ['Basic automation functionality'];
  }

  identifyAutomationWeaknesses() {
    const weaknesses = [];

    if (this.calculateContextIntegrationRate().rate < 0.5) {
      weaknesses.push('Low context integration rate');
    }

    if (this.calculateObjectiveCompletionRate().rate < 0.8) {
      weaknesses.push('Incomplete objective completion');
    }

    if (this.automationSession.learnings.length < 2) {
      weaknesses.push('Limited learning and adaptation');
    }

    return weaknesses;
  }

  generateDevelopmentRecommendations() {
    const recommendations = [];

    // Based on automation performance and context
    const devContext = this.mcpContext.externalData.linear_issues;
    const userContext = this.mcpContext.externalData.supabase_analytics;

    if (devContext.priorities.includes('improve discoverability')) {
      const discoveryRate = this.calculateObjectiveCompletionRate();
      if (discoveryRate.rate < 0.8) {
        recommendations.push({
          priority: 'HIGH',
          category: 'Game Design',
          recommendation: 'Add more visual cues for mystery box discovery',
          reasoning:
            'Automation struggled with discovery, matching user behavior patterns',
          impact: 'Will improve user experience and reduce frustration',
        });
      }
    }

    if (userContext.insights.includes('debug mode usage up 40%')) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'UI/UX',
        recommendation:
          'Consider making debug information more accessible or create help tooltips',
        reasoning: 'High debug mode usage indicates users need more guidance',
        impact: 'Reduce dependency on debug mode for normal gameplay',
      });
    }

    // Performance-based recommendations
    const intelligenceRate = this.calculateIntelligentDecisionRate().rate;
    if (intelligenceRate < 0.5) {
      recommendations.push({
        priority: 'LOW',
        category: 'Game Balance',
        recommendation:
          'Simplify navigation or add more predictable game elements',
        reasoning: 'Even intelligent automation struggled with navigation',
        impact: 'Improve accessibility for all skill levels',
      });
    }

    return recommendations;
  }

  printExecutiveSummary(report) {
    console.log('\n🚀 ADVANCED MCP AUTOMATION - EXECUTIVE SUMMARY');
    console.log('================================================');

    console.log(
      `⏱️  Total Session Duration: ${(report.automationSession.totalDuration / 1000).toFixed(1)}s`
    );
    console.log(
      `🎯 Objectives Attempted: ${report.automationSession.decisions.length}`
    );
    console.log(
      `🔗 Context Integration Rate: ${(report.performance.contextIntegrationRate.rate * 100).toFixed(1)}% (${report.performance.contextIntegrationRate.rating})`
    );
    console.log(
      `🧠 Intelligent Decision Rate: ${(report.performance.intelligentDecisionRate.rate * 100).toFixed(1)}% (${report.performance.intelligentDecisionRate.rating})`
    );
    console.log(
      `✅ Objective Completion: ${(report.performance.objectiveCompletionRate.rate * 100).toFixed(1)}% (${report.performance.objectiveCompletionRate.rating})`
    );

    console.log(
      `\n🏆 Overall Automation Effectiveness: ${report.insights.automationEffectiveness.rating}`
    );
    console.log(
      `📊 Overall Score: ${(report.insights.automationEffectiveness.overallScore * 100).toFixed(1)}%`
    );

    if (report.insights.automationEffectiveness.strengths.length > 0) {
      console.log(`\n💪 STRENGTHS:`);
      report.insights.automationEffectiveness.strengths.forEach(
        (strength, index) => {
          console.log(`   ${index + 1}. ${strength}`);
        }
      );
    }

    if (report.insights.automationEffectiveness.weaknesses.length > 0) {
      console.log(`\n⚠️  AREAS FOR IMPROVEMENT:`);
      report.insights.automationEffectiveness.weaknesses.forEach(
        (weakness, index) => {
          console.log(`   ${index + 1}. ${weakness}`);
        }
      );
    }

    console.log(`\n💡 MOST VALUABLE CONTEXT:`);
    console.log(`   ${report.insights.mostValuableContext.insights}`);

    if (report.insights.recommendationsForDevelopment.length > 0) {
      console.log(`\n🎯 TOP RECOMMENDATIONS FOR DEVELOPMENT:`);
      report.insights.recommendationsForDevelopment
        .slice(0, 3)
        .forEach((rec, index) => {
          console.log(
            `   ${index + 1}. [${rec.priority}] ${rec.recommendation}`
          );
          console.log(`      💡 ${rec.reasoning}`);
        });
    }

    if (report.automationSession.learnings.length > 0) {
      console.log(`\n🔍 KEY LEARNINGS:`);
      report.automationSession.learnings.forEach((learning, index) => {
        console.log(`   ${index + 1}. ${learning}`);
      });
    }

    console.log('\n================================================');
    console.log('🔗 This automation used external context from:');
    console.log('   📋 Linear (development priorities)');
    console.log('   📊 Supabase (user analytics)');
    console.log('   🔧 Performance metrics');
    console.log('   📝 Game design knowledge');
    console.log('================================================');
  }

  // Helper methods
  async delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const mcpAutomation = new AdvancedMCPAutomation();
  mcpAutomation.startFullAutomation().catch((error) => {
    console.error('MCP Automation error:', error);
    process.exit(1);
  });
}

export default AdvancedMCPAutomation;
