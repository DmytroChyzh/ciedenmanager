"use client";
import React from 'react';
import { BoltIcon } from '@heroicons/react/24/solid';
import { useLanguage } from '@/contexts/LanguageContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';

export default function TargetsTrackerCard({ value, percent, onPeriodChange, currentPeriod = 'week' }: { value: number, percent: number, onPeriodChange?: (period: 'week' | 'month' | 'year') => void, currentPeriod?: 'week' | 'month' | 'year' }) {
  const { t } = useLanguage();
  const { theme } = useTheme();

  // Мокані дані для графіка прогресу
  const progressData = [
    { day: 'monShort', value: 0 },
    { day: 'tueShort', value: 15 },
    { day: 'wedShort', value: 25 },
    { day: 'thuShort', value: 40 },
    { day: 'friShort', value: 60 },
    { day: 'satShort', value: 75 },
    { day: 'sunShort', value: 92 },
  ];

  const periods = [
    { key: 'week', label: 'W', tooltip: t('week') },
    { key: 'month', label: 'M', tooltip: t('month') },
    { key: 'year', label: 'Y', tooltip: t('year') },
  ];

  const current = value;
  const weeklyGoal = 20;
  const progressPercent = Math.min((current / weeklyGoal) * 100, 100);
  const remaining = Math.max(weeklyGoal - current, 0);

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
  const periodButtonClass = `w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 xl:w-9 lg:h-9 2xl:w-10 2xl:h-8 px-1 sm:px-2 md:px-2 lg:px-3 text-xs font-medium transition-colors duration-200 focus:outline-none rounded-lg`;
  
  return (
    <div className="bg-white dark:bg-dark-card rounded-xl flex flex-col p-2 sm:p-3 md:p-4 lg:p-5 xl:p-6 min-w-[180px] sm:min-w-[200px] md:min-w-[220px] lg:min-w-[240px] h-[302px]">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex items-center justify-center">
            <BoltIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary dark:text-dark-primary" />
          </span>
          <span className="text-gray-900 dark:text-dark-text font-bold text-xs sm:text-sm md:text-base lg:text-lg">{t('progressToGoals')}</span>
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
      
      {/* Графік прогресу */}
      <div className="w-full flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={progressData} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="4 4" stroke={theme === 'dark' ? '#404040' : '#e5e7eb'} vertical={true} horizontal={true} style={{ opacity: theme === 'dark' ? 0.3 : 0.5 }} />
            <XAxis dataKey="day" axisLine={false} tickLine={false} 
              tick={{ fontSize: 11, fill: theme === 'dark' ? '#a0a0a0' : '#6b7280', fontWeight: 500, textAnchor: 'middle' }} 
              tickFormatter={d => {
                const shortDays = ['monShort','tueShort','wedShort','thuShort','friShort','satShort','sunShort'];
                return shortDays.includes(d) ? t(d) : t(d);
              }}
              tickMargin={6} tickSize={0} padding={{ left: 16, right: 16 }}
              height={28}
            />
            <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} interval={0} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: theme === 'dark' ? '#a0a0a0' : '#6b7280', fontWeight: 400 }} />
            <Tooltip contentStyle={{ 
              background: theme === 'dark' ? '#2a2a2a' : '#fff', 
              border: theme === 'dark' ? '1px solid #404040' : '1px solid #e5e7eb', 
              borderRadius: 8, 
              color: theme === 'dark' ? '#fff' : '#374151',
              fontSize: '12px'
            }} />
            <Line type="monotone" dataKey="value" stroke="#651FFF" strokeWidth={2} dot={{ r: 3, fill: '#651FFF' }} className="transition-colors duration-200" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Мотиваційне повідомлення */}
      <div className="mt-2 text-center">
        <span className="text-xs font-medium text-primary dark:text-dark-primary bg-primary-light dark:bg-dark-primary-light px-2 py-1 rounded-full">
          {getMotivationalMessage()}
        </span>
      </div>
    </div>
  );
} 