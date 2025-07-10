import React, { useEffect, useState } from 'react';
import { getChatSessionById } from '@/lib/firestore';

export default function ChatViewMini({ sessionId }: { sessionId: string }) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getChatSessionById(sessionId)
      .then(data => {
        setSession(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Помилка завантаження сесії');
        setLoading(false);
      });
  }, [sessionId]);

  if (loading) {
    return <div className="flex items-center justify-center h-full text-gray-400">Завантаження...</div>;
  }
  if (error) {
    return <div className="flex items-center justify-center h-full text-red-500">{error}</div>;
  }
  if (!session) {
    return <div className="flex items-center justify-center h-full text-gray-400">Сесію не знайдено</div>;
  }

  let messages: any[] = [];
  if (Array.isArray(session.messages)) {
    messages = session.messages;
  } else if (session.messages && typeof session.messages === 'object') {
    messages = Object.values(session.messages);
  }

  return (
    <div className="bg-white dark:bg-dark-card rounded-2xl p-6 h-full min-h-0 flex-1 flex flex-col gap-4 overflow-y-auto max-h-full">
      <div className="font-bold text-lg text-[#651FFF] dark:text-dark-orange mb-2">Чат</div>
      <div className="flex flex-col gap-2">
        {messages.length > 0 ? (
          messages.map((msg, idx) => (
            <div key={idx} className="flex flex-col text-xs bg-[#f7f8fa] dark:bg-[#232323] rounded-lg p-2">
              <span className="font-semibold text-[#651FFF] dark:text-dark-orange">{msg.role === 'user' ? 'Клієнт' : msg.role === 'manager' ? 'Менеджер' : 'AI'}</span>
              <span className="text-gray-800 dark:text-dark-text">{msg.text || msg.content || msg.message || <span className="italic text-gray-400 dark:text-dark-text">(немає тексту)</span>}</span>
              {msg.timestamp?.toDate && (
                <span className="text-gray-400 dark:text-dark-text">{msg.timestamp.toDate().toLocaleString('uk-UA')}</span>
              )}
            </div>
          ))
        ) : (
          <span className="italic text-gray-400 dark:text-dark-text">Немає повідомлень у цій сесії</span>
        )}
      </div>
    </div>
  );
} 