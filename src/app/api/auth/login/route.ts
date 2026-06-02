import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.PIXZ_API_URL || "http://45.63.69.82:9999";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    const resp = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await resp.json();
    if (!resp.ok) return NextResponse.json(data, { status: resp.status });

    const res = NextResponse.json(data);
    res.cookies.set("auth_token", data.token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: data.expires_in,
      path: "/",
    });
    return res;
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
