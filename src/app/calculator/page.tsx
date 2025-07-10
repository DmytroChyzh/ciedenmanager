'use client';
import Calculator from '@/components/Calculator';
import { useEffect } from 'react';

export default function CalculatorPage() {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);
  return (
    <div className="min-h-screen flex flex-col gap-8 overflow-hidden">
      <div className="flex-1 flex flex-col">
        <main className="flex-1">
          <Calculator />
        </main>
      </div>
    </div>
  );
} 