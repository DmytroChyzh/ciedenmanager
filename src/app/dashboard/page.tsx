'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { UserGroupIcon, ChatBubbleLeftRightIcon, BoltIcon } from '@heroicons/react/24/solid';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ChatSessionsTable from '@/components/ChatSessionsTable';
import SalesChatView from '@/components/SalesChatView';
import { useLanguage } from '@/contexts/LanguageContext';
import GraphCard from '@/components/GraphCard';
import UsersCountCard from '@/components/UsersCountCard';
import ChatsCountCard from '@/components/ChatsCountCard';
import TargetsTrackerCard from '@/components/ActiveChatsCard';
import ChatViewMini from '@/components/ChatViewMini';

const ICON_CLASSES = 'w-6 h-6 text-[#651FFF]';

export default function Dashboard() {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const { t } = useLanguage();
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  
  // Стани періодів для кожної картки
  const [usersPeriod, setUsersPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [chatsPeriod, setChatsPeriod] = useState<'week' | 'month' | 'year'>('week');
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
  };

  const handleGenerateReport = async (sessionId: string) => {
    setGeneratingId(sessionId);
    setSelectedSessionId(sessionId);
    setShowDetails(true);
    setTimeout(() => setGeneratingId(null), 2000);
  };

  // Метрики для графіків з підтримкою періодів
  const getMetricData = (chats: any[], metric: 'users' | 'chats' | 'active', period: 'week' | 'month' | 'year' = 'week') => {
    const now = new Date();
    const timeData = [];
    
    if (period === 'week') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        timeData.push({
          day: ['monShort','tueShort','wedShort','thuShort','friShort','satShort','sunShort'][d.getDay() === 0 ? 6 : d.getDay() - 1],
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

  // Events (mock)
  const summary = 'Сьогодні було створено 5 нових чат-сесій, додано 2 оцінки, згенеровано 3 AI summary.';
  const ratings = [
    { id: 1, value: '8.5', project: 'CRM Redesign' },
    { id: 2, value: '7.0', project: 'AppBot' },
  ];
  const comments = [
    { id: 1, text: 'Клієнт залишив позитивний відгук.' },
    { id: 2, text: 'AI: Проєкт виглядає перспективно.' },
  ];

  // Фільтрована таблиця
  const filteredChats = chats.filter(chat =>
    chat.contact?.name?.toLowerCase().includes(search.toLowerCase()) ||
    chat.contact?.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#651FFF]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 flex flex-col gap-4 md:gap-8 overflow-hidden bg-[#F7F8F9] dark:bg-dark-bg" style={{height: '100vh'}}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 flex-shrink-0">
        <UsersCountCard 
          value={totalUsers} 
          data={getMetricData(chats, 'users', usersPeriod)} 
          percent={getGrowth(getMetricData(chats, 'users', usersPeriod))}
          onPeriodChange={setUsersPeriod}
          currentPeriod={usersPeriod}
        />
        <ChatsCountCard 
          value={totalChats} 
          data={getMetricData(chats, 'chats', chatsPeriod)} 
          percent={getGrowth(getMetricData(chats, 'chats', chatsPeriod))}
          onPeriodChange={setChatsPeriod}
          currentPeriod={chatsPeriod}
        />
        <TargetsTrackerCard 
          value={totalChats} 
          percent={getGrowth(getMetricData(chats, 'chats', targetsPeriod))}
          onPeriodChange={setTargetsPeriod}
          currentPeriod={targetsPeriod}
        />
      </div>
      <div className="flex flex-col md:flex-row gap-4 md:gap-8 w-full min-h-0 flex-1">
        <div className="flex-1 flex flex-col h-full min-h-0">
          <div className="flex-1 flex flex-col min-h-0 pb-8">
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
        <div className="w-full md:w-[606px] flex flex-col h-full min-h-0">
          <div className="flex-1 flex flex-col min-h-0 pb-8">
            <div className="h-full overflow-y-auto min-h-0">
              {showDetails && selectedSessionId ? (
                <SalesChatView sessionId={selectedSessionId} />
              ) : selectedSessionId ? (
                <ChatViewMini sessionId={selectedSessionId} />
              ) : (
                <div className="bg-white dark:bg-dark-card rounded-2xl p-4 md:p-8 h-full flex items-center justify-center text-gray-400 dark:text-dark-text min-h-[80px] md:min-h-[120px] text-sm md:text-base text-center">
                  {t('selectSession')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 