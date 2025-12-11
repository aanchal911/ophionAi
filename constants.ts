
import { Theme, ThemeId, ThemeType, Task, AnalyticsData, CategoryStat, Note, StickyNoteSkin, Project, Member } from './types';
import { LayoutDashboard, MessageSquare, PieChart, Settings, Briefcase, CalendarClock } from 'lucide-react';

export const THEMES: Record<ThemeId, Theme> = {
  // === STATIC THEMES ===
  [ThemeId.OLYMPUS]: {
    id: ThemeId.OLYMPUS,
    type: ThemeType.STATIC,
    name: 'Olympus (Light)',
    bgClass: 'bg-slate-50',
    cardClass: 'bg-white/80 backdrop-blur-md shadow-lg border-slate-200',
    textPrimary: 'text-slate-800',
    textSecondary: 'text-slate-500',
    accent: 'text-amber-600',
    buttonClass: 'bg-slate-900 text-white hover:bg-slate-800',
    borderClass: 'border-slate-200'
  },
  [ThemeId.MIDNIGHT]: {
    id: ThemeId.MIDNIGHT,
    type: ThemeType.STATIC,
    name: 'Abyss (Dark)',
    bgClass: 'bg-black',
    cardClass: 'bg-zinc-900/90 border-zinc-800',
    textPrimary: 'text-zinc-100',
    textSecondary: 'text-zinc-400',
    accent: 'text-blue-500',
    buttonClass: 'bg-zinc-100 text-black hover:bg-zinc-300',
    borderClass: 'border-zinc-800'
  },
  [ThemeId.ZEN]: {
    id: ThemeId.ZEN,
    type: ThemeType.STATIC,
    name: 'Forest (Nature)',
    bgClass: 'bg-[#f4f7f2]',
    cardClass: 'bg-white/90 shadow-sm border-[#e0e7db]',
    textPrimary: 'text--[#2c3e28]',
    textSecondary: 'text-[#5c6e58]',
    accent: 'text-emerald-600',
    buttonClass: 'bg-[#2c3e28] text-white hover:bg-[#3a5235]',
    borderClass: 'border-[#e0e7db]'
  },
  [ThemeId.MINIMAL]: {
    id: ThemeId.MINIMAL,
    type: ThemeType.STATIC,
    name: 'Minimal White',
    bgClass: 'bg-white',
    cardClass: 'bg-white border-gray-100 shadow-sm',
    textPrimary: 'text-gray-900',
    textSecondary: 'text-gray-400',
    accent: 'text-black',
    buttonClass: 'bg-black text-white hover:opacity-80',
    borderClass: 'border-gray-100'
  },
  [ThemeId.OCEAN]: {
    id: ThemeId.OCEAN,
    type: ThemeType.STATIC,
    name: 'Ocean Blue',
    bgClass: 'bg-gradient-to-br from-cyan-50 to-blue-100',
    cardClass: 'bg-white/60 backdrop-blur-md border-blue-100 shadow-sm',
    textPrimary: 'text-slate-700',
    textSecondary: 'text-slate-400',
    accent: 'text-cyan-600',
    buttonClass: 'bg-cyan-600 text-white hover:bg-cyan-700',
    borderClass: 'border-blue-100'
  },

  // === LIVE THEMES ===
  [ThemeId.NEON_VIBE]: {
    id: ThemeId.NEON_VIBE,
    type: ThemeType.LIVE,
    name: 'Retrowave (Neon)',
    bgClass: 'bg-slate-900', 
    cardClass: 'bg-slate-900/40 backdrop-blur-xl border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]',
    textPrimary: 'text-white',
    textSecondary: 'text-purple-200/70',
    accent: 'text-pink-500',
    buttonClass: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90',
    borderClass: 'border-purple-500/30'
  },
  [ThemeId.STRANGER]: {
    id: ThemeId.STRANGER,
    type: ThemeType.LIVE,
    name: 'Stranger Things',
    bgClass: 'bg-[#0a0505]',
    cardClass: 'bg-black/60 backdrop-blur-sm border-red-900/30 shadow-[0_0_20px_rgba(220,38,38,0.1)]',
    textPrimary: 'text-red-50',
    textSecondary: 'text-red-300/50',
    accent: 'text-red-600',
    buttonClass: 'bg-red-900/80 text-white hover:bg-red-800 border border-red-700',
    borderClass: 'border-red-900/30'
  },
  [ThemeId.BATMAN]: {
    id: ThemeId.BATMAN,
    type: ThemeType.LIVE,
    name: 'Gotham City',
    bgClass: 'bg-black',
    cardClass: 'bg-gray-900/80 backdrop-blur-md border-gray-700/50',
    textPrimary: 'text-gray-200',
    textSecondary: 'text-gray-500',
    accent: 'text-yellow-500',
    buttonClass: 'bg-gray-800 text-yellow-500 border border-yellow-500/20 hover:bg-gray-700',
    borderClass: 'border-gray-700/50'
  },
  [ThemeId.ANIME]: {
    id: ThemeId.ANIME,
    type: ThemeType.LIVE,
    name: 'Anime Sunset',
    bgClass: 'bg-indigo-900',
    cardClass: 'bg-white/10 backdrop-blur-lg border-white/20',
    textPrimary: 'text-white',
    textSecondary: 'text-pink-200',
    accent: 'text-pink-400',
    buttonClass: 'bg-pink-500 text-white hover:bg-pink-600',
    borderClass: 'border-white/20'
  },
  [ThemeId.CYBER]: {
    id: ThemeId.CYBER,
    type: ThemeType.LIVE,
    name: 'Cyber Drift',
    bgClass: 'bg-[#000510]',
    cardClass: 'bg-[#001020]/80 backdrop-blur border-cyan-500/30',
    textPrimary: 'text-cyan-50',
    textSecondary: 'text-cyan-300/50',
    accent: 'text-cyan-400',
    buttonClass: 'bg-cyan-600/20 text-cyan-300 border border-cyan-500 hover:bg-cyan-600/40',
    borderClass: 'border-cyan-500/30'
  },
  [ThemeId.SYNTHWAVE]: {
    id: ThemeId.SYNTHWAVE,
    type: ThemeType.LIVE,
    name: 'Synthwave 84',
    bgClass: 'bg-[#1a0b2e]',
    cardClass: 'bg-[#2d1b4e]/80 backdrop-blur-md border-fuchsia-500/30 shadow-[0_0_20px_rgba(217,70,239,0.1)]',
    textPrimary: 'text-fuchsia-50',
    textSecondary: 'text-fuchsia-300/60',
    accent: 'text-cyan-400',
    buttonClass: 'bg-gradient-to-r from-fuchsia-600 to-cyan-600 text-white hover:brightness-110',
    borderClass: 'border-fuchsia-500/30'
  },
  [ThemeId.WIZARD]: {
    id: ThemeId.WIZARD,
    type: ThemeType.LIVE,
    name: "Wizard's Study",
    bgClass: 'bg-[#1c110a]',
    cardClass: 'bg-[#1c110a]/80 backdrop-blur-sm border-amber-900/50',
    textPrimary: 'text-amber-100',
    textSecondary: 'text-amber-300/50',
    accent: 'text-amber-500',
    buttonClass: 'bg-[#3e2723] text-amber-200 border border-amber-800 hover:bg-[#4e342e]',
    borderClass: 'border-amber-900/50'
  },
  [ThemeId.HYPERSPACE]: {
    id: ThemeId.HYPERSPACE,
    type: ThemeType.LIVE,
    name: 'Hyperspace',
    bgClass: 'bg-black',
    cardClass: 'bg-slate-900/90 backdrop-blur-md border-blue-900/50',
    textPrimary: 'text-slate-100',
    textSecondary: 'text-slate-400',
    accent: 'text-blue-400',
    buttonClass: 'bg-blue-900/50 text-blue-100 border border-blue-500/30 hover:bg-blue-800/50',
    borderClass: 'border-blue-900/50'
  },
  [ThemeId.STEAMPUNK]: {
    id: ThemeId.STEAMPUNK,
    type: ThemeType.LIVE,
    name: 'Steampunk',
    bgClass: 'bg-[#1a1613]',
    cardClass: 'bg-[#2c241b]/90 backdrop-blur-sm border-amber-700/40',
    textPrimary: 'text-[#e6d5ac]', // Antique white
    textSecondary: 'text-[#8c7853]', // Bronze
    accent: 'text-[#ff9800]', // Amber
    buttonClass: 'bg-gradient-to-b from-[#5d4037] to-[#3e2723] text-[#e6d5ac] border border-[#8d6e63] hover:brightness-110',
    borderClass: 'border-amber-700/40'
  },
  [ThemeId.GOTHIC]: {
    id: ThemeId.GOTHIC,
    type: ThemeType.LIVE,
    name: 'Gothic Castle',
    bgClass: 'bg-[#0f1115]',
    cardClass: 'bg-[#1a1d23]/85 backdrop-blur-md border-slate-700/50',
    textPrimary: 'text-slate-200',
    textSecondary: 'text-slate-500',
    accent: 'text-red-700',
    buttonClass: 'bg-slate-800 text-slate-200 border border-slate-600 hover:bg-slate-700',
    borderClass: 'border-slate-700/50'
  },
  [ThemeId.FAIRYTALE]: {
    id: ThemeId.FAIRYTALE,
    type: ThemeType.LIVE,
    name: 'Fairytale',
    bgClass: 'bg-pink-50',
    cardClass: 'bg-white/40 backdrop-blur-lg border-white/60 shadow-[0_4px_30px_rgba(0,0,0,0.1)]',
    textPrimary: 'text-slate-800',
    textSecondary: 'text-purple-700/60',
    accent: 'text-pink-500',
    buttonClass: 'bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-lg shadow-pink-500/20 hover:scale-105',
    borderClass: 'border-white/60'
  }
};

