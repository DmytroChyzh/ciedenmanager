import React from 'react';
import { Message } from '@/types/chat';
import { formatDate } from '@/utils/chatUtils';
import { useState, useRef, useEffect } from 'react';
import { Copy, ThumbsUp, ThumbsDown, Volume2, Sparkles, PencilLine, RotateCcw, MoreHorizontal, Share2, Check, X } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  onEditMessage?: (messageId: string, newText: string) => void;
  onImproveMessage?: (messageId: string, originalText: string) => void;
  onRefreshMessage?: (messageId: string, originalText: string) => void;
}

export default function ChatMessage({ message, onEditMessage, onImproveMessage, onRefreshMessage }: ChatMessageProps) {
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(message.text);
  const [speaking, setSpeaking] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
      textareaRef.current.focus();
    }
  }, [editing, editText]);

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      showToastMessage('Текст скопійовано!');
    } catch (err) {
      showToastMessage('Помилка копіювання');
    }
  };

  const handleLike = () => {
    setLiked(!liked); 
    setDisliked(false);
    showToastMessage(liked ? 'Лайк видалено' : 'Лайк додано!');
  };

  const handleDislike = () => {
    setDisliked(!disliked); 
    setLiked(false);
    showToastMessage(disliked ? 'Дизлайк видалено' : 'Дизлайк додано');
  };

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      showToastMessage('Голосове озвучення не підтримується');
      return;
    }
    
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      showToastMessage('Озвучення зупинено');
      return;
    }

    setSpeaking(true);
    const utter = new window.SpeechSynthesisUtterance(message.text);
    utter.lang = 'uk-UA';
    utter.rate = 0.9;
    utter.pitch = 1;
    
    utter.onend = () => {
      setSpeaking(false);
      showToastMessage('Озвучення завершено');
    };
    
    utter.onerror = () => {
      setSpeaking(false);
      showToastMessage('Помилка озвучення');
    };
    
    window.speechSynthesis.speak(utter);
    showToastMessage('Починаю озвучувати...');
  };

  const handleImprove = () => {
    if (onImproveMessage) {
      onImproveMessage(message.id, message.text);
      showToastMessage('Запит на покращення відправлено');
    } else {
      showToastMessage('Функція покращення недоступна');
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setEditText(message.text);
  };

  const handleEditSave = () => {
    if (editText.trim() !== message.text) {
      if (onEditMessage) {
        onEditMessage(message.id, editText.trim());
        showToastMessage('Повідомлення оновлено');
      }
    }
    setEditing(false);
  };

  const handleRefresh = () => {
    if (onRefreshMessage) {
      onRefreshMessage(message.id, message.text);
      showToastMessage('Запит на оновлення відправлено');
    } else {
      showToastMessage('Функція оновлення недоступна');
    }
  };

  const handleShare = async () => {
    try {
      const shareData = {
        title: 'AI Чат - Повідомлення',
        text: message.text,
        url: window.location.href
      };
      
      if (navigator.share) {
        await navigator.share(shareData);
        showToastMessage('Повідомлення поділено');
      } else {
        await navigator.clipboard.writeText(message.text);
        showToastMessage('Текст скопійовано для поділення');
      }
    } catch (err) {
      showToastMessage('Помилка поділення');
    }
  };

  return (
    <div className={`w-full max-w-4xl mx-auto flex flex-col px-0`}>
      <div className={`flex w-full ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-2`}>
        <div
          className={`max-w-[70%] md:max-w-2xl w-auto px-6 py-4 rounded-2xl shadow-sm
            ${message.role === 'user'
              ? 'bg-[#4F46E5] text-white ml-auto'
              : 'bg-[#F4F5F7] text-[#222] mr-auto'}
          `}
        >
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {editing ? (
              <div className="flex items-start gap-2">
                <textarea
                  ref={textareaRef}
                  className="w-full rounded-lg bg-[#F4F5F7] focus:bg-white focus:ring-2 focus:ring-blue-200 border-none p-2 text-sm resize-none transition-all duration-150 shadow-sm outline-none"
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  rows={1}
                  style={{minHeight: 40, maxHeight: 200, overflow: 'hidden'}}
                  onInput={e => {
                    const t = e.target as HTMLTextAreaElement;
                    t.style.height = 'auto';
                    t.style.height = t.scrollHeight + 'px';
                  }}
                />
                <button onClick={handleEditSave} title="Зберегти" className="ml-1 text-green-600 hover:text-green-800 transition"><Check size={20} strokeWidth={1.5} /></button>
                <button onClick={() => { setEditing(false); setEditText(message.text); }} title="Скасувати" className="ml-1 text-red-500 hover:text-red-700 transition"><X size={20} strokeWidth={1.5} /></button>
              </div>
            ) : message.text}
          </div>
          <div
            className={`text-xs mt-2 ${
              message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
            }`}
          >
            {formatDate(message.timestamp)}
          </div>
        </div>
      </div>
      
      {/* AI options row — окремо під повідомленням */}
      {message.role === 'ai' && (
        <div className="flex flex-row gap-4 mt-2 px-2 py-1 bg-transparent w-full">
          {/* Оновити */}
          <button onClick={handleRefresh} title="Оновити" className="hover:text-cyan-500 transition"><RotateCcw size={20} strokeWidth={1.5} /></button>
          {/* Копіювати */}
          <button onClick={handleCopy} title="Копіювати" className="hover:text-blue-500 transition"><Copy size={20} strokeWidth={1.5} /></button>
          {/* Лайк */}
          <button onClick={handleLike} title="Лайк" className={liked ? "text-green-500" : "hover:text-green-500 transition"}><ThumbsUp size={20} strokeWidth={1.5} /></button>
          {/* Дизлайк */}
          <button onClick={handleDislike} title="Дизлайк" className={disliked ? "text-red-500" : "hover:text-red-500 transition"}><ThumbsDown size={20} strokeWidth={1.5} /></button>
          {/* Озвучити */}
          <button onClick={handleSpeak} title="Озвучити" className={speaking ? "text-blue-500 animate-pulse" : "hover:text-blue-500 transition"}><Volume2 size={20} strokeWidth={1.5} /></button>
          {/* Покращити */}
          <button onClick={handleImprove} title="Покращити" className="hover:text-purple-500 transition"><Sparkles size={20} strokeWidth={1.5} /></button>
          {/* Редагувати */}
          <button onClick={handleEdit} title="Редагувати" className="hover:text-yellow-500 transition"><PencilLine size={20} strokeWidth={1.5} /></button>
          {/* Ще */}
          <button title="Ще" className="hover:text-gray-600 transition"><MoreHorizontal size={20} strokeWidth={1.5} /></button>
          {/* Поділитися */}
          <button onClick={handleShare} title="Поділитися" className="hover:text-indigo-500 transition"><Share2 size={20} strokeWidth={1.5} /></button>
        </div>
      )}
      
      {/* Toast notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-in slide-in-from-bottom-2">
          {toastMessage}
        </div>
      )}
    </div>
  );
} 