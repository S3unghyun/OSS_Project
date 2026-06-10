import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Grid, ListTodo, Settings as SettingsIcon } from 'lucide-react';
import AllTasksView from './components/AllTasksView';
import CalendarView from './components/CalendarView';
import CategoriesView from './components/CategoriesView';
import CompletionUploadModal from './components/CompletionUploadModal';
import NewTaskModal from './components/NewTaskModal';
import SettingsView from './components/SettingsView';
import { ActionLog, AppSettings, Attachment, Contribution, Room, TabType, Task, User } from './types';

const STORAGE_KEY = 'group_todo_workspace_v1';
const CURRENT_DATE_STR = '2026-06-10';

const USERS: User[] = [
  { id: 'u-host', name: '류상훈', email: 'sanghun@example.com', avatarUrl: 'https://api.dicebear.com/8.x/initials/svg?seed=RSH' },
  { id: 'u-seulgichan', name: '이슬기찬', email: 'seulgichan@example.com', avatarUrl: 'https://api.dicebear.com/8.x/initials/svg?seed=LSG' },
  { id: 'u-minjun', name: '최민준', email: 'minjun@example.com', avatarUrl: 'https://api.dicebear.com/8.x/initials/svg?seed=CMJ' },
  { id: 'u-seunghyun', name: '하승현', email: 'seunghyun@example.com', avatarUrl: 'https://api.dicebear.com/8.x/initials/svg?seed=HSH' }
];

const CURRENT_USER_ID = 'u-host';

const INITIAL_ROOM: Room = {
  id: 'room-1',
  name: 'OSS_GROUP_TODO-LIST',
  date: CURRENT_DATE_STR,
  hostId: CURRENT_USER_ID,
  inviteCode: 'https://todo-room.app/invite/OSS-TEAM-610',
  members: USERS.map((user, index) => ({
    userId: user.id,
    role: index === 0 ? 'Host' : 'Member',
    joinedAt: Date.now() - index * 3600000
  }))
};

const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    roomId: 'room-1',
    title: '캘린더 기반 생성 플로우 정리',
    priority: 'High',
    category: 'Team Project',
    status: 'Completed',
    dueDate: '2026-06-10 14:00',
    dueDateValue: '2026-06-10',
    weight: 3,
    createdById: 'u-host',
    assigneeId: 'u-seulgichan',
    completedById: 'u-seulgichan',
    completedAt: Date.now() - 7200000,
    completionNote: '초대 링크 화면까지 검수 완료',
    postponeCount: 0
  },
  {
    id: 'task-2',
    roomId: 'room-1',
    title: '완료 증빙 업로드 모달 구현',
    priority: 'High',
    category: 'Work',
    status: 'In Progress',
    dueDate: '2026-06-10 18:00',
    dueDateValue: '2026-06-10',
    weight: 5,
    createdById: 'u-host',
    assigneeId: 'u-host',
    postponeCount: 0
  },
  {
    id: 'task-3',
    roomId: 'room-1',
    title: '기여도 계산 기준 문서화',
    priority: 'Medium',
    category: 'Study',
    status: 'To Do',
    dueDate: '2026-06-11 12:00',
    dueDateValue: '2026-06-11',
    weight: 2,
    createdById: 'u-minjun',
    assigneeId: 'u-seunghyun',
    postponeCount: 0
  }
];

const INITIAL_SETTINGS: AppSettings = {
  darkMode: false,
  notifications: true,
  accountName: '류상훈',
  accountPlan: 'Team Beta',
  accountAvatar: USERS[0].avatarUrl || ''
};

const tabLabel: Record<TabType, string> = {
  'All Tasks': '할 일',
  Calendar: '달력',
  Categories: '분류',
  Settings: '설정'
};

interface StoredWorkspace {
  tasks: Task[];
  room: Room;
  actionLogs: ActionLog[];
  settings: AppSettings;
}

const buildLog = (
  task: Task,
  actionType: ActionLog['actionType'],
  actorId = CURRENT_USER_ID
): ActionLog => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  taskId: task.id,
  taskTitle: task.title,
  roomId: task.roomId,
  actorId,
  category: task.category,
  actionType,
  timestamp: Date.now()
});

