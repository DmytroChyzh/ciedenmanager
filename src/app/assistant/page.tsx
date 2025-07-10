"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import ChatInput from '@/components/chat/ChatInput';
import { examplePrompts } from '@/utils/chatExamples';
import ChatMessage from '@/components/chat/ChatMessage';
import { useLanguage } from '@/contexts/LanguageContext';

const SYSTEM_PROMPT = "Ти — AI-помічник менеджерів з продажу компанії Cieden. Відповідай на будь-які питання чітко, ввічливо, професійно. Допомагай з аналізом продажів, стратегіями, обробкою об'єкцій та покращенням ефективності роботи менеджерів.";

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: string;
}

interface Chat {
  id: string;
  title: string;
  created: string;
  updated: string;
  messages: Message[];
}

// LocalStorage utilities
const STORAGE_KEY = 'cieden-assistant-history';

function getHistory(): Chat[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading chat history:', error);
    return [];
  }
}

function saveHistory(history: Chat[]): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 24) {
    return date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
  } else if (diffInHours < 48) {
    return 'Вчора';
  } else {
    return date.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' });
  }
}

function formatChatTitle(messages: Message[]): string {
  if (messages.length === 0) return 'Новий чат';
  const firstMessage = messages[0];
  const text = firstMessage.text.trim();
  return text.length > 30 ? text.substring(0, 30) + '...' : text;
}

