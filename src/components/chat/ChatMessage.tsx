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
          className={`max-w-[70%] md:max-w-2xl w-auto px-4 py-3 rounded-xl shadow-sm
            ${message.role === 'user'
              ? 'bg-primary text-white ml-auto'
              : 'bg-gray-100 dark:bg-dark-hover text-gray-900 dark:text-dark-text mr-auto'}
          `}
        >
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {editing ? (
              <div className="flex items-start gap-2">
                <textarea
                  ref={textareaRef}
                  className="w-full rounded-lg bg-white dark:bg-dark-card focus:ring-2 focus:ring-primary/20 dark:focus:ring-dark-primary/20 border-none p-2 text-sm resize-none transition-all duration-150 shadow-sm outline-none"
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
                <button onClick={handleEditSave} title="Зберегти" className="ml-1 text-green-600 hover:text-green-800 transition"><Check size={18} strokeWidth={1.5} /></button>
                <button onClick={() => { setEditing(false); setEditText(message.text); }} title="Скасувати" className="ml-1 text-red-500 hover:text-red-700 transition"><X size={18} strokeWidth={1.5} /></button>
              </div>
            ) : message.text}
          </div>
          <div
            className={`text-xs mt-2 ${
              message.role === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {formatDate(message.timestamp)}
          </div>
        </div>
      </div>
      
      {/* AI options row — єдиний стиль для всіх іконок */}
      {message.role === 'ai' && (
        <div className="flex flex-row gap-3 mt-2 px-2 py-1 bg-transparent w-full">
          {/* Оновити */}
          <button 
            onClick={handleRefresh} 
            title="Оновити відповідь" 
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-dark-primary"
          >
            <RotateCcw size={16} strokeWidth={1.5} />
          </button>
          
          {/* Копіювати */}
          <button 
            onClick={handleCopy} 
            title="Копіювати текст" 
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-dark-primary"
          >
            <Copy size={16} strokeWidth={1.5} />
          </button>
          
          {/* Лайк */}
          <button 
            onClick={handleLike} 
            title="Лайк" 
            className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors ${
              liked ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400'
            }`}
          >
            <ThumbsUp size={16} strokeWidth={1.5} />
          </button>
          
          {/* Дизлайк */}
          <button 
            onClick={handleDislike} 
            title="Дизлайк" 
            className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors ${
              disliked ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400'
            }`}
          >
            <ThumbsDown size={16} strokeWidth={1.5} />
          </button>
          
          {/* Озвучити */}
          <button 
            onClick={handleSpeak} 
            title="Озвучити текст" 
            className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors ${
              speaking ? 'text-blue-600 dark:text-blue-400 animate-pulse' : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
          >
            <Volume2 size={16} strokeWidth={1.5} />
          </button>
          
          {/* Покращити */}
          <button 
            onClick={handleImprove} 
            title="Покращити відповідь" 
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-dark-primary"
          >
            <Sparkles size={16} strokeWidth={1.5} />
          </button>
          
          {/* Редагувати */}
          <button 
            onClick={handleEdit} 
            title="Редагувати повідомлення" 
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-dark-primary"
          >
            <PencilLine size={16} strokeWidth={1.5} />
          </button>
          
          {/* Поділитися */}
          <button 
            onClick={handleShare} 
            title="Поділитися" 
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-dark-primary"
          >
            <Share2 size={16} strokeWidth={1.5} />
          </button>
        </div>
      )}
      
      {/* Toast notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-gray-800 dark:bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-in slide-in-from-bottom-2">
          {toastMessage}
        </div>
      )}
    </div>
  );
} 