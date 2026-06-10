import React, { useState } from 'react';
import { Briefcase, GraduationCap, ListTodo, UserRound, UsersRound } from 'lucide-react';
import { Task, User } from '../types';
import TaskCard from './TaskCard';

interface CategoriesViewProps {
  tasks: Task[];
  users: User[];
  onToggleStatus: (id: string) => void;
  onStatusChange: (id: string, status: Task['status']) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onPostpone?: (id: string) => void;
}

const categoryMeta: Record<Task['category'], { label: string; icon: React.ReactNode; tone: string }> = {
  Work: { label: '업무', icon: <Briefcase className="h-5 w-5" />, tone: 'text-blue-700 bg-blue-50' },
  Personal: { label: '개인', icon: <UserRound className="h-5 w-5" />, tone: 'text-emerald-700 bg-emerald-50' },
  Study: { label: '학습', icon: <GraduationCap className="h-5 w-5" />, tone: 'text-amber-700 bg-amber-50' },
  'Team Project': { label: '팀 프로젝트', icon: <UsersRound className="h-5 w-5" />, tone: 'text-indigo-700 bg-indigo-50' }
};

const categories = Object.keys(categoryMeta) as Task['category'][];

export default function CategoriesView({ tasks, users, onToggleStatus, onStatusChange, onEdit, onDelete, onPostpone }: CategoriesViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<Task['category'] | 'All'>('All');
  const filteredTasks = selectedCategory === 'All' ? tasks : tasks.filter((task) => task.category === selectedCategory);

  return (
    <div className="space-y-5 pb-8">
      <header className="sticky top-0 z-30 bg-slate-50/90 py-4 backdrop-blur dark:bg-slate-900/90">
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">Category Board</p>
        <h1 className="text-2xl font-black tracking-tight">분류별 할 일</h1>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => {
          const categoryTasks = tasks.filter((task) => task.category === category);
          const completed = categoryTasks.filter((task) => task.status === 'Completed').length;
          const score = categoryTasks.reduce((sum, task) => sum + task.weight, 0);
          const rate = categoryTasks.length > 0 ? Math.round((completed / categoryTasks.length) * 100) : 0;
          const isSelected = selectedCategory === category;

          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(isSelected ? 'All' : category)}
              className={`rounded-lg border p-4 text-left shadow-sm transition ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100 dark:bg-indigo-950'
                  : 'border-slate-200 bg-white hover:border-indigo-200 dark:border-slate-700 dark:bg-slate-800'
              }`}
            >
              <span className={`inline-flex rounded-lg p-2 ${categoryMeta[category].tone}`}>{categoryMeta[category].icon}</span>
              <h2 className="mt-3 text-base font-black">{categoryMeta[category].label}</h2>
              <p className="mt-1 text-xs font-semibold text-slate-500">{categoryTasks.length}개 · 총 {score}점</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-indigo-600" style={{ width: `${rate}%` }} />
              </div>
              <p className="mt-1 text-right text-[11px] font-black text-slate-500">{rate}%</p>
            </button>
          );
        })}
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-lg font-black">
              {selectedCategory === 'All' ? '전체 목록' : `${categoryMeta[selectedCategory].label} 목록`}
            </h2>
            <p className="text-sm text-slate-500">담당자, 마감일, 완료 증빙을 함께 확인합니다.</p>
          </div>
          {selectedCategory !== 'All' && (
            <button onClick={() => setSelectedCategory('All')} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold hover:bg-white dark:border-slate-700">
              전체 보기
            </button>
          )}
        </div>

        {filteredTasks.length > 0 ? (
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                users={users}
                onToggleStatus={onToggleStatus}
                onStatusChange={onStatusChange}
                onEdit={onEdit}
                onDelete={onDelete}
                onPostpone={onPostpone}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-800">
            <ListTodo className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm font-bold text-slate-500">표시할 할 일이 없습니다.</p>
          </div>
        )}
      </section>
    </div>
  );
}
