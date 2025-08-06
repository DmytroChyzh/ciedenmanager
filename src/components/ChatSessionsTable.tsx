import Link from 'next/link';
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface ChatSessionsTableProps {
  sessions: any[];
  selectedSessionId?: string | null;
  onSelect?: (id: string) => void;
  onGenerateReport?: (id: string) => void;
  onRowClick?: (id: string) => void;
  generatedReports?: {[key: string]: boolean};
}

export default function ChatSessionsTable({ sessions, selectedSessionId, onSelect, onGenerateReport, onRowClick, generatedReports = {} }: ChatSessionsTableProps) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = sessions.filter(session => {
    const matchesName = !searchTerm || session.metadata?.userName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesName;
  });

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400';
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? t('active') : t('inactive');
  };

  const now = Date.now();

  return (
    <div className="bg-white dark:bg-dark-card rounded-xl p-4 md:p-6 h-[calc(100vh-480px)] min-h-0 flex flex-col">
      {/* Заголовок і пошук */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-dark-text">
          {t('latestSessions')}
        </h2>
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder={t('searchByName')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:border-transparent"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Таблиця зі скролінгом */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <table className="min-w-full text-sm rounded-lg overflow-hidden bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-50 dark:bg-dark-hover text-primary dark:text-dark-primary text-sm">
                <th className="px-3 py-3 text-left font-medium">{t('name')}</th>
                <th className="px-3 py-3 text-left font-medium">{t('email')}</th>
                <th className="px-3 py-3 text-left font-medium">{t('status')}</th>
                <th className="px-3 py-3 text-left font-medium">{t('createdAt')}</th>
                <th className="px-3 py-3 text-left font-medium">{t('messages')}</th>
                <th className="px-3 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                    {t('noSessions')}
                  </td>
                </tr>
              ) : (
                filtered.map(session => {
                  const updated = session.updatedAt?.toDate?.() || session.createdAt?.toDate?.();
                  const isActive = updated && (now - updated.getTime() < 5 * 60 * 1000); // 5 хвилин
                  const isSelected = selectedSessionId === session.id;
                  
                  return (
                    <tr
                      key={session.id}
                      className={`border-b border-gray-200 dark:border-dark-border transition-all duration-200 ${
                        isSelected ? 'bg-primary-light dark:bg-dark-primary-light border-primary dark:border-dark-primary' : ''
                      } ${onRowClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-hover hover:shadow-sm' : ''}`}
                      onClick={() => onRowClick && onRowClick(session.id)}
                    >
                      <td className={`px-3 py-3 transition-colors duration-200 ${isSelected ? 'text-primary dark:text-dark-primary font-medium' : ''}`}>
                        {session.metadata?.userName || '—'}
                      </td>
                      <td className={`px-3 py-3 transition-colors duration-200 ${isSelected ? 'text-primary dark:text-dark-primary' : ''}`}>
                        {session.metadata?.userEmail || '—'}
                      </td>
                      <td className={`px-3 py-3 transition-colors duration-200 ${isSelected ? 'text-primary dark:text-dark-primary' : ''}`}>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium transition-colors duration-200 ${getStatusColor(isActive)}`}
                        >
                          {getStatusText(isActive)}
                        </span>
                      </td>
                      <td className={`px-3 py-3 transition-colors duration-200 ${isSelected ? 'text-primary dark:text-dark-primary' : ''}`}>
                        {session.metadata?.startedAt?.toDate?.().toLocaleString('uk-UA') || '—'}
                      </td>
                      <td className={`px-3 py-3 transition-colors duration-200 ${isSelected ? 'text-primary dark:text-dark-primary' : ''}`}>
                        {session.metadata?.totalMessages ?? session.messages?.length ?? 0}
                      </td>
                      <td className={`px-3 py-3 ${isSelected ? 'text-primary dark:text-dark-primary' : ''}`}>
                        <button
                          className={`font-medium text-xs uppercase tracking-wider px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 group hover:scale-105 shadow-sm hover:shadow-md ${
                            generatedReports[session.id]
                              ? 'bg-white text-[#651FFF] border border-[#651FFF] hover:bg-[#651FFF] hover:text-white'
                              : 'border border-primary dark:border-dark-primary text-primary dark:text-dark-primary bg-white dark:bg-dark-card hover:bg-primary hover:text-white dark:hover:bg-dark-primary dark:hover:text-white'
                          }`}
                          onClick={e => { 
                            e.stopPropagation(); 
                            onGenerateReport && onGenerateReport(session.id); 
                          }}
                        >
                          {generatedReports[session.id] ? 'Звіт' : t('generateReport')}
                          <svg className={`w-4 h-4 transition-colors duration-200 ${
                            generatedReports[session.id]
                              ? 'text-[#651FFF] group-hover:text-white'
                              : 'text-primary dark:text-dark-primary group-hover:text-white'
                          }`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 