// OpenAI API call
async function sendToOpenAI(messages: { role: string; content: string }[]): Promise<string> {
  const response = await fetch("/api/assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  return data.text || "Помилка: порожня відповідь";
}

function createNewChat(): Chat {
  const now = new Date().toISOString();
  return {
    id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title: 'Новий чат',
    created: now,
    updated: now,
    messages: [],
  };
}

function createMessage(role: 'user' | 'ai', text: string): Message {
  return {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    role,
    text,
    timestamp: new Date().toISOString(),
  };
}

export default function AssistantPage() {
  const [chats, setChats] = useState<Chat[]>(() => getHistory());
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const { t } = useLanguage();

  const activeChat = chats.find(chat => chat.id === activeChatId) || createNewChat();

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [activeChat.messages, loading, scrollToBottom]);

  // Save history when chats change
  useEffect(() => {
    saveHistory(chats);
  }, [chats]);

  // Set initial active chat
  useEffect(() => {
    if (!activeChatId && chats.length > 0) {
      setActiveChatId(chats[0].id);
    } else if (!activeChatId && chats.length === 0) {
      const newChat = createNewChat();
      setChats([newChat]);
      setActiveChatId(newChat.id);
    }
  }, [activeChatId, chats.length]);

  const handleSend = async () => {
    if (!input.trim() || loading || !activeChatId) return;

    const userMessage = createMessage('user', input.trim());
    const updatedChats = chats.map(chat =>
      chat.id === activeChatId
        ? {
            ...chat,
            messages: [...chat.messages, userMessage],
            title: formatChatTitle([...chat.messages, userMessage]),
            updated: new Date().toISOString(),
          }
        : chat
    );

    setChats(updatedChats);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const currentChat = updatedChats.find(chat => chat.id === activeChatId)!;
      const openAIMessages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...currentChat.messages.map(msg => ({
          role: msg.role === 'ai' ? 'assistant' : 'user',
          content: msg.text,
        })),
      ];

      const aiResponse = await sendToOpenAI(openAIMessages);
      const aiMessage = createMessage('ai', aiResponse);

      setChats(currentChats =>
        currentChats.map(chat =>
          chat.id === activeChatId
            ? {
                ...chat,
                messages: [...chat.messages, aiMessage],
                updated: new Date().toISOString(),
              }
            : chat
        )
      );
    } catch (err) {
      const errorMessage = createMessage('ai', `⚠️ Помилка: ${(err as Error).message}`);
      setChats(currentChats =>
        currentChats.map(chat =>
          chat.id === activeChatId
            ? {
                ...chat,
                messages: [...chat.messages, errorMessage],
                updated: new Date().toISOString(),
              }
            : chat
        )
      );
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    const newChat = createNewChat();
    setChats([newChat, ...chats]);
    setActiveChatId(newChat.id);
    setInput("");
    setError(null);
  };

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
    setInput("");
    setError(null);
  };

  const handleDeleteChat = (chatId: string) => {
    const updatedChats = chats.filter(chat => chat.id !== chatId);
    setChats(updatedChats);
    
    if (activeChatId === chatId) {
      setActiveChatId(updatedChats.length > 0 ? updatedChats[0].id : null);
    }
  };

  const handleClearAllChats = () => {
    if (window.confirm('Ви впевнені, що хочете видалити всю історію чатів?')) {
      setChats([]);
      setActiveChatId(null);
    }
  };

  // File attach handler
  const handleFileAttach = (file: File) => {
    setAttachedFile(file);
    setInput(prev => prev + (prev ? '\n' : '') + `[Файл: ${file.name}]`);
  };

  // Voice input handler
  const handleVoiceInput = (text: string) => {
    setInput(prev => prev + (prev ? ' ' : '') + text);
  };

  // Prompt insert handler
  const handlePromptInsert = (prompt: string) => {
    setInput(prompt);
    setError(null);
    if (document.activeElement) (document.activeElement as HTMLElement).blur();
    setTimeout(() => {
      const textarea = document.querySelector('textarea');
      if (textarea) textarea.focus();
    }, 0);
  };

  // Handle message editing
  const handleEditMessage = (messageId: string, newText: string) => {
    setChats(currentChats =>
      currentChats.map(chat =>
        chat.id === activeChatId
          ? {
              ...chat,
              messages: chat.messages.map(msg =>
                msg.id === messageId
                  ? { ...msg, text: newText }
                  : msg
              ),
              updated: new Date().toISOString(),
            }
          : chat
      )
    );
  };

  // Handle message improvement
  const handleImproveMessage = async (messageId: string, originalText: string) => {
    if (!activeChatId) return;

    const improvePrompt = `Покращи цю відповідь, зроби її більш детальною та корисною: "${originalText}"`;
    
    setInput(improvePrompt);
    setError(null);
    
    // Focus on input
    setTimeout(() => {
      const textarea = document.querySelector('textarea');
      if (textarea) textarea.focus();
    }, 0);
  };

  // Handle message refresh/regenerate
  const handleRefreshMessage = async (messageId: string, originalText: string) => {
    if (!activeChatId || loading) return;

    // Find the user message that preceded this AI response
    const currentChat = chats.find(chat => chat.id === activeChatId);
    if (!currentChat) return;

    const messageIndex = currentChat.messages.findIndex(msg => msg.id === messageId);
    if (messageIndex <= 0) return;

    const userMessage = currentChat.messages[messageIndex - 1];
    if (userMessage.role !== 'user') return;

    // Remove the current AI message and regenerate
    const updatedChats = chats.map(chat =>
      chat.id === activeChatId
        ? {
            ...chat,
            messages: chat.messages.filter(msg => msg.id !== messageId),
            updated: new Date().toISOString(),
          }
        : chat
    );

    setChats(updatedChats);
    setInput(userMessage.text);
    setLoading(true);
    setError(null);

    try {
      const currentChat = updatedChats.find(chat => chat.id === activeChatId)!;
      const openAIMessages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...currentChat.messages.map(msg => ({
          role: msg.role === 'ai' ? 'assistant' : 'user',
          content: msg.text,
        })),
      ];

      const aiResponse = await sendToOpenAI(openAIMessages);
      const aiMessage = createMessage('ai', aiResponse);

      setChats(currentChats =>
        currentChats.map(chat =>
          chat.id === activeChatId
            ? {
                ...chat,
                messages: [...chat.messages, aiMessage],
                updated: new Date().toISOString(),
              }
            : chat
        )
      );
      setInput("");
    } catch (err) {
      const errorMessage = createMessage('ai', `⚠️ Помилка: ${(err as Error).message}`);
      setChats(currentChats =>
        currentChats.map(chat =>
          chat.id === activeChatId
            ? {
                ...chat,
                messages: [...chat.messages, errorMessage],
                updated: new Date().toISOString(),
              }
            : chat
        )
      );
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const helperButtons = [
    {
      icon: (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
          <path d="M17 13V7.5C17 5.01472 14.9853 3 12.5 3C10.0147 3 8 5.01472 8 7.5V16C8 17.3807 9.11929 18.5 10.5 18.5C11.8807 18.5 13 17.3807 13 16V8.5" stroke="#A3A3A3" strokeWidth="1.7" strokeLinecap="round"/>
        </svg>
      ),
      label: '',
      onClick: () => console.log('Attach'),
    },
    {
      icon: (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" stroke="#A3A3A3" strokeWidth="1.7" /><circle cx="12" cy="12" r="3" fill="#A3A3A3" /></svg>
      ),
      label: 'Deep Search',
      onClick: () => console.log('Deep Search'),
    },
    {
      icon: (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M12 2V6" stroke="#A3A3A3" strokeWidth="1.7" strokeLinecap="round"/><path d="M12 18V22" stroke="#A3A3A3" strokeWidth="1.7" strokeLinecap="round"/><path d="M4.93 4.93L7.76 7.76" stroke="#A3A3A3" strokeWidth="1.7" strokeLinecap="round"/><path d="M16.24 16.24L19.07 19.07" stroke="#A3A3A3" strokeWidth="1.7" strokeLinecap="round"/><path d="M2 12H6" stroke="#A3A3A3" strokeWidth="1.7" strokeLinecap="round"/><path d="M18 12H22" stroke="#A3A3A3" strokeWidth="1.7" strokeLinecap="round"/><path d="M4.93 19.07L7.76 16.24" stroke="#A3A3A3" strokeWidth="1.7" strokeLinecap="round"/><path d="M16.24 7.76L19.07 4.93" stroke="#A3A3A3" strokeWidth="1.7" strokeLinecap="round"/></svg>
      ),
      label: 'Reason',
      onClick: () => console.log('Reason'),
    },
    {
      icon: (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="9" cy="12" r="1.5" fill="#A3A3A3"/><circle cx="15" cy="12" r="1.5" fill="#A3A3A3"/><circle cx="12" cy="12" r="1.5" fill="#A3A3A3"/></svg>
      ),
      label: '',
      onClick: () => console.log('More'),
    },
  ];

  return (
    <div className="rounded-2xl h-[1070px] flex flex-row w-full max-w-[2164px] mx-auto p-0">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white rounded-l-2xl h-full relative overflow-y-auto">
        <div className="flex flex-col h-full w-full max-w-5xl mx-auto">
          {/* Empty State - Centered Input */}
          {activeChat.messages.length === 0 && (
            <div className="flex-1 flex flex-col justify-center items-center px-4 py-8">
              {/* Welcome Section */}
              <div className="text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-bold mb-3 text-gray-900">{t('welcomeCiedenAI')}</h1>
                <p className="text-lg text-gray-500 max-w-xl mx-auto">{t('assistantDescription')}</p>
            </div>
              {/* Grid of Quick Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 w-full max-w-3xl mb-10">
                {examplePrompts.map((example, idx) => (
                <button
                    key={idx}
                    className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-blue-400 transition group"
                    onClick={() => handlePromptInsert(t(example.promptKey))}
                  >
                    <span className="mb-3 text-blue-500">
                      <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4" fill="#E0E7FF"/><path d="M8 12h8M8 16h5" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </span>
                    <span className="font-semibold text-gray-900 mb-1">{t(example.titleKey)}</span>
                    <span className="text-gray-500 text-sm">{t(example.promptKey)}</span>
                </button>
              ))}
            </div>
              {/* Chat Input */}
              <div className="w-full mt-8">
                <ChatInput
                  value={input}
                  onChange={setInput}
                  onSend={handleSend}
                  loading={loading}
                  error={error}
                  placeholder={t('inputPlaceholder')}
                  onFileAttach={handleFileAttach}
                  onVoiceInput={handleVoiceInput}
                />
                {attachedFile && (
                  <div className="mt-2 text-sm text-gray-600 flex items-center gap-2">
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M16.5 13.5V7.75C16.5 5.67893 14.8211 4 12.75 4C10.6789 4 9 5.67893 9 7.75V16.25C9 17.4926 10.0074 18.5 11.25 18.5C12.4926 18.5 13.5 17.4926 13.5 16.25V8.5" stroke="#A3A3A3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span>{attachedFile.name}</span>
                    <button className="text-red-400 hover:text-red-600 ml-2" onClick={() => setAttachedFile(null)}>✕</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Chat Messages */}
          {activeChat.messages.length > 0 && (
            <div className="flex flex-col h-full w-full">
              {/* Messages Container */}
              <div className="flex-1 pt-8 pb-8 px-8">
                <div className="space-y-4">
                  {activeChat.messages.map((message) => (
                    <ChatMessage 
                      key={message.id} 
                      message={message}
                      onEditMessage={handleEditMessage}
                      onImproveMessage={handleImproveMessage}
                      onRefreshMessage={handleRefreshMessage}
                    />
                  ))}
                  {loading && (
                    <div className="w-full max-w-4xl mx-auto flex justify-start">
                      <div className="max-w-[70%] md:max-w-2xl w-auto px-6 py-4 rounded-2xl shadow-sm bg-gray-100 text-gray-800">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          <span className="text-sm text-gray-600 ml-2">AI набирає повідомлення...</span>
                        </div>
                      </div>
                  </div>
                  )}
                </div>
                <div ref={messagesEndRef} />
            </div>
              {/* Input Area — завжди знизу, по сітці */}
              <div className="pb-8 px-8 sticky bottom-0 bg-white z-10">
                <ChatInput
                  value={input}
                  onChange={setInput}
                  onSend={handleSend}
                  loading={loading}
                  error={error}
                  placeholder=""
                  onFileAttach={handleFileAttach}
                  onVoiceInput={handleVoiceInput}
                />
                {attachedFile && (
                  <div className="mt-2 text-sm text-gray-600 flex items-center gap-2">
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M16.5 13.5V7.75C16.5 5.67893 14.8211 4 12.75 4C10.6789 4 9 5.67893 9 7.75V16.25C9 17.4926 10.0074 18.5 11.25 18.5C12.4926 18.5 13.5 17.4926 13.5 16.25V8.5" stroke="#A3A3A3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span>{attachedFile.name}</span>
                    <button className="text-red-400 hover:text-red-600 ml-2" onClick={() => setAttachedFile(null)}>✕</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* History Sidebar */}
      <aside className="w-[340px] h-full bg-white border-l border-gray-200 rounded-r-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-[#222]">{t('history')}</h2>
            <button
              onClick={handleNewChat}
              className="px-4 py-2 bg-[#4F46E5] text-white rounded-lg hover:bg-[#6366F1] transition-colors font-medium shadow-sm"
            >
              {t('newChat')}
            </button>
          </div>
          
          {chats.length > 0 && (
                <button
              onClick={handleClearAllChats}
              className="text-sm text-red-500 hover:text-red-700 transition-colors"
            >
              {t('clearHistory')}
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
              <p>{t('historyEmpty')}</p>
              <p className="text-sm">{t('createFirstChat')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {chats.filter(chat => chat.messages.length > 0).map((chat) => (
                <div
                  key={chat.id}
                  className={`group relative cursor-pointer rounded-xl p-4 transition-all duration-200 select-none
                    ${activeChatId === chat.id
                      ? 'bg-[#E0E7FF] border border-[#4F46E5] text-[#4F46E5]'
                      : 'bg-[#F4F5F7] border border-transparent text-[#222] hover:bg-[#E5E7EB]'}
                  `}
                  onClick={() => handleSelectChat(chat.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium truncate ${
                        activeChatId === chat.id ? 'text-[#4F46E5]' : 'text-[#222]'
                      }`}>
                        {chat.title}
                      </h3>
                      <p className="text-sm mt-1 ${activeChatId === chat.id ? 'text-[#4F46E5] opacity-80' : 'text-gray-500'}">
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
                        handleDeleteChat(chat.id);
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
    </div>
  );
} 