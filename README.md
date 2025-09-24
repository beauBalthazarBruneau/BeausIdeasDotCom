# Portfolio Mario Game 🎮

An interactive Mario-style portfolio website with advanced AI automation and testing capabilities.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run MCP AI player
npm run mcp-ai:dev
```

## 📁 Directory Structure

```
BeausIdeasDotCom/
├── 📁 automation/                    # Advanced automation & testing system
│   ├── 📁 core/                     # Core automation engine
│   │   ├── BasePlayer.js            # Hybrid automation player
│   │   └── index.js                 # Core module exports
│   ├── 📁 tests/                    # Individual test files
│   │   └── mystery-box-hybrid.test.js # Smart mystery box testing
│   ├── 📁 config/                   # Configuration system
│   │   └── test-config.js           # Global test settings
│   ├── 📁 runners/                  # Test execution & management
│   │   └── test-runner.js           # Advanced test runner with cleanup
│   ├── 📁 templates/                # Quick test creation
│   │   └── test-template.js         # Template for new tests
│   ├── 📁 results/                  # Per-test organized results
│   │   └── [test-name]/             # Individual test outputs
│   │       ├── screenshots/         # Visual documentation
│   │       ├── position-data.json   # Real-time tracking data
│   │       └── test-report.json     # Comprehensive analysis
│   └── 📁 legacy/                   # Legacy automation files
│       ├── mcp-ai-player.js         # Original MCP AI player
│       └── test-runner.js           # Legacy test runner
│
├── 📁 analysis/                     # Game analysis & testing tools
│   ├── gameplay-analysis.js         # AI gameplay analysis
│   ├── feedback-analyzer.js         # Intelligent feedback generation
│   └── visual-analysis.js           # Visual testing and analysis
│
├── 📁 docs/                         # Documentation
│   ├── FULL_AUTOMATION_GUIDE.md     # Complete automation guide
│   ├── TESTING_README.md            # Testing system documentation
│   └── CODE_ARCHITECTURE.md         # Code architecture overview
│
├── 📁 src/                          # Main game source code
├── 📁 public/                       # Static assets
└── 📁 archive/                      # Archived implementations
```

## 🤖 AI Automation Features

### **MCP-Powered AI Player**

- **Intelligent Decision Making**: Priority-based AI that analyzes game state
- **Smart Pathfinding**: Finds and navigates to mystery boxes optimally
- **Adaptive Exploration**: Dynamic exploration strategies
- **Performance Analytics**: Detailed gameplay reports and insights

```bash
# Run the AI player
npm run mcp-ai:dev
```

### **Advanced Testing System** 🚀

- **Hybrid BasePlayer**: Smart movement + comprehensive monitoring
- **Precision Navigation**: Sub-20px positioning accuracy with overshoot prevention
- **Real-time Tracking**: 100ms interval position/velocity/game state monitoring
- **Visual Documentation**: Automated screenshots at key interaction points
- **JSON Data Export**: Complete test sessions with position tracking
- **Intelligent Reporting**: Performance analysis with actionable recommendations
- **Per-test Cleanup**: Automated results management with configurable retention

```bash
# Run new hybrid automation tests
node automation/tests/mystery-box-hybrid.test.js

# Use the test runner for management
node automation/runners/test-runner.js run automation/tests/mystery-box-hybrid.test.js
node automation/runners/test-runner.js list              # List available tests
node automation/runners/test-runner.js run-all          # Run all tests
node automation/runners/test-runner.js cleanup          # Clean old results

