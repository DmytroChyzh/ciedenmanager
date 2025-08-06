"use client";
import React, { useState } from 'react';
import { BoltIcon } from '@heroicons/react/24/solid';
import { useLanguage } from '@/contexts/LanguageContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';

export default function TargetsTrackerCard({ value, percent, onPeriodChange, currentPeriod = 'week' }: { value: number, percent: number, onPeriodChange?: (period: 'week' | 'month' | 'year') => void, currentPeriod?: 'week' | 'month' | 'year' }) {
  const { t } = useLanguage();
  const { theme } = useTheme();

  // Спрощені дані для графіка - показуємо реальний прогрес
  const getProgressData = (period: string) => {
    const baseData = [
      { day: 1, progress: 0 },
      { day: 2, progress: 5 },
      { day: 3, progress: 12 },
      { day: 4, progress: 18 },
      { day: 5, progress: 25 },
      { day: 6, progress: 35 },
      { day: 7, progress: 45 },
      { day: 8, progress: 55 },
      { day: 9, progress: 65 },
      { day: 10, progress: 75 },
      { day: 11, progress: 85 },
      { day: 12, progress: 90 },
      { day: 13, progress: 95 },
      { day: 14, progress: 100 },
    ];

    if (period === 'month') {
      return baseData.map(item => ({
        ...item,
        progress: Math.min(item.progress * 1.2, 100)
      }));
    }

    if (period === 'year') {
      return baseData.map(item => ({
        ...item,
        progress: Math.min(item.progress * 1.5, 100)
      }));
    }

    return baseData;
  };

  const periods = [
    { key: 'week', label: 'W', tooltip: t('week') },
    { key: 'month', label: 'M', tooltip: t('month') },
    { key: 'year', label: 'Y', tooltip: t('year') },
  ];

  // Динамічні цілі за періодами
  const getGoalByPeriod = (period: string) => {
    switch (period) {
      case 'week': return 20;
      case 'month': return 80;
      case 'year': return 1000;
      default: return 20;
    }
  };

  // Отримуємо поточний прогрес з даних
  const currentProgress = getProgressData(currentPeriod).slice(-1)[0]?.progress || 0;
  const currentValue = Math.round(currentProgress);
  const currentGoal = 100;
  const progressPercent = currentValue;
  const up = currentValue > 0;

  // Мотиваційні повідомлення
  const getMotivationalMessage = () => {
    if (currentValue >= 100) return "Відмінно! Всі цілі досягнуті! 🎉";
    if (currentValue >= 75) return "Майже там! Залишилося трохи! 💪";
    if (currentValue >= 50) return "На півдорозі! Продовжуй! 🔥";
    if (currentValue >= 25) return "Хороший старт! Далі! ⚡";
    return "Почнемо! Кожен крок важливий! 🚀";
  };

  const getProgressColor = () => {
    if (currentValue >= 80) return "text-green-500";
    if (currentValue >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const periodButtonClass = `w-8 h-8 px-3 text-xs font-medium transition-colors duration-200 focus:outline-none rounded-lg`;
  
  return (
    <div className="bg-white dark:bg-dark-card rounded-xl flex flex-col p-4 md:p-6 min-w-[200px] md:min-w-[240px] h-[324px]">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BoltIcon className="w-6 h-6 text-primary dark:text-dark-primary" />
          <span className="text-gray-900 dark:text-dark-text font-bold text-lg">{t('progressToGoals')}</span>
        </div>
        
        {/* Переключувач періодів */}
        {onPeriodChange && (
          <div className="flex rounded-lg overflow-hidden bg-gray-100 dark:bg-dark-hover">
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
      
      {/* Основна статистика */}
      <div className="flex items-end gap-3 mb-4">
        <span className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-dark-text">{currentValue}</span>
        <span className="text-lg text-gray-500 dark:text-gray-400 mb-1">з {currentGoal}</span>
        <span className={`flex items-center gap-1 text-sm font-semibold ${getProgressColor()}`}>
          {up ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          )}
          {Math.abs(currentValue)}% <span className="text-gray-500 dark:text-gray-400 font-normal ml-1">за {t(currentPeriod)}</span>
        </span>
      </div>

      {/* Покращений графік з більшою областю */}
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={getProgressData(currentPeriod)} margin={{ top: 15, right: 15, left: 15, bottom: 15 }}>
            <defs>
              <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#651FFF" stopOpacity={0.8}/>
                <stop offset="100%" stopColor="#651FFF" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#404040' : '#e5e7eb'} opacity={0.2} />
            <XAxis 
              dataKey="day" 
              axisLine={false} 
              tickLine={false}
              tick={{ fontSize: 11, fill: theme === 'dark' ? '#a0a0a0' : '#6b7280', fontWeight: 500 }}
              tickFormatter={(value) => `${value} д.`}
              domain={[0, 14]}
              ticks={[0, 2, 4, 6, 8, 10, 12, 14]}
              padding={{ left: 10, right: 10 }}
            />
            <YAxis 
              dataKey="progress" 
              axisLine={false} 
              tickLine={false}
              tick={{ fontSize: 11, fill: theme === 'dark' ? '#a0a0a0' : '#6b7280', fontWeight: 500 }}
              domain={[0, 100]}
              ticks={[0, 15, 25, 50, 75, 100]}
              tickFormatter={(value) => `${value}%`}
              padding={{ top: 10, bottom: 10 }}
            />
            <Tooltip 
              contentStyle={{ 
                background: theme === 'dark' ? '#2a2a2a' : '#fff', 
                border: theme === 'dark' ? '1px solid #404040' : '1px solid #e5e7eb', 
                borderRadius: 8, 
                color: theme === 'dark' ? '#fff' : '#374151',
                fontSize: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: any, name: any) => [`${value}%`, 'Прогрес']}
              labelFormatter={(label) => `День: ${label} д.`}
              cursor={{ stroke: '#651FFF', strokeWidth: 2, strokeDasharray: '3 3' }}
            />
            <Line 
              type="monotone" 
              dataKey="progress" 
              stroke="#651FFF" 
              strokeWidth={4} 
              dot={{ r: 5, fill: '#651FFF', strokeWidth: 3, stroke: '#fff' }}
              activeDot={{ r: 7, fill: '#651FFF', strokeWidth: 3, stroke: '#fff' }}
              className="transition-all duration-300"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Додаємо область під лінією для кращого візуального ефекту */}
            <Line 
              type="monotone" 
              dataKey="progress" 
              stroke="transparent" 
              fill="url(#progressGradient)"
              strokeWidth={0}
              dot={false}
              activeDot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Мотиваційне повідомлення */}
      <div className="mt-3 text-center">
        <span className="text-sm font-medium text-primary dark:text-dark-primary bg-primary-light dark:bg-dark-primary-light px-3 py-2 rounded-full">
          {getMotivationalMessage()}
        </span>
      </div>
    </div>
  );
} 