import React from 'react';
import { Check, Edit2, Trash2, Briefcase, User, GraduationCap, Users, Calendar } from 'lucide-react';
import { Task } from '../types';

interface TaskCardProps {
  key?: string;
  task: Task;
  onToggleStatus: (id: string) => void;
  onStatusChange: (id: string, status: Task['status']) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export default function TaskCard({
  task,
  onToggleStatus,
  onStatusChange,
  onEdit,
  onDelete
}: TaskCardProps) {
  const isCompleted = task.status === 'Completed';

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

  return (
    <div
      className={`fade-in bg-surface-container-lowest p-4 rounded-xl flex items-start gap-4 border border-outline-variant/10 shadow-[0px_4px_12px_rgba(0,0,0,0.02)] transition-all duration-200 hover:shadow-[0px_6px_16px_rgba(48,47,57,0.04)] ${
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
        <h4
          className={`text-base font-semibold text-on-surface leading-tight transition-all truncate ${
            isCompleted ? 'line-through text-on-surface-variant/70' : ''
          }`}
        >
          {task.title}
        </h4>
        
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
        </div>
      </div>

      {/* Right Column: Status Select dropdown & Edit/Delete buttons */}
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
        <div className="flex gap-2.5">
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
