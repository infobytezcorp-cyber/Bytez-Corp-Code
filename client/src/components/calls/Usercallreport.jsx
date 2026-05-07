import { useState, useMemo } from "react";
import * as XLSX from "xlsx";


const toLocalDateStr = (isoString) => {
  if (!isoString) return "";
  const d = new Date(isoString);
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
};

export default function UserCallReport({ agents = [], calls = [], onClose }) {
  const [selectedDate, setSelectedDate] = useState(toLocalDateStr(new Date()));
  const [sortKey, setSortKey] = useState("total");

  const filteredCalls = useMemo(() =>
    calls.filter(c => toLocalDateStr(c.createdAt) === selectedDate),
    [calls, selectedDate]
  );



  const reportRows = useMemo(() => {
    return agents.map(agent => {
      const agentCalls = filteredCalls.filter(c => {
        const id = c.agent?._id || c.agent || c.assignedTo?._id || c.assignedTo || c.agentId;
        return id && String(id) === String(agent._id);
      });
      const answered = agentCalls.filter(c => ["answered", "completed"].includes(c.status?.toLowerCase())).length;
      const missed = agentCalls.filter(c => c.status?.toLowerCase() === "missed").length;
      const inProgress = agentCalls.filter(c => ["in_progress", "assigned"].includes(c.status?.toLowerCase())).length;
      const rate = agentCalls.length > 0 ? Math.round((answered / agentCalls.length) * 100) : 0;
      return { id: agent._id, name: agent.name || "Unknown", status: agent.status, total: agentCalls.length, answered, missed, inProgress, rate };
    }).sort((a, b) => b[sortKey] - a[sortKey]);
  }, [agents, filteredCalls, sortKey]);

  const totals = useMemo(() => ({
    total: filteredCalls.length,
    answered: filteredCalls.filter(c => ["answered", "completed"].includes(c.status?.toLowerCase())).length,
    missed: filteredCalls.filter(c => c.status?.toLowerCase() === "missed").length,
    inProgress: filteredCalls.filter(c => ["in_progress", "assigned"].includes(c.status?.toLowerCase())).length,
  }), [filteredCalls]);

  const SORT_KEYS = ["total", "answered", "missed", "inProgress"];

  const downloadExcel = () => {
    // Call Report
    const rows = reportRows.map(r => ({
      "Agent Name": r.name,
      "Status": r.status,
      "Total Calls": r.total,
      "Answered": r.answered,
      "Missed": r.missed,
      "Pending": r.inProgress,
      "Performance (%)": r.rate,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Call Report");
    XLSX.writeFile(wb, `call-report-${selectedDate}.xlsx`);
  };
  return (
    <div className="min-h-full bg-slate-50 font-sans">

      {/* ── Header ── */}
      <div className="bg-white border-b border-slate-100 px-8 py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl shadow-inner">📞</div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Call Performance Analytics</h2>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">
              {selectedDate} &nbsp;·&nbsp; {filteredCalls.length} calls found
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-300 bg-slate-50 cursor-pointer transition-all"
          />
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">

        {/* ── Summary Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Volume", value: totals.total, color: "text-indigo-600", bg: "bg-indigo-50", ring: "ring-indigo-100", icon: "📊" },
            { label: "Answered", value: totals.answered, color: "text-emerald-600", bg: "bg-emerald-50", ring: "ring-emerald-100", icon: "✅" },
            { label: "Missed", value: totals.missed, color: "text-rose-600", bg: "bg-rose-50", ring: "ring-rose-100", icon: "❌" },
            { label: "Pending", value: totals.inProgress, color: "text-amber-600", bg: "bg-amber-50", ring: "ring-amber-100", icon: "⏳" },
          ].map(s => (
            <div key={s.label} className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 ring-1 ${s.ring} hover:shadow-md transition-shadow`}>
              <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center text-xl shrink-0`}>{s.icon}</div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                <p className={`text-2xl font-black ${s.color} leading-none mt-0.5`}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Sort Pills ── */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Sort by:</span>
          {SORT_KEYS.map(k => (
            <button
              key={k}
              onClick={() => setSortKey(k)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${sortKey === k
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200"
                  : "bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
                }`}
            >
              {k === "inProgress" ? "Pending" : k.charAt(0).toUpperCase() + k.slice(1)}
            </button>
          ))}
        </div>

        {/* ── Table ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

          {/* Table Header */}
          <div className="grid grid-cols-12 px-6 py-3 bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <div className="col-span-4">Agent</div>
            <div className="col-span-2 text-center">Total</div>
            <div className="col-span-2 text-center">Answered</div>
            <div className="col-span-2 text-center">Missed</div>
            <div className="col-span-1 text-center">Pending</div>
            <div className="col-span-1 text-center">Score</div>
          </div>

          {reportRows.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-3xl mb-2">📭</p>
              <p className="text-sm text-slate-400 font-medium">No data for this date.</p>
            </div>
          ) : (
            reportRows.map((row, idx) => (
              <div
                key={row.id}
                className="grid grid-cols-12 px-6 py-4 items-center border-b border-slate-50 hover:bg-indigo-50/30 transition-colors group"
              >
                {/* Agent */}
                <div className="col-span-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-black text-sm shadow-md shrink-0">
                    {row.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800">{row.name}</p>
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${row.status === "available" ? "bg-emerald-100 text-emerald-700"
                        : row.status === "break" ? "bg-amber-100 text-amber-700"
                          : row.status === "busy" ? "bg-rose-100 text-rose-700"
                            : "bg-slate-100 text-slate-500"
                      }`}>
                      {row.status}
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="col-span-2 text-center">
                  <span className="text-sm font-black text-slate-700">{row.total}</span>
                </div>

                {/* Answered */}
                <div className="col-span-2 text-center">
                  <span className="text-sm font-black text-emerald-600">+{row.answered}</span>
                </div>

                {/* Missed */}
                <div className="col-span-2 text-center">
                  <span className="text-sm font-black text-rose-500">-{row.missed}</span>
                </div>

                {/* Pending */}
                <div className="col-span-1 text-center">
                  <span className="text-sm font-black text-amber-500">{row.inProgress}</span>
                </div>

                {/* Score */}
                <div className="col-span-1 text-center">
                  <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-black ${row.rate >= 75 ? "bg-emerald-100 text-emerald-700"
                      : row.rate >= 50 ? "bg-amber-100 text-amber-700"
                        : "bg-rose-100 text-rose-600"
                    }`}>
                    {row.rate}%
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex justify-end pb-4">
          <button
            onClick={downloadExcel}
            className="px-6 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-black transition-all shadow-lg shadow-slate-200 cursor-pointer"
          >
            📥 Download Excel
          </button>
        </div>

      </div>
    </div>
  );
}