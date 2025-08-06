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
      summary: t('insufficientDataForSummary'),
      estimate: t('insufficientDataForEstimate'),
      highlights: t('insufficientDataForAnalysis'),
      notes: t('waitingForClientResponses')
    };
  }

  const allText = messages.map(msg => msg.content || msg.text || msg.message || '').join(' ').toLowerCase();

  // Визначаємо тип проекту та опис
  let projectType = t('softwareProduct');
  let projectDescription = t('softwareDevelopment');

  if (allText.includes('мобільн') || allText.includes('app') || allText.includes('додаток') || allText.includes('ios') || allText.includes('android')) {
    projectType = t('mobileApp');
    projectDescription = t('mobileAppDevelopment');
  } else if (allText.includes('веб') || allText.includes('сайт') || allText.includes('web') || allText.includes('інтернет')) {
    projectType = t('website');
    projectDescription = t('websiteDevelopment');
  } else if (allText.includes('платформ') || allText.includes('стрімер') || allText.includes('twitch') || allText.includes('streaming')) {
    projectType = t('streamingPlatform');
    projectDescription = t('streamingPlatformDevelopment');
  } else if (allText.includes('ecommerce') || allText.includes('магазин') || allText.includes('онлайн') || allText.includes('продаж')) {
    projectType = t('ecommercePlatform');
    projectDescription = t('ecommercePlatformDevelopment');
  } else if (allText.includes('ai') || allText.includes('машинн') || allText.includes('ml') || allText.includes('штучн')) {
    projectType = t('aiMlProject');
    projectDescription = t('aiMlDevelopment');
  } else {
    projectType = t('softwareProduct');
    projectDescription = t('softwareDevelopment');
  }

  // Визначаємо складність та оцінку
  let complexity = t('medium');
  let timeEstimate = t('timeEstimate2to3');
  let budget = '15,000 - 25,000 USD';
  let services = t('servicesUxUiDevelopmentTesting');

  if (allText.includes('ai') || allText.includes('машинн') || allText.includes('ml') || allText.includes('штучн')) {
    complexity = t('veryHigh');
    timeEstimate = t('timeEstimate8to12');
    budget = '50,000 - 100,000 USD';
    services = t('servicesAiMlUxUiIntegrationTesting');
  } else if (allText.includes('відео') || allText.includes('стрім') || allText.includes('streaming') || allText.includes('twitch')) {
    complexity = t('high');
    timeEstimate = t('timeEstimate6to9');
    budget = '35,000 - 60,000 USD';
    services = t('servicesVideoUxUiServerTesting');
  } else if (allText.includes('платіж') || allText.includes('банк') || allText.includes('фінанс') || allText.includes('stripe')) {
    complexity = t('high');
    timeEstimate = t('timeEstimate4to6');
    budget = '25,000 - 45,000 USD';
    services = t('servicesFinancialUxUiSecurityTesting');
  } else if (allText.includes('мобільн') || allText.includes('app') || allText.includes('ios') || allText.includes('android')) {
    complexity = t('high');
    timeEstimate = t('timeEstimate3to5');
    budget = '20,000 - 40,000 USD';
    services = t('servicesMobileUxUiTestingPublishing');
  } else if (allText.includes('ecommerce') || allText.includes('магазин') || allText.includes('онлайн')) {
    complexity = t('medium');
    timeEstimate = t('timeEstimate3to4');
    budget = '18,000 - 30,000 USD';
    services = t('servicesEcommerceUxUiPaymentIntegration');
  }

  // Генеруємо детальне зведення
  const summary = `${t('clientInterestedIn')} ${projectDescription}. ${allText.includes('ux') || allText.includes('дизайн') || allText.includes('ui') ? t('specialAttentionToUxUi') : ''} ${allText.includes('конкурент') || allText.includes('twitch') || allText.includes('youtube') ? t('competitiveAdvantagesDefined') : ''} ${allText.includes('масштаб') || allText.includes('велик') ? t('projectHasScalingPotential') : ''}`;

  // Генеруємо детальну оцінку
  const estimate = `${t('approximateDevelopmentTime')}: ${timeEstimate}. ${t('complexity')}: ${complexity}. ${t('budget')}: ${budget}. ${t('services')}: ${services}.`;

  // Генеруємо ключові моменти
  const highlights = [];
  if (allText.includes('аудиторі') || allText.includes('користувач') || allText.includes('цільов')) highlights.push(`• ${t('targetAudienceDefined')}`);
  if (allText.includes('конкурент') || allText.includes('twitch') || allText.includes('youtube') || allText.includes('ринок')) highlights.push(`• ${t('competitorAnalysisConducted')}`);
  if (allText.includes('технічн') || allText.includes('технологі') || allText.includes('архітектур')) highlights.push(`• ${t('technicalArchitectureDefined')}`);
  if (allText.includes('бюджет') || allText.includes('кошт') || allText.includes('фінанс')) highlights.push(`• ${t('budgetDiscussed')}`);
  if (allText.includes('термін') || allText.includes('час') || allText.includes('deadline')) highlights.push(`• ${t('timelineDefined')}`);
  if (allText.includes('масштаб') || allText.includes('рост') || allText.includes('розвиток')) highlights.push(`• ${t('scalingPlanDefined')}`);
  if (allText.includes('дизайн') || allText.includes('ui') || allText.includes('ux')) highlights.push(`• ${t('specialAttentionToDesign')}`);
  if (highlights.length === 0) highlights.push(`• ${t('needToDetailRequirements')}`);

  // Генеруємо розумні замітки AI
  const notes = [];
  if (messages.length > 5) notes.push(`✅ ${t('clientActivelyInteracts')}`);
  if (allText.includes('баченн') || allText.includes('ідея') || allText.includes('концепці')) notes.push(`✅ ${t('hasClearVision')}`);
  if (allText.includes('конкурент') || allText.includes('ринок') || allText.includes('аудиторі')) notes.push(`✅ ${t('understandsCompetitiveAdvantages')}`);
  if (allText.includes('дизайн') || allText.includes('ui') || allText.includes('ux')) notes.push(`✅ ${t('valuesQualityDesign')}`);
  if (allText.includes('масштаб') || allText.includes('рост') || allText.includes('розвиток')) notes.push(`✅ ${t('thinksAboutFuture')}`);
  if (!allText.includes('бюджет') && !allText.includes('кошт') && !allText.includes('фінанс')) notes.push(`⚠️ ${t('needToDiscussBudget')}`);
  if (!allText.includes('термін') && !allText.includes('час') && !allText.includes('deadline')) notes.push(`⚠️ ${t('needToDefineTimeline')}`);
  if (messages.length < 3) notes.push(`⚠️ ${t('needMoreInformation')}`);

  return {
    summary,
    estimate,
    highlights: highlights.join('\n'),
    notes: notes.join('\n')
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
  const [generatedReports, setGeneratedReports] = useState<{[key: string]: boolean}>({});
  
  const handleGenerateReport = () => {
    if (!selectedSessionId) return;
    
    // Якщо звіт вже згенерований для цієї сесії, просто показуємо його
    if (generatedReports[selectedSessionId]) {
      setShowDetails(true);
      return;
    }
    
    // Інакше генеруємо новий звіт
    setIsAnalyzing(true);
    setShowDetails(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      // Позначаємо що звіт згенерований для цієї сесії
      setGeneratedReports(prev => ({
        ...prev,
        [selectedSessionId]: true
      }));
    }, 2000);
  };

  // Функції для експорту
  const exportToPDF = () => {
    if (selectedSession) {
      const sessionData = analyzeMessages(selectedSession.messages, t);
      const content = `
Session Details Report
====================

Session Information:
- ID: ${selectedSession.id}
- Client: ${selectedSession.metadata?.userName}
- Email: ${selectedSession.metadata?.userEmail}
- Created: ${selectedSession.createdAt?.toDate?.() ? selectedSession.createdAt.toDate().toLocaleString() : '—'}
- Messages: ${selectedSession.messages?.length || 0}

Auto-summary:
${sessionData.summary}

Estimate:
${sessionData.estimate}

Research Highlights:
${sessionData.highlights}

AI Notes:
${sessionData.notes}
      `;
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `session-${selectedSession.id}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const exportToCSV = () => {
    if (selectedSession) {
      const sessionData = analyzeMessages(selectedSession.messages, t);
      const csvContent = `Session ID,Client,Email,Created,Messages,Summary,Estimate,Highlights,Notes
"${selectedSession.id}","${selectedSession.metadata?.userName}","${selectedSession.metadata?.userEmail}","${selectedSession.createdAt?.toDate?.() ? selectedSession.createdAt.toDate().toLocaleString() : '—'}","${selectedSession.messages?.length || 0}","${sessionData.summary.replace(/"/g, '""')}","${sessionData.estimate.replace(/"/g, '""')}","${sessionData.highlights.replace(/"/g, '""')}","${sessionData.notes.replace(/"/g, '""')}"`;
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `session-${selectedSession.id}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const exportToExcel = () => {
    // Для Excel використовуємо CSV формат (Excel може його відкрити)
    exportToCSV();
  };

  const generateEmailDraft = () => {
    if (selectedSession) {
      const sessionData = analyzeMessages(selectedSession.messages, t);
      const emailContent = `
Тема: Оновлення по проекту - ${selectedSession.metadata?.userName}

Шановний ${selectedSession.metadata?.userName},

Дякуємо за ваш інтерес до наших послуг! Ось короткий звіт по нашій сесії:

${sessionData.summary}

${sessionData.estimate}

Ключові моменти:
${sessionData.highlights}

Наступні кроки:
${sessionData.notes}

Готові обговорити деталі та почати роботу!

З повагою,
Команда розробки
      `;
      
      const blob = new Blob([emailContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `email-draft-${selectedSession.id}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
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
    // Очищуємо згенеровані звіти при зміні сесії
    setGeneratedReports({});
  }, [selectedSessionId]);

  const [showSidebar, setShowSidebar] = useState(false);



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
                      className={`px-4 sm:px-6 py-2 rounded-lg transition-colors text-sm sm:text-base font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                        generatedReports[selectedSessionId || ''] 
                          ? 'bg-green-600 hover:bg-green-700 text-white' 
                          : 'bg-[#651FFF] hover:bg-[#5A1BE0] text-white'
                      }`}
                      onClick={handleGenerateReport}
                      disabled={!selectedSessionId}
                    >
                      {generatedReports[selectedSessionId || ''] ? t('showReport') : t('generateReport')}
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
                  <div className="p-6 h-full flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Session Details
                      </h2>
                      <button 
                        onClick={() => setShowDetails(false)}
                        className="p-2 text-gray-600 hover:text-red-500 dark:text-dark-text-muted dark:hover:text-red-400 transition-colors"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {isAnalyzing ? (
                      // Лоадинг анімація
                      <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                        <div className="relative">
                          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                          </div>
                        </div>
                        <div className="text-center space-y-2">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{t('analyzingSession')}</h3>
                          <p className="text-gray-600 dark:text-dark-text-muted">{t('generatingSummaryAndEstimate')}</p>
                        </div>
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    ) : (
                      // Результати аналізу
                      <div className="flex-1 overflow-y-auto space-y-6 animate-fadeIn">
                        {/* Session Info */}
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-dark-bg dark:to-dark-hover rounded-xl p-4 border border-purple-100 dark:border-dark-border">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {t('sessionInformation')}
                          </h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between items-center py-2 border-b border-purple-100 dark:border-dark-border">
                              <span className="text-gray-600 dark:text-dark-text-muted font-medium">{t('sessionId')}:</span>
                              <span className="font-mono text-gray-900 dark:text-white bg-gray-100 dark:bg-dark-hover px-2 py-1 rounded">{selectedSession?.id}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-purple-100 dark:border-dark-border">
                              <span className="text-gray-600 dark:text-dark-text-muted font-medium">{t('clientName')}:</span>
                              <span className="text-gray-900 dark:text-white font-medium">{selectedSession?.metadata?.userName}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-purple-100 dark:border-dark-border">
                              <span className="text-gray-600 dark:text-dark-text-muted font-medium">{t('email')}:</span>
                              <span className="text-gray-900 dark:text-white">{selectedSession?.metadata?.userEmail}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-purple-100 dark:border-dark-border">
                              <span className="text-gray-600 dark:text-dark-text-muted font-medium">{t('createdDate')}:</span>
                              <span className="text-gray-900 dark:text-white">
                                {selectedSession?.createdAt?.toDate?.() ? selectedSession.createdAt.toDate().toLocaleString() : '—'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                              <span className="text-gray-600 dark:text-dark-text-muted font-medium">{t('totalMessages')}:</span>
                              <span className="bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400 px-3 py-1 rounded-full font-medium">
                                {selectedSession?.messages?.length || 0}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Auto-summary */}
                        <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                          <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400 mb-3 flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {t('autoSummary')}
                          </h3>
                          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-dark-bg dark:to-dark-hover rounded-lg p-4 min-h-[80px] border-l-4 border-purple-500">
                            <p className="text-gray-700 dark:text-dark-text leading-relaxed">
                              {analyzeMessages(selectedSession?.messages || [], t).summary}
                            </p>
                          </div>
                        </div>

                        {/* Estimate */}
                        <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                          <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400 mb-3 flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                            {t('estimate')}
                          </h3>
                          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-dark-bg dark:to-dark-hover rounded-lg p-4 min-h-[80px] border-l-4 border-green-500">
                            <p className="text-gray-700 dark:text-dark-text leading-relaxed">
                              {analyzeMessages(selectedSession?.messages || [], t).estimate}
                            </p>
                          </div>
                        </div>

                        {/* Research Highlights */}
                        <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                          <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400 mb-3 flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            {t('researchHighlights')}
                          </h3>
                          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-dark-bg dark:to-dark-hover rounded-lg p-4 min-h-[80px] border-l-4 border-yellow-500">
                            <p className="text-gray-700 dark:text-dark-text whitespace-pre-line leading-relaxed">
                              {analyzeMessages(selectedSession?.messages || [], t).highlights}
                            </p>
                          </div>
                        </div>

                        {/* AI Notes */}
                        <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                          <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400 mb-3 flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            AI Notes
                          </h3>
                          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-dark-bg dark:to-dark-hover rounded-lg p-4 min-h-[80px] border-l-4 border-purple-500">
                            <p className="text-gray-700 dark:text-dark-text whitespace-pre-line leading-relaxed">
                              {analyzeMessages(selectedSession?.messages || [], t).notes}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Export Buttons */}
                    {!isAnalyzing && (
                      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-dark-border animate-fadeIn">
                        <div className="flex gap-3 flex-wrap">
                          <button onClick={exportToPDF} className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-lg">
                            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {t('exportPDF')}
                          </button>
                          <button onClick={exportToCSV} className="border border-gray-300 dark:border-dark-border text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-hover px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105">
                            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {t('exportCSV')}
                          </button>
                          <button onClick={exportToExcel} className="border border-gray-300 dark:border-dark-border text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-hover px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105">
                            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {t('exportExcel')}
                          </button>
                          <button onClick={generateEmailDraft} className="border border-gray-300 dark:border-dark-border text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-hover px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105">
                            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {t('generateEmailDraft')}
                          </button>
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