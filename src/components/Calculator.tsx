"use client";
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

function toRadians(deg: number) {
  return deg * (Math.PI / 180);
}

export default function Calculator() {
  const { t } = useLanguage();
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('0');
  const [lastAns, setLastAns] = useState('0');

  const handleClick = (val: string) => {
    if (val === 'C') {
      setExpression('');
      setResult('0');
    } else if (val === 'CE') {
      setExpression(expression.slice(0, -1));
    } else if (val === '=') {
      try {
        let expr = expression
          .replace(/π/g, `(${Math.PI})`)
          .replace(/e/g, `(${Math.E})`)
          .replace(/ans/g, lastAns)
          .replace(/EXP/g, 'e');
        expr = expr.replace(/√\(([^)]+)\)/g, (_, x) => `Math.sqrt(${x})`);
        expr = expr.replace(/([\d.]+)\^([\d.]+)/g, (_, a, b) => `Math.pow(${a},${b})`);
        expr = expr.replace(/([\d.]+)²/g, (_, a) => `Math.pow(${a},2)`);
        expr = expr.replace(/sin\(([^)]+)\)/g, (_, x) => `Math.sin(toRadians(${x}))`);
        expr = expr.replace(/cos\(([^)]+)\)/g, (_, x) => `Math.cos(toRadians(${x}))`);
        expr = expr.replace(/tan\(([^)]+)\)/g, (_, x) => `Math.tan(toRadians(${x}))`);
        expr = expr.replace(/ln\(([^)]+)\)/g, (_, x) => `Math.log(${x})`);
        expr = expr.replace(/log\(([^)]+)\)/g, (_, x) => `Math.log10(${x})`);
        // eslint-disable-next-line no-new-func
        const fn = new Function('toRadians', `return ${expr}`);
        const evalResult = fn(toRadians);
        setResult(evalResult.toString());
        setLastAns(evalResult.toString());
      } catch {
        setResult('Error');
      }
    } else if (val === '√') {
      setExpression(expression + '√(');
    } else if (val === 'x²') {
      setExpression(expression + '²');
    } else if (val === 'xʸ') {
      setExpression(expression + '^');
    } else if (["sin", "cos", "tan", "ln", "log"].includes(val)) {
      setExpression(expression + val + '(');
    } else if (val === 'π' || val === 'e' || val === '(' || val === ')' || val === 'EXP' || val === 'ans') {
      setExpression(expression + val);
    } else {
      setExpression(expression + val);
    }
  };

  const mainButtons = [
    [t('%'), t('CE'), t('C'), t('/')],
    [t('7'), t('8'), t('9'), t('*')],
    [t('4'), t('5'), t('6'), t('-')],
    [t('1'), t('2'), t('3'), t('+')],
    [t('0'), t('.'), t('='), ''],
  ];

  const advButtons = [
    t('('), t(')'), t('π'), t('e'),
    t('sin'), t('cos'), t('tan'), t('√'),
    t('ln'), t('log'), t('x²'), t('xʸ'),
    t('ans'), t('EXP')
  ];

  return (
    <div className="h-full w-full flex flex-col bg-[#f7f8fa] p-2 sm:p-4 md:p-8 m-0">
      <div className="bg-white rounded-2xl h-full max-h-full flex flex-col w-full min-h-0 justify-start items-center">
        {/* Дисплей */}
        <div className="w-full px-2 sm:px-4 md:px-8 pt-4 sm:pt-8 md:pt-10 pb-2 sm:pb-4 flex flex-col items-end">
          <div className="w-full text-right text-[#651FFF] text-3xl sm:text-5xl md:text-8xl font-bold tracking-tight leading-none select-all truncate bg-white rounded-xl shadow-md border border-[#ede7ff] p-2 sm:p-4 md:p-6 mb-2" style={{ fontWeight: 700 }}>{result}</div>
          <div className="w-full text-right text-[#888] text-lg sm:text-2xl md:text-5xl font-mono tracking-tight leading-none select-all truncate bg-white rounded-lg px-2 sm:px-4 py-1 sm:py-2" style={{ minHeight: '2.5rem' }}>{expression}</div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-start w-full pb-4 sm:pb-8">
          <div className="w-full max-w-full md:max-w-[1200px] mx-auto flex justify-center">
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 sm:gap-3 md:gap-4 w-full">
              {[
                ...mainButtons.flat().filter(Boolean),
                ...advButtons
              ].map((btn, i) => (
                <button
                  key={i}
                  className="w-full h-16 sm:h-20 md:h-24 rounded-xl transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#651FFF] select-none flex items-center justify-center bg-[#f6f2ff] text-[#651FFF] hover:bg-[#ede7ff] text-lg sm:text-2xl font-bold shadow-md"
                  onClick={() => handleClick(btn)}
                >
                  {btn}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 