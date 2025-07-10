import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: 1000,
        temperature: 0.7,
        stream: false,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('OpenAI API error:', errorData);
      return NextResponse.json({ 
        error: errorData.error?.message || 'OpenAI API request failed' 
      }, { status: res.status });
    }

    const data = await res.json();
    const responseText = data.choices?.[0]?.message?.content;
    
    if (!responseText) {
      return NextResponse.json({ error: 'No response from OpenAI' }, { status: 500 });
    }

    return NextResponse.json({ text: responseText });
  } catch (error) {
    console.error('Assistant API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 