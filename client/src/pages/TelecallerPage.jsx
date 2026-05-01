import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMyAgent,
  toggleMyBreak,
  fetchMyCall,
  endMyCall,
  clearMyAgent,
} from "../features/myAgentSlice";



// ─── Constants ────────────────────────────────────────────────
const POLL_INTERVAL_MS = 5000;
const BREAK_LIMIT_SEC  = 3600;
const TIMER_TICK_MS    = 1000;

// ─── Utils ────────────────────────────────────────────────────
function formatDuration(totalSeconds) {
  if (!totalSeconds || totalSeconds <= 0) return "00:00:00";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}
function toDateStr(d) {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}-${String(dt.getDate()).padStart(2,"0")}`;
}
function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit", second:"2-digit" });
}
function formatTimeShort(iso) {
  return new Date(iso).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });
}
function formatDateLabel(dateStr) {
  const today     = toDateStr(new Date());
  const yesterday = toDateStr(new Date(Date.now() - 86400000));
  if (dateStr === today)     return "Today";
  if (dateStr === yesterday) return "Yesterday";
  return new Date(dateStr).toLocaleDateString([], { weekday:"short", day:"numeric", month:"short" });
}
function isInRange(dateStr, from, to) {
  if (!from && !to) return true;
  if (from && dateStr < from) return false;
  if (to   && dateStr > to)   return false;
  return true;
}

// ─── Live Timer Hook ──────────────────────────────────────────
function useLiveTimer(startIso, active = true) {
  const getElapsed = useCallback(() => {
    if (!startIso || !active) return 0;
    const diff = Math.floor((Date.now() - new Date(startIso).getTime()) / 1000);
    return diff < 0 ? 0 : diff;
  }, [startIso, active]);

  const [elapsed, setElapsed] = useState(getElapsed);
  useEffect(() => {
    if (!startIso || !active) { setElapsed(0); return; }
    setElapsed(getElapsed());
    const t = setInterval(() => setElapsed(getElapsed()), TIMER_TICK_MS);
    return () => clearInterval(t);
  }, [startIso, active, getElapsed]);
  return elapsed;
}

// ─── Icons ────────────────────────────────────────────────────
const Icons = {
  phone:    "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12 19.79 19.79 0 0 1 1.9 3.37 2 2 0 0 1 3.89 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 5.99 5.99l1.07-1.07a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z",
  logout:   "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  history:  "M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
  missed:   "M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.34 1.85.57 2.81.7a2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.42 19.42 0 0 1 1 4.73",
  dashboard:"M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
};

const PhoneIcon = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
    strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={Icons.phone} />
  </svg>
);
const SvgIcon = ({ d, className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
    strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);

// ─── DateFilter Component ─────────────────────────────────────
function DateFilter({ value, onChange }) {
  const todayStr     = toDateStr(new Date());
  const yesterdayStr = toDateStr(new Date(Date.now() - 86400000));
  const last7Str     = toDateStr(new Date(Date.now() - 6 * 86400000));

  const presets = [
    { label:"Today",       from:todayStr,     to:todayStr     },
    { label:"Yesterday",   from:yesterdayStr, to:yesterdayStr },
    { label:"Last 7 Days", from:last7Str,     to:todayStr     },
    { label:"All",         from:null,         to:null         },
  ];

  const activePreset = presets.find(p => p.from === value.from && p.to === value.to)?.label ?? "Custom";

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4">
      <div className="flex flex-wrap items-center gap-3">

        {/* Preset buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {presets.map(p => (
            <button key={p.label} onClick={() => onChange({ from:p.from, to:p.to })}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                activePreset === p.label
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}>{p.label}</button>
          ))}
        </div>

        <div className="h-5 w-px bg-slate-200 hidden sm:block" />

        {/* Custom date pickers */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">From</span>
            <input type="date" value={value.from ?? ""} max={value.to ?? todayStr}
              onChange={e => onChange({ ...value, from: e.target.value || null })}
              className="text-xs font-semibold text-slate-700 border border-slate-200 rounded-lg px-2.5 py-1.5
                bg-slate-50 hover:border-indigo-300 focus:outline-none focus:border-indigo-400
                focus:ring-1 focus:ring-indigo-200 transition-colors cursor-pointer" />
          </div>
          <span className="text-slate-300 text-xs font-bold">→</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">To</span>
            <input type="date" value={value.to ?? ""} min={value.from ?? undefined} max={todayStr}
              onChange={e => onChange({ ...value, to: e.target.value || null })}
              className="text-xs font-semibold text-slate-700 border border-slate-200 rounded-lg px-2.5 py-1.5
                bg-slate-50 hover:border-indigo-300 focus:outline-none focus:border-indigo-400
                focus:ring-1 focus:ring-indigo-200 transition-colors cursor-pointer" />
          </div>
        </div>

        {/* Active badge + clear */}
        {(value.from || value.to) && (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full">
              {value.from === value.to && value.from
                ? formatDateLabel(value.from)
                : value.from && value.to
                  ? `${value.from} → ${value.to}`
                  : value.from ? `From ${value.from}` : `Until ${value.to}`}
            </span>
            {activePreset === "Custom" && (
              <button onClick={() => onChange({ from:null, to:null })}
                className="text-[10px] font-bold text-slate-400 hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-50">
                ✕ Clear
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────
function Sidebar({ activeTab, setActiveTab, agent, onLogout, collapsed, setCollapsed }) {
  const navItems = [
    { id:"dashboard", label:"Dashboard",    icon:Icons.dashboard },
    { id:"history",   label:"Break History",icon:Icons.history   },
    { id:"calls",     label:"Call Logs",    icon:Icons.phone     },
    { id:"missed",    label:"Missed Calls", icon:Icons.missed    },
  ];

  return (
    <aside className={`bg-slate-900 flex flex-col shrink-0 transition-all duration-300 ease-in-out min-h-screen relative z-30 ${collapsed ? "w-16" : "w-60"}`}>
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shrink-0">
          <PhoneIcon className="w-4 h-4 text-white" />
        </div>
        {!collapsed && <span className="font-black text-white text-sm tracking-wide truncate">TeleDesk</span>}
        <button onClick={() => setCollapsed(v => !v)}
          className="ml-auto w-6 h-6 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
            strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
            {collapsed ? <path d="M9 18l6-6-6-6" /> : <path d="M15 18l-6-6 6-6" />}
          </svg>
        </button>
      </div>

      {agent && (
        <div className={`px-3 py-4 border-b border-slate-800 ${collapsed ? "flex justify-center" : ""}`}>
          <div className={`flex items-center gap-3 ${collapsed ? "flex-col" : ""}`}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-600 flex items-center
              justify-center text-sm font-black text-white shrink-0 shadow-lg">
              {agent.name?.charAt(0)?.toUpperCase()}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-white text-xs font-bold truncate">{agent.name}</p>
                <p className={`text-[10px] font-semibold mt-0.5 ${
                  agent.status === "available" ? "text-emerald-400"
                  : agent.status === "busy" ? "text-blue-400" : "text-amber-400"
                }`}>{agent.status}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id)}
            title={collapsed ? item.label : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all text-xs font-bold
              ${activeTab === item.id
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
              } ${collapsed ? "justify-center" : ""}`}>
            <SvgIcon d={item.icon} className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="px-2 py-4 border-t border-slate-800">
        <button onClick={onLogout} title={collapsed ? "Logout" : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400
            hover:text-red-400 hover:bg-red-500/10 transition-all text-xs font-bold
            ${collapsed ? "justify-center" : ""}`}>
          <SvgIcon d={Icons.logout} className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

// ─── Stat Card ────────────────────────────────────────────────
function StatCard({ label, value, sub, icon, accent="indigo", bar, barPct, warn }) {
  const accents = {
    indigo: { bg:"bg-indigo-50",  text:"text-indigo-500",  bar:"bg-indigo-400"  },
    amber:  { bg:"bg-amber-50",   text:"text-amber-500",   bar:"bg-amber-400"   },
    red:    { bg:"bg-red-50",     text:"text-red-500",     bar:"bg-red-400"     },
    emerald:{ bg:"bg-emerald-50", text:"text-emerald-500", bar:"bg-emerald-400" },
    blue:   { bg:"bg-blue-50",    text:"text-blue-500",    bar:"bg-blue-400"    },
    violet: { bg:"bg-violet-50",  text:"text-violet-500",  bar:"bg-violet-400"  },
  };
  const a = accents[warn ? "red" : accent];
  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-5 hover:shadow-md transition-all ${warn ? "border-red-100" : "border-slate-100"}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <div className={`w-8 h-8 rounded-lg ${a.bg} ${a.text} flex items-center justify-center text-sm`}>{icon}</div>
      </div>
      <p className={`text-xl font-black font-mono tabular-nums tracking-tight ${warn ? "text-red-600" : "text-slate-800"}`}>{value}</p>
      {sub && <p className={`text-[10px] mt-0.5 ${warn ? "text-red-500 font-bold" : "text-slate-400"}`}>{sub}</p>}
      {bar && (
        <div className="mt-3 h-1 bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-1 rounded-full transition-all duration-1000 ${a.bar}`} style={{ width:`${Math.min(barPct,100)}%` }} />
        </div>
      )}
    </div>
  );
}

