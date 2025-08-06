"use client";
import React, { useState } from 'react';
import { BoltIcon, ChartBarIcon, UserGroupIcon, CurrencyDollarIcon } from '@heroicons/react/24/solid';
import { useLanguage } from '@/contexts/LanguageContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';

type ProgressType = 'tasks' | 'sales' | 'revenue' | 'efficiency';

export default function TargetsTrackerCard({ value, percent, onPeriodChange, currentPeriod = 'week' }: { value: number, percent: number, onPeriodChange?: (period: 'week' | 'month' | 'year') => void, currentPeriod?: 'week' | 'month' | 'year' }) {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [progressType, setProgressType] = useState<ProgressType>('tasks');

  // Динамічні цілі за періодами
  const getGoalsByPeriod = (period: string) => {
    switch (period) {
      case 'week': return { tasks: 20, sales: 5, revenue: 5000, efficiency: 85 };
      case 'month': return { tasks: 80, sales: 20, revenue: 20000, efficiency: 90 };
      case 'year': return { tasks: 1000, sales: 250, revenue: 250000, efficiency: 95 };
      default: return { tasks: 20, sales: 5, revenue: 5000, efficiency: 85 };
    }
  };

  // Різні типи даних для графіків
  const getProgressData = (type: ProgressType, period: string) => {
    const baseData = [
      { day: 'monShort', tasks: 0, sales: 0, revenue: 0, efficiency: 65 },
      { day: 'tueShort', tasks: 15, sales: 1, revenue: 800, efficiency: 72 },
      { day: 'wedShort', tasks: 25, sales: 2, revenue: 1200, efficiency: 78 },
      { day: 'thuShort', tasks: 40, sales: 3, revenue: 1800, efficiency: 82 },
      { day: 'friShort', tasks: 60, sales: 4, revenue: 2400, efficiency: 85 },
      { day: 'satShort', tasks: 75, sales: 4, revenue: 2800, efficiency: 88 },
      { day: 'sunShort', tasks: 92, sales: 5, revenue: 3200, efficiency: 92 },
    ];

    if (period === 'month') {
      return baseData.map(item => ({
        ...item,
        tasks: item.tasks * 4,
        sales: item.sales * 4,
        revenue: item.revenue * 4,
        efficiency: Math.min(item.efficiency + 5, 95)
      }));
    }

    if (period === 'year') {
      return baseData.map(item => ({
        ...item,
        tasks: item.tasks * 50,
        sales: item.sales * 50,
        revenue: item.revenue * 50,
        efficiency: Math.min(item.efficiency + 10, 98)
      }));
    }

    return baseData;
  };

  const periods = [
    { key: 'week', label: 'W', tooltip: t('week') },
    { key: 'month', label: 'M', tooltip: t('month') },
    { key: 'year', label: 'Y', tooltip: t('year') },
  ];

  const progressTypes = [
    { key: 'tasks', label: 'Завдання', icon: BoltIcon, color: '#651FFF' },
    { key: 'sales', label: 'Продажі', icon: UserGroupIcon, color: '#10B981' },
    { key: 'revenue', label: 'Доходи', icon: CurrencyDollarIcon, color: '#F59E0B' },
    { key: 'efficiency', label: 'Ефективність', icon: ChartBarIcon, color: '#EF4444' },
  ];

  const currentGoals = getGoalsByPeriod(currentPeriod);
  const currentValue = getProgressData(progressType, currentPeriod)[6][progressType];
  const goalValue = currentGoals[progressType];
  const progressPercent = Math.min((currentValue / goalValue) * 100, 100);
  const remaining = Math.max(goalValue - currentValue, 0);

  // Розширена аналітика
  const getAnalytics = () => {
    const data = getProgressData(progressType, currentPeriod);
    const today = data[6];
    const yesterday = data[5];
    const weekAgo = data[0];
    
    const dailyGrowth = ((today[progressType] - yesterday[progressType]) / yesterday[progressType] * 100) || 0;
    const weeklyGrowth = ((today[progressType] - weekAgo[progressType]) / weekAgo[progressType] * 100) || 0;
    
    return { dailyGrowth, weeklyGrowth };
  };

  const analytics = getAnalytics();

  // Мотиваційні повідомлення з покращенням
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
  const periodButtonClass = `w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 xl:w-9 lg:h-9 2xl:w-10 2xl:h-8 px-1 sm:px-2 md:px-2 lg:px-3 text-xs font-medium transition-colors duration-200 focus:outline-none rounded-lg`;
  
  return (
    <div className="bg-white dark:bg-dark-card rounded-xl flex flex-col p-2 sm:p-3 md:p-4 lg:p-5 xl:p-6 min-w-[180px] sm:min-w-[200px] md:min-w-[220px] lg:min-w-[240px] h-[324px]">
      {/* Заголовок з переключувачем типів прогресу */}
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex items-center justify-center">
            <BoltIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary dark:text-dark-primary" />
          </span>
          <span className="text-gray-900 dark:text-dark-text font-bold text-xs sm:text-sm md:text-base lg:text-lg">{t('progressToGoals')}</span>
        </div>
        
        {/* Переключувач типів прогресу */}
        <div className="flex gap-1">
          {progressTypes.map((type) => {
            const IconComponent = type.icon;
            const isActive = progressType === type.key;
            return (
              <button
                key={type.key}
                onClick={() => setProgressType(type.key as ProgressType)}
                title={type.label}
                className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 flex items-center justify-center rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary dark:bg-dark-primary text-white shadow-md' 
                    : 'bg-gray-100 dark:bg-dark-hover text-gray-600 dark:text-gray-400 hover:bg-primary-light dark:hover:bg-dark-primary-light'
                }`}
              >
                <IconComponent className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Переключувач періодів */}
      {onPeriodChange && (
        <div className="flex justify-end mb-2">
          <div className="flex rounded-lg overflow-hidden bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border">
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
        </div>
      )}
      
      {/* Основна статистика */}
      <div className="flex items-end gap-2 mb-3">
        <span className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-dark-text">{currentValue}</span>
        <span className="text-sm text-gray-500 dark:text-gray-400">{t('of')} {goalValue}</span>
        <span className={`flex items-center gap-1 text-sm font-semibold ${getProgressColor()}`}>
          {analytics.dailyGrowth >= 0 ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
          )}
          {Math.abs(analytics.dailyGrowth).toFixed(1)}% <span className="text-gray-500 dark:text-gray-400 font-normal ml-1">сьогодні</span>
        </span>
      </div>

      {/* Прогрес-бар */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
          <span>Прогрес</span>
          <span>{progressPercent.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-dark-hover rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              progressPercent >= 80 ? 'bg-green-500' : 
              progressPercent >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>
      
      {/* Графік прогресу */}
      <div className="w-full flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={getProgressData(progressType, currentPeriod)} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
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
            <YAxis domain={[0, goalValue]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: theme === 'dark' ? '#a0a0a0' : '#6b7280', fontWeight: 400 }} />
            <Tooltip contentStyle={{ 
              background: theme === 'dark' ? '#2a2a2a' : '#fff', 
              border: theme === 'dark' ? '1px solid #404040' : '1px solid #e5e7eb', 
              borderRadius: 8, 
              color: theme === 'dark' ? '#fff' : '#374151',
              fontSize: '12px'
            }} />
            <Line 
              type="monotone" 
              dataKey={progressType} 
              stroke={progressTypes.find(t => t.key === progressType)?.color || '#651FFF'} 
              strokeWidth={2} 
              dot={{ r: 3, fill: progressTypes.find(t => t.key === progressType)?.color || '#651FFF' }} 
              className="transition-colors duration-200" 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Розширена аналітика та мотивація */}
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs font-medium text-primary dark:text-dark-primary bg-primary-light dark:bg-dark-primary-light px-2 py-1 rounded-full">
          {getMotivationalMessage()}
        </span>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {remaining > 0 ? `Залишилось: ${remaining}` : 'Ціль досягнута!'}
        </div>
      </div>
    </div>
  );
} 