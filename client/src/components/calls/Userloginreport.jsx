import { useState, useMemo } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// THEME & STYLES (Modern & Professional)
// ─────────────────────────────────────────────────────────────────────────────
const COLORS = {
  bgOverlay: "rgba(15, 23, 42, 0.6)",
  surface: "#FFFFFF",
  primary: "#4F46E5", // Indigo
  success: "#10B981", // Emerald
  warning: "#F59E0B", // Amber
  danger: "#EF4444",  // Rose
  textPrimary: "#1E293B",
  textSecondary: "#64748B",
  border: "#E2E8F0",
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const formatDate = (date) => new Date(date).toISOString().slice(0, 10);
const formatTime = (iso) => iso ? new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";

const formatDuration = (mins) => {
  if (!mins) return "0m";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

// Status Badge Component
const StatusBadge = ({ status }) => {
  const styles = {
    available: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Online" },
    break: { bg: "bg-amber-100", text: "text-amber-700", label: "On Break" },
    busy: { bg: "bg-rose-100", text: "text-rose-700", label: "Busy" },
    offline: { bg: "bg-slate-100", text: "text-slate-600", label: "Offline" },
  };
  const config = styles[status] || styles.offline;
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

// Progress Bar for Time Usage
const TimeBar = ({ label, current, max, colorClass }) => {
  const percentage = Math.min(Math.round((current / max) * 100), 100);
  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
        <span>{label}</span>
        <span>{formatDuration(current)}</span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${colorClass}`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN REPORT COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function UserLoginReport({ agents = [], onClose }) {
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));

  // ரிப்போர்ட் டேட்டா கணக்கீடு (Memoized for performance)
  const reportData = useMemo(() => {
    return agents.map(agent => {
      // குறிப்பிட்ட தேதியில் நடந்த செஷன்கள்
      const dailySessions = (agent.loginHistory || []).filter(s => 
        s.loginTime && s.loginTime.startsWith(selectedDate)
      );

      // குறிப்பிட்ட தேதியில் நடந்த இடைவெளிகள்
      const dailyBreaks = (agent.breakLogs || []).filter(b => 
        b.breakStart && b.breakStart.startsWith(selectedDate)
      );

      const totalWorkMins = dailySessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
      const totalBreakMins = dailyBreaks.reduce((sum, b) => sum + (b.durationMinutes || 0), 0);
      
      const firstLogin = dailySessions.length > 0 ? dailySessions[0].loginTime : null;
      const lastLogout = dailySessions.length > 0 ? dailySessions[dailySessions.length - 1].logoutTime : null;

      return {
        id: agent._id,
        name: agent.name,
        status: agent.status,
        loginTime: firstLogin,
        logoutTime: lastLogout,
        workMins: totalWorkMins,
        breakMins: totalBreakMins,
        sessionCount: dailySessions.length
      };
    }).sort((a, b) => b.workMins - a.workMins); // அதிக வேலை செய்தவர்கள் முதலில்
  }, [agents, selectedDate]);

  // Calculate max values for scaling bars
  const maxWork = Math.max(...reportData.map(r => r.workMins), 1);
  const maxBreak = Math.max(...reportData.map(r => r.breakMins), 1);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 md:p-8">
      <div className="bg-white w-full max-w-5xl max-h-full rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header Section */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black text-slate-800">Agent Performance Report</h2>
            <p className="text-sm text-slate-500 font-medium">Detailed logs of logins, work hours, and breaks.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-all"
            >
              <span className="text-xl">✕</span>
            </button>
          </div>
        </div>

        {/* Report Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-4">
            
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 px-6 py-3 text-[11px] font-black text-slate-400 uppercase tracking-widest">
              <div className="col-span-3">Agent Details</div>
              <div className="col-span-2">First Login</div>
              <div className="col-span-2">Last Logout</div>
              <div className="col-span-5 text-center">Activity Breakdown</div>
            </div>

            {reportData.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-slate-400 font-medium italic">No activity found for this date.</p>
              </div>
            ) : (
              reportData.map(row => (
                <div 
                  key={row.id} 
                  className="grid grid-cols-1 md:grid-cols-12 items-center gap-4 md:gap-0 px-6 py-5 bg-white border border-slate-100 rounded-[1.5rem] hover:shadow-md hover:border-indigo-100 transition-all group"
                >
                  {/* Agent Info */}
                  <div className="col-span-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-100">
                      {row.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800 leading-none">{row.name}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <StatusBadge status={row.status} />
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded uppercase">
                          {row.sessionCount} Sessions
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Times */}
                  <div className="col-span-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase md:hidden">First Login</p>
                    <p className="text-xs font-black text-emerald-600">{formatTime(row.loginTime)}</p>
                  </div>

                  <div className="col-span-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase md:hidden">Last Logout</p>
                    <p className="text-xs font-black text-rose-500">{formatTime(row.logoutTime)}</p>
                  </div>

                  {/* Charts / Progress */}
                  <div className="col-span-5 flex flex-col md:flex-row items-center gap-6 md:px-4">
                    <TimeBar 
                      label="Working" 
                      current={row.workMins} 
                      max={maxWork} 
                      colorClass="bg-indigo-500" 
                    />
                    <TimeBar 
                      label="Breaks" 
                      current={row.breakMins} 
                      max={maxBreak} 
                      colorClass="bg-amber-400" 
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer Summary */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
              <span className="text-[11px] font-bold text-slate-500 uppercase">Work Hours</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <span className="text-[11px] font-bold text-slate-500 uppercase">Break Time</span>
            </div>
          </div>
          <button 
            onClick={() => window.print()}
            className="px-6 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-black transition-all shadow-lg shadow-slate-200"
          >
            🖨️ Print PDF
          </button>
        </div>

      </div>
    </div>
  );
}