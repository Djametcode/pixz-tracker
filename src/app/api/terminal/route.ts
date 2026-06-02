import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.PIXZ_API_URL || "http://45.63.69.82:9999";

function getToken(req: NextRequest): string | null {
  return req.cookies.get("auth_token")?.value || null;
}

export async function POST(req: NextRequest) {
  const token = getToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { command, timeout } = await req.json();
    const resp = await fetch(`${API_BASE}/terminal`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ command, timeout }),
    });
    const data = await resp.json();
    return NextResponse.json(data, { status: resp.status });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
