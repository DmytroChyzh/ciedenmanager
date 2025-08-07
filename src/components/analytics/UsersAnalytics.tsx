"use client";
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { UserGroupIcon } from '@heroicons/react/24/solid';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

export default function UsersAnalytics() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week');

  // Дані для графіка користувачів
  const getUsersData = (period: string) => {
    if (period === 'week') {
      return [
        { day: 'monShort', date: '04.08.2025', value: 9 },
        { day: 'tueShort', date: '05.08.2025', value: 1 },
        { day: 'wedShort', date: '06.08.2025', value: 2 },
        { day: 'thuShort', date: '07.08.2025', value: 0 },
        { day: 'friShort', date: '08.08.2025', value: 0 },
        { day: 'satShort', date: '09.08.2025', value: 0 },
        { day: 'sunShort', date: '10.08.2025', value: 0 },
      ];
    }
    if (period === 'month') {
      return Array.from({ length: 30 }, (_, i) => ({
        day: `${i + 1}`,
        date: `${String(i + 1).padStart(2, '0')}.08.2025`,
        value: Math.floor(Math.random() * 15) + 1
      }));
    }
    return Array.from({ length: 12 }, (_, i) => ({
      day: `${i + 1}`,
      date: `${String(i + 1).padStart(2, '0')}.2025`,
      value: Math.floor(Math.random() * 50) + 10
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
    const data = getUsersData(period);
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Day,Value\n" + 
      data.map(row => `${row.day},${row.value}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `users_${period}_data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white dark:bg-dark-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            Кількість користувачів
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
            Загальна кількість
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            87
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Зміна за період
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            0%
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Середнє значення
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            12.4
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={getUsersData(period)} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} opacity={gridOpacity} />
            <XAxis 
              dataKey="day" 
              axisLine={false} 
              tickLine={false}
              tick={{ fontSize: 12, fill: axisColor, fontWeight: 500 }}
              tickFormatter={(d) => {
                const shortDays = ['monShort','tueShort','wedShort','thuShort','friShort','satShort','sunShort'];
                return shortDays.includes(d) ? t(d) : d;
              }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false}
              tick={{ fontSize: 12, fill: axisColor, fontWeight: 500 }}
              domain={[0, 20]}
              ticks={[0, 5, 10, 15, 20]}
            />
            <Tooltip 
              contentStyle={{ 
                background: theme === 'dark' ? '#2a2a2a' : '#fff', 
                border: theme === 'dark' ? '1px solid #404040' : '1px solid #e5e7eb', 
                borderRadius: 8, 
                color: theme === 'dark' ? '#fff' : '#374151',
                fontSize: '12px'
              }}
            />
            <Bar dataKey="value" fill={chartColor} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 