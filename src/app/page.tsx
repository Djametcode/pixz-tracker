"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ChatWidget from "@/components/ChatWidget";
import TerminalWidget from "@/components/TerminalWidget";
import SwipeCard from "@/components/SwipeCard";

/* ── Types ── */
interface Project {
  project: string;
  type: string;
  status: string;
  chain: string;
  accounts: string;
  date: string;
  source: string;
  mint_date: string;
  mint_price: string;
  notes: string;
  url: string;
  updatedAt?: string;
  createdAt?: string;
}

interface Stats {
  total_projects: number;
  total_whitelist: number;
  total_testnet: number;
  total_nft_mints: number;
  total_waitlist: number;
  twitter_sourced: number;
  telegram_sourced: number;
  submitted: number;
  active_campaigns: number;
  last_updated: string;
  upcoming_mints: number;
}

interface UpcomingMint {
  name: string;
  chain: string;
  price: string;
  date: string;
  image: string;
  twitter: string;
}

interface CronJob {
  job_id: string;
  name: string;
  schedule: string | { kind: string; expr?: string; display?: string; minutes?: number };
  enabled: boolean;
  state: string;
  last_status: string;
  last_run_at: string;
  next_run_at: string;
  deliver: string;
  skills: string[];
  no_agent: boolean;
  script: string;
}

interface VpsInfo {
  name: string;
  ip: string;
  status: 'online' | 'offline' | 'warning';
  cpu: number;
  ram: { used: number; total: number; percent: number };
  disk: { used: number; total: number; percent: number };
  uptime: string;
  gpu?: { name: string; util: number; mem: { used: number; total: number }; temp: number };
  services: { name: string; status: string }[];
  miners?: { name: string; hashrate: string; status: string }[];
}

