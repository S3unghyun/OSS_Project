import React, { useMemo, useState } from 'react';
import { Copy, Link2, Plus, UsersRound } from 'lucide-react';
import { ActionLog, Contribution, Room, TabType, Task, User } from '../types';
import TaskCard from './TaskCard';

interface AllTasksViewProps {
  tasks: Task[];
  room: Room;
  users: User[];
  currentUser: User;
  currentUserId: string;
  contributions: Contribution[];
  actionLogs: ActionLog[];
  onToggleStatus: (id: string) => void;
  onStatusChange: (id: string, status: Task['status']) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onPostpone: (id: string) => void;
  onOpenNewTaskModal: () => void;
  onNavigateToTab: (tab: TabType) => void;
}

const getUser = (users: User[], userId: string) => users.find((user) => user.id === userId);

export default function AllTasksView({
  tasks,
  room,
  users,
  currentUser,
  contributions,
  actionLogs,
  onToggleStatus,
  onStatusChange,
  onEdit,
  onDelete,
  onPostpone,
  onOpenNewTaskModal,
  onNavigateToTab
}: AllTasksViewProps) {
  const [copied, setCopied] = useState(false);
  const completed = tasks.filter((task) => task.status === 'Completed').length;
  const progress = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

  const sortedTasks = useMemo(
    () =>
      [...tasks].sort((a, b) => {
        if (a.status === 'Completed' && b.status !== 'Completed') return 1;
        if (a.status !== 'Completed' && b.status === 'Completed') return -1;
        return (b.weight || 1) - (a.weight || 1);
      }),
    [tasks]
  );

  const handleCopyInvite = async () => {
    await navigator.clipboard.writeText(room.inviteCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="space-y-5 pb-8">
      <header className="sticky top-0 z-30 flex items-center justify-between bg-slate-50/90 py-4 backdrop-blur dark:bg-slate-900/90">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">Group Calendar Todo</p>
          <h1 className="text-2xl font-black tracking-tight">{room.name}</h1>
          <p className="mt-1 text-sm text-slate-500">현재 사용자: {currentUser.name}</p>
        </div>
        <button onClick={onOpenNewTaskModal} className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-indigo-700">
          <Plus className="h-4 w-4" />
          할 일
        </button>
      </header>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-slate-500">방 날짜</p>
              <h2 className="mt-1 text-xl font-black">{room.date}</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">캘린더 날짜를 기준으로 방을 만들고 초대받은 멤버만 접근하는 구조입니다.</p>
            </div>
            <button onClick={() => onNavigateToTab('Calendar')} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200">
              캘린더 보기
            </button>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-sm font-bold">
              <span>전체 진행률</span>
              <span>{progress}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-black">
              <UsersRound className="h-5 w-5 text-indigo-600" />
              초대와 멤버
            </h2>
            <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">수락 {room.members.length}명</span>
          </div>

          <div className="mt-4 flex gap-2 rounded-lg bg-slate-100 p-2 dark:bg-slate-900">
            <Link2 className="mt-1 h-4 w-4 shrink-0 text-slate-500" />
            <p className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-600 dark:text-slate-300">{room.inviteCode}</p>
            <button onClick={handleCopyInvite} className="rounded-md bg-white px-2 py-1 text-xs font-bold text-indigo-700 shadow-sm dark:bg-slate-800">
              <Copy className="mr-1 inline h-3 w-3" />
              {copied ? '복사됨' : '복사'}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {room.members.map((member) => {
              const user = getUser(users, member.userId);
              return (
                <span key={member.userId} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-100">
                  {user?.name} · {member.role === 'Host' ? '호스트' : '멤버'}
                </span>
              );
            })}
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h2 className="text-base font-black">실시간 기여도</h2>
        <div className="mt-4 space-y-3">
          {contributions.map((item) => {
            const user = getUser(users, item.userId);
            return (
              <div key={item.userId}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-bold">{user?.name}</span>
                  <span className="font-black text-indigo-700">{item.percentage}% · {item.score}점</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${item.percentage}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-lg font-black">공동 할 일 목록</h2>
            <p className="text-sm text-slate-500">완료 체크 시 증빙 파일 업로드 모달이 열립니다.</p>
          </div>
          <span className="text-xs font-bold text-slate-500">{completed}/{tasks.length} 완료</span>
        </div>

        {sortedTasks.length > 0 ? (
          <div className="space-y-3">
            {sortedTasks.map((task) => (
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
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center text-sm font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-800">
            아직 등록된 할 일이 없습니다.
          </div>
        )}

        {actionLogs.length > 0 && (
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-800">
            최근 활동: {actionLogs[0].taskTitle} · {actionLogs[0].actionType}
          </div>
        )}
      </section>
    </div>
  );
}
