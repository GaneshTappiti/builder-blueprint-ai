export interface AITool {
  id: string;
  name: string;
  description: string;
  category: string;
  pricing: {
    model: 'free' | 'freemium' | 'paid';
    inr: string;
    usd?: string;
  };
  popularity: number;
  bestFor: string[];
  officialUrl: string;
  apiCompatible: boolean;
  features: string[];
}

export interface AIToolCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export const aiToolsCategories: AIToolCategory[] = [
  {
    id: 'app-builders',
    name: 'App Builders',
    icon: '🏗️',
    description: 'No-code and low-code app development platforms'
  },
  {
    id: 'ui-design',
    name: 'UI Design',
    icon: '🎨',
    description: 'Design tools and UI/UX platforms'
  },
  {
    id: 'ai-coding',
    name: 'AI Coding',
    icon: '💻',
    description: 'AI-powered coding assistants and IDEs'
  },
  {
    id: 'content-generation',
    name: 'Content Generation',
    icon: '✍️',
    description: 'AI content creation and writing tools'
  },
  {
    id: 'automation',
    name: 'Automation',
    icon: '⚡',
    description: 'Workflow automation and integration tools'
  }
];

export const aiToolsDatabase: AITool[] = [
  // App Builders
  {
    id: 'framer',
    name: 'Framer',
    description: 'Design and publish websites with AI-powered tools and responsive layouts',
    category: 'app-builders',
    pricing: { model: 'freemium', inr: '₹0-2,500/mo' },
    popularity: 92,
    bestFor: ['Responsive Design', 'Component Library', 'CMS Integration'],
    officialUrl: 'https://framer.com',
    apiCompatible: true,
    features: ['AI Design Assistant', 'Responsive Breakpoints', 'Component System']
  },
  {
    id: 'flutterflow',
    name: 'FlutterFlow',
    description: 'Build Flutter apps visually with drag-and-drop interface and Firebase integration',
    category: 'app-builders',
    pricing: { model: 'freemium', inr: '₹0-4,000/mo' },
    popularity: 88,
    bestFor: ['Cross Platform', 'Firebase Integration', 'Custom Code'],
    officialUrl: 'https://flutterflow.io',
    apiCompatible: true,
    features: ['Visual Builder', 'Firebase Integration', 'Custom Actions']
  },
  {
    id: 'uizard',
    name: 'Uizard',
    description: 'Transform wireframes and sketches into interactive prototypes using AI',
    category: 'app-builders',
    pricing: { model: 'freemium', inr: '₹0-3,000/mo' },
    popularity: 85,
    bestFor: ['Wireframe Scanning', 'Mobile First', 'Export Code'],
    officialUrl: 'https://uizard.io',
    apiCompatible: false,
    features: ['AI Wireframe Scanner', 'Design Assistant', 'Code Export']
  },
  {
    id: 'builderio',
    name: 'Builder.io',
    description: 'Headless CMS and visual development platform for modern web apps',
    category: 'app-builders',
    pricing: { model: 'freemium', inr: '₹0-8,000/mo' },
    popularity: 87,
    bestFor: ['Headless CMS', 'A/B Testing', 'Performance Optimization'],
    officialUrl: 'https://builder.io',
    apiCompatible: true,
    features: ['Visual Editor', 'A/B Testing', 'Performance Optimization']
  },
  {
    id: 'adalo',
    name: 'Adalo',
    description: 'Create native mobile apps without coding using drag-and-drop interface',
    category: 'app-builders',
    pricing: { model: 'freemium', inr: '₹0-4,500/mo' },
    popularity: 83,
    bestFor: ['Native Apps', 'Database', 'Push Notifications'],
    officialUrl: 'https://adalo.com',
    apiCompatible: true,
    features: ['Native App Builder', 'Database Management', 'Push Notifications']
  },
  {
    id: 'webflow',
    name: 'Webflow',
    description: 'Professional website builder with advanced design capabilities and CMS',
    category: 'app-builders',
    pricing: { model: 'freemium', inr: '₹0-3,500/mo' },
    popularity: 90,
    bestFor: ['Professional Websites', 'CMS', 'E-commerce'],
    officialUrl: 'https://webflow.com',
    apiCompatible: true,
    features: ['Advanced Design Tools', 'CMS', 'E-commerce Integration']
  },

  // UI Design Tools
  {
    id: 'figma',
    name: 'Figma',
    description: 'Collaborative design tool with AI-powered features for UI/UX design',
    category: 'ui-design',
    pricing: { model: 'freemium', inr: '₹0-1,200/mo' },
    popularity: 95,
    bestFor: ['Collaborative Design', 'Prototyping', 'Design Systems'],
    officialUrl: 'https://figma.com',
    apiCompatible: true,
    features: ['Real-time Collaboration', 'Prototyping', 'Design Systems']
  },
  {
    id: 'canva',
    name: 'Canva',
    description: 'AI-powered design platform for creating graphics, presentations, and more',
    category: 'ui-design',
    pricing: { model: 'freemium', inr: '₹0-1,000/mo' },
    popularity: 93,
    bestFor: ['Graphics Design', 'Templates', 'Brand Kit'],
    officialUrl: 'https://canva.com',
    apiCompatible: true,
    features: ['AI Design Assistant', 'Template Library', 'Brand Management']
  },

  // AI Coding Tools
  {
    id: 'cursor',
    name: 'Cursor',
    description: 'AI-powered code editor built for productivity with intelligent code completion',
    category: 'ai-coding',
    pricing: { model: 'freemium', inr: '₹0-1,600/mo' },
    popularity: 89,
    bestFor: ['Code Completion', 'AI Chat', 'Refactoring'],
    officialUrl: 'https://cursor.sh',
    apiCompatible: false,
    features: ['AI Code Completion', 'Chat with Codebase', 'Intelligent Refactoring']
  },
  {
    id: 'replit',
    name: 'Replit',
    description: 'Online IDE with AI coding assistant for collaborative development',
    category: 'ai-coding',
    pricing: { model: 'freemium', inr: '₹0-2,000/mo' },
    popularity: 86,
    bestFor: ['Online IDE', 'Collaboration', 'AI Assistant'],
    officialUrl: 'https://replit.com',
    apiCompatible: true,
    features: ['Cloud IDE', 'AI Coding Assistant', 'Real-time Collaboration']
  },

  // Free Tools
  {
    id: 'supabase',
    name: 'Supabase',
    description: 'Open source Firebase alternative with PostgreSQL database',
    category: 'app-builders',
    pricing: { model: 'free', inr: 'Free' },
    popularity: 88,
    bestFor: ['Database', 'Authentication', 'Real-time'],
    officialUrl: 'https://supabase.com',
    apiCompatible: true,
    features: ['PostgreSQL Database', 'Authentication', 'Real-time Subscriptions']
  },
  {
    id: 'firebase',
    name: 'Firebase',
    description: 'Google\'s platform for building mobile and web applications',
    category: 'app-builders',
    pricing: { model: 'free', inr: 'Free' },
    popularity: 91,
    bestFor: ['Backend Services', 'Real-time Database', 'Hosting'],
    officialUrl: 'https://firebase.google.com',
    apiCompatible: true,
    features: ['Real-time Database', 'Authentication', 'Cloud Functions']
  },
  {
    id: 'vercel',
    name: 'Vercel',
    description: 'Platform for frontend frameworks and static sites with edge functions',
    category: 'app-builders',
    pricing: { model: 'free', inr: 'Free' },
    popularity: 87,
    bestFor: ['Frontend Deployment', 'Edge Functions', 'Analytics'],
    officialUrl: 'https://vercel.com',
    apiCompatible: true,
    features: ['Edge Functions', 'Analytics', 'Preview Deployments']
  },
  {
    id: 'netlify',
    name: 'Netlify',
    description: 'Platform for deploying and hosting modern web projects',
    category: 'app-builders',
    pricing: { model: 'free', inr: 'Free' },
    popularity: 85,
    bestFor: ['Static Sites', 'Serverless Functions', 'Forms'],
    officialUrl: 'https://netlify.com',
    apiCompatible: true,
    features: ['Continuous Deployment', 'Serverless Functions', 'Form Handling']
  }
];
