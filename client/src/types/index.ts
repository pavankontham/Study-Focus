export interface PomodoroSettings {
  work: number;
  shortBreak: number;
  longBreak: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  deadline?: string;
  playlistUrl?: string;
  category?: string;
  created: string;
  updated?: string;
  sessions: number;
  completed: boolean;
}

export interface Session {
  type: string;
  duration: number;
  timestamp: string;
}

export interface Goal {
  id: string;
  title: string;
  duration: number; // in days
  completed: boolean;
  created: string;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'blue' | 'green';
  fontSize: number;
  blockedSites: string[];
  customCategories: string[];
  notificationsPermission: boolean;
}

export interface Note {
  content: string;
  lastEdited: string;
}

export type AppTab = 'pomodoro' | 'stopwatch' | 'timer' | 'calendar' | 'tasks' | 'analytics' | 'notes' | 'resources' | 'goals' | 'settings';

export interface ThemeColors {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  primary: string;
  secondary: string;
  accent: string;
  muted: string;
}
