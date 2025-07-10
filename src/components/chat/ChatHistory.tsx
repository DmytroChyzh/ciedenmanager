import React from 'react';
import { Chat } from '@/types/chat';
import { formatDate } from '@/utils/chatUtils';

interface ChatHistoryProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onNewChat: () => void;
  onClearAll: () => void;
}

export default function ChatHistory({
  chats,
  activeChatId,
  onSelectChat,
  onDeleteChat,
  onNewChat,
  onClearAll,
}: ChatHistoryProps) {
  return (
    <aside className="w-[340px] h-full bg-white border-l border-gray-200 rounded-r-2xl flex flex-col">
      {/* Header */}
      <div className="px-6 py-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Історія</h2>
          <button
            onClick={onNewChat}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + Новий чат
          </button>
        </div>
        
        {chats.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-sm text-red-500 hover:text-red-700 transition-colors"
          >
            Очистити всю історію
          </button>
        )}
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {chats.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p>Історія порожня</p>
            <p className="text-sm">Створіть перший чат</p>
          </div>
        ) : (
          <div className="space-y-2">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`group relative cursor-pointer rounded-xl p-4 transition-all duration-200 ${
                  activeChatId === chat.id
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
                onClick={() => onSelectChat(chat.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-medium truncate ${
                      activeChatId === chat.id ? 'text-blue-800' : 'text-gray-800'
                    }`}>
                      {chat.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDate(chat.updated)}
                    </p>
                    {chat.messages.length > 0 && (
                      <p className="text-xs text-gray-400 mt-1 truncate">
                        {chat.messages.length} повідомлень
                      </p>
                    )}
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(chat.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded"
                  >
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
} 