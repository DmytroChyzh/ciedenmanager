import React from 'react';

// Тимчасові дані для подій
const events = [
  { id: 1, name: 'Нова сесія', time: '21.06.2023 12:45', status: 'active', description: 'Створено нову чат-сесію з клієнтом.' },
  { id: 2, name: 'Оцінка проєкту', time: '21.06.2023 12:45', status: 'active', description: 'Додано оцінку для проєкту.' },
  { id: 3, name: 'AI summary', time: '21.06.2023 12:45', status: 'active', description: 'Згенеровано summary для сесії.' },
  { id: 4, name: 'Помилка експорту', time: '20.06.2023 12:45', status: 'error', description: 'Не вдалося експортувати PDF.' },
];

const statusColor = {
  active: 'bg-green-100 text-green-800',
  error: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800',
};

export default function EventsBlock() {
  return (
    <div className="bg-white rounded-2xl border border-[#ede7ff] p-6 h-full flex flex-col">
      <h2 className="text-xl font-semibold text-[#651FFF] mb-4">Події</h2>
      <ul className="flex-1 space-y-4 overflow-y-auto">
        {events.map(event => (
          <li key={event.id} className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[event.status as keyof typeof statusColor]}`}>{event.status === 'active' ? 'Активно' : event.status === 'error' ? 'Помилка' : 'Завершено'}</span>
              <span className="text-xs text-gray-500">{event.time}</span>
            </div>
            <div className="font-medium text-gray-900">{event.name}</div>
            <div className="text-xs text-gray-500">{event.description}</div>
          </li>
        ))}
      </ul>
    </div>
  );
} 