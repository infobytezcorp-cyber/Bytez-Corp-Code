// src/components/calls/TimeLogsTab.jsx

import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";

// ─── Utils ───────────────────────────────────────────────────────────────────

function formatDuration(totalSeconds) {
    if (!totalSeconds || totalSeconds < 0) return "—";
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
}

function toDateStr(dateInput) {
    const d = new Date(dateInput);
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

const BREAK_LIMIT_SECONDS = 3600;

// ─── Popup Modal (rendered via createPortal into document.body) ───────────────

function BreakLogsModal({ agent, selectedDate, onDateChange, onClose }) {
    const logs = agent.breakLogs ?? [];

    // Lock background scroll while modal is open
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, []);

    // Close on Escape key
    useEffect(() => {
        const handler = (e) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    const availableDates = useMemo(() => {
        const set = new Set(
            logs.filter(l => l.breakStart).map(l => toDateStr(l.breakStart))
        );
        return [...set].sort((a, b) => b.localeCompare(a));
    }, [logs]);

    const filteredLogs = useMemo(() => {
        if (!selectedDate) return logs;
        return logs.filter(l => l.breakStart && toDateStr(l.breakStart) === selectedDate);
    }, [logs, selectedDate]);

    const totalSec = filteredLogs.reduce((s, l) => s + (l.durationMinutes ?? 0) * 60, 0);
    const isOverLimit = totalSec > BREAK_LIMIT_SECONDS;

    // Portal renders directly into document.body —
    // escapes ALL parent containers (overflow, position, transform, z-index)
    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(6px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            {/* Modal card */}
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden border border-slate-100"
                style={{ maxHeight: "85vh" }}
                onClick={(e) => e.stopPropagation()}
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
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors text-lg"
                        aria-label="Close"
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
            ${isOverLimit ? "bg-red-50 border-red-100" : "bg-emerald-50 border-emerald-100"}`}
                    >
                        <span className="text-slate-500">
                            {filteredLogs.length} session{filteredLogs.length !== 1 ? "s" : ""}
                            {selectedDate ? ` on ${formatDisplayDate(selectedDate)}` : ""}
                        </span>
                        <span className={`font-semibold font-mono flex items-center gap-1
              ${isOverLimit ? "text-red-600" : "text-emerald-600"}`}>
                            {isOverLimit && "⚠️ "}
                            Total: {formatDuration(totalSec)}
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
                                    const over = durSec > BREAK_LIMIT_SECONDS;
                                    return (
                                        <tr key={i} className="hover:bg-slate-50/70 transition-colors">

                                            <td className="px-5 py-3.5 text-xs text-slate-400 w-8">{i + 1}</td>

                                            <td className="px-5 py-3.5">
                                                <p className="text-sm font-medium text-slate-700">
                                                    {new Date(log.breakStart).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    {new Date(log.breakStart).toLocaleDateString([], { day: "numeric", month: "short" })}
                                                </p>
                                            </td>

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

                                            <td className="px-5 py-3.5">
                                                <span className={`text-xs font-mono font-semibold px-2.5 py-1 rounded-full border
                          ${over
                                                        ? "bg-red-100 text-red-600 border-red-200"
                                                        : "bg-slate-100 text-slate-600 border-slate-200"}`}>
                                                    {over && "⚠️ "}{formatDuration(durSec)}
                                                </span>
                                            </td>

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
        </div>,
        document.body  // ← renders directly into body, guaranteed full-screen popup
    );
}



// ─── Main Component ───────────────────────────────────────────────────────────

export default function TimeLogsTab({ agents = [] }) {

    const [selectedAgent, setSelectedAgent] = useState(null);
    const [logsDate, setLogsDate] = useState(new Date().toISOString().split("T")[0]);
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split("T")[0] /* today */);
    const [search, setSearch] = useState("");

    // const handleViewLogs = (agent) => { setSelectedAgent(agent); setLogsDate(""); };
    const handleViewLogs = (agent) => {
        setSelectedAgent(agent);
        setLogsDate(new Date().toISOString().split("T")[0]); // 🔥 TODAY
    };
    const handleCloseModal = () => setSelectedAgent(null);

    const allDates = useMemo(() => {
        const dates = new Set();
        agents.forEach(a =>
            (a.breakLogs ?? []).forEach(l => {
                if (l.breakStart) dates.add(toDateStr(l.breakStart));
            })
        );
        return [...dates].sort((a, b) => b.localeCompare(a));
    }, [agents]);

    const agentSummaries = useMemo(() => {
        return agents
            .filter(a => (a.name ?? "").toLowerCase().includes(search.toLowerCase()))
            .map(a => {
                const logs = (a.breakLogs ?? []).filter(l =>
                    !filterDate || (l.breakStart && toDateStr(l.breakStart) === filterDate)
                );
                const totalSeconds = logs.reduce((sum, l) => sum + (l.durationMinutes ?? 0) * 60, 0);
                const sessions = logs.length;
                const isOver = totalSeconds > BREAK_LIMIT_SECONDS;
                return { agent: a, totalSeconds, sessions, isOver };
            })
            .sort((a, b) => b.totalSeconds - a.totalSeconds);
    }, [agents, filterDate, search]);

    const dashboardStats = useMemo(() => {
        let totalAgents = agents.length;
        let totalBreakSeconds = 0;
        let extraBreakSeconds = 0;
        let overLimitAgents = 0;

        agents.forEach(agent => {
            const totalSec = (agent.breakLogs ?? []).reduce(
                (sum, l) => sum + (l.durationMinutes ?? 0) * 60,
                0
            );

            totalBreakSeconds += totalSec;

            if (totalSec > BREAK_LIMIT_SECONDS) {
                overLimitAgents++;
                extraBreakSeconds += (totalSec - BREAK_LIMIT_SECONDS);
            }
        });

        return {
            totalAgents,
            totalBreakSeconds,
            extraBreakSeconds,
            overLimitAgents
        };
    }, [agents]);

    return (
        <>

            {/* ── Dashboard Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">

                <div className="bg-white rounded-2xl border p-4 shadow-sm">
                    <p className="text-xs text-slate-400">Total Agents</p>
                    <h2 className="text-xl font-bold text-slate-800 mt-1">
                        {dashboardStats.totalAgents}
                    </h2>
                </div>

                <div className="bg-white rounded-2xl border p-4 shadow-sm">
                    <p className="text-xs text-slate-400">Total Break Time</p>
                    <h2 className="text-xl font-bold text-blue-600 mt-1">
                        {formatDuration(dashboardStats.totalBreakSeconds)}
                    </h2>
                </div>

                <div className="bg-white rounded-2xl border p-4 shadow-sm">
                    <p className="text-xs text-slate-400">Extra Break Time</p>
                    <h2 className="text-xl font-bold text-red-600 mt-1">
                        {formatDuration(dashboardStats.extraBreakSeconds)}
                    </h2>
                </div>

                <div className="bg-white rounded-2xl border p-4 shadow-sm">
                    <p className="text-xs text-slate-400">Over Limit Agents</p>
                    <h2 className="text-xl font-bold text-amber-600 mt-1">
                        {dashboardStats.overLimitAgents}
                    </h2>
                </div>

            </div>
            {/* ── Table Card ── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

                {/* Toolbar */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h2 className="text-base font-semibold text-slate-800">Break Time Logs</h2>
                        <p className="text-xs text-slate-400 mt-0.5">All agents — break history</p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
                            <input
                                placeholder="Search agent..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="pl-8 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all w-44"
                            />
                        </div>
                        <select
                            value={filterDate}
                            onChange={e => setFilterDate(e.target.value)}
                            className="text-sm border border-slate-200 rounded-xl px-3 py-2 text-slate-600 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                        >

                            {/* Today first */}
                            <option value={new Date().toISOString().split("T")[0]}>
                                Today
                            </option>

                            {/* All dates */}
                            <option value="">All dates</option>

                            {/* Other dates */}
                            {allDates
                                .filter(d => d !== new Date().toISOString().split("T")[0])
                                .map(d => (
                                    <option key={d} value={d}>
                                        {formatDisplayDate(d)}
                                    </option>
                                ))}

                        </select>
                    </div>
                </div>

                {/* Table */}
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            {["Agent", "Sessions", "Total Break Time", "Status", "Action"].map(h => (
                                <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {agentSummaries.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400">
                                    {agents.length === 0 ? "No agents loaded" : "No agents match your search"}
                                </td>
                            </tr>
                        ) : (
                            agentSummaries.map(({ agent, totalSeconds, sessions, isOver }) => (
                                <tr
                                    key={agent._id}
                                    className={`transition-colors hover:bg-slate-50 ${isOver ? "bg-red-50/30" : ""}`}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                                                {agent.name?.[0]?.toUpperCase() ?? "?"}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-700">{agent.name}</p>
                                                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium
                          ${{
                                                        available: "bg-emerald-100 text-emerald-700 border-emerald-200",
                                                        busy: "bg-red-100 text-red-700 border-red-200",
                                                        break: "bg-yellow-100 text-yellow-700 border-yellow-200",
                                                    }[agent.status] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}
                                                >
                                                    {agent.status}
                                                </span>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {sessions} session{sessions !== 1 ? "s" : ""}
                                    </td>

                                    <td className="px-6 py-4">
                                        {totalSeconds > 0 ? (
                                            <span className={`text-sm font-mono font-semibold flex items-center gap-1
                        ${isOver ? "text-red-600" : "text-slate-700"}`}>
                                                {isOver && <span>⚠️</span>}
                                                {formatDuration(totalSeconds)}
                                            </span>
                                        ) : (
                                            <span className="text-sm text-slate-400">No breaks</span>
                                        )}
                                    </td>

                                    <td className="px-6 py-4">
                                        {isOver ? (
                                            <span className="text-xs px-2.5 py-1 rounded-full bg-red-100 text-red-600 border border-red-200 font-medium">
                                                Over limit
                                            </span>
                                        ) : totalSeconds > 0 ? (
                                            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 font-medium">
                                                Within limit
                                            </span>
                                        ) : (
                                            <span className="text-xs text-slate-400">—</span>
                                        )}
                                    </td>

                                    {/* View Logs button → opens popup */}
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleViewLogs(agent)}
                                            className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 active:scale-95 transition-all"
                                        >
                                            View Logs →
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── Popup modal via createPortal — renders into document.body ── */}
            {selectedAgent && (
                <BreakLogsModal
                    agent={selectedAgent}
                    selectedDate={logsDate}
                    onDateChange={setLogsDate}
                    onClose={handleCloseModal}
                />
            )}
        </>
    );
}