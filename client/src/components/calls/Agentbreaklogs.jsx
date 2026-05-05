// src/components/calls/AgentBreakLogs.jsx
//
// ── createPortal renders into document.body ───────────────────────────────────
//  Completely escapes any parent's position / overflow / transform context.
//  Works as a true full-screen popup from BOTH Agents tab AND Time Logs tab.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, useEffect } from "react";
import { createPortal } from "react-dom";

// ─── Utils ───────────────────────────────────────────────────────────────────
function formatDuration(totalSeconds) {
  if (!totalSeconds || totalSeconds < 0) return "0s";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function toDateStr(dateInput) {
  const d  = new Date(dateInput);
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function formatDisplayDate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString([], {
    weekday: "short", day: "numeric", month: "short",
  });
}

// ─── Modal Content ────────────────────────────────────────────────────────────
function ModalContent({ agent, selectedDate, onDateChange, onClose }) {
  const logs = agent.breakLogs ?? [];

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const availableDates = useMemo(() => {
    const dates = [...new Set(
      logs.filter(l => l.breakStart).map(l => toDateStr(l.breakStart))
    )];
    return dates.sort((a, b) => b.localeCompare(a));
  }, [logs]);

  const filteredLogs = useMemo(() => {
    if (!selectedDate) return logs;
    return logs.filter(l => l.breakStart && toDateStr(l.breakStart) === selectedDate);
  }, [logs, selectedDate]);

  const totalFilteredSeconds = filteredLogs.reduce((sum, l) => sum + (l.durationMinutes ?? 0) * 60, 0);
  const isOverLimit          = totalFilteredSeconds > 3600;

  return (
    /*
      Backdrop — fixed inset-0 works perfectly here because this node
      lives in document.body via createPortal, not inside any relative ancestor.
    */
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(6px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Modal card */}
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col border border-slate-100 overflow-hidden animate-in"
        style={{ maxHeight: "85vh" }}
        onClick={e => e.stopPropagation()}
      >

        {/* ── Header ── */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0 select-none">
              {agent.name?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">
                {agent.name} — Break Logs
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                All-time total:{" "}
                <span className="font-semibold text-slate-600">
                  {formatDuration((agent.totalBreakMinutes ?? 0) * 60)}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors text-lg leading-none"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* ── Date Filter Pills ── */}
        <div className="px-6 py-3 border-b border-slate-100 flex items-center gap-3 flex-wrap shrink-0 bg-slate-50">
          <span className="text-xs text-slate-400 font-medium shrink-0">Filter:</span>

          <div className="flex gap-1.5 flex-wrap flex-1">
            <button
              onClick={() => onDateChange("")}
              className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all
                ${!selectedDate
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "text-slate-500 border-slate-200 bg-white hover:bg-slate-50"}`}
            >
              All dates
            </button>
            {availableDates.map(date => (
              <button
                key={date}
                onClick={() => onDateChange(date)}
                className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all
                  ${selectedDate === date
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "text-slate-500 border-slate-200 bg-white hover:bg-slate-50"}`}
              >
                {formatDisplayDate(date)}
              </button>
            ))}
          </div>

          <input
            type="date"
            value={selectedDate}
            onChange={e => onDateChange(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 shrink-0"
          />
        </div>

        {/* ── Summary Bar ── */}
        {filteredLogs.length > 0 && (
          <div className={`px-6 py-2.5 flex items-center justify-between text-xs shrink-0 border-b
            ${isOverLimit
              ? "bg-red-50 border-red-100"
              : "bg-emerald-50 border-emerald-100"}`}
          >
            <span className="text-slate-500">
              {filteredLogs.length} session{filteredLogs.length !== 1 ? "s" : ""}
              {selectedDate ? ` on ${formatDisplayDate(selectedDate)}` : ""}
            </span>
            <span className={`font-semibold font-mono flex items-center gap-1
              ${isOverLimit ? "text-red-600" : "text-emerald-600"}`}>
              {isOverLimit && <span>⚠️</span>}
              Total: {formatDuration(totalFilteredSeconds)}
            </span>
          </div>
        )}

        {/* ── Table ── */}
        <div className="overflow-y-auto flex-1">
          {filteredLogs.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-sm text-slate-400">
                {logs.length === 0 ? "No break logs yet" : "No breaks on this date"}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="sticky top-0 bg-slate-50 z-10 border-b border-slate-100">
                <tr>
                  {["#", "Break Start", "Break End", "Duration", "Status"].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredLogs.map((log, i) => {
                  const durSec = (log.durationMinutes ?? 0) * 60;
                  const over   = durSec > 3600;
                  return (
                    <tr key={i} className="hover:bg-slate-50/70 transition-colors">

                      {/* # */}
                      <td className="px-5 py-3.5 text-xs text-slate-400 w-8">{i + 1}</td>

                      {/* Break Start */}
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-medium text-slate-700">
                          {new Date(log.breakStart).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Date(log.breakStart).toLocaleDateString([], { day: "numeric", month: "short" })}
                        </p>
                      </td>

                      {/* Break End */}
                      <td className="px-5 py-3.5">
                        {log.breakEnd ? (
                          <>
                            <p className="text-sm font-medium text-slate-700">
                              {new Date(log.breakEnd).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                            </p>
                            <p className="text-xs text-slate-400">
                              {new Date(log.breakEnd).toLocaleDateString([], { day: "numeric", month: "short" })}
                            </p>
                          </>
                        ) : (
                          <span className="text-xs text-yellow-600 font-medium flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse inline-block" />
                            On break
                          </span>
                        )}
                      </td>

                      {/* Duration */}
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-mono font-semibold px-2.5 py-1 rounded-full border
                          ${over
                            ? "bg-red-100 text-red-600 border-red-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"}`}>
                          {over && "⚠️ "}{formatDuration(durSec)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium
                          ${log.breakEnd
                            ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                            : "bg-yellow-100 text-yellow-700 border-yellow-200"}`}>
                          {log.breakEnd ? "Completed" : "Active"}
                        </span>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-3 border-t border-slate-100 flex justify-end shrink-0 bg-slate-50/50">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-white transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────
export default function AgentBreakLogs(props) {
  if (!props.agent) return null;

  // Portal → renders into document.body
  // Escapes ALL parent containers: position, overflow, transform, z-index
  // Result: true full-screen popup every time, from any tab
  return createPortal(<ModalContent {...props} />, document.body);
}