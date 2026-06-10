export interface Task {
  id: string;
  title: string;
  priority: 'Low' | 'Medium' | 'High';
  category: 'Work' | 'Personal' | 'Study' | 'Team Project';
  status: 'To Do' | 'In Progress' | 'Completed';
  dueDate: string; // Readable text like "2026-06-09 18:00" or similar
  dueDateValue?: string; // Standard format YYYY-MM-DD for precise sorting/calendaring
  postponeCount?: number; // Count how many times the task has been postponed
  createdTime?: number; // timestamp when created
}

export interface ActionLog {
  id: string;
  taskId: string;
  taskTitle: string;
  category: Task['category'];
  actionType: 'Create' | 'Complete' | 'Incomplete' | 'Postpone' | 'Delete';
  timestamp: number;
}

export interface AppSettings {
  darkMode: boolean;
  notifications: boolean;
  accountName: string;
  accountPlan: string;
  accountAvatar: string;
}

export type TabType = 'All Tasks' | 'Calendar' | 'Categories' | 'Settings';
