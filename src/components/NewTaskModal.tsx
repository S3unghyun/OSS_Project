import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronDown, Check, ChevronsDown, Equal, ChevronsUp, GraduationCap, User, Users, Briefcase, Calendar, Image } from 'lucide-react';
import { Task } from '../types';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id'> & { id?: string }) => void;
  taskToEdit?: Task | null;
  defaultDueDateValue?: string;
}

export default function NewTaskModal({ isOpen, onClose, onSave, taskToEdit, defaultDueDateValue }: NewTaskModalProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('High');
  const [category, setCategory] = useState<Task['category']>('Study');
  const [dueDate, setDueDate] = useState('Tomorrow, 10:00 AM');
  const [dueDateValue, setDueDateValue] = useState('2026-06-08');

  // Trigger values prefill when editing
  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setPriority(taskToEdit.priority);
      setCategory(taskToEdit.category);
      setDueDate(taskToEdit.dueDate || 'Tomorrow, 10:00 AM');
      setDueDateValue(taskToEdit.dueDateValue || '2026-06-08');
    } else {
      // Clear for new task
      setTitle('');
      setPriority('High');
      setCategory('Study');
      
      let dateDesc = 'Tomorrow, 10:00 AM';
      if (defaultDueDateValue) {
        if (defaultDueDateValue === '2026-06-08') {
          dateDesc = 'Today, 6:00 PM';
        } else {
          dateDesc = `${defaultDueDateValue} 18:00`;
        }
      }
      setDueDate(dateDesc);
      setDueDateValue(defaultDueDateValue || '2026-06-08');
    }
  }, [taskToEdit, isOpen, defaultDueDateValue]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      ...(taskToEdit ? { id: taskToEdit.id } : {}),
      title: title.trim(),
      priority,
      category,
      dueDate,
      dueDateValue,
      status: taskToEdit ? taskToEdit.status : 'To Do'
    } as any);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-surface-bg overflow-y-auto pb-44 animate-fadeIn">
      {/* Top Header Row with back arrow exactly as screenshot 4 */}
      <header className="sticky top-0 z-30 flex justify-between items-center bg-surface-bg/90 backdrop-blur-md px-5 h-14 w-full border-b border-outline-variant/10">
        <button
          onClick={onClose}
          className="active:scale-95 transition-all flex items-center justify-center h-10 w-10 text-primary hover:bg-surface-container rounded-full"
          title="Back"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
        </button>
        <h1 className="text-lg font-extrabold text-primary tracking-tight">
          {taskToEdit ? 'Edit Task' : 'New Task'}
        </h1>
        <div className="w-10"></div> {/* Spacer balance */}
      </header>

      {/* Main Form Fields Layout */}
      <main className="flex-1 px-5 pt-6 max-w-xl mx-auto w-full space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* TASK NAME Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-outline uppercase tracking-wider block">
              TASK NAME
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              required
              className="w-full bg-slate-100 placeholder:text-outline border-none rounded-xl px-4 py-4 focus:ring-2 focus:ring-primary outline-none text-base font-medium shadow-sm transition-all focus:bg-slate-50/50 text-on-surface"
            />
          </div>

          {/* PRIORITY LEVEL Selector with exact design icons */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-outline uppercase tracking-wider block">
              PRIORITY LEVEL
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {/* Low Priority toggle */}
              <button
                type="button"
                onClick={() => setPriority('Low')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all active:scale-95 cursor-pointer ${
                  priority === 'Low'
                    ? 'border-success-emerald ring-2 ring-success-container/30 bg-success-container/10 text-success-emerald font-semibold shadow-sm'
                    : 'border-outline-variant/35 bg-surface-container-lowest text-on-surface-variant hover:border-outline'
                }`}
              >
                <ChevronsDown className="w-5 h-5 mb-1 text-success-emerald" />
                <span className="text-xs">Low</span>
              </button>

              {/* Medium Priority toggle */}
              <button
                type="button"
                onClick={() => setPriority('Medium')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all active:scale-95 cursor-pointer ${
                  priority === 'Medium'
                    ? 'border-warning-amber ring-2 ring-warning-container/30 bg-warning-container/15 text-warning-amber font-semibold shadow-sm'
                    : 'border-outline-variant/35 bg-surface-container-lowest text-on-surface-variant hover:border-outline'
                }`}
              >
                <Equal className="w-5 h-5 mb-1 text-warning-amber" />
                <span className="text-xs">Medium</span>
              </button>

              {/* High Priority toggle */}
              <button
                type="button"
                onClick={() => setPriority('High')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all active:scale-95 cursor-pointer ${
                  priority === 'High'
                    ? 'border-danger-rose ring-2 ring-danger-container/30 bg-danger-container/15 text-danger-rose font-semibold shadow-sm'
                    : 'border-outline-variant/35 bg-surface-container-lowest text-on-surface-variant hover:border-outline'
                }`}
              >
                <ChevronsUp className="w-5 h-5 mb-1 text-danger-rose" />
                <span className="text-xs">High</span>
              </button>
            </div>
          </div>

          {/* CATEGORY Selection buttons */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-outline uppercase tracking-wider block">
              CATEGORY
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              {/* Study */}
              <button
                type="button"
                onClick={() => setCategory('Study')}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all active:scale-95 cursor-pointer ${
                  category === 'Study'
                    ? 'border-primary ring-2 ring-primary/10 bg-primary/5'
                    : 'border-transparent bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold">Study</span>
              </button>

              {/* Personal */}
              <button
                type="button"
                onClick={() => setCategory('Personal')}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all active:scale-95 cursor-pointer ${
                  category === 'Personal'
                    ? 'border-primary ring-2 ring-primary/10 bg-primary/5'
                    : 'border-transparent bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-success-container/35 flex items-center justify-center text-success-emerald">
                  <User className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold">Personal</span>
              </button>

              {/* Team Project */}
              <button
                type="button"
                onClick={() => setCategory('Team Project')}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all active:scale-95 cursor-pointer ${
                  category === 'Team Project'
                    ? 'border-primary ring-2 ring-primary/10 bg-primary/5'
                    : 'border-transparent bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-danger-container/35 flex items-center justify-center text-danger-rose">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold">Team Project</span>
              </button>

              {/* Work */}
              <button
                type="button"
                onClick={() => setCategory('Work')}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all active:scale-95 cursor-pointer ${
                  category === 'Work'
                    ? 'border-primary ring-2 ring-primary/10 bg-primary/5'
                    : 'border-transparent bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-inverse-surface/10 flex items-center justify-center text-inverse-surface">
                  <Briefcase className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold">Work</span>
              </button>
            </div>
          </div>

          {/* DUE DATE Field */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-outline uppercase tracking-wider block">
                DUE DATE DESCRIPTION (READABLE STRING)
              </label>
              <div className="relative group/input">
                <input
                  type="text"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  placeholder="Tomorrow, 10:00 AM"
                  className="w-full bg-slate-100 placeholder:text-outline border-none rounded-xl px-4 py-4 focus:ring-2 focus:ring-primary outline-none text-base font-medium transition-all text-on-surface"
                />
                <Calendar className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-outline group-hover/input:text-primary transition-colors pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-outline uppercase tracking-wider block">
                DUE DATE VALUE (STANDARD CALENDAR FOR SORTING)
              </label>
              <input
                type="date"
                value={dueDateValue}
                onChange={(e) => setDueDateValue(e.target.value)}
                required
                className="w-full bg-slate-100 border-none rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-primary outline-none text-sm font-semibold transition-all text-on-surface"
              />
            </div>
          </div>

          {/* Focus Mode promo block perfectly styled as screenshot 4 */}
          <div className="relative h-32 rounded-2xl overflow-hidden shadow-sm group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/15 to-transparent z-10 pointer-events-none"></div>
            <img
              alt="Desk visual workspace"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtZ9t5rrJfNkQxLPjnZHTZQLc1IthQ-9Bip3dbEeg4qnPJOCZ2su6ulKnfJH6_dwsR7O7osgF71DauQwRT-ULX1hGFFoI5pvrj0z96a_mTcg5WVXgEtwYR3qGiQiVwH3-UF1A_K9D-D5QdFzgSMbuQgRW0OzlPgRNGJ85mQIogZSh5TedPMhVEr4y0GwtsbyoBCz57VDGDjUAZM3CH_l3morXmKzvZUmu9Zxzz-_dcBkXhzoi2nCCSPj5P-fup7N-TqDjQ13dMUA"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover grayscale opacity-45 group-hover:grayscale-0 transition-all duration-700 pointer-events-none"
            />
            <div className="absolute inset-0 p-6 flex flex-col justify-end z-20">
              <p className="text-[10px] font-extrabold text-primary uppercase tracking-widest leading-none">
                Focus Mode
              </p>
              <p className="text-on-surface font-extrabold text-sm mt-1">
                Ready to crush your goals?
              </p>
            </div>
          </div>
        </form>
      </main>

      {/* Fixed bottom actions row adhering precisely to layout */}
      <footer className="fixed bottom-0 left-0 right-0 bg-surface-container-lowest p-5 border-t border-outline-variant/20 flex flex-col gap-2.5 max-w-xl mx-auto rounded-t-2xl shadow-xl z-50">
        <button
          onClick={handleSubmit}
          className="bg-primary text-on-primary font-bold text-sm py-4 rounded-xl w-full active:scale-[0.98] hover:opacity-95 transition-all shadow-md hover:bg-primary-container cursor-pointer text-center"
        >
          {taskToEdit ? 'Save Changes' : 'Save Task'}
        </button>
        <button
          onClick={onClose}
          className="bg-transparent text-primary border border-primary/20 font-bold text-xs py-3 rounded-xl w-full active:scale-[0.98] hover:bg-primary/5 transition-all cursor-pointer text-center"
        >
          Cancel
        </button>
      </footer>
    </div>
  );
}
