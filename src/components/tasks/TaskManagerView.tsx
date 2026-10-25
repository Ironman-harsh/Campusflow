import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Task, TaskPriority, TaskStatus } from '../../types';
import {
  Plus,
  Search,
  CheckCircle2,
  Circle,
  Clock,
  Trash2,
  Edit2,
  Calendar,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { getRelativeDueDateText } from '../../utils/dateUtils';
import { TaskModal } from './TaskModal';
import { ConfirmModal } from '../common/ConfirmModal';

export const TaskManagerView: React.FC<{ initialCreateOpen?: boolean }> = ({ initialCreateOpen = false }) => {
  const { tasks, subjects, deleteTask, toggleTaskStatus, updateTask } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'title'>('dueDate');

  const [modalOpen, setModalOpen] = useState(initialCreateOpen);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Priority rank for sorting
  const priorityRank: Record<TaskPriority, number> = {
    urgent: 4,
    high: 3,
    medium: 2,
    low: 1,
  };

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Search filter
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchesTitle = task.title.toLowerCase().includes(query);
          const matchesDesc = task.description?.toLowerCase().includes(query);
          if (!matchesTitle && !matchesDesc) return false;
        }

        // Status filter
        if (statusFilter !== 'all' && task.status !== statusFilter) {
          return false;
        }

        // Subject filter
        if (subjectFilter !== 'all' && task.subjectId !== subjectFilter) {
          return false;
        }

        // Priority filter
        if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'dueDate') {
          return a.dueDate.localeCompare(b.dueDate);
        }
        if (sortBy === 'priority') {
          return priorityRank[b.priority] - priorityRank[a.priority];
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [tasks, searchQuery, statusFilter, subjectFilter, priorityFilter, sortBy]);

  const handleOpenCreate = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmId) {
      deleteTask(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const priorityStyles: Record<TaskPriority, { border: string; bg: string; text: string }> = {
    urgent: { border: 'border-rose-500/30', bg: 'bg-rose-500/10', text: 'text-rose-300' },
    high: { border: 'border-amber-500/30', bg: 'bg-amber-500/10', text: 'text-amber-300' },
    medium: { border: 'border-blue-500/30', bg: 'bg-blue-500/10', text: 'text-blue-300' },
    low: { border: 'border-slate-600/30', bg: 'bg-slate-700/30', text: 'text-slate-300' },
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Task Manager</h1>
          <p className="text-sm text-slate-400 mt-1">
            Organize academic deliverables, problem sets, and milestones
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-md shadow-indigo-600/20 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Control Bar: Search & Status Tabs */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks by keyword or topic..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Status Tabs (Segmented control) */}
          <div className="flex items-center p-1 bg-slate-800/80 rounded-xl border border-slate-700/60 shrink-0">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'todo', label: 'To-Do' },
                { id: 'in_progress', label: 'In Progress' },
                { id: 'completed', label: 'Completed' },
              ] as const
            ).map((tab) => {
              const isActive = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Secondary Filters Row: Subject, Priority, Sort */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800/60 text-xs">
          {/* Subject Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Subject:</span>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-hidden focus:border-indigo-500"
            >
              <option value="all">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-hidden focus:border-indigo-500"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-slate-400 font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-hidden focus:border-indigo-500"
            >
              <option value="dueDate">Due Date (Earliest)</option>
              <option value="priority">Priority (Highest)</option>
              <option value="title">Title (Alphabetical)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-200">No tasks found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'all' || subjectFilter !== 'all' || priorityFilter !== 'all'
              ? 'Try relaxing your search terms or filters to see more tasks.'
              : 'Add your first task to stay ahead of upcoming academic deadlines!'}
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            + Create New Task
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const subject = subjects.find((s) => s.id === task.subjectId);
            const relDue = getRelativeDueDateText(task.dueDate);
            const isCompleted = task.status === 'completed';
            const priorityStyle = priorityStyles[task.priority];

            return (
              <div
                key={task.id}
                className={`group p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 ${
                  isCompleted
                    ? 'bg-slate-900/40 border-slate-800/60 opacity-75'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700/80 hover:shadow-lg hover:shadow-black/20'
                }`}
              >
                {/* Left: Checkbox & Content */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <button
                    onClick={() => toggleTaskStatus(task.id)}
                    className="mt-0.5 shrink-0 text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
                    aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {/* Subject label (clean unboxed text with dot) */}
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: subject?.color || '#6366f1' }}
                        />
                        <span>{subject?.code || 'Course'}</span>
                      </span>

                      <span className="text-slate-600" aria-hidden="true">·</span>

                      {/* Priority tag */}
                      <span
                        className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border ${priorityStyle.border} ${priorityStyle.bg} ${priorityStyle.text}`}
                      >
                        {task.priority}
                      </span>

                      {/* Status indicator (if in progress) */}
                      {task.status === 'in_progress' && (
                        <span className="text-[11px] font-medium text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                          In Progress
                        </span>
                      )}
                    </div>

                    <h3
                      className={`text-sm sm:text-base font-semibold leading-snug transition-all ${
                        isCompleted
                          ? 'line-through text-slate-400'
                          : 'text-slate-100 group-hover:text-white'
                      }`}
                    >
                      {task.title}
                    </h3>

                    {task.description && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    {/* Metadata line: Due date & estimated time */}
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-2.5">
                      <span
                        className={`flex items-center gap-1.5 font-medium ${
                          isCompleted
                            ? 'text-slate-500'
                            : relDue.isOverdue
                            ? 'text-rose-400 font-semibold'
                            : relDue.isUrgent
                            ? 'text-amber-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {relDue.isOverdue && <AlertTriangle className="w-3.5 h-3.5" />}
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{relDue.label}</span>
                      </span>

                      {task.estimatedMinutes && (
                        <>
                          <span className="text-slate-600" aria-hidden="true">·</span>
                          <span className="flex items-center gap-1 font-mono-numbers">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>{task.estimatedMinutes}m est.</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                  {/* Status Toggle Button for quick progress transition */}
                  {!isCompleted && task.status === 'todo' && (
                    <button
                      onClick={() => updateTask(task.id, { status: 'in_progress' })}
                      className="px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 rounded-lg transition-colors cursor-pointer"
                    >
                      Start
                    </button>
                  )}

                  <button
                    onClick={() => handleOpenEdit(task)}
                    className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    aria-label="Edit task"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setDeleteConfirmId(task.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                    aria-label="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task Modal for Add / Edit */}
      <TaskModal
        isOpen={modalOpen}
        taskToEdit={editingTask}
        onClose={() => {
          setModalOpen(false);
          setEditingTask(null);
        }}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={deleteConfirmId !== null}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmLabel="Delete"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
};
