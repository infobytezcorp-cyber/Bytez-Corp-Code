import { useState, useMemo } from "react";
import * as XLSX from "xlsx";

const downloadExcel = () => {
  // Login Report
  const rows = reportData.map(r => ({
    "Agent Name": r.name,
    "Status": r.status,
    "Sessions": r.sessionCount,
    "First Login": formatTime(r.loginTime),
    "Last Logout": formatTime(r.logoutTime),
    "Work Hours": formatDur(r.workMins),
    "Break Time": formatDur(r.breakMins),
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Login Report");
  XLSX.writeFile(wb, `login-report-${selectedDate}.xlsx`);
};

// Button to trigger Excel download
<button onClick={downloadExcel}>📥 Download Excel</button>

// Helper functions for formatting
const formatDate = (d) => new Date(d).toISOString().slice(0, 10);
const formatTime = (iso) => iso ? new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";

// Format duration in minutes to "Xh Ym" format
const formatDur = (mins) => {
  if (!mins) return "0m";
  const h = Math.floor(mins / 60), m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

// Report component
function StatusBadge({ status }) {
  const map = {
    available: "bg-emerald-100 text-emerald-700",
    break: "bg-amber-100 text-amber-700",
    busy: "bg-rose-100 text-rose-700",
    offline: "bg-slate-100 text-slate-500",
  };
  const labels = { available: "Online", break: "On Break", busy: "Busy", offline: "Offline" };
  return (
    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${map[status] || map.offline}`}>
      {labels[status] || "Offline"}
    </span>
  );
}

// Bar component for visualizing work vs break time
function Bar({ label, current, max, colorClass }) {
  const pct = max > 0 ? Math.min((current / max) * 100, 100) : 0;
  return (
    <div className="flex-1 min-w-0">
      <div className="flex justify-between mb-1">
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{label}</span>
        <span className="text-[10px] font-black text-slate-600">{formatDur(current)}</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${colorClass}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}


// Session row component for expanded details
function SessionRow({ session, index, isBreak }) {
  return (
    <div className={`grid grid-cols-4 gap-3 items-center px-4 py-3 rounded-xl border border-slate-100 ${index % 2 === 0 ? "bg-slate-50" : "bg-white"}`}>
      <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${isBreak ? "bg-amber-100 text-amber-700" : "bg-indigo-100 text-indigo-700"}`}>
        {index + 1}
      </div>
      <div>
        <p className="text-[9px] text-slate-400 font-bold uppercase">{isBreak ? "Break Start" : "Login"}</p>
        <p className="text-xs font-black text-emerald-600">{formatTime(isBreak ? session.breakStart : session.loginTime)}</p>
      </div>
      <div>
        <p className="text-[9px] text-slate-400 font-bold uppercase">{isBreak ? "Break End" : "Logout"}</p>
        <p className="text-xs font-black text-rose-500">{formatTime(isBreak ? session.breakEnd : session.logoutTime)}</p>
      </div>
      <div>
        <p className="text-[9px] text-slate-400 font-bold uppercase">Duration</p>
        <p className="text-xs font-black text-slate-700">{formatDur(session.durationMinutes)}</p>
      </div>
    </div>
  );
}

// Expanded panel for showing session and break details of an agent on a selected date
function ExpandedPanel({ agent, selectedDate }) {
  const [subTab, setSubTab] = useState("sessions");
  const sessions = useMemo(() => (agent.loginHistory || []).filter(s => s.loginTime?.startsWith(selectedDate)), [agent, selectedDate]);
  const breaks = useMemo(() => (agent.breakLogs || []).filter(b => b.breakStart?.startsWith(selectedDate)), [agent, selectedDate]);

  return (
    <div className="px-5 pb-5 pt-3 bg-slate-50 border-t border-dashed border-slate-200">
      <div className="flex gap-2 mb-4">
        {[
          { id: "sessions", label: `Login Sessions (${sessions.length})` },
          { id: "breaks", label: `Break Logs (${breaks.length})` },
        ].map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${subTab === t.id ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" : "bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50"
              }`}>
            {t.label}
          </button>
        ))}
      </div>
      {subTab === "sessions" && (
        sessions.length === 0
          ? <p className="text-xs text-slate-400 text-center py-4">No login sessions on this date.</p>
          : <div className="flex flex-col gap-2">{sessions.map((s, i) => <SessionRow key={i} session={s} index={i} isBreak={false} />)}</div>
      )}
      {subTab === "breaks" && (
        breaks.length === 0
          ? <p className="text-xs text-slate-400 text-center py-4">No break logs on this date.</p>
          : <div className="flex flex-col gap-2">{breaks.map((b, i) => <SessionRow key={i} session={b} index={i} isBreak={true} />)}</div>
      )}
    </div>
  );
}


// Row component for eacch agent in the main report table
function AgentRow({ row, agent, maxWork, maxBreak, selectedDate }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={`rounded-2xl border overflow-hidden transition-all duration-200 bg-white ${expanded ? "border-indigo-200 shadow-md shadow-indigo-50" : "border-slate-100 shadow-sm hover:shadow-md"}`}>
      <div
        onClick={() => setExpanded(v => !v)}
        className={`grid items-center gap-4 px-5 py-4 cursor-pointer select-none transition-colors ${expanded ? "bg-indigo-50/40" : "hover:bg-slate-50"}`}
        style={{ gridTemplateColumns: "2fr 90px 90px 1fr 28px" }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-black text-sm shadow-md shrink-0">
            {row.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black text-slate-800 truncate">{row.name}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <StatusBadge status={row.status} />
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{row.sessionCount} session{row.sessionCount !== 1 ? "s" : ""}</span>
            </div>
          </div>
        </div>
        <div>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">First Login</p>
          <p className="text-sm font-black text-emerald-600 mt-0.5">{formatTime(row.loginTime)}</p>
        </div>
        <div>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">Last Logout</p>
          <p className="text-sm font-black text-rose-500 mt-0.5">{formatTime(row.logoutTime)}</p>
        </div>
        <div className="flex gap-4">
          <Bar label="Working" current={row.workMins} max={maxWork} colorClass="bg-indigo-500" />
          <Bar label="Breaks" current={row.breakMins} max={maxBreak} colorClass="bg-amber-400" />
        </div>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${expanded ? "bg-indigo-100" : "bg-slate-100"}`}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={expanded ? "#4338CA" : "#94A3B8"} strokeWidth={2.5} strokeLinecap="round">
            <path d={expanded ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"} />
          </svg>
        </div>
      </div>
      {expanded && <ExpandedPanel agent={agent} selectedDate={selectedDate} />}
    </div>
  );
}


// Main report component
export default function UserLoginReport({ agents = [], calls = [], onClose }) {
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [showRawCalls, setShowRawCalls] = useState(false);

  // Prepare report data with memoization
  const reportData = useMemo(() => {
    return agents.map(agent => {
    
      let dailySessions = (agent.loginHistory || []).filter(s => s.loginTime?.startsWith(selectedDate));
      let dailyBreaks = (agent.breakLogs || []).filter(b => b.breakStart?.startsWith(selectedDate));

      
      const isOnlineNow = agent.status !== 'offline' && agent.loginTime;

      // If agent is currently online and logged in on the selected date, add an active session until now
      if (isOnlineNow && agent.loginTime.startsWith(selectedDate)) {
        const now = new Date();
        const diff = Math.max(0, now - new Date(agent.loginTime));
        const currentMins = Math.floor(diff / 1000 / 60);

        dailySessions.push({
          loginTime: agent.loginTime,
          logoutTime: null, 
          durationMinutes: currentMins
        });
      }

      const totalWorkMins = dailySessions.reduce((s, x) => s + (x.durationMinutes || 0), 0);
      const totalBreakMins = dailyBreaks.reduce((s, x) => s + (x.durationMinutes || 0), 0);

      return {
        id: agent._id,
        name: agent.name,
        status: agent.status,
        loginTime: dailySessions[0]?.loginTime ?? null,
        logoutTime: dailySessions.find(s => s.logoutTime)?.logoutTime ?? null, 
        workMins: totalWorkMins,
        breakMins: totalBreakMins,
        sessionCount: dailySessions.length,
        _agent: agent,
      };
    }).sort((a, b) => b.workMins - a.workMins);
  }, [agents, selectedDate]);

  const maxWork = Math.max(...reportData.map(r => r.workMins), 1);
  const maxBreak = Math.max(...reportData.map(r => r.breakMins), 1);
  const activeToday = reportData.filter(r => r.sessionCount > 0).length;
  const totalWorkMin = reportData.reduce((s, r) => s + r.workMins, 0);

  // Excel download function
  const downloadExcel = () => {
    const rows = reportData.map(r => ({
      "Agent Name": r.name,
      "Status": r.status,
      "First Login": formatTime(r.loginTime),
      "Last Logout": formatTime(r.logoutTime),
      "Work Hours": formatDur(r.workMins),
      "Break Time": formatDur(r.breakMins),
      "Total Work (mins)": r.workMins,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Login Report");
    XLSX.writeFile(wb, `login-report-${selectedDate}.xlsx`);

  }

  return (
    <div className="min-h-full bg-slate-50 font-sans">

      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-8 py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Agent Performance Report</h2>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">Click any row to expand session & break details</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date" value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-300 bg-slate-50 cursor-pointer"
          />
          <button
            onClick={() => setShowRawCalls(v => !v)}
            className="px-4 py-2 rounded-lg bg-white border text-sm font-bold"
          >
            {showRawCalls ? 'Hide Calls' : 'Show Calls'}
          </button>
        </div>
      </div>

      <div className="px-8 py-6 space-y-5">

        {/* Summary chips */}
        <div className="flex gap-3 flex-wrap">
          {[
            { label: "Total Agents", value: agents.length, color: "text-indigo-700", bg: "bg-indigo-50  border-indigo-100" },
            { label: "Active Today", value: activeToday, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-100" },
            { label: "Total Work", value: formatDur(totalWorkMin), color: "text-amber-700", bg: "bg-amber-50   border-amber-100" },
          ].map(c => (
            <div key={c.label} className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border ${c.bg}`}>
              <span className={`text-base font-black ${c.color}`}>{c.value}</span>
              <span className={`text-[10px] font-bold uppercase tracking-wide ${c.color} opacity-70`}>{c.label}</span>
            </div>
          ))}
        </div>

        {/* Column headers */}
        <div className="grid px-5 text-[9px] font-black text-slate-400 uppercase tracking-widest gap-4"
          style={{ gridTemplateColumns: "2fr 90px 90px 1fr 28px" }}>
          {["Agent", "First Login", "Last Logout", "Activity", ""].map((h, i) => <span key={i}>{h}</span>)}
        </div>

        {/* Rows */}
        <div className="flex flex-col gap-3">
          {showRawCalls && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50 text-[11px] font-black text-slate-400 uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">Call ID</th>
                    <th className="px-4 py-3 text-left">Agent</th>
                    <th className="px-4 py-3 text-left">From</th>
                    <th className="px-4 py-3 text-left">To</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Duration</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-slate-700">
                  {calls && calls.length === 0 && (
                    <tr><td colSpan={8} className="p-6 text-center text-slate-400">No calls found.</td></tr>
                  )}
                  {calls && calls.map((c, i) => (
                    <tr key={c._id || i} className="border-t border-slate-50 hover:bg-slate-50">
                      <td className="px-4 py-3">{i + 1}</td>
                      <td className="px-4 py-3">{c._id}</td>
                      <td className="px-4 py-3">{(c.agent && (c.agent.name || c.agent)) || (c.assignedTo && (c.assignedTo.name || c.assignedTo)) || '—'}</td>
                      <td className="px-4 py-3">{c.from || c.caller || '—'}</td>
                      <td className="px-4 py-3">{c.to || c.number || '—'}</td>
                      <td className="px-4 py-3">{c.status || '—'}</td>
                      <td className="px-4 py-3">{c.createdAt ? new Date(c.createdAt).toLocaleString() : '—'}</td>
                      <td className="px-4 py-3">{c.duration || c.callDuration || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {reportData.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-2xl border border-slate-100">
              <p className="text-3xl mb-2">📭</p>
              <p className="text-sm text-slate-400">No activity found for this date.</p>
            </div>
          ) : (
            reportData.map(row => (
              <AgentRow key={row.id} row={row} agent={row._agent} maxWork={maxWork} maxBreak={maxBreak} selectedDate={selectedDate} />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 pb-4">
          <div className="flex gap-4">
            {[["bg-indigo-500", "Work Hours"], ["bg-amber-400", "Break Time"]].map(([c, l]) => (
              <div key={l} className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${c}`} />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{l}</span>
              </div>
            ))}
          </div>
          <button onClick={downloadExcel}
            className="px-6 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-black transition-all shadow-lg cursor-pointer">
            📥 Download Excel
          </button>
        </div>
      </div>
    </div>
  );
}