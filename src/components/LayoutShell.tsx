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
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-dark-bg relative">
      <Header />
      {/* Sidebar для мобільних */}
      <div className="block md:hidden w-full">
        <button
          className="fixed top-4 left-4 z-30 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-full p-2 shadow-md md:hidden"
          onClick={() => setShowSidebar(true)}
          aria-label="Відкрити меню"
        >
          <Bars3Icon className="w-6 h-6 text-primary dark:text-dark-primary" />
        </button>
        {showSidebar && (
          <div className="fixed inset-0 z-40 bg-black bg-opacity-30 flex">
            <aside className="w-72 max-w-[90vw] h-full bg-white dark:bg-dark-card border-r border-gray-200 dark:border-dark-border flex flex-col animate-slideInLeft">
              <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-dark-border">
                <span className="font-bold text-lg text-primary dark:text-dark-primary">Меню</span>
                <button onClick={() => setShowSidebar(false)} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 p-2 rounded-full">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <Sidebar />
            </aside>
            <div className="flex-1" onClick={() => setShowSidebar(false)} />
          </div>
        )}
      </div>
      <div className="flex flex-col md:flex-row w-full min-w-0 flex-1 pb-0">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <main className="flex-1 flex flex-col p-2 sm:p-3 md:p-6 pb-0 w-full min-w-0 max-h-[1160px] overflow-y-auto">{children}</main>
      </div>
      
      {/* Біла лінія внизу екрану */}
      <div className="fixed bottom-0 left-0 right-0 h-6 bg-white dark:bg-white z-50"></div>
    </div>
  );
} 