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
    // Показуємо попап з чатом
    const session = chats.find(chat => chat.id === sessionId);
    setSelectedChatSession(session);
    setShowChatPopup(true);
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
    const allText = messages.map(msg => msg.content || msg.text || '').join(' ').toLowerCase();
    
    // Визначаємо тип проекту
    let projectType = '';
    if (allText.includes('мобільн') || allText.includes('app') || allText.includes('додаток')) {
      projectType = 'мобільний додаток';
    } else if (allText.includes('веб') || allText.includes('сайт') || allText.includes('web')) {
      projectType = 'веб-сайт';
    } else if (allText.includes('платформ') || allText.includes('стрімер')) {
      projectType = 'платформа для стрімерів';
    } else if (allText.includes('ecommerce') || allText.includes('магазин')) {
      projectType = 'e-commerce платформа';
    } else {
      projectType = 'програмний продукт';
    }

    // Визначаємо складність
    let complexity = 'Середня';
    let timeEstimate = '2-3 місяці';
    let technologies = 'React, Node.js';

    if (allText.includes('ai') || allText.includes('машинн') || allText.includes('ml')) {
      complexity = 'Висока';
      timeEstimate = '6-8 місяців';
      technologies = 'React, Node.js, Python, TensorFlow, AWS';
    } else if (allText.includes('відео') || allText.includes('стрім') || allText.includes('streaming')) {
      complexity = 'Висока';
      timeEstimate = '4-6 місяців';
      technologies = 'React, Node.js, WebRTC, AWS, Socket.io';
    } else if (allText.includes('платіж') || allText.includes('банк') || allText.includes('фінанс')) {
      complexity = 'Висока';
      timeEstimate = '3-5 місяців';
      technologies = 'React, Node.js, Stripe, PostgreSQL';
    }

    // Генеруємо зведення
    const summary = `Клієнт зацікавлений у створенні ${projectType}. ${allText.includes('ux') || allText.includes('дизайн') ? 'Особлива увага до UX/UI дизайну.' : ''} ${allText.includes('конкурент') ? 'Визначені конкурентні переваги.' : ''}`;

    // Генеруємо оцінку
    const estimate = `Приблизний час розробки: ${timeEstimate}. Складність: ${complexity}. Необхідні технології: ${technologies}.`;

    // Генеруємо ключові моменти
    const highlights = [];
    if (allText.includes('аудиторі') || allText.includes('користувач')) highlights.push('• Визначена цільова аудиторія');
    if (allText.includes('конкурент') || allText.includes('twitch') || allText.includes('youtube')) highlights.push('• Аналізовані конкуренти');
    if (allText.includes('технічн') || allText.includes('технологі')) highlights.push('• Визначені технічні вимоги');
    if (allText.includes('бюджет') || allText.includes('кошт')) highlights.push('• Обговорений бюджет');
    if (highlights.length === 0) highlights.push('• Потрібно деталізувати вимоги');

    // Генеруємо замітки AI
    const notes = [];
    if (messages.length > 2) notes.push('✅ Клієнт активно взаємодіє');
    if (allText.includes('баченн') || allText.includes('ідея')) notes.push('✅ Має чітке бачення продукту');
    if (allText.includes('конкурент')) notes.push('✅ Розуміє конкурентні переваги');
    if (!allText.includes('бюджет') && !allText.includes('кошт')) notes.push('⚠️ Потрібно обговорити бюджет');
    if (!allText.includes('термін') && !allText.includes('час')) notes.push('⚠️ Визначити терміни проекту');

    return {
      summary,
      estimate,
      highlights: highlights.join('\n'),
      notes: notes.join('\n')
    };
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

                <div className="flex-1 overflow-y-auto space-y-6">
                  {/* Session Info */}
                  <div className="bg-gray-50 dark:bg-dark-bg rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Session Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-dark-text-muted">Session ID:</span>
                        <span className="font-mono text-gray-900 dark:text-white">{selectedChatSession.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-dark-text-muted">Client:</span>
                        <span className="text-gray-900 dark:text-white">{selectedChatSession.contact?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-dark-text-muted">Email:</span>
                        <span className="text-gray-900 dark:text-white">{selectedChatSession.contact?.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-dark-text-muted">Created:</span>
                        <span className="text-gray-900 dark:text-white">
                          {selectedChatSession.createdAt?.toDate?.() ? selectedChatSession.createdAt.toDate().toLocaleString() : '—'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-dark-text-muted">Messages:</span>
                        <span className="text-gray-900 dark:text-white">{selectedChatSession.messages?.length || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Auto-summary */}
                  <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400 mb-3">Auto-summary</h3>
                    <div className="bg-gray-50 dark:bg-dark-bg rounded-lg p-3 min-h-[60px]">
                      <p className="text-gray-700 dark:text-dark-text">
                        {analyzeMessages(selectedChatSession.messages).summary}
                      </p>
                    </div>
                  </div>

                  {/* Estimate */}
                  <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400 mb-3">Estimate</h3>
                    <div className="bg-gray-50 dark:bg-dark-bg rounded-lg p-3 min-h-[60px]">
                      <p className="text-gray-700 dark:text-dark-text">
                        {analyzeMessages(selectedChatSession.messages).estimate}
                      </p>
                    </div>
                  </div>

                  {/* Research Highlights */}
                  <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400 mb-3">Research Highlights</h3>
                    <div className="bg-gray-50 dark:bg-dark-bg rounded-lg p-3 min-h-[60px]">
                      <p className="text-gray-700 dark:text-dark-text whitespace-pre-line">
                        {analyzeMessages(selectedChatSession.messages).highlights}
                      </p>
                    </div>
                  </div>

                  {/* AI Notes */}
                  <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400 mb-3">AI Notes</h3>
                    <div className="bg-gray-50 dark:bg-dark-bg rounded-lg p-3 min-h-[60px]">
                      <p className="text-gray-700 dark:text-dark-text whitespace-pre-line">
                        {analyzeMessages(selectedChatSession.messages).notes}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Export Buttons */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-dark-border">
                  <div className="flex gap-3 flex-wrap">
                    <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      Експорт PDF
                    </button>
                    <button className="border border-gray-300 dark:border-dark-border text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-hover px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      Експорт CSV
                    </button>
                    <button className="border border-gray-300 dark:border-dark-border text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-hover px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      Експорт Excel
                    </button>
                    <button className="border border-gray-300 dark:border-dark-border text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-hover px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      Згенерувати email-чернетку
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 