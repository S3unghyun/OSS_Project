import React, { useState } from 'react';
import { ListTodo, Plus, TrendingUp, Briefcase, User, GraduationCap, Users, Moon, Sun, Bell, ChevronRight, CloudLightning, Trash2, CheckCircle } from 'lucide-react';
import { Task, AppSettings } from '../types';

interface SettingsViewProps {
  tasks: Task[];
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
  onClearData: () => void;
  onSync: () => void;
  onOpenNewTaskModal: () => void;
}

export default function SettingsView({
  tasks,
  settings,
  onSettingsChange,
  onClearData,
  onSync,
  onOpenNewTaskModal
}: SettingsViewProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncDone, setSyncDone] = useState(false);

  // Dynamic statistics calculations
  const realCompletedCount = tasks.filter((t) => t.status === 'Completed').length;
  const totalCompletedCount = 124 + realCompletedCount; // Starting from 124 to simulate a rich history

  const workCompleted = 39 + tasks.filter((t) => t.category === 'Work' && t.status === 'Completed').length;
  const personalCompleted = 26 + tasks.filter((t) => t.category === 'Personal' && t.status === 'Completed').length;

  const totalPossible = totalCompletedCount + tasks.filter((t) => t.status !== 'Completed').length;
  const baseRate = totalPossible > 0 ? Math.round((totalCompletedCount / totalPossible) * 100) : 75;

  // Circle dynamic SVG math
  const strokeRadius = 32;
  const strokeCircumference = 2 * Math.PI * strokeRadius; // 201.06
  const strokeOffset = strokeCircumference - (strokeCircumference * (baseRate / 100));

  const handleDarkToggle = () => {
    onSettingsChange({
      ...settings,
      darkMode: !settings.darkMode
    });
  };

  const handleNotificationToggle = () => {
    onSettingsChange({
      ...settings,
      notifications: !settings.notifications
    });
  };

  const triggerMockSync = () => {
    setIsSyncing(true);
    setSyncDone(false);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncDone(true);
      onSync();
      setTimeout(() => setSyncDone(false), 3000);
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Top Header */}
      <header className="sticky top-0 z-30 flex justify-between items-center bg-surface-bg/85 backdrop-blur-md py-4 w-full">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-xl text-primary">
            <ListTodo className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h1 className="text-xl font-bold text-primary tracking-tight">Settings</h1>
        </div>
        <button
          onClick={onOpenNewTaskModal}
          className="text-on-surface-variant hover:text-primary transition-all p-2 hover:bg-surface-container rounded-xl active:scale-90 duration-200"
          title="Create New Task"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>
      </header>

      {/* Statistics Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-on-surface tracking-tight">Statistics</h2>
        
        <div className="grid grid-cols-2 gap-3">
          {/* Large Stats Card (col-span-2) */}
          <div className="col-span-2 p-5 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-[0px_4px_12px_rgba(0,0,0,0.03)] flex justify-between items-end">
            <div>
              <p className="text-[10px] font-bold text-outline uppercase tracking-widest">Total Completed</p>
              <h3 className="text-3xl font-extrabold text-primary tracking-tight mt-1">{totalCompletedCount}</h3>
              <p className="text-xs text-success-emerald font-semibold flex items-center gap-1 mt-1">
                <TrendingUp className="w-3.5 h-3.5" />
                +12% this week
              </p>
            </div>

            <div className="relative w-20 h-20 flex items-center justify-center flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  className="text-surface-container stroke-current"
                  cx="40"
                  cy="40"
                  fill="transparent"
                  r={strokeRadius}
                  strokeWidth="6"
                />
                <circle
                  className="text-primary stroke-current transition-all duration-700 ease-out"
                  cx="40"
                  cy="40"
                  fill="transparent"
                  r={strokeRadius}
                  strokeDasharray={strokeCircumference}
                  strokeDashoffset={strokeOffset}
                  strokeLinecap="round"
                  strokeWidth="6"
                />
              </svg>
              <div className="absolute font-bold text-xs text-on-surface">{baseRate}%</div>
            </div>
          </div>

          {/* Mini Cards */}
          <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/20 flex flex-col gap-2 shadow-[0px_2px_8px_rgba(0,0,0,0.01)]">
            <div className="flex items-center justify-between">
              <Briefcase className="w-4 h-4 text-warning-amber" />
              <span className="text-xs font-bold text-on-surface-variant">{workCompleted}</span>
            </div>
            <p className="text-xs font-bold text-on-surface">Work</p>
            <div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden">
              <div className="bg-warning-amber h-full" style={{ width: '60%' }}></div>
            </div>
          </div>

          <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/20 flex flex-col gap-2 shadow-[0px_2px_8px_rgba(0,0,0,0.01)]">
            <div className="flex items-center justify-between">
              <User className="w-4 h-4 text-success-emerald" />
              <span className="text-xs font-bold text-on-surface-variant">{personalCompleted}</span>
            </div>
            <p className="text-xs font-bold text-on-surface">Personal</p>
            <div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden">
              <div className="bg-success-emerald h-full" style={{ width: '45%' }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Preferences Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-on-surface tracking-tight">Preferences</h2>
        
        <div className="bg-surface-container-lowest rounded-2xl shadow-[0px_4px_12px_rgba(0,0,0,0.03)] border border-outline-variant/20 divide-y divide-outline-variant/15 overflow-hidden">
          {/* Dark Mode Row */}
          <div className="flex items-center justify-between p-4 transition-colors hover:bg-surface-container-lowest/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center bg-surface-container rounded-xl text-on-surface-variant">
                {settings.darkMode ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-warning-amber" />}
              </div>
              <div>
                <p className="text-sm font-bold text-on-surface">Dark Mode</p>
                <p className="text-[11px] text-outline font-medium">Adjust app appearance</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.darkMode}
                onChange={handleDarkToggle}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {/* Notifications Row */}
          <button
            onClick={handleNotificationToggle}
            className="w-full flex items-center justify-between p-4 transition-colors hover:bg-surface-container-low/40"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center bg-surface-container rounded-xl text-on-surface-variant">
                <Bell className={`w-5 h-5 ${settings.notifications ? 'text-primary' : ''}`} />
              </div>
              <div className="text-left font-sans">
                <p className="text-sm font-bold text-on-surface">Notifications</p>
                <p className="text-[11px] text-outline font-medium">
                  {settings.notifications ? 'Enabled' : 'Disabled'} • Push, email & reminders
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-outline" />
          </button>

          {/* Account Details Row */}
          <div className="w-full flex items-center justify-between p-4 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center bg-surface-container rounded-xl overflow-hidden shadow-sm">
                <img
                  alt="Account Headshot"
                  src={settings.accountAvatar}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-on-surface">{settings.accountName}</p>
                <span className="text-[10px] font-bold uppercase py-0.5 px-2 rounded bg-gradient-to-r from-primary to-primary-container text-white">
                  {settings.accountPlan}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-outline" />
          </div>
        </div>
      </section>

      {/* Data Management Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-on-surface tracking-tight">Data Management</h2>
        
        <div className="bg-surface-container-lowest rounded-2xl shadow-[0px_4px_12px_rgba(0,0,0,0.03)] border border-outline-variant/20 p-4 space-y-4">
          <p className="text-xs text-outline leading-relaxed font-medium">
            Manage your local storage and cloud synchronization. Actions in this section are permanent and irreversible.
          </p>

          <div className="flex flex-col gap-2.5">
            {/* Sync now button */}
            <button
              onClick={triggerMockSync}
              disabled={isSyncing}
              className={`flex items-center justify-center gap-2 w-full py-3 px-4 border border-outline text-outline font-bold text-xs rounded-xl transition-all duration-200 cursor-pointer ${
                isSyncing ? 'opacity-50 cursor-wait' : 'hover:bg-surface-container-low active:scale-95'
              }`}
            >
              {isSyncing ? (
                <>
                  <div className="w-4 h-4 border-2 border-outline border-t-transparent rounded-full animate-spin"></div>
                  Syncing database...
                </>
              ) : syncDone ? (
                <>
                  <CheckCircle className="w-4 h-4 text-success-emerald" />
                  Synced successfully
                </>
              ) : (
                <>
                  <CloudLightning className="w-4 h-4" />
                  Sync Now
                </>
              )}
            </button>

            {/* Clear All Data */}
            <button
              onClick={onClearData}
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-danger-container text-on-danger-container font-bold text-xs rounded-xl hover:opacity-95 transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              Clear All Data
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
