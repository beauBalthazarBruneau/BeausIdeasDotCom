export class Background {
  constructor(canvas, levelWidth) {
    this.canvas = canvas;
    this.levelWidth = levelWidth;
    
    // Background layers with different scroll speeds (parallax effect)
    this.layers = [
      {
        name: 'sky',
        scrollSpeed: 0.1,
        color: '#87CEEB',
        elements: [] // Will be populated with clouds, mountains, etc.
      },
      {
        name: 'mountains',
        scrollSpeed: 0.3,
        color: '#9370DB',
        elements: this.generateMountains()
      },
      {
        name: 'hills',
        scrollSpeed: 0.5,
        color: '#98FB98',
        elements: this.generateHills()
      },
      {
        name: 'trees',
        scrollSpeed: 0.7,
        color: '#228B22',
        elements: this.generateTrees()
      }
    ];
    
    // Generate sky elements (clouds, sun)
    this.layers[0].elements = this.generateSkyElements();
  }

  generateSkyElements() {
    const elements = [];
    
    // Add sun
    elements.push({
      type: 'sun',
      x: this.levelWidth * 0.8, // Position sun towards the right side
      y: 100,
      size: 60,
      color: '#FFD700'
    });
    
    // Add clouds scattered across the level
    const cloudCount = Math.floor(this.levelWidth / 400); // One cloud every 400 pixels
    for (let i = 0; i < cloudCount; i++) {
      elements.push({
        type: 'cloud',
        x: (this.levelWidth / cloudCount) * i + Math.random() * 200,
        y: 80 + Math.random() * 100, // Random height between 80-180
        size: 40 + Math.random() * 30, // Random size 40-70
        color: '#FFFFFF'
      });
    }
    
    return elements;
  }

  generateMountains() {
    const elements = [];
    const mountainCount = 8;
    
    for (let i = 0; i < mountainCount; i++) {
      const x = (this.levelWidth / mountainCount) * i;
      const height = 200 + Math.random() * 150; // Mountain height varies
      const width = 300 + Math.random() * 200; // Mountain width varies
      
      elements.push({
        type: 'mountain',
        x: x,
        y: this.canvas.height - 200, // Position from bottom
        width: width,
        height: height,
        color: `hsl(${280 + Math.random() * 20}, 60%, ${40 + Math.random() * 20}%)` // Purple mountain variations
      });
    }
    
    return elements;
  }

  generateHills() {
    const elements = [];
    const hillCount = 12;
    
    for (let i = 0; i < hillCount; i++) {
      const x = (this.levelWidth / hillCount) * i - 50; // Overlap hills slightly
      const height = 80 + Math.random() * 60;
      const width = 200 + Math.random() * 100;
      
      elements.push({
        type: 'hill',
        x: x,
        y: this.canvas.height - 100,
        width: width,
        height: height,
        color: `hsl(${120 + Math.random() * 30}, 50%, ${60 + Math.random() * 20}%)` // Green hill variations
      });
    }
    
    return elements;
  }

  generateTrees() {
    const elements = [];
    const treePositions = [
      150, 380, 550, 680, 920, 1150, 1380, 1620, 1880, 2150, 2380, 2650, 2850
    ]; // Position trees strategically around platforms
    
    treePositions.forEach(x => {
      // Vary tree types and sizes
      const treeType = Math.random() > 0.5 ? 'pine' : 'oak';
      const height = 60 + Math.random() * 40;
      const width = treeType === 'pine' ? height * 0.4 : height * 0.6;
      
      elements.push({
        type: 'tree',
        subtype: treeType,
        x: x,
        y: this.canvas.height - 50, // Position from bottom
        width: width,
        height: height,
        color: treeType === 'pine' ? '#006400' : '#228B22' // Different greens for different trees
      });
    });
    
    return elements;
  }

  draw(ctx, camera) {
    // Draw each layer with its own parallax scroll speed
    this.layers.forEach(layer => {
      this.drawLayer(ctx, layer, camera);
    });
  }

  drawLayer(ctx, layer, camera) {
    ctx.save();
    
    // Calculate parallax offset
    const parallaxX = camera.x * layer.scrollSpeed;
    const parallaxY = camera.y * layer.scrollSpeed * 0.5; // Vertical parallax is subtle
    
    // Apply parallax transform
    ctx.translate(-parallaxX, -parallaxY);
    
    // Draw layer background color if it's the sky
    if (layer.name === 'sky') {
      ctx.fillStyle = layer.color;
      ctx.fillRect(-parallaxX, -parallaxY, this.canvas.width + parallaxX * 2, this.canvas.height + parallaxY * 2);
    }
    
    // Draw all elements in this layer
    layer.elements.forEach(element => {
      this.drawElement(ctx, element);
    });
    
    ctx.restore();
  }

  drawElement(ctx, element) {
    ctx.save();
    
    switch (element.type) {
      case 'sun':
        this.drawSun(ctx, element);
        break;
      case 'cloud':
        this.drawCloud(ctx, element);
        break;
      case 'mountain':
        this.drawMountain(ctx, element);
        break;
      case 'hill':
        this.drawHill(ctx, element);
        break;
      case 'tree':
        this.drawTree(ctx, element);
        break;
    }
    
    ctx.restore();
  }

  drawSun(ctx, sun) {
    ctx.fillStyle = sun.color;
    ctx.beginPath();
    ctx.arc(sun.x, sun.y, sun.size, 0, Math.PI * 2);
    ctx.fill();
    
    // Add sun rays
    ctx.strokeStyle = sun.color;
    ctx.lineWidth = 3;
    const rayCount = 12;
    for (let i = 0; i < rayCount; i++) {
      const angle = (Math.PI * 2 / rayCount) * i;
      const startX = sun.x + Math.cos(angle) * (sun.size + 10);
      const startY = sun.y + Math.sin(angle) * (sun.size + 10);
      const endX = sun.x + Math.cos(angle) * (sun.size + 25);
      const endY = sun.y + Math.sin(angle) * (sun.size + 25);
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }
  }

  drawCloud(ctx, cloud) {
    ctx.fillStyle = cloud.color;
    const { x, y, size } = cloud;
    
    // Draw cloud as overlapping circles
    ctx.beginPath();
    ctx.arc(x, y, size * 0.6, 0, Math.PI * 2);
    ctx.arc(x + size * 0.4, y, size * 0.5, 0, Math.PI * 2);
    ctx.arc(x - size * 0.4, y, size * 0.5, 0, Math.PI * 2);
    ctx.arc(x + size * 0.2, y - size * 0.3, size * 0.4, 0, Math.PI * 2);
    ctx.arc(x - size * 0.2, y - size * 0.3, size * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  drawMountain(ctx, mountain) {
    ctx.fillStyle = mountain.color;
    const { x, y, width, height } = mountain;
    
    // Draw mountain as triangle
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + width / 2, y - height);
    ctx.lineTo(x + width, y);
    ctx.closePath();
    ctx.fill();
    
    // Add snow cap for taller mountains
    if (height > 250) {
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(x + width * 0.3, y - height * 0.7);
      ctx.lineTo(x + width / 2, y - height);
      ctx.lineTo(x + width * 0.7, y - height * 0.7);
      ctx.closePath();
      ctx.fill();
    }
  }

  drawHill(ctx, hill) {
    ctx.fillStyle = hill.color;
    const { x, y, width, height } = hill;
    
    // Draw hill as rounded shape
    ctx.beginPath();
    ctx.ellipse(x + width / 2, y, width / 2, height, 0, 0, Math.PI);
    ctx.fill();
  }

  drawTree(ctx, tree) {
    const { x, y, width, height, color, subtype } = tree;
    
    // Draw trunk
    ctx.fillStyle = '#8B4513'; // Brown trunk
    const trunkWidth = width * 0.2;
    const trunkHeight = height * 0.3;
    ctx.fillRect(x - trunkWidth / 2, y - trunkHeight, trunkWidth, trunkHeight);
    
    // Draw foliage based on tree type
    ctx.fillStyle = color;
    
    if (subtype === 'pine') {
      // Pine tree - triangle shape
      ctx.beginPath();
      ctx.moveTo(x, y - height);
      ctx.lineTo(x - width / 2, y - trunkHeight);
      ctx.lineTo(x + width / 2, y - trunkHeight);
      ctx.closePath();
      ctx.fill();
    } else {
      // Oak tree - circular canopy
      ctx.beginPath();
      ctx.arc(x, y - trunkHeight - height * 0.3, width * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Update method for animated elements (clouds moving, etc.)
  update(deltaTime) {
    // Animate cloud positions slightly
    this.layers[0].elements.forEach(element => {
      if (element.type === 'cloud') {
        element.x += 0.01 * deltaTime; // Very slow cloud movement
        // Add subtle vertical bobbing
        element.bobOffset = (element.bobOffset || 0) + deltaTime * 0.0005;
        element.originalY = element.originalY || element.y;
        element.y = element.originalY + Math.sin(element.bobOffset) * 3;
        
        // Wrap clouds around
        if (element.x > this.levelWidth + 100) {
          element.x = -100;
        }
      }
    });
    
    // Add atmospheric particles (floating dust motes)
    this.updateAtmosphericEffects(deltaTime);
  }
  
  updateAtmosphericEffects(deltaTime) {
    // This could be expanded with floating particles, light rays, etc.
    // For now, we'll let the existing ParticleSystem handle environmental particles
  }

  // Resize handler
  resize(canvas) {
    this.canvas = canvas;
  }
}
