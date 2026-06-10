import React, { useState, useEffect } from 'react';
import { ListTodo, Grid, Settings as SettingsIcon, Calendar, Trophy, Sparkles } from 'lucide-react';
import { Task, AppSettings, TabType, ActionLog } from './types';
import AllTasksView from './components/AllTasksView';
import CalendarView from './components/CalendarView';
import CategoriesView from './components/CategoriesView';
import SettingsView from './components/SettingsView';
import NewTaskModal from './components/NewTaskModal';
import { motion, AnimatePresence } from 'motion/react';

const CURRENT_DATE_STR = "2026-06-08";

const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    title: '디자인 토큰 정리하기',
    priority: 'High',
    category: 'Study',
    status: 'To Do',
    dueDate: '2026-06-08 16:00',
    dueDateValue: '2026-06-08',
    postponeCount: 0
  },
  {
    id: '2',
    title: '주간 장보기',
    priority: 'Medium',
    category: 'Personal',
    status: 'In Progress',
    dueDate: '2026-06-09 11:30',
    dueDateValue: '2026-06-09',
    postponeCount: 0
  },
  {
    id: '3',
    title: '프로젝트 범위 확정하기',
    priority: 'High',
    category: 'Work',
    status: 'Completed',
    dueDate: '2026-06-07 10:00',
    dueDateValue: '2026-06-07',
    postponeCount: 0
  },
  {
    id: '4',
    title: '사라와 커피 약속',
    priority: 'Low',
    category: 'Personal',
    status: 'To Do',
    dueDate: '2026-06-12 15:00',
    dueDateValue: '2026-06-12',
    postponeCount: 0
  }
];

const AVATAR_URL_ALEX = "https://lh3.googleusercontent.com/aida-public/AB6AXuCoi1ApAHynRoV9Xe8VLrpri2uMd4AD3zqrV1HNeC0lGTcI-iyL-uHvvJWfLDEWFgexziPu_Em0XnA46uPWFSwNGR9hwTnokwQTTXxvgTZpA5LfO5xNa3RPPCJy-F-VBU-5d265JmXQg2J9rdAIS-wmzkZ-zheTkMJstcJY8hj5ojoehvDso6ix4QL2braURz0Rv__BSvS3oe3E_cPK4STt-kgDQoe-ZlKpghUT;jXzI1a8EmNKokW5hxbT72GOxfyqQlbQy1nDhDw";

const INITIAL_SETTINGS: AppSettings = {
  darkMode: false,
  notifications: true,
  accountName: '알렉스 헨더슨',
  accountPlan: '프로 요금제',
  accountAvatar: AVATAR_URL_ALEX
};

