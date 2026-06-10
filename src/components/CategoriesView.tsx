import React, { useState } from 'react';
import { Briefcase, User, GraduationCap, Users, CalendarCheck2, ListTodo } from 'lucide-react';
import { Task } from '../types';
import TaskCard from './TaskCard';

interface CategoriesViewProps {
  tasks: Task[];
  onToggleStatus: (id: string) => void;
  onStatusChange: (id: string, status: Task['status']) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onPostpone?: (id: string) => void;
}

export default function CategoriesView({
  tasks,
  onToggleStatus,
  onStatusChange,
  onEdit,
  onDelete,
  onPostpone
}: CategoriesViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<Task['category'] | 'All'>('All');

  // Dynamic calculations
  const getCount = (cat: Task['category']) => tasks.filter((t) => t.category === cat).length;
  
  const workCount = getCount('Work');
  const personalCount = getCount('Personal');
  const studyCount = getCount('Study');
  const teamCount = getCount('Team Project');

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  let overallPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Render list of filtered tasks
  const filteredTasks = selectedCategory === 'All' 
    ? tasks 
    : tasks.filter((t) => t.category === selectedCategory);

  // Circle progress calculations for the header
  const strokeCircumference = 150.8; // 2 * Math.PI * 24 spec original
  const strokeOffset = strokeCircumference - (strokeCircumference * (overallPercentage / 100));

  return (
    <div className="space-y-6 pb-28">
      {/* Top Header */}
      <header className="sticky top-0 z-30 flex justify-between items-center bg-surface-bg/85 backdrop-blur-md py-4 w-full">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-xl text-primary">
            <CalendarCheck2 className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h1 className="text-xl font-bold text-primary tracking-tight">Tasks</h1>
        </div>
      </header>

      {/* Progress Header Card */}
      <section className="flex items-center justify-between bg-surface-container-low p-5 rounded-2xl border border-outline-variant/25 shadow-sm">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-on-surface">Categories</h2>
          <p className="text-xs text-on-surface-variant font-medium mt-1">Organize your daily roadmap</p>
        </div>
        
        <div className="relative w-14 h-14 flex items-center justify-center flex-shrink-0">
          <svg className="w-14 h-14 transform -rotate-90">
            <circle
              className="text-surface-container-highest stroke-current"
              cx="28"
              cy="28"
              fill="transparent"
              r="24"
              strokeWidth="4.5"
            />
            <circle
              className="text-primary stroke-current transition-all duration-500 ease-out"
              cx="28"
              cy="28"
              fill="transparent"
              r="24"
              strokeWidth="4.5"
              strokeDasharray={strokeCircumference}
              strokeDashoffset={strokeOffset}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute text-xs font-bold text-primary">{overallPercentage}%</span>
        </div>
      </section>

      {/* Category Grid from mockup screenshot 3 */}
      <div className="grid grid-cols-2 gap-3">
        {/* Work Card */}
        <button
          onClick={() => setSelectedCategory(selectedCategory === 'Work' ? 'All' : 'Work')}
          className={`category-card text-left bg-surface-container-lowest p-4 rounded-xl border transition-all duration-300 active:scale-95 group shadow-[0px_4px_12px_rgba(0,0,0,0.02)] cursor-pointer ${
            selectedCategory === 'Work' 
              ? 'ring-2 ring-primary border-primary bg-primary/5' 
              : 'border-outline-variant/20 hover:border-primary-container/40'
          }`}
        >
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
            <Briefcase className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-base font-bold text-on-surface">Work</h3>
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mt-1">
            {workCount} Task{workCount !== 1 ? 's' : ''}
          </p>
        </button>

        {/* Personal Card */}
        <button
          onClick={() => setSelectedCategory(selectedCategory === 'Personal' ? 'All' : 'Personal')}
          className={`category-card text-left bg-surface-container-lowest p-4 rounded-xl border transition-all duration-300 active:scale-95 group shadow-[0px_4px_12px_rgba(0,0,0,0.02)] cursor-pointer ${
            selectedCategory === 'Personal' 
              ? 'ring-2 ring-primary border-primary bg-primary/5' 
              : 'border-outline-variant/20 hover:border-primary-container/40'
          }`}
        >
          <div className="w-10 h-10 bg-success-container/30 rounded-xl flex items-center justify-center mb-3 group-hover:bg-success-container/40 transition-colors">
            <User className="w-5 h-5 text-success-emerald" />
          </div>
          <h3 className="text-base font-bold text-on-surface">Personal</h3>
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mt-1">
            {personalCount} Task{personalCount !== 1 ? 's' : ''}
          </p>
        </button>

        {/* Study Card */}
        <button
          onClick={() => setSelectedCategory(selectedCategory === 'Study' ? 'All' : 'Study')}
          className={`category-card text-left bg-surface-container-lowest p-4 rounded-xl border transition-all duration-300 active:scale-95 group shadow-[0px_4px_12px_rgba(0,0,0,0.02)] cursor-pointer ${
            selectedCategory === 'Study' 
              ? 'ring-2 ring-primary border-primary bg-primary/5' 
              : 'border-outline-variant/20 hover:border-primary-container/40'
          }`}
        >
          <div className="w-10 h-10 bg-warning-container/40 rounded-xl flex items-center justify-center mb-3 group-hover:bg-warning-container/50 transition-colors">
            <GraduationCap className="w-5 h-5 text-warning-amber" />
          </div>
          <h3 className="text-base font-bold text-on-surface">Study</h3>
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mt-1">
            {studyCount} Task{studyCount !== 1 ? 's' : ''}
          </p>
        </button>

        {/* Team Card */}
        <button
          onClick={() => setSelectedCategory(selectedCategory === 'Team Project' ? 'All' : 'Team Project')}
          className={`category-card text-left bg-surface-container-lowest p-4 rounded-xl border transition-all duration-300 active:scale-95 group shadow-[0px_4px_12px_rgba(0,0,0,0.02)] cursor-pointer ${
            selectedCategory === 'Team Project' 
              ? 'ring-2 ring-primary border-primary bg-primary/5' 
              : 'border-outline-variant/20 hover:border-primary-container/40'
          }`}
        >
          <div className="w-10 h-10 bg-danger-container/45 rounded-xl flex items-center justify-center mb-3 group-hover:bg-danger-container/65 transition-colors">
            <Users className="w-5 h-5 text-danger-rose" />
          </div>
          <h3 className="text-base font-bold text-on-surface">Team</h3>
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mt-1">
            {teamCount} Task{teamCount !== 1 ? 's' : ''}
          </p>
        </button>
      </div>

      {/* Filtered state dynamic header + list */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <h4 className="text-lg font-bold text-on-surface tracking-tight" id="list-title">
            {selectedCategory === 'All' ? 'Recent Tasks' : `${selectedCategory} Tasks`}
          </h4>
          {selectedCategory !== 'All' && (
            <button 
              onClick={() => setSelectedCategory('All')} 
              className="text-xs font-bold text-primary hover:underline cursor-pointer"
            >
              View All
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {filteredTasks.length > 0 ? (
            filteredTasks.slice(0, 8).map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleStatus={onToggleStatus}
                onStatusChange={onStatusChange}
                onEdit={onEdit}
                onDelete={onDelete}
                onPostpone={onPostpone}
              />
            ))
          ) : (
            <div className="text-center py-10 px-4 bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/35">
              <ListTodo className="w-10 h-10 text-outline/30 mx-auto mb-2" />
              <p className="text-sm font-semibold text-on-surface-variant">No tasks under this category</p>
              <p className="text-xs text-outline mt-1">Give yourself peace of mind by adding a fast goal!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
