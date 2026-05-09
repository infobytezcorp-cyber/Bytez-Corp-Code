// src/pages/EnquiryCalls.jsx
// Converted from TypeScript (.tsx) → JavaScript (.jsx)
// All functionality preserved — Redux, socket, real-time clock, etc.

import { useEffect, useMemo, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAgents, toggleBreak, forceLogout } from "../features/agentSlice";
import { fetchCalls, callbackCall } from "../features/callSlice";
import Sidebar from "../components/dashboards/visitors/Sidebar";
import AgentBreakLogs from "../components/calls/AgentBreakLogs";
import MissedCallDetail from "../components/calls/MissedCallDetail";
import UserCallReport from "../components/calls/UserCallReport";
import UserLoginReport from "../components/calls/UserLoginReport";
import Forcelogoutconfirm from "../components/calls/Forcelogoutconfirm";
import socket from "../services/socket";
import toast from "react-hot-toast";

import {
  Activity, Phone, PhoneMissed, PhoneOff, Users, Clock,
  Coffee, LogOut, Search, ChevronRight, Headphones, Circle,
  TrendingUp, CalendarDays, FileText, ArrowUpRight, Bell, Filter,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Normalize status: backend uses "busy", UI shows "on-call"
const normalizeStatus = (s) => s === "busy" ? "on-call" : (s || "offline");

const toLocalDateKey = (value) => {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
};

const getCallDateKey = (call) => toLocalDateKey(call.createdAt || call.startTime);

const getCallAgentId = (call) => {
  const id = call.assignedTo?._id || call.assignedTo || call.agent?._id || call.agent || call.agentId;
  return id ? String(id) : "";
};

const getCallAgentName = (call) => call.assignedTo?.name || call.agent?.name || "Unassigned";

const callBelongsToDate = (call, dateKey) => !dateKey || getCallDateKey(call) === dateKey;

// ─── StatusDot ────────────────────────────────────────────────────────────────
function StatusDot({ status }) {
  const map = {
    available: "bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.15)]",
    "on-call": "bg-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.18)] animate-pulse",
    break:     "bg-amber-500 shadow-[0_0_0_4px_rgba(245,158,11,0.18)]",
    offline:   "bg-slate-300",
  };
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${map[status] || "bg-slate-300"}`} />;
}

// ─── StatusPill ───────────────────────────────────────────────────────────────
function StatusPill({ status }) {
  const labels = { available: "Available", "on-call": "On call", break: "On break", offline: "Offline" };
  const styles = {
    available: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    "on-call": "bg-blue-50 text-blue-700 ring-blue-100",
    break:     "bg-amber-50 text-amber-800 ring-amber-100",
    offline:   "bg-slate-100 text-slate-600 ring-slate-200",
  };
  const s = normalizeStatus(status);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${styles[s] || styles.offline}`}>
      <StatusDot status={s} />
      {labels[s] || "Offline"}
    </span>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, delta, tone }) {
  const tones = {
    blue:    { wrap: "bg-blue-50 text-blue-600",       chip: "text-blue-700 bg-blue-50" },
    emerald: { wrap: "bg-emerald-50 text-emerald-600", chip: "text-emerald-700 bg-emerald-50" },
    amber:   { wrap: "bg-amber-50 text-amber-600",     chip: "text-amber-700 bg-amber-50" },
    rose:    { wrap: "bg-rose-50 text-rose-600",       chip: "text-rose-700 bg-rose-50" },
  }[tone] || {};

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-wider text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
          {delta && (
            <span className={`mt-2 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${tones.chip}`}>
              <TrendingUp className="h-3 w-3" />{delta}
            </span>
          )}
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${tones.wrap}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="pointer-events-none absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-tr from-slate-100/80 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  );
}

// ─── Mini ─────────────────────────────────────────────────────────────────────
function Mini({ label, value, accent }) {
  return (
    <div className="text-center">
      <p className={`text-base font-bold tracking-tight ${accent === "rose" ? "text-rose-600" : "text-slate-900"}`}>{value}</p>
      <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">{label}</p>
    </div>
  );
}

