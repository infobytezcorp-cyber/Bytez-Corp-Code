// src/components/calls/MissedCallsPanel.jsx

export default function MissedCallsPanel({ calls, onSelect }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Missed Calls</h2>
          <p className="text-xs text-slate-400 mt-0.5">Click a call to view details & callback</p>
        </div>
        {calls.length > 0 && (
          <span className="text-xs text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full font-medium">
            {calls.length} pending
          </span>
        )}
      </div>

      {/* List */}
      <div className="divide-y divide-slate-50">
        {calls.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-3xl mb-2">✅</p>
            <p className="text-sm text-slate-400">No missed calls — all caught up!</p>
          </div>
        ) : (
          calls.slice(0, 10).map((c) => (
            <div
              key={c._id}
              onClick={() => onSelect(c)}
              className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-500 text-lg shrink-0">
                  📵
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">{c.number}</p>
                  <p className="text-xs text-slate-400">
                    {c.startTime
                      ? new Date(c.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : "—"}
                  </p>
                </div>
              </div>

              <span className="text-xs text-blue-600 group-hover:text-blue-800 font-medium bg-blue-50 group-hover:bg-blue-100 border border-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                View Details →
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}