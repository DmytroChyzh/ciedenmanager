'use client';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Calendar from '@/components/Calendar';

export default function CalendarPage() {
  return (
    <div className="min-h-screen bg-[#F7F8F9] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-8">
          <Calendar />
        </main>
      </div>
    </div>
  );
} 