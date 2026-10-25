import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Subject } from '../../types';
import { SUBJECT_COLORS } from '../../utils/storage';
import { X, AlertCircle, Palette } from 'lucide-react';

interface SubjectModalProps {
  isOpen: boolean;
  subjectToEdit?: Subject | null;
  onClose: () => void;
}

export const SubjectModal: React.FC<SubjectModalProps> = ({
  isOpen,
  subjectToEdit,
  onClose,
}) => {
  const { addSubject, updateSubject } = useApp();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [color, setColor] = useState(SUBJECT_COLORS[0].hex);
  const [instructor, setInstructor] = useState('');
  const [credits, setCredits] = useState('3');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (subjectToEdit) {
      setName(subjectToEdit.name);
      setCode(subjectToEdit.code);
      setColor(subjectToEdit.color);
      setInstructor(subjectToEdit.instructor || '');
      setCredits(subjectToEdit.credits ? String(subjectToEdit.credits) : '3');
    } else {
      setName('');
      setCode('');
      setColor(SUBJECT_COLORS[Math.floor(Math.random() * SUBJECT_COLORS.length)].hex);
      setInstructor('');
      setCredits('3');
    }
    setErrorMessage('');
  }, [subjectToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Course name is required.');
      return;
    }
    if (!code.trim()) {
      setErrorMessage('Course code is required (e.g. CS 201).');
      return;
    }

    const credNum = parseInt(credits, 10);

    if (subjectToEdit) {
      updateSubject(subjectToEdit.id, {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        color,
        instructor: instructor.trim() || undefined,
        credits: isNaN(credNum) ? undefined : credNum,
      });
    } else {
      addSubject({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        color,
        instructor: instructor.trim() || undefined,
        credits: isNaN(credNum) ? undefined : credNum,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="subject-modal-title"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <h2 id="subject-modal-title" className="text-lg font-bold text-slate-100">
            {subjectToEdit ? 'Edit Subject' : 'Add Enrolled Subject'}
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

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Code <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. CS 201"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 text-sm focus:outline-hidden focus:border-indigo-500 uppercase font-bold"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Subject / Course Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Data Structures & Algorithms"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 text-sm focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Professor / Instructor
              </label>
              <input
                type="text"
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                placeholder="e.g. Prof. Miller"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 text-sm focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Credit Hours
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={credits}
                onChange={(e) => setCredits(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 text-sm focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Color Palette Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-slate-400" />
              <span>Color Accent</span>
            </label>
            <div className="flex items-center gap-2.5 flex-wrap">
              {SUBJECT_COLORS.map((c) => {
                const isSelected = color.toLowerCase() === c.hex.toLowerCase();
                return (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setColor(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    className={`w-7 h-7 rounded-full transition-transform cursor-pointer relative ${
                      isSelected
                        ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900 shadow-md'
                        : 'opacity-80 hover:opacity-100 hover:scale-110'
                    }`}
                    title={c.name}
                    aria-label={`Select ${c.name} color`}
                  />
                );
              })}
            </div>
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
              {subjectToEdit ? 'Save Changes' : 'Add Subject'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
