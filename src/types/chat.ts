export interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface Chat {
  id: string;
  title: string;
  created: string;
  updated: string;
  messages: Message[];
}

export interface ChatHistory {
  chats: Chat[];
  activeChatId: string | null;
} 