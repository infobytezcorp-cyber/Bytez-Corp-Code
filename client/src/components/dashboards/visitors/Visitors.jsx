import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { RefreshCw, Search, Calendar, ChevronLeft, ChevronRight, TrendingUp, Clock, Users, UserCheck } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;
axios.defaults.headers.common['ngrok-skip-browser-warning'] = 'true';

function initials(name = "") {
  return name?.split(" ")?.filter(Boolean)?.map((w) => w[0])?.join("")?.slice(0, 2)?.toUpperCase() || "?";
}

function fmtDateTime(v) {
  if (!v) return "—";
  return new Date(v).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function fmtDuration(checkIn, checkOut) {
  if (!checkOut) return null;
  const mins  = Math.round((new Date(checkOut) - new Date(checkIn)) / 60000);
  const hours = Math.floor(mins / 60);
  const rem   = mins % 60;
  return { text: hours > 0 ? `${hours}h ${rem}m` : `${mins}m`, long: mins > 120 };
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, accent }) => (
  <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4 flex items-center gap-4 shadow-sm">
    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${accent}15` }}>
      <Icon className="w-5 h-5" style={{ color: accent }} />
    </div>
    <div>
      <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-semibold text-slate-900 mt-0.5">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ─── Avatar ───────────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  ["#e0f2fe", "#0369a1"], ["#f0fdf4", "#166534"], ["#fdf4ff", "#7e22ce"],
  ["#fff7ed", "#c2410c"], ["#faf5ff", "#6d28d9"], ["#f0fdfa", "#0f766e"],
];
function avatarColor(name) {
  const idx = (name?.charCodeAt(0) || 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

// ─── Main Component ───────────────────────────────────────────────────────────
const Visitors = () => {
  const [visitors,     setVisitors]     = useState([]);
  const [filter,       setFilter]       = useState("all");
  const [search,       setSearch]       = useState("");
  const [loading,      setLoading]      = useState(false);
  const [dateFilter,   setDateFilter]   = useState("");
  const [currentPage,  setCurrentPage]  = useState(1);
  const [totalPages,   setTotalPages]   = useState(1);
  const [totalData,    setTotalData]    = useState(0);

  const fetchVisitors = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/visitor`, {
        params: { page: currentPage, limit: 10, date: dateFilter },
      });
      setVisitors(res.data.visitors || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalData(res.data.totalData || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const checkout = async (id) => {
    try { await axios.put(`${API}/api/visitor/${id}/checkout`); fetchVisitors(); }
    catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchVisitors();
    const iv = setInterval(fetchVisitors, 30000);
    return () => clearInterval(iv);
  }, [dateFilter, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [search, filter, dateFilter]);

  const filtered = visitors
    .filter((v) => filter === "all" || v.status === filter)
    .filter((v) =>
      !search.trim() ||
      v.name?.toLowerCase().includes(search.toLowerCase()) ||
      v.phone?.includes(search)
    );

  const checkedIn   = visitors.filter((v) => v.status === "Checked-In").length;
  const checkedOut  = visitors.filter((v) => v.status === "Checked-Out").length;
  const today       = visitors.filter((v) => {
    const d = new Date(v.checkInTime), n = new Date();
    return d.getDate() === n.getDate() && d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
  }).length;
  const durations   = visitors.filter((v) => v.checkOutTime).map((v) =>
    (new Date(v.checkOutTime) - new Date(v.checkInTime)) / 60000
  );
  const avgStay     = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;

  return (
    <div className="min-h-screen bg-slate-50/60 pb-8 ">

      <div className="mx-auto px-6">

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-7 mb-6">
          <StatCard icon={Users}     label="Total Visitors" value={totalData}  accent="#2563eb" />
          <StatCard icon={UserCheck} label="Inside Now"     value={checkedIn}  sub="Currently checked in" accent="#059669" />
          <StatCard icon={TrendingUp}label="Checked Out"    value={checkedOut} accent="#7c3aed" />
          <StatCard icon={Clock}     label="Avg. Stay"      value={`${avgStay}m`} sub="Per visit" accent="#d97706" />
        </div>

        {/* ── Table Card ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

          {/* Toolbar */}
          <div className="px-5 py-4 border-b border-slate-100 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Visitor Log</h2>
              <p className="text-xs text-slate-400 mt-0.5">Search, filter, and manage all visitor entries</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Name or phone…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 w-44 transition"
                />
              </div>

              {/* Date */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>

              {/* Status filter */}
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
              >
                <option value="all">All status</option>
                <option value="Checked-In">Inside</option>
                <option value="Checked-Out">Checked out</option>
              </select>

              {/* Refresh */}
              <button
                onClick={fetchVisitors}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-slate-900 text-white rounded-xl hover:bg-slate-700 disabled:opacity-50 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                {loading ? "Loading…" : "Refresh"}
              </button>
            </div>
          </div>

          {/* Table */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-600">No visitors found</p>
              <p className="text-xs text-slate-400">Try a different search or date filter</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {["Visitor", "Phone", "Check-in", "Check-out", "Duration", "Status", "Action"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((v) => {
                    const dur = fmtDuration(v.checkInTime, v.checkOutTime);
                    const [bgColor, fgColor] = avatarColor(v.name);
                    return (
                      <tr key={v._id} className="group hover:bg-slate-50 transition-colors">
                        {/* Visitor */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-semibold shrink-0"
                              style={{ background: bgColor, color: fgColor }}
                            >
                              {initials(v.name)}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-900">{v.name}</p>
                              <p className="text-[11px] text-slate-400">Visitor</p>
                            </div>
                          </div>
                        </td>

                        {/* Phone */}
                        <td className="px-5 py-3.5 text-xs text-slate-600 font-mono">{v.phone}</td>

                        {/* Check-in */}
                        <td className="px-5 py-3.5 text-xs text-slate-600">{fmtDateTime(v.checkInTime)}</td>

                        {/* Check-out */}
                        <td className="px-5 py-3.5 text-xs text-slate-600">
                          {v.checkOutTime ? fmtDateTime(v.checkOutTime) : <span className="text-slate-300">—</span>}
                        </td>

                        {/* Duration */}
                        <td className="px-5 py-3.5">
                          {dur ? (
                            <span className={`text-xs font-medium ${dur.long ? "text-rose-600" : "text-emerald-700"}`}>
                              {dur.text}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-300">In progress</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3.5">
                          {v.status === "Checked-In" ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Inside
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                              Checked out
                            </span>
                          )}
                        </td>

                        {/* Action */}
                        <td className="px-5 py-3.5">
                          {v.status === "Checked-In" ? (
                            <button
                              onClick={() => checkout(v._id)}
                              className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-xl text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition-all"
                            >
                              Check out
                            </button>
                          ) : (
                            <span className="text-xs text-slate-300">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Showing <span className="font-medium text-slate-700">{filtered.length}</span> of <span className="font-medium text-slate-700">{totalData}</span> visitors
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-xs font-semibold text-slate-700">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Visitors;