import React, { useState } from 'react';
import { 
  Plus, 
  ListTodo, 
  Sparkles, 
  Flame, 
  Brain, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Zap, 
  Target, 
  ArrowUpRight,
  TrendingDown,
  TrendingUp as TrendingUpIcon,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Task, ActionLog } from '../types';
import TaskCard from './TaskCard';

interface AllTasksViewProps {
  tasks: Task[];
  actionLogs: ActionLog[];
  onToggleStatus: (id: string) => void;
  onStatusChange: (id: string, status: Task['status']) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onPostpone: (id: string) => void;
  onOpenNewTaskModal: () => void;
  onNavigateToTab: (tab: 'All Tasks' | 'Calendar' | 'Categories' | 'Settings') => void;
  avatarUrl: string;
}

// Fixed system date as per workspace guidelines
const CURRENT_DATE_STR = "2026-06-08";

export default function AllTasksView({
  tasks,
  actionLogs,
  onToggleStatus,
  onStatusChange,
  onEdit,
  onDelete,
  onPostpone,
  onOpenNewTaskModal,
  onNavigateToTab,
  avatarUrl
}: AllTasksViewProps) {
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Study' | 'Personal' | 'Project' | 'Work'>('All');

  // Calculate stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // 1. Deadline-Based Sorting Score formula
  // "미완료 작업 중 마감일(dueDateValue)이 가장 임박한 과제와 팀플 일정을 자동으로 최상단에 배치합니다. 마감일 이후에는 지연도(postponeCount) 가중치를 추가 부여하여 실시간으로 정렬 순위를 동적 보정합니다."
  const getSortScore = (task: Task) => {
    if (task.status === 'Completed') return -999999; // Move done tasks to bottom

    const todayMs = new Date(CURRENT_DATE_STR).getTime();
    const taskMs = task.dueDateValue ? new Date(task.dueDateValue).getTime() : todayMs + (10 * 24 * 60 * 60 * 1000);
    const daysDiff = (taskMs - todayMs) / (24 * 60 * 60 * 1000);

    let score = 0;

    // A. Deadline Closeness Score
    if (daysDiff < 0) {
      // Overdue task (older overdue is higher priority)
      score += 180 + Math.abs(daysDiff) * 20;
    } else if (daysDiff <= 0) {
      // Due today
      score += 150;
    } else if (daysDiff <= 1) {
      // Due tomorrow
      score += 120;
    } else if (daysDiff <= 3) {
      score += 80 + (3 - daysDiff) * 12;
    } else if (daysDiff <= 7) {
      score += 50 + (7 - daysDiff) * 4;
    } else {
      score += 15;
    }

    // B. Importance Score based on priority
    if (task.priority === 'High') score += 30;
    else if (task.priority === 'Medium') score += 15;

    // C. Category Bonus Score (Team project tasks are highly collaborative and urgent)
    if (task.category === 'Team Project') {
      score += 35;
    }

    // D. Postponement Penalty multiplier to prevent infinite postpones
    const postpones = task.postponeCount || 0;
    if (daysDiff < 0) {
      score += postpones * 50; // Super high weight boost to get it sorted on top
    } else {
      score += postpones * 20;
    }

    return score;
  };

  // Run dynamic sorting
  const sortedTasks = [...tasks].sort((a, b) => {
    const scoreA = getSortScore(a);
    const scoreB = getSortScore(b);
    return scoreB - scoreA;
  });

  // Filter tasks based on selected categories
  const filteredTasks = sortedTasks.filter((task) => {
    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'Project') return task.category === 'Team Project';
    return task.category === selectedFilter;
  });

  // 2. 오늘의 우선순위 추천 엔진 (Team Project Recommender)
  // "긴급도(마감 임박), 중요도(높은 우선순위), 카테고리 기여도(팀플 및 학업)를 종합 점수화하여, 미완료 상태인 핵심 일감 중 '오늘 반드시 처리해야 할 최적 일감 3가지'를 선정해 추천 카드로 상단에 가이드합니다."
  const getRecommendationScore = (task: Task) => {
    if (task.status === 'Completed') return -100000;
    
    const todayMs = new Date(CURRENT_DATE_STR).getTime();
    const taskMs = task.dueDateValue ? new Date(task.dueDateValue).getTime() : todayMs + (10 * 24 * 60 * 60 * 1000);
    const daysDiff = (taskMs - todayMs) / (24 * 60 * 60 * 1000);

    let score = 0;
    
    // Team Project contribution
    if (task.category === 'Team Project') score += 40;
    else if (task.category === 'Study') score += 25;

    // Level of Priority
    if (task.priority === 'High') score += 35;
    else if (task.priority === 'Medium') score += 18;

    // Time proximity
    if (daysDiff < 0) score += 60 + Math.abs(daysDiff) * 15; // overdue
    else if (daysDiff <= 1) score += 50; // urgent
    else if (daysDiff <= 3) score += 30;
    else if (daysDiff <= 7) score += 15;

    // Postponement habit bonus
    score += (task.postponeCount || 0) * 15;

    return score;
  };

  const recommendedTasks = tasks
    .filter(t => t.status !== 'Completed')
    .sort((a, b) => getRecommendationScore(b) - getRecommendationScore(a))
    .slice(0, 3);

  // 3. AI 행동 분석 및 완료 패턴 브리핑 (Visual Habit Analytics)
  const getHabitReport = () => {
    const completedByCat: Record<string, number> = {};
    const postponedByCat: Record<string, number> = {};
    const totalByCat: Record<string, number> = {};

    tasks.forEach((t) => {
      totalByCat[t.category] = (totalByCat[t.category] || 0) + 1;
      if (t.status === 'Completed') {
        completedByCat[t.category] = (completedByCat[t.category] || 0) + 1;
      }
      if (t.postponeCount && t.postponeCount > 0) {
        postponedByCat[t.category] = (postponedByCat[t.category] || 0) + t.postponeCount;
      }
    });

    // Fastest Done Category (highest proportion done, fallback count)
    let fastestCat = 'Personal';
    let maxDoneRate = -1;
    Object.keys(totalByCat).forEach((cat) => {
      const done = completedByCat[cat] || 0;
      const total = totalByCat[cat] || 1;
      const rate = done / total;
      if (rate > maxDoneRate && done > 0) {
        maxDoneRate = rate;
        fastestCat = cat;
      }
    });

    // Most Postponed Category
    let lazyCat = 'Team Project';
    let maxDelaySum = -1;
    Object.entries(postponedByCat).forEach(([cat, val]) => {
      if (val > maxDelaySum) {
        maxDelaySum = val;
        lazyCat = cat;
      }
    });

    const totalPostponesSum = Object.values(postponedByCat).reduce((a, b) => a + b, 0);

    return {
      fastest: fastestCat,
      postponedMost: lazyCat,
      totalDelay: totalPostponesSum,
    };
  };

  const habitReport = getHabitReport();

  // 4. 상황별 감성 동기부여: 위기 극복 경고 모드 (Crisis Mode Indicator)
  // "팀플 마감이 하루 전인데 진행률이 낮으면 UI 전체에 경고 메시지와 긴박한 색상을 띄우고..."
  // - Incomplete Team Project task due today or tomorrow
  const hasUrgentTeamProject = tasks.some(
    (t) =>
      t.category === 'Team Project' &&
      t.status !== 'Completed' &&
      (t.dueDateValue === CURRENT_DATE_STR || t.dueDateValue === '2026-06-09')
  );
  const isCrisisMode = hasUrgentTeamProject && progressPercentage < 50;

  const filters: Array<'All' | 'Study' | 'Personal' | 'Project' | 'Work'> = [
    'All',
    'Study',
    'Personal',
    'Project',
    'Work'
  ];

  // Circle progress calculations
  const strokeCircumference = 175.9; // 2 * Math.PI * 28
  const strokeOffset = strokeCircumference - (strokeCircumference * (progressPercentage / 100));

  return (
    <div className="space-y-6 pb-28">
      
      {/* 4. Top Crisis Mode Danger Banner (If active) */}
      {isCrisisMode && (
        <div className="bg-red-600 dark:bg-red-700 text-white rounded-2xl p-4.5 shadow-[0_0_15px_rgba(239,68,68,0.4)] border border-red-500 animate-[pulse_2s_infinite] flex items-start gap-3">
          <Flame className="w-6 h-6 text-yellow-300 animate-[bounce_1.5s_infinite] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-yellow-300">CRITICAL TEAM CRISIS ACTION REQUIRED</h3>
            <p className="text-sm font-semibold leading-relaxed">
              임박한 <strong>팀 프로젝트 마감일</strong>이 있으나, 오늘 완료된 할 일이 <strong>50% 미만</strong>입니다! 미루기를 멈추고 집중해야 할 비상 시국입니다.
            </p>
          </div>
        </div>
      )}

      {/* Header section */}
      <header className="sticky top-0 z-30 flex justify-between items-center bg-surface-bg/85 backdrop-blur-md py-4 w-full">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-xl text-primary">
            <ListTodo className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl font-black text-primary tracking-tight">협업 & 학업 플래너</h1>
            <p className="text-[10px] text-outline font-bold tracking-wider uppercase mt-0.5">Monday, June 8, 2026</p>
          </div>
        </div>
        <button
          onClick={() => onNavigateToTab('Settings')}
          className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container hover:opacity-85 active:scale-95 transition-all duration-200 shadow-sm shrink-0"
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

      {/* 3. AI 행동 분석 및 완료 패턴 브리핑 (Visual Habit Analytics) */}
      <section className="bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 text-slate-100 p-5 rounded-2xl border border-indigo-500/20 shadow-[0px_6px_20px_rgba(49,46,129,0.15)] relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-36 h-36 bg-indigo-500/5 rounded-full pointer-events-none blur-xl"></div>
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400 fill-indigo-400 animate-pulse" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-300">Habit AI Report</span>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium leading-relaxed text-indigo-100">
              분석 결과, 현재까지 <strong className="text-emerald-400 font-extrabold">"{habitReport.fastest}"</strong> 분야 할 일은 매우 성실하고 속도감 있게 종결하고 있습니다.
            </p>
            <p className="text-sm font-medium leading-relaxed text-indigo-100">
              반면, <strong className="text-amber-400 font-extrabold">"{habitReport.postponedMost}"</strong> 관련 작업은 미루거나 연정하는 패턴이 다수 검출(보류 포함 누적 <strong className="text-red-400 font-extrabold">{habitReport.totalDelay}회</strong>)되었습니다.
            </p>
            <div className="bg-white/5 rounded-xl p-3 border border-white/5 text-[11px] text-slate-300 leading-relaxed font-semibold">
              💡 <span className="text-white">프로젝트 병목 방지 처방:</span> "{habitReport.postponedMost}" 과제를 방치하여 불타는 경고가 발생하기 전에, AI 추천 우선순위 3개 과제를 오늘 최우선으로 돌파하는 것을 강력히 권유합니다.
            </div>
          </div>
        </div>
      </section>

      {/* 2. 오늘의 우선순위 추천 엔진 Widget Content */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <Sparkles className="w-4 h-4 text-amber-500 animate-[spin_4s_linear_infinite]" />
          <h2 className="text-sm font-black text-on-surface uppercase tracking-wider">오늘 반드시 끝내야 할 과제 3선</h2>
        </div>

        {recommendedTasks.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {recommendedTasks.map((task, index) => (
              <div 
                key={`rec-${task.id}`}
                className="bg-surface-container-low border border-amber-500/20 hover:border-amber-500/40 p-3.5 rounded-xl flex items-center justify-between gap-4 transition-all hover:-translate-y-0.5 shadow-sm"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-amber-500/15 text-amber-600 flex items-center justify-center font-black text-xs">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-on-surface truncate pr-1">
                      {task.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-danger-rose font-black uppercase tracking-wider">
                        {task.priority}
                      </span>
                      <span className="text-[10px] text-outline font-semibold">
                        • {task.category}
                      </span>
                      {task.postponeCount && task.postponeCount > 0 ? (
                        <span className="text-[9px] text-amber-600 font-bold bg-amber-100/60 px-1 rounded">
                          지연 {task.postponeCount}회
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => onToggleStatus(task.id)}
                  className="flex-shrink-0 flex items-center justify-center gap-1 text-[11px] font-extrabold uppercase bg-amber-500 text-neutral-900 px-3 py-1.5 rounded-lg hover:brightness-105 active:scale-95 transition-all"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  해결
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-success-container/10 border border-success-emerald/10 text-success-emerald rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-center">
            <CheckCircle2 className="w-4 h-4" />
            훌륭합니다! 추천할 미완료 과제가 전혀 없습니다. 이달의 완벽한 진척도입니다.
          </div>
        )}
      </section>

      {/* Today's Progress Card */}
      <section className={`${isCrisisMode ? 'bg-red-900/40 border border-red-500/30 text-white' : 'bg-primary-container text-on-primary-container'} p-5 rounded-2xl shadow-md relative overflow-hidden transition-all duration-300 hover:shadow-lg`}>
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-black tracking-tight">{isCrisisMode ? "긴급 회복 대시보드" : "오늘의 진행률"}</h2>
            <p className="text-xs font-semibold opacity-90 mt-1">
              총 {totalTasks}개 중 {completedTasks}개 과제 종결 완료
            </p>
          </div>
          
          <div className="relative flex items-center justify-center w-16 h-16 flex-shrink-0">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle
                className="opacity-20 stroke-current text-current"
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
            <span className="absolute text-xs font-black tracking-wider text-white">
              {progressPercentage}%
            </span>
          </div>
        </div>
        {/* Decorative Background Circles */}
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full pointer-events-none"></div>
        <div className="absolute left-1/3 -top-10 w-20 h-20 bg-white/5 rounded-full pointer-events-none"></div>
      </section>

      {/* Navigation Filter Chips */}
      <div className="space-y-2">
        <label className="text-[10px] font-black tracking-wider text-outline uppercase block pl-1">
          카테고리 필터
        </label>
        <nav className="flex gap-2 pb-1 overflow-x-auto scrolling-touch custom-scrollbar">
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
                {filter === 'All' ? '전체' : filter === 'Project' ? '팀 프로젝트' : filter}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Task Listing Section */}
      <section className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-1">
            <Flame className="w-4 h-4 text-primary animate-[pulse_1s_infinite]" />
            <h3 className="text-xs font-black text-outline uppercase tracking-wider">
              임박 과제 우선순위 목록정렬
            </h3>
          </div>
          <span className="text-[10px] text-outline font-bold bg-surface-container px-2 py-0.5 rounded">
            정렬 필터링 자동화
          </span>
        </div>

        {/* Dynamic task stack */}
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
                onPostpone={onPostpone}
              />
            ))
          ) : (
            <div className="text-center py-12 px-6 bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/30">
              <ListTodo className="w-12 h-12 text-outline/40 mx-auto stroke-[1.5] mb-3" />
              <p className="text-sm font-semibold text-on-surface-variant">표시할 과제가 없습니다</p>
              <p className="text-xs text-outline mt-1 max-w-xs mx-auto">
                {selectedFilter === 'All' ? '과제를 등록해 보세요!' : `"${selectedFilter}" 분야에 남은 할 일이 전혀 없습니다!`}
              </p>
            </div>
          )}
        </div>
      </section>

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
