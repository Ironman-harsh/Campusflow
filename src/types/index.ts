export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export interface Subject {
  id: string;
  name: string;
  code: string;
  color: string; // Tailwind hex or css color e.g. #6366f1
  instructor?: string;
  credits?: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  subjectId: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  priority: TaskPriority;
  status: TaskStatus;
  completedAt?: string;
  estimatedMinutes?: number;
  createdAt: string;
}

export interface StudySession {
  id: string;
  subjectId: string;
  title: string;
  scheduledDate: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  durationMinutes: number;
  actualMinutes?: number;
  completed: boolean;
  notes?: string;
  completedAt?: string;
}

export interface FocusTimerLog {
  id: string;
  subjectId?: string;
  durationMinutes: number;
  completedAt: string; // ISO string
  type: 'focus' | 'short_break' | 'long_break';
}

export interface QuickNote {
  id: string;
  title: string;
  content: string;
  subjectId?: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export interface TimerSettings {
  focusDuration: number; // in minutes (e.g. 25)
  shortBreak: number; // in minutes (e.g. 5)
  longBreak: number; // in minutes (e.g. 15)
  longBreakInterval: number; // e.g. 4 cycles
  soundEnabled: boolean;
  autoStartBreaks: boolean;
}

export interface UserSettings {
  studentName: string;
  university: string;
  major: string;
  semester: string;
  timerSettings: TimerSettings;
}

export type AppView = 
  | 'dashboard' 
  | 'tasks' 
  | 'planner' 
  | 'timer' 
  | 'notes' 
  | 'subjects' 
  | 'settings';

export interface ToastMessage {
  id: string;
  text: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}

export interface AppDataBackup {
  version: string;
  exportedAt: string;
  subjects: Subject[];
  tasks: Task[];
  studySessions: StudySession[];
  timerLogs: FocusTimerLog[];
  notes: QuickNote[];
  settings: UserSettings;
}
