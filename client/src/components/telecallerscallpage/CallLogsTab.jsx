import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyCallLogs } from "../../features/callSlice"; // adjust path
import DateFilter from "../../components/telecallerscallpage/DateFilter";
import StatCard from "../../components/telecallerscallpage/StatCard";
import {
  formatDuration,
  formatTime,
  formatDateLabel,
  toDateStr,
} from "../../components/telecallerscallpage/Utilities";

const FILTERS = ["Today", "Yesterday", "Last 7 Days", "All"];

export default function CallLogsTab() {
  const dispatch = useDispatch();
  const { myLogs, myStats, myLogsLoading } = useSelector(s => s.calls);

  const [activeFilter, setActiveFilter] = useState("All");
  const [dateRange, setDateRange]       = useState({ from: null, to: null });

  // ── Initial load ──
  useEffect(() => {
    dispatch(fetchMyCallLogs({}));
  }, []);

  // ── Quick filter buttons ──
  const handleFilterClick = (label) => {
    setActiveFilter(label);
    setDateRange({ from: null, to: null }); // clear custom range

    const today = new Date();

    if (label === "Today") {
      const d = today.toISOString().split("T")[0];
      dispatch(fetchMyCallLogs({ from: d, to: d }));

    } else if (label === "Yesterday") {
      const d = new Date(today);
      d.setDate(d.getDate() - 1);
      const ds = d.toISOString().split("T")[0];
      dispatch(fetchMyCallLogs({ from: ds, to: ds }));

    } else if (label === "Last 7 Days") {
      const d = new Date(today);
      d.setDate(d.getDate() - 6);
      dispatch(fetchMyCallLogs({ from: d.toISOString().split("T")[0] }));

    } else {
      dispatch(fetchMyCallLogs({}));
    }
  };

  // ── Custom date range ──
  const handleDateChange = (newRange) => {
    setDateRange(newRange);
    setActiveFilter(null); // deselect quick filters

    if (newRange.from || newRange.to) {
      dispatch(fetchMyCallLogs({
        from: newRange.from ?? undefined,
        to:   newRange.to   ?? undefined,
      }));
    }
  };

  // ── Group by date ──
  const grouped = myLogs.reduce((acc, call) => {
    const d = toDateStr(call.startTime ?? call.createdAt);
    if (!acc[d]) acc[d] = [];
    acc[d].push(call);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-4">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-black text-slate-800">Call Logs</h2>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {myStats.filtered} / {myLogs.length} CALLS
        </span>
      </div>

      {/* ── Filter Bar ── */}
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map(label => (
          <button
            key={label}
            onClick={() => handleFilterClick(label)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
              activeFilter === label
                ? "bg-violet-600 text-white border-violet-600"
                : "bg-white text-slate-600 border-slate-200 hover:border-violet-300"
            }`}
          >
            {label}
          </button>
        ))}

        {/* FROM → TO date pickers */}
        <DateFilter value={dateRange} onChange={handleDateChange} />
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Filtered Calls" icon="📞" accent="indigo"  value={myStats.filtered} sub="in selected range" />
        <StatCard label="Today"          icon="📅" accent="blue"    value={myStats.today}     sub="calls today" />
        <StatCard label="Answered"       icon="✅" accent="emerald" value={myStats.answered}  sub="completed" />
        <StatCard label="Missed"         icon="❌" accent="red"     value={myStats.missed}    sub="missed calls" warn={myStats.missed > 0} />
      </div>

      {/* ── Loading ── */}
      {myLogsLoading && (
        <div className="text-center py-10 text-sm text-slate-400 font-semibold animate-pulse">
          Loading calls...
        </div>
      )}

      {/* ── Empty State ── */}
      {!myLogsLoading && sortedDates.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
          <p className="text-4xl mb-3">📵</p>
          <p className="text-sm font-semibold text-slate-400">No call history found</p>
        </div>
      )}

      {/* ── Call Table grouped by date ── */}
      {!myLogsLoading && sortedDates.map(date => {
        const calls = grouped[date];
        return (
          <div key={date} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

            {/* Date Header */}
            <div className="px-5 py-3 flex items-center justify-between border-b bg-slate-50 border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-800">{formatDateLabel(date)}</span>
                <span className="text-[10px] text-slate-400 font-mono">{date}</span>
              </div>
              <span className="text-[10px] text-slate-400">{calls.length} calls</span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50/50">
                  <tr>
                    {["#", "Number", "Type", "Started", "Duration", "Status"].map(h => (
                      <th key={h} className="px-5 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {calls.map((call, i) => {
                    const isMissed   = call.status === "missed";
                    const isAnswered = call.status === "completed" || call.status === "answered";
                    const durSec     = call.duration ?? call.durationSeconds ?? 0;

                    return (
                      <tr key={call._id ?? i} className={`transition-colors ${isMissed ? "hover:bg-red-50/30" : "hover:bg-slate-50/60"}`}>
                        <td className="px-5 py-3 text-xs text-slate-400 font-mono">{i + 1}</td>
                        <td className="px-5 py-3 text-xs font-bold text-slate-800 font-mono">
                          {call.contact?.phone ?? call.number ?? "—"}
                        </td>
                        <td className="px-5 py-3 text-xs text-slate-500 capitalize">{call.type ?? "incoming"}</td>
                        <td className="px-5 py-3 text-xs text-slate-600 font-mono">
                          {call.startTime ? formatTime(call.startTime) : "—"}
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-[10px] font-black font-mono px-2 py-0.5 rounded-md border bg-slate-50 text-slate-600 border-slate-200">
                            {durSec > 0 ? formatDuration(durSec) : "—"}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isMissed
                              ? "bg-red-50 text-red-600 border-red-200"
                              : isAnswered
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-slate-50 text-slate-500 border-slate-200"
                          }`}>
                            {isMissed ? "Missed" : isAnswered ? "Answered" : call.status ?? "Unknown"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}