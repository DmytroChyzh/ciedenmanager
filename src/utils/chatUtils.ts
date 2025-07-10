import { Chat, Message } from '@/types/chat';

// LocalStorage utilities
const STORAGE_KEY = 'cieden-assistant-history';

export function getHistory(): Chat[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading chat history:', error);
    return [];
  }
}

export function saveHistory(history: Chat[]): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  }
}

export function formatDate(dateString: string): string {
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

export function formatChatTitle(messages: Message[]): string {
  if (messages.length === 0) return 'Новий чат';
  const firstMessage = messages[0];
  const text = firstMessage.text.trim();
  return text.length > 30 ? text.substring(0, 30) + '...' : text;
}

export function createNewChat(): Chat {
  const now = new Date().toISOString();
  return {
    id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title: 'Новий чат',
    created: now,
    updated: now,
    messages: [],
  };
}

export function createMessage(role: 'user' | 'ai', text: string): Message {
  return {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    role,
    text,
    timestamp: new Date().toISOString(),
  };
}

export function updateChatTitle(chat: Chat): Chat {
  return {
    ...chat,
    title: formatChatTitle(chat.messages),
    updated: new Date().toISOString(),
  };
} 