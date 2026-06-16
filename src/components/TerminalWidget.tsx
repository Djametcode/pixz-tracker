"use client";

import { useState, useRef, useEffect } from "react";

interface TerminalLine {
  id: number;
  command?: string;
  output?: string;
  error?: string;
  exitCode?: number;
}

export default function TerminalWidget() {
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [input, setInput] = useState("");
  const [running, setRunning] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const runCommand = async () => {
    const cmd = input.trim();
    if (!cmd || running) return;

    setHistory((prev) => [...prev, cmd]);
    setHistoryIdx(-1);
    setLines((prev) => [...prev, { id: Date.now(), command: cmd }]);
    setInput("");
    setRunning(true);

    try {
      const res = await fetch("/api/terminal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: cmd }),
      });
      const data = await res.json();
      if (res.ok) {
        setLines((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            output: data.stdout || "",
            error: data.stderr || "",
            exitCode: data.exit_code,
          },
        ]);
      } else {
        setLines((prev) => [
          ...prev,
          { id: Date.now() + 1, error: data.error || "Command failed", exitCode: 1 },
        ]);
      }
    } catch (e: any) {
      setLines((prev) => [...prev, { id: Date.now() + 1, error: e.message, exitCode: 1 }]);
    }
    setRunning(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      runCommand();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length > 0) {
        const newIdx = historyIdx < history.length - 1 ? historyIdx + 1 : historyIdx;
        setHistoryIdx(newIdx);
        setInput(history[history.length - 1 - newIdx] || "");
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIdx > 0) {
        const newIdx = historyIdx - 1;
        setHistoryIdx(newIdx);
        setInput(history[history.length - 1 - newIdx] || "");
      } else {
        setHistoryIdx(-1);
        setInput("");
      }
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-36 right-4 z-[60] w-14 h-14 rounded-full text-white shadow-lg flex items-center justify-center transition-all active:scale-95"
        style={{ backgroundColor: "var(--sage)" }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path fillRule="evenodd" d="M2.25 6a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V6Zm3.97.97a.75.75 0 0 1 1.06 0l2.25 2.25a.75.75 0 0 1 0 1.06l-2.25 2.25a.75.75 0 0 1-1.06-1.06l1.72-1.72-1.72-1.72a.75.75 0 0 1 0-1.06Zm4.28 4.28a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5h-3Z" clipRule="evenodd" />
        </svg>
      </button>
      {open && (
        <div className="fixed bottom-52 right-4 z-[60] w-96 max-h-[500px] rounded-2xl shadow-2xl flex flex-col overflow-hidden font-mono" style={{ backgroundColor: "#1A1614", border: "1px solid #3A322B" }}>
          <div className="flex items-center gap-2 px-4 py-2" style={{ backgroundColor: "#241F1B", borderBottom: "1px solid #3A322B" }}>
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#B94646" }} />
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#C4956A" }} />
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#7A8B6F" }} />
            </div>
            <span className="text-xs ml-2" style={{ color: "var(--text-muted)" }}>Pixz Terminal</span>
            <button onClick={() => setOpen(false)} className="ml-auto" style={{ color: "var(--text-muted)" }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 text-xs min-h-[200px] max-h-[350px]" style={{ color: "#7A8B6F" }}>
            {lines.length === 0 && <div style={{ color: "var(--text-muted)" }}>Type a command to get started...</div>}
            {lines.map((line) => (
              <div key={line.id} className="mb-1">
                {line.command !== undefined && (
                  <div className="flex gap-1">
                    <span style={{ color: "#C4956A" }}>$</span>
                    <span style={{ color: "var(--text)" }}>{line.command}</span>
                  </div>
                )}
                {line.output && <pre className="whitespace-pre-wrap" style={{ color: "var(--text-soft)" }}>{line.output}</pre>}
                {line.error && <pre className="whitespace-pre-wrap" style={{ color: "#B94646" }}>{line.error}</pre>}
                {line.exitCode !== undefined && line.exitCode !== 0 && (
                  <div className="text-[10px]" style={{ color: "#B94646" }}>exit: {line.exitCode}</div>
                )}
              </div>
            ))}
            {running && (
              <div className="flex items-center gap-1" style={{ color: "#C4956A" }}>
                <div className="w-3 h-3 border rounded-full animate-spin" style={{ borderColor: "#C4956A", borderTopColor: "transparent" }} />
                running...
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <div className="flex items-center gap-2 p-3" style={{ borderTop: "1px solid #3A322B" }}>
            <span className="text-xs" style={{ color: "#C4956A" }}>$</span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="command..."
              className="flex-1 bg-transparent text-xs outline-none"
              style={{ color: "var(--text)" }}
              disabled={running}
            />
          </div>
        </div>
      )}
    </>
  );
}
