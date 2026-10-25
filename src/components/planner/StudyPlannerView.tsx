import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { StudySession } from '../../types';
import {
  Calendar,
  Clock,
  Plus,
  Play,
  CheckCircle2,
  Circle,
  Edit2,
  Trash2,
  BookOpen,
  PieChart,
} from 'lucide-react';
import { formatMinutesToHours, formatReadableDate, getTodayString } from '../../utils/dateUtils';
import { StudySessionModal } from './StudySessionModal';
import { ConfirmModal } from '../common/ConfirmModal';

export const StudyPlannerView: React.FC = () => {
  const {
    studySessions,
    subjects,
    toggleStudySessionComplete,
    deleteStudySession,
    startTimerForSession,
  } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [filterSubjectId, setFilterSubjectId] = useState<string>('all');

  const todayStr = getTodayString();

  // Filtered sessions
  const filteredSessions = useMemo(() => {
    return studySessions.filter((s) => {
      if (filterSubjectId !== 'all' && s.subjectId !== filterSubjectId) {
        return false;
      }
      return true;
    });
  }, [studySessions, filterSubjectId]);

  // Group sessions by timeframe
  const groupedSessions = useMemo(() => {
    const today: StudySession[] = [];
    const upcoming: StudySession[] = [];
    const completed: StudySession[] = [];

    // Calculate tomorrow date
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const tomorrowStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    filteredSessions.forEach((s) => {
      if (s.completed) {
        completed.push(s);
      } else if (s.scheduledDate === todayStr) {
        today.push(s);
      } else {
        upcoming.push(s);
      }
    });

    // Sort upcoming by scheduled date
    upcoming.sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));
    completed.sort((a, b) => (b.completedAt || b.scheduledDate).localeCompare(a.completedAt || a.scheduledDate));

    return { today, upcoming, completed, tomorrowStr };
  }, [filteredSessions, todayStr]);

  // Subject workload distribution
  const workloadBySubject = useMemo(() => {
    const counts: Record<string, number> = {};
    studySessions.forEach((s) => {
      counts[s.subjectId] = (counts[s.subjectId] || 0) + s.durationMinutes;
    });
    return subjects.map((sub) => ({
      ...sub,
      totalMinutes: counts[sub.id] || 0,
    }));
  }, [studySessions, subjects]);

  const totalPlannedMinutes = useMemo(() => {
    return studySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  }, [studySessions]);

  const handleEdit = (session: StudySession) => {
    setEditingSession(session);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditingSession(null);
    setModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmId) {
      deleteStudySession(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Study Planner</h1>
          <p className="text-sm text-slate-400 mt-1">
            Block out focused study time and balance course workloads
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-md shadow-indigo-600/20 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Session</span>
        </button>
      </div>

      {/* Top Workload Overview & Filter Card */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-slate-200">
              Workload Allocation ({formatMinutesToHours(totalPlannedMinutes)} total planned)
            </h2>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Filter Subject:</span>
            <select
              value={filterSubjectId}
              onChange={(e) => setFilterSubjectId(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-hidden focus:border-indigo-500"
            >
              <option value="all">All Subjects</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.code}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Visual Multi-Segment Bar */}
        <div className="w-full h-3 rounded-full bg-slate-800 flex overflow-hidden">
          {workloadBySubject.map((item) => {
            if (item.totalMinutes === 0 || totalPlannedMinutes === 0) return null;
            const percent = (item.totalMinutes / totalPlannedMinutes) * 100;
            return (
              <div
                key={item.id}
                title={`${item.code}: ${formatMinutesToHours(item.totalMinutes)} (${Math.round(percent)}%)`}
                style={{
                  width: `${percent}%`,
                  backgroundColor: item.color,
                }}
                className="h-full transition-all duration-300 hover:opacity-90 cursor-help"
              />
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
          {workloadBySubject.map((item) => (
            <div key={item.id} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="font-medium text-slate-300">{item.code}:</span>
              <span>{formatMinutesToHours(item.totalMinutes)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Sessions Lists */}
      <div className="space-y-6">
        {/* Section 1: Today's Sessions */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <h2 className="text-base font-bold text-slate-100">Today's Schedule</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono-numbers">
              {groupedSessions.today.length}
            </span>
          </div>

          {groupedSessions.today.length === 0 ? (
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-500">
              No study sessions scheduled for today. Take time to rest or schedule a sprint!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {groupedSessions.today.map((ses) => (
                <SessionCard
                  key={ses.id}
                  session={ses}
                  subjects={subjects}
                  onToggleComplete={() => toggleStudySessionComplete(ses.id)}
                  onStartFocus={() => startTimerForSession(ses.id)}
                  onEdit={() => handleEdit(ses)}
                  onDelete={() => setDeleteConfirmId(ses.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Upcoming Sessions */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-slate-400" />
            <h2 className="text-base font-bold text-slate-100">Upcoming Sessions</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono-numbers">
              {groupedSessions.upcoming.length}
            </span>
          </div>

          {groupedSessions.upcoming.length === 0 ? (
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-500">
              No future sessions scheduled yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {groupedSessions.upcoming.map((ses) => (
                <SessionCard
                  key={ses.id}
                  session={ses}
                  subjects={subjects}
                  onToggleComplete={() => toggleStudySessionComplete(ses.id)}
                  onStartFocus={() => startTimerForSession(ses.id)}
                  onEdit={() => handleEdit(ses)}
                  onDelete={() => setDeleteConfirmId(ses.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Section 3: Completed Sessions */}
        {groupedSessions.completed.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h2 className="text-base font-bold text-slate-300">Completed Sessions</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono-numbers">
                {groupedSessions.completed.length}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {groupedSessions.completed.map((ses) => (
                <SessionCard
                  key={ses.id}
                  session={ses}
                  subjects={subjects}
                  onToggleComplete={() => toggleStudySessionComplete(ses.id)}
                  onStartFocus={() => startTimerForSession(ses.id)}
                  onEdit={() => handleEdit(ses)}
                  onDelete={() => setDeleteConfirmId(ses.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Session Modal */}
      <StudySessionModal
        isOpen={modalOpen}
        sessionToEdit={editingSession}
        onClose={() => {
          setModalOpen(false);
          setEditingSession(null);
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deleteConfirmId !== null}
        title="Delete Study Session"
        message="Are you sure you want to remove this study session from your schedule?"
        confirmLabel="Remove"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
};

// Sub-component: Session Card
interface SessionCardProps {
  session: StudySession;
  subjects: ReturnType<typeof useApp>['subjects'];
  onToggleComplete: () => void;
  onStartFocus: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const SessionCard: React.FC<SessionCardProps> = ({
  session,
  subjects,
  onToggleComplete,
  onStartFocus,
  onEdit,
  onDelete,
}) => {
  const subject = subjects.find((s) => s.id === session.subjectId);

  return (
    <div
      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
        session.completed
          ? 'bg-slate-900/40 border-slate-800/60 opacity-80'
          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700/80 hover:shadow-lg hover:shadow-black/20'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <button
            onClick={onToggleComplete}
            className="mt-0.5 text-slate-400 hover:text-indigo-400 transition-colors shrink-0 cursor-pointer"
            aria-label={session.completed ? 'Mark incomplete' : 'Mark complete'}
          >
            {session.completed ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <Circle className="w-5 h-5" />
            )}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: subject?.color || '#6366f1' }}
              />
              <span className="text-xs font-semibold text-slate-300">
                {subject?.code || 'Course'}
              </span>
              <span className="text-slate-600" aria-hidden="true">·</span>
              <span className="text-xs text-slate-400">
                {formatReadableDate(session.scheduledDate)}
                {session.startTime && ` at ${session.startTime}`}
              </span>
            </div>

            <h3
              className={`text-sm font-semibold truncate ${
                session.completed ? 'line-through text-slate-400' : 'text-slate-100'
              }`}
            >
              {session.title}
            </h3>

            {session.notes && (
              <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {session.notes}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400 font-mono-numbers">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>{session.durationMinutes} mins</span>
        </div>

        <div className="flex items-center gap-2">
          {!session.completed && (
            <button
              onClick={onStartFocus}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-semibold transition-colors cursor-pointer"
            >
              <Play className="w-3 h-3 fill-indigo-300" />
              <span>Focus</span>
            </button>
          )}

          <button
            onClick={onEdit}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Edit session"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onDelete}
            className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
            aria-label="Delete session"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
