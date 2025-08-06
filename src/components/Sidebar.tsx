"use client";
import React from 'react';
import { HomeIcon, ChatBubbleLeftRightIcon, CalendarDaysIcon, CalculatorIcon, SparklesIcon, ArrowRightOnRectangleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const { language, t } = useLanguage();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { 
      key: 'dashboard', 
      label: t('dashboard'), 
      icon: <HomeIcon className="w-5 h-5" />,
      href: '/dashboard'
    },
    {
      key: 'assistant',
      label: t('assistant') || 'AI помічник',
      icon: <SparklesIcon className="w-5 h-5" />,
      href: '/assistant'
    },
    { 
      key: 'chats', 
      label: t('chats'), 
      icon: <ChatBubbleLeftRightIcon className="w-5 h-5" />,
      href: '/chats'
    },
    { 
      key: 'calendar', 
      label: t('calendar'), 
      icon: <CalendarDaysIcon className="w-5 h-5" />,
      href: '/calendar'
    },
  ];

  return (
    <aside className={`bg-white dark:bg-dark-card rounded-xl h-[calc(100vh-76px)] xs:h-[calc(100vh-86px)] sm:h-[calc(100vh-96px)] md:h-[calc(100vh-106px)] lg:h-[calc(100vh-112px)] flex flex-col transition-all duration-200 ${collapsed ? 'w-10 xs:w-12 sm:w-14 md:w-16' : 'w-full xs:w-[160px] sm:w-[180px] md:w-[200px] lg:w-[220px] xl:w-[240px] 2xl:w-[260px]'} pb-0 ml-1 xs:ml-2 sm:ml-3 md:ml-4 lg:ml-5 xl:ml-6 mt-1 xs:mt-2 sm:mt-3 md:mt-4 lg:mt-5 xl:mt-6`}>
      {/* Пошук з кнопкою згортання - тільки коли розгорнуто */}
      {!collapsed && (
        <div className="p-4 border-b border-gray-100 dark:border-dark-border">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-dark-hover border border-gray-200 dark:border-dark-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary"
              />
            </div>
            <button
              className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-primary-light dark:hover:bg-dark-primary-light transition-colors"
              onClick={() => setCollapsed(!collapsed)}
              aria-label="Згорнути меню"
            >
              <ChevronLeftIcon className="w-5 h-5 text-primary dark:text-dark-primary" />
            </button>
          </div>
        </div>
      )}

      {/* Кнопка розгортання - тільки коли згорнуто */}
      {collapsed && (
        <div className="flex justify-center p-2">
          <button
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-primary-light dark:hover:bg-dark-primary-light transition-colors"
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Розгорнути меню"
          >
            <ChevronLeftIcon className="w-5 h-5 text-primary dark:text-dark-primary rotate-180" />
          </button>
        </div>
      )}
      
      <nav className={`flex flex-col ${collapsed ? 'gap-2 mt-2' : 'gap-3 mt-4'} flex-1 items-center px-2`}> 
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.key} href={item.href} legacyBehavior>
              <a className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg ${collapsed ? 'w-10 h-10' : 'w-full'} text-left transition-all duration-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:ring-offset-2 dark:focus:ring-offset-dark-card ${
                isActive 
                  ? 'bg-primary-light dark:bg-dark-primary-light text-primary dark:text-dark-primary shadow-sm' 
                  : 'hover:bg-primary-muted dark:hover:bg-dark-primary-muted text-gray-700 dark:text-dark-text-muted hover:text-primary dark:hover:text-dark-primary active:bg-primary-light/50 dark:active:bg-dark-primary-light/50'
              }`}>
                <span className={`flex items-center justify-center ${collapsed ? 'w-5 h-5' : 'w-5 h-5'}`}>
                  {React.cloneElement(item.icon, { 
                    className: `${collapsed ? 'w-5 h-5' : 'w-5 h-5'} transition-colors ${isActive ? 'text-primary dark:text-dark-primary' : 'text-gray-600 dark:text-dark-text-muted group-hover:text-primary dark:group-hover:text-dark-primary'}` 
                  })}
                </span>
                {!collapsed && <span className="truncate">{item.label}</span>}
              </a>
            </Link>
          );
        })}
      </nav>
      
      {/* Logout button */}
      <div className={`p-2 ${collapsed ? 'flex justify-center' : ''}`}>
        <button 
          onClick={logout}
          className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg ${collapsed ? 'w-10 h-10' : 'w-full'} text-left hover:bg-red-50 dark:hover:bg-red-900/20 active:bg-red-100 dark:active:bg-red-800/30 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:ring-offset-2 dark:focus:ring-offset-dark-card text-gray-700 dark:text-dark-text-muted hover:text-red-700 dark:hover:text-red-400 text-sm font-medium transition-all duration-200`}
        >
          <span className={`flex items-center justify-center ${collapsed ? 'w-5 h-5' : 'w-5 h-5'}`}>
            <ArrowRightOnRectangleIcon className={`${collapsed ? 'w-5 h-5' : 'w-5 h-5'} text-gray-600 dark:text-dark-text-muted group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors`} />
          </span>
          {!collapsed && <span className="truncate">{t('signOut')}</span>}
        </button>
      </div>
    </aside>
  );
} 