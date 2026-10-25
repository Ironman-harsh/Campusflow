import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/navigation/Sidebar';
import { MobileNavbar } from './components/navigation/MobileNavbar';
import { ToastContainer } from './components/common/ToastContainer';
import { DashboardView } from './components/dashboard/DashboardView';
import { TaskManagerView } from './components/tasks/TaskManagerView';
import { StudyPlannerView } from './components/planner/StudyPlannerView';
import { FocusTimerView } from './components/timer/FocusTimerView';
import { QuickNotesView } from './components/notes/QuickNotesView';
import { SubjectsView } from './components/subjects/SubjectsView';
import { SettingsView } from './components/settings/SettingsView';
import { TaskModal } from './components/tasks/TaskModal';

const AppContent: React.FC = () => {
  const { currentView } = useApp();
  const [globalTaskModalOpen, setGlobalTaskModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#0B0F19] text-slate-100 font-sans antialiased selection:bg-indigo-600 selection:text-white">
      {/* Desktop Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Navbar Header & Drawer */}
        <MobileNavbar />

        {/* View Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-12">
          {currentView === 'dashboard' && (
            <DashboardView onNewTaskClick={() => setGlobalTaskModalOpen(true)} />
          )}
          {currentView === 'tasks' && <TaskManagerView />}
          {currentView === 'planner' && <StudyPlannerView />}
          {currentView === 'timer' && <FocusTimerView />}
          {currentView === 'notes' && <QuickNotesView />}
          {currentView === 'subjects' && <SubjectsView />}
          {currentView === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global Quick Task Modal */}
      <TaskModal
        isOpen={globalTaskModalOpen}
        onClose={() => setGlobalTaskModalOpen(false)}
      />

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
