import React from 'react';
import { examplePrompts } from '@/utils/chatExamples';

interface ExamplePromptsProps {
  onSelectPrompt: (prompt: string) => void;
}

export default function ExamplePrompts({ onSelectPrompt }: ExamplePromptsProps) {
  return (
    <div className="mt-8">
      <h3 className="text-lg font-medium text-gray-700 mb-4">Популярні запити:</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {examplePrompts.map((example, index) => (
          <button
            key={index}
            onClick={() => onSelectPrompt(example.prompt)}
            className="text-left p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
          >
            <h4 className="font-medium text-gray-800 group-hover:text-blue-800 transition-colors">
              {example.title}
            </h4>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {example.prompt}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
} 