export const MOCK_MEMBERS: Member[] = [
    { id: 'm1', name: 'You', role: 'Owner', avatar: 'ME' },
    { id: 'm2', name: 'Sarah J.', role: 'Contributor', avatar: 'SJ' },
    { id: 'm3', name: 'Mike R.', role: 'Manager', avatar: 'MR' },
    { id: 'm4', name: 'Alex T.', role: 'Contributor', avatar: 'AT' }
];

export const MOCK_PROJECTS: Project[] = [
    {
        id: 'p1',
        title: 'Website Redesign',
        type: 'Group',
        description: 'Overhaul the main landing page with new branding.',
        members: [MOCK_MEMBERS[0], MOCK_MEMBERS[1], MOCK_MEMBERS[2]],
        status: 'Active',
        progress: 65,
        dueDate: '2023-12-01'
    },
    {
        id: 'p2',
        title: 'Learn Guitar',
        type: 'Personal',
        description: 'Master 5 songs by end of year.',
        members: [MOCK_MEMBERS[0]],
        status: 'Active',
        progress: 30,
        dueDate: '2023-12-31'
    },
    {
        id: 'p3',
        title: 'Q4 Marketing Push',
        type: 'Group',
        description: 'Social media campaign for holiday season.',
        members: [MOCK_MEMBERS[0], MOCK_MEMBERS[3]],
        status: 'On Hold',
        progress: 10,
        dueDate: '2023-11-20'
    }
];

