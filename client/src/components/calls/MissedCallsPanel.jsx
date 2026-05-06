import { useState, useMemo, useEffect } from "react";

// ── helpers ──
const toDateStr = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0");
};
const formatTime = (iso) => iso ? new Date(iso).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" }) : "—";
const today      = () => toDateStr(new Date());

export default function MissedCallsPanel({ calls = [], onSelect }) {
  const [dateFilter, setDateFilter] = useState(today());
  const [now, setNow] = useState(Date.now());

  // 1. ஒவ்வொரு நிமிடமும் நேரத்தைப் புதுப்பிக்க (Real-time tracking)
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000); // 60 seconds
    return () => clearInterval(timer);
  }, []);

  // Filter missed calls by selected date
  const missedCalls = useMemo(() => {
    return calls
      .filter(c => c.status === "missed")
      .filter(c => !dateFilter || toDateStr(c.createdAt || c.startTime) === dateFilter)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [calls, dateFilter]);

  // 2. 1 மணிநேரம் கடந்த கால்களைக் கணக்கிடுதல்
  const overdueCount = useMemo(() => {
    const ONE_HOUR = 60 * 60 * 1000;
    return missedCalls.filter(c => {
      const callTime = new Date(c.createdAt || c.startTime).getTime();
      return (now - callTime) > ONE_HOUR;
    }).length;
  }, [missedCalls, now]);

  // Group by assigned agent for summary
  const agentSummary = useMemo(() => {
    const map = {};
    for (const c of missedCalls) {
      const name = c.assignedTo?.name || c.agent?.name || "Unassigned";
      map[name] = (map[name] || 0) + 1;
    }
    return Object.entries(map).sort((a,b) => b[1] - a[1]);
  }, [missedCalls]);

  return (
    <div className="space-y-4">
      
      {/* ── 🔴 Escalation Alert Banner ── */}
      {overdueCount > 0 && (
        <div className="bg-red-600 text-white px-6 py-4 rounded-2xl shadow-lg shadow-red-200 flex items-center justify-between animate-bounce">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚨</span>
            <div>
              <p className="text-sm font-black uppercase tracking-widest">Escalation Alert</p>
              <p className="text-xs font-bold opacity-90">
                {overdueCount} missed calls are pending for more than 1 hour!
              </p>
            </div>
          </div>
          <span className="bg-white text-red-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase">
            Action Required
          </span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-base font-bold text-slate-800">Missed Calls Monitor</h2>
              <p className="text-xs text-slate-400 mt-0.5">Real-time tracking of agent response time</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <input
                type="date"
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-200 bg-white cursor-pointer"
              />
              {missedCalls.length > 0 && (
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                  overdueCount > 0 ? "bg-red-50 text-red-600 border-red-200 animate-pulse" : "bg-slate-50 text-slate-400 border-slate-200"
                }`}>
                  {missedCalls.length} pending
                </span>
              )}
            </div>
          </div>

          {/* Agent summary chips */}
          {agentSummary.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {agentSummary.map(([name, count]) => (
                <div key={name} className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-full text-xs">
                  <div className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[9px] font-black">
                    {name.charAt(0)}
                  </div>
                  <span className="font-bold text-slate-700">{name}</span>
                  <span className="font-black text-red-500">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* List */}
        <div className="divide-y divide-slate-50">
          {missedCalls.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <p className="text-3xl mb-2">✅</p>
              <p className="text-sm text-slate-400 font-medium italic">No missed calls pending.</p>
            </div>
          ) : (
            missedCalls.map((c) => {
              const assignedName = c.assignedTo?.name || c.agent?.name || null;
              const callerName   = c.contact?.name || c.number || "Unknown";
              
              // செக்: இந்த கால் 1 மணிநேரம் கடந்துவிட்டதா?
              const callTime = new Date(c.createdAt || c.startTime).getTime();
              const isOverdue = (now - callTime) > (60 * 60 * 1000);

              return (
                <div
                  key={c._id}
                  onClick={() => onSelect?.(c)}
                  className={`px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group ${isOverdue ? "bg-red-50/50" : ""}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 ${isOverdue ? "bg-red-100 text-red-500 animate-pulse" : "bg-slate-100 text-slate-400"}`}>
                      {isOverdue ? "⏰" : "📵"}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-800 truncate">{callerName}</p>
                        {isOverdue && (
                          <span className="text-[8px] font-black bg-red-600 text-white px-1.5 py-0.5 rounded uppercase tracking-tighter">
                            Delayed
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs text-slate-400 font-medium">
                          {formatTime(c.createdAt || c.startTime)}
                        </span>
                        {assignedName && (
                          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600">
                            {assignedName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shrink-0 ${
                    isOverdue ? "bg-red-600 text-white shadow-md" : "text-blue-600 bg-blue-50 border border-blue-100"
                  }`}>
                    {isOverdue ? "Urgent →" : "View →"}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}