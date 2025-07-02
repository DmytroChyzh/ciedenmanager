"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { signUp, signInWithGoogle, user } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError(t('passwordsDoNotMatch'));
      return;
    }
    try {
      await signUp(email, password);
      router.push('/dashboard');
    } catch (error) {
      setError(t('failedToSignUp'));
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#e3eafe] via-[#f7f8fa] to-[#f0f4ff] relative overflow-hidden">
      {/* Логотип */}
      <div className="absolute top-6 left-8 flex items-center gap-2 z-10">
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="16" fill="#ede7ff"/>
          <path d="M18 7l2.09 6.26H26l-5.18 3.76L22.18 23 18 19.27 13.82 23l1.36-5.98L10 13.26h5.91L18 7z" fill="#651FFF"/>
          <circle cx="27" cy="10" r="3" fill="#FFB300"/>
        </svg>
        <span className="font-extrabold text-xl text-[#222] tracking-tight leading-tight select-none">
          <span className="text-[#651FFF]">Cieden</span> Manager
        </span>
      </div>
      {/* Cloud-style картка */}
      <div className="w-full max-w-md mx-auto rounded-3xl shadow-2xl bg-white/80 backdrop-blur-md border border-[#ede7ff] px-8 py-10 flex flex-col items-center z-10">
        <h2 className="text-2xl font-bold text-[#222] mb-2 text-center">{t('createAccount')}</h2>
        <p className="text-gray-500 text-center mb-6">CRM для сучасних менеджерів</p>
        <form className="w-full space-y-4" onSubmit={handleSubmit}>
          <div className="relative">
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="block w-full pl-10 py-3 rounded-xl border border-gray-200 bg-white/80 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#651FFF] focus:border-[#651FFF] text-base shadow-sm"
              placeholder={t('email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#651FFF] pointer-events-none" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5A2.25 2.25 0 0 1 19.5 19.5H4.5a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5H4.5a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-.659 1.591l-7.09 7.09a2.25 2.25 0 0 1-3.182 0l-7.09-7.09A2.25 2.25 0 0 1 2.25 6.993V6.75" />
              </svg>
            </span>
          </div>
          <div className="relative">
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="block w-full pl-10 py-3 rounded-xl border border-gray-200 bg-white/80 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#651FFF] focus:border-[#651FFF] text-base shadow-sm"
              placeholder={t('password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#651FFF] pointer-events-none" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V7.125A3.375 3.375 0 0 0 13.125 3.75h-2.25A3.375 3.375 0 0 0 7.5 7.125V10.5m9 0A2.25 2.25 0 0 1 21 12.75v4.125A2.625 2.625 0 0 1 18.375 19.5H5.625A2.625 2.625 0 0 1 3 16.875V12.75A2.25 2.25 0 0 1 5.25 10.5m12 0h-12" />
              </svg>
            </span>
          </div>
          <div className="relative">
            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              className="block w-full pl-10 py-3 rounded-xl border border-gray-200 bg-white/80 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#651FFF] focus:border-[#651FFF] text-base shadow-sm"
              placeholder={t('confirmPassword')}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#651FFF] pointer-events-none" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V7.125A3.375 3.375 0 0 0 13.125 3.75h-2.25A3.375 3.375 0 0 0 7.5 7.125V10.5m9 0A2.25 2.25 0 0 1 21 12.75v4.125A2.625 2.625 0 0 1 18.375 19.5H5.625A2.625 2.625 0 0 1 3 16.875V12.75A2.25 2.25 0 0 1 5.25 10.5m12 0h-12" />
              </svg>
            </span>
          </div>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#651FFF] text-white font-semibold text-base shadow-md hover:bg-[#5A1BE0] transition mb-2"
          >
            {t('signUp')}
          </button>
        </form>
        <div className="w-full flex items-center my-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="mx-3 text-gray-400 text-sm">або</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <button
          type="button"
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-300 bg-white/90 text-gray-700 font-medium shadow-sm hover:bg-gray-50 transition"
        >
          <svg className="w-5 h-5" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.22l6.85-6.85C35.91 2.54 30.28 0 24 0 14.82 0 6.71 5.82 2.69 14.09l7.98 6.19C12.33 13.16 17.68 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.5c0-1.64-.15-3.22-.42-4.74H24v9.04h12.42c-.54 2.9-2.18 5.36-4.64 7.04l7.19 5.59C43.99 37.09 46.1 31.27 46.1 24.5z"/><path fill="#FBBC05" d="M10.67 28.28c-1.04-3.08-1.04-6.48 0-9.56l-7.98-6.19C.64 16.18 0 20.01 0 24s.64 7.82 2.69 11.47l7.98-6.19z"/><path fill="#EA4335" d="M24 48c6.28 0 11.91-2.09 15.91-5.68l-7.19-5.59c-2.01 1.35-4.58 2.17-8.72 2.17-6.32 0-11.67-3.66-13.33-8.78l-7.98 6.19C6.71 42.18 14.82 48 24 48z"/></g></svg>
          {t('signUpWithGoogle')}
        </button>
        <div className="w-full text-center mt-6">
          <a href="/login" className="text-[#651FFF] hover:text-[#5A1BE0] font-medium transition">
            {t('signIn')}
          </a>
        </div>
      </div>
      {/* Декоративні хмари/градієнти */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[300px] bg-[#ede7ff] rounded-full blur-3xl opacity-60" />
        <div className="absolute -top-24 right-0 w-[400px] h-[250px] bg-[#b3baff] rounded-full blur-2xl opacity-40" />
      </div>
    </div>
  );
} 