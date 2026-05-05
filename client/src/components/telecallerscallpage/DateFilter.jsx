import { toDateStr, formatDateLabel } from "../../components/telecallerscallpage/Utilities";

export default function DateFilter({ value, onChange }) {
  const todayStr = toDateStr(new Date());
  const yesterdayStr = toDateStr(new Date(Date.now() - 86400000));
  const last7Str = toDateStr(new Date(Date.now() - 6 * 86400000));

  const presets = [
    { label: "Today", from: todayStr, to: todayStr },
    { label: "Yesterday", from: yesterdayStr, to: yesterdayStr },
    { label: "Last 7 Days", from: last7Str, to: todayStr },
    { label: "All", from: null, to: null },
  ];

  const activePreset = presets.find(p => p.from === value.from && p.to === value.to)?.label ?? "Custom";

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {presets.map(p => (
            <button
              key={p.label}
              onClick={() => onChange({ from: p.from, to: p.to })}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                activePreset === p.label
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="h-5 w-px bg-slate-200 hidden sm:block" />

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">From</span>
            <input
              type="date"
              value={value.from ?? ""}
              max={value.to ?? todayStr}
              onChange={e => onChange({ ...value, from: e.target.value || null })}
              className="text-xs font-semibold text-slate-700 border border-slate-200 rounded-lg px-2.5 py-1.5
                bg-slate-50 hover:border-indigo-300 focus:outline-none focus:border-indigo-400
                focus:ring-1 focus:ring-indigo-200 transition-colors cursor-pointer"
            />
          </div>
          <span className="text-slate-300 text-xs font-bold">→</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">To</span>
            <input
              type="date"
              value={value.to ?? ""}
              min={value.from ?? undefined}
              max={todayStr}
              onChange={e => onChange({ ...value, to: e.target.value || null })}
              className="text-xs font-semibold text-slate-700 border border-slate-200 rounded-lg px-2.5 py-1.5
                bg-slate-50 hover:border-indigo-300 focus:outline-none focus:border-indigo-400
                focus:ring-1 focus:ring-indigo-200 transition-colors cursor-pointer"
            />
          </div>
        </div>

        {(value.from || value.to) && (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full">
              {value.from === value.to && value.from
                ? formatDateLabel(value.from)
                : value.from && value.to
                  ? `${value.from} → ${value.to}`
                  : value.from ? `From ${value.from}` : `Until ${value.to}`}
            </span>
            {activePreset === "Custom" && (
              <button
                onClick={() => onChange({ from: null, to: null })}
                className="text-[10px] font-bold text-slate-400 hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
              >
                ✕ Clear
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}