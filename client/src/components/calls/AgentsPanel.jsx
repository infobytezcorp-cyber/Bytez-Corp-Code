import { useState, useEffect, useCallback } from "react";

// CONSTANTS
// Break limit set to 1 hour (3600 seconds) - can be adjusted as needed
const BREAK_LIMIT_SECONDS = 3600; // 1 hour
const TIMER_INTERVAL_MS = 1000; // 1 second

// UTILITY — seconds → "1h 23m 45s"
// Converts total seconds into a human-readable format (e.g., "1h 23m 45s")
function formatDuration(totalSeconds) {
  if (!totalSeconds || totalSeconds < 0) return "0s";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}


// HOOK — Live break timer
// Returns elapsed break time in seconds, updating every second when on break
function useBreakTimer(status, breakStartTime) {
  const getElapsed = useCallback(() => {
    if (status !== "break" || !breakStartTime) return 0;
    const diff = Math.floor((Date.now() - new Date(breakStartTime).getTime()) / 1000);
    return diff < 0 ? 0 : diff;
  }, [status, breakStartTime]);

  const [elapsed, setElapsed] = useState(getElapsed);

  // Update elapsed time every second when on break
  useEffect(() => {
    if (status !== "break" || !breakStartTime) {
      setElapsed(0);
      return;
    }
    setElapsed(getElapsed());
    const timer = setInterval(() => setElapsed(getElapsed()), TIMER_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [status, breakStartTime, getElapsed]);

  return elapsed;
}

// ─────────────────────────────────────────────
// STYLE HELPERS
// ─────────────────────────────────────────────
// Status badge styles based on agent status and wherther break time is over the limit
function getStatusBadgeClass(status, isOverLimit) {
  if (status === "available") return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (status === "busy") return "bg-red-100 text-red-700 border-red-200";
  if (status === "break") return isOverLimit
    ? "bg-red-100 text-red-700 border-red-200"
    : "bg-yellow-100 text-yellow-700 border-yellow-200";
  return "bg-slate-100 text-slate-600 border-slate-200";
}

// Status dot color based on agent status and whether break time is over the limit
function getStatusDotClass(status, isOverLimit) {
  if (status === "available") return "bg-emerald-500";
  if (status === "busy") return "bg-red-500";
  if (status === "break") return isOverLimit ? "bg-red-500 animate-pulse" : "bg-yellow-500";
  return "bg-slate-400";
}

// Break button styles based on status and whether break time is over the limit
function getBreakButtonClass(status, isOverLimit) {
  if (status === "busy") return "text-slate-300 border-slate-100 bg-slate-50 cursor-not-allowed";
  if (status === "break") return isOverLimit
    ? "text-red-600 bg-red-50 border-red-200 hover:bg-red-100 animate-pulse"
    : "text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100";
  return "text-yellow-600 bg-yellow-50 border-yellow-200 hover:bg-yellow-100";
}

// Button label based on status and whether break time is over the limit
function getBreakButtonLabel(status, isOverLimit) {
  if (status === "busy") return "On Call";
  if (status === "break") return isOverLimit ? "⚠️ Resume Now" : "▶ Resume";
  return "⏸ Break";
}

// Agent row component - displays individual agnent info and actions
function AgentRow({ agent, onToggleBreak, onViewLogs, onForceLogout }) {
  const elapsed = useBreakTimer(agent.status, agent.breakStartTime);
  const isBreak = agent.status === "break";
  const isOverLimit = elapsed > BREAK_LIMIT_SECONDS;

  // Total = previous completed breaks + current live session
  const previousSeconds = (agent.totalBreakMinutes ?? 0) * 60;
  const currentSeconds = isBreak ? elapsed : 0;
  const totalSeconds = previousSeconds + currentSeconds;
  const isTotalOverLimit = totalSeconds > BREAK_LIMIT_SECONDS;

  return (
    <div className={`px-6 py-4 flex items-center justify-between transition-colors
      ${isBreak && isOverLimit ? "bg-red-50/50" : "hover:bg-slate-50"}`}
    >
      {/* Left — Avatar + Info */}
      <div className="flex items-center gap-3 min-w-0">

        {/* Avatar with status dot */}
        <div className="relative shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-semibold select-none">
            {agent.name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white
            ${getStatusDotClass(agent.status, isOverLimit)}`}
          />
        </div>

        {/* Name + Total Break Time + Status */}
        <div className="min-w-0">

          {/* Row 1: Name + Total break badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-slate-700">{agent.name}</p>

            {/* Total break time — always visible if > 0 */}
            {totalSeconds > 0 && (
              <span className={`text-xs font-mono px-2 py-0.5 rounded-full border font-semibold shrink-0
                ${isTotalOverLimit
                  ? "bg-red-100 text-red-600 border-red-200"
                  : "bg-slate-100 text-slate-500 border-slate-200"
                }`}>
                🕐 {formatDuration(totalSeconds)}
              </span>
            )}
          </div>

          {/* Row 2: Status badge + current session live timer */}
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium
              ${getStatusBadgeClass(agent.status, isOverLimit)}`}>
              {agent.status}
            </span>

            {/* Current break session — live timer */}
            {isBreak && elapsed > 0 && (
              <span className={`text-xs font-mono font-semibold flex items-center gap-1
                ${isOverLimit ? "text-red-600" : "text-yellow-600"}`}>
                {isOverLimit && <span className="animate-pulse">⚠️</span>}
                ⏱ {formatDuration(elapsed)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right — Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        {agent.status !== "offline" && (
          <button
            onClick={() => onForceLogout(agent)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border text-red-600 bg-red-50 border-red-200 hover:bg-red-100 transition-colors"
          >
            ⏻ Logout
          </button>
        )}

        {/* View Logs button */}
        <button
          onClick={() => onViewLogs(agent)}
          className="px-3 py-1.5 text-xs font-medium rounded-lg border text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100 transition-colors"
        >
          📋 Logs
        </button>

        {/* Break / Resume button */}
        <button
          onClick={() => onToggleBreak(agent._id)}
          disabled={agent.status === "busy"}
          className={`px-4 py-1.5 text-xs font-medium rounded-lg border transition-all
            ${getBreakButtonClass(agent.status, isOverLimit)}`}
        >
          {getBreakButtonLabel(agent.status, isOverLimit)}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// AGENTS PANEL — main export
// ─────────────────────────────────────────────
export default function AgentsPanel({ agents = [], availableCount = 0, onToggleBreak, onViewLogs, onAssign, onForceLogout }) {

  // How many agents have been on break for over the limit? (for header warning badge)
  const overLimitCount = agents.filter(a => {
    if (a.status !== "break" || !a.breakStartTime) return false;
    return (Date.now() - new Date(a.breakStartTime).getTime()) / 1000 > BREAK_LIMIT_SECONDS;
  }).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Agents</h2>
          <p className="text-xs text-slate-400 mt-0.5">{agents.length} total agents</p>
        </div>
        <div className="flex items-center gap-2">
          {overLimitCount > 0 && (
            <span className="text-xs text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full font-medium animate-pulse">
              ⚠️ {overLimitCount} over 1hr
            </span>
          )}
          <span className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-medium">
            {availableCount} available
          </span>
        </div>
      </div>

      {/* Agent list */}
      <div className="divide-y divide-slate-50">
        {agents.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-3xl mb-2">🧍</p>
            <p className="text-sm text-slate-400">No agents found</p>
          </div>
        ) : (
          agents.map(agent => (
            <AgentRow
              key={agent._id}
              agent={agent}
              onToggleBreak={onToggleBreak}
              onViewLogs={onViewLogs}
              onForceLogout={onForceLogout}
            />
          ))
        )}
      </div>
    </div>
  );
}