#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import TestRunner from './test-runner.js';

class FileWatcher {
  constructor() {
    this.debounceTimeout = null;
    this.debounceDelay = 2000; // 2 seconds
    this.isRunning = false;
    this.watchedPaths = [
      './src',
      './index.html',
      './style.css',
      './public'
    ];
    this.ignoredPatterns = [
      /node_modules/,
      /\.git/,
      /test-results/,
      /dist/,
      /\.DS_Store/
    ];
  }

  shouldIgnore(filePath) {
    return this.ignoredPatterns.some(pattern => pattern.test(filePath));
  }

  async runTests() {
    if (this.isRunning) {
      console.log('⏳ Tests already running, skipping...');
      return;
    }

    this.isRunning = true;
    console.log('\\n🔄 File changes detected, running tests...\\n');

    try {
      const runner = new TestRunner();
      await runner.run();
    } catch (error) {
      console.error('Test execution failed:', error.message);
    } finally {
      this.isRunning = false;
    }
  }

  handleFileChange(eventType, filename, fullPath) {
    if (this.shouldIgnore(fullPath)) {
      return;
    }

    console.log(`📝 File changed: ${fullPath} (${eventType})`);

    // Debounce multiple rapid file changes
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }

    this.debounceTimeout = setTimeout(() => {
      this.runTests();
    }, this.debounceDelay);
  }

  watchDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
      console.log(`⚠️  Directory ${dirPath} does not exist, skipping watch`);
      return;
    }

    console.log(`👀 Watching directory: ${dirPath}`);

    const watcher = fs.watch(dirPath, { recursive: true }, (eventType, filename) => {
      if (filename) {
        const fullPath = path.join(dirPath, filename);
        this.handleFileChange(eventType, filename, fullPath);
      }
    });

    return watcher;
  }

  watchFile(filePath) {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File ${filePath} does not exist, skipping watch`);
      return;
    }

    console.log(`👀 Watching file: ${filePath}`);

    const watcher = fs.watch(filePath, (eventType, filename) => {
      this.handleFileChange(eventType, filename, filePath);
    });

    return watcher;
  }

  start() {
    console.log('🚀 Starting file watcher for automated testing...');
    console.log(`⏱️  Debounce delay: ${this.debounceDelay}ms`);

    const watchers = [];

    // Watch each path
    this.watchedPaths.forEach(watchPath => {
      const fullPath = path.resolve(watchPath);
      
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        
        if (stats.isDirectory()) {
          const watcher = this.watchDirectory(fullPath);
          if (watcher) watchers.push(watcher);
        } else if (stats.isFile()) {
          const watcher = this.watchFile(fullPath);
          if (watcher) watchers.push(watcher);
        }
      }
    });

    // Run initial test
    console.log('\\n🧪 Running initial test suite...\\n');
    this.runTests();

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\\n🛑 Shutting down file watcher...');
      watchers.forEach(watcher => watcher.close());
      process.exit(0);
    });

    console.log('\\n✅ File watcher started. Press Ctrl+C to stop.\\n');
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const watcher = new FileWatcher();
  watcher.start();
}

export default FileWatcher;
