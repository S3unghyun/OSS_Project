import React from 'react';
import { Calendar, Check, Download, Edit2, FileText, Flag, Paperclip, Trash2, UserRound } from 'lucide-react';
import { Task, User } from '../types';

interface TaskCardProps {
  key?: string;
  task: Task;
  users: User[];
  onToggleStatus: (id: string) => void;
  onStatusChange: (id: string, status: Task['status']) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onPostpone?: (id: string) => void;
}

const priorityLabel: Record<Task['priority'], string> = {
  Low: '낮음',
  Medium: '보통',
  High: '높음'
};

const categoryLabel: Record<Task['category'], string> = {
  Work: '업무',
  Personal: '개인',
  Study: '학습',
  'Team Project': '팀 프로젝트'
};

const statusLabel: Record<Task['status'], string> = {
  'To Do': '예정',
  'In Progress': '진행 중',
  Completed: '완료'
};

const getUserName = (users: User[], userId?: string) => users.find((user) => user.id === userId)?.name || '미지정';

export default function TaskCard({ task, users, onToggleStatus, onStatusChange, onEdit, onDelete, onPostpone }: TaskCardProps) {
  const isCompleted = task.status === 'Completed';
  const creator = getUserName(users, task.createdById);
  const assignee = getUserName(users, task.assigneeId);
  const completedBy = getUserName(users, task.completedById);

  return (
    <article className={`rounded-lg border bg-white p-4 shadow-sm transition dark:border-slate-700 dark:bg-slate-800 ${isCompleted ? 'border-emerald-200' : 'border-slate-200'}`}>
      <div className="flex gap-3">
        <button
          onClick={() => onToggleStatus(task.id)}
          className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-2 transition ${
            isCompleted ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300 hover:border-indigo-500'
          }`}
          aria-label="완료 상태 변경"
        >
          {isCompleted && <Check className="h-4 w-4 stroke-[3]" />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={`truncate text-base font-bold ${isCompleted ? 'text-slate-500 line-through' : 'text-slate-950 dark:text-white'}`}>{task.title}</h3>
            <span className="rounded-md bg-indigo-50 px-2 py-1 text-[11px] font-bold text-indigo-700">{categoryLabel[task.category]}</span>
            <span className="rounded-md bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-700">
              <Flag className="mr-1 inline h-3 w-3" />
              {priorityLabel[task.priority]} · {task.weight}점
            </span>
          </div>

          <div className="mt-3 grid gap-2 text-xs text-slate-600 dark:text-slate-300 sm:grid-cols-2">
            <span className="flex items-center gap-1.5">
              <UserRound className="h-3.5 w-3.5" />
              생성 {creator} · 담당 {assignee}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {task.dueDate}
            </span>
            {task.completedById && (
              <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
                <Check className="h-3.5 w-3.5" />
                {completedBy} 완료
              </span>
            )}
            {task.attachment && (
              <a
                href={task.attachment.dataUrl}
                download={task.attachment.fileName}
                className="flex items-center gap-1.5 font-semibold text-indigo-700 hover:underline"
              >
                <Download className="h-3.5 w-3.5" />
                {task.attachment.fileName}
              </a>
            )}
          </div>

          {task.completionNote && (
            <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-900">
              <FileText className="mr-1 inline h-3.5 w-3.5" />
              {task.completionNote}
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <select
            value={task.status}
            onChange={(event) => onStatusChange(task.id, event.target.value as Task['status'])}
            className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-bold text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="To Do">{statusLabel['To Do']}</option>
            <option value="In Progress">{statusLabel['In Progress']}</option>
            <option value="Completed">{statusLabel.Completed}</option>
          </select>

          <div className="flex gap-1">
            {onPostpone && !isCompleted && (
              <button onClick={() => onPostpone(task.id)} className="rounded-md p-1.5 text-slate-500 hover:bg-amber-50 hover:text-amber-700" title="하루 미루기">
                <Paperclip className="h-4 w-4" />
              </button>
            )}
            <button onClick={() => onEdit(task)} className="rounded-md p-1.5 text-slate-500 hover:bg-indigo-50 hover:text-indigo-700" title="수정">
              <Edit2 className="h-4 w-4" />
            </button>
            <button onClick={() => onDelete(task.id)} className="rounded-md p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-700" title="삭제">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
