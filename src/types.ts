export interface Task {
  id: string;
  title: string;
  priority: 'Low' | 'Medium' | 'High';
  category: 'Work' | 'Personal' | 'Study' | 'Team Project';
  status: 'To Do' | 'In Progress' | 'Completed';
  dueDate: string;
}

export interface AppSettings {
  darkMode: boolean;
  notifications: boolean;
  accountName: string;
  accountPlan: string;
  accountAvatar: string;
}

export type TabType = 'All Tasks' | 'Categories' | 'Settings';
