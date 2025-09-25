#!/usr/bin/env node

import { chromium } from 'playwright';
import fs from 'fs/promises';

async function visuallyAnalyzeGame() {
  console.log('👁️  VISUALLY ANALYZING YOUR MARIO GAME...');
  console.log('📸 Taking screenshots to see what looks bad');

  let browser, page;

  try {
    // Launch browser in NON-headless mode so I can see what you see
    browser = await chromium.launch({
      headless: true, // Keep headless for now but take detailed screenshots
      slowMo: 100,
    });

    page = await browser.newPage();

    // Set viewport to common screen size
    await page.setViewportSize({ width: 1920, height: 1080 });

    console.log('🌐 Loading your game...');
    await page.goto('http://localhost:5177/?dev=true', {
      waitUntil: 'domcontentloaded',
      timeout: 10000,
    });

    // Wait for game to fully load
    await page.waitForTimeout(4000);

    console.log('📷 Taking initial full-screen screenshot...');
    await page.screenshot({
      path: './visual-analysis-full.png',
      fullPage: true,
    });

    console.log('📷 Taking focused game area screenshot...');
    await page.screenshot({
      path: './visual-analysis-game.png',
      clip: { x: 0, y: 0, width: 1920, height: 1080 },
    });

    // Analyze what's visible
    const visualElements = await page.evaluate(() => {
      const canvas = document.querySelector('#game-canvas');
      const maintenance = document.querySelector('#maintenance-overlay');
      const debugInfo = document.querySelector('#debug-info');
      const gameContainer = document.querySelector('#game-container');

      return {
        canvas: {
          exists: !!canvas,
          visible: canvas ? canvas.offsetParent !== null : false,
          dimensions: canvas
            ? {
                width: canvas.width,
                height: canvas.height,
                styleWidth: canvas.style.width,
                styleHeight: canvas.style.height,
              }
            : null,
          position: canvas
            ? {
                left: canvas.offsetLeft,
                top: canvas.offsetTop,
              }
            : null,
        },
        maintenance: {
          exists: !!maintenance,
          visible: maintenance
            ? !maintenance.classList.contains('hidden')
            : false,
          display: maintenance
            ? window.getComputedStyle(maintenance).display
            : null,
        },
        gameContainer: {
          exists: !!gameContainer,
          dimensions: gameContainer
            ? {
                width: gameContainer.offsetWidth,
                height: gameContainer.offsetHeight,
              }
            : null,
        },
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        bodyStyle: {
          backgroundColor: window.getComputedStyle(document.body)
            .backgroundColor,
          margin: window.getComputedStyle(document.body).margin,
          padding: window.getComputedStyle(document.body).padding,
        },
      };
    });

    console.log('🔍 VISUAL ANALYSIS RESULTS:');
    console.log('============================');
    console.log('Canvas:', visualElements.canvas);
    console.log('Maintenance:', visualElements.maintenance);
    console.log('Viewport:', visualElements.viewport);
    console.log('Body Style:', visualElements.bodyStyle);

    // Activate debug mode to see more details
    console.log('🔧 Activating debug mode to see more...');
    await page.keyboard.press('F1');
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: './visual-analysis-debug.png',
      fullPage: true,
    });

    // Try some gameplay to see visual feedback
    console.log('🎮 Testing visual gameplay feedback...');

    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(500);
    await page.screenshot({ path: './visual-analysis-move-right.png' });

    await page.keyboard.press('Space');
    await page.waitForTimeout(500);
    await page.screenshot({ path: './visual-analysis-jump.png' });

    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(500);
    await page.screenshot({ path: './visual-analysis-move-left.png' });

    // Get canvas image data to analyze what's being drawn
    const canvasAnalysis = await page.evaluate(() => {
      const canvas = document.querySelector('#game-canvas');
      if (!canvas) return null;

      try {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Analyze colors in the canvas
        const colorFrequency = {};
        const sampleSize = 1000; // Sample every 1000th pixel to avoid processing millions

        for (let i = 0; i < data.length; i += 4 * sampleSize) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          if (a > 0) {
            // Only count non-transparent pixels
            const color = `rgb(${r},${g},${b})`;
            colorFrequency[color] = (colorFrequency[color] || 0) + 1;
          }
        }

        // Get top 10 most frequent colors
        const topColors = Object.entries(colorFrequency)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
          .map(([color, count]) => ({ color, count }));

        return {
          dimensions: { width: canvas.width, height: canvas.height },
          topColors,
          hasContent: Object.keys(colorFrequency).length > 0,
        };
      } catch (error) {
        return { error: error.message };
      }
    });

    console.log('🎨 CANVAS VISUAL ANALYSIS:');
    console.log(canvasAnalysis);

    // Generate visual improvement recommendations
    const improvements = [];

    if (visualElements.canvas.dimensions) {
      const canvas = visualElements.canvas.dimensions;
      if (canvas.width < visualElements.viewport.width * 0.8) {
        improvements.push({
          issue: 'Canvas too small for viewport',
          current: `${canvas.width}x${canvas.height}`,
          viewport: `${visualElements.viewport.width}x${visualElements.viewport.height}`,
          suggestion: 'Make canvas fill more of the viewport',
        });
      }
    }

    if (canvasAnalysis?.topColors) {
      const dominantColors = canvasAnalysis.topColors.slice(0, 3);
      console.log('🎨 DOMINANT COLORS IN GAME:');
      dominantColors.forEach((color, i) => {
        console.log(`  ${i + 1}. ${color.color} (${color.count} pixels)`);
      });

      // Check for boring/bad color schemes
      const boringColors = dominantColors.filter(
        (c) =>
          c.color.includes('128,128,128') || // Gray
          c.color.includes('255,255,255') || // White
          c.color.includes('0,0,0') // Black
      );

      if (boringColors.length > 1) {
        improvements.push({
          issue: 'Color scheme is too bland/boring',
          details: `Dominant colors are: ${dominantColors.map((c) => c.color).join(', ')}`,
          suggestion:
            'Add more vibrant, thematic colors to match Jersey Shore beach theme',
        });
      }
    }

    const report = {
      timestamp: new Date().toISOString(),
      visualElements,
      canvasAnalysis,
      improvements,
      screenshots: [
        './visual-analysis-full.png',
        './visual-analysis-game.png',
        './visual-analysis-debug.png',
        './visual-analysis-move-right.png',
        './visual-analysis-jump.png',
        './visual-analysis-move-left.png',
      ],
    };

    await fs.writeFile(
      './visual-analysis-report.json',
      JSON.stringify(report, null, 2)
    );

    console.log('\\n🎯 VISUAL IMPROVEMENT RECOMMENDATIONS:');
    console.log('=======================================');

    if (improvements.length === 0) {
      console.log(
        '🔍 Let me analyze the screenshots to identify specific visual issues...'
      );
    } else {
      improvements.forEach((improvement, i) => {
        console.log(`${i + 1}. ${improvement.issue}`);
        console.log(
          `   Current: ${improvement.current || improvement.details}`
        );
        console.log(`   Fix: ${improvement.suggestion}`);
        console.log('');
      });
    }

    console.log('📸 Screenshots saved for visual analysis:');
    report.screenshots.forEach((screenshot) => {
      console.log(`   - ${screenshot}`);
    });

    console.log('\\n📄 Full report: ./visual-analysis-report.json');

    return report;
  } catch (error) {
    console.error('❌ Visual analysis failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

visuallyAnalyzeGame();
