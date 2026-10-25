import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Task, TaskPriority, TaskStatus } from '../../types';
import { X, Calendar, Clock, AlertCircle } from 'lucide-react';
import { getTodayString } from '../../utils/dateUtils';

interface TaskModalProps {
  isOpen: boolean;
  taskToEdit?: Task | null;
  onClose: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  taskToEdit,
  onClose,
}) => {
  const { subjects, addTask, updateTask } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [dueDate, setDueDate] = useState(getTodayString());
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [estimatedMinutes, setEstimatedMinutes] = useState('45');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setSubjectId(taskToEdit.subjectId);
      setDueDate(taskToEdit.dueDate);
      setPriority(taskToEdit.priority);
      setStatus(taskToEdit.status);
      setEstimatedMinutes(taskToEdit.estimatedMinutes ? String(taskToEdit.estimatedMinutes) : '45');
    } else {
      setTitle('');
      setDescription('');
      setSubjectId(subjects[0]?.id || '');
      setDueDate(getTodayString());
      setPriority('medium');
      setStatus('todo');
      setEstimatedMinutes('45');
    }
    setErrorMessage('');
  }, [taskToEdit, isOpen, subjects]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Task title is required.');
      return;
    }
    if (!subjectId && subjects.length > 0) {
      setErrorMessage('Please assign a subject.');
      return;
    }

    const estMins = parseInt(estimatedMinutes, 10);

    if (taskToEdit) {
      updateTask(taskToEdit.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        subjectId,
        dueDate,
        priority,
        status,
        estimatedMinutes: isNaN(estMins) ? undefined : estMins,
      });
    } else {
      addTask({
        title: title.trim(),
        description: description.trim() || undefined,
        subjectId: subjectId || (subjects[0]?.id || 'general'),
        dueDate,
        priority,
        status,
        estimatedMinutes: isNaN(estMins) ? undefined : estMins,
      });
    }

    onClose();
  };

  const priorityOptions: { value: TaskPriority; label: string; colorClass: string }[] = [
    { value: 'low', label: 'Low', colorClass: 'hover:border-slate-500' },
    { value: 'medium', label: 'Medium', colorClass: 'hover:border-blue-500' },
    { value: 'high', label: 'High', colorClass: 'hover:border-amber-500' },
    { value: 'urgent', label: 'Urgent', colorClass: 'hover:border-rose-500' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-title"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <h2 id="task-modal-title" className="text-lg font-bold text-slate-100">
            {taskToEdit ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Task Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              placeholder="e.g. Complete Problem Set 3 or Write lab report"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-hidden focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Subject & Due Date Row */}
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
                {subjects.length === 0 && (
                  <option value="">No subjects (add in Subjects)</option>
                )}
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
                <span>Due Date <span className="text-rose-400">*</span></span>
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-200 text-sm focus:outline-hidden focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Priority Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Priority Level
            </label>
            <div className="grid grid-cols-4 gap-2">
              {priorityOptions.map((opt) => {
                const isSelected = priority === opt.value;
                return (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => setPriority(opt.value)}
                    className={`py-2 px-2 text-xs font-medium rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? opt.value === 'urgent'
                          ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-semibold'
                          : opt.value === 'high'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold'
                          : opt.value === 'medium'
                          ? 'bg-blue-500/20 border-blue-500 text-blue-300 font-semibold'
                          : 'bg-slate-700 border-slate-500 text-slate-200 font-semibold'
                        : `bg-slate-800/60 border-slate-700/80 text-slate-400 ${opt.colorClass}`
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Estimated Minutes & Status Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Estimated Time (minutes)</span>
              </label>
              <input
                type="number"
                min="5"
                max="600"
                step="5"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-200 text-sm focus:outline-hidden focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Current Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-200 text-sm focus:outline-hidden focus:border-indigo-500 transition-colors"
              >
                <option value="todo">To-Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Notes or Assignment Guidelines (optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Chapter pages, rubric guidelines, reference materials..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-hidden focus:border-indigo-500 transition-colors resize-none"
            />
          </div>

          {/* Actions */}
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
              {taskToEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
