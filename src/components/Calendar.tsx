"use client";
import { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from '@heroicons/react/24/solid';
import { useLanguage } from '@/contexts/LanguageContext';

const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

function getMonthMatrix(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const matrix = [];
  let week = [];
  let dayOfWeek = (firstDay.getDay() + 6) % 7; // Пн=0
  for (let i = 0; i < dayOfWeek; i++) week.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) {
    week.push(new Date(year, month, d));
    if (week.length === 7) {
      matrix.push(week);
      week = [];
    }
  }
  while (week.length < 7) week.push(null);
  matrix.push(week);
  return matrix;
}

const mockEvents: { [key: string]: number } = {
  '2023-06-01': 1,
  '2023-06-02': 0,
  '2023-06-03': 2,
  '2023-06-07': 2,
  '2023-06-10': 2,
  '2023-06-16': 2,
  '2023-06-21': 1,
  '2023-06-22': 2,
  '2023-06-23': 2,
  '2023-06-28': 2,
  '2023-06-30': 2,
};

const VIEW_MODES = [
  { key: 'month', label: 'month' },
  { key: 'week', label: 'week' },
  { key: 'day', label: 'day' },
  { key: 'year', label: 'year' },
];

export default function Calendar() {
  const { t } = useLanguage();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [viewMode, setViewMode] = useState<'month'|'week'|'day'|'year'>('month');

  const matrix = getMonthMatrix(year, month);
  const monthName = today.toLocaleString('uk-UA', { month: 'long' });

  function formatDate(date: Date) {
    return date.toISOString().slice(0, 10);
  }

  function getEventsForDate(date: Date) {
    const dateStr = formatDate(date);
    return mockEvents[dateStr] || 0;
  }

  function getEventColor(count: number) {
    if (count === 0) return 'bg-gray-100';
    if (count === 1) return 'bg-blue-500';
    return 'bg-red-500';
  }

  return (
    <div className="bg-white rounded-2xl border border-[#ede7ff] p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (month === 0) {
                setYear(year - 1);
                setMonth(11);
              } else {
                setMonth(month - 1);
              }
            }}
            className="p-2 rounded-lg hover:bg-[#ede7ff] transition"
          >
            <ChevronLeftIcon className="w-5 h-5 text-[#651FFF]" />
          </button>
          <h1 className="text-2xl font-bold text-[#222]">
            {new Date(year, month).toLocaleString('uk-UA', { month: 'long', year: 'numeric' })}
          </h1>
          <button
            onClick={() => {
              if (month === 11) {
                setYear(year + 1);
                setMonth(0);
              } else {
                setMonth(month + 1);
              }
            }}
            className="p-2 rounded-lg hover:bg-[#ede7ff] transition"
          >
            <ChevronRightIcon className="w-5 h-5 text-[#651FFF]" />
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Пошук подій..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#651FFF] focus:border-transparent"
          />
          
          <div className="flex bg-gray-100 rounded-lg p-1">
            {VIEW_MODES.map((mode) => (
              <button
                key={mode.key}
                onClick={() => setViewMode(mode.key as any)}
                className={`px-3 py-1 rounded text-sm font-medium transition ${
                  viewMode === mode.key
                    ? 'bg-white text-[#651FFF] shadow-sm'
                    : 'text-gray-600 hover:text-[#651FFF]'
                }`}
              >
                {t(mode.label)}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setShowEdit(true)}
            className="bg-[#651FFF] text-white px-4 py-2 rounded-lg hover:bg-[#5A1BE0] transition flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            Додати подію
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 min-h-0">
        <div className="grid grid-cols-7 gap-1 h-full">
          {/* Week days header */}
          {weekDays.map((day) => (
            <div key={day} className="p-3 text-center font-semibold text-gray-600 text-sm border-b">
              {t(day)}
            </div>
          ))}
          
          {/* Calendar days */}
          {matrix.map((week, weekIndex) =>
            week.map((date, dayIndex) => (
              <div
                key={`${weekIndex}-${dayIndex}`}
                className={`p-2 border-b border-r border-gray-100 min-h-[80px] flex flex-col ${
                  date ? 'hover:bg-gray-50 cursor-pointer' : 'bg-gray-50'
                }`}
                onClick={() => date && setSelectedDate(formatDate(date))}
              >
                {date && (
                  <>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-medium ${
                        date.toDateString() === today.toDateString() 
                          ? 'text-[#651FFF] font-bold' 
                          : 'text-gray-900'
                      }`}>
                        {date.getDate()}
                      </span>
                      {getEventsForDate(date) > 0 && (
                        <div className={`w-2 h-2 rounded-full ${getEventColor(getEventsForDate(date))}`} />
                      )}
                    </div>
                    {getEventsForDate(date) > 0 && (
                      <div className="text-xs text-gray-500">
                        {getEventsForDate(date)} подія{getEventsForDate(date) > 1 ? 'ї' : 'я'}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Event Editor (Right Side) */}
      {showEdit && (
        <div className="absolute right-0 top-0 h-full w-80 bg-white border-l border-[#ede7ff] p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#222]">Нова подія</h2>
            <button
              onClick={() => setShowEdit(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Назва події
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#651FFF] focus:border-transparent"
                placeholder="Введіть назву події"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Дата
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#651FFF] focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Час
              </label>
              <input
                type="time"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#651FFF] focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Опис
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#651FFF] focus:border-transparent"
                placeholder="Опис події"
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <button
                type="button"
                onClick={() => setShowEdit(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Скасувати
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-[#651FFF] text-white rounded-lg hover:bg-[#5A1BE0] transition"
              >
                Зберегти
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
} 