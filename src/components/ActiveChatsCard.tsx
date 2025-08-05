import { BoltIcon } from '@heroicons/react/24/solid';
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function TargetsTrackerCard({ value, percent, onPeriodChange, currentPeriod = 'week' }: { value: number, percent: number, onPeriodChange?: (period: 'week' | 'month' | 'year') => void, currentPeriod?: 'week' | 'month' | 'year' }) {
  const { t } = useLanguage();
  const weeklyGoal = currentPeriod === 'week' ? 20 : currentPeriod === 'month' ? 80 : 240; // Цілі для різних періодів
  const current = value;
  const remaining = Math.max(0, weeklyGoal - current);
  const progressPercent = Math.min((current / weeklyGoal) * 100, 100);
  
  const periods = [
    { key: 'week', label: 'W', tooltip: t('week') },
    { key: 'month', label: 'M', tooltip: t('month') },
    { key: 'year', label: 'Y', tooltip: t('year') }
  ];

  const currentIndex = periods.findIndex(p => p.key === currentPeriod);
  
  // Мотиваційні повідомлення
  const getMotivationalMessage = () => {
    if (progressPercent >= 100) return '🎉 ' + t('goalReached');
    if (progressPercent >= 80) return '💪 ' + t('almostThere');
    if (progressPercent >= 60) return '🔥 ' + t('keepGoing');
    if (progressPercent >= 40) return '📈 ' + t('goodProgress');
    if (progressPercent >= 20) return '🚀 ' + t('strongStart');
    return '⏰ ' + t('timeToAct');
  };

  const up = percent >= 0;
  const periodButtonClass = `w-10 h-8 px-3 text-xs font-medium transition-colors duration-200 focus:outline-none rounded-lg`;
  
  return (
    <div className="bg-white dark:bg-dark-card rounded-xl flex flex-col p-4 md:p-6 min-w-[240px] h-[302px]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 flex items-center justify-center">
            <BoltIcon className="w-6 h-6 text-primary dark:text-dark-primary" />
          </span>
          <span className="text-gray-900 dark:text-dark-text font-bold text-base md:text-lg">{t('progressToGoals')}</span>
        </div>
        {/* Компактний переключувач періодів */}
        {onPeriodChange && (
          <div className="flex rounded-lg overflow-hidden bg-white dark:bg-dark-card">
            {periods.map((period) => {
              const isActive = currentPeriod === period.key;
              return (
                <button
                  key={period.key}
                  onClick={() => onPeriodChange(period.key as 'week' | 'month' | 'year')}
                  title={period.tooltip}
                  className={
                    periodButtonClass +
                    (isActive
                      ? ' bg-primary dark:bg-dark-primary text-white'
                      : ' bg-transparent text-gray-700 dark:text-gray-300 hover:bg-primary-light dark:hover:bg-dark-primary-light')
                  }
                >
                  {period.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
      
      <div className="flex items-end gap-2 mb-3">
        <span className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-dark-text">{current}</span>
        <span className="text-sm text-gray-500 dark:text-gray-400">{t('of')} {weeklyGoal}</span>
        <span className={`flex items-center gap-1 text-sm font-semibold ${percent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {percent >= 0 ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
          )}
          {Math.abs(percent)}% <span className="text-gray-500 dark:text-gray-400 font-normal ml-1">{t('per')} {t(currentPeriod)}</span>
        </span>
      </div>
      
      {/* Прогрес-бар */}
      <div className="w-full mb-3">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-primary to-primary-hover dark:from-dark-primary dark:to-dark-primary-hover h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Деталі */}
      <div className="flex flex-col gap-1 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">{t('goalFor')} {t(currentPeriod)}:</span>
          <span className="font-medium text-gray-900 dark:text-dark-text">{weeklyGoal} {t('chats')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">{t('current')}:</span>
          <span className="font-medium text-gray-900 dark:text-dark-text">{current}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">{t('left')}:</span>
          <span className="font-medium text-gray-900 dark:text-dark-text">{remaining}</span>
        </div>
      </div>

      {/* Мотиваційне повідомлення */}
      <div className="mt-3 text-center">
        <span className="text-xs font-medium text-primary dark:text-dark-primary bg-primary-light dark:bg-dark-primary-light px-2 py-1 rounded-full">
          {getMotivationalMessage()}
        </span>
      </div>
    </div>
  );
} 