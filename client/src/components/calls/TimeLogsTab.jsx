import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";

// ─── UTILS ───────────────────────────────────────────────────────────────────
const formatDuration = (s) => {
    if (!s || s < 0) return "0m";
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const toDateStr = (d) => new Date(d).toLocaleDateString('en-CA');

const BREAK_LIMIT = 3600; // 1 Hour

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

const MiniStat = ({ label, value, icon, theme }) => (
    <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 flex-1 min-w-[200px]">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${theme} shadow-inner`}>
            {icon}
        </div>
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
            <p className="text-xl font-black text-slate-800 tracking-tight">{value}</p>
        </div>
    </div>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function TimeLogsTab({ agents = [] }) {
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [filterDate, setFilterDate] = useState(toDateStr(new Date()));
    const [search, setSearch] = useState("");

    // 1. Data Calculation Logic
    const { agentSummaries, totalBreakTime, extraTime, overLimitCount } = useMemo(() => {
        let totalTime = 0;
        let extra = 0;
        let overCount = 0;

        const filtered = agents
            .filter(a => (a.name ?? "").toLowerCase().includes(search.toLowerCase()))
            .map(a => {
                const logs = (a.breakLogs ?? []).filter(l => 
                    !filterDate || (l.breakStart && toDateStr(l.breakStart) === filterDate)
                );
                const secs = logs.reduce((sum, l) => sum + (l.durationMinutes ?? 0) * 60, 0);
                const isOver = secs > BREAK_LIMIT;

                totalTime += secs;
                if (isOver) {
                    overCount++;
                    extra += (secs - BREAK_LIMIT);
                }

                return { agent: a, secs, sessions: logs.length, isOver };
            })
            .sort((a, b) => b.secs - a.secs);

        return { agentSummaries: filtered, totalBreakTime: totalTime, extraTime: extra, overLimitCount: overCount };
    }, [agents, filterDate, search]);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            
            {/* ── Header Stats ── */}
            <div className="flex flex-wrap gap-4">
                <MiniStat label="Agents Tracked" value={agentSummaries.length} icon="👥" theme="bg-indigo-50 text-indigo-600" />
                <MiniStat label="Total Break Used" value={formatDuration(totalBreakTime)} icon="⏱️" theme="bg-blue-50 text-blue-600" />
                <MiniStat label="Extra Time Used" value={formatDuration(extraTime)} icon="⚠️" theme="bg-rose-50 text-rose-600" />
                <MiniStat label="Limit Violations" value={overLimitCount} icon="🚨" theme="bg-amber-50 text-amber-600" />
            </div>

            {/* ── Filter Bar ── */}
            <div className="bg-white/60 backdrop-blur-md p-4 rounded-[2.5rem] border border-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-80">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">🔍</span>
                    <input 
                        placeholder="Search agent name..." 
                        value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-100 bg-white font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex bg-slate-200/50 p-1 rounded-2xl items-center">
                        <button 
                            onClick={() => setFilterDate(toDateStr(new Date()))}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${filterDate === toDateStr(new Date()) ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                        >
                            Today
                        </button>
                        <input 
                            type="date" 
                            value={filterDate} 
                            onChange={e => setFilterDate(e.target.value)}
                            className="bg-transparent text-[10px] font-black uppercase text-slate-600 px-3 outline-none cursor-pointer"
                        />
                    </div>
                    <button 
                        onClick={() => setFilterDate("")}
                        className="w-11 h-11 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
                    >
                        ✕
                    </button>
                </div>
            </div>

            {/* ── Data Table ── */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Agent</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sessions</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Time Spent</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Compliance</th>
                            <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Activity</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {agentSummaries.length === 0 ? (
                            <tr><td colSpan={5} className="p-24 text-center text-slate-300 font-bold italic">No records found.</td></tr>
                        ) : (
                            agentSummaries.map(({ agent, secs, sessions, isOver }) => (
                                <tr key={agent._id} className="group hover:bg-indigo-50/30 transition-all duration-300">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xs shadow-lg group-hover:rotate-6 transition-transform">
                                                {agent.name?.[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-800">{agent.name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">{agent.status}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-xs font-black text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                                            {sessions} sessions
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className={`text-sm font-black ${isOver ? 'text-rose-500' : 'text-slate-700'}`}>
                                            {formatDuration(secs)}
                                        </p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                                            isOver ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${isOver ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                                            {isOver ? 'Limit Over' : 'Within Limit'}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button 
                                            onClick={() => setSelectedAgent(agent)}
                                            className="px-5 py-2.5 bg-white border border-slate-200 text-indigo-600 rounded-xl text-[10px] font-black uppercase hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm active:scale-95"
                                        >
                                            View Logs
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Logic remains same but UI will be cleaner */}
            {selectedAgent && (
                <BreakLogsModal
                    agent={selectedAgent}
                    selectedDate={filterDate}
                    onClose={() => setSelectedAgent(null)}
                />
            )}
        </div>
    );
}

// ─── Modal Implementation ─────────────────────────────────────────────────────
function BreakLogsModal({ agent, selectedDate, onClose }) {
    const logs = (agent.breakLogs || []).filter(l => !selectedDate || toDateStr(l.breakStart) === selectedDate);

    return createPortal(
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden max-h-[85vh]">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-black text-slate-800">{agent.name}</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Break Timeline for {selectedDate || 'All History'}</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-white transition-all text-xl">✕</button>
                </div>
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="space-y-4">
                        {logs.length === 0 ? (
                            <p className="text-center py-10 text-slate-400 font-bold italic">No logs recorded.</p>
                        ) : (
                            logs.map((l, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                        <div>
                                            <p className="text-xs font-black text-slate-700">
                                                {new Date(l.breakStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                <span className="mx-2 text-slate-300">→</span>
                                                {l.breakEnd ? new Date(l.breakEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Active"}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                                        {formatDuration((l.durationMinutes || 0) * 60)}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                <div className="p-6 bg-slate-50/50 border-t border-slate-100 text-right">
                    <button onClick={onClose} className="px-8 py-3 bg-slate-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">Close</button>
                </div>
            </div>
        </div>,
        document.body
    );
}