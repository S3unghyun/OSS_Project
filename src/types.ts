export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface RoomMember {
  userId: string;
  role: 'Host' | 'Member';
  joinedAt: number;
}

export interface Room {
  id: string;
  name: string;
  date: string;
  hostId: string;
  inviteCode: string;
  members: RoomMember[];
}

export interface Attachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedById: string;
  uploadedAt: number;
  dataUrl: string;
}

export interface Task {
  id: string;
  roomId: string;
  title: string;
  priority: 'Low' | 'Medium' | 'High';
  category: 'Work' | 'Personal' | 'Study' | 'Team Project';
  status: 'To Do' | 'In Progress' | 'Completed';
  dueDate: string;
  dueDateValue?: string;
  weight: number;
  createdById: string;
  assigneeId?: string;
  completedById?: string;
  completedAt?: number;
  completionNote?: string;
  attachment?: Attachment;
  postponeCount?: number;
  createdTime?: number;
}

export interface Contribution {
  userId: string;
  completedCount: number;
  score: number;
  percentage: number;
}

export interface ActionLog {
  id: string;
  taskId: string;
  taskTitle: string;
  roomId: string;
  actorId: string;
  category: Task['category'];
  actionType: 'Create' | 'Complete' | 'Incomplete' | 'Postpone' | 'Delete' | 'Upload';
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
