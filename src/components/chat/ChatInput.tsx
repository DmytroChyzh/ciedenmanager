import React, { useRef, useEffect, useState } from 'react';

interface HelperButton {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  loading: boolean;
  error?: string | null;
  placeholder?: string;
  helperButtons?: HelperButton[];
  status?: string;
  statusIcon?: React.ReactNode;
}

export default function ChatInput({
  value,
  onChange,
  onSend,
  loading,
  error,
  placeholder = "Ask anything...",
  helperButtons = [],
  status = "Searching the web...",
  statusIcon = (
    <span className="inline-block mr-2 align-middle">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="#fff" />
        <circle cx="12" cy="12" r="8" fill="#F87171" />
        <circle cx="16" cy="8" r="3" fill="#FBBF24" />
      </svg>
    </span>
  ),
  onFileAttach,
  onVoiceInput
}: ChatInputProps & { onFileAttach?: (file: File) => void; onVoiceInput?: (text: string) => void }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '36px';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 100) + 'px';
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const handleSend = () => {
    if (value.trim() && !loading) {
      onSend();
      if (textareaRef.current) textareaRef.current.style.height = '36px';
    }
  };

  // File attach logic
  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileAttach) onFileAttach(file);
    e.target.value = '';
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && onFileAttach) onFileAttach(file);
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };
  const handleDragLeave = () => setDragActive(false);

  // Voice input logic
  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Ваш браузер не підтримує розпізнавання голосу');
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'uk-UA';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setIsRecording(true);
    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      if (onVoiceInput) onVoiceInput(text);
      setIsRecording(false);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    recognition.start();
  };

  // Focus textarea on prompt insert
  useEffect(() => {
    if (textareaRef.current && document.activeElement !== textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [value]);

  return (
    <div className={`w-full max-w-4xl mx-auto rounded-2xl bg-gray-50 dark:bg-dark-hover overflow-hidden relative shadow-sm border border-gray-200 dark:border-dark-border ${dragActive ? 'ring-2 ring-primary dark:ring-dark-primary' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* Main input area */}
      <div className="pt-3 px-4 pb-3 flex flex-col rounded-b-2xl bg-gray-50 dark:bg-dark-hover">
        <textarea
          ref={textareaRef}
          className="w-full bg-transparent outline-none text-sm placeholder:text-gray-500 dark:placeholder:text-gray-400 border-none resize-none min-h-[36px] max-h-[100px] leading-relaxed font-normal mb-2 text-gray-900 dark:text-dark-text focus:outline-none focus:ring-0"
          placeholder="Запитайте що-небудь..."
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={loading}
          rows={1}
          style={{fontFamily: 'inherit'}}
        />
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="flex flex-row items-center justify-between w-full mt-1">
          {/* File attach button (left) */}
          <button
            type="button"
            className={`w-8 h-8 flex items-center justify-center rounded-lg ${dragActive ? 'bg-primary-light dark:bg-dark-primary-light' : 'bg-gray-100 dark:bg-gray-800'} hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors`}
            aria-label="Attach file"
            tabIndex={-1}
            onClick={handleFileButtonClick}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
              <path d="M16.5 13.5V7.75C16.5 5.67893 14.8211 4 12.75 4C10.6789 4 9 5.67893 9 7.75V16.25C9 17.4926 10.0074 18.5 11.25 18.5C12.4926 18.5 13.5 17.4926 13.5 16.25V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {/* Voice and Send buttons (right) */}
          <div className="flex flex-row items-center gap-2">
            <button
              type="button"
              className={`w-8 h-8 flex items-center justify-center rounded-lg ${isRecording ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'} hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`}
              aria-label="Voice input"
              tabIndex={-1}
              onClick={handleVoiceInput}
              disabled={loading}
            >
              {isRecording ? (
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="8" fill="#60A5FA" />
                  <rect x="9" y="4" width="6" height="12" rx="3" fill="#fff" />
                  <path d="M5 11V12C5 15.3137 7.68629 18 11 18H13C16.3137 18 19 15.3137 19 12V11" stroke="#fff" strokeWidth="1.5" />
                </svg>
              ) : (
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                  <rect x="9" y="4" width="6" height="12" rx="3" fill="currentColor" />
                  <path d="M5 11V12C5 15.3137 7.68629 18 11 18H13C16.3137 18 19 15.3137 19 12V11" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              )}
            </button>
            <button
              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ml-0
                ${value.trim() && !loading ? 'bg-primary dark:bg-dark-primary hover:bg-primary-hover dark:hover:bg-dark-primary-hover' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-500'}`}
              onClick={handleSend}
              disabled={!value.trim() || loading}
              aria-label="Send"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M3 20L21 12L3 4V10L17 12L3 14V20Z" 
                  stroke={value.trim() && !loading ? '#fff' : '#9ca3af'} 
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </button>
          </div>
        </div>
        {error && (
          <div className="mt-2 text-red-500 dark:text-red-400 text-xs flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}
      </div>
    </div>
  );
} 