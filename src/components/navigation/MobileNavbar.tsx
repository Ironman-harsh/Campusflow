import React, { useState } from 'react';
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
  GraduationCap,
  Menu,
  X,
} from 'lucide-react';
import { getTodayString } from '../../utils/dateUtils';

export const MobileNavbar: React.FC = () => {
  const { currentView, setCurrentView, tasks, settings } = useApp();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const todayStr = getTodayString();

  const dueCount = tasks.filter(
    (t) => t.status !== 'completed' && (t.dueDate === todayStr || t.priority === 'urgent')
  ).length;

  const allItems: { id: AppView; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'planner', label: 'Planner', icon: Calendar },
    { id: 'timer', label: 'Focus Timer', icon: Timer },
    { id: 'notes', label: 'Quick Notes', icon: StickyNote },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const bottomItems: { id: AppView; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'planner', label: 'Planner', icon: Calendar },
    { id: 'timer', label: 'Timer', icon: Timer },
  ];

  const handleSelectView = (view: AppView) => {
    setCurrentView(view);
    setDrawerOpen(false);
  };

  return (
    <>
      {/* Mobile Top Header */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#0E1526] border-b border-slate-800/80 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-white block">CampusFlow</span>
            <span className="text-[10px] text-slate-400 capitalize">{currentView}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {dueCount > 0 && (
            <button
              onClick={() => setCurrentView('tasks')}
              className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono-numbers border border-indigo-500/30"
              aria-label={`${dueCount} tasks due`}
            >
              {dueCount} due
            </button>
          )}

          <button
            onClick={() => setDrawerOpen(!drawerOpen)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 bg-slate-850 hover:bg-slate-800 border border-slate-800 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {drawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="w-4/5 max-w-xs h-full bg-[#0E1526] border-l border-slate-800 p-5 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-400" />
                <span className="font-bold text-slate-100">CampusFlow</span>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 border-b border-slate-800">
              <p className="text-sm font-semibold text-slate-200">{settings.studentName}</p>
              <p className="text-xs text-slate-400">{settings.university || 'Active Student'}</p>
            </div>

            <nav className="flex-1 py-4 space-y-1.5 overflow-y-auto">
              {allItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectView(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 text-center">
              CampusFlow · Offline LocalStorage
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0E1526]/95 backdrop-blur-md border-t border-slate-800/90 px-3 py-2 flex items-center justify-around">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors cursor-pointer ${
                isActive ? 'text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => setDrawerOpen(true)}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors cursor-pointer ${
            ['notes', 'subjects', 'settings'].includes(currentView)
              ? 'text-indigo-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Menu className="w-4 h-4" />
          <span className="text-[10px]">More</span>
        </button>
      </nav>
    </>
  );
};
