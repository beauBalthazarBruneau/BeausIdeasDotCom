// Check for dev mode
const urlParams = new URLSearchParams(window.location.search);
const isDevMode = urlParams.get('dev') === 'true';

if (isDevMode) {
  // Game mode: hide portfolio, show game container, apply game styles
  document.getElementById('portfolio').style.display = 'none';
  document.getElementById('game-container').style.display = 'flex';
  document.body.classList.add('game-mode');

  // Dynamically import and initialize the game
  import('./game/Game.js').then(({ Game }) => {
    const canvas = document.getElementById('game-canvas');
    if (!canvas) {
      console.error('Game canvas not found!');
      return;
    }

    try {
      const game = new Game(canvas);
      window.game = game;
      console.log('Portfolio Mario Game Initialized!');
      console.log(
        'Controls: Arrow Keys/WASD to move, Space/Up for double jump, F1 for debug'
      );

      window.addEventListener('beforeunload', () => {
        game.destroy();
      });
    } catch (error) {
      console.error('Error initializing game:', error);
    }
  });
}