# Legacy automated tests (still available)
npm run test:dev
```

## 📊 Available Scripts

| Script                | Description                                |
| --------------------- | ------------------------------------------ |
| `npm run dev`         | Start development server                   |
| `npm run build`       | Build for production                       |
| `npm run mcp-ai:dev`  | Run AI player with dev server              |
| `npm run test:dev`    | Run legacy automated tests with dev server |
| `npm run analyze`     | Run gameplay analysis                      |
| `npm run visual-test` | Run visual testing suite                   |

### **New Advanced Testing Commands** 🚀

| Command                                             | Description                  |
| --------------------------------------------------- | ---------------------------- |
| `node automation/tests/[test].test.js`              | Run individual test directly |
| `node automation/runners/test-runner.js run <path>` | Run test with management     |
| `node automation/runners/test-runner.js list`       | List all available tests     |
| `node automation/runners/test-runner.js run-all`    | Execute complete test suite  |
| `node automation/runners/test-runner.js cleanup`    | Clean old test results       |

## 🎯 Key Features

### **Game Features**

- Interactive Mario-style platformer
- Mystery box interactions
- Dynamic background themes
- Sound effects and music
- Debug mode with F1

### **Automation Features**

- **MCP Browser Integration**: Real browser automation
- **Intelligent AI**: Smart decision-making algorithms
- **Performance Monitoring**: FPS, memory, load time tracking
- **Visual Testing**: Screenshot comparison and analysis
- **Comprehensive Reports**: JSON reports with detailed analytics

### **Advanced Testing Features** 🧪

- **Hybrid BasePlayer**: Combines smart movement from mystery-box-test with comprehensive monitoring from mario-playtest-runner
- **Precision Movement**:
  - Smart positioning with 20px tolerance
  - Overshoot prevention and momentum stopping
  - Multiple movement strategies (holding, precise presses)
  - Real-time position tracking during navigation
- **Game Interaction**:
  - Mystery box detection and analysis
  - Strategic hitting from below with multiple attempts
  - Collectible spawning verification and collection
  - Completion state monitoring
- **Data Capture**:
  - Real-time position/velocity tracking (100ms intervals)
  - Automatic screenshot capture at key moments
  - Performance metrics and console error monitoring
  - JSON export of complete test sessions
- **Results Management**:
  - Per-test organized directories
  - Automatic cleanup of old results (configurable retention)
  - Comprehensive reporting with recommendations
  - Visual documentation of test execution

### **Development Features**

- **Hot Reload**: Instant development feedback
- **ESLint**: Code quality enforcement
- **Prettier**: Consistent code formatting
- **Vite**: Fast build system

## 🔧 Configuration & Custom Tests

### **Creating Custom Tests** ⚡

Use the template to quickly create new tests:

```bash
# Copy the template
cp automation/templates/test-template.js automation/tests/my-custom-test.js

# Edit your test logic
# The template includes:
# - BasePlayer setup with hybrid capabilities
# - Navigation examples (navigateToPosition, smartPositioning)
# - Game interaction methods (jump, hitMysteryBoxFromBelow, collectItem)
# - Screenshot and data capture
# - Performance monitoring

# Run your custom test
node automation/tests/my-custom-test.js
```

### **Advanced Configuration**

Edit `automation/config/test-config.js` for global settings:

- **Movement precision**: tolerance, max attempts, timeout
- **Position tracking**: intervals, data export options
- **Screenshots**: quality, timing, storage
- **Performance**: FPS tracking, error thresholds, memory monitoring
- **Results**: cleanup retention, directory structure

### **Legacy Configuration**

Legacy systems still available in `automation/`:

- `test-config.json`: Original test scenarios
- `mcp-ai-player.js`: MCP AI player settings

## 📈 Reports & Analytics

### **New Advanced Reports** (in `automation/results/[test-name]/`)

- **`[test]-report-[timestamp].json`**: Comprehensive test analysis with:
  - Session duration and action counts
  - Success/failure rates and performance metrics
  - Detailed action logs with timing
  - Intelligent recommendations for improvements
- **`[test]-positions-[timestamp].json`**: Real-time position tracking:
  - Player coordinates and velocity every 100ms
  - Movement patterns and navigation analysis
- **`screenshots/`**: Visual test documentation:
  - Key interaction moments (game_loaded, mystery_box_hit, etc.)
  - Timestamped with descriptive names
  - Automatic capture at critical test points

### **Legacy Reports** (still available)

- **`mcp-results/`**: AI gameplay analysis with decision trees
- **`test-results/`**: Original automated test outcomes
- **Performance data**: FPS, memory usage, load times

## 🚀 Advanced Usage

### **MCP Integration**

The system integrates with Model Context Protocol (MCP) for:

- Browser automation
- Real-time game state analysis
- External data integration (Linear, Supabase)
- Intelligent context-aware decisions

### **AI Analysis**

The AI system provides:

- Mystery box discovery optimization
- Player movement pattern analysis
- Performance bottleneck identification
- Game design recommendations

## 📝 Documentation

- **[Full Automation Guide](docs/FULL_AUTOMATION_GUIDE.md)**: Complete setup and usage
- **[Testing README](docs/TESTING_README.md)**: Testing system details
- **[Code Architecture](docs/CODE_ARCHITECTURE.md)**: System design overview

## 🎮 Game Controls

- **Arrow Keys / WASD**: Move player
- **Space / Up Arrow**: Jump (double jump available)
- **F1**: Toggle debug mode
- **Dev Mode**: Add `?dev=true` to URL

---

Built with ❤️ using Vite, Matter.js, GSAP, and advanced MCP automation.
