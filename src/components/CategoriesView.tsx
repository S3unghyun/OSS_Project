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

const categoryLabel: Record<Task['category'], string> = {
  Work: '업무',
  Personal: '개인',
  Study: '공부',
  'Team Project': '팀 프로젝트'
};

export default function CategoriesView({
  tasks,
  onToggleStatus,
  onStatusChange,
  onEdit,
  onDelete,
  onPostpone
}: CategoriesViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<Task['category'] | 'All'>('All');

  const getCount = (cat: Task['category']) => tasks.filter((t) => t.category === cat).length;
  const workCount = getCount('Work');
  const personalCount = getCount('Personal');
  const studyCount = getCount('Study');
  const teamCount = getCount('Team Project');
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  const overallPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const filteredTasks = selectedCategory === 'All' ? tasks : tasks.filter((t) => t.category === selectedCategory);
  const strokeCircumference = 150.8;
  const strokeOffset = strokeCircumference - (strokeCircumference * (overallPercentage / 100));

  const taskCountText = (count: number) => `${count}개`;
  const selectedTitle = selectedCategory === 'All' ? '최근 할 일' : `${categoryLabel[selectedCategory]} 할 일`;

  return (
    <div className="space-y-6 pb-28">
      <header className="sticky top-0 z-30 flex justify-between items-center bg-surface-bg/85 backdrop-blur-md py-4 w-full">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-xl text-primary">
            <CalendarCheck2 className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h1 className="text-xl font-bold text-primary tracking-tight">할 일</h1>
        </div>
      </header>

      <section className="flex items-center justify-between bg-surface-container-low p-5 rounded-2xl border border-outline-variant/25 shadow-sm">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-on-surface">카테고리</h2>
          <p className="text-xs text-on-surface-variant font-medium mt-1">오늘의 할 일을 분야별로 정리해요</p>
        </div>
        
        <div className="relative w-14 h-14 flex items-center justify-center flex-shrink-0">
          <svg className="w-14 h-14 transform -rotate-90">
            <circle className="text-surface-container-highest stroke-current" cx="28" cy="28" fill="transparent" r="24" strokeWidth="4.5" />
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

      <div className="grid grid-cols-2 gap-3">
        {[
          { value: 'Work' as const, label: '업무', count: workCount, icon: <Briefcase className="w-5 h-5 text-primary" />, bg: 'bg-primary/10 group-hover:bg-primary/20' },
          { value: 'Personal' as const, label: '개인', count: personalCount, icon: <User className="w-5 h-5 text-success-emerald" />, bg: 'bg-success-container/30 group-hover:bg-success-container/40' },
          { value: 'Study' as const, label: '공부', count: studyCount, icon: <GraduationCap className="w-5 h-5 text-warning-amber" />, bg: 'bg-warning-container/40 group-hover:bg-warning-container/50' },
          { value: 'Team Project' as const, label: '팀 프로젝트', count: teamCount, icon: <Users className="w-5 h-5 text-danger-rose" />, bg: 'bg-danger-container/45 group-hover:bg-danger-container/65' }
        ].map((item) => (
          <button
            key={item.value}
            onClick={() => setSelectedCategory(selectedCategory === item.value ? 'All' : item.value)}
            className={`category-card text-left bg-surface-container-lowest p-4 rounded-xl border transition-all duration-300 active:scale-95 group shadow-[0px_4px_12px_rgba(0,0,0,0.02)] cursor-pointer ${
              selectedCategory === item.value
                ? 'ring-2 ring-primary border-primary bg-primary/5'
                : 'border-outline-variant/20 hover:border-primary-container/40'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${item.bg}`}>
              {item.icon}
            </div>
            <h3 className="text-base font-bold text-on-surface">{item.label}</h3>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mt-1">
              {taskCountText(item.count)}
            </p>
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <h4 className="text-lg font-bold text-on-surface tracking-tight" id="list-title">
            {selectedTitle}
          </h4>
          {selectedCategory !== 'All' && (
            <button onClick={() => setSelectedCategory('All')} className="text-xs font-bold text-primary hover:underline cursor-pointer">
              전체 보기
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
              <p className="text-sm font-semibold text-on-surface-variant">이 카테고리에 할 일이 없습니다</p>
              <p className="text-xs text-outline mt-1">작은 목표를 추가해 마음을 가볍게 만들어 보세요.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
