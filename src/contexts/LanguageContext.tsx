'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'ua' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  ua: {
    // Header
    langUA: 'UA',
    langEN: 'EN',
    
    // Sidebar
    dashboard: 'Дашборд',
    chats: 'Чати',
    calendar: 'Календар',
    calculator: 'Калькулятор',
    
    // Dashboard
    usersCount: 'Кількість користувачів',
    chatsCount: 'Кількість чатів',
    activeChats: 'Активні чати',
    perWeek: 'за тиждень',
    selectSession: 'Виберіть сесію для перегляду деталей',
    
    // Chat
    selectChat: 'Виберіть чат',
    chatWith: 'Чат з',
    generateReport: 'Згенерувати звіт',
    selectSessionToStart: 'Виберіть сесію для початку чату',
    selectClientFromList: 'Оберіть клієнта зі списку зліва для перегляду повідомлень',
    loading: 'Завантаження...',
    sessionNotFound: 'Сесію не знайдено',
    noMessages: 'Немає повідомлень у цій сесії',
    noMessagesInSession: 'Немає повідомлень',
    client: 'Клієнт',
    manager: 'Менеджер',
    ai: 'AI',
    noText: '(без тексту)',
    generatingReport: 'Генерується звіт…',
    
    // SalesChatView
    chat: 'Чат',
    autoSummary: 'Auto-summary',
    estimate: 'Estimate',
    researchHighlights: 'Research Highlights',
    notEnoughData: 'Недостатньо даних',
    generatingSummary: 'Генерується summary...',
    generatingEstimate: 'Генерується estimate...',
    generatingHighlights: 'Генерується highlights...',
    
    // Calendar
    monday: 'Понеділник',
    tuesday: 'Вівторок',
    wednesday: 'Середа',
    thursday: 'Четвер',
    friday: 'Пʼятниця',
    saturday: 'Субота',
    sunday: 'Неділя',
    month: 'Місяць',
    week: 'Тиждень',
    day: 'День',
    year: 'Рік',
    
    // Auth
    signIn: 'Увійти',
    signUp: 'Зареєструватися',
    signOut: 'Вийти',
    email: 'Email',
    password: 'Пароль',
    confirmPassword: 'Підтвердіть пароль',
    signInWithGoogle: 'Увійти через Google',
    signUpWithGoogle: 'Зареєструватися через Google',
    signInToAccount: 'Увійти в обліковий запис',
    createAccount: 'Створити обліковий запис',
    passwordsDoNotMatch: 'Паролі не співпадають',
    failedToSignIn: 'Помилка входу. Перевірте дані.',
    failedToSignUp: 'Помилка реєстрації. Спробуйте ще раз.',
    user: 'Користувач',
  },
  en: {
    // Header
    langUA: 'UA',
    langEN: 'EN',
    
    // Sidebar
    dashboard: 'Dashboard',
    chats: 'Chats',
    calendar: 'Calendar',
    calculator: 'Calculator',
    
    // Dashboard
    usersCount: 'Users Count',
    chatsCount: 'Chats Count',
    activeChats: 'Active Chats',
    perWeek: 'per week',
    selectSession: 'Select session to view details',
    
    // Chat
    selectChat: 'Select Chat',
    chatWith: 'Chat with',
    generateReport: 'Generate Report',
    selectSessionToStart: 'Select session to start chat',
    selectClientFromList: 'Choose client from left list to view messages',
    loading: 'Loading...',
    sessionNotFound: 'Session not found',
    noMessages: 'No messages in this session',
    noMessagesInSession: 'No messages',
    client: 'Client',
    manager: 'Manager',
    ai: 'AI',
    noText: '(no text)',
    generatingReport: 'Generating report...',
    
    // SalesChatView
    chat: 'Chat',
    autoSummary: 'Auto-summary',
    estimate: 'Estimate',
    researchHighlights: 'Research Highlights',
    notEnoughData: 'Not enough data',
    generatingSummary: 'Generating summary...',
    generatingEstimate: 'Generating estimate...',
    generatingHighlights: 'Generating highlights...',
    
    // Calendar
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
    month: 'Month',
    week: 'Week',
    day: 'Day',
    year: 'Year',
    
    // Auth
    signIn: 'Sign In',
    signUp: 'Sign Up',
    signOut: 'Sign Out',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    signInWithGoogle: 'Sign in with Google',
    signUpWithGoogle: 'Sign up with Google',
    signInToAccount: 'Sign in to your account',
    createAccount: 'Create your account',
    passwordsDoNotMatch: 'Passwords do not match',
    failedToSignIn: 'Failed to sign in. Please check your credentials.',
    failedToSignUp: 'Failed to register. Please try again.',
    user: 'User',
  }
};

const LanguageContext = createContext<LanguageContextType>({} as LanguageContextType);

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('ua');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.ua] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}; 