// ─── Tab: Dashboard ───────────────────────────────────────────
function DashboardTab({ agent, activeCall, breakLoading, callLoading, loginTime, onToggleBreak, onEndCall }) {
  const [now, setNow]                       = useState(new Date());
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const isOnBreak    = agent?.status === "break";
  const isBusy       = agent?.status === "busy";
  const breakElapsed = useLiveTimer(agent?.breakStartTime, isOnBreak);
  const loginElapsed = useLiveTimer(loginTime, true);
  const isBreakOver  = breakElapsed > BREAK_LIMIT_SEC;

  const todayLogs = (agent?.breakLogs ?? []).filter(
    l => l.breakStart && toDateStr(l.breakStart) === toDateStr(new Date())
  );
  const todayBreakSec     = todayLogs.reduce((s,l) => s + (l.durationMinutes ?? 0)*60, 0);
  const todaySessionCount = todayLogs.length;
  const liveBreakTotal    = todayBreakSec + (isOnBreak ? breakElapsed : 0);
  const breakPct          = Math.min((liveBreakTotal / BREAK_LIMIT_SEC)*100, 100);

  const statusMap = {
    available:{ label:"Available", dot:"bg-emerald-400", badge:"bg-emerald-50 text-emerald-700 border-emerald-200" },
    busy:     { label:"On Call",   dot:"bg-blue-400",    badge:"bg-blue-50 text-blue-700 border-blue-200" },
    break:{
      label: isBreakOver ? "Limit Exceeded" : "On Break",
      dot:   isBreakOver ? "bg-red-400" : "bg-amber-400",
      badge: isBreakOver ? "bg-red-50 text-red-700 border-red-200" : "bg-amber-50 text-amber-700 border-amber-200",
    },
  };
  const sc = statusMap[agent?.status] ?? statusMap.available;

  return (
    <div className="space-y-4">

      {/* Active Call Banner */}
      {activeCall && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500" />
            </span>
            <div>
              <p className="text-sm font-bold text-blue-900">Call assigned — {activeCall.number}</p>
              <p className="text-xs text-blue-500">{activeCall.type} · Since {formatTime(activeCall.startTime)}</p>
            </div>
          </div>
          <button onClick={() => onEndCall(activeCall._id)} disabled={callLoading}
            className="px-4 py-2 text-xs font-bold text-white bg-red-500 hover:bg-red-600 active:scale-95 rounded-xl transition-all disabled:opacity-50 shadow-sm">
            {callLoading ? "Ending…" : "End Call"}
          </button>
        </div>
      )}

      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-900 p-6 shadow-lg">
        <div className="absolute top-0 right-0 w-56 h-56 rounded-full bg-indigo-600 opacity-10 translate-x-20 -translate-y-20 pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 w-40 h-40 rounded-full bg-violet-500 opacity-10 translate-y-16 pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between gap-6 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-600 flex items-center justify-center text-xl font-black text-white shadow-lg">
                {agent.name?.charAt(0)?.toUpperCase()}
              </div>
              <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${sc.dot}`} />
            </div>
            <div>
              <p className="text-white font-black text-xl leading-tight">{agent.name}</p>
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-bold mt-1 ${sc.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${sc.dot} ${isOnBreak || isBusy ? "animate-pulse" : ""}`} />
                {sc.label}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Session Active</p>
            <p className="text-4xl font-black text-white font-mono tabular-nums tracking-tight leading-none">{formatDuration(loginElapsed)}</p>
            <p className="text-xs text-slate-500 mt-1">{loginTime ? `Since ${formatTimeShort(loginTime)}` : "—"}</p>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Session" icon="⏱" accent="indigo" value={formatDuration(loginElapsed)} sub={loginTime ? `Since ${formatTimeShort(loginTime)}` : "—"} bar barPct={75} />
        <StatCard label="Break Total" icon="☕" accent="amber" value={formatDuration(liveBreakTotal)} sub={liveBreakTotal > BREAK_LIMIT_SEC ? "⚠ Over limit" : "✓ Within limit"} warn={liveBreakTotal > BREAK_LIMIT_SEC} bar barPct={breakPct} />
        <StatCard label="Sessions" icon="📋" accent="violet" value={todaySessionCount + (isOnBreak ? 1 : 0)} sub="break sessions today" />
        <div className={`rounded-2xl border shadow-sm p-5 hover:shadow-md transition-all ${isOnBreak ? (isBreakOver ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200") : "bg-white border-slate-100"}`}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Break</p>
            <span className={`text-lg ${isOnBreak ? (isBreakOver ? "animate-bounce" : "animate-pulse") : ""}`}>
              {isOnBreak ? (isBreakOver ? "⚠️" : "⏸") : "—"}
            </span>
          </div>
          <p className={`text-xl font-black font-mono tabular-nums tracking-tight ${isOnBreak ? (isBreakOver ? "text-red-600" : "text-amber-700") : "text-slate-300"}`}>
            {isOnBreak ? formatDuration(breakElapsed) : "00:00:00"}
          </p>
          <p className={`text-[10px] font-bold mt-0.5 ${isOnBreak ? (isBreakOver ? "text-red-500" : "text-amber-600") : "text-slate-400"}`}>
            {isOnBreak ? (isBreakOver ? "Exceeded!" : "Active now") : "Not on break"}
          </p>
        </div>
      </div>

      {/* Break Control */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Break Control</h2>
            {isOnBreak ? (
              <div className="mt-2">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">Break in progress</p>
                <p className={`text-4xl font-black font-mono tabular-nums tracking-tight leading-none ${isBreakOver ? "text-red-600" : "text-amber-600"}`}>
                  {formatDuration(breakElapsed)}
                </p>
                {isBreakOver && <p className="text-xs text-red-500 font-bold mt-1.5 animate-pulse">⚠ Please resume — limit exceeded</p>}
              </div>
            ) : (
              <p className="text-xs text-slate-400 mt-1.5 max-w-xs">
                {isBusy ? "You're on a call. Break unavailable." : "You're available. Take a break when needed."}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2.5">
            <button onClick={() => setShowHistoryPanel(v => !v)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors">
              📋 History
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
                className={`w-3.5 h-3.5 transition-transform duration-200 ${showHistoryPanel ? "rotate-180" : ""}`}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            <button onClick={onToggleBreak} disabled={isBusy || breakLoading}
              className={`px-5 py-2 text-xs font-black rounded-xl transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed tracking-wide shadow-sm ${
                isOnBreak
                  ? isBreakOver ? "bg-red-500 hover:bg-red-600 text-white animate-pulse" : "bg-emerald-500 hover:bg-emerald-600 text-white"
                  : "bg-amber-400 hover:bg-amber-500 text-amber-950"
              }`}>
              {breakLoading ? "…" : isOnBreak ? (isBreakOver ? "⚠ Resume Now" : "▶ Resume") : "⏸ Take Break"}
            </button>
          </div>
        </div>

        {showHistoryPanel && (
          <div className="border-t border-slate-100">
            <div className={`px-6 py-2 flex items-center justify-between text-xs border-b ${liveBreakTotal > BREAK_LIMIT_SEC ? "bg-red-50 border-red-100" : "bg-emerald-50 border-emerald-100"}`}>
              <span className="text-slate-500 font-medium">Total break today</span>
              <span className={`font-black font-mono ${liveBreakTotal > BREAK_LIMIT_SEC ? "text-red-600" : "text-emerald-600"}`}>
                {formatDuration(liveBreakTotal)}{liveBreakTotal > BREAK_LIMIT_SEC && " ⚠"}
              </span>
            </div>
            {todayLogs.length === 0 ? (
              <div className="py-10 text-center"><p className="text-2xl mb-2">☕</p><p className="text-xs text-slate-400">No breaks taken today</p></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>{["#","Start","End","Duration","Status"].map(h => (
                      <th key={h} className="px-5 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {todayLogs.map((log, i) => {
                      const dur = (log.durationMinutes ?? 0)*60;
                      const over = dur > BREAK_LIMIT_SEC;
                      return (
                        <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-5 py-3 text-xs text-slate-400 font-mono">{i+1}</td>
                          <td className="px-5 py-3 text-xs font-semibold text-slate-700 font-mono">{formatTime(log.breakStart)}</td>
                          <td className="px-5 py-3 text-xs font-semibold text-slate-700 font-mono">
                            {log.breakEnd ? formatTime(log.breakEnd) : (
                              <span className="inline-flex items-center gap-1 text-amber-600 font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />Active
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3">
                            <span className={`text-[10px] font-black font-mono px-2 py-0.5 rounded-md border ${over ? "bg-red-50 text-red-600 border-red-200" : "bg-slate-50 text-slate-600 border-slate-200"}`}>
                              {over && "⚠ "}{formatDuration(dur)}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${log.breakEnd ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                              {log.breakEnd ? "Done" : "Active"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Active Call / No Call */}
      {activeCall ? (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 shadow-sm p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600">
                <PhoneIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Active Call</p>
                <p className="text-2xl font-black text-blue-900 tracking-tight mt-0.5">{activeCall.number}</p>
                <p className="text-xs text-blue-400 mt-0.5">{activeCall.type} · Started {formatTime(activeCall.startTime)}</p>
              </div>
            </div>
            <button onClick={() => onEndCall(activeCall._id)} disabled={callLoading}
              className="px-6 py-2.5 text-sm font-black text-white bg-red-500 hover:bg-red-600 active:scale-95 rounded-xl transition-all disabled:opacity-50 shadow-md">
              {callLoading ? "Ending…" : "🔴 End Call"}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-300">
            <PhoneIcon className="w-5 h-5" />
          </div>
          <p className="text-sm font-semibold text-slate-400">No active call</p>
          <p className="text-xs text-slate-300 mt-1">Calls assigned by admin will appear here.</p>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Break History ───────────────────────────────────────
function BreakHistoryTab({ agent }) {
  const allLogs = agent?.breakLogs ?? [];
  const [dateRange, setDateRange] = useState({ from: null, to: null });

  const filteredLogs = allLogs.filter(log =>
    log.breakStart && isInRange(toDateStr(log.breakStart), dateRange.from, dateRange.to)
  );

  const grouped = filteredLogs.reduce((acc, log) => {
    const d = toDateStr(log.breakStart);
    if (!acc[d]) acc[d] = [];
    acc[d].push(log);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a,b) => b.localeCompare(a));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-black text-slate-800">Break History</h2>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {filteredLogs.length} / {allLogs.length} sessions
        </span>
      </div>

      {/* ── Date Filter ── */}
      <DateFilter value={dateRange} onChange={setDateRange} />

      {sortedDates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
          <p className="text-4xl mb-3">☕</p>
          <p className="text-sm font-semibold text-slate-400">
            {allLogs.length > 0 ? "No breaks found for selected date range" : "No break history yet"}
          </p>
        </div>
      ) : sortedDates.map(date => {
        const logs     = grouped[date];
        const totalSec = logs.reduce((s,l) => s + (l.durationMinutes ?? 0)*60, 0);
        const overLimit = totalSec > BREAK_LIMIT_SEC;
        return (
          <div key={date} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className={`px-5 py-3 flex items-center justify-between border-b ${overLimit ? "bg-red-50 border-red-100" : "bg-slate-50 border-slate-100"}`}>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-800">{formatDateLabel(date)}</span>
                <span className="text-[10px] text-slate-400 font-mono">{date}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-slate-400">{logs.length} sessions</span>
                <span className={`text-xs font-black font-mono px-2.5 py-0.5 rounded-full border ${overLimit ? "bg-red-50 text-red-600 border-red-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
                  {formatDuration(totalSec)}{overLimit && " ⚠"}
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50/50">
                  <tr>{["#","Start","End","Duration","Status"].map(h => (
                    <th key={h} className="px-5 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {logs.map((log, i) => {
                    const dur = (log.durationMinutes ?? 0)*60;
                    return (
                      <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-3 text-xs text-slate-400 font-mono">{i+1}</td>
                        <td className="px-5 py-3 text-xs font-semibold text-slate-700 font-mono">{formatTime(log.breakStart)}</td>
                        <td className="px-5 py-3 text-xs font-semibold text-slate-700 font-mono">
                          {log.breakEnd ? formatTime(log.breakEnd) : (
                            <span className="inline-flex items-center gap-1 text-amber-600 font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />Active
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-[10px] font-black font-mono px-2 py-0.5 rounded-md border bg-slate-50 text-slate-600 border-slate-200">
                            {formatDuration(dur)}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${log.breakEnd ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                            {log.breakEnd ? "Done" : "Active"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Tab: Call Logs ───────────────────────────────────────────
function CallLogsTab({ agent }) {
  const allCalls = agent?.callLogs ?? [];
  const [dateRange, setDateRange] = useState({ from: null, to: null });

  const filteredCalls = allCalls.filter(call =>
    call.startTime && isInRange(toDateStr(call.startTime), dateRange.from, dateRange.to)
  );

  const grouped = filteredCalls.reduce((acc, call) => {
    const d = toDateStr(call.startTime);
    if (!acc[d]) acc[d] = [];
    acc[d].push(call);
    return acc;
  }, {});

  const sortedDates   = Object.keys(grouped).sort((a,b) => b.localeCompare(a));
  const todayStr      = toDateStr(new Date());
  const todayCalls    = (grouped[todayStr] ?? []).length;
  const answeredCalls = filteredCalls.filter(c => c.status === "answered" || c.status === "completed").length;
  const missedCalls   = filteredCalls.filter(c => c.status === "missed").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-black text-slate-800">Call Logs</h2>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {filteredCalls.length} / {allCalls.length} calls
        </span>
      </div>

      {/* ── Date Filter ── */}
      <DateFilter value={dateRange} onChange={setDateRange} />

      {/* Summary Cards — reflect filtered range */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Filtered Calls" icon="📞" accent="indigo"  value={filteredCalls.length} sub="in selected range" />
        <StatCard label="Today"          icon="📅" accent="blue"    value={todayCalls}           sub="calls today" />
        <StatCard label="Answered"       icon="✅" accent="emerald" value={answeredCalls}        sub="completed" />
        <StatCard label="Missed"         icon="❌" accent="red"     value={missedCalls}          sub="missed calls" warn={missedCalls > 0} />
      </div>

      {sortedDates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
          <p className="text-4xl mb-3">📵</p>
          <p className="text-sm font-semibold text-slate-400">
            {allCalls.length > 0 ? "No calls found for selected date range" : "No call history found"}
          </p>
        </div>
      ) : sortedDates.map(date => {
        const calls = grouped[date];
        return (
          <div key={date} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3 flex items-center justify-between border-b bg-slate-50 border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-800">{formatDateLabel(date)}</span>
                <span className="text-[10px] text-slate-400 font-mono">{date}</span>
              </div>
              <span className="text-[10px] text-slate-400">{calls.length} calls</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50/50">
                  <tr>{["#","Number","Type","Started","Duration","Status"].map(h => (
                    <th key={h} className="px-5 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {calls.map((call, i) => {
                    const isMissed   = call.status === "missed";
                    const isAnswered = call.status === "answered" || call.status === "completed";
                    const durSec     = call.durationSeconds ?? 0;
                    return (
                      <tr key={i} className={`transition-colors ${isMissed ? "hover:bg-red-50/30" : "hover:bg-slate-50/60"}`}>
                        <td className="px-5 py-3 text-xs text-slate-400 font-mono">{i+1}</td>
                        <td className="px-5 py-3 text-xs font-bold text-slate-800 font-mono">{call.number ?? call.phone ?? "—"}</td>
                        <td className="px-5 py-3 text-xs text-slate-500">{call.type ?? "Inbound"}</td>
                        <td className="px-5 py-3 text-xs text-slate-600 font-mono">{call.startTime ? formatTime(call.startTime) : "—"}</td>
                        <td className="px-5 py-3">
                          <span className="text-[10px] font-black font-mono px-2 py-0.5 rounded-md border bg-slate-50 text-slate-600 border-slate-200">
                            {durSec > 0 ? formatDuration(durSec) : "—"}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isMissed    ? "bg-red-50 text-red-600 border-red-200"
                            : isAnswered ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-50 text-slate-500 border-slate-200"
                          }`}>{isMissed ? "Missed" : isAnswered ? "Answered" : call.status ?? "Unknown"}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Tab: Missed Calls ────────────────────────────────────────
function MissedCallsTab({ agent }) {
  const allMissed = (agent?.callLogs ?? []).filter(c => c.status === "missed");
  const [dateRange, setDateRange] = useState({ from: null, to: null });

  const missedCalls = allMissed
    .filter(c => c.startTime && isInRange(toDateStr(c.startTime), dateRange.from, dateRange.to))
    .sort((a,b) => new Date(b.startTime) - new Date(a.startTime));

  const todayStr    = toDateStr(new Date());
  const todayMissed = missedCalls.filter(c => c.startTime && toDateStr(c.startTime) === todayStr);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-black text-slate-800">Missed Calls</h2>
        <span className={`text-xs font-black px-3 py-1 rounded-full border ${
          missedCalls.length > 0 ? "bg-red-50 text-red-600 border-red-200" : "bg-slate-50 text-slate-400 border-slate-200"
        }`}>{missedCalls.length} / {allMissed.length} missed</span>
      </div>

      {/* ── Date Filter ── */}
      <DateFilter value={dateRange} onChange={setDateRange} />

      {todayMissed.length > 0 && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="text-sm font-bold text-red-900">{todayMissed.length} missed call{todayMissed.length > 1 ? "s" : ""} today</p>
            <p className="text-xs text-red-500">Please follow up with these customers</p>
          </div>
        </div>
      )}

      {missedCalls.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
          <p className="text-4xl mb-3">✅</p>
          <p className="text-sm font-semibold text-slate-400">
            {allMissed.length > 0 ? "No missed calls for selected range" : "No missed calls — great work!"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>{["#","Number","Date","Time","Type"].map(h => (
                  <th key={h} className="px-5 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {missedCalls.map((call, i) => (
                  <tr key={i} className="hover:bg-red-50/20 transition-colors">
                    <td className="px-5 py-3 text-xs text-slate-400 font-mono">{i+1}</td>
                    <td className="px-5 py-3 text-xs font-bold text-slate-800 font-mono">{call.number ?? call.phone ?? "—"}</td>
                    <td className="px-5 py-3 text-xs text-slate-500">{call.startTime ? formatDateLabel(toDateStr(call.startTime)) : "—"}</td>
                    <td className="px-5 py-3 text-xs text-slate-600 font-mono">{call.startTime ? formatTime(call.startTime) : "—"}</td>
                    <td className="px-5 py-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-slate-50 text-slate-500 border-slate-200">
                        {call.type ?? "Inbound"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function TelecallerPage() {
  const dispatch = useDispatch();
  const { agent, activeCall, loading, breakLoading, callLoading, loginTime } =
    useSelector(s => s.myAgent);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [now, setNow]             = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => { dispatch(fetchMyAgent()); }, [dispatch]);

  useEffect(() => {
    if (!agent?._id) return;
    dispatch(fetchMyCall(agent._id));
    const poll = setInterval(() => dispatch(fetchMyCall(agent._id)), POLL_INTERVAL_MS);
    return () => clearInterval(poll);
  }, [agent?._id, dispatch]);

  const handleToggleBreak = () => {
    if (!agent?._id || agent?.status === "busy") return;
    dispatch(toggleMyBreak(agent._id)).then(() => dispatch(fetchMyAgent()));
  };
  const handleEndCall = (callId) => {
    dispatch(endMyCall(callId)).then(() => dispatch(fetchMyAgent()));
  };
 const handleLogout = async () => {
  try {
    // Backend logout call
    await API.post("/logoutagent");

  } catch (err) {
    console.error("Logout API error:", err);
  }

  // Clear frontend
  localStorage.removeItem("token");
  dispatch(clearMyAgent());

  // Redirect
  window.location.href = "/";
};

  if (loading && !agent) return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="w-60 bg-slate-900" />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-[3px] border-slate-200 border-t-indigo-500 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Loading workspace…</p>
        </div>
      </div>
    </div>
  );

  if (!agent) return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="w-60 bg-slate-900" />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl mx-auto">🔗</div>
          <p className="font-semibold text-slate-700">No agent profile linked</p>
          <p className="text-sm text-slate-400">Ask your admin to link your account.</p>
        </div>
      </div>
    </div>
  );

  const tabContent = {
    dashboard: <DashboardTab agent={agent} activeCall={activeCall} breakLoading={breakLoading}
      callLoading={callLoading} loginTime={loginTime} onToggleBreak={handleToggleBreak} onEndCall={handleEndCall} />,
    history:   <BreakHistoryTab agent={agent} />,
    calls:     <CallLogsTab agent={agent} />,
    missed:    <MissedCallsTab agent={agent} />,
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} agent={agent}
        onLogout={handleLogout} collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between shrink-0 gap-4">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Telecaller Workspace</p>
            <h1 className="text-lg font-bold text-slate-800 mt-0.5 leading-tight">
              Welcome back, <span className="text-indigo-600">{agent.name}</span> 👋
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Login</span>
            <span className="text-xs font-black text-slate-700 font-mono">
              {agent.loginTime ? formatTimeShort(agent.loginTime) : "—"}
            </span>
          </div>
          <div className="bg-slate-900 rounded-xl px-5 py-2.5 text-right shrink-0">
            <p className="text-xl font-black text-white font-mono tabular-nums tracking-widest leading-none">
              {now.toLocaleTimeString([], { hour:"2-digit", minute:"2-digit", second:"2-digit" })}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5 tracking-wide">
              {now.toLocaleDateString([], { weekday:"short", day:"numeric", month:"short", year:"numeric" })}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {tabContent[activeTab]}
        </div>
      </div>
    </div>
  );
}