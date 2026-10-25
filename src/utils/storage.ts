import { AppDataBackup, FocusTimerLog, QuickNote, StudySession, Subject, Task, UserSettings } from '../types';
import { getTodayString } from './dateUtils';

const STORAGE_KEYS = {
  SUBJECTS: 'campusflow_subjects_v1',
  TASKS: 'campusflow_tasks_v1',
  SESSIONS: 'campusflow_sessions_v1',
  TIMER_LOGS: 'campusflow_timer_logs_v1',
  NOTES: 'campusflow_notes_v1',
  SETTINGS: 'campusflow_settings_v1',
};

// Preset colors for subjects
export const SUBJECT_COLORS = [
  { name: 'Indigo', hex: '#6366F1', bg: 'rgba(99, 102, 241, 0.15)', text: '#A5B4FC' },
  { name: 'Emerald', hex: '#10B981', bg: 'rgba(16, 185, 129, 0.15)', text: '#6EE7B7' },
  { name: 'Amber', hex: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)', text: '#FCD34D' },
  { name: 'Rose', hex: '#F43F5E', bg: 'rgba(244, 63, 94, 0.15)', text: '#FDA4AF' },
  { name: 'Cyan', hex: '#06B6D4', bg: 'rgba(6, 182, 212, 0.15)', text: '#67E8F9' },
  { name: 'Violet', hex: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.15)', text: '#C4B5FD' },
  { name: 'Sky', hex: '#0284C7', bg: 'rgba(2, 132, 199, 0.15)', text: '#7DD3FC' },
  { name: 'Teal', hex: '#14B8A6', bg: 'rgba(20, 184, 166, 0.15)', text: '#5EEAD4' },
];

export const DEFAULT_SETTINGS: UserSettings = {
  studentName: 'Alex Chen',
  university: 'State University',
  major: 'Computer Science & Mathematics',
  semester: 'Fall Semester',
  timerSettings: {
    focusDuration: 25,
    shortBreak: 5,
    longBreak: 15,
    longBreakInterval: 4,
    soundEnabled: true,
    autoStartBreaks: false,
  },
};

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'sub-1',
    name: 'Data Structures & Algorithms',
    code: 'CS 201',
    color: '#6366F1',
    instructor: 'Prof. Miller',
    credits: 4,
  },
  {
    id: 'sub-2',
    name: 'Linear Algebra & Matrices',
    code: 'MATH 240',
    color: '#10B981',
    instructor: 'Dr. Katherine Vance',
    credits: 3,
  },
  {
    id: 'sub-3',
    name: 'Classical Mechanics & Wave Motion',
    code: 'PHYS 150',
    color: '#F59E0B',
    instructor: 'Dr. Aris Thorne',
    credits: 4,
  },
  {
    id: 'sub-4',
    name: 'Technical Writing & Research',
    code: 'ENG 105',
    color: '#F43F5E',
    instructor: 'Prof. Sandra Wu',
    credits: 3,
  },
  {
    id: 'sub-5',
    name: 'Molecular Cell Biology',
    code: 'BIO 110',
    color: '#06B6D4',
    instructor: 'Dr. Marcus Bennett',
    credits: 4,
  },
];

