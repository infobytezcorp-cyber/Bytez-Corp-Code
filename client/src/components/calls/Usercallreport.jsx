import { useState, useMemo } from "react";

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

  const filteredCalls = useMemo(() => {
    return calls.filter(c => toLocalDateStr(c.createdAt) === selectedDate);
  }, [calls, selectedDate]);

  const reportRows = useMemo(() => {
    return agents.map(agent => {
      const agentCalls = filteredCalls.filter(c => {
        const callAgentId = c.agent?._id || c.agent || c.assignedTo?._id || c.assignedTo || c.agentId;
        return callAgentId && String(callAgentId) === String(agent._id);
      });

      const answered = agentCalls.filter(c => ["answered", "completed"].includes(c.status?.toLowerCase())).length;
      const missed = agentCalls.filter(c => c.status?.toLowerCase() === "missed").length;
      const inProgress = agentCalls.filter(c => ["in_progress", "assigned"].includes(c.status?.toLowerCase())).length;
      
      const rate = agentCalls.length > 0 ? Math.round((answered / agentCalls.length) * 100) : 0;

      return {
        id: agent._id,
        name: agent.name || "Unknown",
        status: agent.status,
        total: agentCalls.length,
        answered,
        missed,
        inProgress,
        rate
      };
    }).sort((a, b) => b[sortKey] - a[sortKey]);
  }, [agents, filteredCalls, sortKey]);

  const totals = useMemo(() => {
    return {
      total: filteredCalls.length,
      answered: filteredCalls.filter(c => ["answered", "completed"].includes(c.status?.toLowerCase())).length,
      missed: filteredCalls.filter(c => c.status?.toLowerCase() === "missed").length,
      inProgress: filteredCalls.filter(c => ["in_progress", "assigned"].includes(c.status?.toLowerCase())).length,
    };
  }, [filteredCalls]);

  const maxTotal = Math.max(...reportRows.map(r => r.total), 1);

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 md:p-10 font-sans">
      <div className="bg-[#F8FAFC] w-full max-w-6xl max-h-[92vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-8 bg-white border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-50 rounded-3xl flex items-center justify-center text-3xl shadow-inner">📞</div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Call Performance Analytics</h2>
              <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1 opacity-70">
                Data for {selectedDate} • {filteredCalls.length} total calls found
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-5 py-2.5 rounded-2xl border border-slate-200 text-sm font-black text-slate-700 outline-none focus:ring-4 focus:ring-indigo-100 transition-all bg-slate-50 cursor-pointer"
            />
            <button onClick={onClose} className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-rose-500 transition-all text-xl">✕</button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="px-8 py-6 flex flex-wrap gap-4 bg-slate-50/50">
          {[
            { label: "Total Volume", value: totals.total, color: "text-indigo-600", bg: "bg-indigo-50", icon: "📊" },
            { label: "Answered", value: totals.answered, color: "text-emerald-600", bg: "bg-emerald-50", icon: "✅" },
            { label: "Missed Calls", value: totals.missed, color: "text-rose-600", bg: "bg-rose-50", icon: "❌" },
            { label: "Still Pending", value: totals.inProgress, color: "text-amber-600", bg: "bg-amber-50", icon: "⏳" }
          ].map(s => (
            <div key={s.label} className="flex-1 min-w-[180px] p-5 rounded-[2rem] bg-white border border-slate-100 shadow-sm flex items-center gap-4">
               <div className={`w-12 h-12 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center text-xl shadow-inner`}>{s.icon}</div>
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                  <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
               </div>
            </div>
          ))}
        </div>

        {/* Table Section */}
        <div className="flex-1 overflow-y-auto px-8 pb-8">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="grid grid-cols-12 px-8 py-4 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
              <div className="col-span-3">Agent Details</div>
              <div className="col-span-2">Total Volume</div>
              <div className="col-span-2">Answered</div>
              <div className="col-span-2">Missed</div>
              <div className="col-span-2">Pending</div>
              <div className="col-span-1 text-center">Score</div>
            </div>

            {reportRows.length === 0 ? (
              <div className="p-24 text-center">
                <p className="text-slate-400 font-bold italic">No agents found.</p>
              </div>
            ) : (
              reportRows.map((row) => (
                <div key={row.id} className="grid grid-cols-12 px-8 py-6 items-center border-b border-slate-50 hover:bg-slate-50/50 transition-all">
                  <div className="col-span-3 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-slate-800 text-white flex items-center justify-center font-black text-xs shadow-lg">{row.name.charAt(0)}</div>
                    <div>
                      <p className="text-sm font-black text-slate-800 leading-none">{row.name}</p>
                      <p className="text-[10px] mt-1.5 font-bold text-slate-400 uppercase tracking-tighter italic">Status: {row.status}</p>
                    </div>
                  </div>
                  <div className="col-span-2 text-sm font-black text-slate-700">{row.total} Calls</div>
                  <div className="col-span-2 text-sm font-black text-emerald-600">+{row.answered}</div>
                  <div className="col-span-2 text-sm font-black text-rose-500">-{row.missed}</div>
                  <div className="col-span-2 text-sm font-black text-amber-500">{row.inProgress}</div>
                  <div className="col-span-1 text-center">
                    <span className={`px-3 py-1 rounded-lg text-xs font-black ${row.rate > 75 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {row.rate}%
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}