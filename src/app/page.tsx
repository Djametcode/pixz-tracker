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
  if (source === "twitter") return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-sky-500/10 text-sky-700 dark:text-sky-400">𝕏 {source}</span>;
  if (source === "telegram") return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-violet-500/10 text-violet-700 dark:text-violet-400">✈ {source}</span>;
  return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-500/10 text-gray-700 dark:text-gray-400">{source}</span>;
}

/* ── Main ── */
export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [upcomingMints, setUpcomingMints] = useState<UpcomingMint[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
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

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const handleDeleteProject = (projectName: string) => {
    setProjects((prev) => prev.filter((p) => p.project !== projectName));
  };

  const filtered = projects.filter((p) => {
    if (filter !== "all" && p.type !== filter) return false;
    if (search && !p.project.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const tabs = [
    { id: "dashboard", icon: ICONS.home, label: "Home" },
    { id: "projects", icon: ICONS.folder, label: "Projects" },
    { id: "whitelist", icon: ICONS.ticket, label: "Whitelist" },
    { id: "testnets", icon: ICONS.flask, label: "Testnets" },
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

            {/* Upcoming Mints Carousel */}
            {upcomingMints.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">Upcoming Mints</h3>
                  <span className="text-xs text-gray-500 dark:text-slate-500">{upcomingMints.length}</span>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollSnapType: "x mandatory", scrollbarWidth: "none" }}>
                  {upcomingMints.map((m, i) => (
                    <a key={i} href={m.twitter || "#"} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 w-60 bg-white dark:bg-slate-900 rounded-2xl p-4 border border-gray-200 dark:border-slate-800 active:scale-95 transition-transform" style={{ scrollSnapAlign: "start" }}>
                      <div className="flex items-center gap-3 mb-3">
                        <img alt={m.name} className="w-10 h-10 rounded-xl object-cover border border-gray-200 dark:border-slate-700" src={m.image} onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=6366f1&color=fff&size=40`; }} />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm truncate">{m.name}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-xs text-gray-500 dark:text-slate-400">{m.chain}</span>
                            <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">{m.price}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-400 dark:text-slate-500">
                        <span>{m.date}</span>
                        <HeroIcon path={ICONS.externalLink[0]} className="w-3.5 h-3.5" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Recent Activity</h3>
              <div className="space-y-2">
                {projects.slice(0, 10).map((p, i) => (
                  <SwipeCard key={i} projectName={p.project} onDelete={() => handleDeleteProject(p.project)}>
                  <a href={p.url || "#"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-white dark:bg-slate-900 rounded-xl p-3 border border-gray-200 dark:border-slate-800 active:scale-[0.98] transition-transform">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-500 dark:text-slate-400">
                      <TypeIcon type={p.type} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{p.project}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-400 dark:text-slate-500">{p.type}</span>
                        <span className="text-xs text-gray-300 dark:text-slate-700">·</span>
                        <span className="text-xs text-gray-400 dark:text-slate-500">{p.source}</span>
                      </div>
                    </div>
                    <StatusBadge status={p.status} />
                  </a>
                  </SwipeCard>
                ))}
              </div>
            </div>
          </>
        )}

        {/* All Projects */}
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
            {/* List */}
            <div className="space-y-2">
              {filtered.map((p, i) => (
                <SwipeCard key={i} projectName={p.project} onDelete={() => handleDeleteProject(p.project)}>
                <a href={p.url || "#"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-white dark:bg-slate-900 rounded-xl p-3 border border-gray-200 dark:border-slate-800 active:scale-[0.98] transition-transform">
                  <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-500 dark:text-slate-400">
                    <TypeIcon type={p.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{p.project}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400 dark:text-slate-500">{p.chain}</span>
                      <span className="text-xs text-gray-300 dark:text-slate-700">·</span>
                      <SourceBadge source={p.source} />
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge status={p.status} />
                    <span className="text-xs text-gray-400 dark:text-slate-500">{p.date}</span>
                  </div>
                </a>
                </SwipeCard>
              ))}
              {filtered.length === 0 && (
                <div className="text-center py-12 text-gray-400 dark:text-slate-500">
                  <HeroIconMulti paths={ICONS.search} className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No projects found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Whitelist Tab */}
        {activeTab === "whitelist" && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">🎫 Whitelist Pipeline</h3>
            {projects.filter((p) => p.type.includes("whitelist") || p.type.includes("kol")).map((p, i) => (
              <SwipeCard key={i} projectName={p.project} onDelete={() => handleDeleteProject(p.project)}>
              <a href={p.url || "#"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-white dark:bg-slate-900 rounded-xl p-3 border border-gray-200 dark:border-slate-800 active:scale-[0.98] transition-transform">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <HeroIconMulti paths={ICONS.ticket} className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{p.project}</div>
                  <div className="text-xs text-gray-400 dark:text-slate-500 mt-0.5 truncate">{p.accounts || p.notes}</div>
                </div>
                <StatusBadge status={p.status} />
              </a>
              </SwipeCard>
            ))}
          </div>
        )}

        {/* Testnets Tab */}
        {activeTab === "testnets" && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">🧪 Testnet Campaigns</h3>
            {projects.filter((p) => p.type === "testnet" || p.type === "quest").map((p, i) => (
              <SwipeCard key={i} projectName={p.project} onDelete={() => handleDeleteProject(p.project)}>
              <a href={p.url || "#"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-white dark:bg-slate-900 rounded-xl p-3 border border-gray-200 dark:border-slate-800 active:scale-[0.98] transition-transform">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <HeroIconMulti paths={ICONS.flask} className="w-4 h-4 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{p.project}</div>
                  <div className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{p.chain}</div>
                </div>
                <StatusBadge status={p.status} />
              </a>
              </SwipeCard>
            ))}
          </div>
        )}
      </main>

      {/* ── Bottom Nav ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-gray-200 dark:border-slate-800" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="max-w-lg mx-auto grid grid-cols-4">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-col items-center gap-0.5 py-2 pt-3 transition-colors ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400 dark:text-slate-600"}`}>
                <HeroIconMulti paths={tab.icon} className={`w-6 h-6 ${isActive ? "text-indigo-600 dark:text-indigo-400" : ""}`} />
                <span className="text-[10px] font-medium">{tab.label}</span>
                {isActive && <div className="w-1 h-1 rounded-full bg-indigo-600 dark:bg-indigo-400 mt-0.5" />}
              </button>
            );
          })}
        </div>
      </nav>
      {/* Chat Widget */}
      <ChatWidget />
      <TerminalWidget />
    </div>
  );
}