const calculateContributions = (tasks: Task[], members: Room['members']): Contribution[] => {
  const completed = tasks.filter((task) => task.status === 'Completed' && task.completedById);
  const totalScore = completed.reduce((sum, task) => sum + task.weight, 0);

  return members.map((member) => {
    const userTasks = completed.filter((task) => task.completedById === member.userId);
    const score = userTasks.reduce((sum, task) => sum + task.weight, 0);
    return {
      userId: member.userId,
      completedCount: userTasks.length,
      score,
      percentage: totalScore > 0 ? Math.round((score / totalScore) * 100) : 0
    };
  });
};

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [room, setRoom] = useState<Room>(INITIAL_ROOM);
  const [actionLogs, setActionLogs] = useState<ActionLog[]>([]);
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [activeTab, setActiveTab] = useState<TabType>('All Tasks');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [calendarPrefillDate, setCalendarPrefillDate] = useState<string | undefined>(undefined);
  const [completionTarget, setCompletionTarget] = useState<Task | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored) as StoredWorkspace;
      setTasks(parsed.tasks || INITIAL_TASKS);
      setRoom(parsed.room || INITIAL_ROOM);
      setActionLogs(parsed.actionLogs || []);
      setSettings(parsed.settings || INITIAL_SETTINGS);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    const workspace: StoredWorkspace = { tasks, room, actionLogs, settings };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
  }, [tasks, room, actionLogs, settings]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.darkMode);
    document.body.style.backgroundColor = settings.darkMode ? '#111827' : '#f8fafc';
  }, [settings.darkMode]);

  const contributions = useMemo(() => calculateContributions(tasks, room.members), [tasks, room.members]);
  const currentUser = USERS.find((user) => user.id === CURRENT_USER_ID) || USERS[0];

  const writeLog = (log: ActionLog) => setActionLogs((prev) => [log, ...prev].slice(0, 50));

  const handleRequestComplete = (id: string) => {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;

    if (task.status === 'Completed') {
      const updated = tasks.map((item) =>
        item.id === id
          ? { ...item, status: 'To Do' as const, completedById: undefined, completedAt: undefined, completionNote: undefined, attachment: undefined }
          : item
      );
      setTasks(updated);
      writeLog(buildLog(task, 'Incomplete'));
      return;
    }

    setCompletionTarget(task);
  };

  const handleStatusChange = (id: string, status: Task['status']) => {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;

    if (status === 'Completed' && task.status !== 'Completed') {
      setCompletionTarget(task);
      return;
    }

    const updated = tasks.map((item) =>
      item.id === id
        ? {
            ...item,
            status,
            ...(status !== 'Completed'
              ? { completedById: undefined, completedAt: undefined, completionNote: undefined, attachment: undefined }
              : {})
          }
        : item
    );
    setTasks(updated);
    writeLog(buildLog(task, status === 'Completed' ? 'Complete' : 'Incomplete'));
  };

  const handleCompleteWithUpload = (taskId: string, note: string, attachment?: Attachment) => {
    const target = tasks.find((task) => task.id === taskId);
    const updated = tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            status: 'Completed' as const,
            completedById: CURRENT_USER_ID,
            completedAt: Date.now(),
            completionNote: note,
            attachment
          }
        : task
    );

    setTasks(updated);
    setCompletionTarget(null);
    if (target) {
      writeLog(buildLog(target, attachment ? 'Upload' : 'Complete'));
    }
  };

  const handlePostponeTask = (id: string) => {
    const updated = tasks.map((task) => {
      if (task.id !== id) return task;
      const date = new Date(task.dueDateValue || CURRENT_DATE_STR);
      date.setDate(date.getDate() + 1);
      const nextDate = date.toISOString().slice(0, 10);
      writeLog(buildLog(task, 'Postpone'));
      return {
        ...task,
        dueDateValue: nextDate,
        dueDate: `${nextDate} 18:00`,
        postponeCount: (task.postponeCount || 0) + 1
      };
    });
    setTasks(updated);
  };

  const handleDeleteTask = (id: string) => {
    const task = tasks.find((item) => item.id === id);
    if (task) writeLog(buildLog(task, 'Delete'));
    setTasks((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'roomId' | 'createdById'> & { id?: string }) => {
    if (taskData.id) {
      const existing = tasks.find((task) => task.id === taskData.id);
      setTasks((prev) => prev.map((task) => (task.id === taskData.id ? { ...task, ...taskData } : task)));
      if (existing) writeLog(buildLog(existing, 'Create'));
      setEditingTask(null);
      return;
    }

    const newTask: Task = {
      ...taskData,
      id: `${Date.now()}`,
      roomId: room.id,
      createdById: CURRENT_USER_ID,
      createdTime: Date.now(),
      status: taskData.status || 'To Do',
      weight: taskData.weight || 1,
      postponeCount: 0
    };

    setTasks((prev) => [newTask, ...prev]);
    writeLog(buildLog(newTask, 'Create'));
    setEditingTask(null);
  };

  const handleCreateRoomFromDate = (dateStr: string) => {
    const nextRoom: Room = {
      ...INITIAL_ROOM,
      id: `room-${Date.now()}`,
      date: dateStr,
      name: `${dateStr} 작업방`,
      inviteCode: `https://todo-room.app/invite/${Math.random().toString(36).slice(2, 9).toUpperCase()}`
    };
    setRoom(nextRoom);
  };

  const handleClearAllData = () => {
    if (!window.confirm('현재 방의 할 일과 활동 기록을 모두 삭제할까요?')) return;
    setTasks([]);
    setActionLogs([]);
  };

  const handleSettingsChange = (nextSettings: AppSettings) => setSettings(nextSettings);
  const handleSyncDatabase = () => localStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks, room, actionLogs, settings }));

  const commonTaskProps = {
    users: USERS,
    currentUserId: CURRENT_USER_ID,
    onToggleStatus: handleRequestComplete,
    onStatusChange: handleStatusChange,
    onEdit: (task: Task) => {
      setEditingTask(task);
      setIsModalOpen(true);
    },
    onDelete: handleDeleteTask,
    onPostpone: handlePostponeTask
  };

  return (
    <div className={`min-h-screen font-sans transition-colors ${settings.darkMode ? 'bg-slate-900 text-slate-50' : 'bg-slate-50 text-slate-950'}`}>
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-3 pb-24 pt-2 sm:px-4">
        <main className="flex-1">
          {activeTab === 'All Tasks' && (
            <AllTasksView
              tasks={tasks}
              room={room}
              users={USERS}
              currentUser={currentUser}
              contributions={contributions}
              actionLogs={actionLogs}
              onOpenNewTaskModal={() => {
                setEditingTask(null);
                setIsModalOpen(true);
              }}
              onNavigateToTab={setActiveTab}
              {...commonTaskProps}
            />
          )}

          {activeTab === 'Calendar' && (
            <CalendarView
              tasks={tasks}
              room={room}
              onCreateRoomFromDate={handleCreateRoomFromDate}
              onOpenNewTaskModalWithDate={(dateStr) => {
                setCalendarPrefillDate(dateStr);
                setEditingTask(null);
                setIsModalOpen(true);
              }}
              {...commonTaskProps}
            />
          )}

          {activeTab === 'Categories' && <CategoriesView tasks={tasks} {...commonTaskProps} />}

          {activeTab === 'Settings' && (
            <SettingsView
              tasks={tasks}
              room={room}
              users={USERS}
              settings={settings}
              contributions={contributions}
              onSettingsChange={handleSettingsChange}
              onClearData={handleClearAllData}
              onSync={handleSyncDatabase}
              onOpenNewTaskModal={() => {
                setEditingTask(null);
                setIsModalOpen(true);
              }}
            />
          )}
        </main>

        <nav className="fixed bottom-0 left-0 right-0 z-40 mx-auto flex w-full max-w-md items-center justify-around border-t border-slate-200 bg-white/95 px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
          {[
            { tab: 'All Tasks' as const, icon: <ListTodo className="h-5 w-5" /> },
            { tab: 'Calendar' as const, icon: <Calendar className="h-5 w-5" /> },
            { tab: 'Categories' as const, icon: <Grid className="h-5 w-5" /> },
            { tab: 'Settings' as const, icon: <SettingsIcon className="h-5 w-5" /> }
          ].map((item) => (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              className={`flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-[11px] font-bold transition ${
                activeTab === item.tab ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {item.icon}
              <span>{tabLabel[item.tab]}</span>
            </button>
          ))}
        </nav>

        <NewTaskModal
          isOpen={isModalOpen}
          taskToEdit={editingTask}
          users={USERS}
          defaultDueDateValue={calendarPrefillDate}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTask(null);
            setCalendarPrefillDate(undefined);
          }}
          onSave={handleSaveTask}
        />

        <CompletionUploadModal
          task={completionTarget}
          users={USERS}
          currentUserId={CURRENT_USER_ID}
          onClose={() => setCompletionTarget(null)}
          onComplete={handleCompleteWithUpload}
        />
      </div>
    </div>
  );
}
