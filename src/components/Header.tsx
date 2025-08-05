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
    <header className="w-auto bg-white dark:bg-dark-card rounded-xl mt-1 xs:mt-2 sm:mt-3 md:mt-4 lg:mt-5 xl:mt-6 mx-1 xs:mx-2 sm:mx-3 md:mx-4 lg:mx-5 xl:mx-6 px-2 xs:px-3 sm:px-4 md:px-5 lg:px-6 flex items-center justify-between min-h-[40px] xs:min-h-[44px] sm:min-h-[48px] md:min-h-[52px] lg:min-h-[56px] xl:min-h-[60px] 2xl:min-h-[64px] ml-1 xs:ml-2 sm:ml-3 md:ml-4 lg:ml-5 xl:ml-6">
      <div className="flex items-center gap-1 xs:gap-2 sm:gap-3">
        <img src={theme === 'dark' ? '/logowhite.svg' : '/logo1.svg'} alt="Logo" className="w-16 xs:w-18 sm:w-20 md:w-22 lg:w-24 xl:w-26 2xl:w-28 h-6 xs:h-7 sm:h-8 md:h-9 lg:h-10 xl:h-11 2xl:h-12 object-contain" />
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <button 
          onClick={toggleTheme}
          className="p-1.5 sm:p-2 rounded-lg hover:bg-primary-light dark:hover:bg-dark-primary-light transition-colors"
        >
          {theme === 'light' ? 
            <MoonIcon className="w-5 h-5 text-primary dark:text-dark-primary"/> : 
            <SunIcon className="w-5 h-5 text-primary dark:text-dark-primary"/>
          }
        </button>
        <div className="relative">
          <button 
            onClick={() => setLangDropdownOpen(!langDropdownOpen)} 
            className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-primary dark:text-dark-primary font-medium text-sm"
          >
            {language === 'ua' ? t('langUA') : t('langEN')}
            <ChevronDownIcon className="w-4 h-4" />
          </button>
          {langDropdownOpen && (
            <div className="absolute right-0 mt-2 w-20 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg shadow-lg z-10">
              <button 
                onClick={() => { setLanguage('ua'); setLangDropdownOpen(false); }} 
                className={`block w-full px-3 py-2 text-left text-sm ${language === 'ua' ? 'bg-primary-light dark:bg-dark-primary-light font-medium' : 'hover:bg-gray-50 dark:hover:bg-dark-hover'}`}
              >
                {t('langUA')}
              </button>
              <button 
                onClick={() => { setLanguage('en'); setLangDropdownOpen(false); }} 
                className={`block w-full px-3 py-2 text-left text-sm ${language === 'en' ? 'bg-primary-light dark:bg-dark-primary-light font-medium' : 'hover:bg-gray-50 dark:hover:bg-dark-hover'}`}
              >
                {t('langEN')}
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2">
          {photoURL && !imgError ? (
            <img 
              src={photoURL} 
              alt={displayName}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-full"
              onError={() => setImgError(true)}
            />
          ) : (
            <UserCircleIcon className="w-6 h-6 sm:w-7 sm:h-7 text-primary dark:text-dark-primary" />
          )}
          <span className="text-gray-900 dark:text-dark-text font-medium text-sm">{displayName}</span>
        </div>
      </div>
    </header>
  );
} 