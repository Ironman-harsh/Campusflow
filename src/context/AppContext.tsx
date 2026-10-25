import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  AppDataBackup,
  AppView,
  FocusTimerLog,
  QuickNote,
  StudySession,
  Subject,
  Task,
  ToastMessage,
  UserSettings,
} from '../types';
import {
  clearLocalStorageData,
  DEFAULT_SETTINGS,
  generateSeedData,
  INITIAL_SUBJECTS,
  loadStoredData,
  saveStoredData,
} from '../utils/storage';

interface AppContextType {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  subjects: Subject[];
  addSubject: (subject: Omit<Subject, 'id'>) => Subject;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;
  studySessions: StudySession[];
  addStudySession: (session: Omit<StudySession, 'id'>) => StudySession;
  updateStudySession: (id: string, updates: Partial<StudySession>) => void;
  deleteStudySession: (id: string) => void;
  toggleStudySessionComplete: (id: string) => void;
  notes: QuickNote[];
  addNote: (note: Omit<QuickNote, 'id' | 'createdAt' | 'updatedAt'>) => QuickNote;
  updateNote: (id: string, updates: Partial<QuickNote>) => void;
  deleteNote: (id: string) => void;
  togglePinNote: (id: string) => void;
  timerLogs: FocusTimerLog[];
  logFocusSession: (log: Omit<FocusTimerLog, 'id' | 'completedAt'>) => void;
  settings: UserSettings;
  updateSettings: (updates: Partial<UserSettings>) => void;
  updateTimerSettings: (updates: Partial<UserSettings['timerSettings']>) => void;
  activeTimerSubjectId: string | null;
  setActiveTimerSubjectId: (id: string | null) => void;
  startTimerForSession: (sessionId: string) => void;
  toasts: ToastMessage[];
  showToast: (text: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
  resetToSampleData: () => void;
  clearAllData: () => void;
  importDataBackup: (backup: AppDataBackup) => boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [timerLogs, setTimerLogs] = useState<FocusTimerLog[]>([]);
  const [notes, setNotes] = useState<QuickNote[]>([]);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [activeTimerSubjectId, setActiveTimerSubjectId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Load from LocalStorage on mount
  useEffect(() => {
    const data = loadStoredData();
    setSubjects(data.subjects);
    setTasks(data.tasks);
    setStudySessions(data.studySessions);
    setTimerLogs(data.timerLogs);
    setNotes(data.notes);
    setSettings(data.settings);
    setInitialLoaded(true);
  }, []);

  // Save changes to LocalStorage once initial load finishes
  useEffect(() => {
    if (!initialLoaded) return;
    saveStoredData({ subjects, tasks, studySessions, timerLogs, notes, settings });
  }, [subjects, tasks, studySessions, timerLogs, notes, settings, initialLoaded]);

  // Toast feedback helper
  const showToast = (text: string, type: ToastMessage['type'] = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Subject operations
  const addSubject = (subjectData: Omit<Subject, 'id'>): Subject => {
    const newSubject: Subject = {
      ...subjectData,
      id: `sub-${Date.now()}`,
    };
    setSubjects((prev) => [...prev, newSubject]);
    showToast(`Subject "${newSubject.code}" added`, 'success');
    return newSubject;
  };

  const updateSubject = (id: string, updates: Partial<Subject>) => {
    setSubjects((prev) =>
      prev.map((sub) => (sub.id === id ? { ...sub, ...updates } : sub))
    );
    showToast('Subject updated', 'success');
  };

  const deleteSubject = (id: string) => {
    const sub = subjects.find((s) => s.id === id);
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    showToast(`Deleted ${sub?.code || 'subject'}`, 'info');
  };

  // Task operations
  const addTask = (taskData: Omit<Task, 'id' | 'createdAt'>): Task => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
    showToast('Task added to schedule', 'success');
    return newTask;
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated = { ...t, ...updates };
          if (updates.status === 'completed' && t.status !== 'completed') {
            updated.completedAt = new Date().toISOString();
          } else if (updates.status && updates.status !== 'completed') {
            updated.completedAt = undefined;
          }
          return updated;
        }
        return t;
      })
    );
    showToast('Task saved', 'info');
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    showToast('Task deleted', 'info');
  };

  const toggleTaskStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const isNowCompleted = t.status !== 'completed';
          return {
            ...t,
            status: isNowCompleted ? 'completed' : 'todo',
            completedAt: isNowCompleted ? new Date().toISOString() : undefined,
          };
        }
        return t;
      })
    );
    const target = tasks.find((t) => t.id === id);
    if (target && target.status !== 'completed') {
      showToast('Task marked complete!', 'success');
    }
  };

  // Study Session operations
  const addStudySession = (sessionData: Omit<StudySession, 'id'>): StudySession => {
    const newSession: StudySession = {
      ...sessionData,
      id: `ses-${Date.now()}`,
    };
    setStudySessions((prev) => [newSession, ...prev]);
    showToast('Study session planned', 'success');
    return newSession;
  };

  const updateStudySession = (id: string, updates: Partial<StudySession>) => {
    setStudySessions((prev) =>
      prev.map((ses) => (ses.id === id ? { ...ses, ...updates } : ses))
    );
    showToast('Study session updated', 'info');
  };

  const deleteStudySession = (id: string) => {
    setStudySessions((prev) => prev.filter((s) => s.id !== id));
    showToast('Study session removed', 'info');
  };

  const toggleStudySessionComplete = (id: string) => {
    setStudySessions((prev) =>
      prev.map((ses) => {
        if (ses.id === id) {
          const isNowCompleted = !ses.completed;
          return {
            ...ses,
            completed: isNowCompleted,
            actualMinutes: isNowCompleted ? ses.durationMinutes : undefined,
            completedAt: isNowCompleted ? new Date().toISOString() : undefined,
          };
        }
        return ses;
      })
    );
    showToast('Study session marked complete', 'success');
  };

  const startTimerForSession = (sessionId: string) => {
    const session = studySessions.find((s) => s.id === sessionId);
    if (session) {
      setActiveTimerSubjectId(session.subjectId);
      setCurrentView('timer');
      showToast(`Ready to focus on ${session.title}`, 'info');
    }
  };

  // Notes operations
  const addNote = (noteData: Omit<QuickNote, 'id' | 'createdAt' | 'updatedAt'>): QuickNote => {
    const nowIso = new Date().toISOString();
    const newNote: QuickNote = {
      ...noteData,
      id: `note-${Date.now()}`,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    setNotes((prev) => [newNote, ...prev]);
    showToast('Note created', 'success');
    return newNote;
  };

  const updateNote = (id: string, updates: Partial<QuickNote>) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id
          ? {
              ...n,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : n
      )
    );
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    showToast('Note deleted', 'info');
  };

  const togglePinNote = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n))
    );
  };

  // Focus Timer logs
  const logFocusSession = (logData: Omit<FocusTimerLog, 'id' | 'completedAt'>) => {
    const newLog: FocusTimerLog = {
      ...logData,
      id: `log-${Date.now()}`,
      completedAt: new Date().toISOString(),
    };
    setTimerLogs((prev) => [newLog, ...prev]);
    showToast(`Great job! +${newLog.durationMinutes}m focus logged`, 'success');
  };

  // Settings
  const updateSettings = (updates: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
    showToast('Settings saved', 'success');
  };

  const updateTimerSettings = (updates: Partial<UserSettings['timerSettings']>) => {
    setSettings((prev) => ({
      ...prev,
      timerSettings: { ...prev.timerSettings, ...updates },
    }));
    showToast('Timer settings saved', 'success');
  };

  // Reset to initial sample data
  const resetToSampleData = () => {
    const seed = generateSeedData();
    setSubjects(seed.subjects);
    setTasks(seed.tasks);
    setStudySessions(seed.studySessions);
    setTimerLogs(seed.timerLogs);
    setNotes(seed.notes);
    setSettings(seed.settings);
    saveStoredData(seed);
    showToast('Restored sample study data', 'info');
  };

  // Clear all data
  const clearAllData = () => {
    clearLocalStorageData();
    setSubjects([]);
    setTasks([]);
    setStudySessions([]);
    setTimerLogs([]);
    setNotes([]);
    setSettings({
      ...DEFAULT_SETTINGS,
      studentName: 'Student',
    });
    showToast('All local data cleared', 'info');
  };

  // Backup restore
  const importDataBackup = (backup: AppDataBackup): boolean => {
    try {
      if (!backup || !Array.isArray(backup.subjects)) {
        showToast('Invalid backup file format', 'error');
        return false;
      }
      setSubjects(backup.subjects || []);
      setTasks(backup.tasks || []);
      setStudySessions(backup.studySessions || []);
      setTimerLogs(backup.timerLogs || []);
      setNotes(backup.notes || []);
      if (backup.settings) setSettings(backup.settings);
      
      saveStoredData({
        subjects: backup.subjects,
        tasks: backup.tasks,
        studySessions: backup.studySessions,
        timerLogs: backup.timerLogs,
        notes: backup.notes,
        settings: backup.settings,
      });

      showToast('Study data restored successfully!', 'success');
      return true;
    } catch {
      showToast('Error importing backup data', 'error');
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        subjects,
        addSubject,
        updateSubject,
        deleteSubject,
        tasks,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskStatus,
        studySessions,
        addStudySession,
        updateStudySession,
        deleteStudySession,
        toggleStudySessionComplete,
        notes,
        addNote,
        updateNote,
        deleteNote,
        togglePinNote,
        timerLogs,
        logFocusSession,
        settings,
        updateSettings,
        updateTimerSettings,
        activeTimerSubjectId,
        setActiveTimerSubjectId,
        startTimerForSession,
        toasts,
        showToast,
        removeToast,
        resetToSampleData,
        clearAllData,
        importDataBackup,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
