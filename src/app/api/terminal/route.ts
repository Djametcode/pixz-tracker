import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

const API_BASE = process.env.PIXZ_API_URL || "http://45.63.69.82:9999";
const VPS_PASSWORD = process.env.PIXZ_MASTER_PASSWORD || "KingPixz2026!";

function getToken(req: NextRequest): string | null {
  return req.cookies.get("auth_token")?.value || null;
}

async function getVpsToken(): Promise<string> {
  const resp = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: VPS_PASSWORD }),
  });
  const data = await resp.json();
  return data.token;
}

export async function POST(req: NextRequest) {
  const token = getToken(req);
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { command, timeout } = await req.json();
    if (!command?.trim()) {
      return NextResponse.json({ error: "Empty command" }, { status: 400 });
    }

    // Get VPS API token
    const vpsToken = await getVpsToken();

    // Execute command on VPS
    const resp = await fetch(`${API_BASE}/terminal`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${vpsToken}`,
      },
      body: JSON.stringify({ command, timeout: timeout || 30 }),
    });
    const data = await resp.json();
    return NextResponse.json(data, { status: resp.status });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
