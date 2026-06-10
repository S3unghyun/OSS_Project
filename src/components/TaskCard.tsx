import React from 'react';
import { Check, Edit2, Trash2, Briefcase, User, GraduationCap, Users, Calendar, Clock, Flame } from 'lucide-react';
import { Task } from '../types';

interface TaskCardProps {
  key?: string;
  task: Task;
  onToggleStatus: (id: string) => void;
  onStatusChange: (id: string, status: Task['status']) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onPostpone?: (id: string) => void;
}

export default function TaskCard({
  task,
  onToggleStatus,
  onStatusChange,
  onEdit,
  onDelete,
  onPostpone
}: TaskCardProps) {
  const isCompleted = task.status === 'Completed';
  const postpones = task.postponeCount || 0;

  // Category Icon Map
  const getCategoryIcon = (cat: Task['category']) => {
    switch (cat) {
      case 'Work':
        return <Briefcase className="w-3.5 h-3.5" />;
      case 'Personal':
        return <User className="w-3.5 h-3.5" />;
      case 'Study':
        return <GraduationCap className="w-3.5 h-3.5" />;
      case 'Team Project':
        return <Users className="w-3.5 h-3.5" />;
      default:
        return <Briefcase className="w-3.5 h-3.5" />;
    }
  };

  // Priority Color Map
  const getPriorityClasses = (prio: Task['priority']) => {
    switch (prio) {
      case 'High':
        return 'bg-danger-container text-on-danger-container border-danger-container';
      case 'Medium':
        return 'bg-warning-container text-on-warning-container border-warning-container';
      case 'Low':
        return 'bg-surface-container-highest text-on-surface-variant border-surface-container-highest';
      default:
        return 'bg-surface-container-highest text-on-surface-variant border-surface-container';
    }
  };

  // Border and shadow styling for procrastination warnings
  let postponeStyles = 'border-outline-variant/10';
  if (!isCompleted) {
    if (postpones === 1) {
      postponeStyles = 'border-amber-500 dark:border-amber-500/80 shadow-[0_0_10px_rgba(245,158,11,0.25)] ring-1 ring-amber-500/10';
    } else if (postpones >= 2) {
      postponeStyles = 'border-red-500 dark:border-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.6)] ring-2 ring-red-500/50 animate-[pulse_1.2s_infinite] bg-red-50/5 dark:bg-red-950/5';
    }
  }

  return (
    <div
      className={`fade-in bg-surface-container-lowest p-4 rounded-xl flex items-start gap-4 border shadow-[0px_4px_12px_rgba(0,0,0,0.02)] transition-all duration-200 hover:shadow-[0px_6px_16px_rgba(48,47,57,0.04)] ${postponeStyles} ${
        isCompleted ? 'opacity-60 shadow-none' : ''
      }`}
    >
      {/* Checkbox Button */}
      <div className="mt-1 flex-shrink-0">
        <button
          onClick={() => onToggleStatus(task.id)}
          className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
            isCompleted
              ? 'bg-primary border-primary text-white scale-100'
              : 'border-outline hover:border-primary-container hover:scale-105'
          }`}
          aria-label="Toggle Complete"
        >
          {isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
        </button>
      </div>

      {/* Title & Badge Metadata */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          {postpones >= 2 && !isCompleted && (
            <Flame className="w-4.5 h-4.5 text-red-500 fill-red-500 animate-[bounce_1s_infinite] shrink-0" />
          )}
          <h4
            className={`text-base font-semibold text-on-surface leading-tight transition-all truncate ${
              isCompleted ? 'line-through text-on-surface-variant/70' : ''
            }`}
          >
            {task.title}
          </h4>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2 items-center">
          {/* Priority Badge */}
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getPriorityClasses(
              task.priority
            )}`}
          >
            {task.priority}
          </span>

          {/* Category Badge */}
          <div className="flex items-center gap-1 text-on-surface-variant text-[11px] font-medium py-0.5 px-1.5 rounded-md bg-surface-container-low/50">
            <span className="text-primary-container">{getCategoryIcon(task.category)}</span>
            <span>{task.category}</span>
          </div>

          {/* Due date badge if exists */}
          {task.dueDate && (
            <div className="flex items-center gap-1 text-[11px] text-outline font-medium">
              <Calendar className="w-3 h-3 text-outline/80" />
              <span>{task.dueDate}</span>
            </div>
          )}

          {/* Postpone Count badge */}
          {postpones > 0 && !isCompleted && (
            <span className={`flex items-center gap-0.5 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border ${
              postpones >= 2 
                ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/50' 
                : 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50'
            }`}>
              <Clock className="w-2.5 h-2.5 animate-spin" style={{ animationDuration: postpones >= 2 ? '3s' : '6s' }} />
              <span>미루기 +{postpones}회</span>
            </span>
          )}
        </div>
      </div>

      {/* Right Column: Status Select dropdown & Edit/Delete/Postpone buttons */}
      <div className="flex flex-col items-end gap-3 flex-shrink-0">
        {/* Status Dropdown conforming to mockups */}
        <div className="relative">
          <select
            value={task.status}
            onChange={(e) => onStatusChange(task.id, e.target.value as Task['status'])}
            className="text-[11px] bg-surface-container font-semibold py-1 px-2 pr-4 rounded-lg border-none focus:ring-1 focus:ring-primary/20 shadow-sm cursor-pointer text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Done</option>
          </select>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 items-center">
          {onPostpone && !isCompleted && (
            <button
              onClick={() => onPostpone(task.id)}
              className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 transition-all p-1 hover:bg-amber-100 dark:hover:bg-amber-950/50 rounded flex items-center justify-center hover:scale-105 active:scale-95"
              title="하루 미루기 (마감 연장)"
            >
              <Clock className="w-4 h-4 font-bold" />
            </button>
          )}
          <button
            onClick={() => onEdit(task)}
            className="text-on-surface-variant hover:text-primary transition-colors p-1 hover:bg-surface-container rounded"
            title="Edit Task"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="text-on-surface-variant hover:text-danger-rose transition-colors p-1 hover:bg-danger-container/10 rounded"
            title="Delete Task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
