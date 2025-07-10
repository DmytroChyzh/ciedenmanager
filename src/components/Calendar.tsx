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
  const [showAddEventPopup, setShowAddEventPopup] = useState(false);
  const [popupDate, setPopupDate] = useState<Date | null>(null);
  const [popupHour, setPopupHour] = useState<number | null>(null);

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

  // Визначаємо поточний тиждень
  function getCurrentWeekMatrix(year: number, month: number, day: number) {
    const matrix = getMonthMatrix(year, month);
    for (const week of matrix) {
      if (week.some(d => d && d.getDate() === day)) {
        return [week];
      }
    }
    return [matrix[0]];
  }

  // Визначаємо всі місяці року
  function getYearMatrix(year: number) {
    return Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));
  }

  return (
    <div className="bg-white rounded-2xl p-6 h-full max-h-[1070px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (viewMode === 'month') {
                if (month === 0) {
                  setYear(year - 1);
                  setMonth(11);
                } else {
                  setMonth(month - 1);
                }
              } else if (viewMode === 'week') {
                // Визначаємо поточну дату (або сьогодні)
                const baseDate = selectedDate ? new Date(selectedDate) : today;
                const prevWeek = new Date(baseDate);
                prevWeek.setDate(baseDate.getDate() - 7);
                setSelectedDate(prevWeek.toISOString().slice(0, 10));
                setYear(prevWeek.getFullYear());
                setMonth(prevWeek.getMonth());
              } else if (viewMode === 'day') {
                const baseDate = selectedDate ? new Date(selectedDate) : today;
                const prevDay = new Date(baseDate);
                prevDay.setDate(baseDate.getDate() - 1);
                setSelectedDate(prevDay.toISOString().slice(0, 10));
                setYear(prevDay.getFullYear());
                setMonth(prevDay.getMonth());
              } else if (viewMode === 'year') {
                setYear(year - 1);
              }
            }}
            className="p-2 rounded-lg hover:bg-[#ede7ff] transition"
          >
            <ChevronLeftIcon className="w-5 h-5 text-[#651FFF]" />
          </button>
          <h1 className="text-2xl font-bold text-[#222]">
            {t([
              'january',
              'february',
              'march',
              'april',
              'may',
              'june',
              'july',
              'august',
              'september',
              'october',
              'november',
              'december',
            ][month])} {year}{t('langUA') === 'UA' ? ' р.' : ''}
          </h1>
          <button
            onClick={() => {
              if (viewMode === 'month') {
                if (month === 11) {
                  setYear(year + 1);
                  setMonth(0);
                } else {
                  setMonth(month + 1);
                }
              } else if (viewMode === 'week') {
                const baseDate = selectedDate ? new Date(selectedDate) : today;
                const nextWeek = new Date(baseDate);
                nextWeek.setDate(baseDate.getDate() + 7);
                setSelectedDate(nextWeek.toISOString().slice(0, 10));
                setYear(nextWeek.getFullYear());
                setMonth(nextWeek.getMonth());
              } else if (viewMode === 'day') {
                const baseDate = selectedDate ? new Date(selectedDate) : today;
                const nextDay = new Date(baseDate);
                nextDay.setDate(baseDate.getDate() + 1);
                setSelectedDate(nextDay.toISOString().slice(0, 10));
                setYear(nextDay.getFullYear());
                setMonth(nextDay.getMonth());
              } else if (viewMode === 'year') {
                setYear(year + 1);
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
            placeholder={t('searchEventsPlaceholder')}
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
            {t('addEvent')}
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 min-h-0">
        {viewMode === 'month' && (
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
                  onClick={() => {
                    if (date) {
                      setViewMode('day');
                      setSelectedDate(formatDate(date));
                      setYear(date.getFullYear());
                      setMonth(date.getMonth());
                    }
                  }}
                >
                  {date && (
                    <>
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-sm font-medium rounded-full px-2 py-1 transition-all duration-200 shadow-md ${
                            date && date.toDateString() === today.toDateString()
                              ? 'bg-[#651FFF] text-white ring-4 ring-[#ede7ff] scale-110 animate-pulse'
                              : date ? 'text-gray-900' : 'text-gray-300'
                          }`}
                          style={{ cursor: date ? 'pointer' : 'default' }}
                        >
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
        )}
        {viewMode === 'week' && (
          <>
            {/* Видалено блок з написом тижня */}
            <div className="flex flex-col h-full w-full overflow-y-auto">
              <div className="flex-1 flex flex-row bg-white rounded-2xl shadow-lg overflow-hidden border border-[#ede7ff] animate-fadeIn">
                {/* Шкала годин */}
                <div className="flex flex-col w-16 bg-[#f7f8fa] border-r border-gray-200 text-xs text-gray-400 select-none">
                  <div className="h-12" />
                  {Array.from({ length: 24 }, (_, i) => (
                    <div key={i} className="h-12 flex items-start justify-end pr-2 pt-1">
                      {i}:00
                    </div>
                  ))}
                </div>
                {/* Дні тижня */}
                <div className="flex-1 grid grid-cols-7 relative">
                  {/* Header днів */}
                  {getCurrentWeekMatrix(year, month, (selectedDate ? new Date(selectedDate) : today).getDate())[0].map((date, idx) => (
                    <div key={idx} className={`h-20 flex flex-col items-center justify-center border-b border-gray-200 ${date && date.toDateString() === today.toDateString() ? 'bg-[#ede7ff]/40' : ''}`}>
                      <span className="flex flex-col items-center">
                        <span className={`text-base font-bold rounded-full px-2 py-0.5 transition-all duration-200 shadow-md ${
                          date && date.toDateString() === today.toDateString()
                            ? 'bg-[#651FFF] text-white ring-2 ring-[#ede7ff] scale-105 animate-pulse'
                            : 'text-gray-900'
                        }`}>{date ? date.getDate() : ''}</span>
                        <span className="text-xs text-gray-500 mt-4">{t(weekDays[idx])}</span>
                      </span>
                    </div>
                  ))}
                  {/* Сітка годин */}
                  {Array.from({ length: 24 }, (_, hour) =>
                    getCurrentWeekMatrix(year, month, (selectedDate ? new Date(selectedDate) : today).getDate())[0].map((date, dayIdx) => (
                      <div
                        key={hour + '-' + dayIdx}
                        className={`h-12 border-b border-r border-gray-100 relative ${date && date.toDateString() === today.toDateString() ? 'bg-[#ede7ff]/10' : ''}`}
                        onClick={() => {
                          if (date) {
                            setPopupDate(date);
                            setPopupHour(hour);
                            setShowAddEventPopup(true);
                          }
                        }}
                        style={{ cursor: date ? 'pointer' : 'default' }}
                      />
                    ))
                  )}
                  {/* Поточний час */}
                  {getCurrentWeekMatrix(year, month, (selectedDate ? new Date(selectedDate) : today).getDate())[0].map((date, idx) => (
                    date && date.toDateString() === new Date().toDateString() ? (
                      <div
                        key={'now-' + idx}
                        className="absolute left-0 right-0 flex items-center pointer-events-none"
                        style={{
                          top: `${48 + (new Date().getHours() * 60 + new Date().getMinutes()) * 48 / 60}px`,
                          gridColumn: `${idx + 1} / span 1`,
                          zIndex: 10
                        }}
                      >
                        <div className="w-2 h-2 bg-[#651FFF] rounded-full" />
                        <div className="h-0.5 bg-[#651FFF] flex-1 ml-2" />
                      </div>
                    ) : null
                  ))}
                  {/* Тут можна рендерити події тижня */}
                </div>
              </div>
            </div>
          </>
        )}
        {viewMode === 'day' && (
          <div className="flex flex-col h-full w-full">
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-bold text-[#651FFF]">{
                (() => {
                  const date = selectedDate ? new Date(selectedDate) : today;
                  const day = date.getDate();
                  const month = t([
                    'january',
                    'february',
                    'march',
                    'april',
                    'may',
                    'june',
                    'july',
                    'august',
                    'september',
                    'october',
                    'november',
                    'december',
                  ][date.getMonth()]);
                  const year = date.getFullYear();
                  return `${day} ${month} ${year}${t('langUA') === 'UA' ? ' р.' : ''}`;
                })()
              }</span>
              <span className="text-lg text-gray-500">{t(weekDays[(selectedDate ? new Date(selectedDate).getDay() : today.getDay() + 6) % 7])}</span>
            </div>
            <div className="flex-1 flex flex-row bg-white rounded-2xl shadow-lg overflow-hidden border border-[#ede7ff] animate-fadeIn">
              {/* Шкала годин */}
              <div className="flex flex-col w-16 bg-[#f7f8fa] border-r border-gray-200 text-xs text-gray-400 select-none">
                {Array.from({ length: 24 }, (_, i) => (
                  <div key={i} className="h-12 flex items-start justify-end pr-2 pt-1">
                    {i}:00
                  </div>
                ))}
              </div>
              {/* Смуга подій */}
              <div className="flex-1 relative">
                {Array.from({ length: 24 }, (_, i) => (
                  <div
                    key={i}
                    className="h-12 border-b border-gray-100 relative hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setPopupDate(selectedDate ? new Date(selectedDate) : today);
                      setPopupHour(i);
                      setShowAddEventPopup(true);
                    }}
                  />
                ))}
                {/* Поточний час */}
                {(selectedDate ? new Date(selectedDate).toDateString() : today.toDateString()) === new Date().toDateString() && (
                  <div
                    className="absolute left-0 right-0 flex items-center pointer-events-none"
                    style={{ top: `${(new Date().getHours() * 60 + new Date().getMinutes()) * 48 / 60}px` }}
                  >
                    <div className="w-2 h-2 bg-[#651FFF] rounded-full ml-14" />
                    <div className="h-0.5 bg-[#651FFF] flex-1 ml-2" />
                  </div>
                )}
                {/* Тут можна рендерити події дня */}
              </div>
            </div>
          </div>
        )}
        {viewMode === 'year' && (
          <div className="flex flex-col gap-4 h-full w-full">
            <div className="flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-[#651FFF]">{year}</span>
            </div>
            <div className="grid grid-cols-4 gap-8">
              {getYearMatrix(year).map((date, idx) => {
                const monthMatrix = getMonthMatrix(year, date.getMonth());
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl shadow-md p-4 flex flex-col items-center hover:shadow-lg hover:bg-[#ede7ff]/40 transition-all duration-200 cursor-pointer border border-gray-100"
                    onClick={() => { setMonth(date.getMonth()); setViewMode('month'); }}
                  >
                    <span className="text-lg font-bold text-[#651FFF] mb-2 capitalize">{
                      t([
                        'january',
                        'february',
                        'march',
                        'april',
                        'may',
                        'june',
                        'july',
                        'august',
                        'september',
                        'october',
                        'november',
                        'december',
                      ][date.getMonth()])
                    }</span>
                    <table className="w-full text-xs">
                      <thead>
                        <tr>
                          {[...Array(7)].map((_, i) => (
                            <th key={i} className="text-gray-400 font-semibold pb-1">{t(weekDays[i]).slice(0,2)}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {monthMatrix.map((week, wIdx) => (
                          <tr key={wIdx}>
                            {week.map((d, dIdx) => (
                              <td key={dIdx} className={`text-center py-0.5 px-1 rounded-full transition-all duration-200 ${
                                d && d.toDateString() === today.toDateString()
                                  ? 'bg-[#651FFF] text-white font-bold ring-4 ring-[#ede7ff] scale-110 animate-pulse'
                                  : d ? 'text-gray-900' : 'text-gray-300'
                              }`}>{d ? d.getDate() : ''}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Event Editor (Right Side) */}
      {showEdit && (
        <div className="absolute right-0 top-0 h-full w-80 bg-white border-l border-[#ede7ff] p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#222]">{t('newEvent')}</h2>
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
                {t('eventName')}
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#651FFF] focus:border-transparent"
                placeholder={t('eventNamePlaceholder')}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('eventDate')}
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#651FFF] focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('eventTime')}
              </label>
              <input
                type="time"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#651FFF] focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('eventDescription')}
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#651FFF] focus:border-transparent"
                placeholder={t('eventDescriptionPlaceholder')}
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <button
                type="button"
                onClick={() => setShowEdit(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-[#651FFF] text-white rounded-lg hover:bg-[#5A1BE0] transition"
              >
                {t('save')}
              </button>
            </div>
          </form>
        </div>
      )}
      {/* Попап додавання події */}
      {showAddEventPopup && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-lg p-8 min-w-[320px] relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-[#651FFF] text-xl" onClick={() => setShowAddEventPopup(false)}>&times;</button>
            <div className="font-bold text-lg mb-2 text-[#651FFF]">{t('addEvent')}</div>
            <div className="mb-4 text-gray-700">
              <div>{t('eventDate')}: <b>{popupDate?.toLocaleDateString('uk-UA')}</b></div>
              <div>{t('eventTime')}: <b>{popupHour !== null ? popupHour + ':00' : ''}</b></div>
            </div>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4" placeholder={t('eventNamePlaceholder')} />
            <button className="bg-[#651FFF] text-white px-4 py-2 rounded-lg hover:bg-[#5A1BE0] transition w-full font-semibold">{t('save')}</button>
          </div>
        </div>
      )}
    </div>
  );
} 