// ─── AgentCard (activity strip) ───────────────────────────────────────────────
function AgentCard({ agent }) {
  const initials = (agent.name || "?").split(" ").map(n => n[0]).slice(0, 2).join("");
  const status   = normalizeStatus(agent.status);
  const loginAt  = agent.loginTime
    ? new Date(agent.loginTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "—";
  const handled  = agent.callsHandled ?? agent.handled ?? 0;
  const missed   = agent.callsMissed  ?? agent.missed  ?? 0;
  const avgSec   = agent.avgCallTime  ?? agent.avgTime  ?? 0;

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white">
              {initials}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 ring-2 ring-white rounded-full">
              <StatusDot status={status} />
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{agent.name}</p>
            <p className="text-[11px] font-medium text-slate-500">
              Ext · {agent.extension || "—"} · since {loginAt}
            </p>
          </div>
        </div>
        <StatusPill status={status} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3">
        <Mini label="Handled" value={String(handled)} />
        <Mini label="Missed"  value={String(missed)} accent={missed > 0 ? "rose" : undefined} />
        <Mini label="Avg" value={avgSec ? `${Math.floor(avgSec / 60)}:${String(avgSec % 60).padStart(2, "0")}` : "—"} />
      </div>
    </div>
  );
}

// ─── IconBtn ──────────────────────────────────────────────────────────────────
function IconBtn({ children, tone = "slate", title, onClick, disabled }) {
  const cls = tone === "rose"
    ? "text-rose-600 hover:bg-rose-50 ring-rose-100"
    : "text-slate-500 hover:bg-slate-100 ring-slate-200";
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ring-1 transition
        ${cls} ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
    >
      {children}
    </button>
  );
}

