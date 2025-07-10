import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import ClientAuthGuard from '@/components/ClientAuthGuard';
import LayoutShell from '@/components/LayoutShell';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Manager Dashboard',
  description: 'Manager dashboard application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LanguageProvider>
          <ThemeProvider>
            <AuthProvider>
              <ClientAuthGuard>
                <LayoutShell>{children}</LayoutShell>
              </ClientAuthGuard>
            </AuthProvider>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
} 