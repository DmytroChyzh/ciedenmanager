'use client';
import Calendar from '@/components/Calendar';
import { useEffect } from 'react';

export default function CalendarPage() {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);
  return (
    <div className="min-h-0 flex-1 flex flex-col gap-8 overflow-hidden" style={{height: '100vh'}}>
      <div className="flex-1 flex flex-col min-h-0">
        <main className="flex-1 min-h-0 overflow-y-auto">
          <Calendar />
        </main>
      </div>
    </div>
  );
} 