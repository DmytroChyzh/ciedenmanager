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
    { key: 'week', label: t('week') },
    { key: 'month', label: t('month') },
    { key: 'year', label: t('year') }
  ];

  const currentIndex = periods.findIndex(p => p.key === currentPeriod);

  // Визначаємо колір для графіка
  let chartColor = theme === 'dark' ? '#FF9102' : '#651FFF';
  // Стиль заголовка — завжди однаковий для всіх карток, тепер чорний
  let titleClass = 'text-[#222] font-bold text-lg md:text-xl';
  const axisColor = theme === 'dark' ? '#fff' : '#212121';
  const gridColor = theme === 'dark' ? '#fff' : '#c3cbd4';
  const gridOpacity = theme === 'dark' ? 0.2 : 0.3;

  const periodButtonClass = `w-20 h-8 px-2 text-xs font-medium transition-colors duration-200 focus:outline-none rounded-none`;

  return (
    <div className="bg-white dark:bg-dark-card rounded-2xl flex flex-col p-8 min-w-[260px] min-h-[260px]">
      <div className="flex items-center justify-between mb-2 mt-2">
        <div className="flex items-center gap-2 pl-1">
          <span className="w-7 h-7 flex items-center justify-center">{icon}</span>
          <span className="text-[#222] dark:text-dark-text font-bold text-lg md:text-xl">{title}</span>
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
      <div className="flex items-end gap-3 mb-2">
        <span className="text-3xl md:text-4xl font-extrabold text-[#222] dark:text-dark-text">{value}</span>
        <span className={`flex items-center gap-1 text-base font-semibold ${percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {percent >= 0 ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
          )}
          {Math.abs(percent)}% <span className="text-[#8B97B0] font-normal ml-1">{t('per')} {t(currentPeriod)}</span>
        </span>
      </div>
      <div className="w-full min-h-[180px] animate-fadeIn">
        <ResponsiveContainer width="100%" height={180}>
          {type === 'bar' ? (
            <BarChart data={data} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke={gridColor} vertical={true} horizontal={true} style={{ opacity: gridOpacity }} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} 
                tick={{ fontSize: 12, fill: axisColor, fontWeight: 500, textAnchor: 'middle', ...(typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? { fill: '#fff' } : {}) }} 
                tickFormatter={d => {
                  const shortDays = ['monShort','tueShort','wedShort','thuShort','friShort','satShort','sunShort'];
                  return shortDays.includes(d) ? t(d) : t(d);
                }}
                tickMargin={8} tickSize={0} padding={{ left: 24, right: 24 }}
                height={32}
              />
              <YAxis domain={yDomain} ticks={yTicks} interval={0} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: axisColor, fontWeight: 400, ...(typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? { fill: '#fff' } : {}) }} />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #ede7ff', borderRadius: 12, color: color, ...(typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? { background: '#292929', color: '#fff', border: '1px solid #333' } : {}) }} />
              <Bar dataKey="value" fill={chartColor} radius={[8, 8, 0, 0]} className="transition-colors duration-200" />
            </BarChart>
          ) : (
            <LineChart data={data} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke={gridColor} vertical={true} horizontal={true} style={{ opacity: gridOpacity }} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} 
                tick={{ fontSize: 12, fill: axisColor, fontWeight: 500, textAnchor: 'middle' }} 
                tickFormatter={d => {
                  const shortDays = ['monShort','tueShort','wedShort','thuShort','friShort','satShort','sunShort'];
                  return shortDays.includes(d) ? t(d) : t(d);
                }}
                tickMargin={8} tickSize={0} padding={{ left: 24, right: 24 }}
                height={32}
              />
              <YAxis domain={yDomain} ticks={yTicks} interval={0} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: axisColor, fontWeight: 400 }} />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #ede7ff', borderRadius: 12, color: color }} />
              <Line type="monotone" dataKey="value" stroke={chartColor} strokeWidth={2} dot={{ r: 4, fill: chartColor }} className="transition-colors duration-200" />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
} 