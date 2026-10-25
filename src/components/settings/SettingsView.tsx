import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  Clock,
  Volume2,
  HardDrive,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { playTimerCompletionSound } from '../../utils/sound';
import { ConfirmModal } from '../common/ConfirmModal';
import { AppDataBackup } from '../../types';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    updateTimerSettings,
    resetToSampleData,
    clearAllData,
    importDataBackup,
    subjects,
    tasks,
    studySessions,
    timerLogs,
    notes,
    showToast,
  } = useApp();

  // Profile Form state
  const [studentName, setStudentName] = useState(settings.studentName);
  const [university, setUniversity] = useState(settings.university);
  const [major, setMajor] = useState(settings.major);
  const [semester, setSemester] = useState(settings.semester);

  // Timer Form state
  const [focusDuration, setFocusDuration] = useState(String(settings.timerSettings.focusDuration));
  const [shortBreak, setShortBreak] = useState(String(settings.timerSettings.shortBreak));
  const [longBreak, setLongBreak] = useState(String(settings.timerSettings.longBreak));
  const [longBreakInterval, setLongBreakInterval] = useState(String(settings.timerSettings.longBreakInterval));
  const [soundEnabled, setSoundEnabled] = useState(settings.timerSettings.soundEnabled);

  // Confirmation Modals
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      studentName: studentName.trim() || 'Student',
      university: university.trim(),
      major: major.trim(),
      semester: semester.trim(),
    });
  };

  const handleSaveTimer = (e: React.FormEvent) => {
    e.preventDefault();
    const focus = parseInt(focusDuration, 10);
    const sBreak = parseInt(shortBreak, 10);
    const lBreak = parseInt(longBreak, 10);
    const interval = parseInt(longBreakInterval, 10);

    updateTimerSettings({
      focusDuration: isNaN(focus) || focus < 1 ? 25 : focus,
      shortBreak: isNaN(sBreak) || sBreak < 1 ? 5 : sBreak,
      longBreak: isNaN(lBreak) || lBreak < 1 ? 15 : lBreak,
      longBreakInterval: isNaN(interval) || interval < 1 ? 4 : interval,
      soundEnabled,
    });
  };

  const handleExportData = () => {
    const backup: AppDataBackup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      subjects,
      tasks,
      studySessions,
      timerLogs,
      notes,
      settings,
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campusflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Backup JSON downloaded', 'success');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const ok = importDataBackup(parsed);
        if (ok) {
          // Sync local input values
          if (parsed.settings) {
            setStudentName(parsed.settings.studentName || '');
            setUniversity(parsed.settings.university || '');
            setMajor(parsed.settings.major || '');
            setSemester(parsed.settings.semester || '');
            if (parsed.settings.timerSettings) {
              setFocusDuration(String(parsed.settings.timerSettings.focusDuration || 25));
              setShortBreak(String(parsed.settings.timerSettings.shortBreak || 5));
              setLongBreak(String(parsed.settings.timerSettings.longBreak || 15));
            }
          }
        }
      } catch {
        showToast('Failed to parse JSON backup file', 'error');
      }
    };
    reader.readAsText(file);
    // Reset file input
    e.target.value = '';
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Settings & Preferences</h1>
        <p className="text-sm text-slate-400 mt-1">
          Customize your student profile, focus timer intervals, and local storage data
        </p>
      </div>

      {/* Local Storage Privacy Banner (Requirement: Clearly explain local browser storage) */}
      <div className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-800/40 flex items-start gap-3.5">
        <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <span className="font-semibold text-indigo-300 block mb-0.5">
            Privacy First · Local Browser Storage
          </span>
          All tasks, study sessions, notes, timer logs, and subjects are securely stored directly in your browser's <code className="text-indigo-200 bg-indigo-900/40 px-1 py-0.5 rounded">localStorage</code>. No remote database account, external server, or paid API key is required. Note that data will stay on this device and will not automatically sync across different browsers or machines. You can export a JSON backup below at any time!
        </div>
      </div>

      {/* Student Profile Settings */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
          <User className="w-4 h-4 text-indigo-400" />
          <h2 className="text-base font-bold text-slate-100">Student Profile</h2>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Display Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="e.g. Alex Chen"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 text-sm focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                University / Institution
              </label>
              <input
                type="text"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                placeholder="e.g. State University"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 text-sm focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Major / Field of Study
              </label>
              <input
                type="text"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                placeholder="e.g. Computer Science & Mathematics"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 text-sm focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Current Semester / Term
              </label>
              <input
                type="text"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                placeholder="e.g. Fall 2026"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 text-sm focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              Update Profile
            </button>
          </div>
        </form>
      </div>

      {/* Focus Timer Customization */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
          <Clock className="w-4 h-4 text-indigo-400" />
          <h2 className="text-base font-bold text-slate-100">Timer Durations & Sound</h2>
        </div>

        <form onSubmit={handleSaveTimer} className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Focus (mins)
              </label>
              <input
                type="number"
                min="5"
                max="120"
                value={focusDuration}
                onChange={(e) => setFocusDuration(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 text-sm font-mono-numbers focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Short Break (mins)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={shortBreak}
                onChange={(e) => setShortBreak(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 text-sm font-mono-numbers focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Long Break (mins)
              </label>
              <input
                type="number"
                min="5"
                max="60"
                value={longBreak}
                onChange={(e) => setLongBreak(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 text-sm font-mono-numbers focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Long Break Every
              </label>
              <select
                value={longBreakInterval}
                onChange={(e) => setLongBreakInterval(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 text-sm focus:outline-hidden focus:border-indigo-500"
              >
                <option value="2">2 cycles</option>
                <option value="3">3 cycles</option>
                <option value="4">4 cycles (standard)</option>
                <option value="5">5 cycles</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/60">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0 w-4 h-4"
                />
                <span className="text-xs text-slate-300 font-medium">
                  Play audible chimes when timers conclude
                </span>
              </label>

              <button
                type="button"
                onClick={() => playTimerCompletionSound()}
                className="text-xs text-indigo-400 hover:text-indigo-300 underline flex items-center gap-1 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Test chime</span>
              </button>
            </div>

            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-md shadow-indigo-600/20 cursor-pointer self-end sm:self-auto"
            >
              Save Timer Settings
            </button>
          </div>
        </form>
      </div>

      {/* Data Management & Backup */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <HardDrive className="w-4 h-4 text-indigo-400" />
          <h2 className="text-base font-bold text-slate-100">Data Management & Backup</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Export JSON */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 flex flex-col justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                <Download className="w-4 h-4 text-indigo-400" />
                <span>Export Local Backup</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Save your tasks, notes, sessions, and subjects into a JSON file on your machine.
              </p>
            </div>
            <button
              onClick={handleExportData}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON Backup</span>
            </button>
          </div>

          {/* Import JSON */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 flex flex-col justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>Restore from Backup</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Import previously exported CampusFlow JSON data into this browser.
              </p>
            </div>
            <label className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Backup File</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Danger & Reset Zone */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setResetConfirmOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset to Sample Data</span>
            </button>
          </div>

          <button
            onClick={() => setClearConfirmOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All Local Data</span>
          </button>
        </div>
      </div>

      {/* Reset Confirmation */}
      <ConfirmModal
        isOpen={resetConfirmOpen}
        title="Reset to Sample Study Data"
        message="This will replace current entries with realistic sample courses (CS 201, Math 240, Physics 150), starter tasks, and study sessions. Are you sure?"
        confirmLabel="Reset Data"
        onConfirm={() => {
          resetToSampleData();
          setResetConfirmOpen(false);
        }}
        onCancel={() => setResetConfirmOpen(false)}
      />

      {/* Clear All Confirmation */}
      <ConfirmModal
        isOpen={clearConfirmOpen}
        title="Clear All Local Data"
        message="This will permanently delete all tasks, notes, study sessions, and subjects stored in this browser. This cannot be undone unless you have a JSON backup."
        confirmLabel="Clear Everything"
        isDestructive={true}
        onConfirm={() => {
          clearAllData();
          setClearConfirmOpen(false);
        }}
        onCancel={() => setClearConfirmOpen(false)}
      />
    </div>
  );
};