// ─── AgentsPanel ──────────────────────────────────────────────────────────────
function AgentsPanel({ agents, query, onToggleBreak, onViewLogs, onForceLogout }) {
  const filtered = agents.filter(a =>
    (a.name || "").toLowerCase().includes(query.toLowerCase()) ||
    (a.extension || "").includes(query)
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white">
      {/* Header row */}
      <div className="grid grid-cols-12 border-b border-slate-100 bg-slate-50/60 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        <div className="col-span-4">Agent</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2">Login</div>
        <div className="col-span-1 text-right">Handled</div>
        <div className="col-span-1 text-right">Missed</div>
        <div className="col-span-2 text-right">Action</div>
      </div>

      <ul className="divide-y divide-slate-100">
        {filtered.length === 0 ? (
          <li className="px-5 py-12 text-center text-sm text-slate-400">No agents found</li>
        ) : filtered.map(a => {
          const status  = normalizeStatus(a.status);
          const loginAt = a.loginTime
            ? new Date(a.loginTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "—";
          const handled = a.callsHandled ?? a.handled ?? 0;
          const missed  = a.callsMissed  ?? a.missed  ?? 0;

          return (
            <li key={a._id} className="grid grid-cols-12 items-center px-5 py-3.5 transition hover:bg-slate-50/60">
              {/* Agent */}
              <div className="col-span-4 flex items-center gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white">
                  {(a.name || "?").split(" ").map(n => n[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{a.name}</p>
                  <p className="text-[11px] text-slate-500">Ext · {a.extension || "—"}</p>
                </div>
              </div>

              {/* Status */}
              <div className="col-span-2">
                <StatusPill status={status} />
              </div>

              {/* Login */}
              <div className="col-span-2 text-sm text-slate-600">{loginAt}</div>

              {/* Handled */}
              <div className="col-span-1 text-right text-sm font-semibold text-slate-900">{handled}</div>

              {/* Missed */}
              <div className="col-span-1 text-right text-sm font-semibold text-rose-600">{missed}</div>

              {/* Actions */}
              <div className="col-span-2 flex justify-end gap-1.5">
                <IconBtn
                  title={a.status === "break" ? "Resume" : "Toggle break"}
                  disabled={a.status === "busy"}
                  onClick={() => onToggleBreak(a._id)}
                >
                  <Coffee className="h-3.5 w-3.5" />
                </IconBtn>
                <IconBtn title="View logs" onClick={() => onViewLogs(a)}>
                  <FileText className="h-3.5 w-3.5" />
                </IconBtn>
                {a.status !== "offline" && (
                  <IconBtn title="Force logout" tone="rose" onClick={() => onForceLogout(a)}>
                    <LogOut className="h-3.5 w-3.5" />
                  </IconBtn>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ─── MissedPanel ──────────────────────────────────────────────────────────────
function MissedPanel({ calls, onSelect, dateFilter, onDateChange, query, onQueryChange }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(iv);
  }, []);

  const normalizedQuery = query.trim().toLowerCase();
  const missed = calls
    .filter(c => c.status === "missed")
    .filter(c => callBelongsToDate(c, dateFilter))
    .filter(c => {
      if (!normalizedQuery) return true;
      const caller = (c.contact?.name || c.number || "").toLowerCase();
      const number = (c.number || c.contact?.phone || "").toString().toLowerCase();
      const agent = getCallAgentName(c).toLowerCase();
      return caller.includes(normalizedQuery) || number.includes(normalizedQuery) || agent.includes(normalizedQuery);
    })
    .sort((a, b) => new Date(b.createdAt || b.startTime) - new Date(a.createdAt || a.startTime));

  const summaryRows = Object.entries(missed.reduce((map, call) => {
    const name = getCallAgentName(call);
    map[name] = (map[name] || 0) + 1;
    return map;
  }, {})).sort((a, b) => b[1] - a[1]);

  const filters = (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={e => onQueryChange(e.target.value)}
          placeholder="Caller, number, agent"
          className="h-8 w-48 rounded-lg border border-slate-200 bg-white pl-8 pr-2 text-xs text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      </div>
      <input
        type="date"
        value={dateFilter}
        onChange={e => onDateChange(e.target.value)}
        className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-600 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
      />
      <button
        onClick={() => { onDateChange(""); onQueryChange(""); }}
        className="h-8 rounded-lg border border-slate-200 px-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
      >
        Clear
      </button>
    </div>
  );

  if (missed.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white py-16 text-center">
        <p className="text-2xl mb-2">✅</p>
        <p className="text-sm text-slate-400">No missed calls for selected date</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white">
      <div className="border-b border-slate-100 bg-slate-50/60 px-5 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">Missed calls by assigned agent</p>
            <p className="text-[11px] text-slate-500">{missed.length} pending callback{missed.length === 1 ? "" : "s"}</p>
          </div>
          {filters}
        </div>
        {summaryRows.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {summaryRows.map(([name, count]) => (
              <span key={name} className="inline-flex items-center gap-1.5 rounded-full border border-rose-100 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-100 text-[10px] font-bold text-rose-700">
                  {(name || "U").charAt(0)}
                </span>
                {name}
                <span className="text-rose-600">{count}</span>
              </span>
            ))}
          </div>
        )}
      </div>
      <ul className="divide-y divide-slate-100">
        {missed.map(m => {
          const callerName   = m.contact?.name || m.number || "Unknown";
          const callerNumber = m.contact?.name ? m.number : null;
          const assignedName = getCallAgentName(m);
          const reason       = m.reason || m.missedReason || null;
          const waited       = m.waitDuration || m.waited || null;
          const callTime     = new Date(m.createdAt || m.startTime);
          const atStr        = callTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          const isOverdue    = (now - callTime.getTime()) > 3600000;

          return (
            <li
              key={m._id}
              onClick={() => onSelect(m)}
              className={`flex items-center gap-4 px-5 py-4 transition cursor-pointer
                ${isOverdue ? "bg-rose-50/20 hover:bg-rose-50/40" : "hover:bg-rose-50/30"}`}
            >
              {/* Icon */}
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <PhoneMissed className="h-5 w-5" />
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-slate-900">{callerName}</p>
                  {callerNumber && (
                    <>
                      <span className="text-[11px] text-slate-400">·</span>
                      <p className="text-[12px] text-slate-500">{callerNumber}</p>
                    </>
                  )}
                  {isOverdue && (
                    <span className="text-[9px] font-bold bg-rose-600 text-white px-1.5 py-0.5 rounded uppercase tracking-tight">
                      Delayed
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-[12px] text-slate-500">
                  <span className="font-semibold text-indigo-700">Agent: {assignedName}</span>
                  {(waited || reason) ? " · " : null}
                  {waited ? <><span>Waited </span><span className="font-semibold text-slate-700">{waited}s</span></> : null}
                  {waited && reason ? " · " : null}
                  {reason}
                </p>
              </div>

              {/* Time */}
              <div className="hidden flex-shrink-0 text-right md:block">
                <p className="text-[11px] uppercase tracking-wider text-slate-400">At</p>
                <p className="text-sm font-semibold text-slate-900">{atStr}</p>
              </div>

              {/* Call back */}
              <button
                onClick={e => { e.stopPropagation(); onSelect(m); }}
                className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                <Phone className="h-3.5 w-3.5" /> Call back
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ─── TimeLogsPanel ────────────────────────────────────────────────────────────
function TimeLogsPanel({ agents, dateFilter }) {
  const selectedDate = dateFilter || toLocalDateKey(new Date());

  const rows = agents
    .filter(a => {
      const hasTodaySession = (a.loginHistory || []).some(s => toLocalDateKey(s.loginTime) === selectedDate);
      return a.status !== "offline" || hasTodaySession;
    })
    .map(a => {
      const sessions  = (a.loginHistory || []).filter(s => toLocalDateKey(s.loginTime) === selectedDate);
      const breaks    = (a.breakLogs    || []).filter(b => toLocalDateKey(b.breakStart) === selectedDate);
      const isOnline  = a.status !== "offline";
      const firstLogin = sessions[0]?.loginTime || (isOnline ? a.loginTime : null);
      const loginStr  = firstLogin
        ? new Date(firstLogin).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "—";
      const lastLogout = sessions.filter(s => s.logoutTime).at?.(-1)?.logoutTime
        ?? sessions.filter(s => s.logoutTime)[sessions.filter(s => s.logoutTime).length - 1]?.logoutTime;
      const logoutStr = lastLogout
        ? new Date(lastLogout).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "—";
      const breakCount = breaks.length + (isOnline && a.status === "break" ? 1 : 0);
      return { agent: a, loginStr, logoutStr, breakCount, isOnline };
    });

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
        <p className="text-sm font-semibold text-slate-900">Today's session log</p>
        <button className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
          <CalendarDays className="h-3.5 w-3.5" /> Today
        </button>
      </div>

      {rows.length === 0 ? (
        <div className="py-12 text-center text-sm text-slate-400">No session data for today</div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {rows.map(r => (
            <li
              key={r.agent._id}
              className="grid grid-cols-12 items-center px-5 py-3 text-sm transition hover:bg-slate-50/60"
            >
              <div className="col-span-4 font-semibold text-slate-900">{r.agent.name}</div>
              <div className="col-span-2 text-slate-600">In · {r.loginStr}</div>
              <div className="col-span-2 text-slate-600">Out · {r.logoutStr}</div>
              <div className="col-span-2 text-slate-600">Breaks · {r.breakCount}</div>
              <div className="col-span-2 text-right">
                <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold
                  ${r.isOnline ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                  <Clock className="h-3 w-3" />
                  {r.isOnline ? "Active" : "Ended"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── ReportPage wrapper ───────────────────────────────────────────────────────
function ReportPage({ title, onBack, children }) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200/70 bg-white/80 backdrop-blur-md px-6 py-3.5 shadow-sm">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
        >
          ← Back
        </button>
        <span className="text-sm font-bold text-slate-900">{title}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-6">{children}</div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function EnquiryCalls() {
  const dispatch = useDispatch();
  const { list: agents, loading: agentsLoading } = useSelector(s => s.agents);
  const { list: calls,  loading: callsLoading  } = useSelector(s => s.calls);

  const [tab,                    setTab]                    = useState("agents");
  const [query,                  setQuery]                  = useState("");
  const [now,                    setNow]                    = useState(new Date());
  const [dateFilter,             setDateFilter]             = useState(() => toLocalDateKey(new Date()));
  const [selectedCall,           setSelectedCall]           = useState(null);
  const [agentsTabSelectedAgent, setAgentsTabSelectedAgent] = useState(null);
  const [agentsTabLogsDate,      setAgentsTabLogsDate]      = useState("");
  const [openReport,             setOpenReport]             = useState(null);
  const [logoutTarget,           setLogoutTarget]           = useState(null);

  const initialLoadDone = useRef(false);
  const isLoading = (agentsLoading || callsLoading) && !initialLoadDone.current;

  // Live clock — every second
  useEffect(() => {
    const i = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(i);
  }, []);

  // Fetch data + poll every 15s
  useEffect(() => {
    const callParams = dateFilter ? { date: dateFilter } : undefined;
    Promise.all([dispatch(fetchAgents()), dispatch(fetchCalls(callParams))]).then(() => {
      initialLoadDone.current = true;
    });
    const iv = setInterval(() => {
      dispatch(fetchAgents());
      dispatch(fetchCalls(callParams));
    }, 15000);
    return () => clearInterval(iv);
  }, [dispatch, dateFilter]);

  // Socket — missed call alert
  useEffect(() => {
    const fn = (data) =>
      toast.error(`⚠️ ${data.message}`, { duration: 8000, style: { fontWeight: 700, fontSize: 13 } });
    socket.on("missed-call-alert", fn);
    return () => socket.off("missed-call-alert", fn);
  }, []);

  const handleCallback = (id) => { dispatch(callbackCall(id)); setSelectedCall(null); };
  const handleForceLogoutConfirm = () => {
    if (!logoutTarget) return;
    dispatch(forceLogout(logoutTarget._id));
    setLogoutTarget(null);
  };

  const dateScopedCalls = useMemo(
    () => calls.filter(c => callBelongsToDate(c, dateFilter)),
    [calls, dateFilter]
  );

  const agentsWithCallStats = useMemo(() => {
    const metrics = new Map();
    for (const call of dateScopedCalls) {
      const agentId = getCallAgentId(call);
      if (!agentId) continue;
      if (!metrics.has(agentId)) {
        metrics.set(agentId, { handled: 0, missed: 0, duration: 0, durationCount: 0 });
      }
      const item = metrics.get(agentId);
      const status = call.status?.toLowerCase();
      if (["completed", "answered"].includes(status)) {
        item.handled += 1;
        if (call.duration) {
          item.duration += Number(call.duration) || 0;
          item.durationCount += 1;
        }
      }
      if (status === "missed") item.missed += 1;
    }

    return agents.map(agent => {
      const item = metrics.get(String(agent._id)) || {};
      return {
        ...agent,
        handled: item.handled || 0,
        callsHandled: item.handled || 0,
        missed: item.missed || 0,
        callsMissed: item.missed || 0,
        avgTime: item.durationCount ? Math.round(item.duration / item.durationCount) : 0,
        avgCallTime: item.durationCount ? Math.round(item.duration / item.durationCount) : 0,
      };
    });
  }, [agents, dateScopedCalls]);

  // Derived stats
  const stats = useMemo(() => {
    const online  = agents.filter(a => a.status !== "offline").length;
    const onCall  = agents.filter(a => a.status === "busy").length;
    const handled = dateScopedCalls.filter(c => ["completed", "answered"].includes(c.status?.toLowerCase())).length;
    const missed  = dateScopedCalls.filter(c => c.status === "missed").length;
    return { online, onCall, handled, missed, total: agents.length };
  }, [agents, dateScopedCalls]);

  const TABS = [
    { id: "agents",   label: "Agents",       Icon: Users,       badge: stats.online, danger: false },
    { id: "missed",   label: "Missed Calls", Icon: PhoneMissed, badge: stats.missed, danger: true  },
    { id: "timelogs", label: "Time Logs",    Icon: Clock,       badge: 0,            danger: false },
  ];

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="flex h-screen overflow-hidden bg-slate-50 font-sans antialiased">
        <Sidebar />
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin" />
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Syncing live data…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans antialiased">
      <Sidebar />

      {/* ── Report pages ── */}
      {openReport === "call" && (
        <ReportPage title="User Call Report" onBack={() => setOpenReport(null)}>
          <UserCallReport agents={agents} calls={calls} onClose={() => setOpenReport(null)} inPage />
        </ReportPage>
      )}
      {openReport === "login" && (
        <ReportPage title="User Login Report" onBack={() => setOpenReport(null)}>
          <UserLoginReport agents={agents} onClose={() => setOpenReport(null)} inPage />
        </ReportPage>
      )}

      {/* ── Missed call detail ── */}
      {!openReport && selectedCall && (
        <div className="flex flex-1 overflow-y-auto">
          <MissedCallDetail
            call={selectedCall}
            onBack={() => setSelectedCall(null)}
            onCallback={handleCallback}
          />
        </div>
      )}

      {/* ── Main dashboard ── */}
      {!openReport && !selectedCall && (
        <div className="flex flex-1 flex-col overflow-hidden">

          {/* ── Top navbar ── */}
          <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
            <div className="flex items-center justify-between px-6 py-3.5 gap-4">

              {/* Logo */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                  <Headphones className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Call Center Ops</p>
                  <p className="text-sm font-bold text-slate-900">Enquiry Live Dashboard</p>
                </div>
              </div>

              {/* Search + icons */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search agent or extension…"
                    className="h-9 w-64 rounded-xl border border-slate-200 bg-slate-50/60 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <button className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
                  <Filter className="h-4 w-4" />
                </button>
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={e => setDateFilter(e.target.value)}
                    className="h-9 rounded-xl border border-slate-200 bg-slate-50/60 pl-9 pr-3 text-sm font-semibold text-slate-700 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <button className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
                  <Bell className="h-4 w-4" />
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
                </button>
              </div>

              {/* Right side */}
              <div className="flex items-center gap-3 flex-shrink-0">
                {/* Live clock */}
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
                  <Circle className="h-2 w-2 fill-emerald-500 text-emerald-500 animate-pulse" />
                  Live · {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </span>

                {/* Call report */}
                <button
                  onClick={() => setOpenReport("call")}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
                >
                  <FileText className="h-4 w-4" /> Call report
                </button>

                {/* Login report */}
                <button
                  onClick={() => setOpenReport("login")}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
                >
                  <ArrowUpRight className="h-4 w-4" /> Login report
                </button>

                {/* Avatar */}
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xs font-bold text-white">
                  SK
                </div>
              </div>
            </div>
          </header>

          {/* ── Scrollable body ── */}
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-[1400px] px-6 py-6">

              {/* Page title */}
              {/* <section className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Real-time agent performance</h1>
                <p className="mt-1 text-sm text-slate-500">
                  Monitor live calls, missed enquiries and agent availability across the floor.
                </p>
              </section> */}

              {/* Stat cards */}
              <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard icon={Users}    label="Online agents" value={`${stats.online}/${stats.total}`} delta="+2 vs avg" tone="blue"    />
                <StatCard icon={Phone}    label="On call now"   value={String(stats.onCall)}              delta="+12%"      tone="emerald" />
                <StatCard icon={PhoneOff} label="Missed calls"  value={String(stats.missed)}              delta="-1 vs y'd" tone="rose"    />
                <StatCard icon={Activity} label="Calls handled" value={String(stats.handled)}             delta="+8.4%"     tone="amber"   />
              </section>

              {/* Recent agent activity */}
              <section className="mb-8">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-5 w-1 rounded-full bg-blue-600" />
                    <h2 className="text-base font-bold text-slate-900">Recent agent activity</h2>
                  </div>
                  <button className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700">
                    View all <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {agentsWithCallStats.slice(0, 4).map(a => <AgentCard key={a._id} agent={a} />)}
                </div>
              </section>

              {/* Tab bar + panels */}
              <section>
                <div className="mb-4 inline-flex rounded-2xl border border-slate-200/70 bg-white p-1 shadow-sm">
                  {TABS.map(({ id, label, Icon, badge, danger }) => {
                    const active = tab === id;
                    return (
                      <button
                        key={id}
                        onClick={() => setTab(id)}
                        className={`relative inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all
                          ${active ? "bg-blue-600 text-white shadow-md shadow-blue-500/25" : "text-slate-600 hover:text-slate-900"}`}
                      >
                        <Icon className="h-4 w-4" />
                        {label}
                        {badge > 0 && (
                          <span className={`inline-flex min-w-[20px] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold
                            ${active ? "bg-white/20 text-white" : danger ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-700"}`}>
                            {badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {tab === "agents" && (
                  <AgentsPanel
                    agents={agentsWithCallStats}
                    query={query}
                    onToggleBreak={(id) => dispatch(toggleBreak(id))}
                    onViewLogs={(agent) => { setAgentsTabSelectedAgent(agent); setAgentsTabLogsDate(""); }}
                    onForceLogout={(agent) => setLogoutTarget(agent)}
                  />
                )}
                {tab === "missed" && (
                  <MissedPanel
                    calls={calls}
                    onSelect={setSelectedCall}
                    dateFilter={dateFilter}
                    onDateChange={setDateFilter}
                    query={query}
                    onQueryChange={setQuery}
                  />
                )}
                {tab === "timelogs" && (
                  <TimeLogsPanel agents={agents} dateFilter={dateFilter} />
                )}
              </section>

              {/* Footer */}
              <footer className="mt-10 flex items-center justify-between border-t border-slate-200/70 pt-5 text-xs text-slate-500">
                <p>© Call Center Ops · auto-refresh every 15s</p>
                <p className="inline-flex items-center gap-1.5">
                  <Circle className="h-2 w-2 fill-emerald-500 text-emerald-500" />
                  All systems operational
                </p>
              </footer>

            </div>
          </main>
        </div>
      )}

      {/* ── Modals ── */}
      {agentsTabSelectedAgent && (
        <AgentBreakLogs
          agent={agentsTabSelectedAgent}
          selectedDate={agentsTabLogsDate}
          onDateChange={setAgentsTabLogsDate}
          onClose={() => setAgentsTabSelectedAgent(null)}
        />
      )}
      {logoutTarget && (
        <Forcelogoutconfirm
          agent={logoutTarget}
          onConfirm={handleForceLogoutConfirm}
          onCancel={() => setLogoutTarget(null)}
        />
      )}
    </div>
  );
}
