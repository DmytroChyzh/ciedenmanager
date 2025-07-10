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
    { key: 'week', label: t('week') },
    { key: 'month', label: t('month') },
    { key: 'year', label: t('year') }
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
  const periodButtonClass = `w-20 h-8 px-2 text-xs font-medium transition-colors duration-200 focus:outline-none rounded-none`;
  return (
    <div className="bg-white dark:bg-dark-card rounded-2xl flex flex-col p-8 min-w-[260px] min-h-[260px]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 flex items-center justify-center"><BoltIcon className="w-7 h-7 text-[#651FFF]" /></span>
          <span className="text-[#222] dark:text-dark-text font-bold text-lg md:text-xl">{t('progressToGoals')}</span>
        </div>
        {/* Красивий повзунок-переключувач */}
        {onPeriodChange && (
          <div className="flex rounded-lg overflow-hidden border border-[#651FFF] dark:border-[#FF9102] bg-white dark:bg-[#232323]">
            {periods.map((period) => {
              const isActive = currentPeriod === period.key;
              return (
                <button
                  key={period.key}
                  onClick={() => onPeriodChange(period.key as 'week' | 'month' | 'year')}
                  className={
                    periodButtonClass +
                    (isActive
                      ? ' bg-[#651FFF] text-white dark:bg-[#FF9102] dark:text-white'
                      : ' bg-transparent text-[#222] dark:text-white hover:bg-[#ede7ff] dark:hover:bg-[#333]')
                  }
                >
                  {period.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
      <div className="flex items-end gap-3 mb-4">
        <span className="text-3xl md:text-4xl font-extrabold text-[#222] dark:text-dark-text">{current}</span>
        <span className="text-sm text-[#8B97B0] dark:text-dark-text">{t('of')} {weeklyGoal}</span>
        <span className={`flex items-center gap-1 text-base font-semibold ${percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {percent >= 0 ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
          )}
          {Math.abs(percent)}% <span className="text-[#8B97B0] font-normal ml-1 dark:text-dark-text">{t('per')} {t(currentPeriod)}</span>
        </span>
      </div>
      
      {/* Прогрес-бар */}
      <div className="w-full mb-4">
        <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-[#651FFF] to-[#8B5FFF] h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-[#8B97B0]">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Деталі */}
      <div className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <span className="text-[#8B97B0] dark:text-dark-text">{t('goalFor')} {t(currentPeriod)}:</span>
          <span className="font-medium text-[#222] dark:text-dark-text">{weeklyGoal} {t('chats')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#8B97B0] dark:text-dark-text">{t('current')}:</span>
          <span className="font-medium text-[#222] dark:text-dark-text">{current}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#8B97B0] dark:text-dark-text">{t('left')}:</span>
          <span className="font-medium text-[#222] dark:text-dark-text">{remaining}</span>
        </div>
      </div>

      {/* Мотиваційне повідомлення */}
      <div className="mt-4 text-center">
        <span className="text-sm font-medium text-[#651FFF] dark:text-dark-orange bg-[#651FFF]/10 dark:bg-[#FF9102]/10 px-3 py-1 rounded-full">
          {getMotivationalMessage()}
        </span>
      </div>
    </div>
  );
} 