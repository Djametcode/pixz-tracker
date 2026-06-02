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
        className="fixed bottom-36 right-4 z-[60] w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg flex items-center justify-center transition-all active:scale-95"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path fillRule="evenodd" d="M2.25 6a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V6Zm3.97.97a.75.75 0 0 1 1.06 0l2.25 2.25a.75.75 0 0 1 0 1.06l-2.25 2.25a.75.75 0 0 1-1.06-1.06l1.72-1.72-1.72-1.72a.75.75 0 0 1 0-1.06Zm4.28 4.28a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5h-3Z" clipRule="evenodd" />
        </svg>
      </button>
      {open && (
        <div className="fixed bottom-52 right-4 z-[60] w-96 max-h-[500px] bg-gray-950 rounded-2xl shadow-2xl border border-gray-800 flex flex-col overflow-hidden font-mono">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 border-b border-gray-800">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="text-xs text-gray-400 ml-2">Pixz Terminal</span>
            <button onClick={() => setOpen(false)} className="ml-auto text-gray-500 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 text-xs text-green-400 min-h-[200px] max-h-[350px]">
            {lines.length === 0 && <div className="text-gray-600">Type a command to get started...</div>}
            {lines.map((line) => (
              <div key={line.id} className="mb-1">
                {line.command !== undefined && (
                  <div className="flex gap-1">
                    <span className="text-emerald-500">$</span>
                    <span className="text-white">{line.command}</span>
                  </div>
                )}
                {line.output && <pre className="text-gray-300 whitespace-pre-wrap">{line.output}</pre>}
                {line.error && <pre className="text-red-400 whitespace-pre-wrap">{line.error}</pre>}
                {line.exitCode !== undefined && line.exitCode !== 0 && (
                  <div className="text-red-500 text-[10px]">exit: {line.exitCode}</div>
                )}
              </div>
            ))}
            {running && (
              <div className="flex items-center gap-1 text-yellow-400">
                <div className="w-3 h-3 border border-yellow-400 border-t-transparent rounded-full animate-spin" />
                running...
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <div className="flex items-center gap-2 p-3 border-t border-gray-800">
            <span className="text-emerald-500 text-xs">$</span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="command..."
              className="flex-1 bg-transparent text-xs text-white placeholder:text-gray-600 outline-none"
              disabled={running}
            />
          </div>
        </div>
      )}
    </>
  );
}
