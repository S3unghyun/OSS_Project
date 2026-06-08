import React, { useState } from 'react';
import { Plus, ListTodo } from 'lucide-react';
import { Task } from '../types';
import TaskCard from './TaskCard';

interface AllTasksViewProps {
  tasks: Task[];
  onToggleStatus: (id: string) => void;
  onStatusChange: (id: string, status: Task['status']) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onOpenNewTaskModal: () => void;
  onNavigateToTab: (tab: 'All Tasks' | 'Categories' | 'Settings') => void;
  avatarUrl: string;
}

export default function AllTasksView({
  tasks,
  onToggleStatus,
  onStatusChange,
  onEdit,
  onDelete,
  onOpenNewTaskModal,
  onNavigateToTab,
  avatarUrl
}: AllTasksViewProps) {
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Study' | 'Personal' | 'Project' | 'Work'>('All');

  // Filter Tasks
  const filteredTasks = tasks.filter((task) => {
    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'Project') return task.category === 'Team Project';
    return task.category === selectedFilter;
  });

  // Calculate Progress stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Circle progress math
  const strokeCircumference = 175.9; // 2 * Math.PI * 28 original spec
  const strokeOffset = strokeCircumference - (strokeCircumference * (progressPercentage / 100));

  const filters: Array<'All' | 'Study' | 'Personal' | 'Project' | 'Work'> = [
    'All',
    'Study',
    'Personal',
    'Project',
    'Work'
  ];

  return (
    <div className="space-y-6 pb-28">
      {/* Top Header */}
      <header className="sticky top-0 z-30 flex justify-between items-center bg-surface-bg/85 backdrop-blur-md py-4 w-full">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-xl text-primary">
            <ListTodo className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h1 className="text-xl font-bold text-primary tracking-tight">Tasks</h1>
        </div>
        <button
          onClick={() => onNavigateToTab('Settings')}
          className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container hover:opacity-85 active:scale-95 transition-all duration-200 shadow-sm"
          title="Account Settings"
        >
          <img
            alt="Profile Avatar"
            src={avatarUrl}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </button>
      </header>

      {/* Today's Progress Card */}
      <section className="bg-primary-container text-on-primary-container p-5 rounded-2xl shadow-md relative overflow-hidden transition-all duration-300 hover:shadow-lg">
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Today's Progress</h2>
            <p className="text-sm font-medium opacity-90 mt-1">
              {completedTasks} of {totalTasks} tasks completed
            </p>
          </div>
          
          <div className="relative flex items-center justify-center w-16 h-16 flex-shrink-0">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle
                className="opacity-20 stroke-current text-white"
                cx="32"
                cy="32"
                fill="transparent"
                r="28"
                strokeWidth="5"
              />
              <circle
                className="transition-all duration-500 ease-out stroke-current text-white"
                cx="32"
                cy="32"
                fill="transparent"
                r="28"
                strokeWidth="5"
                strokeDasharray={strokeCircumference}
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-xs font-bold text-white tracking-wider">
              {progressPercentage}%
            </span>
          </div>
        </div>
        {/* Decorative Background Circles */}
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full pointer-events-none"></div>
        <div className="absolute left-1/3 -top-10 w-20 h-20 bg-white/5 rounded-full pointer-events-none"></div>
      </section>

      {/* Filter Chips navigation */}
      <nav className="flex gap-2.5 overflow-x-auto pb-1.5 custom-scrollbar scrolling-touch">
        {filters.map((filter) => {
          const isActive = selectedFilter === filter;
          return (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-all ${
                isActive
                  ? 'bg-secondary-container text-on-secondary-container scale-100 shadow-sm'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              {filter}
            </button>
          );
        })}
      </nav>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleStatus={onToggleStatus}
              onStatusChange={onStatusChange}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        ) : (
          <div className="text-center py-12 px-6 bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/30">
            <ListTodo className="w-12 h-12 text-outline/40 mx-auto stroke-[1.5] mb-3" />
            <p className="text-sm font-semibold text-on-surface-variant">No tasks found</p>
            <p className="text-xs text-outline mt-1 max-w-xs mx-auto">
              There are no tasks for {selectedFilter === 'All' ? 'this filter' : selectedFilter}. Add a new task now!
            </p>
          </div>
        )}
      </div>

      {/* Plus FAB Button */}
      <button
        onClick={onOpenNewTaskModal}
        className="fixed right-6 bottom-24 w-14 h-14 bg-primary text-on-primary rounded-2xl shadow-xl flex items-center justify-center hover:opacity-90 active:scale-95 hover:scale-105 transition-all duration-200 z-40 group cursor-pointer"
        title="Add New Task"
      >
        <Plus className="w-7 h-7 stroke-[2.5]" />
      </button>
    </div>
  );
}
