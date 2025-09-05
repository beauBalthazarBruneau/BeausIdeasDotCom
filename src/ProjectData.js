// Portfolio project data structure
// Each project will be linked to a checkpoint in the game world

export const ProjectData = [
  {
    id: 'slack-bot',
    title: 'Slack Bot',
    shortTitle: 'Slack Bot',
    description: 'An intelligent Slack bot for team productivity and automation.',
    fullDescription: `An intelligent Slack bot designed to enhance team productivity through automation and smart integrations.
    
Key features:
- Automated task management and reminders
- Integration with popular development tools
- Custom slash commands and interactive components
- Team analytics and reporting
- Smart notification management

Built with Node.js and the Slack API to provide seamless team collaboration enhancement.`,
    techStack: ['Node.js', 'Slack API', 'MongoDB', 'Express', 'JavaScript'],
    category: 'Automation',
    status: 'Completed',
    demoUrl: 'https://slack-bot.example.com',
    githubUrl: 'https://github.com/username/slack-bot',
    images: [
      '/images/projects/slack-bot/hero.jpg',
      '/images/projects/slack-bot/commands.jpg',
      '/images/projects/slack-bot/dashboard.jpg'
    ],
    features: [
      'Custom slash commands',
      'Automated workflow triggers',
      'Team productivity analytics',
      'Integration with development tools',
      'Smart notification system'
    ],
    challenges: [
      'Handling Slack API rate limits',
      'Creating intuitive command interfaces',
      'Managing persistent bot state'
    ],
    learnings: [
      'Slack API integration patterns',
      'Bot conversation design',
      'Webhook and event handling'
    ],
    position: { x: 280, y: 430 }
  },
  
  {
    id: 'movie-party',
    title: 'Movie Party',
    shortTitle: 'Movie Party',
    description: 'A social movie-watching platform for synchronized viewing experiences.',
    fullDescription: `A social platform that enables friends to watch movies together remotely with perfect synchronization.

Core features:
- Synchronized video playback across devices
- Real-time chat during movies
- Room creation and invitation system
- Support for multiple video sources
- User profiles and watch history
- Mobile and desktop compatibility

Built with modern web technologies to create seamless shared viewing experiences.`,
    techStack: ['React', 'WebRTC', 'Socket.io', 'Node.js', 'Express', 'MongoDB'],
    category: 'Social Platform',
    status: 'Completed',
    demoUrl: 'https://movieparty.example.com',
    githubUrl: 'https://github.com/username/movie-party',
    images: [
      '/images/projects/movie-party/room.jpg',
      '/images/projects/movie-party/chat.jpg',
      '/images/projects/movie-party/mobile.jpg'
    ],
    features: [
      'Synchronized video playback',
      'Real-time messaging system',
      'Private room creation',
      'Cross-platform compatibility',
      'User authentication'
    ],
    challenges: [
      'Achieving perfect video synchronization',
      'Handling network latency variations',
      'Managing concurrent user sessions'
    ],
    learnings: [
      'WebRTC for real-time communication',
      'Socket.io for event synchronization',
      'Media streaming optimization'
    ],
    position: { x: 380, y: 430 }
  },
  
  {
    id: 'goofy-atl-skate',
    title: 'GOOFY ATL Skate App',
    shortTitle: 'GOOFY ATL',
    description: 'A mobile app for the Atlanta skateboarding community.',
    fullDescription: `A mobile application connecting the Atlanta skateboarding community with local spots, events, and fellow skaters.

Community features:
- Interactive map of skate spots
- Event creation and discovery
- Photo and video sharing
- Skater profiles and connections
- Spot reviews and ratings
- Push notifications for events

Built with React Native to serve both iOS and Android users in the Atlanta skateboarding scene.`,
    techStack: ['React Native', 'Firebase', 'Google Maps API', 'Redux', 'Expo'],
    category: 'Mobile Community',
    status: 'Completed',
    demoUrl: 'https://goofyatl.example.com',
    githubUrl: 'https://github.com/username/goofy-atl-skate',
    images: [
      '/images/projects/goofy-atl/map.jpg',
      '/images/projects/goofy-atl/spots.jpg',
      '/images/projects/goofy-atl/community.jpg'
    ],
    features: [
      'Interactive skate spot mapping',
      'Community event system',
      'Photo and video sharing',
      'User profiles and connections',
      'Real-time notifications'
    ],
    challenges: [
      'Integrating Google Maps effectively',
      'Managing user-generated content',
      'Optimizing for mobile performance'
    ],
    learnings: [
      'React Native development',
      'Google Maps API integration',
      'Firebase real-time features'
    ],
    position: { x: 480, y: 430 }
  },
  
  {
    id: 'laymens-lab',
    title: "Laymen's Lab",
    shortTitle: "Laymen's Lab",
    description: 'Educational platform making complex topics accessible to everyone.',
    fullDescription: `An educational platform designed to break down complex topics into digestible, easy-to-understand content for everyone.

Educational features:
- Interactive learning modules
- Visual explanations and animations
- Progress tracking and achievements
- Community discussion forums
- Expert-reviewed content
- Multilingual support

Built to democratize education and make learning accessible regardless of background or experience level.`,
    techStack: ['Vue.js', 'Python', 'Django', 'PostgreSQL', 'D3.js', 'WebRTC'],
    category: 'Education',
    status: 'In Progress',
    demoUrl: 'https://laymenslab.example.com',
    githubUrl: 'https://github.com/username/laymens-lab',
    images: [
      '/images/projects/laymens-lab/course.jpg',
      '/images/projects/laymens-lab/interactive.jpg',
      '/images/projects/laymens-lab/community.jpg'
    ],
    features: [
      'Interactive course modules',
      'Visual learning tools',
      'Progress tracking system',
      'Community discussions',
      'Expert content curation'
    ],
    challenges: [
      'Simplifying complex concepts',
      'Creating engaging interactions',
      'Building scalable content management'
    ],
    learnings: [
      'Educational UX design principles',
      'Vue.js advanced patterns',
      'Django content management'
    ],
    position: { x: 580, y: 430 }
  },
  
  {
    id: 'clinical-trial-tech',
    title: 'Clinical Trial Tech Landscape',
    shortTitle: 'Clinical Tech',
    description: 'Interactive visualization of the clinical trial technology ecosystem.',
    fullDescription: `An interactive platform mapping the complex landscape of clinical trial technologies and their relationships.

Visualization features:
- Interactive network diagrams
- Company and technology profiles
- Market trend analysis
- Investment tracking
- Regulatory compliance mapping
- API for data integration

Designed to help professionals navigate the complex clinical trial technology ecosystem.`,
    techStack: ['D3.js', 'React', 'Python', 'FastAPI', 'PostgreSQL', 'WebSocket'],
    category: 'Data Visualization',
    status: 'Completed',
    demoUrl: 'https://clinicaltech.example.com',
    githubUrl: 'https://github.com/username/clinical-trial-tech',
    images: [
      '/images/projects/clinical-tech/network.jpg',
      '/images/projects/clinical-tech/profiles.jpg',
      '/images/projects/clinical-tech/trends.jpg'
    ],
    features: [
      'Interactive network visualization',
      'Comprehensive company profiles',
      'Market analysis tools',
      'Real-time data updates',
      'Export and sharing capabilities'
    ],
    challenges: [
      'Visualizing complex relationships',
      'Managing large datasets efficiently',
      'Creating intuitive navigation'
    ],
    learnings: [
      'Advanced D3.js techniques',
      'Graph theory applications',
      'Healthcare industry insights'
    ],
    position: { x: 680, y: 430 }
  },
  
  {
    id: 'sacco',
    title: 'Sacco',
    shortTitle: 'Sacco',
    description: 'A financial management platform for savings and credit cooperatives.',
    fullDescription: `A comprehensive financial management platform designed specifically for savings and credit cooperatives (SACCOs).

Financial features:
- Member account management
- Loan processing and tracking
- Savings account administration
- Financial reporting and analytics
- Mobile banking integration
- Regulatory compliance tools

Built to modernize and streamline SACCO operations while maintaining security and regulatory compliance.`,
    techStack: ['React', 'Node.js', 'PostgreSQL', 'Stripe', 'JWT', 'Docker'],
    category: 'FinTech',
    status: 'Completed',
    demoUrl: 'https://sacco.example.com',
    githubUrl: 'https://github.com/username/sacco',
    images: [
      '/images/projects/sacco/dashboard.jpg',
      '/images/projects/sacco/members.jpg',
      '/images/projects/sacco/reports.jpg'
    ],
    features: [
      'Comprehensive member management',
      'Automated loan processing',
      'Financial reporting suite',
      'Mobile banking integration',
      'Regulatory compliance tools'
    ],
    challenges: [
      'Ensuring financial data security',
      'Meeting regulatory requirements',
      'Building scalable architecture'
    ],
    learnings: [
      'Financial systems architecture',
      'Security best practices',
      'Compliance and audit trails'
    ],
    position: { x: 780, y: 430 }
  }
];

// Utility functions for working with project data
export class ProjectManager {
  static getAllProjects() {
    return ProjectData;
  }
  
  static getProjectById(id) {
    return ProjectData.find(project => project.id === id);
  }
  
  static getProjectsByCategory(category) {
    return ProjectData.filter(project => project.category === category);
  }
  
  static getProjectsByStatus(status) {
    return ProjectData.filter(project => project.status === status);
  }
  
  static getProjectPosition(id) {
    const project = this.getProjectById(id);
    return project ? project.position : null;
  }
  
  static getProjectsForCheckpoints() {
    // Return projects formatted for checkpoint creation
    return ProjectData.map(project => ({
      id: project.id,
      title: project.shortTitle || project.title,
      fullTitle: project.title,
      description: project.description,
      position: project.position,
      category: project.category,
      status: project.status,
      techStack: project.techStack,
      urls: {
        demo: project.demoUrl,
        github: project.githubUrl
      }
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
