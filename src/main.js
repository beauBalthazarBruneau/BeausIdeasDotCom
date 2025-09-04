import { Game } from './Game.js';

// Initialize the game when DOM is loaded
let game;

function initGame() {
  const canvas = document.getElementById('game-canvas');
  if (!canvas) {
    console.error('Game canvas not found!');
    return;
  }
  
  // Create and start the game
  game = new Game(canvas);
  
  console.log('🎮 Portfolio Mario Game Initialized!');
  console.log('Controls:');
  console.log('  Arrow Keys or WASD - Move');
  console.log('  Space or Up Arrow - Jump');
  console.log('  F1 - Toggle Debug Mode');
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
