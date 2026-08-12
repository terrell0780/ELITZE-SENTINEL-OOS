import { NextRequest, NextResponse } from "next/server";

const BRAIN_URL = process.env.NEXT_PUBLIC_RUNTIME_API || "http://localhost:8052";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const path = req.nextUrl.pathname.replace("/api/brain/", "");
    const res = await fetch(`${BRAIN_URL}/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const path = req.nextUrl.pathname.replace("/api/brain/", "");
    const search = req.nextUrl.search;
    const res = await fetch(`${BRAIN_URL}/${path}${search}`, {
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
