import { Message } from '@/types/chat';

export const examplePrompts = [
  {
    titleKey: 'salesAnalysisTitle',
    promptKey: 'salesAnalysisPrompt'
  },
  {
    titleKey: 'salesStrategyTitle',
    promptKey: 'salesStrategyPrompt'
  },
  {
    titleKey: 'objectionHandlingTitle',
    promptKey: 'objectionHandlingPrompt'
  },
  {
    titleKey: 'productPresentationTitle',
    promptKey: 'productPresentationPrompt'
  },
  {
    titleKey: 'negotiationTitle',
    promptKey: 'negotiationPrompt'
  },
  {
    titleKey: 'planningTitle',
    promptKey: 'planningPrompt'
  }
];

export const sampleMessages: Message[] = [
  {
    id: "msg_1",
    role: "user",
    text: "Привіт! Я менеджер з продажу в Cieden. Допоможи мені покращити мої навички продажу.",
    timestamp: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: "msg_2", 
    role: "ai",
    text: "Привіт! Радий допомогти вам покращити навички продажу. Я можу допомогти з аналізом продажів, стратегіями, обробкою об'єкцій та багатьма іншими аспектами роботи менеджера з продажу. З чого б ви хотіли почати?",
    timestamp: new Date(Date.now() - 3500000).toISOString()
  },
  {
    id: "msg_3",
    role: "user", 
    text: "Розкажи про ефективні техніки закриття угоди",
    timestamp: new Date(Date.now() - 3400000).toISOString()
  },
  {
    id: "msg_4",
    role: "ai",
    text: "Ось кілька ефективних технік закриття угоди:\n\n1. **Техніка альтернативного питання** - пропонуйте клієнту вибір між двома варіантами\n2. **Техніка підсумовування** - підсумуйте всі переваги та запитайте про рішення\n3. **Техніка терміновості** - створіть відчуття терміновості\n4. **Техніка припущення** - дійте так, ніби угода вже закрита\n\nЯка з цих технік вас найбільше цікавить?",
    timestamp: new Date(Date.now() - 3300000).toISOString()
  }
]; 