import React, { useState } from 'react';
import { Bell, CheckCircle, CloudLightning, Database, Moon, Plus, Sun, Trash2, UsersRound } from 'lucide-react';
import { AppSettings, Contribution, Room, Task, User } from '../types';

interface SettingsViewProps {
  tasks: Task[];
  room: Room;
  users: User[];
  settings: AppSettings;
  contributions: Contribution[];
  onSettingsChange: (settings: AppSettings) => void;
  onClearData: () => void;
  onSync: () => void;
  onOpenNewTaskModal: () => void;
}

export default function SettingsView({
  tasks,
  room,
  users,
  settings,
  contributions,
  onSettingsChange,
  onClearData,
  onSync,
  onOpenNewTaskModal
}: SettingsViewProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncDone, setSyncDone] = useState(false);
  const completed = tasks.filter((task) => task.status === 'Completed').length;
  const totalScore = tasks.filter((task) => task.status === 'Completed').reduce((sum, task) => sum + task.weight, 0);

  const triggerMockSync = () => {
    setIsSyncing(true);
    setSyncDone(false);
    window.setTimeout(() => {
      onSync();
      setIsSyncing(false);
      setSyncDone(true);
      window.setTimeout(() => setSyncDone(false), 2500);
    }, 700);
  };

  return (
    <div className="space-y-4 pb-8">
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 bg-slate-50/90 py-3 backdrop-blur dark:bg-slate-900/90">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">Workspace Settings</p>
          <h1 className="text-xl font-black tracking-tight">설정</h1>
        </div>
        <button onClick={onOpenNewTaskModal} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700" title="할 일 추가">
          <Plus className="h-5 w-5" />
        </button>
      </header>

      <section className="grid grid-cols-3 gap-2">
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <Database className="h-5 w-5 text-indigo-600" />
          <p className="mt-3 text-xs font-bold text-slate-500">완료</p>
          <h2 className="mt-1 text-xl font-black">{completed}/{tasks.length}</h2>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <CheckCircle className="h-5 w-5 text-emerald-600" />
          <p className="mt-3 text-xs font-bold text-slate-500">점수</p>
          <h2 className="mt-1 text-xl font-black">{totalScore}</h2>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <UsersRound className="h-5 w-5 text-amber-600" />
          <p className="mt-3 text-xs font-bold text-slate-500">멤버</p>
          <h2 className="mt-1 text-xl font-black">{room.members.length}</h2>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h2 className="text-lg font-black">멤버별 기여도</h2>
        <div className="mt-4 space-y-3">
          {contributions.map((contribution) => {
            const user = users.find((item) => item.id === contribution.userId);
            return (
              <div key={contribution.userId} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-3 dark:bg-slate-900">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black">{user?.name}</p>
                  <p className="text-xs text-slate-500">{contribution.completedCount}개 완료</p>
                </div>
                <p className="shrink-0 text-sm font-black text-indigo-700">{contribution.score}점 · {contribution.percentage}%</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <label className="flex min-h-20 items-center justify-between gap-3 border-b border-slate-200 p-4 dark:border-slate-700">
          <div className="flex min-w-0 items-center gap-3">
            <div className="rounded-lg bg-slate-100 p-2 dark:bg-slate-900">
              {settings.darkMode ? <Moon className="h-5 w-5 text-indigo-600" /> : <Sun className="h-5 w-5 text-amber-600" />}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black">다크 모드</p>
              <p className="text-xs text-slate-500">작업 화면의 색상을 전환합니다.</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.darkMode}
            onChange={() => onSettingsChange({ ...settings, darkMode: !settings.darkMode })}
            className="h-6 w-6 shrink-0 accent-indigo-600"
          />
        </label>

        <label className="flex min-h-20 items-center justify-between gap-3 p-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="rounded-lg bg-slate-100 p-2 dark:bg-slate-900">
              <Bell className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black">알림</p>
              <p className="text-xs text-slate-500">초대, 마감, 완료 업데이트를 받습니다.</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.notifications}
            onChange={() => onSettingsChange({ ...settings, notifications: !settings.notifications })}
            className="h-6 w-6 shrink-0 accent-indigo-600"
          />
        </label>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h2 className="text-lg font-black">데이터 관리</h2>
        <p className="mt-2 text-sm text-slate-500">현재 구현은 로컬 스토리지에 저장되며 동기화 버튼은 저장소 반영을 즉시 실행합니다.</p>
        <div className="mt-4 grid gap-2">
          <button
            onClick={triggerMockSync}
            disabled={isSyncing}
            className="flex min-h-12 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-black text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200"
          >
            {isSyncing ? (
              '동기화 중...'
            ) : syncDone ? (
              <>
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                동기화 완료
              </>
            ) : (
              <>
                <CloudLightning className="h-4 w-4" />
                지금 동기화
              </>
            )}
          </button>

          <button onClick={onClearData} className="flex min-h-12 items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-3 text-sm font-black text-white hover:bg-rose-700">
            <Trash2 className="h-4 w-4" />
            방 데이터 삭제
          </button>
        </div>
      </section>
    </div>
  );
}
