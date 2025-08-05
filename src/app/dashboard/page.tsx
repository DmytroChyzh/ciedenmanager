"use client";
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Симулюємо завантаження
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary dark:border-dark-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 flex flex-col gap-3 md:gap-6 overflow-hidden bg-gray-50 dark:bg-dark-bg" style={{height: '100vh'}}>
      {/* Пустий контент - тільки сайдбар і хедер залишаються */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text mb-4">
            {t('dashboard')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Вітаємо в системі управління!
          </p>
        </div>
      </div>
    </div>
  );
} 