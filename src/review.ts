import OpenAI from 'openai';
import { SYSTEM } from './prompt.js';

export type Finding = {
  file: string;
  line: number;
  severity: 'high' | 'medium' | 'low';
  category: string;
  issue: string;
  why: string;
};

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

export async function review(diff: string): Promise<Finding[]> {
  const res = await client.chat.completions.create({
    model: 'openai/gpt-oss-120b',
    temperature: 0.1,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM },
      { role: 'user', content: diff },
    ],
  });

  const raw = res.choices[0]?.message?.content ?? '{"findings":[]}';
  try {
    return JSON.parse(raw).findings ?? [];
  } catch {
    console.error('model returned non-JSON, skipping');
    return [];
  }
}
