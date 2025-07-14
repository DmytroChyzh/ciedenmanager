"use client";
import React from 'react';
import { HomeIcon, ChatBubbleLeftRightIcon, CalendarDaysIcon, CalculatorIcon, SparklesIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { language, t } = useLanguage();
  const { logout } = useAuth();

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
    { 
      key: 'calculator', 
      label: t('calculator'), 
      icon: <CalculatorIcon className="w-6 h-6" />,
      href: '/calculator'
    },
  ];

  return (
    <aside className="bg-white dark:bg-dark-card rounded-2xl w-full md:w-[260px] lg:w-[300px] h-full md:h-[1070px] flex flex-col md:ml-8 md:mt-8 md:mb-4 border border-transparent dark:border-[#333]">
      <nav className="flex flex-col gap-6 md:gap-10 mt-8 md:mt-16 flex-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.key} href={item.href} legacyBehavior>
              <a className={`flex items-center gap-3 md:gap-4 px-4 md:px-6 py-3 md:py-4 rounded-xl text-base md:text-xl font-semibold transition w-full md:w-[220px] lg:w-[260px] text-left mx-auto ${
                isActive 
                  ? 'bg-[#ede7ff] dark:bg-[#292929] text-[#651FFF] dark:text-dark-orange' 
                  : 'hover:bg-[#f3f0ff] dark:hover:bg-[#232323] text-[#222] dark:text-dark-text'
              }`}>
                <span className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center">
                  {React.cloneElement(item.icon, { 
                    className: `w-7 h-7 md:w-8 md:h-8 ${isActive ? 'text-[#651FFF] dark:text-dark-orange' : 'text-[#222] dark:text-dark-text'}` 
                  })}
                </span>
                <span className="truncate w-full">{item.label}</span>
              </a>
            </Link>
          );
        })}
      </nav>
      {/* Logout button at bottom */}
      <div className="p-4 md:p-6">
        <button 
          onClick={logout}
          className="flex items-center gap-3 md:gap-4 px-4 md:px-6 py-3 md:py-4 rounded-xl text-base md:text-xl font-semibold transition w-full md:w-[220px] lg:w-[260px] text-left mx-auto hover:bg-[#f3f0ff] dark:hover:bg-[#232323] text-[#222] dark:text-dark-text"
        >
          <span className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center">
            <ArrowRightOnRectangleIcon className="w-7 h-7 md:w-8 md:h-8 text-[#222] dark:text-dark-text" />
          </span>
          <span className="truncate w-full">{t('signOut')}</span>
        </button>
      </div>
    </aside>
  );
} 