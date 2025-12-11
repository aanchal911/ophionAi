
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  WEEKLY = 'WEEKLY',
  PROJECTS = 'PROJECTS',
  CHAT = 'CHAT',
  ANALYTICS = 'ANALYTICS',
  SETTINGS = 'SETTINGS',
  WRAPPED = 'WRAPPED'
}

export enum ThemeType {
  STATIC = 'STATIC',
  LIVE = 'LIVE'
}

export enum ThemeId {
  // Static
  OLYMPUS = 'OLYMPUS',
  MIDNIGHT = 'MIDNIGHT',
  ZEN = 'ZEN',
  MINIMAL = 'MINIMAL',
  OCEAN = 'OCEAN',
  
  // Live
  NEON_VIBE = 'NEON_VIBE',
  STRANGER = 'STRANGER',
  BATMAN = 'BATMAN',
  ANIME = 'ANIME',
  CYBER = 'CYBER',
  
  // New Themes
  SYNTHWAVE = 'SYNTHWAVE',
  WIZARD = 'WIZARD',
  HYPERSPACE = 'HYPERSPACE',
  STEAMPUNK = 'STEAMPUNK',
  GOTHIC = 'GOTHIC',
  FAIRYTALE = 'FAIRYTALE'
}

export enum StickyNoteSkin {
  CLASSIC = 'CLASSIC',
  HOLOGRAPHIC = 'HOLOGRAPHIC',
  CYBERPUNK = 'CYBERPUNK',
  MINIMAL = 'MINIMAL',
  GLASS = 'GLASS'
}

export interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export interface Theme {
  id: ThemeId;
  type: ThemeType;
  name: string;
  bgClass: string;
  cardClass: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  buttonClass: string;
  borderClass: string;
}

export interface Member {
  id: string;
  name: string;
  role: 'Owner' | 'Manager' | 'Contributor';
  avatar: string; // Initials or URL
}

export interface Project {
  id: string;
  title: string;
  type: 'Personal' | 'Group';
  description: string;
  members: Member[];
  status: 'Active' | 'Completed' | 'On Hold';
  progress: number;
  dueDate: string;
}

export interface Task {
  id: string;
  userId?: string;
  title: string;
  completed: boolean;
  category: 'Work' | 'Personal' | 'Health' | 'Growth';
  priority: 'High' | 'Medium' | 'Low';
  dueDate: string;
  projectId?: string;
  assignedTo?: string; // Member ID
  
  // Timer fields
  timeSpent?: number; // In seconds
  isTimerRunning?: boolean;

  // Weekly Planner fields
  startTime?: string; // e.g. "14:00"
  duration?: number; // in minutes
  day?: string; // e.g. "Monday"
}

export interface Note {
  id: string;
  userId?: string;
  content: string;
  color: string; // Tailwind class for bg
  skin: StickyNoteSkin;
  isPinned: boolean;
  isCompleted?: boolean;
  priority?: 'High' | 'Medium' | 'Low';
  date: string;
  x: number; 
  y: number; 
  rotation?: number; 
  width: number;
  height: number;
  opacity?: number; // 0.1 to 1.0
}

export interface CategoryStat {
  name: string;
  value: number;
  color: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface AnalyticsData {
  name: string; // Day name (e.g., "Mon")
  date: string; // Date string (e.g. "12.11")
  productivity: number; // 0-100
  focus: number; // 0-100
  stress: number; // 0-100
  tasksCompleted: number;
  tasksPending: number;
}

export interface WrappedData {
    identity: { archetype: string; quote: string; description: string };
    timeStats: { peakHour: string; bestDay: string; comment: string };
    categoryStats: { topCategory: string; completionRate: number; comment: string };
    streaks: { longestStreak: number; type: string; comment: string };
    projectStats: { highlightProject: string; role: string; comment: string };
    growth: string[];
    achievements: string[];
    movie: { title: string; genre: string; description: string };
    predictions: string[];
    final: { title: string; quote: string };
}
