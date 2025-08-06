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
  const [showReportPopup, setShowReportPopup] = useState(false);
  const [showChatPopup, setShowChatPopup] = useState(false);
  const [selectedReportSession, setSelectedReportSession] = useState<any>(null);
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
    setSelectedSessionId(sessionId);
    setShowDetails(false);
    // Показуємо попап з чатом
    const session = chats.find(chat => chat.id === sessionId);
    setSelectedChatSession(session);
    setShowChatPopup(true);
    // Закриваємо попап з звітом якщо він відкритий
    setShowReportPopup(false);
  };

  const handleGenerateReport = async (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setShowDetails(true);
    // Показуємо попап з звітом
    const session = chats.find(chat => chat.id === sessionId);
    setSelectedReportSession(session);
    setShowReportPopup(true);
    // Закриваємо попап з чатом якщо він відкритий
    setShowChatPopup(false);
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
        
        {/* Таблиця чат-сесій - фіксована висота 840px */}
        <div className="h-[840px] flex flex-col min-h-0">
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

        {/* Попап з звітом - збоку справа */}
        {showReportPopup && selectedReportSession && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
            <div className="absolute right-0 top-0 h-full w-96 bg-white dark:bg-dark-card shadow-2xl transform transition-transform duration-300 ease-in-out">
              <div className="p-6 h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Звіт по клієнту: {selectedReportSession.contact?.name}
                  </h2>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => window.open(`mailto:${selectedReportSession.contact?.email}?subject=Звіт по сесії&body=Технічні дані сесії: ${selectedReportSession.id}`)}
                      className="p-2 text-gray-600 hover:text-primary dark:text-dark-text-muted dark:hover:text-dark-primary transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => navigator.clipboard.writeText(selectedReportSession.contact?.email || '')}
                      className="p-2 text-gray-600 hover:text-primary dark:text-dark-text-muted dark:hover:text-dark-primary transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => setShowReportPopup(false)}
                      className="p-2 text-gray-600 hover:text-red-500 dark:text-dark-text-muted dark:hover:text-red-400 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <div className="space-y-4">
                    <div className="bg-gray-50 dark:bg-dark-bg p-4 rounded-lg">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">Технічні дані сесії:</h3>
                      <div className="text-sm text-gray-600 dark:text-dark-text-muted space-y-1">
                        <p><strong>ID сесії:</strong> {selectedReportSession.id}</p>
                        <p><strong>Email:</strong> {selectedReportSession.contact?.email}</p>
                        <p><strong>Дата створення:</strong> {selectedReportSession.createdAt?.toDate?.() ? selectedReportSession.createdAt.toDate().toLocaleString() : '—'}</p>
                        <p><strong>Останнє оновлення:</strong> {selectedReportSession.updatedAt?.toDate?.() ? selectedReportSession.updatedAt.toDate().toLocaleString() : '—'}</p>
                        <p><strong>Кількість повідомлень:</strong> {selectedReportSession.messages?.length || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Попап з чатом - збоку справа */}
        {showChatPopup && selectedChatSession && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
            <div className="absolute right-0 top-0 h-full w-[600px] bg-white dark:bg-dark-card shadow-2xl transform transition-transform duration-300 ease-in-out">
              <div className="p-6 h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Чат з: {selectedChatSession.contact?.name}
                  </h2>
                  <button 
                    onClick={() => setShowChatPopup(false)}
                    className="p-2 text-gray-600 hover:text-red-500 dark:text-dark-text-muted dark:hover:text-red-400 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <SalesChatView sessionId={selectedChatSession.id} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 