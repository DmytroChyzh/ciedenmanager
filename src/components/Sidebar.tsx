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
    <aside className={`bg-white dark:bg-dark-card rounded-xl h-[1170px] flex flex-col transition-all duration-200 ${collapsed ? 'w-16' : 'w-full md:w-[240px] lg:w-[280px]'} pb-0 ml-6 mt-6`}>
      {/* Пошук - тільки коли розгорнуто */}
      {!collapsed && (
        <div className="p-4 border-b border-gray-100 dark:border-dark-border">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-dark-hover border border-gray-200 dark:border-dark-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary"
            />
          </div>
        </div>
      )}

      {/* Кнопка згортання/розгортання */}
      <div className="flex justify-end p-2">
        <button
          className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-primary-light dark:hover:bg-dark-primary-light transition-colors"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Розгорнути меню' : 'Згорнути меню'}
        >
          {collapsed ? (
            <ChevronLeftIcon className="w-5 h-5 text-primary dark:text-dark-primary" />
          ) : (
            <ChevronLeftIcon className="w-5 h-5 text-primary dark:text-dark-primary" />
          )}
        </button>
      </div>
      
      <nav className={`flex flex-col ${collapsed ? 'gap-2 mt-2' : 'gap-3 mt-4'} flex-1 items-center px-2`}> 
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.key} href={item.href} legacyBehavior>
              <a className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg ${collapsed ? 'w-10 h-10' : 'w-full'} text-left transition text-sm font-medium ${
                isActive 
                  ? 'bg-primary-light dark:bg-dark-primary-light text-primary dark:text-dark-primary' 
                  : 'hover:bg-primary-muted dark:hover:bg-dark-primary-muted text-gray-700 dark:text-dark-text-muted'
              }`}>
                <span className={`flex items-center justify-center ${collapsed ? 'w-5 h-5' : 'w-5 h-5'}`}>
                  {React.cloneElement(item.icon, { 
                    className: `${collapsed ? 'w-5 h-5' : 'w-5 h-5'} ${isActive ? 'text-primary dark:text-dark-primary' : 'text-gray-600 dark:text-dark-text-muted'}` 
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
          className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg ${collapsed ? 'w-10 h-10' : 'w-full'} text-left hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-700 dark:text-dark-text-muted text-sm font-medium transition-colors`}
        >
          <span className={`flex items-center justify-center ${collapsed ? 'w-5 h-5' : 'w-5 h-5'}`}>
            <ArrowRightOnRectangleIcon className={`${collapsed ? 'w-5 h-5' : 'w-5 h-5'} text-gray-600 dark:text-dark-text-muted`} />
          </span>
          {!collapsed && <span className="truncate">{t('signOut')}</span>}
        </button>
      </div>
    </aside>
  );
} 