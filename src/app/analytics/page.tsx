"use client";
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { UserGroupIcon, BoltIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';
import UsersAnalytics from '@/components/analytics/UsersAnalytics';
import GoalsAnalytics from '@/components/analytics/GoalsAnalytics';
import { useSearchParams } from 'next/navigation';

export default function AnalyticsPage() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'users' | 'goals'>('users');

  // Автоматично переключаємо вкладку на основі URL параметрів
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'goals' || tab === 'users') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[#F7F8F9] dark:bg-dark-bg p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <a href="/dashboard" className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <ArrowLeftIcon className="w-5 h-5" />
            <span className="text-sm">Дашборд</span>
          </a>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {activeTab === 'users' ? 'Кількість користувачів' : 'Прогрес до цілей'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {activeTab === 'users' ? 'Детальна статистика користувачів' : 'Детальний прогрес до цілей'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'users'
              ? 'bg-primary dark:bg-dark-primary text-white'
              : 'bg-white dark:bg-dark-card text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <UserGroupIcon className="w-5 h-5" />
            Кількість користувачів
          </div>
        </button>
        <button
          onClick={() => setActiveTab('goals')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'goals'
              ? 'bg-primary dark:bg-dark-primary text-white'
              : 'bg-white dark:bg-dark-card text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <BoltIcon className="w-5 h-5" />
            Прогрес до цілей
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="mb-6">
        {activeTab === 'users' ? <UsersAnalytics /> : <GoalsAnalytics />}
      </div>
    </div>
  );
} 