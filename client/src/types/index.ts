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
