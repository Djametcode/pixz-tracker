"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  id: number;
  text: string;
  from_user: boolean;
  timestamp: number;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [polling, setPolling] = useState(false);
  const [lastOffset, setLastOffset] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const interval = setInterval(pollResponses, 5000);
    return () => clearInterval(interval);
  }, [open, lastOffset]);

  const pollResponses = async () => {
    if (polling) return;
    setPolling(true);
    try {
      const res = await fetch(`/api/chat/updates?after=${lastOffset}`);
      if (res.ok) {
        const data = await res.json();
        if (data.messages?.length > 0) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const newMsgs = data.messages.filter((m: Message) => !existingIds.has(m.id));
            return [...prev, ...newMsgs];
          });
        }
        if (data.offset) setLastOffset(data.offset);
      }
    } catch {}
    setPolling(false);
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;
    const userMsg: Message = { id: Date.now(), text, from_user: true, timestamp: Date.now() / 1000 };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      if (!res.ok) {
        const err = await res.json();
        setMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, text: `Error: ${err.error || "Failed"}`, from_user: false, timestamp: Date.now() / 1000 },
        ]);
      }
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, text: `Network error: ${e.message}`, from_user: false, timestamp: Date.now() / 1000 },
      ]);
    }
    setSending(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-20 right-4 z-[60] w-14 h-14 rounded-full text-white shadow-lg flex items-center justify-center transition-all active:scale-95"
        style={{ backgroundColor: "var(--accent)" }}
      >
        {open ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path fillRule="evenodd" d="M4.804 21c6.245 0 11.968-4.966 11.968-11.244 0-6.278-5.723-11.244-11.968-11.244C-1.441.512-7.164 5.478-7.164 11.756c0 2.42.858 4.66 2.29 6.46L-7.164 21l3.185-1.93A11.88 11.88 0 0 0 4.804 21Zm-2.37-5.088A9.74 9.74 0 0 1 2.434 11.756c0-5.38 4.806-9.744 10.334-9.744 5.529 0 10.335 4.364 10.335 9.744 0 5.38-4.806 9.744-10.335 9.744a10.34 10.34 0 0 1-4.873-1.152l-3.096 1.012 1.534-2.678Z" clipRule="evenodd" />
          </svg>
        )}
      </button>
      {open && (
        <div className="fixed bottom-36 right-4 z-[60] w-80 max-h-96 rounded-2xl shadow-2xl flex flex-col overflow-hidden" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2 px-4 py-3 text-white" style={{ backgroundColor: "var(--accent)" }}>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">P</div>
            <div className="flex-1">
              <div className="text-sm font-semibold">Chat with Pixz</div>
              <div className="text-[10px] opacity-70">Response via Telegram</div>
            </div>
            {polling && <div className="w-2 h-2 rounded-full bg-[#7A8B6F] animate-pulse" />}
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[200px] max-h-[280px]">
            {messages.length === 0 && (
              <div className="text-center py-8" style={{ color: "var(--text-muted)" }}>
                <p className="text-xs">Send a message to Pixz</p>
                <p className="text-[10px] mt-1">Responses come via Telegram</p>
              </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.from_user ? "justify-end" : "justify-start"}`}>
                <div className="max-w-[80%] px-3 py-2 rounded-2xl text-sm" style={msg.from_user ? { backgroundColor: "var(--accent)", color: "#FDFBF7", borderRadius: "1rem 1rem 0.25rem 1rem" } : { backgroundColor: "var(--bg)", color: "var(--text)", borderRadius: "1rem 1rem 1rem 0.25rem" }}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="flex items-center gap-2 p-3" style={{ borderTop: "1px solid var(--border)" }}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
              placeholder="Ask Pixz..."
              className="flex-1 rounded-xl px-3 py-2 text-sm outline-none"
              style={{ backgroundColor: "var(--bg)", color: "var(--text)", border: "1px solid var(--border)" }}
              disabled={sending}
            />
            <button
              onClick={sendMessage}
              disabled={sending || !input.trim()}
              className="w-9 h-9 rounded-xl text-white flex items-center justify-center disabled:opacity-50"
              style={{ backgroundColor: "var(--accent)" }}
            >
              {sending ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