// Combine Dashboard and Weekly tasks for mock data
export const MOCK_TASKS: Task[] = [
  // Dashboard Tasks
  { id: '1', title: 'Complete Quarterly Report', completed: false, category: 'Work', priority: 'High', dueDate: 'Today', projectId: 'p3', assignedTo: 'm1', timeSpent: 0, isTimerRunning: false },
  { id: '2', title: 'Meditation Session (15m)', completed: true, category: 'Health', priority: 'Medium', dueDate: 'Today', projectId: 'p2', assignedTo: 'm1', timeSpent: 900, isTimerRunning: false },
  { id: '3', title: 'Read "Atomic Habits" Ch. 4', completed: false, category: 'Growth', priority: 'Low', dueDate: 'Tomorrow', projectId: 'p2', assignedTo: 'm1', timeSpent: 300, isTimerRunning: false },
  { id: '4', title: 'Review Weekly Goals', completed: false, category: 'Work', priority: 'High', dueDate: 'Fri', projectId: 'p1', assignedTo: 'm3', timeSpent: 0, isTimerRunning: false },
  { id: '5', title: 'Gym Workout', completed: true, category: 'Health', priority: 'High', dueDate: 'Yesterday', assignedTo: 'm1', timeSpent: 3600, isTimerRunning: false },
  
  // Weekly Planner Mock Data (Scheduled)
  { id: 'w1', title: 'Morning Standup', completed: false, category: 'Work', priority: 'High', dueDate: 'Mon', startTime: '09:00', duration: 30, day: 'Mon', timeSpent: 0, isTimerRunning: false },
  { id: 'w2', title: 'Deep Work: Coding', completed: false, category: 'Work', priority: 'High', dueDate: 'Mon', startTime: '10:00', duration: 120, day: 'Mon', timeSpent: 0, isTimerRunning: false },
  { id: 'w3', title: 'Lunch Break', completed: false, category: 'Health', priority: 'Low', dueDate: 'Mon', startTime: '13:00', duration: 60, day: 'Mon', timeSpent: 0, isTimerRunning: false },
  { id: 'w4', title: 'Client Meeting', completed: false, category: 'Work', priority: 'Medium', dueDate: 'Tue', startTime: '14:00', duration: 60, day: 'Tue', timeSpent: 0, isTimerRunning: false },
  { id: 'w5', title: 'Yoga Class', completed: false, category: 'Health', priority: 'Medium', dueDate: 'Wed', startTime: '18:00', duration: 60, day: 'Wed', timeSpent: 0, isTimerRunning: false },
];

