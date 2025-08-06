"use client";
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { UserGroupIcon, ChatBubbleLeftRightIcon, BoltIcon } from '@heroicons/react/24/solid';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ChatSessionsTable from '@/components/ChatSessionsTable';
import SalesChatView from '@/components/SalesChatView';
import GraphCard from '@/components/GraphCard';
import UsersCountCard from '@/components/UsersCountCard';
import ActiveChatsCard from '@/components/ActiveChatsCard';
import ChatViewMini from '@/components/ChatViewMini';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

const ICON_CLASSES = 'w-5 h-5 text-primary dark:text-dark-primary';

export default function Dashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  
  // Стани для попапів
  const [showChatPopup, setShowChatPopup] = useState(false);
  const [selectedChatSession, setSelectedChatSession] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Стани періодів для кожної картки
  const [usersPeriod, setUsersPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [targetsPeriod, setTargetsPeriod] = useState<'week' | 'month' | 'year'>('week');

  useEffect(() => {
    async function fetchChatSessions() {
      setLoading(true);
      try {
        const q = query(collection(db, 'chatSessions'), orderBy('metadata.lastActivity', 'desc'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          contact: {
            name: doc.data().metadata?.userName || 'Невідомий',
            email: doc.data().metadata?.userEmail || 'no-email@example.com',
          },
          createdAt: doc.data().metadata?.startedAt,
          updatedAt: doc.data().metadata?.lastActivity,
          messages: doc.data().messages || [],
          projectCard: doc.data().projectCard,
        }));
        setChats(data);
      } catch (error) {
        console.error('❌ Помилка завантаження чат-сесій:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchChatSessions();
  }, []);

  const handleRowSelect = (sessionId: string) => {
    // Нічого не робимо при кліку по рядку
  };

  const handleGenerateReport = async (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setShowDetails(true);
    
    // Показуємо лоадинг
    setIsAnalyzing(true);
    setShowChatPopup(true);
    
    // Знаходимо сесію
    const session = chats.find(chat => chat.id === sessionId);
    setSelectedChatSession(session);
    
    // Симулюємо аналіз (2 секунди)
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 2000);
  };

  // Метрики для графіків з підтримкою періодів
  const getMetricData = (chats: any[], metric: 'users' | 'chats' | 'active', period: 'week' | 'month' | 'year' = 'week') => {
    const now = new Date();
    const timeData = [];
    
    if (period === 'week') {
      // Завжди показуємо з понеділка по неділю
      const weekDays = ['monShort','tueShort','wedShort','thuShort','friShort','satShort','sunShort'];
      
      // Знаходимо понеділок поточного тижня
      const currentDay = now.getDay(); // 0 = неділя, 1 = понеділок, ...
      const mondayOffset = currentDay === 0 ? 6 : currentDay - 1; // Скільки днів назад понеділок
      const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - mondayOffset);
      
      for (let i = 0; i < 7; i++) {
        const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
        timeData.push({
          day: weekDays[i], // Завжди понеділок-неділя
          date: d.toLocaleDateString(),
          value: 0
        });
      }
    } else if (period === 'month') {
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        timeData.push({
          day: d.getDate().toString(),
          date: d.toLocaleDateString(),
          value: 0
        });
      }
    } else { // year
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        timeData.push({
          day: d.toLocaleDateString('uk', { month: 'short' }),
          date: d.toLocaleDateString(),
          value: 0
        });
      }
    }

    if (metric === 'users') {
      timeData.forEach(w => {
        const emails = new Set();
        chats.forEach(chat => {
          const date = chat.createdAt?.toDate?.() ? chat.createdAt.toDate().toLocaleDateString() : '—';
          if (date === w.date) emails.add(chat.contact?.email);
        });
        w.value = emails.size;
      });
    } else if (metric === 'chats') {
      timeData.forEach(w => {
        w.value = chats.filter(chat => {
          const date = chat.createdAt?.toDate?.() ? chat.createdAt.toDate().toLocaleDateString() : '—';
          return date === w.date;
        }).length;
      });
    } else if (metric === 'active') {
      timeData.forEach(w => {
        w.value = chats.filter(chat => {
          const updated = chat.updatedAt?.toDate?.() || chat.createdAt?.toDate?.();
          const date = updated ? updated.toLocaleDateString() : '—';
          const now = new Date(w.date);
          return date === w.date && updated && (now.getTime() - updated.getTime() < 60 * 60 * 1000);
        }).length;
      });
    }
    return timeData;
  };

  const totalChats = chats.length;
  const totalUsers = Array.from(new Set(chats.map(chat => chat.contact?.email))).length;
  const now = Date.now();
  const activeChats = chats.filter(chat => {
    const updated = chat.updatedAt?.toDate?.() || chat.createdAt?.toDate?.();
    return updated && now - updated.getTime() < 60 * 60 * 1000;
  }).length;

  // Динаміка (для приросту) з підтримкою періодів
  const getGrowth = (data: any[]) => {
    if (data.length < 2) return 0;
    const prev = data[data.length - 2].value;
    const curr = data[data.length - 1].value;
    if (prev === 0) return curr === 0 ? 0 : 100;
    return Math.round(((curr - prev) / prev) * 100);
  };

  // Функції для аналізу повідомлень
  const analyzeMessages = (messages: any[]) => {
    if (!messages || messages.length === 0) {
      return {
        summary: "Недостатньо даних для генерації зведення",
        estimate: "Недостатньо даних для оцінки",
        highlights: "Недостатньо даних для аналізу",
        notes: "Очікування відповідей від клієнта"
      };
    }

    // Аналізуємо текст повідомлень
    const allText = messages.map(msg => msg.content || msg.text || msg.message || '').join(' ').toLowerCase();
    
    // Визначаємо тип проекту
    let projectType = '';
    let projectDescription = '';
    
    if (allText.includes('мобільн') || allText.includes('app') || allText.includes('додаток') || allText.includes('ios') || allText.includes('android')) {
      projectType = 'мобільний додаток';
      projectDescription = 'розробка мобільного додатку для iOS та/або Android';
    } else if (allText.includes('веб') || allText.includes('сайт') || allText.includes('web') || allText.includes('інтернет')) {
      projectType = 'веб-сайт';
      projectDescription = 'створення веб-сайту або веб-додатку';
    } else if (allText.includes('платформ') || allText.includes('стрімер') || allText.includes('twitch') || allText.includes('streaming')) {
      projectType = 'платформа для стрімерів';
      projectDescription = 'розробка платформи для відео-стрімінгу та взаємодії з аудиторією';
    } else if (allText.includes('ecommerce') || allText.includes('магазин') || allText.includes('онлайн') || allText.includes('продаж')) {
      projectType = 'e-commerce платформа';
      projectDescription = 'створення онлайн-магазину з системою платежів';
    } else if (allText.includes('ai') || allText.includes('машинн') || allText.includes('ml') || allText.includes('штучн')) {
      projectType = 'AI/ML проект';
      projectDescription = 'розробка системи з використанням штучного інтелекту';
    } else {
      projectType = 'програмний продукт';
      projectDescription = 'розробка програмного рішення';
    }

    // Визначаємо складність та оцінку
    let complexity = 'Середня';
    let timeEstimate = '2-3 місяці';
    let budget = '15,000 - 25,000 USD';
    let services = 'UX/UI дизайн, розробка, тестування';

    if (allText.includes('ai') || allText.includes('машинн') || allText.includes('ml') || allText.includes('штучн')) {
      complexity = 'Дуже висока';
      timeEstimate = '8-12 місяців';
      budget = '50,000 - 100,000 USD';
      services = 'AI/ML розробка, UX/UI дизайн, інтеграція, тестування';
    } else if (allText.includes('відео') || allText.includes('стрім') || allText.includes('streaming') || allText.includes('twitch')) {
      complexity = 'Висока';
      timeEstimate = '6-9 місяців';
      budget = '35,000 - 60,000 USD';
      services = 'Відео-розробка, UX/UI дизайн, серверна частина, тестування';
    } else if (allText.includes('платіж') || allText.includes('банк') || allText.includes('фінанс') || allText.includes('stripe')) {
      complexity = 'Висока';
      timeEstimate = '4-6 місяців';
      budget = '25,000 - 45,000 USD';
      services = 'Фінансова розробка, UX/UI дизайн, безпека, тестування';
    } else if (allText.includes('мобільн') || allText.includes('app') || allText.includes('ios') || allText.includes('android')) {
      complexity = 'Висока';
      timeEstimate = '3-5 місяців';
      budget = '20,000 - 40,000 USD';
      services = 'Мобільна розробка, UX/UI дизайн, тестування, публікація';
    } else if (allText.includes('ecommerce') || allText.includes('магазин') || allText.includes('онлайн')) {
      complexity = 'Середня';
      timeEstimate = '3-4 місяці';
      budget = '18,000 - 30,000 USD';
      services = 'E-commerce розробка, UX/UI дизайн, інтеграція платежів';
    }

    // Генеруємо детальне зведення
    const summary = `Клієнт зацікавлений у ${projectDescription}. ${allText.includes('ux') || allText.includes('дизайн') || allText.includes('ui') ? 'Особлива увага до UX/UI дизайну та користувацького досвіду.' : ''} ${allText.includes('конкурент') || allText.includes('twitch') || allText.includes('youtube') ? 'Визначені конкурентні переваги та цільова аудиторія.' : ''} ${allText.includes('масштаб') || allText.includes('велик') ? 'Проект має потенціал для масштабування.' : ''}`;

    // Генеруємо детальну оцінку
    const estimate = `Приблизний час розробки: ${timeEstimate}. Складність: ${complexity}. Бюджет: ${budget}. Послуги: ${services}.`;

    // Генеруємо ключові моменти
    const highlights = [];
    if (allText.includes('аудиторі') || allText.includes('користувач') || allText.includes('цільов')) highlights.push('• Визначена цільова аудиторія та користувачі');
    if (allText.includes('конкурент') || allText.includes('twitch') || allText.includes('youtube') || allText.includes('ринок')) highlights.push('• Проведений аналіз конкурентів та ринку');
    if (allText.includes('технічн') || allText.includes('технологі') || allText.includes('архітектур')) highlights.push('• Визначена технічна архітектура та вимоги');
    if (allText.includes('бюджет') || allText.includes('кошт') || allText.includes('фінанс')) highlights.push('• Обговорений бюджет та фінансові аспекти');
    if (allText.includes('термін') || allText.includes('час') || allText.includes('deadline')) highlights.push('• Визначені терміни та етапи розробки');
    if (allText.includes('масштаб') || allText.includes('рост') || allText.includes('розвиток')) highlights.push('• План масштабування та розвитку продукту');
    if (allText.includes('дизайн') || allText.includes('ui') || allText.includes('ux')) highlights.push('• Особлива увага до дизайну та користувацького досвіду');
    if (highlights.length === 0) highlights.push('• Потрібно деталізувати вимоги та цілі проекту');

    // Генеруємо розумні замітки AI
    const notes = [];
    if (messages.length > 5) notes.push('✅ Клієнт активно взаємодіє та надає детальну інформацію');
    if (allText.includes('баченн') || allText.includes('ідея') || allText.includes('концепці')) notes.push('✅ Має чітке бачення продукту та його призначення');
    if (allText.includes('конкурент') || allText.includes('ринок') || allText.includes('аудиторі')) notes.push('✅ Розуміє конкурентні переваги та цільову аудиторію');
    if (allText.includes('дизайн') || allText.includes('ui') || allText.includes('ux')) notes.push('✅ Цінує якісний дизайн та користувацький досвід');
    if (allText.includes('масштаб') || allText.includes('рост') || allText.includes('розвиток')) notes.push('✅ Думає про майбутнє та масштабування проекту');
    if (!allText.includes('бюджет') && !allText.includes('кошт') && !allText.includes('фінанс')) notes.push('⚠️ Потрібно обговорити бюджет та фінансування');
    if (!allText.includes('термін') && !allText.includes('час') && !allText.includes('deadline')) notes.push('⚠️ Визначити терміни та етапи проекту');
    if (messages.length < 3) notes.push('⚠️ Потрібно більше інформації для детального аналізу');

    return {
      summary,
      estimate,
      highlights: highlights.join('\n'),
      notes: notes.join('\n')
    };
  };

  // Функції для експорту
  const exportToPDF = () => {
    if (selectedChatSession) {
      const sessionData = analyzeMessages(selectedChatSession.messages);
      const content = `
Session Details Report
====================

Session Information:
- ID: ${selectedChatSession.id}
- Client: ${selectedChatSession.contact?.name}
- Email: ${selectedChatSession.contact?.email}
- Created: ${selectedChatSession.createdAt?.toDate?.() ? selectedChatSession.createdAt.toDate().toLocaleString() : '—'}
- Messages: ${selectedChatSession.messages?.length || 0}

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
      a.download = `session-${selectedChatSession.id}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const exportToCSV = () => {
    if (selectedChatSession) {
      const sessionData = analyzeMessages(selectedChatSession.messages);
      const csvContent = `Session ID,Client,Email,Created,Messages,Summary,Estimate,Highlights,Notes
"${selectedChatSession.id}","${selectedChatSession.contact?.name}","${selectedChatSession.contact?.email}","${selectedChatSession.createdAt?.toDate?.() ? selectedChatSession.createdAt.toDate().toLocaleString() : '—'}","${selectedChatSession.messages?.length || 0}","${sessionData.summary.replace(/"/g, '""')}","${sessionData.estimate.replace(/"/g, '""')}","${sessionData.highlights.replace(/"/g, '""')}","${sessionData.notes.replace(/"/g, '""')}"`;
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `session-${selectedChatSession.id}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const exportToExcel = () => {
    // Для Excel використовуємо CSV формат (Excel може його відкрити)
    exportToCSV();
  };

  const generateEmailDraft = () => {
    if (selectedChatSession) {
      const sessionData = analyzeMessages(selectedChatSession.messages);
      const emailContent = `
Тема: Оновлення по проекту - ${selectedChatSession.contact?.name}

Шановний ${selectedChatSession.contact?.name},

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
      a.download = `email-draft-${selectedChatSession.id}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // Фільтрована таблиця
  const filteredChats = chats.filter(chat =>
    chat.contact?.name?.toLowerCase().includes(search.toLowerCase()) ||
    chat.contact?.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary dark:border-dark-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col pb-6">
      {/* Основна область - вертикальний layout на мобільних */}
      <div className="flex flex-col gap-3 sm:gap-4 md:gap-5 lg:gap-6 flex-1 min-h-0">
        {/* Графіки - один під одним на мобільних */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6 flex-shrink-0">
          <UsersCountCard 
            value={totalUsers} 
            data={getMetricData(chats, 'users', usersPeriod)} 
            percent={getGrowth(getMetricData(chats, 'users', usersPeriod))}
            onPeriodChange={setUsersPeriod}
            currentPeriod={usersPeriod}
          />
          <ActiveChatsCard 
            value={activeChats} 
            percent={getGrowth(getMetricData(chats, 'active', targetsPeriod))}
            onPeriodChange={setTargetsPeriod}
            currentPeriod={targetsPeriod}
          />
        </div>
        
        {/* Таблиця чат-сесій - повна ширина */}
        <div className="flex-1 h-[840px] flex flex-col min-h-0">
          <div className="flex-1 flex flex-col min-h-0">
            <div className="h-full overflow-y-auto min-h-0">
              <ChatSessionsTable 
                sessions={filteredChats} 
                selectedSessionId={selectedSessionId} 
                onSelect={handleRowSelect} 
                onGenerateReport={handleGenerateReport}
              />
            </div>
          </div>
        </div>


        {/* Попап з Session Details - збоку справа */}
        {showChatPopup && selectedChatSession && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
            <div className="absolute right-0 top-0 h-full w-[600px] bg-white dark:bg-dark-card shadow-2xl transform transition-transform duration-300 ease-in-out">
              <div className="p-6 h-full flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Session Details
                  </h2>
                  <button 
                    onClick={() => setShowChatPopup(false)}
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
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Аналізуємо сесію...</h3>
                      <p className="text-gray-600 dark:text-dark-text-muted">Генеруємо зведення та оцінку проекту</p>
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
                        Session Information
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center py-2 border-b border-purple-100 dark:border-dark-border">
                          <span className="text-gray-600 dark:text-dark-text-muted font-medium">Session ID:</span>
                          <span className="font-mono text-gray-900 dark:text-white bg-gray-100 dark:bg-dark-hover px-2 py-1 rounded">{selectedChatSession.id}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-purple-100 dark:border-dark-border">
                          <span className="text-gray-600 dark:text-dark-text-muted font-medium">Client:</span>
                          <span className="text-gray-900 dark:text-white font-medium">{selectedChatSession.contact?.name}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-purple-100 dark:border-dark-border">
                          <span className="text-gray-600 dark:text-dark-text-muted font-medium">Email:</span>
                          <span className="text-gray-900 dark:text-white">{selectedChatSession.contact?.email}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-purple-100 dark:border-dark-border">
                          <span className="text-gray-600 dark:text-dark-text-muted font-medium">Created:</span>
                          <span className="text-gray-900 dark:text-white">
                            {selectedChatSession.createdAt?.toDate?.() ? selectedChatSession.createdAt.toDate().toLocaleString() : '—'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-600 dark:text-dark-text-muted font-medium">Messages:</span>
                          <span className="bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400 px-3 py-1 rounded-full font-medium">
                            {selectedChatSession.messages?.length || 0}
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
                        Auto-summary
                      </h3>
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-dark-bg dark:to-dark-hover rounded-lg p-4 min-h-[80px] border-l-4 border-purple-500">
                        <p className="text-gray-700 dark:text-dark-text leading-relaxed">
                          {analyzeMessages(selectedChatSession.messages).summary}
                        </p>
                      </div>
                    </div>

                    {/* Estimate */}
                    <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                      <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                        Estimate
                      </h3>
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-dark-bg dark:to-dark-hover rounded-lg p-4 min-h-[80px] border-l-4 border-green-500">
                        <p className="text-gray-700 dark:text-dark-text leading-relaxed">
                          {analyzeMessages(selectedChatSession.messages).estimate}
                        </p>
                      </div>
                    </div>

                    {/* Research Highlights */}
                    <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                      <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        Research Highlights
                      </h3>
                      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-dark-bg dark:to-dark-hover rounded-lg p-4 min-h-[80px] border-l-4 border-yellow-500">
                        <p className="text-gray-700 dark:text-dark-text whitespace-pre-line leading-relaxed">
                          {analyzeMessages(selectedChatSession.messages).highlights}
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
                          {analyzeMessages(selectedChatSession.messages).notes}
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
                        Експорт PDF
                      </button>
                      <button onClick={exportToCSV} className="border border-gray-300 dark:border-dark-border text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-hover px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105">
                        <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Експорт CSV
                      </button>
                      <button onClick={exportToExcel} className="border border-gray-300 dark:border-dark-border text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-hover px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105">
                        <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Експорт Excel
                      </button>
                      <button onClick={generateEmailDraft} className="border border-gray-300 dark:border-dark-border text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-hover px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105">
                        <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Згенерувати email-чернетку
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 