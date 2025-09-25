import fs from 'fs/promises';
import path from 'path';

class FeedbackAnalyzer {
  constructor() {
    this.patterns = {
      critical: [
        'canvas not initialized',
        'page failed to load',
        'javascript error',
        'network error',
        'timeout',
        'server error',
      ],
      performance: [
        'slow loading',
        'large bundle size',
        'memory leak',
        'fps drop',
        'blocking resources',
      ],
      accessibility: [
        'missing alt text',
        'keyboard navigation',
        'color contrast',
        'aria labels',
        'focus management',
      ],
      responsiveness: [
        'layout shift',
        'mobile viewport',
        'touch targets',
        'responsive breakpoints',
      ],
    };
  }

  async analyzeTestResults(reportPath) {
    try {
      const reportData = await fs.readFile(reportPath, 'utf8');
      const report = JSON.parse(reportData);

      console.log('\\n🔍 Analyzing test results for actionable feedback...');

      const analysis = {
        summary: this.analyzeSummary(report.summary),
        issues: this.categorizeIssues(report.results),
        recommendations: this.generateRecommendations(report.results),
        trends: this.analyzeTrends(report.results),
        actionItems: this.generateActionItems(report.results),
      };

      await this.generateFeedbackReport(analysis, report);
      return analysis;
    } catch (error) {
      console.error('Failed to analyze test results:', error.message);
      throw error;
    }
  }

  analyzeSummary(summary) {
    const passRate = (summary.passed / summary.total) * 100;
    const avgDuration = summary.totalDuration / summary.total;

    return {
      passRate: passRate.toFixed(1),
      status:
        passRate >= 90
          ? 'excellent'
          : passRate >= 70
            ? 'good'
            : passRate >= 50
              ? 'needs_improvement'
              : 'critical',
      avgDuration: Math.round(avgDuration),
      performanceGrade:
        avgDuration < 2000
          ? 'A'
          : avgDuration < 5000
            ? 'B'
            : avgDuration < 10000
              ? 'C'
              : 'D',
    };
  }

  categorizeIssues(results) {
    const issues = {
      critical: [],
      performance: [],
      accessibility: [],
      responsiveness: [],
      other: [],
    };

    results.forEach((result) => {
      if (result.status === 'failed') {
        result.errors.forEach((error) => {
          const category = this.categorizeError(error);
          issues[category].push({
            test: result.name,
            error: error,
            description: result.description,
          });
        });
      }
    });

    return issues;
  }

  categorizeError(error) {
    const errorLower = error.toLowerCase();

    for (const [category, patterns] of Object.entries(this.patterns)) {
      if (patterns.some((pattern) => errorLower.includes(pattern))) {
        return category;
      }
    }

    return 'other';
  }

  generateRecommendations(results) {
    const recommendations = [];

    // Analyze patterns in failures
    const failedTests = results.filter((r) => r.status === 'failed');
    const commonErrors = this.findCommonErrors(failedTests);

    // Generate specific recommendations
    if (commonErrors.canvas) {
      recommendations.push({
        priority: 'high',
        category: 'functionality',
        issue: 'Canvas initialization issues',
        suggestion:
          'Check that the canvas element is properly created and the rendering context is initialized before drawing',
        codeExample:
          'const canvas = document.getElementById("game-canvas");\\nif (!canvas.getContext) return; // Check canvas support',
      });
    }

    if (commonErrors.loading) {
      recommendations.push({
        priority: 'medium',
        category: 'performance',
        issue: 'Slow page loading',
        suggestion:
          'Consider code splitting, lazy loading, or optimizing asset sizes',
        codeExample:
          'const GameModule = () => import("./Game.js"); // Dynamic import for code splitting',
      });
    }

    if (commonErrors.responsive) {
      recommendations.push({
        priority: 'medium',
        category: 'design',
        issue: 'Responsive design issues',
        suggestion: 'Add CSS media queries and test on various screen sizes',
        codeExample:
          '@media (max-width: 768px) { #game-container { width: 100vw; } }',
      });
    }

    return recommendations;
  }

  findCommonErrors(failedTests) {
    const errorCounts = {};

    failedTests.forEach((test) => {
      test.errors.forEach((error) => {
        const category = this.categorizeError(error);
        errorCounts[category] = (errorCounts[category] || 0) + 1;
      });
    });

    return errorCounts;
  }

  analyzeTrends(results) {
    // This would typically analyze historical data
    // For now, we'll provide current test insights
    return {
      testDuration: {
        fastest: Math.min(...results.map((r) => r.duration || 0)),
        slowest: Math.max(...results.map((r) => r.duration || 0)),
        average:
          results.reduce((sum, r) => sum + (r.duration || 0), 0) /
          results.length,
      },
      reliabilityScore:
        (results.filter((r) => r.status === 'passed').length / results.length) *
        100,
      mostProblematicTest:
        results
          .filter((r) => r.status === 'failed')
          .sort((a, b) => b.errors.length - a.errors.length)[0]?.name || 'None',
    };
  }

