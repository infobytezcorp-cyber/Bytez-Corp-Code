import { useState, useEffect, useCallback } from "react";
import API from "../../services/api";
import DateFilter from "./DateFilter";
import { formatTime, formatDateLabel, toDateStr, isInRange } from "./Utilities";
import toast from "react-hot-toast";

export default function MissedCallsTab({ agent }) {
  const [calls,    setCalls]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [clearing, setClearing] = useState(null); 
  const [calling,  setCalling]  = useState(null); // callbackId currently being dialed
  const [dateRange, setDateRange] = useState({ from: null, to: null });

  const fetchMissed = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get("/calls/my-missed");
      setCalls(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      console.error("Failed to fetch missed calls:", err);
      toast.error("Failed to load missed calls");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMissed(); }, [fetchMissed]);

  // ── Initiate a Callback Call ──
  const handleCallback = async (callId) => {
    try {
      setCalling(callId);
      // admin callback logic
      await API.post(`/calls/${callId}/callback`);
      toast.success("📞 Initiating callback...");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to initiate call");
    } finally {
      setCalling(null);
    }
  };

  // ── Mark as "Done" ──
  const handleMarkDone = async (callId) => {
    try {
      setClearing(callId);
      await API.patch(`/calls/${callId}/callback-done`);
      toast.success("✅ Missed call cleared!");
      setCalls(prev => prev.filter(c => c._id !== callId));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to clear call");
    } finally {
      setClearing(null);
    }
  };

  const filtered = calls
    .filter(c => {
      const d = toDateStr(c.createdAt || c.startTime);
      return isInRange(d, dateRange.from, dateRange.to);
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const grouped = filtered.reduce((acc, call) => {
    const day = toDateStr(call.createdAt || call.startTime);
    if (!acc[day]) acc[day] = [];
    acc[day].push(call);
    return acc;
  }, {});
  const sortedDays = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Pending Tasks</h2>
          <p className="text-sm text-slate-400 font-medium italic">Call back the missed leads and mark as done.</p>
        </div>
        <button onClick={fetchMissed} className="px-4 py-2 bg-white border border-slate-200 rounded-2xl text-xs font-black text-slate-600 hover:bg-slate-50 shadow-sm transition-all active:scale-95">
          🔄 Sync List
        </button>
      </div>

      <DateFilter value={dateRange} onChange={setDateRange} />

      {filtered.length === 0 ? (
        <div className="bg-white rounded-[2rem] border-2 border-dashed border-slate-100 p-20 text-center">
          <p className="text-5xl mb-4">🏆</p>
          <p className="text-lg font-black text-slate-800">Perfect Adherence!</p>
          <p className="text-sm text-slate-400 mt-1 font-medium">No missed calls pending in your list.</p>
        </div>
      ) : (
        sortedDays.map(day => (
          <div key={day} className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
            <div className="px-8 py-4 flex items-center justify-between bg-slate-50/50 border-b border-slate-100">
              <span className="text-sm font-black text-slate-700 uppercase tracking-widest">{formatDateLabel(day)}</span>
              <span className="text-[10px] font-black bg-rose-50 text-rose-500 px-3 py-1 rounded-full border border-rose-100">
                {grouped[day].length} LEADS PENDING
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/20 border-b border-slate-50">
                    {["Lead Name", "Phone Number", "Missed At", "Action"].map(h => (
                      <th key={h} className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {grouped[day].map((call) => {
                    const isClearing = clearing === call._id;
                    const isCalling = calling === call._id;
                    const number = call.contact?.phone || call.number || "—";

                    return (
                      <tr key={call._id} className="group hover:bg-slate-50 transition-all duration-300">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs shadow-inner">
                              {call.contact?.name?.[0] || "#"}
                            </div>
                            <p className="text-sm font-black text-slate-800">{call.contact?.name || "New Lead"}</p>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-sm font-bold text-slate-600 font-mono tracking-tighter">
                          {number}
                        </td>
                        <td className="px-8 py-5 text-xs font-bold text-slate-400 uppercase">
                          {formatTime(call.createdAt)}
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                            {/* Callback Button */}
                            <button
                              onClick={() => handleCallback(call._id)}
                              disabled={isCalling || isClearing}
                              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${
                                isCalling 
                                ? "bg-indigo-100 text-indigo-400 cursor-not-allowed" 
                                : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95"
                              }`}
                            >
                              {isCalling ? "Dialing..." : "📞 Call"}
                            </button>

                            {/* Mark Done Button */}
                            <button
                              onClick={() => handleMarkDone(call._id)}
                              disabled={isClearing || isCalling}
                              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                isClearing 
                                ? "bg-emerald-100 text-emerald-400 cursor-not-allowed" 
                                : "bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 active:scale-95"
                              }`}
                            >
                              {isClearing ? "Syncing..." : "✅ Done"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
}