export const MOCK_NOTES: Note[] = [
  { 
    id: 'n1', 
    content: 'Remember to drink water! 💧', 
    color: 'bg-blue-100', 
    skin: StickyNoteSkin.CLASSIC,
    isPinned: true, 
    date: '10:00 AM', 
    x: 50, 
    y: 50, 
    width: 200, 
    height: 180, 
    rotation: -2,
    priority: 'High',
    opacity: 1
  },
  { 
    id: 'n2', 
    content: 'Meeting ideas: 1. AI Sync 2. Cloud storage', 
    color: 'bg-yellow-100', 
    skin: StickyNoteSkin.CLASSIC,
    isPinned: false, 
    date: 'Yesterday', 
    x: 300, 
    y: 100, 
    width: 250, 
    height: 200, 
    rotation: 3,
    priority: 'Medium',
    opacity: 1
  },
  { 
    id: 'n3', 
    content: 'Grocery list: Milk, Eggs, Bread', 
    color: 'bg-pink-100', 
    skin: StickyNoteSkin.HOLOGRAPHIC,
    isPinned: false, 
    date: 'Mon', 
    x: 150, 
    y: 300, 
    width: 220, 
    height: 220, 
    rotation: -1,
    priority: 'Low',
    opacity: 0.9
  }
];

export const MOCK_ANALYTICS: AnalyticsData[] = [
  { name: 'Mon', date: '04.11', productivity: 65, focus: 40, stress: 30, tasksCompleted: 4, tasksPending: 2 },
  { name: 'Tue', date: '05.11', productivity: 75, focus: 60, stress: 45, tasksCompleted: 6, tasksPending: 1 },
  { name: 'Wed', date: '06.11', productivity: 85, focus: 80, stress: 20, tasksCompleted: 5, tasksPending: 3 },
  { name: 'Thu', date: '07.11', productivity: 70, focus: 65, stress: 50, tasksCompleted: 2, tasksPending: 4 },
  { name: 'Fri', date: '08.11', productivity: 90, focus: 85, stress: 15, tasksCompleted: 7, tasksPending: 0 },
  { name: 'Sat', date: '09.11', productivity: 40, focus: 30, stress: 10, tasksCompleted: 3, tasksPending: 1 },
  { name: 'Sun', date: '10.11', productivity: 50, focus: 40, stress: 10, tasksCompleted: 4, tasksPending: 0 },
];

export const MOCK_CATEGORY_STATS: CategoryStat[] = [
  { name: 'Work', value: 15, color: '#3b82f6' }, // Blue
  { name: 'Personal', value: 8, color: '#8b5cf6' }, // Purple
  { name: 'Health', value: 6, color: '#ec4899' }, // Pink
  { name: 'Growth', value: 4, color: '#10b981' }, // Emerald
];

export const NAV_ITEMS = [
  { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'WEEKLY', label: 'Planner', icon: CalendarClock },
  { id: 'PROJECTS', label: 'Projects', icon: Briefcase },
  { id: 'CHAT', label: 'Chat', icon: MessageSquare },
  { id: 'ANALYTICS', label: 'Insights', icon: PieChart },
  { id: 'SETTINGS', label: 'Settings', icon: Settings },
];
