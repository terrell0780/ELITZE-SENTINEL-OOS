import { NextRequest, NextResponse } from "next/server";

const RUNTIME_API = process.env.NEXT_PUBLIC_RUNTIME_API || "http://localhost:8052";

export async function POST(req: NextRequest) {
  try {
    const { messages, model, ...params } = await req.json();
    
    const res = await fetch(`${process.env.NEXT_PUBLIC_RUNTIME_API || "http://localhost:8052"}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "meta-llama/llama-3.3-70b-instruct",
        messages,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });
    
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({ error: "Use POST" }, { status: 400 });
}