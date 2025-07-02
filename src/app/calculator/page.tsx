import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { useLanguage } from '@/contexts/LanguageContext';

export default function CalculatorPage() {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-[#F7F8F9] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold text-[#651FFF]">{t('calculator')}</h1>
        </main>
      </div>
    </div>
  );
} 