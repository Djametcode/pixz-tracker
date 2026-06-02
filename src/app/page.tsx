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
  last_updated: string;
}

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/projects");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setProjects(data.projects || []);
      setStats(data.stats || null);
    } catch (err) {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const getStatusColor = (status: string) => {
    if (["submitted", "success", "replied", "completed"].includes(status)) return "text-emerald-400";
    if (["pending", "active", "logged", "hunting"].includes(status)) return "text-amber-400";
    if (["partial"].includes(status)) return "text-orange-400";
    return "text-gray-400";
  };

  const getStatusBg = (status: string) => {
    if (["submitted", "success", "replied", "completed"].includes(status)) return "bg-emerald-500/10 border-emerald-500/20";
    if (["pending", "active", "logged", "hunting"].includes(status)) return "bg-amber-500/10 border-amber-500/20";
    if (["partial"].includes(status)) return "bg-orange-500/10 border-orange-500/20";
    return "bg-gray-500/10 border-gray-500/20";
  };

  const getTypeIcon = (type: string) => {
    if (type.includes("whitelist")) return "🎫";
    if (type.includes("nft") || type.includes("mint")) return "🖼️";
    if (type === "testnet") return "🧪";
    if (type === "quest") return "⚔️";
    return "📋";
  };

  const filtered = projects.filter((p) => {
    if (filter !== "all" && p.type !== filter) return false;
    if (search && !p.project.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">⚡</div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#12121a]/95 backdrop-blur-xl border-b border-[#2a2a3e]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <h1 className="text-lg font-black bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">PIXZ TRACKER</h1>
              <p className="text-[10px] text-gray-500">{stats?.total_projects || 0} Projects • Updated {stats?.last_updated ? new Date(stats.last_updated).toLocaleString() : "N/A"}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="px-4 py-2 text-xs font-semibold text-gray-400 bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg hover:border-red-500/50 hover:text-red-400 transition-all">
            Logout
          </button>
        </div>
      </header>

      {/* Nav */}
      <nav className="bg-[#12121a]/95 backdrop-blur-xl border-b border-[#2a2a3e] overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 flex gap-1">
          {[{"id":"dashboard","icon":"📊","label":"OVERVIEW"},{"id":"projects","icon":"🗂️","label":"ALL PROJECTS"},{"id":"whitelist","icon":"🎫","label":"WHITELIST"},{"id":"testnets","icon":"🧪","label":"TESTNETS"}].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-3 text-xs font-bold tracking-wider border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id ? "text-blue-400 border-blue-400 bg-blue-500/5" : "text-gray-500 border-transparent hover:text-gray-300"}`}>
              <span className="mr-1.5">{tab.icon}</span>{tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Dashboard */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[{"label":"Total Projects","value":stats?.total_projects||0,"icon":"🗂️","color":"blue"},{"label":"Whitelist","value":stats?.total_whitelist||0,"icon":"🎫","color":"emerald"},{"label":"Testnets","value":stats?.total_testnet||0,"icon":"🧪","color":"amber"},{"label":"NFT Mints","value":stats?.total_nft_mints||0,"icon":"🖼️","color":"purple"}].map((s) => (
                <div key={s.label} className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-5 hover:border-blue-500/30 transition-all">
                  <div className="text-2xl mb-2">{s.icon}</div>
                  <div className="text-3xl font-black text-blue-400">{s.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            <div>
              <h2 className="text-lg font-bold text-white mb-4">Recent Projects</h2>
              <div className="grid gap-3">
                {projects.slice(0, 8).map((p, i) => (
                  <div key={i} className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl p-4 flex items-center gap-4 hover:border-blue-500/20 transition-all">
                    <span className="text-xl">{getTypeIcon(p.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white">{p.project}</div>
                      <div className="text-xs text-gray-500">{p.type} • {p.chain} • {p.source}</div>
                    </div>
                    <div className={`text-xs font-semibold px-3 py-1 rounded-full border ${getStatusBg(p.status)} ${getStatusColor(p.status)}`}>
                      {p.status}
                    </div>
                    <div className="text-xs text-gray-600 hidden md:block">{p.accounts}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* All Projects */}
        {activeTab === "projects" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <input type="text" placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} className="px-4 py-3 bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 w-full md:w-80" />
              <div className="flex gap-2 flex-wrap">
                {["all","whitelist","whitelist_kol","testnet","quest","nft_mint","email_waitlist","waitlist","extension"].map((t) => (
                  <button key={t} onClick={() => setFilter(t)} className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${filter === t ? "bg-blue-500/10 border-blue-500/30 text-blue-400" : "bg-[#1a1a2e] border-[#2a2a3e] text-gray-500 hover:border-gray-500"}`}>
                    {t === "all" ? "All" : t.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((p, i) => (
                <div key={i} className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-5 hover:border-purple-500/30 hover:translate-y-[-2px] transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xl">{getTypeIcon(p.type)}</span>
                    <h3 className="font-bold text-white truncate">{p.project}</h3>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs bg-[#0a0a0f] px-2 py-1 rounded text-gray-400">{p.type}</span>
                    <span className={`text-xs font-semibold ${getStatusColor(p.status)}`}>● {p.status}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-3">
                    <span>Chain: {p.chain}</span>
                    <span>Accounts: {p.accounts}</span>
                    <span>Source: {p.source}</span>
                    <span>Date: {p.date}</span>
                  </div>
                  <p className="text-xs text-gray-400 italic border-t border-[#2a2a3e] pt-3">{p.notes}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Whitelist */}
        {activeTab === "whitelist" && (
          <div>
            <h2 className="text-lg font-bold text-white mb-4">🎫 Whitelist Pipeline</h2>
            <div className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl overflow-hidden overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0a0a0f]">
                    {["Project","Type","Status","Chain","Accounts","Source","Date","Notes"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {projects.filter(p => p.type.includes("whitelist") || p.type.includes("kol")).map((p, i) => (
                    <tr key={i} className="border-t border-[#2a2a3e] hover:bg-[#252540] transition-colors">
                      <td className="px-4 py-3 font-bold text-white">{getTypeIcon(p.type)} {p.project}</td>
                      <td className="px-4 py-3"><span className="bg-[#0a0a0f] px-2 py-1 rounded text-xs">{p.type}</span></td>
                      <td className="px-4 py-3"><span className={getStatusColor(p.status)}>● {p.status}</span></td>
                      <td className="px-4 py-3 text-gray-400">{p.chain}</td>
                      <td className="px-4 py-3 text-gray-400">{p.accounts}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs font-semibold ${p.source === "twitter" ? "bg-blue-500/10 text-blue-400" : "bg-cyan-500/10 text-cyan-400"}`}>{p.source}</span></td>
                      <td className="px-4 py-3 text-gray-400">{p.date}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs max-w-[200px] truncate">{p.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Testnets */}
        {activeTab === "testnets" && (
          <div>
            <h2 className="text-lg font-bold text-white mb-4">🧪 Testnet Campaigns</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.filter(p => p.type === "testnet" || p.type === "quest").map((p, i) => (
                <div key={i} className="bg-[#1a1a2e] border border-[#2a2a3e] rounded-2xl p-5 hover:border-amber-500/30 transition-all">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-white">{p.project}</h3>
                    <span className="text-xs text-purple-400 bg-purple-500/10 px-2 py-1 rounded">{p.chain}</span>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className={`text-xs font-semibold ${getStatusColor(p.status)}`}>● {p.status}</span>
                    <span className="text-xs text-gray-500">{p.source}</span>
                  </div>
                  <p className="text-xs text-gray-400">{p.notes}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
