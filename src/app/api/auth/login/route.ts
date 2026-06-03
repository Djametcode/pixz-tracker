import { NextRequest, NextResponse } from "next/server";
import { signToken } from "@//lib/auth";

// Get credentials from env vars (NOT hardcoded)
function getUsers(): Record<string, string> {
  const users: Record<string, string> = {};
  
  // Format: AUTH_USERS="djamet:pass1,pixz:pass2"
  const raw = process.env.AUTH_USERS;
  if (raw) {
    raw.split(",").forEach((pair) => {
      const [user, pass] = pair.split(":");
      if (user && pass) users[user.trim()] = pass.trim();
    });
  }
  
  // Fallback if env not set (should be removed in production)
  if (Object.keys(users).length === 0) {
    console.error("WARNING: AUTH_USERS env not set!");
  }
  
  return users;
}

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password required" },
        { status: 400 }
      );
    }

    const USERS = getUsers();
    const expected = USERS[username];
    if (!expected || expected !== password) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = signToken({ username, role: "admin" });

    const res = NextResponse.json({
      success: true,
      username,
      expires_in: 7 * 24 * 60 * 60, // 7 days
    });

    res.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return res;
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
