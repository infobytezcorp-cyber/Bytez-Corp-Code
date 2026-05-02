export default function StatCard({ label, value, sub, icon, accent = "indigo", bar, barPct, warn }) {
  const accents = {
    indigo: { bg: "bg-indigo-50", text: "text-indigo-500", bar: "bg-indigo-400" },
    amber:  { bg: "bg-amber-50",  text: "text-amber-500",  bar: "bg-amber-400"  },
    red:    { bg: "bg-red-50",    text: "text-red-500",    bar: "bg-red-400"    },
    emerald:{ bg: "bg-emerald-50",text: "text-emerald-500",bar: "bg-emerald-400"},
    blue:   { bg: "bg-blue-50",   text: "text-blue-500",   bar: "bg-blue-400"   },
    violet: { bg: "bg-violet-50", text: "text-violet-500", bar: "bg-violet-400" },
  };
  const a = accents[warn ? "red" : accent];

  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-5 hover:shadow-md transition-all ${warn ? "border-red-100" : "border-slate-100"}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <div className={`w-8 h-8 rounded-lg ${a.bg} ${a.text} flex items-center justify-center text-sm`}>{icon}</div>
      </div>
      <p className={`text-xl font-black font-mono tabular-nums tracking-tight ${warn ? "text-red-600" : "text-slate-800"}`}>{value}</p>
      {sub && <p className={`text-[10px] mt-0.5 ${warn ? "text-red-500 font-bold" : "text-slate-400"}`}>{sub}</p>}
      {bar && (
        <div className="mt-3 h-1 bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-1 rounded-full transition-all duration-1000 ${a.bar}`} style={{ width: `${Math.min(barPct, 100)}%` }} />
        </div>
      )}
    </div>
  );
}