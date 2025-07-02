"use client";
import { UserCircleIcon, MoonIcon, SunIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { language, setLanguage, t } = useLanguage();
  const [theme, setTheme] = useState<'light'|'dark'>('light');
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();
  const [imgError, setImgError] = useState(false);

  const displayName = user?.displayName || user?.email || t('user');
  const photoURL = user?.photoURL;

  return (
    <div className="w-full mt-4 px-8">
      <div className="bg-white rounded-2xl px-8 py-3 flex items-center justify-end w-full">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} 
            className="p-2 rounded-full hover:bg-[#ede7ff] transition"
          >
            {theme === 'light' ? 
              <MoonIcon className="w-6 h-6 text-[#651FFF]"/> : 
              <SunIcon className="w-6 h-6 text-[#651FFF]"/>
            }
          </button>
          <div className="relative">
            <button 
              onClick={() => setLangDropdownOpen(!langDropdownOpen)} 
              className="flex items-center gap-1 px-3 py-1 rounded-lg border border-gray-200 bg-white text-[#651FFF] font-semibold"
            >
              {language === 'ua' ? t('langUA') : t('langEN')}
              <ChevronDownIcon className="w-4 h-4" />
            </button>
            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-20 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button 
                  onClick={() => { setLanguage('ua'); setLangDropdownOpen(false); }} 
                  className={`block w-full px-3 py-2 text-left ${language === 'ua' ? 'bg-[#ede7ff] font-bold' : ''}`}
                >
                  {t('langUA')}
                </button>
                <button 
                  onClick={() => { setLanguage('en'); setLangDropdownOpen(false); }} 
                  className={`block w-full px-3 py-2 text-left ${language === 'en' ? 'bg-[#ede7ff] font-bold' : ''}`}
                >
                  {t('langEN')}
                </button>
              </div>
            )}
          </div>
          <div className="relative">
            <button 
              onClick={() => setUserDropdownOpen(!userDropdownOpen)} 
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#ede7ff] transition"
            >
              {photoURL && !imgError ? (
                <img 
                  src={photoURL} 
                  alt={displayName}
                  className="w-8 h-8 rounded-full"
                  onError={() => setImgError(true)}
                />
              ) : (
                <UserCircleIcon className="w-8 h-8 text-[#651FFF]" />
              )}
              <span className="text-[#222] font-semibold">{displayName}</span>
              <ChevronDownIcon className="w-4 h-4 text-[#651FFF]" />
            </button>
            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button 
                  onClick={() => { logout(); setUserDropdownOpen(false); }} 
                  className="block w-full px-4 py-2 text-left hover:bg-[#ede7ff] text-[#222]"
                >
                  {t('signOut')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 