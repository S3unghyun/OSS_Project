import React, { useState, useEffect } from 'react';
import { ListTodo, Grid, Settings as SettingsIcon } from 'lucide-react';
import { Task, AppSettings, TabType } from './types';
import AllTasksView from './components/AllTasksView';
import CategoriesView from './components/CategoriesView';
import SettingsView from './components/SettingsView';
import NewTaskModal from './components/NewTaskModal';

// Initial Mock Tasks to replicate screenshots exactly on first load
const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    title: 'Revise design tokens',
    priority: 'High',
    category: 'Study',
    status: 'To Do',
    dueDate: 'Today, 4:00 PM'
  },
  {
    id: '2',
    title: 'Weekly grocery run',
    priority: 'Medium',
    category: 'Personal',
    status: 'In Progress',
    dueDate: 'Tomorrow, 11:30 AM'
  },
  {
    id: '3',
    title: 'Finalize project scope',
    priority: 'High',
    category: 'Work',
    status: 'Completed',
    dueDate: 'Yesterday, 10:00 AM'
  },
  {
    id: '4',
    title: 'Coffee with Sarah',
    priority: 'Low',
    category: 'Personal',
    status: 'To Do',
    dueDate: 'Friday, 3:00 PM'
  }
];

// Injected Profile image links from mockup
const AVATAR_URL_ALEX = "https://lh3.googleusercontent.com/aida-public/AB6AXuCoi1ApAHynRoV9Xe8VLrpri2uMd4AD3zqrV1HNeC0lGTcI-iyL-uHvvJWfLDEWFgexziPu_Em0XnA46uPWFSwNGR9hwTnokwQTTXxvgTZpA5LfO5xNa3RPPCJy-F-VBU-5d265JmXQg2J9rdAIS-wmzkZ-zheTkMJstcJY8hj5ojoehvDso6ix4QL2braURz0Rv__BSvS3oe3E_cPK4STt-kgDQoe-ZlKpghUTjXzI1a8EmNKokW5hxbT72GOxfyqQlbQy1nDhDw";

const INITIAL_SETTINGS: AppSettings = {
  darkMode: false,
  notifications: true,
  accountName: 'Alex Henderson',
  accountPlan: 'Pro Plan',
  accountAvatar: AVATAR_URL_ALEX
};

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [activeTab, setActiveTab] = useState<TabType>('All Tasks');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Load from local storage on mount
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

  // Sync dark mode class on setting change
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

  // Save updates to storage Helper
  const saveToStorage = (updatedTasks: Task[]) => {
    localStorage.setItem('todo_tasks_react', JSON.stringify(updatedTasks));
  };

  // Toggle checklist checkmark
  const handleToggleStatus = (id: string) => {
    const updated = tasks.map((task) => {
      if (task.id === id) {
        const nextStatus: Task['status'] = task.status === 'Completed' ? 'To Do' : 'Completed';
        return { ...task, status: nextStatus };
      }
      return task;
    });
    setTasks(updated);
    saveToStorage(updated);
  };

  // Dropdown manual status change
  const handleStatusChange = (id: string, newStatus: Task['status']) => {
    const updated = tasks.map((task) => {
      if (task.id === id) {
        return { ...task, status: newStatus };
      }
      return task;
    });
    setTasks(updated);
    saveToStorage(updated);
  };

  // Editing existing task
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  // Delete task
  const handleDeleteTask = (id: string) => {
    const updated = tasks.filter((task) => task.id !== id);
    setTasks(updated);
    saveToStorage(updated);
  };

  // Save new / modified task from modal
  const handleSaveTask = (taskData: Omit<Task, 'id'> & { id?: string }) => {
    if (taskData.id) {
      // Editing
      const updated = tasks.map((t) => (t.id === taskData.id ? (taskData as Task) : t));
      setTasks(updated);
      saveToStorage(updated);
    } else {
      // Creating new task, prepend for fast visibility
      const newTask: Task = {
        ...taskData,
        id: Date.now().toString()
      };
      const updated = [newTask, ...tasks];
      setTasks(updated);
      saveToStorage(updated);
    }
    setEditingTask(null);
  };

  // Clear data callback
  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to delete all tasks? This cannot be undone.')) {
      setTasks([]);
      localStorage.removeItem('todo_tasks_react');
    }
  };

  // Synchronization callback simulation
  const handleSyncDatabase = () => {
    // Sync triggers complete local tasks persist
    saveToStorage(tasks);
  };

  // Settings modification updates
  const handleSettingsChange = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('todo_settings_react', JSON.stringify(newSettings));
  };

  return (
    <div className={`min-h-screen font-sans ${settings.darkMode ? 'dark bg-[#121217] text-[#f5f4f9]' : 'bg-surface-bg text-on-surface'}`}>
      <div className="max-w-md mx-auto min-h-screen relative flex flex-col px-5 pb-20 pt-1">
        
        {/* Render Active View Layer */}
        <div className="flex-1">
          {activeTab === 'All Tasks' && (
            <AllTasksView
              tasks={tasks}
              avatarUrl={settings.accountAvatar}
              onToggleStatus={handleToggleStatus}
              onStatusChange={handleStatusChange}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onOpenNewTaskModal={() => {
                setEditingTask(null);
                setIsModalOpen(true);
              }}
              onNavigateToTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'Categories' && (
            <CategoriesView
              tasks={tasks}
              onToggleStatus={handleToggleStatus}
              onStatusChange={handleStatusChange}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
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

        {/* Persistent Bottom Bar with correct styled tabs matching screenshots 1, 2, 3 */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto bg-surface-container/95 dark:bg-inverse-surface/95 backdrop-blur-md rounded-t-3xl border-t border-outline-variant/10 shadow-[0px_-4px_12px_rgba(0,0,0,0.03)] p-4 pb-safe flex justify-around items-center">
          {/* All Tasks Tab */}
          <button
            onClick={() => setActiveTab('All Tasks')}
            className={`flex flex-col items-center justify-center py-1.5 px-4 rounded-full transition-all duration-200 cursor-pointer ${
              activeTab === 'All Tasks'
                ? 'bg-secondary-container text-on-secondary-container font-semibold scale-105'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <ListTodo className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-wide">All Tasks</span>
          </button>

          {/* Categories Tab */}
          <button
            onClick={() => setActiveTab('Categories')}
            className={`flex flex-col items-center justify-center py-1.5 px-4 rounded-full transition-all duration-200 cursor-pointer ${
              activeTab === 'Categories'
                ? 'bg-secondary-container text-on-secondary-container font-semibold scale-105'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Grid className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-wide">Categories</span>
          </button>

          {/* Settings Tab */}
          <button
            onClick={() => setActiveTab('Settings')}
            className={`flex flex-col items-center justify-center py-1.5 px-4 rounded-full transition-all duration-200 cursor-pointer ${
              activeTab === 'Settings'
                ? 'bg-secondary-container text-on-secondary-container font-semibold scale-105'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <SettingsIcon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-wide">Settings</span>
          </button>
        </nav>

        {/* Create / Edit Modal Sheet representing Screenshot 4 */}
        <NewTaskModal
          isOpen={isModalOpen}
          taskToEdit={editingTask}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTask(null);
          }}
          onSave={handleSaveTask}
        />
      </div>
    </div>
  );
}
