import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts';
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

interface GraphCardProps {
  title: string;
  value: number;
  data: { day: string; date: string; value: number }[];
  type?: 'line' | 'bar';
  icon: React.ReactNode;
  percent: number;
  color?: string; // hex або tailwind клас
  yDomain?: [number, number];
  yTicks?: number[];
  onPeriodChange?: (period: 'week' | 'month' | 'year') => void;
  currentPeriod?: 'week' | 'month' | 'year';
}

export default function GraphCard({ title, value, data, type = 'line', icon, percent, color = '#651FFF', yDomain = [0, 20], yTicks = [0, 5, 10, 15, 20], onPeriodChange, currentPeriod = 'week' }: GraphCardProps) {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const up = percent >= 0;
  
  const periods = [
    { key: 'week', label: 'W', tooltip: t('week') },
    { key: 'month', label: 'M', tooltip: t('month') },
    { key: 'year', label: 'Y', tooltip: t('year') }
  ];

  const currentIndex = periods.findIndex(p => p.key === currentPeriod);

  // Визначаємо колір для графіка
  let chartColor = theme === 'dark' ? '#FF9102' : '#651FFF';
  // Стиль заголовка — завжди однаковий для всіх карток
  let titleClass = 'text-gray-900 dark:text-dark-text font-bold text-base md:text-lg';
  const axisColor = theme === 'dark' ? '#a0a0a0' : '#6b7280';
  const gridColor = theme === 'dark' ? '#404040' : '#e5e7eb';
  const gridOpacity = theme === 'dark' ? 0.3 : 0.5;

  const periodButtonClass = `w-10 h-8 px-3 text-xs font-medium transition-colors duration-200 focus:outline-none rounded-lg`;

  return (
    <div className="bg-white dark:bg-dark-card rounded-xl flex flex-col p-4 md:p-6 min-w-[240px] min-h-[240px]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 flex items-center justify-center">{icon}</span>
          <span className="text-gray-900 dark:text-dark-text font-bold text-base md:text-lg">{title}</span>
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
        <span className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-dark-text">{value}</span>
        <span className={`flex items-center gap-1 text-sm font-semibold ${percent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {percent >= 0 ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
          )}
          {Math.abs(percent)}% <span className="text-gray-500 dark:text-gray-400 font-normal ml-1">{t('per')} {t(currentPeriod)}</span>
        </span>
      </div>
      
      <div className="w-full min-h-[160px] animate-fadeIn">
        <ResponsiveContainer width="100%" height={160}>
          {type === 'bar' ? (
            <BarChart data={data} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke={gridColor} vertical={true} horizontal={true} style={{ opacity: gridOpacity }} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} 
                tick={{ fontSize: 11, fill: axisColor, fontWeight: 500, textAnchor: 'middle' }} 
                tickFormatter={d => {
                  const shortDays = ['monShort','tueShort','wedShort','thuShort','friShort','satShort','sunShort'];
                  return shortDays.includes(d) ? t(d) : t(d);
                }}
                tickMargin={6} tickSize={0} padding={{ left: 16, right: 16 }}
                height={28}
              />
              <YAxis domain={yDomain} ticks={yTicks} interval={0} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: axisColor, fontWeight: 400 }} />
              <Tooltip contentStyle={{ 
                background: theme === 'dark' ? '#2a2a2a' : '#fff', 
                border: theme === 'dark' ? '1px solid #404040' : '1px solid #e5e7eb', 
                borderRadius: 8, 
                color: theme === 'dark' ? '#fff' : '#374151',
                fontSize: '12px'
              }} />
              <Bar dataKey="value" fill={chartColor} radius={[4, 4, 0, 0]} className="transition-colors duration-200" />
            </BarChart>
          ) : (
            <LineChart data={data} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke={gridColor} vertical={true} horizontal={true} style={{ opacity: gridOpacity }} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} 
                tick={{ fontSize: 11, fill: axisColor, fontWeight: 500, textAnchor: 'middle' }} 
                tickFormatter={d => {
                  const shortDays = ['monShort','tueShort','wedShort','thuShort','friShort','satShort','sunShort'];
                  return shortDays.includes(d) ? t(d) : t(d);
                }}
                tickMargin={6} tickSize={0} padding={{ left: 16, right: 16 }}
                height={28}
              />
              <YAxis domain={yDomain} ticks={yTicks} interval={0} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: axisColor, fontWeight: 400 }} />
              <Tooltip contentStyle={{ 
                background: theme === 'dark' ? '#2a2a2a' : '#fff', 
                border: theme === 'dark' ? '1px solid #404040' : '1px solid #e5e7eb', 
                borderRadius: 8, 
                color: theme === 'dark' ? '#fff' : '#374151',
                fontSize: '12px'
              }} />
              <Line type="monotone" dataKey="value" stroke={chartColor} strokeWidth={2} dot={{ r: 3, fill: chartColor }} className="transition-colors duration-200" />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
} 