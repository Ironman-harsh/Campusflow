import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { QuickNote } from '../../types';
import {
  Plus,
  Search,
  Pin,
  Edit2,
  Trash2,
  Copy,
  StickyNote,
  Sparkles,
} from 'lucide-react';
import { NoteModal } from './NoteModal';
import { ConfirmModal } from '../common/ConfirmModal';

export const QuickNotesView: React.FC = () => {
  const { notes, subjects, deleteNote, togglePinNote, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubjectId, setFilterSubjectId] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<QuickNote | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredNotes = useMemo(() => {
    return notes
      .filter((note) => {
        if (filterSubjectId !== 'all' && note.subjectId !== filterSubjectId) {
          return false;
        }

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = note.title.toLowerCase().includes(q);
          const matchContent = note.content.toLowerCase().includes(q);
          const matchTags = note.tags?.some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchContent && !matchTags) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Pinned notes always first
        if (a.isPinned !== b.isPinned) {
          return a.isPinned ? -1 : 1;
        }
        return b.updatedAt.localeCompare(a.updatedAt);
      });
  }, [notes, filterSubjectId, searchQuery]);

  const handleEdit = (note: QuickNote) => {
    setEditingNote(note);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditingNote(null);
    setModalOpen(true);
  };

  const handleCopy = (content: string, title: string) => {
    navigator.clipboard.writeText(`${title}\n\n${content}`);
    showToast('Copied note to clipboard', 'success');
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmId) {
      deleteNote(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Quick Notes</h1>
          <p className="text-sm text-slate-400 mt-1">
            Capture formulas, reminders, lecture insights, and exam checklists
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-md shadow-indigo-600/20 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>

      {/* Control Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes or tags..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Course:</span>
          <select
            value={filterSubjectId}
            onChange={(e) => setFilterSubjectId(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-hidden focus:border-indigo-500"
          >
            <option value="all">All Courses</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-3">
            <StickyNote className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-200">No notes found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchQuery || filterSubjectId !== 'all'
              ? 'Try relaxing your search terms or course filter.'
              : 'Keep track of key concepts, formulas, and study links by writing your first note.'}
          </p>
          <button
            onClick={handleCreate}
            className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            + Create Quick Note
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => {
            const subject = subjects.find((s) => s.id === note.subjectId);
            const dateStr = new Date(note.updatedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            });

            return (
              <div
                key={note.id}
                className={`group p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                  note.isPinned
                    ? 'bg-slate-900/95 border-amber-500/30 shadow-md shadow-amber-500/5'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700/80 hover:shadow-lg'
                }`}
              >
                <div>
                  {/* Top metadata row */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {subject ? (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 truncate">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: subject.color }}
                          />
                          <span>{subject.code}</span>
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">General</span>
                      )}
                      <span className="text-slate-600" aria-hidden="true">·</span>
                      <span className="text-[11px] text-slate-400 font-mono-numbers">{dateStr}</span>
                    </div>

                    <button
                      onClick={() => togglePinNote(note.id)}
                      className={`p-1 rounded-md transition-colors cursor-pointer ${
                        note.isPinned
                          ? 'text-amber-400 hover:text-amber-300'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                      title={note.isPinned ? 'Unpin note' : 'Pin note to top'}
                      aria-label="Toggle pin"
                    >
                      <Pin className={`w-3.5 h-3.5 ${note.isPinned ? 'fill-amber-400' : ''}`} />
                    </button>
                  </div>

                  {/* Note Title */}
                  <h3 className="text-base font-bold text-slate-100 group-hover:text-white transition-colors">
                    {note.title}
                  </h3>

                  {/* Note Content preview */}
                  <div className="mt-2 text-xs text-slate-300/90 whitespace-pre-line leading-relaxed font-mono-numbers line-clamp-6 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                    {note.content || '(Empty note content)'}
                  </div>

                  {/* Tag list (clean unboxed text with separators per design rules) */}
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap mt-3 text-[11px] text-slate-400">
                      {note.tags.map((tag, idx) => (
                        <React.Fragment key={tag}>
                          <span className="hover:text-slate-200">#{tag}</span>
                          {idx < note.tags.length - 1 && (
                            <span className="text-slate-600" aria-hidden="true">·</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer action buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
                  <button
                    onClick={() => handleCopy(note.content, note.title)}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                    title="Copy note text"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(note)}
                      className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="Edit note"
                      aria-label="Edit note"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setDeleteConfirmId(note.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Delete note"
                      aria-label="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Note Modal */}
      <NoteModal
        isOpen={modalOpen}
        noteToEdit={editingNote}
        onClose={() => {
          setModalOpen(false);
          setEditingNote(null);
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deleteConfirmId !== null}
        title="Delete Quick Note"
        message="Are you sure you want to permanently delete this note?"
        confirmLabel="Delete"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
};
