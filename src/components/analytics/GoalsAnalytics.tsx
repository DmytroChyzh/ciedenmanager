"use client";
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { BoltIcon } from '@heroicons/react/24/solid';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

export default function GoalsAnalytics() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week');

  // Дані для графіка цілей
  const getGoalsData = (period: string) => {
    if (period === 'week') {
      return [
        { day: 1, progress: 0 },
        { day: 2, progress: 12 },
        { day: 3, progress: 25 },
        { day: 4, progress: 38 },
        { day: 5, progress: 52 },
        { day: 6, progress: 65 },
        { day: 7, progress: 78 },
        { day: 8, progress: 82 },
        { day: 9, progress: 85 },
        { day: 10, progress: 87 },
        { day: 11, progress: 89 },
        { day: 12, progress: 91 },
        { day: 13, progress: 93 },
        { day: 14, progress: 95 },
      ];
    }
    if (period === 'month') {
      return Array.from({ length: 30 }, (_, i) => ({
        day: i + 1,
        progress: Math.min(95, Math.floor((i / 30) * 100) + Math.random() * 10)
      }));
    }
    return Array.from({ length: 12 }, (_, i) => ({
      day: i + 1,
      progress: Math.min(95, Math.floor((i / 12) * 100) + Math.random() * 15)
    }));
  };

  const periods = [
    { key: 'week', label: 'W', tooltip: 'Тиждень' },
    { key: 'month', label: 'M', tooltip: 'Місяць' },
    { key: 'year', label: 'Y', tooltip: 'Рік' },
  ];

  const periodButtonClass = `w-8 h-8 px-2 text-sm font-medium transition-colors duration-200 focus:outline-none rounded-lg`;

  const chartColor = theme === 'dark' ? '#FF9102' : '#651FFF';
  const axisColor = theme === 'dark' ? '#a0a0a0' : '#6b7280';
  const gridColor = theme === 'dark' ? '#404040' : '#e5e7eb';
  const gridOpacity = theme === 'dark' ? 0.3 : 0.5;

  const exportData = () => {
    const data = getGoalsData(period);
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Day,Progress\n" + 
      data.map(row => `${row.day},${row.progress}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `goals_${period}_data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white dark:bg-dark-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            Прогрес до цілей
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {period === 'week' ? 'Тиждень' : period === 'month' ? 'Місяць' : 'Рік'}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Period Selector */}
          <div className="flex rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
            {periods.map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key as 'week' | 'month' | 'year')}
                className={`${periodButtonClass} ${
                  period === p.key
                    ? 'bg-primary dark:bg-dark-primary text-white'
                    : 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                title={p.tooltip}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Export Button */}
          <button
            onClick={exportData}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            <span className="text-sm">Експорт CSV</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Поточний прогрес
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            95%
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Ціль
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            100%
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Середнє значення
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            67%
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={getGoalsData(period)} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} opacity={gridOpacity} />
            <XAxis 
              dataKey="day" 
              axisLine={false} 
              tickLine={false}
              tick={{ fontSize: 12, fill: axisColor, fontWeight: 500 }}
              tickFormatter={(value) => `${value} д.`}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false}
              tick={{ fontSize: 12, fill: axisColor, fontWeight: 500 }}
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip 
              contentStyle={{ 
                background: theme === 'dark' ? '#2a2a2a' : '#fff', 
                border: theme === 'dark' ? '1px solid #404040' : '1px solid #e5e7eb', 
                borderRadius: 8, 
                color: theme === 'dark' ? '#fff' : '#374151',
                fontSize: '12px'
              }}
              formatter={(value: any) => [`${value}%`, 'Прогрес']}
              labelFormatter={(label) => `День: ${label}`}
            />
            <Line 
              type="monotone" 
              dataKey="progress" 
              stroke={chartColor} 
              strokeWidth={3} 
              dot={{ r: 4, fill: chartColor, strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6, fill: chartColor, strokeWidth: 2, stroke: '#fff' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 