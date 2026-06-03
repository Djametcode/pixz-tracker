import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || "827981278";

function getToken(req: NextRequest): string | null {
  return req.cookies.get("auth_token")?.value || null;
}

export async function POST(req: NextRequest) {
  const token = getToken(req);
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!BOT_TOKEN) {
    return NextResponse.json({ error: "Telegram bot not configured" }, { status: 500 });
  }

  try {
    const { message } = await req.json();
    if (!message?.trim()) {
      return NextResponse.json({ error: "Empty message" }, { status: 400 });
    }

    // Send to Telegram
    const resp = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: `[Website] ${message}`,
          parse_mode: "HTML",
        }),
      }
    );

    const data = await resp.json();
    if (!data.ok) {
      return NextResponse.json({ error: data.description || "Telegram API error" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message_id: data.result.message_id,
      text: "Message sent to Telegram. Response will appear in your Telegram chat.",
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const token = getToken(req);
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!BOT_TOKEN) {
    return NextResponse.json({ messages: [], error: "Telegram bot not configured" });
  }

  try {
    // Poll Telegram for recent messages
    const resp = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=-10&timeout=1`
    );
    const data = await resp.json();

    if (!data.ok) {
      return NextResponse.json({ messages: [], offset: 0 });
    }

    // Filter for our chat and extract messages
    const messages = (data.result || [])
      .filter((u: any) => u.message?.chat?.id?.toString() === CHAT_ID)
      .map((u: any) => ({
        id: u.message.message_id,
        text: u.message.text || "",
        from_user: false,
        timestamp: u.message.date,
      }))
      .filter((m: any) => m.text && !m.text.startsWith("[Website]"));

    const lastOffset = data.result?.length > 0
      ? Math.max(...data.result.map((u: any) => u.update_id)) + 1
      : 0;

    return NextResponse.json({ messages, offset: lastOffset });
  } catch (e: any) {
    return NextResponse.json({ messages: [], error: e.message });
  }
}
