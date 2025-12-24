import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`SELECT * FROM feedback ORDER BY created_at DESC LIMIT 50`;
    return NextResponse.json({ data: rows });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Rate Limiting
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const sql = neon(process.env.DATABASE_URL!);
    
    // Check last request
    const rateLimit = await sql`SELECT last_request FROM rate_limits WHERE ip = ${ip}`;
    
    if (rateLimit.length > 0) {
      const lastRequest = new Date(rateLimit[0].last_request).getTime();
      const now = new Date().getTime();
      if (now - lastRequest < 60000) { // 60 seconds
        return NextResponse.json(
          { error: "Whoa, slow down! You can only post once per minute." }, 
          { status: 429 }
        );
      }
    }

    // Update timestamp
    await sql`
      INSERT INTO rate_limits (ip, last_request) 
      VALUES (${ip}, NOW()) 
      ON CONFLICT (ip) 
      DO UPDATE SET last_request = NOW();
    `;

    // AI Analysis
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a product manager assistant. Analyze the following user feedback. 1. Categorize it as 'bug', 'feature', or 'other'. 2. Determine sentiment as 'positive', 'neutral', or 'negative'. 3. Determine 'is_toxic' as boolean (true if rude, offensive, or hate speech). Return strictly JSON: { \"category\": \"...\", \"sentiment\": \"...\", \"is_toxic\": boolean }."
        },
        { role: "user", content }
      ],
      model: "gpt-3.5-turbo",
      response_format: { type: "json_object" },
    });

    const analysis = JSON.parse(completion.choices[0].message.content || '{}');
    
    // Moderation Check
    if (analysis.is_toxic) {
      return NextResponse.json(
        { error: "That's a bit rude to post... let's keep it constructive!" }, 
        { status: 400 }
      );
    }

    const category = analysis.category || 'other';
    const sentiment = analysis.sentiment || 'neutral';

    // DB Insert
    const result = await sql`
      INSERT INTO feedback (content, category, sentiment)
      VALUES (${content}, ${category}, ${sentiment})
      RETURNING *;
    `;

    return NextResponse.json({ data: result[0] }, { status: 201 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id, passcode } = await request.json();

    if (passcode !== 'winiscool') {
      return NextResponse.json({ error: 'Invalid Passcode! Nice try.' }, { status: 401 });
    }

    if (!id) {
       return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);
    await sql`DELETE FROM feedback WHERE id = ${id}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
