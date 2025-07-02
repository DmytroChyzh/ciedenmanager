import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { messages, model = 'gpt-3.5-turbo' } = await req.json();
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'No OpenAI API key' }, { status: 500 });
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    return NextResponse.json({ error: data.error?.message || 'OpenAI error' }, { status: 500 });
  }

  return NextResponse.json({ result: data.choices?.[0]?.message?.content || '' });
} 