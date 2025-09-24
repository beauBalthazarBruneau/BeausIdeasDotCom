#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

/**
 * Enhanced Test Runner with per-test cleanup and management
 * Handles running individual tests and managing their results
 */
class TestRunner {
  constructor(config = {}) {
    this.config = {
      resultsBaseDir: './automation/results',
      cleanupAfterTest: true,
      keepLastNResults: 5, // Keep last 5 test runs per test
      ...config
    };
  }

  async runTest(testPath, testConfig = {}) {
    console.log(`🚀 Running test: ${testPath}`);

    try {
      // Import the test dynamically
      const TestClass = (await import(testPath)).default;

      // Create test instance
      const test = new TestClass(testConfig);

      // Extract test name for results management
      const testName = test.testName || test.player?.testName || 'unknown-test';

      // Run the test
      await test.run();

      // Post-test cleanup if enabled
      if (this.config.cleanupAfterTest) {
        await this.cleanupTestResults(testName);
      }

      console.log(`✅ Test completed successfully: ${testPath}`);
      return { success: true, testName };

    } catch (error) {
      console.error(`❌ Test failed: ${testPath}`, error.message);
      return { success: false, error: error.message };
    }
  }

  async runMultipleTests(testPaths, config = {}) {
    console.log(`🎯 Running ${testPaths.length} tests...`);

    const results = [];

    for (const testPath of testPaths) {
      console.log(`\n${'='.repeat(60)}`);
      const result = await this.runTest(testPath, config);
      results.push({ testPath, ...result });
    }

    // Generate summary report
    await this.generateSummaryReport(results);

    return results;
  }

  async cleanupTestResults(testName) {
    console.log(`🧹 Cleaning up results for: ${testName}`);

    try {
      const testResultsDir = path.join(this.config.resultsBaseDir, testName);

      // Check if results directory exists
      try {
        await fs.access(testResultsDir);
      } catch {
        console.log(`ℹ️ No results directory found for ${testName}`);
        return;
      }

      // Get all files in the test results directory
      const files = await fs.readdir(testResultsDir);

      // Separate different file types
      const reports = files.filter(f => f.includes('-report-') && f.endsWith('.json'));
      const positions = files.filter(f => f.includes('-positions-') && f.endsWith('.json'));
      const screenshots = files.filter(f => f.endsWith('.png'));

      // Keep only the most recent files of each type
      await this.keepRecentFiles(testResultsDir, reports, this.config.keepLastNResults);
      await this.keepRecentFiles(testResultsDir, positions, this.config.keepLastNResults);
      await this.keepRecentFiles(testResultsDir, screenshots, this.config.keepLastNResults * 10); // Keep more screenshots

      console.log(`✅ Cleanup completed for ${testName}`);

    } catch (error) {
      console.warn(`⚠️ Cleanup failed for ${testName}:`, error.message);
    }
  }

  async keepRecentFiles(dir, files, keepCount) {
    if (files.length <= keepCount) {
      return; // Nothing to clean up
    }

    // Sort files by timestamp (newest first)
    const filesWithStats = await Promise.all(
      files.map(async file => {
        const fullPath = path.join(dir, file);
        const stats = await fs.stat(fullPath);
        return { file, fullPath, mtime: stats.mtime };
      })
    );

    filesWithStats.sort((a, b) => b.mtime - a.mtime);

    // Delete old files
    const filesToDelete = filesWithStats.slice(keepCount);

    for (const { fullPath, file } of filesToDelete) {
      try {
        await fs.unlink(fullPath);
        console.log(`🗑️ Deleted old file: ${file}`);
      } catch (error) {
        console.warn(`⚠️ Failed to delete ${file}:`, error.message);
      }
    }
  }

  async generateSummaryReport(results) {
    console.log('\n📊 Generating summary report...');

    const summary = {
      timestamp: new Date().toISOString(),
      totalTests: results.length,
      successfulTests: results.filter(r => r.success).length,
      failedTests: results.filter(r => !r.success).length,
      successRate: ((results.filter(r => r.success).length / results.length) * 100).toFixed(1),
      results
    };

    const summaryPath = path.join(this.config.resultsBaseDir, `test-summary-${Date.now()}.json`);
    await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));

    // Print summary to console
    console.log('\n🎮 TEST EXECUTION SUMMARY');
    console.log('='.repeat(50));
    console.log(`📊 Total Tests: ${summary.totalTests}`);
    console.log(`✅ Successful: ${summary.successfulTests}`);
    console.log(`❌ Failed: ${summary.failedTests}`);
    console.log(`📈 Success Rate: ${summary.successRate}%`);

    console.log('\n📋 Individual Results:');
    results.forEach(result => {
      const icon = result.success ? '✅' : '❌';
      const testName = path.basename(result.testPath, '.js');
      console.log(`   ${icon} ${testName}`);
      if (!result.success) {
        console.log(`      Error: ${result.error}`);
      }
    });

    const overallRating = summary.successRate === '100.0' ? 'EXCELLENT 🌟' :
                         parseFloat(summary.successRate) >= 80 ? 'GOOD 👍' :
                         'NEEDS WORK 🔧';

    console.log(`\n🎯 Overall Rating: ${overallRating}`);
    console.log(`📄 Summary saved: ${summaryPath}`);
    console.log('='.repeat(50));

    return summary;
  }

  async listAvailableTests() {
    const testsDir = './automation/tests';

    try {
      const files = await fs.readdir(testsDir);
      const testFiles = files.filter(f => f.endsWith('.test.js'));

      console.log('\n📋 Available Tests:');
      testFiles.forEach((file, index) => {
        console.log(`   ${index + 1}. ${file}`);
      });

      return testFiles.map(f => path.join(testsDir, f));
    } catch (error) {
      console.error('❌ Failed to list tests:', error.message);
      return [];
    }
  }

  async cleanupAllResults() {
    console.log('🧹 Cleaning up all test results...');

    try {
      const resultsDir = this.config.resultsBaseDir;
      const entries = await fs.readdir(resultsDir, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory()) {
          await this.cleanupTestResults(entry.name);
        }
      }

      console.log('✅ Global cleanup completed');
    } catch (error) {
      console.error('❌ Global cleanup failed:', error.message);
    }
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new TestRunner();
  const command = process.argv[2];
  const testPath = process.argv[3];

  switch (command) {
    case 'run':
      if (!testPath) {
        console.error('❌ Please specify a test path: npm run test-runner run <test-path>');
        process.exit(1);
      }
      runner.runTest(testPath).then(result => {
        process.exit(result.success ? 0 : 1);
      });
      break;

    case 'list':
      runner.listAvailableTests();
      break;

    case 'cleanup':
      runner.cleanupAllResults();
      break;

    case 'run-all':
      runner.listAvailableTests().then(tests => {
        return runner.runMultipleTests(tests);
      }).then(results => {
        const hasFailures = results.some(r => !r.success);
        process.exit(hasFailures ? 1 : 0);
      });
      break;

    default:
      console.log(`
🎮 Test Runner Commands:

   npm run test-runner run <test-path>   - Run a specific test
   npm run test-runner run-all          - Run all available tests
   npm run test-runner list            - List available tests
   npm run test-runner cleanup         - Clean up old results

Examples:
   npm run test-runner run ./automation/tests/mystery-box-hybrid.test.js
   npm run test-runner run-all
      `);
  }
}

export default TestRunner;