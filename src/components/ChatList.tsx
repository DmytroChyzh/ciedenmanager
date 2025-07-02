"use client";
import React, { useEffect, useState } from 'react';
import { subscribeToChatSessions } from '@/lib/firestore';
import { UserCircleIcon } from '@heroicons/react/24/solid';

interface ChatListSession {
  id: string;
  metadata: {
    userName: string;
    userEmail: string;
    status: 'active' | 'completed' | 'archived';
    totalMessages: number;
  };
  messages: any[];
}

interface ChatListProps {
  selectedSessionId?: string;
  onSelect?: (id: string) => void;
  hideHeader?: boolean;
}

export default function ChatList({ selectedSessionId, onSelect, hideHeader }: ChatListProps) {
  const [sessions, setSessions] = useState<ChatListSession[]>([]);
  const [readSessions, setReadSessions] = useState<Set<string>>(new Set());

  useEffect(() => {
    const unsubscribe = subscribeToChatSessions((data) => {
      setSessions(data);
    });
    return () => unsubscribe && unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedSessionId) {
      setReadSessions(prev => new Set(prev).add(selectedSessionId));
    }
  }, [selectedSessionId]);

  return (
    <aside className="w-80 max-w-xs min-w-[260px] border-r border-[#ede7ff] bg-white rounded-l-2xl h-full flex flex-col">
      {!hideHeader && (
        <div className="px-6 py-2 border-b border-gray-200 flex items-center justify-between bg-white">
          <h2 className="text-xl font-bold text-[#651FFF]">Чат-сесії</h2>
          <span className="text-sm text-gray-500 font-semibold">{sessions.length} активних</span>
        </div>
      )}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {sessions.length === 0 ? (
          <div className="text-center text-gray-400 mt-8">Немає сесій</div>
        ) : (
          <ul className="space-y-1">
            {sessions.map((session) => (
              <li
                key={session.id}
                className={`flex items-center gap-3 p-3 rounded-xl transition cursor-pointer ${selectedSessionId === session.id ? 'bg-[#ede7ff] font-bold' : 'hover:bg-[#f5f3ff]'}`}
                onClick={() => onSelect && onSelect(session.id)}
              >
                <span className="w-10 h-10 rounded-full bg-[#651FFF] flex items-center justify-center border-2 border-[#ede7ff] transition-all duration-150 group-hover:border-[#651FFF]">
                  <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                    <UserCircleIcon className="w-6 h-6 text-[#651FFF]" />
                  </span>
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{session.metadata.userName || '—'}</div>
                  <div className="text-xs text-gray-500 truncate">{session.metadata.userEmail || '—'}</div>
                  <div className="text-xs text-gray-400">{session.messages?.length ?? 0} повідомлень</div>
                </div>
                <span className={`ml-auto px-2 py-1 rounded-full text-xs font-medium ${readSessions.has(session.id) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                  {readSessions.has(session.id) ? 'Прочитано' : 'Непрочитано'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
} 