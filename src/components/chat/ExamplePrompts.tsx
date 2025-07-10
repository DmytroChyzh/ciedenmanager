import React from 'react';
import { examplePrompts } from '@/utils/chatExamples';
import { useTranslation } from 'react-i18next';

interface ExamplePromptsProps {
  onSelectPrompt: (prompt: string) => void;
}

export default function ExamplePrompts({ onSelectPrompt }: ExamplePromptsProps) {
  const { t } = useTranslation();
  return (
    <div className="mt-8">
      <h3 className="text-lg font-medium text-gray-700 mb-4">{t('popularPrompts')}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {examplePrompts.map((example, index) => (
          <button
            key={index}
            onClick={() => onSelectPrompt(t(example.promptKey))}
            className="text-left p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
          >
            <h4 className="font-medium text-gray-800 group-hover:text-blue-800 transition-colors">
              {t(example.titleKey)}
            </h4>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {t(example.promptKey)}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
} 