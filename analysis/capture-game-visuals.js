#!/usr/bin/env node

import { chromium } from 'playwright';

async function captureGameVisuals() {
  console.log('📸 CAPTURING YOUR MARIO GAME VISUALS TO SEE WHAT LOOKS BAD');

  let browser, page;

  try {
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage();
    await page.setViewportSize({ width: 1920, height: 1080 });

    console.log('🌐 Loading game from existing server...');
    await page.goto('http://localhost:5173/?dev=true', {
      waitUntil: 'domcontentloaded',
      timeout: 8000,
    });

    console.log('⏳ Waiting for game to initialize...');
    await page.waitForTimeout(4000);

    // Capture initial state
    console.log('📷 Screenshot 1: Initial game state');
    await page.screenshot({
      path: './game-visual-1-initial.png',
      fullPage: false,
    });

    // Activate debug mode
    console.log('🔧 Activating debug mode...');
    await page.keyboard.press('F1');
    await page.waitForTimeout(1000);

    console.log('📷 Screenshot 2: Debug mode active');
    await page.screenshot({
      path: './game-visual-2-debug.png',
      fullPage: false,
    });

    // Test movement
    console.log('🎮 Testing player movement...');
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(800);

    console.log('📷 Screenshot 3: After moving right');
    await page.screenshot({
      path: './game-visual-3-move-right.png',
      fullPage: false,
    });

    await page.keyboard.press('Space');
    await page.waitForTimeout(800);

    console.log('📷 Screenshot 4: After jump');
    await page.screenshot({
      path: './game-visual-4-jump.png',
      fullPage: false,
    });

    // Get detailed analysis
    const analysis = await page.evaluate(() => {
      const canvas = document.querySelector('#game-canvas');

      if (!canvas) return { error: 'No canvas found' };

      const ctx = canvas.getContext('2d');

      // Sample canvas colors
      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Sample colors from different areas
        const samples = {
          topLeft: { r: data[0], g: data[1], b: data[2], a: data[3] },
          topRight: {
            r: data[(canvas.width - 1) * 4],
            g: data[(canvas.width - 1) * 4 + 1],
            b: data[(canvas.width - 1) * 4 + 2],
            a: data[(canvas.width - 1) * 4 + 3],
          },
          center: {
            r: data[
              Math.floor(canvas.width / 2) * 4 +
                Math.floor(canvas.height / 2) * canvas.width * 4
            ],
            g: data[
              Math.floor(canvas.width / 2) * 4 +
                Math.floor(canvas.height / 2) * canvas.width * 4 +
                1
            ],
            b: data[
              Math.floor(canvas.width / 2) * 4 +
                Math.floor(canvas.height / 2) * canvas.width * 4 +
                2
            ],
            a: data[
              Math.floor(canvas.width / 2) * 4 +
                Math.floor(canvas.height / 2) * canvas.width * 4 +
                3
            ],
          },
        };

        return {
          canvasSize: { width: canvas.width, height: canvas.height },
          colorSamples: samples,
          gameExists: !!window.game,
          debugVisible: !!document.querySelector('#debug-info.visible'),
        };
      } catch (e) {
        return {
          canvasSize: { width: canvas.width, height: canvas.height },
          error: 'Could not sample canvas colors: ' + e.message,
          gameExists: !!window.game,
          debugVisible: !!document.querySelector('#debug-info.visible'),
        };
      }
    });

    console.log('\\n🎨 VISUAL ANALYSIS RESULTS:');
    console.log('============================');
    console.log('Canvas Size:', analysis.canvasSize);
    console.log('Game Object Exists:', analysis.gameExists);
    console.log('Debug Mode Active:', analysis.debugVisible);

    if (analysis.colorSamples) {
      console.log('\\n🎨 COLOR SAMPLES FROM CANVAS:');
      console.log('Top Left:', analysis.colorSamples.topLeft);
      console.log('Top Right:', analysis.colorSamples.topRight);
      console.log('Center:', analysis.colorSamples.center);

      // Analyze if colors are boring
      const { topLeft, center } = analysis.colorSamples;
      const isMonochrome = topLeft.r === topLeft.g && topLeft.g === topLeft.b;
      const centerIsMonochrome = center.r === center.g && center.g === center.b;

      console.log('\\n🔍 VISUAL QUALITY ASSESSMENT:');
      if (isMonochrome && centerIsMonochrome) {
        console.log('❌ PROBLEM: Colors appear very bland/monochromatic');
        console.log('   The game looks gray/boring - needs vibrant colors!');
      }

      if (topLeft.r === 0 && topLeft.g === 0 && topLeft.b === 0) {
        console.log('❌ PROBLEM: Background appears completely black');
        console.log('   Need to add proper background graphics!');
      }
    }

    console.log('\\n📸 SCREENSHOTS SAVED:');
    console.log('- game-visual-1-initial.png (Initial state)');
    console.log('- game-visual-2-debug.png (Debug mode)');
    console.log('- game-visual-3-move-right.png (After movement)');
    console.log('- game-visual-4-jump.png (After jump)');

    console.log('\\n✅ VISUAL CAPTURE COMPLETE!');
    console.log('Now I can see exactly what needs to be fixed...');

    return analysis;
  } catch (error) {
    console.error('❌ Visual capture failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

captureGameVisuals();
