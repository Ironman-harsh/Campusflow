import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CheckSquare,
  Clock,
  Flame,
  Plus,
  Play,
  ArrowRight,
  Sparkles,
  BookOpen,
  Calendar,
  CheckCircle2,
  Circle,
  Lightbulb,
} from 'lucide-react';
import { formatMinutesToHours, getLast7Days, getRelativeDueDateText, getTodayString } from '../../utils/dateUtils';

const STUDY_TIPS = [
  {
    title: 'Active Recall',
    tip: 'Testing yourself on concepts before re-reading notes boosts long-term retention by up to 50%.',
  },
  {
    title: 'The Pomodoro Rhythm',
    tip: '25 minutes of deep focus followed by 5 minutes away from screens keeps your prefrontal cortex sharp.',
  },
  {
    title: 'Interleaving Technique',
    tip: 'Switching between 2 different subjects in one afternoon improves problem-solving flexibility.',
  },
  {
    title: 'Feynman Technique',
    tip: 'Explain the core idea in simple plain words as if teaching a freshman to uncover hidden knowledge gaps.',
  },
];

export const DashboardView: React.FC<{ onNewTaskClick: () => void }> = ({ onNewTaskClick }) => {
  const {
    tasks,
    studySessions,
    timerLogs,
    subjects,
    settings,
    setCurrentView,
    toggleTaskStatus,
    startTimerForSession,
  } = useApp();

  const todayStr = getTodayString();

  // Dynamic greeting based on hour
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Filter tasks due today & pending
  const todayTasks = useMemo(() => {
    return tasks.filter((t) => t.dueDate === todayStr);
  }, [tasks, todayStr]);

  const pendingTodayCount = todayTasks.filter((t) => t.status !== 'completed').length;

  // Urgent and upcoming deadlines (next 4 pending tasks sorted by due date)
  const upcomingDeadlines = useMemo(() => {
    return tasks
      .filter((t) => t.status !== 'completed')
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .slice(0, 4);
  }, [tasks]);

  // Today's scheduled study sessions
  const todaySessions = useMemo(() => {
    return studySessions.filter((s) => s.scheduledDate === todayStr);
  }, [studySessions, todayStr]);

  // Completed task stats
  const totalCompletedTasks = useMemo(() => {
    return tasks.filter((t) => t.status === 'completed').length;
  }, [tasks]);

  const completionRate = useMemo(() => {
    if (tasks.length === 0) return 0;
    return Math.round((totalCompletedTasks / tasks.length) * 100);
  }, [tasks, totalCompletedTasks]);

  // Weekly Activity & Progress Calculation (Last 7 days)
  const weeklyStats = useMemo(() => {
    const days = getLast7Days();

    // Map logs to dates
    const dataByDate = days.map((day) => {
      // Sum timer logs on this date
      const minutesFromTimer = timerLogs
        .filter((l) => l.completedAt.startsWith(day.dateStr) && l.type === 'focus')
        .reduce((sum, l) => sum + l.durationMinutes, 0);

      // Sum completed study sessions on this date
      const minutesFromSessions = studySessions
        .filter((s) => s.completed && s.completedAt && s.completedAt.startsWith(day.dateStr))
        .reduce((sum, s) => sum + (s.actualMinutes || s.durationMinutes), 0);

      const totalMinutes = Math.max(minutesFromTimer, minutesFromSessions);

      // Count tasks completed on this date
      const tasksFinished = tasks.filter(
        (t) => t.status === 'completed' && t.completedAt && t.completedAt.startsWith(day.dateStr)
      ).length;

      return {
        ...day,
        totalMinutes,
        tasksFinished,
      };
    });

    const totalWeeklyMinutes = dataByDate.reduce((acc, d) => acc + d.totalMinutes, 0);
    const maxDayMinutes = Math.max(...dataByDate.map((d) => d.totalMinutes), 60);

    // Calculate current study streak
    let streak = 0;
    for (let i = dataByDate.length - 1; i >= 0; i--) {
      if (dataByDate[i].totalMinutes > 0 || dataByDate[i].tasksFinished > 0) {
        streak++;
      } else if (i === dataByDate.length - 1) {
        // Today might not be finished yet, so check if yesterday had activity
        continue;
      } else {
        break;
      }
    }

    return {
      dataByDate,
      totalWeeklyMinutes,
      maxDayMinutes,
      streak: Math.max(streak, 1),
    };
  }, [timerLogs, studySessions, tasks]);

  // Pick a random study tip (consistent per render)
  const tip = useMemo(() => {
    const dayOfMonth = new Date().getDate();
    return STUDY_TIPS[dayOfMonth % STUDY_TIPS.length];
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{settings.semester || 'Academic Term'} · {settings.university || 'Campus'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {greeting}, {settings.studentName.split(' ')[0]}!
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {pendingTodayCount === 0
              ? 'All clear for today! No urgent tasks pending.'
              : `You have ${pendingTodayCount} task${pendingTodayCount > 1 ? 's' : ''} to complete today.`}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onNewTaskClick}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
          <button
            onClick={() => setCurrentView('timer')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-200 text-sm font-semibold border border-slate-700 transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />
            <span>Focus Timer</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Due Today */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400">Due Today</span>
            <div className="text-2xl font-bold text-white mt-1 font-mono-numbers">
              {todayTasks.length}
            </div>
            <span className="text-xs text-slate-500">
              {pendingTodayCount} remaining
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Weekly Focus */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400">Weekly Focus</span>
            <div className="text-2xl font-bold text-indigo-300 mt-1 font-mono-numbers">
              {formatMinutesToHours(weeklyStats.totalWeeklyMinutes)}
            </div>
            <span className="text-xs text-slate-500">past 7 days</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Completion Rate */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400">Task Completion</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono-numbers">
              {completionRate}%
            </div>
            <span className="text-xs text-slate-500">
              {totalCompletedTasks} of {tasks.length} total
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckSquare className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Study Streak */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400">Study Streak</span>
            <div className="text-2xl font-bold text-rose-400 mt-1 font-mono-numbers">
              {weeklyStats.streak} {weeklyStats.streak === 1 ? 'day' : 'days'}
            </div>
            <span className="text-xs text-slate-500">consistent momentum</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
            <Flame className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Weekly Chart & Urgent Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Weekly Progress Visualization (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                  <span>Weekly Study & Activity</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Focus minutes and tasks accomplished over the last 7 days
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-indigo-500 inline-block"></span>
                  <span>Focus Mins</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block"></span>
                  <span>Tasks Finished</span>
                </span>
              </div>
            </div>

            {/* Visual Bar Chart */}
            <div className="pt-4 pb-2">
              <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 px-2">
                {weeklyStats.dataByDate.map((day) => {
                  const heightPercent = Math.min(
                    100,
                    Math.max(12, Math.round((day.totalMinutes / weeklyStats.maxDayMinutes) * 100))
                  );
                  const isToday = day.dateStr === todayStr;

                  return (
                    <div
                      key={day.dateStr}
                      className="flex-1 flex flex-col items-center gap-2 h-full justify-end group"
                    >
                      {/* Tooltip on hover */}
                      <div className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-mono-numbers">
                        {day.totalMinutes}m · {day.tasksFinished}✓
                      </div>

                      {/* Bar Container */}
                      <div className="w-full max-w-[42px] bg-slate-800/60 rounded-t-lg flex flex-col justify-end overflow-hidden h-full relative">
                        {/* Focus Minutes Fill */}
                        <div
                          style={{ height: `${day.totalMinutes > 0 ? heightPercent : 6}%` }}
                          className={`w-full transition-all duration-500 rounded-t-md ${
                            isToday
                              ? 'bg-gradient-to-t from-indigo-600 to-indigo-400 shadow-sm shadow-indigo-500/30'
                              : 'bg-indigo-600/70 hover:bg-indigo-500/90'
                          }`}
                        />
                      </div>

                      {/* Day Label */}
                      <div className="text-center">
                        <span
                          className={`text-xs block font-medium ${
                            isToday ? 'text-indigo-400 font-bold' : 'text-slate-400'
                          }`}
                        >
                          {day.dayName}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {day.shortDate}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Weekly target: 12h focus</span>
              <span className="text-slate-300 font-medium">
                {formatMinutesToHours(weeklyStats.totalWeeklyMinutes)} logged ({Math.min(100, Math.round((weeklyStats.totalWeeklyMinutes / 720) * 100))}%)
              </span>
            </div>
          </div>

          {/* Today's Planned Study Sessions */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-slate-100">
                  Today's Planned Study Sessions
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Structured learning blocks for maximum retention
                </p>
              </div>
              <button
                onClick={() => setCurrentView('planner')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>Full Planner</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {todaySessions.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p>No study sessions scheduled for today.</p>
                <button
                  onClick={() => setCurrentView('planner')}
                  className="mt-2 text-xs text-indigo-400 hover:underline cursor-pointer"
                >
                  + Plan a session now
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {todaySessions.map((ses) => {
                  const subject = subjects.find((s) => s.id === ses.subjectId);
                  return (
                    <div
                      key={ses.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700/80 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: subject?.color || '#6366F1' }}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-200 truncate">
                            {ses.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                            <span>{subject?.code || 'General'}</span>
                            <span aria-hidden="true">·</span>
                            <span>{ses.durationMinutes} mins</span>
                            {ses.startTime && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span>{ses.startTime}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {ses.completed ? (
                          <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Done</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => startTimerForSession(ses.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            <Play className="w-3 h-3 fill-indigo-300" />
                            <span>Focus</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Urgent Deadlines & Tip of the Day */}
        <div className="space-y-6">
          {/* Urgent Deadlines Widget */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-slate-100">
                  Upcoming Deadlines
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Next priority assignments</p>
              </div>
              <button
                onClick={() => setCurrentView('tasks')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {upcomingDeadlines.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p>No upcoming pending tasks!</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {upcomingDeadlines.map((task) => {
                  const subject = subjects.find((s) => s.id === task.subjectId);
                  const relDue = getRelativeDueDateText(task.dueDate);

                  return (
                    <div
                      key={task.id}
                      className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition-all flex items-start gap-2.5"
                    >
                      <button
                        onClick={() => toggleTaskStatus(task.id)}
                        className="mt-0.5 text-slate-500 hover:text-indigo-400 transition-colors cursor-pointer"
                        aria-label="Toggle task complete"
                      >
                        <Circle className="w-4 h-4" />
                      </button>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-200 truncate">
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                          <span
                            className="font-medium"
                            style={{ color: subject?.color || '#94a3b8' }}
                          >
                            {subject?.code || 'Course'}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span
                            className={
                              relDue.isOverdue
                                ? 'text-rose-400 font-semibold'
                                : relDue.isUrgent
                                ? 'text-amber-400 font-medium'
                                : 'text-slate-400'
                            }
                          >
                            {relDue.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Academic Strategy / Pro-Tip Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-900/40">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-2">
              <Lightbulb className="w-4 h-4" />
              <span>Study Tip: {tip.title}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              "{tip.tip}"
            </p>
            <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>Backed by cognitive science</span>
              <button
                onClick={() => setCurrentView('timer')}
                className="text-indigo-400 hover:underline cursor-pointer"
              >
                Start sprint →
              </button>
            </div>
          </div>

          {/* Quick Enrolled Subjects Preview */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-200">Enrolled Courses</h2>
              <button
                onClick={() => setCurrentView('subjects')}
                className="text-xs text-indigo-400 hover:underline cursor-pointer"
              >
                Manage
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {subjects.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300"
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: sub.color }}
                  />
                  <span className="font-medium">{sub.code}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
