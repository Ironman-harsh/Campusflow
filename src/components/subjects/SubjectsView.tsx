import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Subject } from '../../types';
import {
  Plus,
  BookOpen,
  Edit2,
  Trash2,
  CheckSquare,
  Clock,
  StickyNote,
  GraduationCap,
} from 'lucide-react';
import { SubjectModal } from './SubjectModal';
import { ConfirmModal } from '../common/ConfirmModal';
import { formatMinutesToHours } from '../../utils/dateUtils';

export const SubjectsView: React.FC = () => {
  const { subjects, tasks, studySessions, notes, deleteSubject } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleEdit = (sub: Subject) => {
    setEditingSubject(sub);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditingSubject(null);
    setModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmId) {
      deleteSubject(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const totalCredits = subjects.reduce((sum, s) => sum + (s.credits || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Enrolled Subjects</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your courses, color markers, professors, and credit load
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-md shadow-indigo-600/20 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subject</span>
        </button>
      </div>

      {/* Summary Banner */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              Current Academic Load
            </h2>
            <p className="text-xs text-slate-400">
              {subjects.length} registered courses · {totalCredits} total credit hours
            </p>
          </div>
        </div>
      </div>

      {/* Subjects Grid */}
      {subjects.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-200">No subjects added yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Add your semester courses to color-code your tasks, planner, and notes.
          </p>
          <button
            onClick={handleCreate}
            className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            + Add First Subject
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((sub) => {
            const activeTasksCount = tasks.filter(
              (t) => t.subjectId === sub.id && t.status !== 'completed'
            ).length;
            const completedTasksCount = tasks.filter(
              (t) => t.subjectId === sub.id && t.status === 'completed'
            ).length;

            const plannedMinutes = studySessions
              .filter((s) => s.subjectId === sub.id)
              .reduce((sum, s) => sum + s.durationMinutes, 0);

            const relatedNotesCount = notes.filter((n) => n.subjectId === sub.id).length;

            return (
              <div
                key={sub.id}
                className="group p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 transition-all shadow-md flex flex-col justify-between gap-4"
              >
                <div>
                  {/* Top Bar with Accent pill and Actions */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3.5 h-3.5 rounded-full ring-2 ring-slate-800"
                        style={{ backgroundColor: sub.color }}
                      />
                      <span className="font-extrabold text-sm tracking-tight text-white uppercase font-mono-numbers">
                        {sub.code}
                      </span>
                      {sub.credits && (
                        <span className="text-[11px] text-slate-400 font-mono-numbers">
                          ({sub.credits} credits)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(sub)}
                        className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Edit course"
                        aria-label="Edit course"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setDeleteConfirmId(sub.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                        title="Delete course"
                        aria-label="Delete course"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-100 group-hover:text-white transition-colors">
                    {sub.name}
                  </h3>

                  {sub.instructor && (
                    <p className="text-xs text-slate-400 mt-1">
                      Instructor: <span className="text-slate-300 font-medium">{sub.instructor}</span>
                    </p>
                  )}
                </div>

                {/* Metrics Breakdown */}
                <div className="pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-slate-800/40 border border-slate-800/60">
                    <div className="flex items-center justify-center gap-1 text-slate-400 mb-0.5">
                      <CheckSquare className="w-3 h-3" />
                      <span className="text-[10px]">Tasks</span>
                    </div>
                    <span className="font-bold text-slate-200 font-mono-numbers">
                      {activeTasksCount} <span className="text-[10px] text-slate-500 font-normal">({completedTasksCount}✓)</span>
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-800/40 border border-slate-800/60">
                    <div className="flex items-center justify-center gap-1 text-slate-400 mb-0.5">
                      <Clock className="w-3 h-3" />
                      <span className="text-[10px]">Study</span>
                    </div>
                    <span className="font-bold text-slate-200 font-mono-numbers">
                      {formatMinutesToHours(plannedMinutes)}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-800/40 border border-slate-800/60">
                    <div className="flex items-center justify-center gap-1 text-slate-400 mb-0.5">
                      <StickyNote className="w-3 h-3" />
                      <span className="text-[10px]">Notes</span>
                    </div>
                    <span className="font-bold text-slate-200 font-mono-numbers">
                      {relatedNotesCount}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Subject Modal */}
      <SubjectModal
        isOpen={modalOpen}
        subjectToEdit={editingSubject}
        onClose={() => {
          setModalOpen(false);
          setEditingSubject(null);
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deleteConfirmId !== null}
        title="Delete Subject"
        message="Are you sure you want to delete this course? Associated tasks, notes, and study sessions will remain but will no longer have a subject assigned."
        confirmLabel="Delete Subject"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
};
