import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function CalculatorPage() {
  return (
    <div className="min-h-screen bg-[#F7F8F9] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold text-[#651FFF]">Calculator</h1>
          {/* Add your calculator UI here, all text in English */}
        </main>
      </div>
    </div>
  );
} 