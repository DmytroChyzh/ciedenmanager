"use client";
import React, { useEffect, useState, useRef } from 'react';
import { getChatSessionById } from '@/lib/firestore';
import { useLanguage } from '@/contexts/LanguageContext';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import logoUrl from '../../public/cieden-logo.svg';

interface SalesChatViewProps {
  sessionId: string;
  rounded?: boolean;
}

async function fetchAIResult(messages: any[], type: 'summary' | 'estimate' | 'highlights'): Promise<string> {
  let prompt = '';
  if (type === 'summary') {
    prompt = 'Зроби коротке summary цієї розмови українською для менеджера з продажу:';
  } else if (type === 'estimate') {
    prompt = 'Оціни приблизний бюджет і часові рамки цього проєкту на основі розмови (українською, коротко):';
  } else if (type === 'highlights') {
    prompt = 'Виділи основні інсайти, ризики та можливості з цієї розмови (українською, списком):';
  }
  const body = {
    messages: [
      { role: 'system', content: prompt },
      ...messages.map((m: any) => ({ role: m.role || m.sender || 'user', content: m.text || m.content || m.message || '' }))
    ]
  };
  const res = await fetch('/api/assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return data.result || '';
}

export default function SalesChatView({ sessionId, rounded = true }: SalesChatViewProps) {
  const { t } = useLanguage();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [aiEstimate, setAiEstimate] = useState<string>('');
  const [aiHighlights, setAiHighlights] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);

  // Email composer
  const projectName = session?.projectCard?.title || 'Проєкт';
  const clientName = session?.metadata?.userName || 'Клієнт';
  const estimateText = aiEstimate || '';
  const summaryText = aiSummary || '';
  const deadline = '';
  const amount = '';
  const emailDraft = `
Тема: Оновлення по проєкту ${projectName}

Вітаю, ${clientName}!

Summary: ${summaryText}

Estimate: ${estimateText}

Next steps: [вкажіть наступні кроки]

З повагою,
[Ваше імʼя]
`;
  const emailRef = useRef<HTMLTextAreaElement>(null);
  const handleCopyEmail = () => {
    if (emailRef.current) {
      emailRef.current.select();
      document.execCommand('copy');
    }
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    getChatSessionById(sessionId)
      .then(data => {
        setSession(data);
        setLoading(false);
        if (data && data.messages && data.messages.length > 0) {
          setAiLoading(true);
          Promise.all([
            fetchAIResult(data.messages, 'summary'),
            fetchAIResult(data.messages, 'estimate'),
            fetchAIResult(data.messages, 'highlights'),
          ]).then(([summary, estimate, highlights]) => {
            setAiSummary(summary);
            setAiEstimate(estimate);
            setAiHighlights(highlights);
            setAiLoading(false);
          }).catch(() => setAiLoading(false));
        } else {
          setAiSummary('');
          setAiEstimate('');
          setAiHighlights('');
        }
      })
      .catch(err => {
        setError('Помилка завантаження сесії');
        setLoading(false);
      });
  }, [sessionId]);

  // PDF export
  const handleExportPDF = async () => {
    const doc = new jsPDF();
    // Логотип
    try {
      const img = new Image();
      img.src = logoUrl;
      await new Promise(res => { img.onload = res; });
      doc.addImage(img, 'SVG', 10, 10, 40, 16);
    } catch {}
    doc.setFontSize(16);
    doc.text('Звіт по сесії', 60, 20);
    doc.setFontSize(10);
    doc.text(`Клієнт: ${session.metadata?.userName || '—'}`, 10, 32);
    doc.text(`Email: ${session.metadata?.userEmail || '—'}`, 10, 38);
    doc.text(`ID сесії: ${sessionId}`, 10, 44);
    doc.text('Summary:', 10, 54);
    doc.text(aiSummary || '-', 10, 60, { maxWidth: 180 });
    doc.text('Estimate:', 10, 70);
    doc.text(aiEstimate || '-', 10, 76, { maxWidth: 180 });
    doc.text('Highlights:', 10, 86);
    doc.text(aiHighlights || '-', 10, 92, { maxWidth: 180 });
    // Повідомлення
    doc.text('Повідомлення:', 10, 104);
    const msgRows = messages.map((msg, i) => [
      i + 1,
      msg.role === 'user' ? 'Клієнт' : msg.role === 'manager' ? 'Менеджер' : 'AI',
      msg.text || msg.content || msg.message || '',
      msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleString('uk-UA') : ''
    ]);
    // @ts-ignore
    doc.autoTable({
      head: [['#', 'Відправник', 'Текст', 'Час']],
      body: msgRows,
      startY: 110,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [101, 31, 255] },
    });
    doc.save(`session_${sessionId}.pdf`);
  };

  // CSV export
  const handleExportCSV = () => {
    const csv = Papa.unparse([
      ['Клієнт', session.metadata?.userName || ''],
      ['Email', session.metadata?.userEmail || ''],
      ['ID сесії', sessionId],
      [],
      ['Summary', aiSummary],
      ['Estimate', aiEstimate],
      ['Highlights', aiHighlights],
      [],
      ['#', 'Відправник', 'Текст', 'Час'],
      ...messages.map((msg, i) => [
        i + 1,
        msg.role === 'user' ? 'Клієнт' : msg.role === 'manager' ? 'Менеджер' : 'AI',
        msg.text || msg.content || msg.message || '',
        msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleString('uk-UA') : ''
      ])
    ]);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `session_${sessionId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Excel export
  const handleExportExcel = () => {
    const wsData = [
      ['Клієнт', session.metadata?.userName || ''],
      ['Email', session.metadata?.userEmail || ''],
      ['ID сесії', sessionId],
      [],
      ['Summary', aiSummary],
      ['Estimate', aiEstimate],
      ['Highlights', aiHighlights],
      [],
      ['#', 'Відправник', 'Текст', 'Час'],
      ...messages.map((msg, i) => [
        i + 1,
        msg.role === 'user' ? 'Клієнт' : msg.role === 'manager' ? 'Менеджер' : 'AI',
        msg.text || msg.content || msg.message || '',
        msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleString('uk-UA') : ''
      ])
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Session');
    XLSX.writeFile(wb, `session_${sessionId}.xlsx`);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full text-gray-400">Завантаження...</div>;
  }
  if (error) {
    return <div className="flex items-center justify-center h-full text-red-500">{error}</div>;
  }
  if (!session) {
    return <div className="flex items-center justify-center h-full text-gray-400">Сесію не знайдено</div>;
  }

  let messages: any[] = [];
  if (Array.isArray(session.messages)) {
    messages = session.messages;
  } else if (session.messages && typeof session.messages === 'object') {
    messages = Object.values(session.messages);
  }

  return (
    <div className={`bg-white border border-[#ede7ff] p-6 h-full min-h-0 flex-1 flex flex-col gap-4 pb-4 overflow-y-auto max-h-full ${rounded ? 'rounded-2xl' : ''}`}>
      <div className="font-bold text-lg text-[#651FFF] mb-2">Деталі сесії</div>
      <div className="mb-2">
        <div className="text-sm text-gray-500">ID сесії: {sessionId}</div>
        <div className="text-sm text-gray-700">Клієнт: {session.metadata?.userName || '—'}</div>
        <div className="text-sm text-gray-500">Email: {session.metadata?.userEmail || '—'}</div>
      </div>
      <div className="mb-4">
        <div className="font-semibold mb-1">{t('chat')}</div>
        <div className="bg-[#f7f8fa] rounded-lg p-3 min-h-[120px] text-gray-700 max-h-48 overflow-y-auto flex flex-col gap-2">
          {messages.length > 0 ? (
            messages.map((msg, idx) => (
              <div key={idx} className="flex flex-col text-xs">
                <span className="font-semibold text-[#651FFF]">{msg.role === 'user' ? t('client') : msg.role === 'manager' ? t('manager') : t('ai')}</span>
                <span className="text-gray-800">{msg.text || msg.content || msg.message || <span className="italic text-gray-400">{t('noText')}</span>}</span>
                {msg.timestamp?.toDate && (
                  <span className="text-gray-400">{msg.timestamp.toDate().toLocaleString('uk-UA')}</span>
                )}
              </div>
            ))
          ) : (
            <span className="italic text-gray-400">{t('noMessagesInSession')}</span>
          )}
        </div>
      </div>
      <div className="mb-4">
        <div className="font-semibold mb-1">{t('autoSummary')}</div>
        <div className="bg-[#f5f3ff] rounded-lg p-3 min-h-[60px] text-gray-700">
          {aiLoading ? <span className="text-gray-400">{t('generatingSummary')}</span> : aiSummary || <span className="italic text-gray-400">{t('notEnoughData')}</span>}
        </div>
      </div>
      <div className="mb-4">
        <div className="font-semibold mb-1">{t('estimate')}</div>
        <div className="bg-[#f5f3ff] rounded-lg p-3 min-h-[40px] text-gray-700">
          {aiLoading ? <span className="text-gray-400">{t('generatingEstimate')}</span> : aiEstimate || <span className="italic text-gray-400">{t('notEnoughData')}</span>}
        </div>
      </div>
      <div className="mb-4">
        <div className="font-semibold mb-1">{t('researchHighlights')}</div>
        <div className="bg-[#f5f3ff] rounded-lg p-3 min-h-[60px] text-gray-700">
          {aiLoading ? <span className="text-gray-400">{t('generatingHighlights')}</span> : aiHighlights || <span className="italic text-gray-400">{t('notEnoughData')}</span>}
        </div>
      </div>
      <div className="flex gap-2 mt-2">
        <button className="px-4 py-2 bg-[#651FFF] text-white rounded-md font-semibold hover:bg-[#5a1ce0]" onClick={handleExportPDF}>Експорт PDF</button>
        <button className="px-4 py-2 border border-[#651FFF] text-[#651FFF] rounded-md font-semibold hover:bg-[#ede7ff]" onClick={handleExportCSV}>Експорт CSV</button>
        <button className="px-4 py-2 border border-[#651FFF] text-[#651FFF] rounded-md font-semibold hover:bg-[#ede7ff]" onClick={handleExportExcel}>Експорт Excel</button>
        <button className="px-4 py-2 border border-[#651FFF] text-[#651FFF] rounded-md font-semibold hover:bg-[#ede7ff]">Згенерувати email-чернетку</button>
      </div>
      <div className="mt-4">
        <div className="font-semibold mb-1">Email Composer</div>
        <textarea
          ref={emailRef}
          className="bg-[#f5f3ff] rounded-lg p-3 min-h-[100px] text-gray-700 w-full text-sm font-mono resize-none outline-none"
          value={emailDraft}
          readOnly
        />
        <button onClick={handleCopyEmail} className="mt-2 px-4 py-2 border border-[#651FFF] text-[#651FFF] rounded-md font-semibold hover:bg-[#ede7ff]">Скопіювати в буфер</button>
      </div>
    </div>
  );
} 