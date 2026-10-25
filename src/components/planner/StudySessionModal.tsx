import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { StudySession } from '../../types';
import { X, Calendar, Clock, AlertCircle } from 'lucide-react';
import { getTodayString } from '../../utils/dateUtils';

interface StudySessionModalProps {
  isOpen: boolean;
  sessionToEdit?: StudySession | null;
  onClose: () => void;
}

export const StudySessionModal: React.FC<StudySessionModalProps> = ({
  isOpen,
  sessionToEdit,
  onClose,
}) => {
  const { subjects, addStudySession, updateStudySession } = useApp();

  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [scheduledDate, setScheduledDate] = useState(getTodayString());
  const [startTime, setStartTime] = useState('14:00');
  const [durationMinutes, setDurationMinutes] = useState('45');
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (sessionToEdit) {
      setTitle(sessionToEdit.title);
      setSubjectId(sessionToEdit.subjectId);
      setScheduledDate(sessionToEdit.scheduledDate);
      setStartTime(sessionToEdit.startTime || '14:00');
      setDurationMinutes(String(sessionToEdit.durationMinutes));
      setNotes(sessionToEdit.notes || '');
    } else {
      setTitle('');
      setSubjectId(subjects[0]?.id || '');
      setScheduledDate(getTodayString());
      setStartTime('14:00');
      setDurationMinutes('45');
      setNotes('');
    }
    setErrorMessage('');
  }, [sessionToEdit, isOpen, subjects]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Session title / topic is required.');
      return;
    }
    if (!subjectId && subjects.length > 0) {
      setErrorMessage('Please assign a subject.');
      return;
    }

    const dur = parseInt(durationMinutes, 10);
    if (isNaN(dur) || dur <= 0) {
      setErrorMessage('Duration must be greater than 0 minutes.');
      return;
    }

    if (sessionToEdit) {
      updateStudySession(sessionToEdit.id, {
        title: title.trim(),
        subjectId,
        scheduledDate,
        startTime: startTime || undefined,
        durationMinutes: dur,
        notes: notes.trim() || undefined,
      });
    } else {
      addStudySession({
        title: title.trim(),
        subjectId: subjectId || (subjects[0]?.id || 'general'),
        scheduledDate,
        startTime: startTime || undefined,
        durationMinutes: dur,
        completed: false,
        notes: notes.trim() || undefined,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="session-modal-title"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <h2 id="session-modal-title" className="text-lg font-bold text-slate-100">
            {sessionToEdit ? 'Edit Study Session' : 'Schedule Study Session'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Study Topic or Objective <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              placeholder="e.g. Review Organic Reaction Mechanisms"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-hidden focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Subject Course <span className="text-rose-400">*</span>
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-200 text-sm focus:outline-hidden focus:border-indigo-500 transition-colors"
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.code} - {sub.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Date <span className="text-rose-400">*</span></span>
              </label>
              <input
                type="date"
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-200 text-sm focus:outline-hidden focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Duration (minutes) <span className="text-rose-400">*</span></span>
              </label>
              <input
                type="number"
                min="10"
                max="360"
                step="5"
                required
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-200 text-sm focus:outline-hidden focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Planned Start Time (optional)
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-200 text-sm focus:outline-hidden focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Specific Goals / Study Notes (optional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Focus on exercises 5 to 12. Create 10 flashcards on quizlet."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-hidden focus:border-indigo-500 transition-colors resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700/80 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              {sessionToEdit ? 'Save Session' : 'Schedule Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
