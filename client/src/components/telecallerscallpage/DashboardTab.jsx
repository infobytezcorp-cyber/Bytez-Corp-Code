import { useEffect, useState } from "react";
import StatCard from "../../components/telecallerscallpage/StatCard";
import { useLiveTimer } from "../../components/telecallerscallpage/useLiveTimer";
import { formatDuration, formatTime, formatTimeShort, toDateStr, BREAK_LIMIT_SEC } from "../../components/telecallerscallpage/Utilities";

const PhoneIcon = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
    strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12 19.79 19.79 0 0 1 1.9 3.37 2 2 0 0 1 3.89 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 5.99 5.99l1.07-1.07a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

export default function DashboardTab({ agent, activeCall, breakLoading, callLoading, loginTime, onToggleBreak, onEndCall, onOpenLeadForm }) {
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);

  const isOnBreak = agent?.status === "break";
  const isBusy   = agent?.status === "busy";
  const breakElapsed = useLiveTimer(agent?.breakStartTime, isOnBreak);
  const loginElapsed = useLiveTimer(loginTime, true);
  const isBreakOver  = breakElapsed > BREAK_LIMIT_SEC;

  const todayLogs = (agent?.breakLogs ?? []).filter(
    l => l.breakStart && toDateStr(l.breakStart) === toDateStr(new Date())
  );
  const todayBreakSec   = todayLogs.reduce((s, l) => s + (l.durationMinutes ?? 0) * 60, 0);
  const todaySessionCount = todayLogs.length;
  const liveBreakTotal  = todayBreakSec + (isOnBreak ? breakElapsed : 0);
  const breakPct        = Math.min((liveBreakTotal / BREAK_LIMIT_SEC) * 100, 100);

  const statusMap = {
    available: { label: "Available", dot: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    busy:      { label: "On Call",   dot: "bg-blue-400",    badge: "bg-blue-50 text-blue-700 border-blue-200"         },
    break: {
      label: isBreakOver ? "Limit Exceeded" : "On Break",
      dot:   isBreakOver ? "bg-red-400"     : "bg-amber-400",
      badge: isBreakOver ? "bg-red-50 text-red-700 border-red-200" : "bg-amber-50 text-amber-700 border-amber-200",
    },
  };
  const sc = statusMap[agent?.status] ?? statusMap.available;

  return (
    <div className="space-y-4">

      {/* ── Active Call Top Banner ── */}
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
          <button
            onClick={() => onEndCall(activeCall._id)}
            disabled={callLoading}
            className="px-4 py-2 text-xs font-bold text-white bg-red-500 hover:bg-red-600 active:scale-95 rounded-xl transition-all disabled:opacity-50 shadow-sm"
          >
            {callLoading ? "Ending…" : "End Call"}
          </button>
        </div>
      )}

      {/* ── Hero Card ── */}
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

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Session"     icon="⏱" accent="indigo" value={formatDuration(loginElapsed)} sub={loginTime ? `Since ${formatTimeShort(loginTime)}` : "—"} bar barPct={75} />
        <StatCard label="Break Total" icon="☕" accent="amber"  value={formatDuration(liveBreakTotal)} sub={liveBreakTotal > BREAK_LIMIT_SEC ? "⚠ Over limit" : "✓ Within limit"} warn={liveBreakTotal > BREAK_LIMIT_SEC} bar barPct={breakPct} />
        <StatCard label="Sessions"    icon="📋" accent="violet" value={todaySessionCount + (isOnBreak ? 1 : 0)} sub="break sessions today" />

        {/* Live Break Card */}
        <div className={`rounded-2xl border shadow-sm p-5 hover:shadow-md transition-all ${
          isOnBreak ? (isBreakOver ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200") : "bg-white border-slate-100"
        }`}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Break</p>
            <span className={`text-lg ${isOnBreak ? (isBreakOver ? "animate-bounce" : "animate-pulse") : ""}`}>
              {isOnBreak ? (isBreakOver ? "⚠️" : "⏸") : "—"}
            </span>
          </div>
          <p className={`text-xl font-black font-mono tabular-nums tracking-tight ${
            isOnBreak ? (isBreakOver ? "text-red-600" : "text-amber-700") : "text-slate-300"
          }`}>
            {isOnBreak ? formatDuration(breakElapsed) : "00:00:00"}
          </p>
          <p className={`text-[10px] font-bold mt-0.5 ${
            isOnBreak ? (isBreakOver ? "text-red-500" : "text-amber-600") : "text-slate-400"
          }`}>
            {isOnBreak ? (isBreakOver ? "Exceeded!" : "Active now") : "Not on break"}
          </p>
        </div>
      </div>

      {/* ── Break Control Panel ── */}
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
                {isBreakOver && (
                  <p className="text-xs text-red-500 font-bold mt-1.5 animate-pulse">⚠ Please resume — limit exceeded</p>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 mt-1.5 max-w-xs">
                {isBusy ? "You're on a call. Break unavailable." : "You're available. Take a break when needed."}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowHistoryPanel(v => !v)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
            >
              📋 History
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
                className={`w-3.5 h-3.5 transition-transform duration-200 ${showHistoryPanel ? "rotate-180" : ""}`}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            <button
              onClick={onToggleBreak}
              disabled={isBusy || breakLoading}
              className={`px-5 py-2 text-xs font-black rounded-xl transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed tracking-wide shadow-sm ${
                isOnBreak
                  ? isBreakOver ? "bg-red-500 hover:bg-red-600 text-white animate-pulse" : "bg-emerald-500 hover:bg-emerald-600 text-white"
                  : "bg-amber-400 hover:bg-amber-500 text-amber-950"
              }`}
            >
              {breakLoading ? "…" : isOnBreak ? (isBreakOver ? "⚠ Resume Now" : "▶ Resume") : "⏸ Take Break"}
            </button>
          </div>
        </div>

        {/* Break History Inline Panel */}
        {showHistoryPanel && (
          <div className="border-t border-slate-100">
            <div className={`px-6 py-2 flex items-center justify-between text-xs border-b ${
              liveBreakTotal > BREAK_LIMIT_SEC ? "bg-red-50 border-red-100" : "bg-emerald-50 border-emerald-100"
            }`}>
              <span className="text-slate-500 font-medium">Total break today</span>
              <span className={`font-black font-mono ${liveBreakTotal > BREAK_LIMIT_SEC ? "text-red-600" : "text-emerald-600"}`}>
                {formatDuration(liveBreakTotal)}{liveBreakTotal > BREAK_LIMIT_SEC && " ⚠"}
              </span>
            </div>
            {todayLogs.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-2xl mb-2">☕</p>
                <p className="text-xs text-slate-400">No breaks taken today</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>{["#", "Start", "End", "Duration", "Status"].map(h => (
                      <th key={h} className="px-5 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {todayLogs.map((log, i) => {
                      const dur  = (log.durationMinutes ?? 0) * 60;
                      const over = dur > BREAK_LIMIT_SEC;
                      return (
                        <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-5 py-3 text-xs text-slate-400 font-mono">{i + 1}</td>
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

      {/* ── Active Call / No Call ── */}
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
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (onOpenLeadForm) return onOpenLeadForm(activeCall?.number);
                  return window.open(`/telecaller/enquiry?agentId=${agent?._id}&agentName=${encodeURIComponent(agent?.name || '')}&phone=${activeCall.number}`, '_blank');
                }}
                className="px-4 py-2 text-sm font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700"
              >
                Open Lead Form
              </button>
              <button
                onClick={() => onEndCall(activeCall._id)}
                disabled={callLoading}
                className="px-6 py-2.5 text-sm font-black text-white bg-red-500 hover:bg-red-600 active:scale-95 rounded-xl transition-all disabled:opacity-50 shadow-md"
              >
                {callLoading ? "Ending…" : "🔴 End Call"}
              </button>
            </div>
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