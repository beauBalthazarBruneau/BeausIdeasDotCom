#!/usr/bin/env node

import { chromium } from 'playwright';

async function quickVisualCheck() {
  console.log('🎮 QUICK VISUAL CHECK OF YOUR MARIO GAME');
  
  let browser, page;
  
  try {
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Start dev server and wait
    console.log('🚀 Starting dev server...');
    const { spawn } = await import('child_process');
    const server = spawn('npm', ['run', 'dev'], { 
      stdio: 'pipe',
      detached: false 
    });
    
    // Wait for server to start
    await new Promise((resolve) => {
      server.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(output.trim());
        if (output.includes('ready in') || output.includes('Local:')) {
          setTimeout(resolve, 2000);
        }
      });
    });
    
    // Try to load the page
    console.log('📍 Loading game page...');
    
    // Get the actual URL from server output
    let gameUrl = 'http://localhost:5173/?dev=true'; // Default fallback
    
    await page.goto(gameUrl, { waitUntil: 'load', timeout: 5000 });
    console.log('✅ Page loaded!');
    
    await page.waitForTimeout(3000);
    
    // Take screenshot
    await page.screenshot({ path: './quick-visual-check.png', fullPage: true });
    console.log('📸 Screenshot saved: quick-visual-check.png');
    
    // Analyze what we see
    const pageInfo = await page.evaluate(() => {
      return {
        title: document.title,
        hasCanvas: !!document.querySelector('#game-canvas'),
        canvasSize: document.querySelector('#game-canvas') ? {
          width: document.querySelector('#game-canvas').width,
          height: document.querySelector('#game-canvas').height
        } : null,
        hasMaintenanceOverlay: !!document.querySelector('#maintenance-overlay'),
        maintenanceHidden: document.querySelector('#maintenance-overlay')?.classList.contains('hidden'),
        gameObjectExists: !!window.game
      };
    });
    
    console.log('🔍 PAGE ANALYSIS:');
    console.log(pageInfo);
    
    // Test basic interaction
    await page.keyboard.press('F1');
    await page.waitForTimeout(500);
    await page.screenshot({ path: './visual-debug-mode.png' });
    console.log('📸 Debug mode screenshot saved');
    
    server.kill();
    console.log('✅ Visual check complete!');
    
  } catch (error) {
    console.error('❌ Visual check failed:', error.message);
  } finally {
    if (browser) await browser.close();
  }
}

quickVisualCheck();
