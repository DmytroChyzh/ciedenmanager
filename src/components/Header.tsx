"use client";
import { UserCircleIcon, MoonIcon, SunIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';

export default function Header() {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const [imgError, setImgError] = useState(false);

  const displayName = user?.displayName || user?.email || t('user');
  const photoURL = user?.photoURL;

  return (
    <header className="w-auto bg-white dark:bg-dark-card rounded-2xl mt-2 sm:mt-4 md:mt-8 mx-2 sm:mx-4 md:mx-8 px-2 sm:px-4 md:px-8 flex items-center justify-between min-h-[56px] sm:min-h-[72px] md:min-h-[96px] border border-transparent dark:border-[#333]">
      <div className="flex items-center gap-2 sm:gap-4">
        <img src={theme === 'dark' ? '/logowhite.svg' : '/logo1.svg'} alt="Logo" className="w-24 sm:w-32 md:w-40 h-10 sm:h-14 md:h-16 object-contain" />
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-[#ede7ff] dark:hover:bg-[#292929] transition"
        >
          {theme === 'light' ? 
            <MoonIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#651FFF] dark:text-dark-orange"/> : 
            <SunIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#651FFF] dark:text-dark-orange"/>
          }
        </button>
        <div className="relative">
          <button 
            onClick={() => setLangDropdownOpen(!langDropdownOpen)} 
            className="flex items-center gap-1 px-2 sm:px-3 py-1 rounded-lg border border-gray-200 dark:border-[#333] bg-white dark:bg-dark-card text-[#651FFF] font-semibold text-sm sm:text-base"
          >
            {language === 'ua' ? t('langUA') : t('langEN')}
            <ChevronDownIcon className="w-4 h-4 dark:text-dark-orange" />
          </button>
          {langDropdownOpen && (
            <div className="absolute right-0 mt-2 w-20 bg-white dark:bg-dark-card border border-gray-200 dark:border-[#333] rounded-lg shadow-lg z-10">
              <button 
                onClick={() => { setLanguage('ua'); setLangDropdownOpen(false); }} 
                className={`block w-full px-3 py-2 text-left ${language === 'ua' ? 'bg-[#ede7ff] dark:bg-[#292929] font-bold' : ''}`}
              >
                {t('langUA')}
              </button>
              <button 
                onClick={() => { setLanguage('en'); setLangDropdownOpen(false); }} 
                className={`block w-full px-3 py-2 text-left ${language === 'en' ? 'bg-[#ede7ff] dark:bg-[#292929] font-bold' : ''}`}
              >
                {t('langEN')}
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 sm:gap-2 p-2">
          {photoURL && !imgError ? (
            <img 
              src={photoURL} 
              alt={displayName}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full"
              onError={() => setImgError(true)}
            />
          ) : (
            <UserCircleIcon className="w-7 h-7 sm:w-8 sm:h-8 text-[#651FFF] dark:text-dark-orange" />
          )}
          <span className="text-[#222] dark:text-dark-text font-semibold text-sm sm:text-base">{displayName}</span>
        </div>
      </div>
    </header>
  );
} 