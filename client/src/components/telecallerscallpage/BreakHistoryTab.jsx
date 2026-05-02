import { useState } from "react";
import DateFilter from "../../components/telecallerscallpage/DateFilter";
import { formatDuration, formatTime, formatDateLabel, toDateStr, isInRange, BREAK_LIMIT_SEC } from "../../components/telecallerscallpage/Utilities";

export default function BreakHistoryTab({ agent }) {
  const allLogs = agent?.breakLogs ?? [];
  const [dateRange, setDateRange] = useState({ from: null, to: null });

  const filteredLogs = allLogs.filter(log =>
    log.breakStart && isInRange(toDateStr(log.breakStart), dateRange.from, dateRange.to)
  );

  const grouped = filteredLogs.reduce((acc, log) => {
    const d = toDateStr(log.breakStart);
    if (!acc[d]) acc[d] = [];
    acc[d].push(log);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-black text-slate-800">Break History</h2>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {filteredLogs.length} / {allLogs.length} sessions
        </span>
      </div>

      <DateFilter value={dateRange} onChange={setDateRange} />

      {sortedDates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
          <p className="text-4xl mb-3">☕</p>
          <p className="text-sm font-semibold text-slate-400">
            {allLogs.length > 0 ? "No breaks found for selected date range" : "No break history yet"}
          </p>
        </div>
      ) : sortedDates.map(date => {
        const logs      = grouped[date];
        const totalSec  = logs.reduce((s, l) => s + (l.durationMinutes ?? 0) * 60, 0);
        const overLimit = totalSec > BREAK_LIMIT_SEC;
        return (
          <div key={date} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className={`px-5 py-3 flex items-center justify-between border-b ${overLimit ? "bg-red-50 border-red-100" : "bg-slate-50 border-slate-100"}`}>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-800">{formatDateLabel(date)}</span>
                <span className="text-[10px] text-slate-400 font-mono">{date}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-slate-400">{logs.length} sessions</span>
                <span className={`text-xs font-black font-mono px-2.5 py-0.5 rounded-full border ${overLimit ? "bg-red-50 text-red-600 border-red-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
                  {formatDuration(totalSec)}{overLimit && " ⚠"}
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50/50">
                  <tr>{["#", "Start", "End", "Duration", "Status"].map(h => (
                    <th key={h} className="px-5 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {logs.map((log, i) => {
                    const dur = (log.durationMinutes ?? 0) * 60;
                    return (
                      <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-3 text-xs text-slate-400 font-mono">{i + 1}</td>
                        <td className="px-5 py-3 text-xs font-semibold text-slate-700 font-mono">{formatTime(log.breakStart)}</td>
                        <td className="px-5 py-3 text-xs font-semibold text-slate-700 font-mono">
                          {log.breakEnd ? formatTime(log.breakEnd) : (
                            <span className="inline-flex items-center gap-1 text-amber-600 font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />Active
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-[10px] font-black font-mono px-2 py-0.5 rounded-md border bg-slate-50 text-slate-600 border-slate-200">
                            {formatDuration(dur)}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${log.breakEnd ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                            {log.breakEnd ? "Done" : "Active"}
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