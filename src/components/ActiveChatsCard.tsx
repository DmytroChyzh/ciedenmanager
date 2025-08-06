"use client";
import React, { useState } from 'react';
import { BoltIcon } from '@heroicons/react/24/solid';
import { useLanguage } from '@/contexts/LanguageContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';

export default function TargetsTrackerCard({ value, percent, onPeriodChange, currentPeriod = 'week' }: { value: number, percent: number, onPeriodChange?: (period: 'week' | 'month' | 'year') => void, currentPeriod?: 'week' | 'month' | 'year' }) {
  const { t } = useLanguage();
  const { theme } = useTheme();

  // Спрощені дані для графіка - тільки прогрес без днів тижня
  const getProgressData = (period: string) => {
    const baseData = [
      { progress: 0, value: 0 },
      { progress: 15, value: 3 },
      { progress: 30, value: 6 },
      { progress: 45, value: 9 },
      { progress: 60, value: 12 },
      { progress: 75, value: 15 },
      { progress: 90, value: 18 },
      { progress: 100, value: 20 },
    ];

    if (period === 'month') {
      return baseData.map(item => ({
        ...item,
        value: item.value * 4
      }));
    }

    if (period === 'year') {
      return baseData.map(item => ({
        ...item,
        value: item.value * 50
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

  const currentGoal = getGoalByPeriod(currentPeriod);
  const currentValue = Math.min(value, currentGoal);
  const progressPercent = Math.min((currentValue / currentGoal) * 100, 100);
  const remaining = Math.max(currentGoal - currentValue, 0);

  // Мотиваційні повідомлення
  const getMotivationalMessage = () => {
    if (progressPercent >= 100) return '🎉 Ціль досягнута!';
    if (progressPercent >= 80) return '💪 Майже досягнуто!';
    if (progressPercent >= 60) return '🔥 Продовжуй!';
    if (progressPercent >= 40) return '📈 Гарний прогрес!';
    if (progressPercent >= 20) return '🚀 Сильний старт!';
    return '⏰ Час діяти!';
  };

  const getProgressColor = () => {
    if (progressPercent >= 80) return 'text-green-600 dark:text-green-400';
    if (progressPercent >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const up = percent >= 0;
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
          {Math.abs(percent)}% <span className="text-gray-500 dark:text-gray-400 font-normal ml-1">за {t(currentPeriod)}</span>
        </span>
      </div>

      {/* Прогрес-бар */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Прогрес</span>
          <span>{progressPercent.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-dark-hover rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-700 ease-out ${
              progressPercent >= 80 ? 'bg-green-500' : 
              progressPercent >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>
      
      {/* Покращений графік */}
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={getProgressData(currentPeriod)} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#404040' : '#e5e7eb'} opacity={0.3} />
            <XAxis 
              dataKey="progress" 
              axisLine={false} 
              tickLine={false}
              tick={{ fontSize: 12, fill: theme === 'dark' ? '#a0a0a0' : '#6b7280', fontWeight: 500 }}
              tickFormatter={(value) => `${value}%`}
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
            />
            <YAxis 
              dataKey="value" 
              axisLine={false} 
              tickLine={false}
              tick={{ fontSize: 12, fill: theme === 'dark' ? '#a0a0a0' : '#6b7280', fontWeight: 500 }}
              domain={[0, currentGoal]}
            />
            <Tooltip 
              contentStyle={{ 
                background: theme === 'dark' ? '#2a2a2a' : '#fff', 
                border: theme === 'dark' ? '1px solid #404040' : '1px solid #e5e7eb', 
                borderRadius: 8, 
                color: theme === 'dark' ? '#fff' : '#374151',
                fontSize: '12px'
              }}
              formatter={(value: any, name: any) => [`${value}`, 'Поточне значення']}
              labelFormatter={(label) => `Прогрес: ${label}%`}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#651FFF" 
              strokeWidth={3} 
              dot={{ r: 4, fill: '#651FFF', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6, fill: '#651FFF', strokeWidth: 2, stroke: '#fff' }}
              className="transition-all duration-300"
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