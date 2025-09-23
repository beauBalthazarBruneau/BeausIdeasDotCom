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
├── 📁 automation/           # MCP & AI automation systems
│   ├── mcp-ai-player.js    # Intelligent AI that plays the game
│   ├── test-runner.js      # Automated test orchestration
│   ├── test-config.json    # Test scenario configuration
│   └── watch-and-test.js   # File watcher for continuous testing
│
├── 📁 analysis/             # Game analysis & testing tools
│   ├── gameplay-analysis.js    # AI gameplay analysis
│   ├── feedback-analyzer.js    # Intelligent feedback generation
│   ├── visual-analysis.js      # Visual testing and analysis
│   └── capture-game-visuals.js # Screenshot and visual capture
│
├── 📁 docs/                 # Documentation
│   ├── FULL_AUTOMATION_GUIDE.md  # Complete automation guide
│   ├── TESTING_README.md         # Testing system documentation
│   └── CODE_ARCHITECTURE.md      # Code architecture overview
│
├── 📁 results/              # All test results and reports
│   ├── mcp-results/         # MCP AI gameplay reports
│   ├── test-results/        # Automated test results
│   ├── ai-gameplay-results/ # AI gameplay screenshots
│   └── screenshots/         # Visual test screenshots
│
├── 📁 src/                  # Main game source code
├── 📁 public/               # Static assets
└── 📁 archive/              # Archived implementations
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

### **Automated Testing System**
- **13 Test Scenarios**: Comprehensive game validation
- **Real-time Analysis**: Browser-based game state monitoring
- **Visual Documentation**: Automatic screenshot capture
- **Intelligent Reporting**: AI-powered feedback and recommendations

```bash
# Run automated tests
npm run test:dev
```

## 📊 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run mcp-ai:dev` | Run AI player with dev server |
| `npm run test:dev` | Run automated tests with dev server |
| `npm run analyze` | Run gameplay analysis |
| `npm run visual-test` | Run visual testing suite |
| `npm run build` | Build for production |

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

### **Development Features**
- **Hot Reload**: Instant development feedback
- **ESLint**: Code quality enforcement
- **Prettier**: Consistent code formatting
- **Vite**: Fast build system

## 🔧 Configuration

### **Test Configuration**
Edit `automation/test-config.json` to customize:
- Test scenarios and assertions
- Performance thresholds  
- Screenshot settings
- Report formats

### **AI Configuration**
The MCP AI player can be customized in `automation/mcp-ai-player.js`:
- Exploration strategies
- Risk tolerance
- Decision priorities
- Performance metrics

## 📈 Reports & Analytics

All automation generates detailed reports in the `results/` directory:

- **`mcp-results/`**: AI gameplay analysis with decision trees
- **`test-results/`**: Automated test outcomes and metrics
- **`screenshots/`**: Visual documentation of gameplay
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