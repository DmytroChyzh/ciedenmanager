import Link from 'next/link';
import React, { useState } from 'react';

interface ChatSessionsTableProps {
  sessions: any[];
  selectedSessionId?: string | null;
  onSelect?: (id: string) => void;
  onGenerateReport?: (id: string) => void;
}

export default function ChatSessionsTable({ sessions, selectedSessionId, onSelect, onGenerateReport }: ChatSessionsTableProps) {
  const [filter, setFilter] = useState({ status: 'all', email: '' });

  const filtered = sessions.filter(session => {
    const matchesStatus = filter.status === 'all' || session.metadata?.status === filter.status;
    const matchesEmail = !filter.email || session.metadata?.userEmail?.toLowerCase().includes(filter.email.toLowerCase());
    return matchesStatus && matchesEmail;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Активна';
      case 'completed': return 'Завершена';
      case 'archived': return 'Архівна';
      default: return status;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#ede7ff] p-8 h-full min-h-0 flex flex-col pb-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <h2 className="text-xl font-semibold text-[#651FFF]">Останні сесії</h2>
        <div className="flex gap-2">
          <select
            value={filter.status}
            onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="all">Всі статуси</option>
            <option value="active">Активні</option>
            <option value="completed">Завершені</option>
            <option value="archived">Архівні</option>
          </select>
          <input
            type="text"
            placeholder="Пошук по email..."
            value={filter.email}
            onChange={e => setFilter(f => ({ ...f, email: e.target.value }))}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-64"
          />
        </div>
      </div>
      <div className="overflow-x-auto overflow-y-auto flex-1 min-h-0 max-h-full">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-[#ede7ff]">
              <th className="px-4 py-2 text-left font-medium text-[#651FFF]">Ім'я</th>
              <th className="px-4 py-2 text-left font-medium text-[#651FFF]">Email</th>
              <th className="px-4 py-2 text-left font-medium text-[#651FFF]">Статус</th>
              <th className="px-4 py-2 text-left font-medium text-[#651FFF]">Дата створення</th>
              <th className="px-4 py-2 text-left font-medium text-[#651FFF]">Повідомлень</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-4 text-gray-400">Немає сесій</td></tr>
            ) : (
              filtered.map(session => (
                <tr
                  key={session.id}
                  className={`hover:bg-[#ede7ff]/60 transition-colors cursor-pointer ${selectedSessionId === session.id ? 'bg-[#ede7ff] font-bold' : ''}`}
                  onClick={() => onSelect && onSelect(session.id)}
                >
                  <td className="px-4 py-2">{session.metadata?.userName || '—'}</td>
                  <td className="px-4 py-2">{session.metadata?.userEmail || '—'}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.metadata?.status)}`}>
                      {getStatusText(session.metadata?.status)}
                    </span>
                  </td>
                  <td className="px-4 py-2">{session.metadata?.startedAt?.toDate?.().toLocaleString('uk-UA') || '—'}</td>
                  <td className="px-4 py-2">{session.metadata?.totalMessages ?? session.messages?.length ?? 0}</td>
                  <td className="px-4 py-2">
                    <button
                      className="bg-[#651FFF] text-white px-4 py-2 rounded-lg hover:bg-[#5A1BE0] transition-colors text-sm font-semibold"
                      onClick={e => { e.stopPropagation(); onGenerateReport && onGenerateReport(session.id); }}
                    >
                      Згенерувати звіт
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 