import React, { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, Save } from 'lucide-react';
import { Task, User } from '../types';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'roomId' | 'createdById'> & { id?: string }) => void;
  taskToEdit?: Task | null;
  defaultDueDateValue?: string;
  users: User[];
}

export default function NewTaskModal({ isOpen, onClose, onSave, taskToEdit, defaultDueDateValue, users }: NewTaskModalProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('High');
  const [category, setCategory] = useState<Task['category']>('Team Project');
  const [status, setStatus] = useState<Task['status']>('To Do');
  const [assigneeId, setAssigneeId] = useState(users[0]?.id);
  const [dueDateValue, setDueDateValue] = useState(defaultDueDateValue || '2026-06-10');
  const [dueTime, setDueTime] = useState('18:00');
  const [weight, setWeight] = useState(3);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setPriority(taskToEdit.priority);
      setCategory(taskToEdit.category);
      setStatus(taskToEdit.status);
      setAssigneeId(taskToEdit.assigneeId || users[0]?.id);
      setDueDateValue(taskToEdit.dueDateValue || '2026-06-10');
      setDueTime(taskToEdit.dueDate.split(' ')[1] || '18:00');
      setWeight(taskToEdit.weight || 1);
    } else {
      setTitle('');
      setPriority('High');
      setCategory('Team Project');
      setStatus('To Do');
      setAssigneeId(users[0]?.id);
      setDueDateValue(defaultDueDateValue || '2026-06-10');
      setDueTime('18:00');
      setWeight(3);
    }
  }, [taskToEdit, defaultDueDateValue, users, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;

    onSave({
      ...(taskToEdit ? { id: taskToEdit.id } : {}),
      title: title.trim(),
      priority,
      category,
      status,
      dueDate: `${dueDateValue} ${dueTime}`,
      dueDateValue,
      weight,
      assigneeId,
      completedById: taskToEdit?.completedById,
      completedAt: taskToEdit?.completedAt,
      completionNote: taskToEdit?.completionNote,
      attachment: taskToEdit?.attachment,
      postponeCount: taskToEdit?.postponeCount || 0
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 p-4 backdrop-blur">
      <div className="mx-auto max-w-xl rounded-lg bg-white shadow-2xl dark:bg-slate-900">
        <header className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-700">
          <button onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" title="닫기">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-black">{taskToEdit ? '할 일 수정' : '새 할 일'}</h1>
          <div className="w-9" />
        </header>

        <form onSubmit={handleSubmit} className="space-y-5 p-5">
          <label className="block">
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">제목</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              placeholder="무엇을 해야 하나요?"
              className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-black uppercase tracking-widest text-slate-500">담당자</span>
              <select value={assigneeId} onChange={(event) => setAssigneeId(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold dark:border-slate-700 dark:bg-slate-800">
                {users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-black uppercase tracking-widest text-slate-500">가중치</span>
              <input
                type="number"
                min={1}
                max={10}
                value={weight}
                onChange={(event) => setWeight(Number(event.target.value))}
                className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold dark:border-slate-700 dark:bg-slate-800"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block">
              <span className="text-xs font-black uppercase tracking-widest text-slate-500">우선순위</span>
              <select value={priority} onChange={(event) => setPriority(event.target.value as Task['priority'])} className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold dark:border-slate-700 dark:bg-slate-800">
                <option value="High">높음</option>
                <option value="Medium">보통</option>
                <option value="Low">낮음</option>
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-black uppercase tracking-widest text-slate-500">분류</span>
              <select value={category} onChange={(event) => setCategory(event.target.value as Task['category'])} className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold dark:border-slate-700 dark:bg-slate-800">
                <option value="Team Project">팀 프로젝트</option>
                <option value="Work">업무</option>
                <option value="Study">학습</option>
                <option value="Personal">개인</option>
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-black uppercase tracking-widest text-slate-500">상태</span>
              <select value={status} onChange={(event) => setStatus(event.target.value as Task['status'])} className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold dark:border-slate-700 dark:bg-slate-800">
                <option value="To Do">예정</option>
                <option value="In Progress">진행 중</option>
                <option value="Completed">완료</option>
              </select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_0.7fr]">
            <label className="block">
              <span className="text-xs font-black uppercase tracking-widest text-slate-500">마감일</span>
              <input type="date" value={dueDateValue} onChange={(event) => setDueDateValue(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold dark:border-slate-700 dark:bg-slate-800" />
            </label>

            <label className="block">
              <span className="text-xs font-black uppercase tracking-widest text-slate-500">시간</span>
              <input type="time" value={dueTime} onChange={(event) => setDueTime(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold dark:border-slate-700 dark:bg-slate-800" />
            </label>
          </div>

          <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-black text-white hover:bg-indigo-700">
            {taskToEdit ? <Save className="h-4 w-4" /> : <Calendar className="h-4 w-4" />}
            {taskToEdit ? '변경 저장' : '할 일 생성'}
          </button>
        </form>
      </div>
    </div>
  );
}