export function generateSeedData() {
  const today = getTodayString();
  const d = new Date();
  
  const formatDateOffset = (days: number) => {
    const target = new Date(d);
    target.setDate(target.getDate() + days);
    return `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`;
  };

  const tasks: Task[] = [
    {
      id: 'task-1',
      title: 'Rotational Inertia Lab Report write-up',
      description: 'Calculate moments of inertia and compare experimental error to theoretical cylindrical model.',
      subjectId: 'sub-3',
      dueDate: today,
      priority: 'urgent',
      status: 'in_progress',
      estimatedMinutes: 60,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-2',
      title: 'Implement AVL Tree Self-Balancing rotations',
      description: 'Write leftRotate, rightRotate, and double rotation handlers for unbalanced subtrees.',
      subjectId: 'sub-1',
      dueDate: formatDateOffset(1),
      priority: 'high',
      status: 'todo',
      estimatedMinutes: 90,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-3',
      title: 'Problem Set 4: Orthogonal Projections & Gram-Schmidt',
      description: 'Exercises 14-22 from Chapter 5. Review projection matrix derivations.',
      subjectId: 'sub-2',
      dueDate: formatDateOffset(2),
      priority: 'medium',
      status: 'todo',
      estimatedMinutes: 75,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-4',
      title: 'Draft Abstract & Methodology for Term Paper',
      description: 'Submit 500-word proposal with at least 4 peer-reviewed citations.',
      subjectId: 'sub-4',
      dueDate: formatDateOffset(4),
      priority: 'low',
      status: 'todo',
      estimatedMinutes: 45,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-5',
      title: 'Read Chapter 7: Citric Acid Cycle & Oxidative Phosphorylation',
      description: 'Prepare notes on electron transport chain protein complexes and ATP synthase coupling.',
      subjectId: 'sub-5',
      dueDate: formatDateOffset(-1),
      priority: 'medium',
      status: 'completed',
      completedAt: new Date(Date.now() - 86400000).toISOString(),
      estimatedMinutes: 50,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
  ];

  const studySessions: StudySession[] = [
    {
      id: 'ses-1',
      subjectId: 'sub-3',
      title: 'Physics Lab Data Analysis & Plotting',
      scheduledDate: today,
      startTime: '14:00',
      durationMinutes: 60,
      actualMinutes: 60,
      completed: true,
      completedAt: new Date().toISOString(),
      notes: 'Plotted torque vs angular acceleration in SciPy. R-squared was 0.987.',
    },
    {
      id: 'ses-2',
      subjectId: 'sub-1',
      title: 'AVL Tree Rotation Cases & Balance Factor Debugging',
      scheduledDate: today,
      startTime: '16:30',
      durationMinutes: 45,
      completed: false,
      notes: 'Need to test edge cases with duplicate keys.',
    },
    {
      id: 'ses-3',
      subjectId: 'sub-2',
      title: 'Gram-Schmidt Orthonormalization Practice',
      scheduledDate: formatDateOffset(1),
      startTime: '10:00',
      durationMinutes: 50,
      completed: false,
    },
    {
      id: 'ses-4',
      subjectId: 'sub-5',
      title: 'Bio 110 Review: Cellular Respiration Pathway Flashcards',
      scheduledDate: formatDateOffset(2),
      startTime: '15:00',
      durationMinutes: 40,
      completed: false,
    },
  ];

  const timerLogs: FocusTimerLog[] = [
    {
      id: 'log-1',
      subjectId: 'sub-3',
      durationMinutes: 50,
      completedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      type: 'focus',
    },
    {
      id: 'log-2',
      subjectId: 'sub-1',
      durationMinutes: 25,
      completedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      type: 'focus',
    },
    {
      id: 'log-3',
      subjectId: 'sub-2',
      durationMinutes: 45,
      completedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      type: 'focus',
    },
    {
      id: 'log-4',
      subjectId: 'sub-1',
      durationMinutes: 30,
      completedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      type: 'focus',
    },
    {
      id: 'log-5',
      subjectId: 'sub-5',
      durationMinutes: 40,
      completedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      type: 'focus',
    },
  ];

  const notes: QuickNote[] = [
    {
      id: 'note-1',
      title: 'AVL Tree Balancing Invariants',
      content: `Balance Factor = height(left) - height(right)
Valid range: {-1, 0, +1}

Four Rotation Scenarios:
1. Left-Left Case (BF > 1 & left child BF >= 0) -> Right Rotate(root)
2. Right-Right Case (BF < -1 & right child BF <= 0) -> Left Rotate(root)
3. Left-Right Case (BF > 1 & left child BF < 0) -> Left Rotate(left child) then Right Rotate(root)
4. Right-Left Case (BF < -1 & right child BF > 0) -> Right Rotate(right child) then Left Rotate(root)`,
      subjectId: 'sub-1',
      isPinned: true,
      tags: ['CS', 'Algorithms', 'Exam Prep'],
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'note-2',
      title: 'Gram-Schmidt Algorithm Steps',
      content: `Given basis vectors v1, v2, ..., vk:
1. u1 = v1
2. u2 = v2 - proj_{u1}(v2)
3. u3 = v3 - proj_{u1}(v3) - proj_{u2}(v3)
4. Normalize: e_i = u_i / ||u_i||

Remember: Projection formula: proj_u(v) = (v . u / u . u) * u`,
      subjectId: 'sub-2',
      isPinned: true,
      tags: ['Math', 'Formulas'],
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'note-3',
      title: 'Midterm Exam Schedule & Locations',
      content: `Fall Midterm Dates:
• CS 201: Nov 12 @ Hall B (Bring Student ID)
• MATH 240: Nov 18 @ Science Auditorium
• PHYS 150: Nov 24 @ Lab Building 302
• ENG 105: Portfolio due Nov 30 via campus portal`,
      isPinned: false,
      tags: ['Schedule', 'Important'],
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
    {
      id: 'note-4',
      title: 'Engineering Library Study Pods',
      content: `Quiet study pod reservation opens Mondays at 8:00 AM.
Reserve Room 402 or 405 (both have dual monitors and whiteboard).`,
      isPinned: false,
      tags: ['Campus', 'Productivity'],
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
  ];

  return {
    subjects: INITIAL_SUBJECTS,
    tasks,
    studySessions,
    timerLogs,
    notes,
    settings: DEFAULT_SETTINGS,
  };
}

export function loadStoredData() {
  try {
    const rawSubjects = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    const rawTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
    const rawSessions = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    const rawTimerLogs = localStorage.getItem(STORAGE_KEYS.TIMER_LOGS);
    const rawNotes = localStorage.getItem(STORAGE_KEYS.NOTES);
    const rawSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);

    if (!rawSubjects && !rawTasks) {
      // First time initialization: load seed data
      const seed = generateSeedData();
      saveStoredData(seed);
      return seed;
    }

    return {
      subjects: rawSubjects ? (JSON.parse(rawSubjects) as Subject[]) : INITIAL_SUBJECTS,
      tasks: rawTasks ? (JSON.parse(rawTasks) as Task[]) : [],
      studySessions: rawSessions ? (JSON.parse(rawSessions) as StudySession[]) : [],
      timerLogs: rawTimerLogs ? (JSON.parse(rawTimerLogs) as FocusTimerLog[]) : [],
      notes: rawNotes ? (JSON.parse(rawNotes) as QuickNote[]) : [],
      settings: rawSettings ? (JSON.parse(rawSettings) as UserSettings) : DEFAULT_SETTINGS,
    };
  } catch (err) {
    console.error('Failed to parse localStorage data, falling back to seed data:', err);
    return generateSeedData();
  }
}

export function saveStoredData(data: {
  subjects?: Subject[];
  tasks?: Task[];
  studySessions?: StudySession[];
  timerLogs?: FocusTimerLog[];
  notes?: QuickNote[];
  settings?: UserSettings;
}) {
  try {
    if (data.subjects !== undefined) localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(data.subjects));
    if (data.tasks !== undefined) localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(data.tasks));
    if (data.studySessions !== undefined) localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(data.studySessions));
    if (data.timerLogs !== undefined) localStorage.setItem(STORAGE_KEYS.TIMER_LOGS, JSON.stringify(data.timerLogs));
    if (data.notes !== undefined) localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(data.notes));
    if (data.settings !== undefined) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
  } catch (err) {
    console.error('Error saving data to localStorage:', err);
  }
}

export function clearLocalStorageData() {
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
}
