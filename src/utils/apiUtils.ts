const SYSTEM_PROMPT = "Ти — AI-помічник менеджерів з продажу компанії Cieden. Відповідай на будь-які питання чітко, ввічливо, професійно. Допомагай з аналізом продажів, стратегіями, обробкою об'єкцій та покращенням ефективності роботи менеджерів.";

export async function sendToOpenAI(messages: { role: string; content: string }[]): Promise<string> {
  const response = await fetch("/api/assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  return data.text || "Помилка: порожня відповідь";
}

export function prepareOpenAIMessages(messages: { role: 'user' | 'ai'; text: string }[]): { role: string; content: string }[] {
  return [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages.map(msg => ({
      role: msg.role === 'ai' ? 'assistant' : 'user',
      content: msg.text,
    })),
  ];
}

export { SYSTEM_PROMPT }; 