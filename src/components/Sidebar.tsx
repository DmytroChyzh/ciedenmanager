"use client";
import React from 'react';
import { HomeIcon, ChatBubbleLeftRightIcon, CalendarDaysIcon, CalculatorIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { language, t } = useLanguage();

  const menuItems = [
    { 
      key: 'dashboard', 
      label: t('dashboard'), 
      icon: <HomeIcon className="w-6 h-6" />,
      href: '/dashboard'
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
    <aside className="w-64 bg-white border-r border-[#ede7ff] flex flex-col px-4 z-30 min-h-screen">
      <div className="flex items-center gap-3 mt-6 mb-8 select-none">
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="16" fill="#ede7ff"/>
          <path d="M18 7l2.09 6.26H26l-5.18 3.76L22.18 23 18 19.27 13.82 23l1.36-5.98L10 13.26h5.91L18 7z" fill="#651FFF"/>
          <circle cx="27" cy="10" r="3" fill="#FFB300"/>
        </svg>
        <span className="font-extrabold text-xl text-[#222] tracking-tight leading-tight">
          <span className="text-[#651FFF]">Cieden</span> Manager
        </span>
      </div>
      
      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.key} href={item.href} legacyBehavior>
              <a className={`flex items-center gap-3 px-3 py-3 rounded-xl font-semibold transition w-full text-left text-base ${
                isActive 
                  ? 'bg-[#651FFF] text-white shadow' 
                  : 'hover:bg-[#ede7ff] text-[#373737]'
              }`}>
                <span className="w-6 h-6">
                  {React.cloneElement(item.icon, { 
                    className: `w-6 h-6 ${isActive ? 'text-white' : 'text-[#651FFF]'}` 
                  })}
                </span>
                {item.label}
              </a>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
} 