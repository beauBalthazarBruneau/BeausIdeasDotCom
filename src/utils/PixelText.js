export class PixelText {
  constructor() {
    this.letterSprites = new Map();
    this.initializeLetterSprites();
  }

  // Sprite-based text system
  initializeLetterSprites() {
    const blockSize = 10;
    const letterWidth = 6 * blockSize;
    const letterHeight = 8 * blockSize;

    // Define letter patterns (1 = filled, 0 = empty)
    // 6x8 pixel grid for each letter
    const letterPatterns = {
      'B': [
        '11111 ',
        '1    1',
        '1    1',
        '11111 ',
        '1    1',
        '1    1',
        '11111 ',
        '      '
      ],
      'E': [
        '111111',
        '1     ',
        '1     ',
        '11111 ',
        '1     ',
        '1     ',
        '111111',
        '      '
      ],
      'A': [
        ' 1111 ',
        '1    1',
        '1    1',
        '111111',
        '1    1',
        '1    1',
        '1    1',
        '      '
      ],
      'U': [
        '1    1',
        '1    1',
        '1    1',
        '1    1',
        '1    1',
        '1    1',
        ' 1111 ',
        '      '
      ],
      'R': [
        '11111 ',
        '1    1',
        '1    1',
        '11111 ',
        '1  1  ',
        '1   1 ',
        '1    1',
        '      '
      ],
      'N': [
        '1    1',
        '11   1',
        '1 1  1',
        '1  1 1',
        '1   11',
        '1    1',
        '1    1',
        '      '
      ],
      ' ': [
        '      ',
        '      ',
        '      ',
        '      ',
        '      ',
        '      ',
        '      ',
        '      '
      ]
    };

    // Convert patterns to sprite data
    Object.entries(letterPatterns).forEach(([letter, pattern]) => {
      this.letterSprites.set(letter, {
        pattern,
        width: letterWidth,
        height: letterHeight,
        blockSize
      });
    });
  }

  // Draw sprite-based letter
  drawSpriteLetter(ctx, letter, x, y, scale = 1, color = '#808080') {
    const sprite = this.letterSprites.get(letter.toUpperCase());
    if (!sprite) return 0;

    const { pattern, blockSize } = sprite;
    ctx.fillStyle = color;

    for (let row = 0; row < pattern.length; row++) {
      const line = pattern[row];
      for (let col = 0; col < line.length; col++) {
        if (line[col] === '1') {
          const blockX = x + col * blockSize * scale;
          const blockY = y + row * blockSize * scale;
          ctx.fillRect(blockX, blockY, blockSize * scale, blockSize * scale);
        }
      }
    }

    return sprite.width * scale;
  }



  // Draw sprite-based text
  drawSpriteText(ctx, text, x, y, scale = 1, color = '#808080', spacing = 8) {
    let currentX = x;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const letterWidth = this.drawSpriteLetter(ctx, char, currentX, y, scale, color);
      currentX += letterWidth + (spacing * scale);
    }

    return currentX - x; // Return total width
  }


  // Get text dimensions for positioning
  getTextWidth(text, blockSize = 8, spacing = 8) {
    return text.length * (6 * blockSize) + (text.length - 1) * spacing;
  }

  getTextHeight(blockSize = 8) {
    return 7 * blockSize; // 7 rows high (8th row is spacing)
  }
}