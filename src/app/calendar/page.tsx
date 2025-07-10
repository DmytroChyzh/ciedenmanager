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
    <div className="min-h-screen flex flex-col gap-8 overflow-hidden">
      <div className="flex-1 flex flex-col">
        <main className="flex-1">
          <Calendar />
        </main>
      </div>
    </div>
  );
} 