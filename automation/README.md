# Mario Game Automated Testing System

## ✅ Working Solution

After extensive debugging, we found that **Vite's dev server blocks Playwright connections**. The solution is to use Python's HTTP server to serve the built game.

## 🚀 How to Run Tests

### 1. Build the Game
```bash
npm run build
```

### 2. Start Python HTTP Server
```bash
cd dist && python3 -m http.server 9000 &
cd ..
```

### 3. Run the AI Playtest
```bash
./archive/mario-playtest-runner.js
```

## 📋 What the AI Tests

The AI player will:
- ✅ Load your game in a browser
- ✅ Test player movement (arrow keys + space)
- ✅ Toggle debug mode (F1)
- ✅ Run extended gameplay session (10 seconds)
- ✅ Look for mystery box interactions
- ✅ Generate performance report
- ✅ Take 6 screenshots documenting the session
- ✅ Rate overall game quality

## 📊 Results

- **Screenshots**: Saved to `./playtest-results/`
- **Detailed Report**: JSON file with performance metrics
- **Console Output**: Real-time feedback during testing

## 🎯 Expected Output

```
🎮 MARIO GAME PLAYTEST SUMMARY
=================================
⏱️  Session Duration: 18.2s
🎬 Actions Performed: 6
📸 Screenshots Taken: 6
✅ Successful Actions: 6
❌ Failed Actions: 0

🎯 Overall Game Quality: EXCELLENT 🌟
=================================
```

## 🔧 Files

- `archive/mario-playtest-runner.js` - Main AI playtest runner (WORKING)
- `archive/playwright-real-integration.js` - Playwright integration layer
- `mcp-ai-player.js` - Mock MCP AI player (for demo purposes)

## ⚠️ Important Notes

- **Do NOT use Vite dev server** (`npm run dev`) - Playwright cannot connect
- **Always use built version** with Python HTTP server
- **Port 9000** is configured in the playtest runner
- The AI requires the game to be fully built and loaded to work properly