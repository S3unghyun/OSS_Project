import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, Info } from 'lucide-react';
import { Task } from '../types';
import TaskCard from './TaskCard';

interface CalendarViewProps {
  tasks: Task[];
  onToggleStatus: (id: string) => void;
  onStatusChange: (id: string, status: Task['status']) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onOpenNewTaskModalWithDate: (dateStr: string) => void;
  onPostpone?: (id: string) => void;
}

const CURRENT_DATE_STR = "2026-06-08";
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export default function CalendarView({
  tasks,
  onToggleStatus,
  onStatusChange,
  onEdit,
  onDelete,
  onOpenNewTaskModalWithDate,
  onPostpone
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date(2026, 5, 1));
  const [selectedDate, setSelectedDate] = useState<string>(CURRENT_DATE_STR);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);
  const firstDayOfWeek = getFirstDayOfMonth(year, month);

  const days: Array<{ dayNum: number; dateStr: string; isCurrentMonth: boolean; dayOfWeek: number; }> = [];

  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const dNum = daysInPrevMonth - i;
    const dStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(dNum).padStart(2, '0')}`;
    days.push({ dayNum: dNum, dateStr: dStr, isCurrentMonth: false, dayOfWeek: new Date(prevYear, prevMonth, dNum).getDay() });
  }

  const daysInCurrentMonth = getDaysInMonth(year, month);
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({ dayNum: d, dateStr: dStr, isCurrentMonth: true, dayOfWeek: new Date(year, month, d).getDay() });
  }

  const trailingCellsNeeded = days.length % 7 === 0 ? 0 : 7 - (days.length % 7);
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;

  for (let n = 1; n <= trailingCellsNeeded; n++) {
    const dStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(n).padStart(2, '0')}`;
    days.push({ dayNum: n, dateStr: dStr, isCurrentMonth: false, dayOfWeek: new Date(nextYear, nextMonth, n).getDay() });
  }

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleGoToToday = () => {
    setCurrentDate(new Date(2026, 5, 1));
    setSelectedDate(CURRENT_DATE_STR);
  };

  const selectedAgendaTasks = tasks.filter(task => task.dueDateValue === selectedDate);
  const currentMonthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const monthTasks = tasks.filter(t => t.dueDateValue?.startsWith(currentMonthPrefix));
  const monthCompleted = monthTasks.filter(t => t.status === 'Completed').length;
  const monthIncomplete = monthTasks.filter(t => t.status !== 'Completed').length;
  const selectedDateParts = selectedDate.split('-');

  return (
    <div className="space-y-5 pb-28">
      <header className="sticky top-0 z-30 flex justify-between items-center bg-surface-bg/85 backdrop-blur-md py-4 w-full">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-xl text-primary">
            <Calendar className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h1 className="text-xl font-extrabold text-primary tracking-tight">캘린더</h1>
        </div>
        <button
          onClick={handleGoToToday}
          className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-all active:scale-95 cursor-pointer"
        >
          오늘
        </button>
      </header>

      <section className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <button onClick={handlePrevMonth} className="p-1.5 rounded-lg hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-on-surface active:scale-90 cursor-pointer" title="이전 달">
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <h2 className="text-base font-extrabold text-on-surface tracking-tight">
            {year}년 {month + 1}월
          </h2>

          <button onClick={handleNextMonth} className="p-1.5 rounded-lg hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-on-surface active:scale-90 cursor-pointer" title="다음 달">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 text-center border-t border-outline-variant/10 pt-3">
          <div className="bg-surface-container-lowest p-2 rounded-xl border border-outline-variant/5">
            <span className="text-[10px] text-outline font-extrabold block uppercase tracking-wider">이번 달 완료</span>
            <span className="text-sm font-extrabold text-success-emerald mt-0.5 block">{monthCompleted}개</span>
          </div>
          <div className="bg-surface-container-lowest p-2 rounded-xl border border-outline-variant/5">
            <span className="text-[10px] text-outline font-extrabold block uppercase tracking-wider">이번 달 남은 할 일</span>
            <span className="text-sm font-extrabold text-[#e0455f] mt-0.5 block">{monthIncomplete}개</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="grid grid-cols-7 text-center font-extrabold text-[10px] tracking-wider text-outline uppercase pb-1 border-b border-outline-variant/5">
            {WEEKDAYS.map((day, index) => (
              <div key={day} className={index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : ''}>{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 pt-1.5">
            {days.map((day, idx) => {
              const belongsToThisMonth = day.isCurrentMonth;
              const isSelected = day.dateStr === selectedDate;
              const isToday = day.dateStr === CURRENT_DATE_STR;
              const dayTasks = tasks.filter(t => t.dueDateValue === day.dateStr);
              const incompleteOnDay = dayTasks.filter(t => t.status !== 'Completed').length;
              const completedOnDay = dayTasks.filter(t => t.status === 'Completed').length;

              let textDayColor = 'text-on-surface';
              if (!belongsToThisMonth) textDayColor = 'text-on-surface-variant/30 dark:text-neutral-700/50';
              else if (day.dayOfWeek === 0) textDayColor = 'text-red-500 font-extrabold';
              else if (day.dayOfWeek === 6) textDayColor = 'text-blue-500 font-extrabold';

              return (
                <div
                  key={`${day.dateStr}-${idx}`}
                  onClick={() => setSelectedDate(day.dateStr)}
                  className={`min-h-[64px] sm:min-h-[70px] p-1.5 rounded-xl border flex flex-col justify-between items-center transition-all duration-200 cursor-pointer text-center relative overflow-hidden select-none ${
                    isSelected
                      ? 'bg-primary/10 border-primary ring-2 ring-primary/20 scale-100 z-10'
                      : isToday
                        ? 'bg-surface-container-high border-secondary-fixed/50 border-double border-4'
                        : belongsToThisMonth
                          ? 'bg-surface-container-lowest hover:bg-surface-container-high border-outline-variant/10'
                          : 'bg-surface-container-low/30 border-outline-variant/5 opacity-60'
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className={`text-[11px] font-extrabold ${textDayColor}`}>{day.dayNum}</span>
                    {isToday && <span className="w-1.5 h-1.5 bg-primary rounded-full ring-2 ring-primary-container shrink-0"></span>}
                  </div>

                  <div className="w-full flex flex-col gap-0.5 justify-end items-center mt-1">
                    {incompleteOnDay > 0 ? (
                      <div className="text-[8px] px-1 py-0.5 leading-none rounded font-extrabold uppercase bg-red-100 text-red-700 hover:bg-red-200 border border-red-200 max-w-full truncate text-center scale-95" title={`미완료 ${incompleteOnDay}개`}>
                        남음 +{incompleteOnDay}
                      </div>
                    ) : completedOnDay > 0 ? (
                      <div className="text-[8px] px-1 py-0.5 leading-none rounded font-extrabold uppercase bg-success-container text-success-emerald border border-success-emerald/10 max-w-full truncate text-center scale-95" title={`완료 ${completedOnDay}개`}>
                        완료
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <div className="space-y-0.5">
            <span className="text-[10px] font-extrabold text-outline uppercase tracking-widest block">선택한 날짜 일정</span>
            <h3 className="text-sm font-bold text-on-surface">
              {selectedDate === CURRENT_DATE_STR ? '오늘 ' : ''}
              {parseInt(selectedDateParts[1])}월 {parseInt(selectedDateParts[2])}일 할 일 목록
            </h3>
          </div>
          <button
            onClick={() => onOpenNewTaskModalWithDate(selectedDate)}
            className="flex items-center gap-1.5 scale-90 text-[10px] font-extrabold uppercase tracking-widest px-3.5 py-1.5 rounded-xl bg-primary text-on-primary hover:opacity-90 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            일정 등록
          </button>
        </div>

        <div className="space-y-2.5">
          {selectedAgendaTasks.length > 0 ? (
            selectedAgendaTasks.map((task) => (
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
            <div className="flex flex-col items-center justify-center p-8 bg-surface-container-low/50 border border-dashed border-outline-variant/20 rounded-2xl text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-outline">
                <Info className="w-5 h-5 stroke-[1.8]" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-on-surface-variant">이 날짜에는 등록된 일정이 없습니다.</p>
                <p className="text-[10px] text-outline">가벼운 하루를 채우고 싶다면 새 일정을 추가해 보세요.</p>
              </div>
              <button
                onClick={() => onOpenNewTaskModalWithDate(selectedDate)}
                className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-all active:scale-95 cursor-pointer"
              >
                + 일정 만들기
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
