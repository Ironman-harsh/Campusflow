import React from 'react';
import { useApp } from '../../context/AppContext';
import { AppView } from '../../types';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Timer,
  StickyNote,
  BookOpen,
  Settings,
  Sparkles,
  GraduationCap,
} from 'lucide-react';
import { getTodayString } from '../../utils/dateUtils';

interface NavItem {
  id: AppView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
}

export const Sidebar: React.FC = () => {
  const { currentView, setCurrentView, tasks, settings } = useApp();
  const todayStr = getTodayString();

  // Count active tasks due today or urgent
  const dueTodayCount = tasks.filter(
    (t) => t.status !== 'completed' && (t.dueDate === todayStr || t.priority === 'urgent')
  ).length;

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, count: dueTodayCount > 0 ? dueTodayCount : undefined },
    { id: 'planner', label: 'Study Planner', icon: Calendar },
    { id: 'timer', label: 'Focus Timer', icon: Timer },
    { id: 'notes', label: 'Quick Notes', icon: StickyNote },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen bg-[#0E1526] border-r border-slate-800/80 sticky top-0 shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
          <GraduationCap className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-base tracking-tight text-white">CampusFlow</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          </div>
          <span className="text-xs text-slate-400 font-medium">Student Study OS</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Workspace
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group cursor-pointer ${
                isActive
                  ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.count !== undefined && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono-numbers">
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Student Profile Footer */}
      <div className="p-3.5 m-3 rounded-xl bg-slate-900/80 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-700/50 text-indigo-300 flex items-center justify-center font-bold text-xs uppercase">
            {settings.studentName.slice(0, 2) || 'ST'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-200 truncate">{settings.studentName}</p>
            <p className="text-[11px] text-slate-400 truncate">{settings.university || 'Active Student'}</p>
          </div>
        </div>
        <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1 text-slate-400">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>Local Storage</span>
          </span>
          <span className="text-emerald-400 font-medium">Ready</span>
        </div>
      </div>
    </aside>
  );
};
