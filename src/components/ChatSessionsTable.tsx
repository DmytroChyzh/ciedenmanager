import Link from 'next/link';
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ChatSessionsTableProps {
  sessions: any[];
  selectedSessionId?: string | null;
  onSelect?: (id: string) => void;
  onGenerateReport?: (id: string) => void;
}

export default function ChatSessionsTable({ sessions, selectedSessionId, onSelect, onGenerateReport }: ChatSessionsTableProps) {
  const { t } = useLanguage();
  const [filter, setFilter] = useState({ email: '' });

  const filtered = sessions.filter(session => {
    const matchesName = !filter.email || session.metadata?.userName?.toLowerCase().includes(filter.email.toLowerCase());
    return matchesName;
  });

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-500';
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? t('active') : t('inactive');
  };

  const now = Date.now();

  return (
    <div className="bg-white dark:bg-dark-card rounded-2xl p-8 h-full min-h-0 flex flex-col pb-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <h2 className="text-xl font-semibold text-[#651FFF] dark:text-dark-orange">{t('latestSessions')}</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={t('searchByName')}
            value={filter.email}
            onChange={e => setFilter(f => ({ ...f, email: e.target.value }))}
            className="border border-gray-300 dark:border-[#333] rounded-md px-3 py-2 text-sm w-64 bg-white dark:bg-dark-card text-[#222] dark:text-dark-text"
          />
        </div>
      </div>
      <div className="overflow-x-auto overflow-y-auto flex-1 min-h-0 max-h-full">
        <table className="min-w-full text-sm rounded-2xl overflow-hidden bg-white dark:bg-dark-card text-[#222] dark:text-dark-text">
          <thead>
            <tr className="bg-[#F8F9FA] dark:bg-[#232323] text-[#651FFF] dark:text-dark-orange text-base rounded-2xl">
              <th className="px-4 py-3 text-left font-semibold">{t('name')}</th>
              <th className="px-4 py-3 text-left font-semibold">{t('email')}</th>
              <th className="px-4 py-3 text-left font-semibold">{t('status')}</th>
              <th className="px-4 py-3 text-left font-semibold">{t('createdAt')}</th>
              <th className="px-4 py-3 text-left font-semibold">{t('messages')}</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-4 text-gray-400">{t('noSessions')}</td></tr>
            ) :
              filtered.map(session => {
                const updated = session.updatedAt?.toDate?.() || session.createdAt?.toDate?.();
                const isActive = updated && (now - updated.getTime() < 5 * 60 * 1000); // 5 хвилин
                return (
                  <tr
                    key={session.id}
                    className={`border-b border-[#ede7ff] dark:border-[#333] hover:bg-[#f3f0ff] dark:hover:bg-[#232323] transition-all cursor-pointer ${selectedSessionId === session.id ? 'bg-[#ede7ff]/60 dark:bg-[#292929]' : ''}`}
                    onClick={() => onSelect && onSelect(session.id)}
                  >
                    <td className={selectedSessionId === session.id ? "px-4 py-5 text-primary dark:text-dark-orange" : "px-4 py-5"}>{session.metadata?.userName || '—'}</td>
                    <td className={selectedSessionId === session.id ? "px-4 py-5 text-primary" : "px-4 py-5"}>{session.metadata?.userEmail || '—'}</td>
                    <td className={selectedSessionId === session.id ? "px-4 py-5 text-primary" : "px-4 py-5"}>
                      <span
                        className={`px-2 py-1 rounded-full text-xs transition-colors duration-200 ${selectedSessionId === session.id ? 'font-medium' : 'font-normal'}
                          ${(() => {
                            if (isActive) return 'bg-green text-white';
                            return 'bg-[#e0f2fa] dark:bg-[#232323] text-dark dark:text-dark-text';
                          })()}
                        `}
                      >
                        {getStatusText(isActive)}
                      </span>
                    </td>
                    <td className={selectedSessionId === session.id ? "px-4 py-5 text-primary" : "px-4 py-5"}>{session.metadata?.startedAt?.toDate?.().toLocaleString('uk-UA') || '—'}</td>
                    <td className={selectedSessionId === session.id ? "px-4 py-5 text-primary" : "px-4 py-5"}>{session.metadata?.totalMessages ?? session.messages?.length ?? 0}</td>
                    <td className={selectedSessionId === session.id ? "px-4 py-5 text-primary" : "px-4 py-5"}>
                      <button
                        className="border border-primary text-dark dark:text-dark-text font-semibold text-xs uppercase tracking-wider bg-white dark:bg-dark-card px-5 py-2.5 rounded-md flex items-center justify-center gap-2 transition-colors transition-border duration-200 hover:bg-primary hover:text-white hover:border-primary group"
                        onClick={e => { e.stopPropagation(); onGenerateReport && onGenerateReport(session.id); }}
                      >
                        {t('generateReport')}
                        <svg className="w-5 h-5 ml-1 transition-colors duration-200 group-hover:text-white text-primary dark:text-dark-orange" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                      </button>
                    </td>
                  </tr>
                );
              })
            }
          </tbody>
        </table>
      </div>
    </div>
  );
} 