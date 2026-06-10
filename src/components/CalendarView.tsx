import React, { useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Plus, UsersRound } from 'lucide-react';
import { Room, Task, User } from '../types';
import TaskCard from './TaskCard';

interface CalendarViewProps {
  tasks: Task[];
  room: Room;
  users: User[];
  onToggleStatus: (id: string) => void;
  onStatusChange: (id: string, status: Task['status']) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onOpenNewTaskModalWithDate: (dateStr: string) => void;
  onCreateRoomFromDate: (dateStr: string) => void;
  onPostpone?: (id: string) => void;
}

const CURRENT_DATE_STR = '2026-06-10';
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export default function CalendarView({
  tasks,
  room,
  users,
  onToggleStatus,
  onStatusChange,
  onEdit,
  onDelete,
  onOpenNewTaskModalWithDate,
  onCreateRoomFromDate,
  onPostpone
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 1));
  const [selectedDate, setSelectedDate] = useState(room.date || CURRENT_DATE_STR);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, index) => {
    if (index < firstDay) return null;
    const day = index - firstDay + 1;
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  });

  const selectedTasks = tasks.filter((task) => task.dueDateValue === selectedDate);

  return (
    <div className="space-y-4 pb-8">
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 bg-slate-50/90 py-3 backdrop-blur dark:bg-slate-900/90">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">Calendar Room</p>
          <h1 className="text-xl font-black tracking-tight">캘린더</h1>
        </div>
        <button
          onClick={() => onOpenNewTaskModalWithDate(selectedDate)}
          className="flex h-12 shrink-0 items-center gap-2 rounded-lg bg-indigo-600 px-3 text-sm font-bold text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          일정
        </button>
      </header>

      <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-3 flex items-center justify-between">
          <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="flex h-11 w-11 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700" title="이전 달">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-black">{year}년 {month + 1}월</h2>
          <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="flex h-11 w-11 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700" title="다음 달">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs font-black text-slate-500">
          {WEEKDAYS.map((day) => <div key={day} className="py-2">{day}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((dateStr, index) => {
            if (!dateStr) return <div key={`empty-${index}`} className="min-h-14" />;
            const dayTasks = tasks.filter((task) => task.dueDateValue === dateStr);
            const isSelected = selectedDate === dateStr;
            const isRoomDate = room.date === dateStr;

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`min-h-14 rounded-lg border p-1.5 text-left transition ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-100 dark:bg-indigo-950'
                    : 'border-slate-200 bg-slate-50 hover:bg-white dark:border-slate-700 dark:bg-slate-900'
                }`}
              >
                <span className="text-sm font-black">{Number(dateStr.slice(-2))}</span>
                {isRoomDate && <span className="mt-1 block rounded bg-emerald-100 px-1 py-0.5 text-[9px] font-bold text-emerald-700">현재 방</span>}
                {dayTasks.length > 0 && <span className="mt-1 block rounded bg-amber-100 px-1 py-0.5 text-[9px] font-bold text-amber-700">{dayTasks.length}개</span>}
              </button>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <CalendarDays className="h-6 w-6 text-indigo-600" />
          <h2 className="mt-3 text-lg font-black">{selectedDate}</h2>
          <p className="mt-2 text-sm text-slate-500">선택한 날짜를 기준으로 새 작업방을 만들 수 있습니다.</p>
          <button
            onClick={() => onCreateRoomFromDate(selectedDate)}
            className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-black text-indigo-700 hover:bg-indigo-100"
          >
            <UsersRound className="h-4 w-4" />
            이 날짜로 방 생성
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-black">선택 날짜 할 일</h2>
            <span className="shrink-0 text-xs font-bold text-slate-500">{selectedTasks.length}개</span>
          </div>

          {selectedTasks.length > 0 ? (
            selectedTasks.map((task) => (
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
            ))
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-800">
              이 날짜에는 할 일이 없습니다.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
