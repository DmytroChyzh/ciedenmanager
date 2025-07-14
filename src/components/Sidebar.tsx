"use client";
import React from 'react';
import { HomeIcon, ChatBubbleLeftRightIcon, CalendarDaysIcon, CalculatorIcon, SparklesIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
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
      icon: <HomeIcon className="w-6 h-6" />,
      href: '/dashboard'
    },
    {
      key: 'assistant',
      label: t('assistant') || 'AI помічник',
      icon: <SparklesIcon className="w-6 h-6" />,
      href: '/assistant'
    },
    { 
      key: 'chats', 
      label: t('chats'), 
      icon: <ChatBubbleLeftRightIcon className="w-6 h-6" />,
      href: '/chats'
    },
    { 
      key: 'calendar', 
      label: t('calendar'), 
      icon: <CalendarDaysIcon className="w-6 h-6" />,
      href: '/calendar'
    },
    // { 
    //   key: 'calculator', 
    //   label: t('calculator'), 
    //   icon: <CalculatorIcon className="w-6 h-6" />,
    //   href: '/calculator'
    // },
  ];

  return (
    <aside className={`bg-white dark:bg-dark-card rounded-2xl h-full md:h-[1070px] flex flex-col md:ml-8 md:mt-8 md:mb-4 border border-transparent dark:border-[#333] transition-all duration-200 ${collapsed ? 'w-16' : 'w-full md:w-[260px] lg:w-[300px]'}`}>
      {/* Кнопка згортання/розгортання */}
      <button
        className={`hidden md:flex items-center justify-center mt-4 ml-4 w-8 h-8 rounded-full hover:bg-[#ede7ff] transition ${collapsed ? 'rotate-180' : ''}`}
        onClick={() => setCollapsed(!collapsed)}
        aria-label={collapsed ? 'Розгорнути меню' : 'Згорнути меню'}
      >
        {collapsed ? <ChevronRightIcon className="w-5 h-5 text-[#651FFF]" /> : <ChevronLeftIcon className="w-5 h-5 text-[#651FFF]" />}
      </button>
      <nav className={`flex flex-col ${collapsed ? 'gap-4 mt-8' : 'gap-6 md:gap-10 mt-8 md:mt-16'} flex-1 items-center`}> 
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.key} href={item.href} legacyBehavior>
              <a className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3 md:gap-4'} px-0 md:px-4 py-3 md:py-4 rounded-xl ${collapsed ? 'w-12 h-12' : 'w-full md:w-[220px] lg:w-[260px]'} text-left mx-auto transition text-base md:text-xl font-semibold ${
                isActive 
                  ? 'bg-[#ede7ff] dark:bg-[#292929] text-[#651FFF] dark:text-dark-orange' 
                  : 'hover:bg-[#f3f0ff] dark:hover:bg-[#232323] text-[#222] dark:text-dark-text'
              }`}>
                <span className={`flex items-center justify-center ${collapsed ? 'w-7 h-7' : 'w-7 h-7 md:w-8 md:h-8'}`}>
                  {React.cloneElement(item.icon, { 
                    className: `${collapsed ? 'w-7 h-7' : 'w-7 h-7 md:w-8 md:h-8'} ${isActive ? 'text-[#651FFF] dark:text-dark-orange' : 'text-[#222] dark:text-dark-text'}` 
                  })}
                </span>
                {!collapsed && <span className="truncate w-full">{item.label}</span>}
              </a>
            </Link>
          );
        })}
      </nav>
      {/* Logout button at bottom */}
      <div className={`p-2 md:p-4 ${collapsed ? 'flex justify-center' : ''}`}>
        <button 
          onClick={logout}
          className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3 md:gap-4'} px-0 md:px-4 py-3 md:py-4 rounded-xl ${collapsed ? 'w-12 h-12' : 'w-full md:w-[220px] lg:w-[260px]'} text-left mx-auto hover:bg-[#f3f0ff] dark:hover:bg-[#232323] text-[#222] dark:text-dark-text text-base md:text-xl font-semibold`}
        >
          <span className={`flex items-center justify-center ${collapsed ? 'w-7 h-7' : 'w-7 h-7 md:w-8 md:h-8'}`}>
            <ArrowRightOnRectangleIcon className={`${collapsed ? 'w-7 h-7' : 'w-7 h-7 md:w-8 md:h-8'} text-[#222] dark:text-dark-text`} />
          </span>
          {!collapsed && <span className="truncate w-full">{t('signOut')}</span>}
        </button>
      </div>
    </aside>
  );
} 