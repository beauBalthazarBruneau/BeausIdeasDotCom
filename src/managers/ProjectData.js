// Portfolio project data structure organized by worlds
// Each world contains projects that will be linked to checkpoints in the game

import portfolioData from '../data/projects.json' assert { type: 'json' };

// Flatten all projects from all worlds into a single array for backward compatibility
export const ProjectData = Object.values(portfolioData.worlds)
  .flatMap(world => 
    world.projects.map(project => ({
      ...project,
      world: world.id,
      worldName: world.name,
      worldThemeColor: world.theme_color
    }))
  );

// Export the worlds data structure
export const WorldsData = portfolioData.worlds;

// Utility functions for working with worlds
export class WorldManager {
  static getAllWorlds() {
    return WorldsData;
  }
  
  static getWorldById(id) {
    return WorldsData[id];
  }
  
  static getProjectsByWorld(worldId) {
    return ProjectData.filter(project => project.world === worldId);
  }
  
  static getAllWorldIds() {
    return Object.keys(WorldsData);
  }
  
  static getWorldThemeColor(worldId) {
    const world = this.getWorldById(worldId);
    return world ? world.theme_color : '#000000';
  }
}

// Utility functions for working with project data
export class ProjectManager {
  static getAllProjects() {
    return ProjectData;
  }
  
  static getProjectById(id) {
    return ProjectData.find(project => project.id === id);
  }
  
  // Note: category and status fields are not available in the simplified JSON structure
  // These methods are kept for backward compatibility but will return empty arrays
  static getProjectsByCategory(category) {
    console.warn('getProjectsByCategory: category field not available in simplified project data');
    return [];
  }
  
  static getProjectsByStatus(status) {
    console.warn('getProjectsByStatus: status field not available in simplified project data');
    return [];
  }
  
  static getProjectPosition(id) {
    const project = this.getProjectById(id);
    return project ? project.position : null;
  }
  
  static getProjectsForCheckpoints() {
    // Return projects formatted for checkpoint creation
    return ProjectData.map(project => ({
      id: project.id,
      title: project.title,
      subtitle: project.subtitle,
      description: project.description,
      image: project.image,
      collectible: project.collectible,
      world: project.world,
      position: project.position
    }));
  }
}

// Checkpoint state management
export class CheckpointStateManager {
  constructor() {
    this.states = new Map();
    this.loadFromLocalStorage();
  }
  
  // Get the state of a checkpoint
  getState(checkpointId) {
    return this.states.get(checkpointId) || 'inactive';
  }
  
  // Set the state of a checkpoint
  setState(checkpointId, state) {
    if (['inactive', 'active', 'completed'].includes(state)) {
      this.states.set(checkpointId, state);
      this.saveToLocalStorage();
    }
  }
  
  // Check if a checkpoint is in a specific state
  isState(checkpointId, state) {
    return this.getState(checkpointId) === state;
  }
  
  // Get all checkpoints in a specific state
  getCheckpointsByState(state) {
    const result = [];
    this.states.forEach((checkpointState, id) => {
      if (checkpointState === state) {
        result.push(id);
      }
    });
    return result;
  }
  
  // Get completion statistics
  getStats() {
    const inactive = this.getCheckpointsByState('inactive').length;
    const active = this.getCheckpointsByState('active').length;
    const completed = this.getCheckpointsByState('completed').length;
    const total = ProjectData.length;
    
    return {
      inactive,
      active,
      completed,
      total,
      completionPercentage: total > 0 ? (completed / total) * 100 : 0
    };
  }
  
  // Reset all checkpoint states
  resetAll() {
    this.states.clear();
    this.saveToLocalStorage();
  }
  
  // Save state to localStorage for persistence
  saveToLocalStorage() {
    try {
      const stateData = Object.fromEntries(this.states);
      localStorage.setItem('portfolioCheckpointStates', JSON.stringify(stateData));
    } catch (error) {
      console.warn('Failed to save checkpoint states to localStorage:', error);
    }
  }
  
  // Load state from localStorage
  loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem('portfolioCheckpointStates');
      if (saved) {
        const stateData = JSON.parse(saved);
        this.states = new Map(Object.entries(stateData));
      }
    } catch (error) {
      console.warn('Failed to load checkpoint states from localStorage:', error);
      this.states = new Map();
    }
  }
}
