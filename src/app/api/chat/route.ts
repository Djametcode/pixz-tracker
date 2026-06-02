import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.PIXZ_API_URL || "http://45.63.69.82:9999";

function getToken(req: NextRequest): string | null {
  return req.cookies.get("auth_token")?.value || null;
}

export async function POST(req: NextRequest) {
  const token = getToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { message } = await req.json();
    const resp = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message }),
    });
    const data = await resp.json();
    return NextResponse.json(data, { status: resp.status });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const token = getToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const after = req.nextUrl.searchParams.get("after") || "0";
    const resp = await fetch(`${API_BASE}/chat/updates?after=${after}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await resp.json();
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ messages: [], error: e.message });
  }
}
