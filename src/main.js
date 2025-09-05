import { Game } from './core/Game.js';

// Initialize the game when DOM is loaded
let game;

function initGame() {
  const canvas = document.getElementById('game-canvas');
  if (!canvas) {
    console.error('❌ Game canvas not found!');
    return;
  }
  
  try {
    // Create and start the game
    game = new Game(canvas);
    
    console.log('🎮 Portfolio Mario Game Initialized!');
    console.log('Controls: Arrow Keys/WASD to move, Space/Up for double jump, F1 for debug');
  } catch (error) {
    console.error('❌ Error initializing game:', error);
  }
}

// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGame);
} else {
  initGame();
}

// Handle page cleanup
window.addEventListener('beforeunload', () => {
  if (game) {
    game.destroy();
  }
});
