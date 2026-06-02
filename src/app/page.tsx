"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
}

function computeStats(projects: Project[]): Stats {
  return {
    total_projects: projects.length,
    total_whitelist: projects.filter(p => p.type.includes("whitelist") || p.type.includes("kol")).length,
    total_testnet: projects.filter(p => p.type === "testnet" || p.type === "quest").length,
    total_nft_mints: projects.filter(p => p.type.includes("nft") || p.type.includes("mint")).length,
    total_waitlist: projects.filter(p => p.type.includes("waitlist") || p.type.includes("email")).length,
    twitter_sourced: projects.filter(p => p.source === "twitter").length,
    telegram_sourced: projects.filter(p => p.source === "telegram").length,
    submitted: projects.filter(p => ["submitted", "success", "replied", "completed"].includes(p.status)).length,
    active_campaigns: projects.filter(p => !["completed", "dropped", "expired", "failed", "missed"].includes(p.status)).length,
    last_updated: new Date().toISOString(),
  };
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; dot: string }> = {
    submitted: { cls: "badge-success", dot: "bg-emerald-400" },
    success: { cls: "badge-success", dot: "bg-emerald-400" },
    replied: { cls: "badge-success", dot: "bg-emerald-400" },
    completed: { cls: "badge-success", dot: "bg-emerald-400" },
    pending: { cls: "badge-warning", dot: "bg-amber-400" },
    active: { cls: "badge-warning", dot: "bg-amber-400" },
    logged: { cls: "badge-warning", dot: "bg-amber-400" },
    hunting: { cls: "badge-warning", dot: "bg-amber-400" },
    partial: { cls: "badge bg-orange-500/10 text-orange-400 border border-orange-500/20", dot: "bg-orange-400" },
  };
  const { cls, dot } = map[status] || { cls: "badge-gray", dot: "bg-slate-400" };

  return (
    <span className={cls}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot} mr-1.5 animate-pulse`} />
      {status}
    </span>
  );
}

function TypeIcon({ type }: { type: string }) {
  if (type.includes("whitelist") || type.includes("kol")) return <span className="text-lg">🎫</span>;
  if (type.includes("nft") || type.includes("mint")) return <span className="text-lg">🖼️</span>;
  if (type === "testnet") return <span className="text-lg">🧪</span>;
  if (type === "quest") return <span className="text-lg">⚔️</span>;
  if (type.includes("waitlist") || type.includes("email")) return <span className="text-lg">📋</span>;
  if (type === "extension") return <span className="text-lg">🧩</span>;
  return <span className="text-lg">📁</span>;
}

function SourceBadge({ source }: { source: string }) {
  if (source === "twitter") return <span className="badge-info">𝕏 {source}</span>;
  if (source === "telegram") return <span className="badge-purple">✈ {source}</span>;
  return <span className="badge-gray">{source}</span>;
}

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
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

  const filtered = projects.filter((p) => {
    if (filter !== "all" && p.type !== filter) return false;
    if (search && !p.project.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const tabs = [
    { id: "dashboard", icon: "📊", label: "OVERVIEW" },
    { id: "projects", icon: "🗂️", label: "ALL PROJECTS" },
    { id: "whitelist", icon: "🎫", label: "WHITELIST" },
    { id: "testnets", icon: "🧪", label: "TESTNETS" },
  ];

  const filterTabs = [
    { id: "all", label: "All" },
    { id: "whitelist", label: "Whitelist" },
    { id: "whitelist_kol", label: "KOL" },
    { id: "testnet", label: "Testnet" },
    { id: "quest", label: "Quest" },
    { id: "nft_mint", label: "NFT Mint" },
    { id: "email_waitlist", label: "Email" },
    { id: "waitlist", label: "Waitlist" },
    { id: "extension", label: "Extension" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 animate-pulse">
            <span className="text-3xl">⚡</span>
          </div>
          <p className="text-slate-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20">
              <span className="text-xl">⚡</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gradient">PIXZ TRACKER</h1>
              <p className="text-xs text-slate-500">
                {stats?.total_projects || 0} Projects · {stats?.active_campaigns || 0} Active
              </p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-ghost text-xs">
            Sign out
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={activeTab === tab.id ? "nav-item-active" : "nav-item-inactive"}
            >
              <span className="mr-1.5">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="stat-card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600/10">
                    <span className="text-xl">🗂️</span>
                  </div>
                </div>
                <div className="stat-value text-indigo-400">{stats?.total_projects || 0}</div>
                <div className="stat-label">Total Projects</div>
              </div>

              <div className="stat-card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-600/10">
                    <span className="text-xl">🎫</span>
                  </div>
                </div>
                <div className="stat-value text-emerald-400">{stats?.total_whitelist || 0}</div>
                <div className="stat-label">Whitelist</div>
              </div>

              <div className="stat-card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-600/10">
                    <span className="text-xl">🧪</span>
                  </div>
                </div>
                <div className="stat-value text-amber-400">{stats?.total_testnet || 0}</div>
                <div className="stat-label">Testnets</div>
              </div>

              <div className="stat-card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-600/10">
                    <span className="text-xl">📋</span>
                  </div>
                </div>
                <div className="stat-value text-purple-400">{stats?.total_waitlist || 0}</div>
                <div className="stat-label">Waitlist</div>
              </div>
            </div>

            {/* Source breakdown */}
            <div className="grid grid-cols-2 gap-4">
              <div className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-300">Source Breakdown</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="badge-info">𝕏 Twitter</span>
                    <span className="text-sm font-bold text-slate-200">{stats?.twitter_sourced || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="badge-purple">✈ Telegram</span>
                    <span className="text-sm font-bold text-slate-200">{stats?.telegram_sourced || 0}</span>
                  </div>
                </div>
              </div>

              <div className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-300">Success Rate</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Submitted</span>
                    <span className="text-sm font-bold text-emerald-400">{stats?.submitted || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Active</span>
                    <span className="text-sm font-bold text-amber-400">{stats?.active_campaigns || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Projects */}
            <div>
              <h2 className="text-lg font-bold text-slate-100 mb-4">Recent Projects</h2>
              <div className="grid gap-3">
                {projects.slice(0, 8).map((p, i) => (
                  <div key={i} className="card-hover p-4 flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800">
                      <TypeIcon type={p.type} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-100 truncate">{p.project}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="badge-gray text-[10px]">{p.type}</span>
                        <span className="text-xs text-slate-500">·</span>
                        <span className="text-xs text-slate-500">{p.chain}</span>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-3">
                      <SourceBadge source={p.source} />
                      <StatusBadge status={p.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* All Projects Tab */}
        {activeTab === "projects" && (
          <div className="space-y-6">
            {/* Search + Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>

            {/* Filter pills */}
            <div className="flex gap-2 flex-wrap">
              {filterTabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setFilter(t.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200 ${
                    filter === t.id
                      ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
                      : "bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Project cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((p, i) => (
                <div key={i} className="card-hover p-5 flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800">
                      <TypeIcon type={p.type} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-100 truncate">{p.project}</h3>
                      <span className="badge-gray text-[10px] mt-1">{p.type}</span>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mb-4">
                    <div>
                      <span className="text-slate-600">Chain</span>
                      <div className="text-slate-300 font-medium">{p.chain}</div>
                    </div>
                    <div>
                      <span className="text-slate-600">Accounts</span>
                      <div className="text-slate-300 font-medium">{p.accounts}</div>
                    </div>
                    <div>
                      <span className="text-slate-600">Source</span>
                      <div className="mt-0.5"><SourceBadge source={p.source} /></div>
                    </div>
                    <div>
                      <span className="text-slate-600">Date</span>
                      <div className="text-slate-300 font-medium">{p.date}</div>
                    </div>
                  </div>

                  <div className="mt-auto pt-3 border-t border-slate-800">
                    <p className="text-xs text-slate-500 line-clamp-2">{p.notes}</p>
                  </div>
                </div>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="card p-12 text-center">
                <span className="text-4xl mb-4 block">🔍</span>
                <p className="text-slate-400">No projects found matching your criteria</p>
              </div>
            )}
          </div>
        )}

        {/* Whitelist Tab */}
        {activeTab === "whitelist" && (
          <div>
            <h2 className="text-lg font-bold text-slate-100 mb-4">🎫 Whitelist Pipeline</h2>
            <div className="card overflow-hidden overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800">
                    {["Project", "Type", "Status", "Chain", "Accounts", "Source", "Date", "Notes"].map((h) => (
                      <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {projects.filter(p => p.type.includes("whitelist") || p.type.includes("kol")).map((p, i) => (
                    <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <TypeIcon type={p.type} />
                          <span className="font-semibold text-slate-100">{p.project}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3"><span className="badge-gray">{p.type}</span></td>
                      <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                      <td className="px-4 py-3 text-slate-300">{p.chain}</td>
                      <td className="px-4 py-3 text-slate-300 font-mono text-xs">{p.accounts}</td>
                      <td className="px-4 py-3"><SourceBadge source={p.source} /></td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{p.date}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs max-w-[200px] truncate">{p.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Testnets Tab */}
        {activeTab === "testnets" && (
          <div>
            <h2 className="text-lg font-bold text-slate-100 mb-4">🧪 Testnet Campaigns</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.filter(p => p.type === "testnet" || p.type === "quest").map((p, i) => (
                <div key={i} className="card-hover p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-600/10">
                        <TypeIcon type={p.type} />
                      </div>
                      <h3 className="font-bold text-slate-100">{p.project}</h3>
                    </div>
                    <span className="badge-purple">{p.chain}</span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <StatusBadge status={p.status} />
                    <SourceBadge source={p.source} />
                  </div>
                  <p className="text-xs text-slate-500 border-t border-slate-800 pt-3 mt-3">{p.notes}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between text-xs text-slate-600">
          <span>PIXZ TRACKER v2 · MongoDB Atlas</span>
          <span>Last sync: {stats?.last_updated ? new Date(stats.last_updated).toLocaleString() : "N/A"}</span>
        </div>
      </footer>
    </div>
  );
}
