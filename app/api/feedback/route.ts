import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { rows } = await sql`SELECT * FROM feedback ORDER BY created_at DESC LIMIT 50`;
    return NextResponse.json({ data: rows });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // AI Analysis
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a product manager assistant. Analyze the following user feedback. Categorize it as 'bug', 'feature', or 'other'. Determine sentiment as 'positive', 'neutral', or 'negative'. Return strictly JSON: { \"category\": \"...\", \"sentiment\": \"...\" }."
        },
        { role: "user", content }
      ],
      model: "gpt-3.5-turbo",
      response_format: { type: "json_object" },
    });

    const analysis = JSON.parse(completion.choices[0].message.content || '{}');
    const category = analysis.category || 'other';
    const sentiment = analysis.sentiment || 'neutral';

    // DB Insert
    const result = await sql`
      INSERT INTO feedback (content, category, sentiment)
      VALUES (${content}, ${category}, ${sentiment})
      RETURNING *;
    `;

    return NextResponse.json({ data: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
