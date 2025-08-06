"use client";
import ChatList from '@/components/ChatList';
import React, { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserCircleIcon, SparklesIcon } from '@heroicons/react/24/solid';
import SalesChatView from '@/components/SalesChatView';
import { useLanguage } from '@/contexts/LanguageContext';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

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

// Функція для аналізу повідомлень (як на дашборді)
function analyzeMessages(messages: any[], t: any) {
  if (!messages || messages.length === 0) {
    return {
      projectType: t('noData'),
      complexity: t('noData'),
      timeEstimate: t('noData'),
      services: [],
      highlights: [],
      aiNotes: []
    };
  }

  const clientMessages = messages.filter(msg => msg.role === 'user');
  const aiMessages = messages.filter(msg => msg.role === 'assistant');
  
  const allText = messages.map(msg => msg.text || msg.content || msg.message || '').join(' ').toLowerCase();
  
  // Визначення типу проекту
  let projectType = t('webDevelopment');
  if (allText.includes('мобільн') || allText.includes('app') || allText.includes('ios') || allText.includes('android')) {
    projectType = t('mobileDevelopment');
  } else if (allText.includes('сайт') || allText.includes('веб') || allText.includes('web')) {
    projectType = t('webDevelopment');
  } else if (allText.includes('дизайн') || allText.includes('ui') || allText.includes('ux')) {
    projectType = t('uiUxDesign');
  }

  // Визначення складності
  let complexity = t('mediumComplexity');
  if (allText.includes('простий') || allText.includes('базовий')) {
    complexity = t('lowComplexity');
  } else if (allText.includes('складний') || allText.includes('складна') || allText.includes('просунутий')) {
    complexity = t('highComplexity');
  }

  // Оцінка часу
  let timeEstimate = '2-3 тижні';
  if (complexity === t('lowComplexity')) {
    timeEstimate = '1-2 тижні';
  } else if (complexity === t('highComplexity')) {
    timeEstimate = '4-6 тижнів';
  }

  // Послуги
  const services = [];
  if (allText.includes('авторизаці') || allText.includes('логін')) services.push(t('userAuthentication'));
  if (allText.includes('калькулятор') || allText.includes('розрахунок')) services.push(t('calculatorFeature'));
  if (allText.includes('каталог') || allText.includes('продукт')) services.push(t('productCatalog'));
  if (allText.includes('платеж') || allText.includes('оплата')) services.push(t('paymentIntegration'));
  if (allText.includes('сповіщення') || allText.includes('push')) services.push(t('pushNotifications'));
  if (services.length === 0) services.push(t('basicDevelopment'));

  // Основні моменти
  const highlights = [];
  if (clientMessages.length > 0) highlights.push(t('clientRequirementsAnalyzed'));
  if (aiMessages.length > 0) highlights.push(t('technicalSolutionsProposed'));
  if (allText.includes('дизайн')) highlights.push(t('designRecommendations'));
  if (allText.includes('функціональність')) highlights.push(t('functionalityDiscussed'));

  // AI нотатки
  const aiNotes = [];
  if (clientMessages.length > 0) aiNotes.push(t('clientNeedsIdentified'));
  if (allText.includes('бюджет') || allText.includes('вартість')) aiNotes.push(t('budgetConsiderations'));
  if (allText.includes('термін') || allText.includes('час')) aiNotes.push(t('timelineDiscussed'));
  if (allText.includes('технологі')) aiNotes.push(t('technologyStackDiscussed'));

  return {
    projectType,
    complexity,
    timeEstimate,
    services,
    highlights,
    aiNotes
  };
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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const handleGenerateReport = () => {
    setIsAnalyzing(true);
    setShowDetails(true);
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 2000);
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
    setIsAnalyzing(false);
  }, [selectedSessionId]);

  const [showSidebar, setShowSidebar] = useState(false);

  // Аналіз повідомлень для Session Details
  const analysis = selectedSession?.messages ? analyzeMessages(selectedSession.messages, t) : null;

  return (
    <div className="min-h-0 flex-1 flex flex-col md:flex-row bg-[#F7F8F9]" style={{height: '100vh'}}>
      {/* Sidebar для мобільних */}
      <div className="block md:hidden w-full">
        <button
          className="fixed top-4 left-4 z-30 bg-white border border-gray-200 rounded-full p-2 shadow-md md:hidden"
          onClick={() => setShowSidebar(true)}
          aria-label="Відкрити меню"
        >
          <Bars3Icon className="w-7 h-7 text-[#651FFF]" />
        </button>
        {showSidebar && (
          <div className="fixed inset-0 z-40 bg-black bg-opacity-30 flex">
            <aside className="w-72 max-w-[90vw] h-full bg-white border-r border-gray-200 flex flex-col animate-slideInLeft">
              <div className="flex items-center justify-between px-6 py-6 border-b border-gray-200">
                <span className="font-bold text-xl text-[#651FFF]">{t('chats')}</span>
                <button onClick={() => setShowSidebar(false)} className="text-gray-400 hover:text-gray-700 p-2 rounded-full">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <ChatList selectedSessionId={selectedSessionId} onSelect={id => { setSelectedSessionId(id); setShowDetails(false); setShowSidebar(false); }} hideHeader />
              </div>
            </aside>
            <div className="flex-1" onClick={() => setShowSidebar(false)} />
          </div>
        )}
      </div>
      {/* Main content */}
      <div className="flex-1 flex flex-col h-full min-h-0">
        <main className="flex-1 h-full min-h-0">
          <div className="bg-white rounded-2xl flex flex-col h-full min-h-0 w-full overflow-hidden">
            <div className="flex flex-col md:flex-row flex-1 min-h-0 h-full w-full">
              {/* Sidebar для desktop/tablet */}
              <div className="hidden md:block h-full border-r border-gray-200 flex-shrink-0 min-w-[350px] max-w-[500px] w-[400px]">
                <ChatList selectedSessionId={selectedSessionId} onSelect={id => { setSelectedSessionId(id); setShowDetails(false); }} hideHeader />
              </div>
              <div className="flex-1 flex flex-col min-w-0 h-full min-h-0">
                {/* Виправлений хедер */}
                <div className="flex items-center justify-between w-full border-b border-gray-200 px-4 sm:px-6 py-4 sm:py-6 gap-4 sm:gap-6 bg-white" style={{minHeight: '72px'}}>
                  <div className="flex items-center gap-2 min-w-[120px] sm:min-w-[180px]">
                    {selectedSession && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#651FFF] flex items-center justify-center">
                          <UserCircleIcon className="w-6 h-6 text-white" />
                        </div>
                        <div className="hidden sm:block">
                          <div className="font-semibold text-sm text-gray-900">{selectedSession.metadata?.userName || '—'}</div>
                          <div className="text-xs text-gray-500">{selectedSession.metadata?.userEmail || '—'}</div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-center flex-1 min-w-0">
                    <div className="font-bold text-base sm:text-lg text-[#651FFF] truncate w-full text-center">
                      {selectedSession ? `${t('chatWith')} ${selectedSession.metadata?.userName || '—'}` : t('selectChat')}
                    </div>
                    <div className="text-xs text-gray-500 truncate w-full text-center">
                      {selectedSession?.metadata?.userEmail || ''}
                    </div>
                  </div>
                  <div className="flex items-center min-w-[120px] sm:min-w-[180px] justify-end">
                    <button
                      className="bg-[#651FFF] text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-[#5A1BE0] transition-colors text-sm sm:text-base font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleGenerateReport}
                      disabled={!selectedSessionId}
                    >
                      {t('generateReport')}
                    </button>
                  </div>
                </div>
                {/* Чат */}
                <div className="flex-1 min-h-0 flex flex-col px-4 sm:px-6 py-4 sm:py-6 justify-center h-full overflow-y-auto">
                  <ChatView sessionId={selectedSessionId} />
                </div>
              </div>
              {/* Session Details блок */}
              {showDetails && selectedSessionId && (
                <div className="hidden md:flex h-full flex-col w-[450px] lg:w-[550px] xl:w-[650px] max-w-[90vw] flex-shrink-0 border-l border-[#ede7ff] bg-white">
                  <div className="flex-1 overflow-y-auto p-6">
                    {isAnalyzing ? (
                      <div className="flex flex-col items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#651FFF] mb-4"></div>
                        <div className="text-[#651FFF] font-semibold text-lg mb-2">{t('analyzingSession')}</div>
                        <div className="text-gray-500 text-sm text-center">{t('generatingInsights')}</div>
                        <div className="flex space-x-1 mt-4">
                          <div className="w-2 h-2 bg-[#651FFF] rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-[#651FFF] rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-[#651FFF] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    ) : (
                      <div className="animate-fadeIn">
                        {/* Session Information */}
                        <div className="mb-6">
                          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <div className="w-2 h-2 bg-[#651FFF] rounded-full"></div>
                            {t('sessionInformation')}
                          </h3>
                          <div className="bg-gradient-to-r from-[#ede7ff] to-[#f5f3ff] rounded-xl p-4 space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">{t('sessionId')}:</span>
                              <span className="text-sm font-mono text-gray-800">{selectedSession?.id || '—'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">{t('clientName')}:</span>
                              <span className="text-sm font-medium text-gray-800">{selectedSession?.metadata?.userName || '—'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">{t('email')}:</span>
                              <span className="text-sm font-medium text-gray-800">{selectedSession?.metadata?.userEmail || '—'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">{t('messagesCount')}:</span>
                              <span className="text-sm font-medium text-gray-800">{selectedSession?.messages?.length || 0}</span>
                            </div>
                          </div>
                        </div>

                        {/* Auto-summary */}
                        {analysis && (
                          <>
                            <div className="mb-6">
                              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                {t('autoSummary')}
                              </h3>
                              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 space-y-3">
                                <div>
                                  <span className="text-sm text-gray-600">{t('projectType')}:</span>
                                  <div className="text-sm font-medium text-gray-800 mt-1">{analysis.projectType}</div>
                                </div>
                                <div>
                                  <span className="text-sm text-gray-600">{t('complexity')}:</span>
                                  <div className="text-sm font-medium text-gray-800 mt-1">{analysis.complexity}</div>
                                </div>
                                <div>
                                  <span className="text-sm text-gray-600">{t('timeEstimate')}:</span>
                                  <div className="text-sm font-medium text-gray-800 mt-1">{analysis.timeEstimate}</div>
                                </div>
                              </div>
                            </div>

                            {/* Services */}
                            <div className="mb-6">
                              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                {t('services')}
                              </h3>
                              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                                <div className="flex flex-wrap gap-2">
                                  {analysis.services.map((service, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                      {service}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Research Highlights */}
                            <div className="mb-6">
                              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                {t('researchHighlights')}
                              </h3>
                              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
                                <ul className="space-y-2">
                                  {analysis.highlights.map((highlight, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                                      <span className="text-sm text-gray-700">{highlight}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            {/* AI Notes */}
                            <div className="mb-6">
                              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                {t('aiNotes')}
                              </h3>
                              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4">
                                <ul className="space-y-2">
                                  {analysis.aiNotes.map((note, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                                      <span className="text-sm text-gray-700">{note}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </>
                        )}

                        {/* Export Buttons */}
                        <div className="mt-8">
                          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                            {t('exportOptions')}
                          </h3>
                          <div className="grid grid-cols-2 gap-3">
                            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors text-sm font-medium">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              {t('exportPDF')}
                            </button>
                            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors text-sm font-medium">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              {t('exportCSV')}
                            </button>
                            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors text-sm font-medium">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              {t('exportExcel')}
                            </button>
                            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors text-sm font-medium">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              {t('emailDraft')}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 