/* ── Heroicons Solid (24x24, viewBox 0 0 24 24, fill currentColor) ── */
function HeroIcon({ path, className }: { path: string; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

function HeroIconMulti({ paths, className }: { paths: string[]; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      {paths.map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
}

const ICONS = {
  home: ["M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z", "M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z"],
  folder: ["M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15Z", "M1.5 10.146V6a3 3 0 0 1 3-3h5.379a2.25 2.25 0 0 1 1.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 0 1 3 3v1.146A4.483 4.483 0 0 0 19.5 9h-15a4.483 4.483 0 0 0-3 1.146Z"],
  ticket: ["M1.5 6.375c0-1.036.84-1.875 1.875-1.875h17.25c1.035 0 1.875.84 1.875 1.875v3.026a.75.75 0 0 1-.375.65 2.249 2.249 0 0 0 0 3.898.75.75 0 0 1 .375.65v3.026c0 1.035-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 0 1 1.5 17.625v-3.026a.75.75 0 0 1 .374-.65 2.249 2.249 0 0 0 0-3.898.75.75 0 0 1-.374-.65V6.375Z", "M16.5 5.25a.75.75 0 0 1 .75.75v.75a.75.75 0 0 1-1.5 0V6a.75.75 0 0 1 .75-.75Zm.75 4.5a.75.75 0 0 0-1.5 0v.75a.75.75 0 0 0 1.5 0v-.75Z", "M16.5 13.5a.75.75 0 0 1 .75.75v.75a.75.75 0 0 1-1.5 0v-.75a.75.75 0 0 1 .75-.75Zm.75 4.5a.75.75 0 0 0-1.5 0V18a.75.75 0 0 0 1.5 0v-.75Z", "M6 12a.75.75 0 0 1 .75-.75H12a.75.75 0 0 1 0 1.5H6.75A.75.75 0 0 1 6 12Zm.75 2.25a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5h-3Z"],
  flask: ["M10.5 3.798v5.02a3 3 0 0 1-.879 2.121l-2.377 2.377a9.845 9.845 0 0 1 5.091 1.013 8.315 8.315 0 0 0 5.713.636l.285-.071-3.954-3.955a3 3 0 0 1-.879-2.121v-5.02a23.614 23.614 0 0 0-3 0Zm4.5.138a.75.75 0 0 0 .093-1.495A24.837 24.837 0 0 0 12 2.25a25.048 25.048 0 0 0-3.093.191.75.75 0 0 0-.162 1.486 23.54 23.54 0 0 1 3.253.072v4.882a1.5 1.5 0 0 1-.44 1.06l-6.293 6.294c-1.62 1.621-.903 4.475 1.471 4.88 2.686.46 5.447.698 8.262.698 2.816 0 5.576-.239 8.262-.697 2.373-.406 3.092-3.26 1.47-4.881L15.44 9.879A1.5 1.5 0 0 1 15 8.818V3.936Z"],
  fire: ["M12.963 2.286a.75.75 0 0 0-1.071-.136 9.742 9.742 0 0 0-3.539 6.176 7.547 7.547 0 0 1-1.705-1.715.75.75 0 0 0-1.152-.082A9 9 0 1 0 15.68 4.534a7.46 7.46 0 0 1-2.717-2.248Z", "M15.75 14.25a3.75 3.75 0 1 1-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 0 1 1.925-3.546 3.75 3.75 0 0 1 3.255 3.718Z"],
  sun: ["M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75Z", "M7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0Z", "M18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59Z", "M21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75Z", "M17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591Z", "M12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18Z", "M7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59Z", "M6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z"],
  moon: ["M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z"],
  search: ["M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5Z", "M2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z"],
  externalLink: ["M15.75 2.25H21a.75.75 0 0 1 .75.75v5.25a.75.75 0 0 1-1.5 0V4.81L8.03 17.03a.75.75 0 0 1-1.06-1.06L19.19 3.75h-3.44a.75.75 0 0 1 0-1.5Z", "M5.25 6.75a1.5 1.5 0 0 0-1.5 1.5v10.5a1.5 1.5 0 0 0 1.5 1.5h10.5a1.5 1.5 0 0 0 1.5-1.5V10.5a.75.75 0 0 1 1.5 0v8.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V8.25a3 3 0 0 1 3-3h8.25a.75.75 0 0 1 0 1.5H5.25Z"],
  bolt: ["M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z"],
  arrowPath: ["M4.755 10.059a7.5 7.5 0 0 1 12.548-3.364l1.903 1.903h-3.183a.75.75 0 1 0 0 1.5h4.992a.75.75 0 0 0 .75-.75V4.356a.75.75 0 0 0-1.5 0v3.18l-1.9-1.9A9 9 0 0 0 3.306 9.67a.75.75 0 1 0 1.45.388Z", "M15.408 13.411a.75.75 0 0 0-.919.53 7.5 7.5 0 0 1-12.548 3.364l-1.902-1.903h3.183a.75.75 0 0 0 0-1.5H2.984a.75.75 0 0 0-.75.75v4.992a.75.75 0 0 0 1.5 0v-3.18l1.9 1.9a9 9 0 0 0 15.059-4.035.75.75 0 0 0-.53-.918Z"],
  star: ["M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"],
  check: ["M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z"],
  xMark: ["M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"],
  calendar: ["M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z"],
  clock: ["M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z"],
  users: ["M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"],
  sparkle: ["M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"],
};

/* ── Theme Hook ── */
function useTheme() {
  const [dark, setDark] = useState(true);
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light") setDark(false);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);
  return { dark, toggle: () => setDark((d) => !d) };
}

/* ── Helpers ── */
function timeAgo(dateStr?: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "baru saja";
  if (diffMin < 60) return `${diffMin} menit lalu`;
  if (diffHour < 24) return `${diffHour} jam lalu`;
  if (diffDay < 7) return `${diffDay} hari lalu`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)} minggu lalu`;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

function isNew(dateStr?: string): boolean {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const now = new Date();
  return (now.getTime() - date.getTime()) < 24 * 60 * 60 * 1000;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function computeStats(projects: Project[]): Stats {
  return {
    total_projects: projects.length,
    total_whitelist: projects.filter((p) => p.type.includes("whitelist") || p.type.includes("kol")).length,
    total_testnet: projects.filter((p) => p.type === "testnet" || p.type === "quest").length,
    total_nft_mints: projects.filter((p) => p.type.includes("nft") || p.type.includes("mint")).length,
    total_waitlist: projects.filter((p) => p.type.includes("waitlist") || p.type.includes("email")).length,
    twitter_sourced: projects.filter((p) => p.source === "twitter").length,
    telegram_sourced: projects.filter((p) => p.source === "telegram").length,
    submitted: projects.filter((p) => ["submitted", "success", "replied", "completed"].includes(p.status)).length,
    active_campaigns: projects.filter((p) => !["completed", "dropped", "expired", "failed", "missed"].includes(p.status)).length,
    last_updated: new Date().toISOString(),
    upcoming_mints: 0,
  };
}

function TypeIcon({ type }: { type: string }) {
  if (type.includes("whitelist") || type.includes("kol")) return <HeroIconMulti paths={ICONS.ticket} className="w-5 h-5" />;
  if (type.includes("nft") || type.includes("mint")) return <span className="text-base">🖼️</span>;
  if (type === "testnet") return <HeroIconMulti paths={ICONS.flask} className="w-5 h-5" />;
  if (type.includes("waitlist") || type.includes("email")) return <span className="text-base">📋</span>;
  return <HeroIconMulti paths={ICONS.folder} className="w-5 h-5" />;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; dot: string }> = {
    submitted: { bg: "bg-emerald-500/10 dark:bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
    success: { bg: "bg-emerald-500/10 dark:bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
    replied: { bg: "bg-emerald-500/10 dark:bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
    completed: { bg: "bg-emerald-500/10 dark:bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
    pending: { bg: "bg-amber-500/10 dark:bg-amber-500/10", text: "text-amber-700 dark:text-amber-400", dot: "bg-amber-500" },
    active: { bg: "bg-amber-500/10 dark:bg-amber-500/10", text: "text-amber-700 dark:text-amber-400", dot: "bg-amber-500" },
    logged: { bg: "bg-amber-500/10 dark:bg-amber-500/10", text: "text-amber-700 dark:text-amber-400", dot: "bg-amber-500" },
    hunting: { bg: "bg-amber-500/10 dark:bg-amber-500/10", text: "text-amber-700 dark:text-amber-400", dot: "bg-amber-500" },
    partial: { bg: "bg-orange-500/10 dark:bg-orange-500/10", text: "text-orange-700 dark:text-orange-400", dot: "bg-orange-500" },
    failed: { bg: "bg-red-500/10 dark:bg-red-500/10", text: "text-red-700 dark:text-red-400", dot: "bg-red-500" },
    closed: { bg: "bg-gray-500/10 dark:bg-gray-500/10", text: "text-gray-700 dark:text-gray-400", dot: "bg-gray-500" },
  };
  const { bg, text, dot } = map[status] || map.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot} animate-pulse`} />
      {status}
    </span>
  );
}

