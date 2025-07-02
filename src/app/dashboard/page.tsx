'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { UserGroupIcon, ChatBubbleLeftRightIcon, BoltIcon } from '@heroicons/react/24/solid';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import ChatSessionsTable from '@/components/ChatSessionsTable';
import SalesChatView from '@/components/SalesChatView';
import { useLanguage } from '@/contexts/LanguageContext';

const ICON_CLASSES = 'w-6 h-6 text-[#651FFF]';

function GraphCard({ title, value, data, type, icon, percent, color }: any) {
  const { t } = useLanguage();
  
  const chart = type === 'line' ? (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8B97B0' }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8B97B0' }} />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={{ fill: color, strokeWidth: 2, r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  ) : (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8B97B0' }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8B97B0' }} />
        <Tooltip />
        <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );

  return (
    <div className="bg-white rounded-2xl shadow-md border border-[#ede7ff] p-6 flex flex-col min-w-[260px]">
      <div className="flex items-center gap-3 mb-2">
        <span>{icon}</span>
        <span className="text-[#651FFF] font-semibold text-lg">{title}</span>
      </div>
      <div className="flex items-end gap-2 mb-2">
        <span className="text-4xl font-bold text-[#222]">{value}</span>
        <span className={`text-sm font-semibold ${percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>{percent >= 0 ? `↑ ${percent}%` : `↓ ${Math.abs(percent)}%`} <span className="text-[#8B97B0] font-normal ml-1">{t('perWeek')}</span></span>
      </div>
      <div className="w-full h-20">{chart}</div>
    </div>
  );
}

export default function Dashboard() {
  const { t } = useLanguage();
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

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

  const handleGenerateReport = async (sessionId: string) => {
    setGeneratingId(sessionId);
    setSelectedSessionId(sessionId);
    setTimeout(() => setGeneratingId(null), 2000);
  };

  // Метрики для графіків
  const getMetricData = (chats: any[], metric: 'users' | 'chats' | 'active') => {
    const now = new Date();
    const week = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      week.push({
        day: ['Пн','Вт','Ср','Чт','Пт','Сб','Нд'][d.getDay() === 0 ? 6 : d.getDay() - 1],
        date: d.toLocaleDateString(),
        value: 0
      });
    }
    if (metric === 'users') {
      week.forEach(w => {
        const emails = new Set();
        chats.forEach(chat => {
          const date = chat.createdAt?.toDate?.() ? chat.createdAt.toDate().toLocaleDateString() : '—';
          if (date === w.date) emails.add(chat.contact?.email);
        });
        w.value = emails.size;
      });
    } else if (metric === 'chats') {
      week.forEach(w => {
        w.value = chats.filter(chat => {
          const date = chat.createdAt?.toDate?.() ? chat.createdAt.toDate().toLocaleDateString() : '—';
          return date === w.date;
        }).length;
      });
    } else if (metric === 'active') {
      week.forEach(w => {
        w.value = chats.filter(chat => {
          const updated = chat.updatedAt?.toDate?.() || chat.createdAt?.toDate?.();
          const date = updated ? updated.toLocaleDateString() : '—';
          const now = new Date(w.date);
          return date === w.date && updated && (now.getTime() - updated.getTime() < 60 * 60 * 1000);
        }).length;
      });
    }
    return week;
  };

  const totalChats = chats.length;
  const totalUsers = Array.from(new Set(chats.map(chat => chat.contact?.email))).length;
  const now = Date.now();
  const activeChats = chats.filter(chat => {
    const updated = chat.updatedAt?.toDate?.() || chat.createdAt?.toDate?.();
    return updated && now - updated.getTime() < 60 * 60 * 1000;
  }).length;

  // Динаміка (для приросту)
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
    <div className="min-h-screen bg-[#F7F8F9] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-8">
          <div className="w-full h-full space-y-6">
            {/* GraphCard метрики */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <GraphCard
                title={t('usersCount')}
                value={totalUsers}
                data={getMetricData(chats, 'users')}
                type="bar"
                icon={<UserGroupIcon className="w-7 h-7 text-[#651FFF]" />}
                percent={getGrowth(getMetricData(chats, 'users'))}
                color="#651FFF"
              />
              <GraphCard
                title={t('chatsCount')}
                value={totalChats}
                data={getMetricData(chats, 'chats')}
                type="line"
                icon={<ChatBubbleLeftRightIcon className="w-7 h-7 text-[#651FFF]" />}
                percent={getGrowth(getMetricData(chats, 'chats'))}
                color="#651FFF"
              />
              <GraphCard
                title={t('activeChats')}
                value={activeChats}
                data={getMetricData(chats, 'active')}
                type="line"
                icon={<BoltIcon className="w-7 h-7 text-[#651FFF]" />}
                percent={getGrowth(getMetricData(chats, 'active'))}
                color="#651FFF"
              />
            </div>
            <div className="w-full flex flex-row h-full min-h-0 gap-6" style={{height: '60vh', minHeight: '320px'}}>
              <div className="flex-[2] flex flex-col h-full min-h-0">
                <ChatSessionsTable
                  sessions={chats}
                  onSelect={setSelectedSessionId}
                  selectedSessionId={selectedSessionId}
                  onGenerateReport={handleGenerateReport}
                />
              </div>
              <div className="flex-[1] flex flex-col h-full min-h-0">
                {selectedSessionId ? (
                  <SalesChatView sessionId={selectedSessionId} />
                ) : (
                  <div className="bg-white rounded-2xl border border-[#ede7ff] p-8 h-full flex items-center justify-center text-gray-400 min-h-[120px]">
                    {t('selectSession')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 