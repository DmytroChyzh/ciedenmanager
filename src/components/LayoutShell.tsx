"use client";
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { usePathname } from 'next/navigation';

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8F9] dark:bg-dark-bg">
      <Header />
      <div className="flex flex-row">
        <Sidebar />
        <main className="flex-1 flex flex-col p-8 pb-8">{children}</main>
      </div>
    </div>
  );
} 