  generateActionItems(results) {
    const actionItems = [];
    const failedTests = results.filter((r) => r.status === 'failed');

    // Priority 1: Fix critical failures
    const criticalFailures = failedTests.filter((test) =>
      test.errors.some((error) => this.categorizeError(error) === 'critical')
    );

    if (criticalFailures.length > 0) {
      actionItems.push({
        priority: 1,
        title: 'Fix Critical Issues',
        description: `${criticalFailures.length} critical test(s) failing`,
        tasks: criticalFailures.map(
          (test) => `Fix: ${test.name} - ${test.errors[0]}`
        ),
        estimatedTime: '2-4 hours',
      });
    }

    // Priority 2: Performance improvements
    const slowTests = results.filter((r) => (r.duration || 0) > 5000);
    if (slowTests.length > 0) {
      actionItems.push({
        priority: 2,
        title: 'Optimize Performance',
        description: `${slowTests.length} test(s) running slowly`,
        tasks: slowTests.map(
          (test) => `Optimize: ${test.name} (${test.duration}ms)`
        ),
        estimatedTime: '1-2 hours',
      });
    }

    // Priority 3: Add missing tests
    const coverageGaps = this.identifyCoverageGaps(results);
    if (coverageGaps.length > 0) {
      actionItems.push({
        priority: 3,
        title: 'Improve Test Coverage',
        description: 'Add tests for missing functionality',
        tasks: coverageGaps,
        estimatedTime: '1-3 hours',
      });
    }

    return actionItems;
  }

  identifyCoverageGaps(results) {
    const gaps = [];
    const testNames = results.map((r) => r.name);

    // Common game testing scenarios that might be missing
    const expectedTests = [
      'game_loop',
      'collision_detection',
      'input_handling',
      'sound_system',
      'save_state',
      'level_progression',
    ];

    expectedTests.forEach((expected) => {
      if (!testNames.some((name) => name.includes(expected))) {
        gaps.push(`Add test for: ${expected.replace('_', ' ')}`);
      }
    });

    return gaps;
  }

  async generateFeedbackReport(analysis, originalReport) {
    const feedbackReport = {
      timestamp: new Date().toISOString(),
      project: originalReport.projectName,
      analysis,
      originalReport: originalReport.summary,
      aiActionable: {
        canAutoFix: this.identifyAutoFixableIssues(analysis.issues),
        needsHumanIntervention: this.identifyComplexIssues(analysis.issues),
        suggestedNextSteps: this.generateNextSteps(analysis),
      },
    };

    const outputPath = path.join(
      './test-results',
      `feedback-report-${Date.now()}.json`
    );
    await fs.writeFile(outputPath, JSON.stringify(feedbackReport, null, 2));

    // Generate human-readable summary
    this.printFeedbackSummary(analysis);

    return feedbackReport;
  }

  identifyAutoFixableIssues(issues) {
    const autoFixable = [];

    // Issues that can potentially be automatically fixed
    issues.other.forEach((issue) => {
      if (issue.error.includes('typo') || issue.error.includes('syntax')) {
        autoFixable.push(issue);
      }
    });

    return autoFixable;
  }

  identifyComplexIssues(issues) {
    return [...issues.critical, ...issues.performance];
  }

  generateNextSteps(analysis) {
    const steps = [];

    if (analysis.issues.critical.length > 0) {
      steps.push(
        'Immediately address critical failures that prevent basic functionality'
      );
    }

    if (analysis.summary.passRate < 70) {
      steps.push(
        'Focus on improving test pass rate before adding new features'
      );
    }

    if (analysis.trends.reliabilityScore < 80) {
      steps.push('Investigate flaky tests and improve test reliability');
    }

    steps.push('Run tests after each code change to catch regressions early');

    return steps;
  }

  printFeedbackSummary(analysis) {
    console.log('\\n📊 AUTOMATED FEEDBACK SUMMARY');
    console.log('================================');

    console.log(
      `\\n📈 Overall Health: ${analysis.summary.status.toUpperCase()}`
    );
    console.log(`✅ Pass Rate: ${analysis.summary.passRate}%`);
    console.log(
      `⚡ Avg Duration: ${analysis.summary.avgDuration}ms (Grade: ${analysis.summary.performanceGrade})`
    );

    if (analysis.issues.critical.length > 0) {
      console.log('\\n🚨 CRITICAL ISSUES:');
      analysis.issues.critical.forEach((issue) => {
        console.log(`   ❌ ${issue.test}: ${issue.error}`);
      });
    }

    if (analysis.recommendations.length > 0) {
      console.log('\\n💡 TOP RECOMMENDATIONS:');
      analysis.recommendations.slice(0, 3).forEach((rec, index) => {
        console.log(
          `   ${index + 1}. [${rec.priority.toUpperCase()}] ${rec.issue}`
        );
        console.log(`      ${rec.suggestion}`);
      });
    }

    if (analysis.actionItems.length > 0) {
      console.log('\\n🎯 IMMEDIATE ACTION ITEMS:');
      analysis.actionItems.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.title} (${item.estimatedTime})`);
        console.log(`      ${item.description}`);
      });
    }

    console.log('\\n================================');
  }
}

export default FeedbackAnalyzer;
