"use client";
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { usePathname } from 'next/navigation';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const [showSidebar, setShowSidebar] = useState(false);

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8F9] dark:bg-dark-bg">
      <Header />
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
                <span className="font-bold text-xl text-[#651FFF]">Меню</span>
                <button onClick={() => setShowSidebar(false)} className="text-gray-400 hover:text-gray-700 p-2 rounded-full">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              <Sidebar />
            </aside>
            <div className="flex-1" onClick={() => setShowSidebar(false)} />
          </div>
        )}
      </div>
      <div className="flex flex-col md:flex-row w-full min-w-0">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <main className="flex-1 flex flex-col p-2 sm:p-4 md:p-8 pb-8 w-full min-w-0">{children}</main>
      </div>
    </div>
  );
} 