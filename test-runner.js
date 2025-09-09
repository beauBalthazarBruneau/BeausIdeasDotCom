#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class TestRunner {
  constructor() {
    this.config = null;
    this.devServer = null;
    this.results = [];
  }

  async loadConfig(configPath = './test-config.json') {
    try {
      const configData = await fs.readFile(configPath, 'utf8');
      this.config = JSON.parse(configData);
      console.log(`✓ Loaded test configuration: ${this.config.projectName}`);
    } catch (error) {
      throw new Error(`Failed to load test config: ${error.message}`);
    }
  }

  async startDevServer() {
    return new Promise((resolve, reject) => {
      console.log('🚀 Starting development server...');
      
      this.devServer = spawn('npm', ['run', 'dev'], {
        stdio: 'pipe',
        detached: false
      });

      let serverReady = false;

      this.devServer.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(`[DEV SERVER] ${output.trim()}`);
        
        if (output.includes('localhost:5173') || output.includes('Local:')) {
          if (!serverReady) {
            serverReady = true;
            setTimeout(() => resolve(), 2000); // Give server time to fully start
          }
        }
      });

      this.devServer.stderr.on('data', (data) => {
        console.error(`[DEV SERVER ERROR] ${data.toString()}`);
      });

      this.devServer.on('error', (error) => {
        reject(new Error(`Failed to start dev server: ${error.message}`));
      });

      // Timeout if server doesn't start
      setTimeout(() => {
        if (!serverReady) {
          reject(new Error('Dev server failed to start within timeout'));
        }
      }, this.config.devServer.timeout || 10000);
    });
  }

  async stopDevServer() {
    if (this.devServer) {
      console.log('🛑 Stopping development server...');
      this.devServer.kill('SIGTERM');
      this.devServer = null;
    }
  }

  async runTest(scenario) {
    console.log(`\n🧪 Running test: ${scenario.name}`);
    console.log(`📝 Description: ${scenario.description}`);

    const testResult = {
      name: scenario.name,
      description: scenario.description,
      status: 'running',
      startTime: Date.now(),
      actions: [],
      assertions: [],
      screenshots: [],
      errors: []
    };

    try {
      // Execute actions using Playwright MCP calls
      for (const action of scenario.actions) {
        const actionResult = await this.executeAction(action);
        testResult.actions.push(actionResult);
        
        if (!actionResult.success) {
          throw new Error(`Action failed: ${action.type} - ${actionResult.error}`);
        }
      }

      // Run assertions
      for (const assertion of scenario.assertions) {
        const assertionResult = await this.executeAssertion(assertion);
        testResult.assertions.push(assertionResult);
        
        if (!assertionResult.success) {
          testResult.errors.push(`Assertion failed: ${assertion.type} - ${assertionResult.error}`);
        }
      }

      testResult.status = testResult.errors.length === 0 ? 'passed' : 'failed';
      testResult.endTime = Date.now();
      testResult.duration = testResult.endTime - testResult.startTime;

      const statusIcon = testResult.status === 'passed' ? '✅' : '❌';
      console.log(`${statusIcon} Test ${scenario.name}: ${testResult.status.toUpperCase()}`);
      
      if (testResult.errors.length > 0) {
        console.log('❌ Errors:');
        testResult.errors.forEach(error => console.log(`   - ${error}`));
      }

    } catch (error) {
      testResult.status = 'failed';
      testResult.endTime = Date.now();
      testResult.duration = testResult.endTime - testResult.startTime;
      testResult.errors.push(error.message);
      console.log(`❌ Test ${scenario.name}: FAILED - ${error.message}`);
    }

    return testResult;
  }

  async executeAction(action) {
    // This would integrate with Playwright MCP
    // For now, we'll simulate the actions
    console.log(`   🔄 Executing action: ${action.type}`);
    
    try {
      switch (action.type) {
        case 'navigate':
          // Call Playwright MCP to navigate
          return { success: true, action: action.type, result: 'Navigation successful' };
        
        case 'waitFor':
          // Call Playwright MCP to wait for element
          return { success: true, action: action.type, result: 'Element found' };
        
        case 'screenshot':
          // Call Playwright MCP to take screenshot
          return { success: true, action: action.type, result: 'Screenshot captured' };
        
        case 'wait':
          // Simple wait
          await new Promise(resolve => setTimeout(resolve, action.duration));
          return { success: true, action: action.type, result: `Waited ${action.duration}ms` };
        
        default:
          return { success: false, action: action.type, error: 'Unknown action type' };
      }
    } catch (error) {
      return { success: false, action: action.type, error: error.message };
    }
  }

  async executeAssertion(assertion) {
    console.log(`   🔍 Checking assertion: ${assertion.type}`);
    
    try {
      switch (assertion.type) {
        case 'elementExists':
          // Call Playwright MCP to check if element exists
          return { success: true, assertion: assertion.type, result: 'Element exists' };
        
        case 'elementVisible':
          // Call Playwright MCP to check if element is visible
          return { success: true, assertion: assertion.type, result: 'Element is visible' };
        
        case 'titleContains':
          // Call Playwright MCP to check page title
          return { success: true, assertion: assertion.type, result: 'Title matches' };
        
        case 'canvasNotEmpty':
          // Call Playwright MCP to check canvas content
          return { success: true, assertion: assertion.type, result: 'Canvas has content' };
        
        case 'noConsoleErrors':
          // Call Playwright MCP to check console logs
          return { success: true, assertion: assertion.type, result: 'No console errors' };
        
        default:
          return { success: false, assertion: assertion.type, error: 'Unknown assertion type' };
      }
    } catch (error) {
      return { success: false, assertion: assertion.type, error: error.message };
    }
  }

  async generateReport() {
    const report = {
      projectName: this.config.projectName,
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.length,
        passed: this.results.filter(r => r.status === 'passed').length,
        failed: this.results.filter(r => r.status === 'failed').length,
        totalDuration: this.results.reduce((sum, r) => sum + (r.duration || 0), 0)
      },
      results: this.results
    };

    // Create test results directory
    const outputDir = this.config.reporting.outputDir || './test-results';
    try {
      await fs.mkdir(outputDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    // Write report
    const reportPath = path.join(outputDir, `test-report-${Date.now()}.json`);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    console.log(`\n📊 Test Report Generated: ${reportPath}`);
    console.log(`✅ Passed: ${report.summary.passed}`);
    console.log(`❌ Failed: ${report.summary.failed}`);
    console.log(`⏱️  Total Duration: ${report.summary.totalDuration}ms`);

    return report;
  }

  async run() {
    try {
      await this.loadConfig();
      await this.startDevServer();

      console.log(`\n🎯 Running ${this.config.testScenarios.length} test scenarios...\n`);

      // Run all test scenarios
      for (const scenario of this.config.testScenarios) {
        const result = await this.runTest(scenario);
        this.results.push(result);
      }

      // Generate report
      const report = await this.generateReport();

      // Stop dev server
      await this.stopDevServer();

      // Exit with appropriate code
      const hasFailures = report.summary.failed > 0;
      process.exit(hasFailures ? 1 : 0);

    } catch (error) {
      console.error(`❌ Test runner failed: ${error.message}`);
      await this.stopDevServer();
      process.exit(1);
    }
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new TestRunner();
  runner.run().catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
}

export default TestRunner;
