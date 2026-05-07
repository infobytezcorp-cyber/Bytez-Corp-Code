import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import Visitors from "../components/dashboards/visitors/Visitors";
import Sidebar from "../components/dashboards/Sidebar";
import {
  fetchMyAgent,
  toggleMyBreak,
  fetchMyCall,
  endMyCall,
} from "../features/myAgentSlice";

// ─── Constants ────────────────────────────────────────────────
const POLL_INTERVAL_MS = 5000;
const BREAK_LIMIT_SEC  = 3600;
const TIMER_TICK_MS    = 1000;

// ─── Utils ────────────────────────────────────────────────────
function formatDuration(totalSeconds) {
  if (!totalSeconds || totalSeconds <= 0) return "0s";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function toDateStr(dateInput) {
  const d = new Date(dateInput);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
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

// ─── Stat Card ────────────────────────────────────────────────
function StatCard({ label, value, icon, bg, sub, subColor }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-xs text-slate-400 mb-1">{label}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        {sub && (
          <p className={`text-xs mt-0.5 font-medium ${subColor ?? "text-slate-400"}`}>
            {sub}
          </p>
        )}
      </div>
      <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center text-lg shrink-0`}>
        {icon}
      </div>
    </div>
  );
}

// ─── Telecaller Panel ─────────────────────────────────────────
function TelecallerPanel() {
  const dispatch = useDispatch();
  const { agent, activeCall, loading, callLoading, loginTime } = useSelector(
    (s) => s.myAgent
  );

  const isOnBreak    = agent?.status === "break";
  const breakElapsed = useLiveTimer(agent?.breakStartTime, isOnBreak);
  const loginElapsed = useLiveTimer(loginTime, true);
  const isBreakOver  = breakElapsed > BREAK_LIMIT_SEC;

  const todayLogs = (agent?.breakLogs ?? []).filter(
    (l) => l.breakStart && toDateStr(l.breakStart) === toDateStr(new Date())
  );
  const todayBreakSec     = todayLogs.reduce((s, l) => s + (l.durationMinutes ?? 0) * 60, 0);
  const todaySessionCount = todayLogs.length;
  const liveBreak         = todayBreakSec + (isOnBreak ? breakElapsed : 0);

  // ── Fetch own agent on mount ──
  useEffect(() => {
    dispatch(fetchMyAgent());
  }, [dispatch]);

  // ── Poll for assigned call every 5s ──
  useEffect(() => {
    if (!agent?._id) return;
    dispatch(fetchMyCall(agent._id));
    const poll = setInterval(() => dispatch(fetchMyCall(agent._id)), POLL_INTERVAL_MS);
    return () => clearInterval(poll);
  }, [agent?._id, dispatch]);

  // ── Handlers ──
  const handleToggleBreak = () => {
    if (!agent?._id) return;
    dispatch(toggleMyBreak(agent._id)).then(() => dispatch(fetchMyAgent()));
  };

  const handleEndCall = (callId) => {
    dispatch(endMyCall(callId)).then(() => dispatch(fetchMyAgent()));
  };

  // ── Break button style ──
  const breakBtnClass = isOnBreak
    ? isBreakOver
      ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
      : "bg-emerald-500 hover:bg-emerald-600 text-white"
    : "bg-yellow-400 hover:bg-yellow-500 text-yellow-900";

  const breakBtnLabel = isOnBreak
    ? isBreakOver ? "⚠️ Resume Now" : "▶ Resume"
    : "⏸ Take Break";

  // ── Loading state ──
  if (loading && !agent) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  // ── No agent linked ──
  if (!agent) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <p className="text-4xl mb-3">🔗</p>
          <p className="text-sm font-medium text-slate-600">No agent profile linked</p>
          <p className="text-xs text-slate-400 mt-1">
            Ask your admin to link your account to an agent.
          </p>
        </div>
      </div>
    );
  }

  const statusStyles = {
    available: "bg-emerald-100 text-emerald-700 border-emerald-200",
    busy:      "bg-red-100 text-red-700 border-red-200",
    break:     isBreakOver
               ? "bg-red-100 text-red-700 border-red-200"
               : "bg-yellow-100 text-yellow-700 border-yellow-200",
  };

  return (
    <div>

      {/* ── Active call banner ── */}
      {activeCall && (
        <div className="mb-4 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500" />
            </span>
            <div>
              <p className="text-sm font-semibold text-blue-800">
                Incoming call — {activeCall.number}
              </p>
              <p className="text-xs text-blue-600 mt-0.5">
                {activeCall.type} · Since {formatTime(activeCall.startTime)}
              </p>
            </div>
          </div>
          <button
            onClick={() => handleEndCall(activeCall._id)}
            disabled={callLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all disabled:opacity-50"
          >
            {callLoading ? "Ending…" : "End Call"}
          </button>
        </div>
      )}

      {/* ── Header ── */}
      <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-bold text-slate-800">Welcome, {agent.name}</h2>
        <span
          className={`text-sm px-3 py-1 rounded-full border font-medium
            ${statusStyles[agent.status] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}
        >
          {agent.status === "break" && isBreakOver && "⚠️ "}
          {agent.status}
        </span>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard
          label="Login Duration"
          value={formatDuration(loginElapsed)}
          icon="🕐"
          bg="bg-blue-50"
        />
        <StatCard
          label="Login Since"
          value={loginTime ? formatTime(loginTime) : "—"}
          icon="📍"
          bg="bg-violet-50"
        />
        <StatCard
          label="Today's Break"
          value={formatDuration(liveBreak)}
          icon="☕"
          bg={liveBreak > BREAK_LIMIT_SEC ? "bg-red-50" : "bg-amber-50"}
          sub={liveBreak > BREAK_LIMIT_SEC ? "Over 1hr limit" : "Within limit"}
          subColor={liveBreak > BREAK_LIMIT_SEC ? "text-red-500" : "text-emerald-500"}
        />
        <StatCard
          label="Break Sessions"
          value={todaySessionCount + (isOnBreak ? 1 : 0)}
          icon="⏱️"
          bg="bg-slate-50"
          sub="Today"
        />
      </div>

      {/* ── Break control card ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-base font-semibold text-slate-800 mb-1">Break Control</h3>
            {isOnBreak ? (
              <div>
                <p className="text-xs text-slate-400">Current break duration</p>
                <p className={`text-3xl font-bold font-mono mt-1 ${isBreakOver ? "text-red-600" : "text-yellow-600"}`}>
                  {isBreakOver && <span className="text-2xl mr-1">⚠️</span>}
                  {formatDuration(breakElapsed)}
                </p>
                {isBreakOver && (
                  <p className="text-xs text-red-500 mt-1 font-medium">
                    Break limit exceeded — please resume immediately
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 mt-1">
                {agent.status === "busy"
                  ? "You are on a call — cannot take a break"
                  : "You are available. Take a break when needed."}
              </p>
            )}
          </div>
          <button
            onClick={handleToggleBreak}
            disabled={agent.status === "busy"}
            className={`px-6 py-2.5 text-sm font-semibold rounded-xl transition-all active:scale-95
              disabled:opacity-40 disabled:cursor-not-allowed ${breakBtnClass}`}
          >
            {breakBtnLabel}
          </button>
        </div>
      </div>

      {/* ── Active call detail card ── */}
      {activeCall && (
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
          <h3 className="text-base font-semibold text-slate-800 mb-4">Active Call</h3>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-2xl">
                📞
              </div>
              <div>
                <p className="text-lg font-bold text-slate-800">{activeCall.number}</p>
                <p className="text-xs text-slate-400">
                  {activeCall.type} · Started {formatTime(activeCall.startTime)}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleEndCall(activeCall._id)}
              disabled={callLoading}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all disabled:opacity-50"
            >
              {callLoading ? "Ending…" : "End Call"}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

// ─── Main User Page ───────────────────────────────────────────
export default function User() {
  const [activeTab, setActiveTab] = useState("visitors");
  const navigate = useNavigate();

  const TABS = [
    {
      key: "visitors",
      label: "Visitor Log",
      icon: (
        <svg
          viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
          className="w-4 h-4"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      key: "telecaller",
      label: "Telecaller",
      icon: (
        <svg
          viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
          className="w-4 h-4"
        >
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12 19.79 19.79 0 0 1 1.9 3.37 2 2 0 0 1 3.89 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 5.99 5.99l1.07-1.07a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      ),
    },
  ];

  const TAB_ACTIVE_STYLES = {
    visitors:   "border-blue-600 text-blue-600",
    telecaller: "border-teal-600 text-teal-600",
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── Top bar ── */}
        <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-base font-semibold text-gray-900">
              {activeTab === "visitors" ? "Visitor Dashboard" : "Telecaller Dashboard"}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {activeTab === "visitors"
                ? "Manage visitor logs"
                : "Manage your calls & breaks"}
            </p>
          </div>
          {activeTab === "visitors" && (
            <button
              onClick={() => navigate("/visitor?source=employee")}
              className="bg-black text-white text-xs px-4 py-2 rounded-lg"
            >
              + Create User
            </button>
          )}
        </div>

        {/* ── Tab bar ── */}
        <div className="bg-white border-b border-gray-100 px-6 flex gap-0 shrink-0">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-colors cursor-pointer
                ${activeTab === tab.key
                  ? TAB_ACTIVE_STYLES[tab.key]
                  : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "visitors"   && <Visitors />}
          {activeTab === "telecaller" && <TelecallerPanel />}
        </div>

      </div>
    </div>
  );
}