const addDays = (dateStr: string, days: number): string => {
  const dateObj = new Date(dateStr);
  if (isNaN(dateObj.getTime())) return dateStr;
  dateObj.setDate(dateObj.getDate() + days);
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const tabLabel: Record<TabType, string> = {
  'All Tasks': '전체',
  Calendar: '달력',
  Categories: '분류',
  Settings: '설정'
};

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [actionLogs, setActionLogs] = useState<ActionLog[]>([]);
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [activeTab, setActiveTab] = useState<TabType>('All Tasks');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [calendarPrefillDate, setCalendarPrefillDate] = useState<string | undefined>(undefined);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebratedTaskTitle, setCelebratedTaskTitle] = useState('');

  useEffect(() => {
    const storedTasks = localStorage.getItem('todo_tasks_react');
    if (storedTasks) {
      try {
        setTasks(JSON.parse(storedTasks));
      } catch (e) {
        setTasks(INITIAL_TASKS);
      }
    } else {
      setTasks(INITIAL_TASKS);
      localStorage.setItem('todo_tasks_react', JSON.stringify(INITIAL_TASKS));
    }

    const storedLogs = localStorage.getItem('todo_action_logs_react');
    if (storedLogs) {
      try {
        setActionLogs(JSON.parse(storedLogs));
      } catch (e) {
        setActionLogs([]);
      }
    }

    const storedSettings = localStorage.getItem('todo_settings_react');
    if (storedSettings) {
      try {
        setSettings(JSON.parse(storedSettings));
      } catch (e) {
        setSettings(INITIAL_SETTINGS);
      }
    }
  }, []);

  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#121217';
      document.body.style.color = '#f5f4f9';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#fcf8ff';
      document.body.style.color = '#1b1b24';
    }
  }, [settings.darkMode]);

  const saveToStorage = (updatedTasks: Task[]) => {
    localStorage.setItem('todo_tasks_react', JSON.stringify(updatedTasks));
  };

  const writeLog = (log: ActionLog) => {
    setActionLogs(prev => {
      const updatedLogs = [log, ...prev];
      localStorage.setItem('todo_action_logs_react', JSON.stringify(updatedLogs));
      return updatedLogs;
    });
  };

  const handlePostponeTask = (id: string) => {
    const updated = tasks.map((task) => {
      if (task.id !== id) return task;

      const nextPostpones = (task.postponeCount || 0) + 1;
      const currentDueDateVal = task.dueDateValue || CURRENT_DATE_STR;
      const nextDateValue = addDays(currentDueDateVal, 1);
      let nextDueDate = task.dueDate;

      if (task.dueDate && task.dueDate.includes(' ')) {
        const parts = task.dueDate.split(' ');
        nextDueDate = `${nextDateValue} ${parts[1] || '12:00'}`;
      } else {
        nextDueDate = `${nextDateValue} 12:00`;
      }

      writeLog({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
        taskId: task.id,
        taskTitle: task.title,
        category: task.category,
        actionType: 'Postpone',
        timestamp: Date.now()
      });

      return {
        ...task,
        postponeCount: nextPostpones,
        dueDateValue: nextDateValue,
        dueDate: nextDueDate
      };
    });

    setTasks(updated);
    saveToStorage(updated);
  };

  const handleToggleStatus = (id: string) => {
    let triggeredCelebration = false;
    let titleToCelebrate = '';

    const updated = tasks.map((task) => {
      if (task.id !== id) return task;

      const nextStatus: Task['status'] = task.status === 'Completed' ? 'To Do' : 'Completed';
      writeLog({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
        taskId: task.id,
        taskTitle: task.title,
        category: task.category,
        actionType: nextStatus === 'Completed' ? 'Complete' : 'Incomplete',
        timestamp: Date.now()
      });

      if (nextStatus === 'Completed') {
        triggeredCelebration = true;
        titleToCelebrate = task.title;
      }

      return { ...task, status: nextStatus };
    });

    setTasks(updated);
    saveToStorage(updated);

    if (triggeredCelebration) {
      setCelebratedTaskTitle(titleToCelebrate);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3800);
    }
  };

  const handleStatusChange = (id: string, newStatus: Task['status']) => {
    let triggeredCelebration = false;
    let titleToCelebrate = '';

    const updated = tasks.map((task) => {
      if (task.id !== id) return task;

      if (task.status !== 'Completed' && newStatus === 'Completed') {
        triggeredCelebration = true;
        titleToCelebrate = task.title;
      }

      writeLog({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
        taskId: task.id,
        taskTitle: task.title,
        category: task.category,
        actionType: newStatus === 'Completed' ? 'Complete' : 'Incomplete',
        timestamp: Date.now()
      });

      return { ...task, status: newStatus };
    });

    setTasks(updated);
    saveToStorage(updated);

    if (triggeredCelebration) {
      setCelebratedTaskTitle(titleToCelebrate);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3805);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = (id: string) => {
    const taskToDelete = tasks.find((t) => t.id === id);
    if (taskToDelete) {
      writeLog({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
        taskId: taskToDelete.id,
        taskTitle: taskToDelete.title,
        category: taskToDelete.category,
        actionType: 'Delete',
        timestamp: Date.now()
      });
    }

    const updated = tasks.filter((task) => task.id !== id);
    setTasks(updated);
    saveToStorage(updated);
  };

  const handleSaveTask = (taskData: Omit<Task, 'id'> & { id?: string }) => {
    if (taskData.id) {
      const updated = tasks.map((t) => (t.id === taskData.id ? { ...t, ...taskData } as Task : t));
      setTasks(updated);
      saveToStorage(updated);
    } else {
      const newTask: Task = {
        title: taskData.title,
        priority: taskData.priority,
        category: taskData.category,
        status: 'To Do',
        dueDate: taskData.dueDate,
        dueDateValue: taskData.dueDateValue || CURRENT_DATE_STR,
        postponeCount: 0,
        id: Date.now().toString()
      };

      writeLog({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
        taskId: newTask.id,
        taskTitle: newTask.title,
        category: newTask.category,
        actionType: 'Create',
        timestamp: Date.now()
      });

      const updated = [newTask, ...tasks];
      setTasks(updated);
      saveToStorage(updated);
    }
    setEditingTask(null);
  };

  const handleClearAllData = () => {
    if (window.confirm('모든 할 일과 통계를 삭제할까요? 이 작업은 되돌릴 수 없습니다.')) {
      setTasks([]);
      setActionLogs([]);
      localStorage.removeItem('todo_tasks_react');
      localStorage.removeItem('todo_action_logs_react');
    }
  };

  const handleSyncDatabase = () => {
    saveToStorage(tasks);
  };

  const handleSettingsChange = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('todo_settings_react', JSON.stringify(newSettings));
  };

  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter((t) => t.status === 'Completed').length;
  const progressPercentage = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;
  const hasUrgentTeamProject = tasks.some(
    (t) =>
      t.category === 'Team Project' &&
      t.status !== 'Completed' &&
      (t.dueDateValue === CURRENT_DATE_STR || t.dueDateValue === '2026-06-09')
  );
  const isCrisisMode = hasUrgentTeamProject && progressPercentage < 50;

  return (
    <div className={`min-h-screen font-sans transition-all duration-500 ease-in-out relative ${
      settings.darkMode 
        ? isCrisisMode 
          ? 'bg-[#1b0a0a] text-red-50' 
          : 'bg-[#0f0f15] text-[#f1f0f7]'
        : isCrisisMode 
          ? 'bg-rose-50/70 text-rose-950' 
          : 'bg-surface-bg text-on-surface'
    }`}>
      <div className="max-w-md mx-auto min-h-screen relative flex flex-col px-5 pb-20 pt-1">
        <div className="flex-1">
          {activeTab === 'All Tasks' && (
            <AllTasksView
              tasks={tasks}
              actionLogs={actionLogs}
              avatarUrl={settings.accountAvatar}
              onToggleStatus={handleToggleStatus}
              onStatusChange={handleStatusChange}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onPostpone={handlePostponeTask}
              onOpenNewTaskModal={() => {
                setEditingTask(null);
                setIsModalOpen(true);
              }}
              onNavigateToTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'Calendar' && (
            <CalendarView
              tasks={tasks}
              onToggleStatus={handleToggleStatus}
              onStatusChange={handleStatusChange}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onPostpone={handlePostponeTask}
              onOpenNewTaskModalWithDate={(dateStr) => {
                setCalendarPrefillDate(dateStr);
                setEditingTask(null);
                setIsModalOpen(true);
              }}
            />
          )}

          {activeTab === 'Categories' && (
            <CategoriesView
              tasks={tasks}
              onToggleStatus={handleToggleStatus}
              onStatusChange={handleStatusChange}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onPostpone={handlePostponeTask}
            />
          )}

          {activeTab === 'Settings' && (
            <SettingsView
              tasks={tasks}
              settings={settings}
              onSettingsChange={handleSettingsChange}
              onClearData={handleClearAllData}
              onSync={handleSyncDatabase}
              onOpenNewTaskModal={() => {
                setEditingTask(null);
                setIsModalOpen(true);
              }}
            />
          )}
        </div>

        <nav className="fixed bottom-0 left-0 right-0 z-45 max-w-md mx-auto bg-surface-container/95 dark:bg-inverse-surface/95 backdrop-blur-md rounded-t-3xl border-t border-outline-variant/10 shadow-[0px_-4px_12px_rgba(0,0,0,0.03)] p-4 pb-safe flex justify-around items-center">
          {[
            { tab: 'All Tasks' as const, icon: <ListTodo className="w-5 h-5 mb-0.5" /> },
            { tab: 'Calendar' as const, icon: <Calendar className="w-5 h-5 mb-0.5" /> },
            { tab: 'Categories' as const, icon: <Grid className="w-5 h-5 mb-0.5" /> },
            { tab: 'Settings' as const, icon: <SettingsIcon className="w-5 h-5 mb-0.5" /> }
          ].map((item) => (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              className={`flex flex-col items-center justify-center py-1.5 px-4 rounded-full transition-all duration-200 cursor-pointer ${
                activeTab === item.tab
                  ? 'bg-secondary-container text-on-secondary-container font-semibold scale-105'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {item.icon}
              <span className="text-[10px] tracking-wide">{tabLabel[item.tab]}</span>
            </button>
          ))}
        </nav>

        <NewTaskModal
          isOpen={isModalOpen}
          taskToEdit={editingTask}
          defaultDueDateValue={calendarPrefillDate}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTask(null);
            setCalendarPrefillDate(undefined);
          }}
          onSave={handleSaveTask}
        />
      </div>

      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/85 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50, rotate: -5 }}
              animate={{ scale: 1, y: 0, rotate: 0 }}
              exit={{ scale: 0.8, y: 50, rotate: 5 }}
              transition={{ type: 'spring', damping: 15 }}
              className="bg-gradient-to-br from-indigo-900 via-purple-950 to-pink-900 border border-purple-500/30 p-8 rounded-3xl text-center max-w-sm w-full shadow-[0_0_30px_rgba(168,85,247,0.4)] relative overflow-hidden"
            >
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: ['#f43f5e', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'][i % 6],
                      left: `${15 + Math.random() * 70}%`,
                      top: `${15 + Math.random() * 70}%`,
                    }}
                    animate={{
                      y: [0, -30, 10],
                      x: [0, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 15],
                      scale: [1, 1.5, 0.8],
                      opacity: [0, 1, 0]
                    }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>

              <div className="space-y-4 relative z-10">
                <motion.div
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse' }}
                  className="w-20 h-20 bg-gradient-to-tr from-yellow-400 to-amber-500 rounded-full flex items-center justify-center mx-auto shadow-lg"
                >
                  <Trophy className="w-10 h-10 text-slate-950 stroke-[2.5]" />
                </motion.div>

                <div>
                  <span className="inline-block py-1 px-3 bg-white/10 rounded-full text-[10px] uppercase font-black text-amber-300 tracking-wider">
                    완료 업적 달성!
                  </span>
                  <h3 className="text-xl font-black text-white tracking-tight mt-2.5 truncate max-w-full">
                    {celebratedTaskTitle}
                  </h3>
                  <p className="text-xs text-indigo-200 mt-1 font-semibold">멋지게 해냈어요. 오늘의 흐름이 더 좋아졌습니다.</p>
                </div>

                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> 보상
                    </span>
                    <span className="text-yellow-400 font-extrabold">+100 XP</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: '30%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 2.8, ease: 'easeOut' }}
                      className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 h-full"
                    />
                  </div>
                  <p className="text-[10px] text-purple-300 font-bold">오늘의 완료 습관이 기록되었습니다.</p>
                </div>

                <div className="text-[10px] text-slate-400 font-bold animate-pulse">
                  축하 화면은 잠시 후 자동으로 닫힙니다.
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