function SourceBadge({ source }: { source: string }) {
  if (source === "twitter") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-sky-500/10 text-sky-700 dark:text-sky-400">
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
      {source}
    </span>
  );
  if (source === "telegram") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-violet-500/10 text-violet-700 dark:text-violet-400">
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>
      {source}
    </span>
  );
  return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-500/10 text-gray-700 dark:text-gray-400">{source}</span>;
}

function NewBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 animate-pulse">
      <HeroIcon path={ICONS.sparkle[0]} className="w-2.5 h-2.5" />
      NEW
    </span>
  );
}

/* ── Main ── */
export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [upcomingMints, setUpcomingMints] = useState<UpcomingMint[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [cronJobs, setCronJobs] = useState<CronJob[]>([]);
  const [vpsList, setVpsList] = useState<VpsInfo[]>([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [mobileMenu, setMobileMenu] = useState(false);
  const { dark, toggle: toggleTheme } = useTheme();
  const router = useRouter();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/projects");
      if (res.status === 401) { router.push("/login"); return; }
      const data = await res.json();
      const loadedProjects = data.projects || [];
      setProjects(loadedProjects);
      setStats(computeStats(loadedProjects));
      setUpcomingMints(data.upcoming_mints || []);
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchCronJobs = async () => {
    try {
      const res = await fetch("/api/cron");
      if (res.ok) {
        const data = await res.json();
        setCronJobs(data.jobs || []);
      }
    } catch {}
  };

  const fetchVpsData = async () => {
    try {
      const res = await fetch("/api/vps");
      if (res.ok) {
        const data = await res.json();
        setVpsList(data.vps || []);
      }
    } catch {}
  };

  useEffect(() => { if (activeTab === "cron") fetchCronJobs(); }, [activeTab]);
  useEffect(() => { if (activeTab === "vps") fetchVpsData(); }, [activeTab]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const handleDeleteProject = (projectName: string) => {
    setProjects((prev) => prev.filter((p) => p.project !== projectName));
  };

  // Sort by updatedAt/createdAt (newest first)
  const sortedProjects = [...projects].sort((a, b) => {
    const dateA = new Date(a.updatedAt || a.createdAt || a.date || 0).getTime();
    const dateB = new Date(b.updatedAt || b.createdAt || b.date || 0).getTime();
    return dateB - dateA;
  });

  const filtered = sortedProjects.filter((p) => {
    if (filter !== "all" && p.type !== filter) return false;
    if (search && !p.project.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const tabs = [
    { id: "dashboard", icon: ICONS.home, label: "Home" },
    { id: "projects", icon: ICONS.folder, label: "Projects" },
    { id: "whitelist", icon: ICONS.ticket, label: "Whitelist" },
    { id: "testnets", icon: ICONS.flask, label: "Testnets" },
    { id: "failed", icon: ICONS.xMark, label: "Gagal" },
    { id: "vps", icon: ICONS.bolt, label: "VPS" },
    { id: "cron", icon: ICONS.arrowPath, label: "Cron" },
  ];

  const filterTabs = [
    { id: "all", label: "All" },
    { id: "whitelist", label: "Whitelist" },
    { id: "whitelist_kol", label: "KOL" },
    { id: "testnet", label: "Testnet" },
    { id: "nft_mint", label: "NFT" },
    { id: "email_waitlist", label: "Email" },
    { id: "waitlist", label: "Waitlist" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 animate-pulse">
            <HeroIconMulti paths={ICONS.bolt} className="w-8 h-8 text-indigo-500" />
          </div>
          <p className="text-gray-500 dark:text-slate-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 transition-colors duration-300">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-slate-800">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/10 flex items-center justify-center">
              <HeroIconMulti paths={ICONS.bolt} className="w-5 h-5 text-indigo-500" />
            </div>
            <span className="font-bold text-sm">PIXZ TRACKER</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
              {dark
                ? <HeroIconMulti paths={ICONS.sun} className="w-5 h-5 text-amber-400" />
                : <HeroIcon path={ICONS.moon[0]} className="w-5 h-5 text-slate-600" />
              }
            </button>
            <button onClick={handleLogout} className="btn-ghost text-xs px-3 py-2">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="max-w-lg mx-auto px-4 pt-4 pb-24 space-y-6">

        {/* Dashboard */}
        {activeTab === "dashboard" && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Projects", value: stats?.total_projects || 0, color: "indigo", paths: ICONS.folder },
                { label: "Whitelist", value: stats?.total_whitelist || 0, color: "emerald", paths: ICONS.ticket },
                { label: "Testnets", value: stats?.total_testnet || 0, color: "amber", paths: ICONS.flask },
                { label: "Active", value: stats?.active_campaigns || 0, color: "violet", paths: ICONS.fire },
              ].map((s) => (
                <div key={s.label} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-gray-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-lg bg-${s.color}-500/10 flex items-center justify-center`}>
                      <HeroIconMulti paths={s.paths} className={`w-4 h-4 text-${s.color}-500`} />
                    </div>
                  </div>
                  <div className={`text-2xl font-bold text-${s.color}-600 dark:text-${s.color}-400`}>{s.value}</div>
                  <div className="text-xs text-gray-500 dark:text-slate-500 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Source Breakdown */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-gray-200 dark:border-slate-800">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3">Source</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SourceBadge source="twitter" />
                  <span className="text-sm font-bold">{stats?.twitter_sourced || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <SourceBadge source="telegram" />
                  <span className="text-sm font-bold">{stats?.telegram_sourced || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-slate-400">Submitted</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{stats?.submitted || 0}</span>
                </div>
              </div>
            </div>

            {/* Upcoming Mints - Improved */}
            {upcomingMints.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <HeroIconMulti paths={ICONS.calendar} className="w-4 h-4 text-indigo-500" />
                    Upcoming Mints
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">{upcomingMints.length}</span>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollSnapType: "x mandatory", scrollbarWidth: "none" }}>
                  {upcomingMints
                    .sort((a, b) => {
                      // Sort: dated first, then TBA last
                      const hasDateA = a.date && !a.date.includes("TBA");
                      const hasDateB = b.date && !b.date.includes("TBA");
                      if (hasDateA && !hasDateB) return -1;
                      if (!hasDateA && hasDateB) return 1;
                      return 0;
                    })
                    .map((m, i) => {
                      const isTBA = !m.date || m.date.includes("TBA");
                      const isFree = m.price && m.price.toLowerCase().includes("free");

                      return (
                        <a key={i} href={m.twitter || "#"} target="_blank" rel="noopener noreferrer"
                          className={`flex-shrink-0 w-56 bg-white dark:bg-slate-900 rounded-2xl p-4 border active:scale-95 transition-all ${isTBA ? 'border-gray-200 dark:border-slate-800 opacity-70' : 'border-indigo-200 dark:border-indigo-900/50 shadow-sm shadow-indigo-500/10'}`}
                          style={{ scrollSnapAlign: "start" }}>
                          {/* Image + Name */}
                          <div className="flex items-center gap-3 mb-3">
                            <div className="relative">
                              <img alt={m.name} className="w-11 h-11 rounded-xl object-cover border border-gray-200 dark:border-slate-700" src={m.image} onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=6366f1&color=fff&size=44`; }} />
                              {isFree && (
                                <span className="absolute -top-1 -right-1 text-[8px] px-1 py-0.5 rounded-full bg-emerald-500 text-white font-bold">FREE</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-sm truncate">{m.name}</div>
                              <div className="text-[10px] text-gray-500 dark:text-slate-400 mt-0.5">{m.chain}</div>
                            </div>
                          </div>

                          {/* Date + Price */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <HeroIcon path={ICONS.clock[0]} className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
                              <span className={`text-xs font-medium ${isTBA ? 'text-gray-400 dark:text-slate-600' : 'text-indigo-600 dark:text-indigo-400'}`}>
                                {isTBA ? 'TBA' : m.date}
                              </span>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${isFree ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
                              {m.price || 'TBA'}
                            </span>
                          </div>
                        </a>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Recent Activity - REWORKED */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Recent Activity</h3>
                <span className="text-[10px] text-gray-400 dark:text-slate-500">{sortedProjects.length} total</span>
              </div>
              <div className="space-y-2">
                {sortedProjects.slice(0, 15).map((p, i) => {
                  const timestamp = p.updatedAt || p.createdAt || p.date;
                  const projectIsNew = isNew(p.updatedAt || p.createdAt);
                  const accountsList = p.accounts ? p.accounts.split(",").filter(a => a.trim()) : [];

                  return (
                    <SwipeCard key={i} projectName={p.project} onDelete={() => handleDeleteProject(p.project)}>
                      <a href={p.url || "#"} target="_blank" rel="noopener noreferrer" className="block bg-white dark:bg-slate-900 rounded-xl p-3 border border-gray-200 dark:border-slate-800 active:scale-[0.98] transition-transform">
                        {/* Top Row: Source + Timestamp */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <SourceBadge source={p.source} />
                            {projectIsNew && <NewBadge />}
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-slate-500">
                            <HeroIcon path={ICONS.clock[0]} className="w-3 h-3" />
                            <span>{timeAgo(timestamp)}</span>
                          </div>
                        </div>

                        {/* Project Name + Type */}
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="w-6 h-6 rounded-md bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-500 dark:text-slate-400">
                            <TypeIcon type={p.type} />
                          </div>
                          <span className="text-sm font-semibold truncate">{p.project}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 flex-shrink-0">{p.type}</span>
                        </div>

                        {/* Accounts (if any) */}
                        {accountsList.length > 0 && (
                          <div className="flex items-center gap-1.5 mb-1.5 ml-8">
                            <HeroIcon path={ICONS.users[0]} className="w-3 h-3 text-gray-400 dark:text-slate-500" />
                            <span className="text-[10px] text-gray-500 dark:text-slate-400 truncate">
                              {accountsList.length > 2
                                ? `${accountsList.slice(0, 2).map(a => a.trim()).join(", ")} +${accountsList.length - 2}`
                                : accountsList.map(a => a.trim()).join(", ")
                              }
                            </span>
                          </div>
                        )}

                        {/* Notes (if any) */}
                        {p.notes && (
                          <div className="text-[10px] text-gray-400 dark:text-slate-500 ml-8 mb-1.5 truncate">
                            {p.notes}
                          </div>
                        )}

                        {/* Bottom Row: Status + Date */}
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-slate-800">
                          <StatusBadge status={p.status} />
                          <span className="text-[10px] text-gray-400 dark:text-slate-500">{formatDate(timestamp)}</span>
                        </div>
                      </a>
                    </SwipeCard>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* All Projects - REWORKED */}
        {activeTab === "projects" && (
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <HeroIconMulti paths={ICONS.search} className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
              <input type="text" placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-shadow" />
            </div>
            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
              {filterTabs.map((t) => (
                <button key={t.id} onClick={() => setFilter(t.id)} className={`flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${filter === t.id ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400" : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-500 dark:text-slate-400"}`}>
                  {t.label}
                </button>
              ))}
            </div>
            {/* List - REWORKED with clear timestamps */}
            <div className="space-y-2">
              {filtered.map((p, i) => {
                const timestamp = p.updatedAt || p.createdAt || p.date;
                const projectIsNew = isNew(p.updatedAt || p.createdAt);
                const accountsList = p.accounts ? p.accounts.split(",").filter(a => a.trim()) : [];

                return (
                  <SwipeCard key={i} projectName={p.project} onDelete={() => handleDeleteProject(p.project)}>
                    <a href={p.url || "#"} target="_blank" rel="noopener noreferrer" className="block bg-white dark:bg-slate-900 rounded-xl p-3 border border-gray-200 dark:border-slate-800 active:scale-[0.98] transition-transform">
                      {/* Top Row: Source + Timestamp */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <SourceBadge source={p.source} />
                          {projectIsNew && <NewBadge />}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-slate-500">
                          <HeroIcon path={ICONS.clock[0]} className="w-3 h-3" />
                          <span>{timeAgo(timestamp)}</span>
                        </div>
                      </div>

                      {/* Project Name + Chain + Type */}
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-7 h-7 rounded-md bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-500 dark:text-slate-400">
                          <TypeIcon type={p.type} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold truncate">{p.project}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-gray-500 dark:text-slate-400">{p.chain}</span>
                            <span className="text-[10px] text-gray-300 dark:text-slate-700">·</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400">{p.type}</span>
                          </div>
                        </div>
                      </div>

                      {/* Accounts (if any) */}
                      {accountsList.length > 0 && (
                        <div className="flex items-center gap-1.5 mb-1.5 ml-9">
                          <HeroIcon path={ICONS.users[0]} className="w-3 h-3 text-gray-400 dark:text-slate-500" />
                          <span className="text-[10px] text-gray-500 dark:text-slate-400 truncate">
                            {accountsList.length > 3
                              ? `${accountsList.slice(0, 3).map(a => a.trim()).join(", ")} +${accountsList.length - 3}`
                              : accountsList.map(a => a.trim()).join(", ")
                            }
                          </span>
                        </div>
                      )}

                      {/* Notes (if any) */}
                      {p.notes && (
                        <div className="text-[10px] text-gray-400 dark:text-slate-500 ml-9 mb-1.5 line-clamp-2">
                          {p.notes}
                        </div>
                      )}

                      {/* Bottom Row: Status + Date */}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-slate-800">
                        <StatusBadge status={p.status} />
                        <span className="text-[10px] text-gray-400 dark:text-slate-500">{formatDate(timestamp)}</span>
                      </div>
                    </a>
                  </SwipeCard>
                );
              })}
              {filtered.length === 0 && (
                <div className="text-center py-12 text-gray-400 dark:text-slate-500">
                  <HeroIconMulti paths={ICONS.search} className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No projects found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Whitelist Tab - REWORKED */}
        {activeTab === "whitelist" && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">🎫 Whitelist Pipeline</h3>
            {projects.filter((p) => p.type.includes("whitelist") || p.type.includes("kol")).sort((a, b) => {
              const dateA = new Date(a.updatedAt || a.createdAt || a.date || 0).getTime();
              const dateB = new Date(b.updatedAt || b.createdAt || b.date || 0).getTime();
              return dateB - dateA;
            }).map((p, i) => {
              const timestamp = p.updatedAt || p.createdAt || p.date;
              const projectIsNew = isNew(p.updatedAt || p.createdAt);
              const accountsList = p.accounts ? p.accounts.split(",").filter(a => a.trim()) : [];

              return (
                <SwipeCard key={i} projectName={p.project} onDelete={() => handleDeleteProject(p.project)}>
                  <a href={p.url || "#"} target="_blank" rel="noopener noreferrer" className="block bg-white dark:bg-slate-900 rounded-xl p-3 border border-gray-200 dark:border-slate-800 active:scale-[0.98] transition-transform">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <SourceBadge source={p.source} />
                        {projectIsNew && <NewBadge />}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-slate-500">
                        <HeroIcon path={ICONS.clock[0]} className="w-3 h-3" />
                        <span>{timeAgo(timestamp)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-6 h-6 rounded-md bg-indigo-500/10 flex items-center justify-center">
                        <HeroIconMulti paths={ICONS.ticket} className="w-3.5 h-3.5 text-indigo-500" />
                      </div>
                      <span className="text-sm font-semibold truncate">{p.project}</span>
                    </div>
                    {accountsList.length > 0 && (
                      <div className="flex items-center gap-1.5 mb-1.5 ml-8">
                        <HeroIcon path={ICONS.users[0]} className="w-3 h-3 text-gray-400 dark:text-slate-500" />
                        <span className="text-[10px] text-gray-500 dark:text-slate-400 truncate">
                          {accountsList.length > 2
                            ? `${accountsList.slice(0, 2).map(a => a.trim()).join(", ")} +${accountsList.length - 2}`
                            : accountsList.map(a => a.trim()).join(", ")
                          }
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-slate-800">
                      <StatusBadge status={p.status} />
                      <span className="text-[10px] text-gray-400 dark:text-slate-500">{formatDate(timestamp)}</span>
                    </div>
                  </a>
                </SwipeCard>
              );
            })}
          </div>
        )}

        {/* Testnets Tab */}
        {activeTab === "testnets" && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">🧪 Testnet Campaigns</h3>
            {projects.filter((p) => p.type === "testnet" || p.type === "quest").map((p, i) => {
              const timestamp = p.updatedAt || p.createdAt || p.date;
              return (
                <SwipeCard key={i} projectName={p.project} onDelete={() => handleDeleteProject(p.project)}>
                  <a href={p.url || "#"} target="_blank" rel="noopener noreferrer" className="block bg-white dark:bg-slate-900 rounded-xl p-3 border border-gray-200 dark:border-slate-800 active:scale-[0.98] transition-transform">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <HeroIconMulti paths={ICONS.flask} className="w-4 h-4 text-amber-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{p.project}</div>
                        <div className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{p.chain}</div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <StatusBadge status={p.status} />
                        <span className="text-[10px] text-gray-400 dark:text-slate-500">{timeAgo(timestamp)}</span>
                      </div>
                    </div>
                  </a>
                </SwipeCard>
              );
            })}
          </div>
        )}

        {/* Failed Tab */}
        {activeTab === "failed" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">❌ Gagal / Partial</h3>
              <span className="text-xs text-gray-500 dark:text-slate-500">
                {projects.filter(p => ["failed", "partial"].includes(p.status)).length} projects
              </span>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-red-200 dark:border-red-900/30">
                <div className="text-lg font-bold text-red-600 dark:text-red-400">
                  {projects.filter(p => p.status === "failed").length}
                </div>
                <div className="text-[10px] text-gray-500 dark:text-slate-500">Failed</div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-amber-200 dark:border-amber-900/30">
                <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
                  {projects.filter(p => p.status === "partial").length}
                </div>
                <div className="text-[10px] text-gray-500 dark:text-slate-500">Partial</div>
              </div>
            </div>

            {/* Failed List */}
            <div className="space-y-2">
              {projects.filter(p => ["failed", "partial"].includes(p.status)).sort((a, b) => {
                const dateA = new Date(a.updatedAt || a.createdAt || a.date || 0).getTime();
                const dateB = new Date(b.updatedAt || b.createdAt || b.date || 0).getTime();
                return dateB - dateA;
              }).map((p, i) => {
                const timestamp = p.updatedAt || p.createdAt || p.date;
                return (
                  <SwipeCard key={i} projectName={p.project} onDelete={() => handleDeleteProject(p.project)}>
                    <a href={p.url || "#"} target="_blank" rel="noopener noreferrer" className="block bg-white dark:bg-slate-900 rounded-xl p-3 border border-red-200 dark:border-red-900/30 active:scale-[0.98] transition-transform">
                      <div className="flex items-center justify-between mb-2">
                        <SourceBadge source={p.source} />
                        <div className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-slate-500">
                          <HeroIcon path={ICONS.clock[0]} className="w-3 h-3" />
                          <span>{timeAgo(timestamp)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-6 h-6 rounded-md bg-red-500/10 flex items-center justify-center">
                          <HeroIcon path={ICONS.xMark[0]} className="w-3.5 h-3.5 text-red-500" />
                        </div>
                        <span className="text-sm font-semibold truncate">{p.project}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400">{p.type}</span>
                      </div>
                      {p.notes && (
                        <div className="text-[10px] text-red-500/70 dark:text-red-400/70 ml-8 mb-1.5">
                          ⚠ {p.notes}
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-red-100 dark:border-red-900/20">
                        <StatusBadge status={p.status} />
                        <span className="text-[10px] text-gray-400 dark:text-slate-500">{formatDate(timestamp)}</span>
                      </div>
                    </a>
                  </SwipeCard>
                );
              })}
              {projects.filter(p => ["failed", "partial"].includes(p.status)).length === 0 && (
                <div className="text-center py-12 text-gray-400 dark:text-slate-500">
                  <HeroIconMulti paths={ICONS.check} className="w-8 h-8 mx-auto mb-2 opacity-40 text-emerald-500" />
                  <p className="text-sm">Tidak ada yang gagal!</p>
                  <p className="text-xs mt-1">Semua project berhasil</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VPS Tab */}
        {activeTab === "vps" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">⚡ VPS / GPU</h3>
              <button onClick={fetchVpsData} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">Refresh</button>
            </div>

            {vpsList.length === 0 ? (
              <div className="text-center py-12 text-gray-400 dark:text-slate-500">
                <HeroIconMulti paths={ICONS.bolt} className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No VPS data</p>
                <p className="text-xs mt-1">Add VPS info via /api/vps</p>
              </div>
            ) : (
              vpsList.map((vps, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-gray-200 dark:border-slate-800 space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${vps.status === 'online' ? 'bg-emerald-500 animate-pulse' : vps.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'}`} />
                      <span className="font-semibold text-sm">{vps.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-gray-400 dark:text-slate-500">{vps.ip}</span>
                  </div>

                  {/* Resource Bars */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <div className="text-[10px] text-gray-500 dark:text-slate-400 mb-1">CPU</div>
                      <div className="h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${vps.cpu > 80 ? 'bg-red-500' : vps.cpu > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${vps.cpu}%` }} />
                      </div>
                      <div className="text-[10px] font-medium mt-0.5">{vps.cpu}%</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-500 dark:text-slate-400 mb-1">RAM</div>
                      <div className="h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${vps.ram.percent > 80 ? 'bg-red-500' : vps.ram.percent > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${vps.ram.percent}%` }} />
                      </div>
                      <div className="text-[10px] font-medium mt-0.5">{vps.ram.used}/{vps.ram.total}GB</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-500 dark:text-slate-400 mb-1">Disk</div>
                      <div className="h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${vps.disk.percent > 80 ? 'bg-red-500' : vps.disk.percent > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${vps.disk.percent}%` }} />
                      </div>
                      <div className="text-[10px] font-medium mt-0.5">{vps.disk.used}/{vps.disk.total}GB</div>
                    </div>
                  </div>

                  {/* Uptime */}
                  <div className="flex items-center gap-2 text-[10px] text-gray-400 dark:text-slate-500">
                    <span>Uptime: {vps.uptime}</span>
                  </div>

                  {/* GPU */}
                  {vps.gpu && (
                    <div className="bg-indigo-500/5 dark:bg-indigo-500/10 rounded-xl p-3 border border-indigo-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">🎮 {vps.gpu.name}</span>
                        <span className="text-[10px] text-indigo-500">{vps.gpu.temp}°C</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="text-[10px] text-gray-500 dark:text-slate-400">Util</div>
                          <div className="h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${vps.gpu.util}%` }} />
                          </div>
                          <div className="text-[10px] font-medium">{vps.gpu.util}%</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-gray-500 dark:text-slate-400">VRAM</div>
                          <div className="h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(vps.gpu.mem.used / vps.gpu.mem.total) * 100}%` }} />
                          </div>
                          <div className="text-[10px] font-medium">{vps.gpu.mem.used}/{vps.gpu.mem.total}MB</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Services */}
                  {vps.services.length > 0 && (
                    <div>
                      <div className="text-[10px] text-gray-500 dark:text-slate-400 mb-1.5">Services</div>
                      <div className="flex flex-wrap gap-1.5">
                        {vps.services.map((s, j) => (
                          <span key={j} className={`text-[9px] px-2 py-0.5 rounded-full ${s.status === 'running' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                            {s.name}: {s.status}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Miners */}
                  {vps.miners && vps.miners.length > 0 && (
                    <div>
                      <div className="text-[10px] text-gray-500 dark:text-slate-400 mb-1.5">Miners</div>
                      <div className="space-y-1">
                        {vps.miners.map((m, j) => (
                          <div key={j} className="flex items-center justify-between text-[10px]">
                            <span className="text-gray-600 dark:text-slate-300">{m.name}</span>
                            <span className={`font-mono ${m.status === 'mining' ? 'text-emerald-500' : 'text-red-500'}`}>{m.hashrate}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Cron Jobs Tab */}
        {activeTab === "cron" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">⏱ Cron Jobs</h3>
              <button onClick={fetchCronJobs} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">Refresh</button>
            </div>
            
            {cronJobs.length === 0 ? (
              <div className="text-center py-12 text-gray-400 dark:text-slate-500">
                <HeroIconMulti paths={ICONS.arrowPath} className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No cron jobs found</p>
                <p className="text-xs mt-1">Run pixz_cron_sync.py to populate</p>
              </div>
            ) : (
              <>
                {/* Summary */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-gray-200 dark:border-slate-800 text-center">
                    <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{cronJobs.length}</div>
                    <div className="text-[10px] text-gray-500 dark:text-slate-500">Total</div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-gray-200 dark:border-slate-800 text-center">
                    <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{cronJobs.filter(j => j.enabled).length}</div>
                    <div className="text-[10px] text-gray-500 dark:text-slate-500">Active</div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-gray-200 dark:border-slate-800 text-center">
                    <div className="text-lg font-bold text-gray-400 dark:text-slate-600">{cronJobs.filter(j => !j.enabled).length}</div>
                    <div className="text-[10px] text-gray-500 dark:text-slate-500">Paused</div>
                  </div>
                </div>

                {/* Job List */}
                <div className="space-y-2">
                  {cronJobs.map((job) => (
                    <div key={job.job_id} className={`bg-white dark:bg-slate-900 rounded-xl p-3 border ${job.enabled ? 'border-gray-200 dark:border-slate-800' : 'border-gray-100 dark:border-slate-900 opacity-60'}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${job.enabled ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                            <span className="text-sm font-medium truncate">{job.name}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 ml-4">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 font-mono">{typeof job.schedule === 'object' ? job.schedule.display || job.schedule.expr : job.schedule}</span>
                            {job.deliver && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">{job.deliver}</span>
                            )}
                          </div>
                          {job.last_run_at && (
                            <div className="text-[10px] text-gray-400 dark:text-slate-600 mt-1 ml-4">
                              Last: {new Date(job.last_run_at).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              {job.last_status && (
                                <span className={`ml-1 ${job.last_status === 'ok' ? 'text-emerald-500' : 'text-red-500'}`}>{job.last_status}</span>
                              )}
                            </div>
                          )}
                        </div>
                        {job.no_agent && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 flex-shrink-0">script</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* ── Bottom Nav ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-gray-200 dark:border-slate-800" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="max-w-lg mx-auto overflow-x-auto scrollbar-hide">
          <div className="flex min-w-max justify-around px-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-col items-center gap-0.5 py-2 pt-3 px-2 transition-colors min-w-[52px] ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400 dark:text-slate-600"}`}>
                  <HeroIconMulti paths={tab.icon} className={`w-5 h-5 ${isActive ? "text-indigo-600 dark:text-indigo-400" : ""}`} />
                  <span className="text-[9px] font-medium">{tab.label}</span>
                  {isActive && <div className="w-1 h-1 rounded-full bg-indigo-600 dark:bg-indigo-400 mt-0.5" />}
                </button>
              );
            })}
          </div>
        </div>
      </nav>
      {/* Chat Widget */}
      <ChatWidget />
      <TerminalWidget />
    </div>
  );
}
