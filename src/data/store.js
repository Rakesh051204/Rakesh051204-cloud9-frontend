// Mock data for Stoic app
// Icon names correspond to react-icons imports
export const connectors = [
  {
    id: 'gmail',
    name: 'Gmail',
    icon: 'SiGmail',
    desc: 'Draft replies, search your inbox, and summarize email threads instantly',
    installed: true,
    color: '#EA4335'
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: 'FaGithub',
    desc: 'Manage repositories, track code changes, and collaborate on team projects',
    installed: false,
    color: '#FFFFFF'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: 'FaInstagram',
    desc: 'Generate and publish Posts, Stories, or Reels to Instagram',
    installed: false,
    color: '#E4405F'
  },
  {
    id: 'googledrive',
    name: 'Google Drive',
    icon: 'SiGoogledrive',   // Fixed: lowercase 'd' for drive
    desc: 'Access your files, search instantly, and let Stoic help you manage documents',
    installed: true,
    color: '#4285F4'
  },
  {
    id: 'metaads',
    name: 'Meta Ads Manager',
    icon: 'SiMeta',
    desc: 'Automate ads insights and optimization to save hours and maximize profits',
    installed: false,
    color: '#0668E1'
  }
];

export const skills = [
  { id: '1', name: 'github-gem-seeker', desc: 'Search GitHub for battle-tested solutions instead of reinventing the wheel.' },
  { id: '2', name: 'html-video-production', desc: 'Produce editable, scene-based HTML video projects (built on HyperFrames).' },
  { id: '3', name: 'excel-generator', desc: 'Professional Excel spreadsheet creation with a focus on aesthetics and data analysis.' },
  { id: '4', name: 'seo-audit', desc: 'Create plain-language, evidence-led SEO audit reports.' },
  { id: '5', name: 'internet-skill-finder', desc: 'Search and recommend Agent Skills from verified GitHub repositories.' }
];

export const dataSources = [
  { id: 'similarweb', name: 'Similarweb' },
  { id: 'worldbank', name: 'World Bank DataBank' }
];

export const scheduledTasks = [
  { id: '1', title: 'Daily email summary', desc: 'Get a daily summary on what\'s in your inbox and schedule before starting your day', icon: 'Mail' },
  { id: '2', title: 'Monitor competitor pricing', desc: 'Set up automated monitoring for any topic, competitor, or keyword.', icon: 'Bell' },
  { id: '3', title: 'Weekly SEO report', desc: 'Turn manual processes into scheduled automated pipelines.', icon: 'Repeat' }
];

export const libraryItems = [
  { id: '1', title: 'Manus Design Language Guide', desc: 'The "Manus Style" is a modern, high-end UI aesthetic that blends Glassmorphism, Dark Mode, and Fluid Interactions.', icon: 'Book', date: 'Tuesday' },
  { id: '2', title: 'Manus UI Design System Demo', desc: 'A modern UI design system that helps you build beautiful, intuitive, and engaging experiences.', icon: 'FileText', date: 'Monday' },
  { id: '3', title: 'Manus UI Template.html', desc: '<!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8"> <title>Manus Style UI</title> </head>', icon: 'FileText', date: 'Sunday' },
  { id: '4', title: 'How to Build an App with Manus Style UI Fonts', desc: 'Complete guide to implementing Manus design system fonts in your application.', icon: 'FolderOpen', date: 'Saturday' }
];

export const agentFeatures = [
  { id: '1', title: 'Brand-consistent AI identity', desc: 'Trained on your workflows, integrated with your tools.', icon: 'Zap' },
  { id: '2', title: 'Persistent memory & computer', desc: '24/7 cloud assistant that keeps full context and memory.', icon: 'Cpu' },
  { id: '3', title: 'Custom skills', desc: 'Equip your assistant with expert knowledge in specific areas.', icon: 'Sparkles' },
  { id: '4', title: 'Works in your messenger', desc: 'Available on Telegram, Line, and Slack. More coming soon.', icon: 'MessageCircle' }
];