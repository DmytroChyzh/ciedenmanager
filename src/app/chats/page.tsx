"use client";
import ChatList from '@/components/ChatList';
import React, { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserCircleIcon, SparklesIcon } from '@heroicons/react/24/solid';
import SalesChatView from '@/components/SalesChatView';
import { useLanguage } from '@/contexts/LanguageContext';

function ChatView({ sessionId }: { sessionId?: string }) {
  const { t } = useLanguage();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    setLoading(true);
    const unsub = onSnapshot(doc(db, 'chatSessions', sessionId), (docSnap) => {
      setSession(docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null);
      setLoading(false);
    });
    return () => unsub();
  }, [sessionId]);

  if (!sessionId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl mb-2">✨</div>
          <div className="font-bold text-xl mb-1">{t('selectSessionToStart')}</div>
          <div className="text-gray-500">{t('selectClientFromList')}</div>
        </div>
      </div>
    );
  }
  if (loading) {
    return <div className="flex-1 flex items-center justify-center text-gray-400">{t('loading')}</div>;
  }
  if (!session) {
    return <div className="flex-1 flex items-center justify-center text-gray-400">{t('sessionNotFound')}</div>;
  }
  let messages: any[] = [];
  if (Array.isArray(session.messages)) {
    messages = session.messages;
  } else if (session.messages && typeof session.messages === 'object') {
    messages = Object.values(session.messages);
  }
  return (
    <div className="flex-1 min-h-0 flex flex-col h-full w-full">
      <div className="flex-1 min-h-0 flex flex-col gap-4 w-full">
        {Array.isArray(messages) && messages.length > 0 ? (
          messages.map((msg: any, idx: number) => {
            const isClient = msg.role === 'user';
            const isManager = msg.role === 'manager';
            const isAI = msg.role === 'assistant';
            return (
              <div key={idx} className={`flex w-full ${isClient ? 'justify-start' : 'justify-end'}`}> 
                <div className={`flex items-end gap-2 ${isClient ? '' : 'flex-row-reverse'} w-full`}>
                  {isClient ? (
                    <span className="flex-shrink-0"><UserCircleIcon className="w-7 h-7 text-gray-400"/></span>
                  ) : (
                    <span className="flex-shrink-0"><SparklesIcon className="w-7 h-7 text-[#651FFF]"/></span>
                  )}
                  <div
                    className={
                      isClient
                        ? 'bg-white border border-[#ede7ff] rounded-2xl px-4 py-2 text-sm text-gray-900 shadow-sm'
                        : 'bg-[#ede7ff] rounded-2xl px-4 py-2 text-sm text-[#651FFF] shadow-sm'
                    }
                    style={{maxWidth: '80%'}}
                  >
                    <div className={`text-xs mb-1 ${isClient ? 'text-gray-500' : 'text-[#651FFF] font-semibold'}`}>
                      {isClient ? t('client') : isManager ? t('manager') : t('ai')}
                      {msg.timestamp?.toDate ? ' · ' + msg.timestamp.toDate().toLocaleString('uk-UA') : ''}
                    </div>
                    {msg.text || msg.content || msg.message || <span className="italic text-gray-400">{t('noText')}</span>}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">{t('noMessages')}</div>
        )}
      </div>
    </div>
  );
}

export default function ChatsPage() {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);
  const { t } = useLanguage();
  const [selectedSessionId, setSelectedSessionId] = useState<string | undefined>(undefined);
  const [showDetails, setShowDetails] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const handleGenerateReport = () => {
    setLoadingDetails(true);
    setTimeout(() => {
      setLoadingDetails(false);
      setShowDetails(true);
    }, 1500);
  };
  // Додатково: знайти дані про вибрану сесію для хедера
  const [selectedSession, setSelectedSession] = useState<any>(null);
  useEffect(() => {
    if (!selectedSessionId) { setSelectedSession(null); return; }
    const unsub = onSnapshot(doc(db, 'chatSessions', selectedSessionId), (docSnap) => {
      setSelectedSession(docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null);
    });
    return () => unsub();
  }, [selectedSessionId]);

  useEffect(() => {
    setShowDetails(false);
    setLoadingDetails(false);
  }, [selectedSessionId]);

  return (
    <div className="min-h-screen bg-[#F7F8F9] flex">
      <div className="flex-1 flex flex-col h-full min-h-0">
        <main className="flex-1 h-full min-h-0">
          <div className="bg-white rounded-2xl flex flex-col h-[85vh] min-h-[500px] w-full overflow-hidden">
            {/* Основний flex-контейнер */}
            <div className="flex flex-1 min-h-0 h-full w-full">
              <div className="h-full border-r border-gray-200 flex-shrink-0">
                <ChatList selectedSessionId={selectedSessionId} onSelect={id => { setSelectedSessionId(id); setShowDetails(false); }} hideHeader />
              </div>
              <div className="flex-1 flex flex-col min-w-0 h-full min-h-0">
                {/* Центральний хедер */}
                <div className="flex items-center justify-between w-full border-b border-gray-200 px-6 py-6 gap-6 bg-white" style={{minHeight: '96px'}}>
                  <div className="flex items-center gap-2 min-w-[220px]">
                    {/* <h2 className="text-xl font-bold text-[#651FFF]">Чат-сесії</h2> */}
                    {/* Якщо треба залишити тільки лічильник, розкоментуй наступний рядок: */}
                    {/* <span className="text-sm text-gray-500 font-semibold">{{sessions.length}} активних</span> */}
                  </div>
                  <div className="flex flex-col items-center flex-1 min-w-0">
                    <div className="font-bold text-lg text-[#651FFF] truncate w-full text-center">{selectedSession ? `${t('chatWith')} ${selectedSession.metadata?.userName || '—'}` : t('selectChat')}</div>
                    <div className="text-xs text-gray-500 truncate w-full text-center">{selectedSession?.metadata?.userEmail || ''}</div>
                  </div>
                  <div className="flex items-center min-w-[180px] justify-end">
                    <button
                      className="bg-[#651FFF] text-white px-5 py-2 rounded-lg hover:bg-[#5A1BE0] transition-colors text-base font-semibold shadow-sm"
                      onClick={handleGenerateReport}
                      disabled={!selectedSessionId}
                    >
                      {t('generateReport')}
                    </button>
                  </div>
                </div>
                {/* Чат */}
                {showDetails && selectedSessionId ? (
                  <div className="flex-1 min-h-0 flex flex-col px-6 py-4 justify-center h-full">
                    <ChatView sessionId={selectedSessionId} />
                  </div>
                ) : (
                  <div className="flex-1 min-h-0 flex flex-col px-6 py-4 justify-center h-full">
                    <ChatView sessionId={selectedSessionId} />
                  </div>
                )}
              </div>
              {loadingDetails && selectedSessionId && (
                <div className="h-full flex flex-col w-[600px] max-w-[700px] min-w-[520px] flex-shrink-0 border-l border-[#ede7ff] items-center justify-center">
                  <div className="flex flex-col items-center justify-center h-full w-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#651FFF] mb-4"></div>
                    <div className="text-[#651FFF] font-semibold text-lg">{t('generatingReport')}</div>
                  </div>
                </div>
              )}
              {showDetails && selectedSessionId && !loadingDetails && (
                <div className="h-full flex flex-col w-[600px] max-w-[700px] min-w-[520px] flex-shrink-0 border-l border-[#ede7ff]">
                  <SalesChatView sessionId={selectedSessionId} rounded={false} />
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 