import { useState } from "react";
import DateFilter from "../../components/telecallerscallpage/DateFilter";
import { formatTime, formatDateLabel, toDateStr, isInRange } from "../../components/telecallerscallpage/Utilities";

export default function MissedCallsTab({ agent }) {
  const allMissed = (agent?.callLogs ?? []).filter(c => c.status === "missed");
  const [dateRange, setDateRange] = useState({ from: null, to: null });

  const missedCalls = allMissed
    .filter(c => c.startTime && isInRange(toDateStr(c.startTime), dateRange.from, dateRange.to))
    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

  const todayStr   = toDateStr(new Date());
  const todayMissed = missedCalls.filter(c => c.startTime && toDateStr(c.startTime) === todayStr);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-black text-slate-800">Missed Calls</h2>
        <span className={`text-xs font-black px-3 py-1 rounded-full border ${
          missedCalls.length > 0 ? "bg-red-50 text-red-600 border-red-200" : "bg-slate-50 text-slate-400 border-slate-200"
        }`}>
          {missedCalls.length} / {allMissed.length} missed
        </span>
      </div>

      <DateFilter value={dateRange} onChange={setDateRange} />

      {todayMissed.length > 0 && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="text-sm font-bold text-red-900">{todayMissed.length} missed call{todayMissed.length > 1 ? "s" : ""} today</p>
            <p className="text-xs text-red-500">Please follow up with these customers</p>
          </div>
        </div>
      )}

      {missedCalls.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
          <p className="text-4xl mb-3">✅</p>
          <p className="text-sm font-semibold text-slate-400">
            {allMissed.length > 0 ? "No missed calls for selected range" : "No missed calls — great work!"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>{["#", "Number", "Date", "Time", "Type"].map(h => (
                  <th key={h} className="px-5 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {missedCalls.map((call, i) => (
                  <tr key={i} className="hover:bg-red-50/20 transition-colors">
                    <td className="px-5 py-3 text-xs text-slate-400 font-mono">{i + 1}</td>
                    <td className="px-5 py-3 text-xs font-bold text-slate-800 font-mono">{call.number ?? call.phone ?? "—"}</td>
                    <td className="px-5 py-3 text-xs text-slate-500">{call.startTime ? formatDateLabel(toDateStr(call.startTime)) : "—"}</td>
                    <td className="px-5 py-3 text-xs text-slate-600 font-mono">{call.startTime ? formatTime(call.startTime) : "—"}</td>
                    <td className="px-5 py-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-slate-50 text-slate-500 border-slate-200">
                        {call.type ?? "Inbound"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}