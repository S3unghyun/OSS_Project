import React, { useState } from 'react';
import { Attachment, Task, User } from '../types';

interface CompletionUploadModalProps {
  task: Task | null;
  users: User[];
  currentUserId: string;
  onClose: () => void;
  onComplete: (taskId: string, note: string, attachment?: Attachment) => void;
}

export default function CompletionUploadModal({ task, users, currentUserId, onClose, onComplete }: CompletionUploadModalProps) {
  const [note, setNote] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const currentUser = users.find((user) => user.id === currentUserId);

  if (!task) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    let attachment: Attachment | undefined;

    if (file) {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });

      attachment = {
        id: `${Date.now()}-${file.name}`,
        fileName: file.name,
        fileType: file.type || 'application/octet-stream',
        fileSize: file.size,
        uploadedById: currentUserId,
        uploadedAt: Date.now(),
        dataUrl
      };
    }

    onComplete(task.id, note.trim() || '완료 증빙을 등록했습니다.', attachment);
    setNote('');
    setFile(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/65 p-0 backdrop-blur sm:items-center sm:p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-t-lg bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl dark:bg-slate-900 sm:rounded-lg">
        <div className="mb-5">
          <p className="text-xs font-black uppercase tracking-widest text-emerald-600">완료 처리</p>
          <h2 className="mt-1 break-words text-xl font-black">{task.title}</h2>
          <p className="mt-2 text-sm text-slate-500">
            {currentUser?.name}님이 완료자로 기록되고, 첨부 파일은 이 할 일의 완료 증빙으로 저장됩니다.
          </p>
        </div>

        <label className="block">
          <span className="text-xs font-black uppercase tracking-widest text-slate-500">완료 메모</span>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={4}
            placeholder="작업 결과나 확인 내용을 적어 주세요."
            className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-base outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800"
          />
        </label>

        <label className="mt-4 block">
          <span className="text-xs font-black uppercase tracking-widest text-slate-500">증빙 파일</span>
          <input
            type="file"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
            className="mt-2 min-h-14 w-full rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm font-semibold dark:border-slate-700 dark:bg-slate-800"
          />
        </label>

        <div className="mt-6 grid grid-cols-2 gap-2">
          <button type="button" onClick={onClose} className="min-h-12 rounded-lg border border-slate-200 px-4 py-3 text-sm font-black text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200">
            취소
          </button>
          <button type="submit" className="min-h-12 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-black text-white hover:bg-emerald-700">
            업로드 후 완료
          </button>
        </div>
      </form>
    </div>
  );
}
