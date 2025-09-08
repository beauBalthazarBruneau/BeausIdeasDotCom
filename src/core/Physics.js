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
  }

  setupDebugRenderer() {
    // Disabled for now to avoid recursive call issues
    console.log('Debug renderer would be created here');
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
