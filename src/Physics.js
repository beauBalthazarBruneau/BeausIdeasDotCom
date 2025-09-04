import { Engine, Render, World, Bodies, Body, Events } from 'matter-js';

export class Physics {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.debugMode = options.debug || false;
    
    // Store bodies for collision detection (initialize first!)
    this.bodies = new Map();
    
    // Create engine
    this.engine = Engine.create();
    this.world = this.engine.world;
    
    // Configure engine
    this.engine.world.gravity.y = 0.8;
    this.engine.world.gravity.scale = 0.001;
    
    // Setup debug renderer if needed
    if (this.debugMode) {
      this.setupDebugRenderer();
    }
    
    // Ground platform for testing
    this.createGround();
  }

  setupDebugRenderer() {
    // Disabled for now to avoid recursive call issues
    console.log('Debug renderer would be created here');
  }

  createGround() {
    // Create ground platforms
    const ground1 = Bodies.rectangle(200, 550, 400, 60, { 
      isStatic: true,
      label: 'ground'
    });
    
    const ground2 = Bodies.rectangle(800, 450, 300, 60, { 
      isStatic: true,
      label: 'ground'
    });

    const ground3 = Bodies.rectangle(1200, 350, 400, 60, { 
      isStatic: true,
      label: 'ground'
    });

    // Add walls to prevent player from falling off world
    const leftWall = Bodies.rectangle(-50, 300, 100, 1000, { 
      isStatic: true,
      label: 'wall'
    });
    
    const rightWall = Bodies.rectangle(2050, 300, 100, 1000, { 
      isStatic: true,
      label: 'wall'
    });

    World.add(this.world, [ground1, ground2, ground3, leftWall, rightWall]);
    
    // Store platforms
    this.bodies.set('ground1', ground1);
    this.bodies.set('ground2', ground2);
    this.bodies.set('ground3', ground3);
    this.bodies.set('leftWall', leftWall);
    this.bodies.set('rightWall', rightWall);
  }

  addBody(id, body) {
    World.add(this.world, body);
    this.bodies.set(id, body);
    return body;
  }

  removeBody(id) {
    const body = this.bodies.get(id);
    if (body) {
      World.remove(this.world, body);
      this.bodies.delete(id);
    }
  }

  getBody(id) {
    return this.bodies.get(id);
  }

  update(delta) {
    Engine.update(this.engine, delta);
    
    if (this.debugMode && this.render) {
      Render.run(this.render);
    }
  }

  toggleDebug() {
    this.debugMode = !this.debugMode;
    
    if (this.debugMode && !this.render) {
      this.setupDebugRenderer();
    }
    
    if (this.render) {
      this.render.canvas.style.display = this.debugMode ? 'block' : 'none';
    }
  }

  // Setup collision events
  onCollisionStart(callback) {
    Events.on(this.engine, 'collisionStart', callback);
  }

  onCollisionEnd(callback) {
    Events.on(this.engine, 'collisionEnd', callback);
  }

  // Cleanup
  destroy() {
    if (this.render) {
      Render.stop(this.render);
    }
    Engine.clear(this.engine);
  }
}
