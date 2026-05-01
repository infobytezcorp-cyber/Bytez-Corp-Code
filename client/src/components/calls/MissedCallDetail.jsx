// src/components/calls/MissedCallDetail.jsx

export default function MissedCallDetail({ call, onBack, onCallback }) {
  return (
    <div className="p-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors"
      >
        ← Back to Dashboard
      </button>

      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

          {/* Gradient Header */}
          <div className="bg-gradient-to-r from-red-500 to-rose-600 px-6 py-8 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl mb-4 mx-auto">
              📵
            </div>
            <h2 className="text-xl font-bold">{call.number}</h2>
            <p className="text-red-100 text-sm mt-1">Missed Call</p>
          </div>

          {/* Detail Rows */}
          <div className="p-6">
            {[
              { label: "Call Type",      value: call.type || "incoming" },
              { label: "Status",         value: call.status },
              { label: "Assigned Agent", value: call.agent?.name || "Unassigned" },
              { label: "Start Time",     value: call.startTime ? new Date(call.startTime).toLocaleString() : "—" },
              { label: "Call ID",        value: call._id },
            ].map((row) => (
              <div
                key={row.label}
                className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0"
              >
                <span className="text-xs text-slate-400 uppercase tracking-wider">{row.label}</span>
                <span className="text-sm font-medium text-slate-700 text-right max-w-xs truncate">{row.value}</span>
              </div>
            ))}
          </div>

          {/* Callback Button */}
          <div className="px-6 pb-6 flex gap-3">
            <button
              onClick={onBack}
              className="flex-1 py-3 border border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-50 transition-colors text-sm"
            >
              ← Back
            </button>
            <button
              onClick={() => onCallback(call._id)}
              className="flex-1 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm shadow-blue-200 text-sm"
            >
              📞 Call Back Now
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}