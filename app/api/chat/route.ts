import { google } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { mistral } from '@ai-sdk/mistral';
import { generateText } from 'ai';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const openrouter = createOpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    const modelStack = [
      { id: 'gemini', name: 'Gemini 2.5 Flash', instance: google('gemini-2.5-flash') },
      
      { id: 'gpt', name: 'ChatGPT', instance: openrouter('openai/gpt-oss-120b:free') },
      
      { id: 'meta', name: 'Meta AI - Llama 3.3', instance: openrouter('meta-llama/llama-3.3-70b-instruct:free') },
      
      { id: 'mistral', name: 'Mistral Large', instance: mistral('mistral-large-latest') }
    ];

    const results = await Promise.all(
      modelStack.map(async (m) => {
        try {
          const { text } = await generateText({
            model: m.instance,
            prompt: prompt,
          });
          return { name: m.name, content: text, status: 'success' };
        } catch (err: any) {
          console.error(`Error in ${m.name}:`, err.message);
          return { name: m.name, content: `Error: ${err.message}`, status: 'error' };
        }
      })
    );

    return Response.json(results);
  } catch (error) {
    return Response.json({ error: "Broadcaster failed" }, { status: 500 });
  }
}