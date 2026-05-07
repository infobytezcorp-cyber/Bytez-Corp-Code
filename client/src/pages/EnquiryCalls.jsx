import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAgents, toggleBreak, forceLogout } from "../features/agentSlice";
import { fetchCalls, callbackCall } from "../features/callSlice";
import Sidebar from "../components/dashboards/Sidebar";
import AgentsPanel from "../components/calls/AgentsPanel";
import MissedCallsPanel from "../components/calls/MissedCallsPanel";
import MissedCallDetail from "../components/calls/MissedCallDetail";
import TimeLogsTab from "../components/calls/TimeLogsTab";
import CallPanel from "../components/calls/CallPanel";
import AgentBreakLogs from "../components/calls/AgentBreakLogs";
import QuickAccess from "../components/calls/QuickAccess";
import UserCallReport from "../components/calls/UserCallReport";
import UserLoginReport from "../components/calls/UserLoginReport";
import Forcelogoutconfirm from "../components/calls/Forcelogoutconfirm";
import socket from "../services/socket";       // ✅ NEW
import toast from "react-hot-toast";           // ✅ NEW


const TABS = [
  { id: "agents", label: "Agents", icon: "👤" },
  { id: "missed", label: "Missed Calls", icon: "📵" },
  { id: "timelogs", label: "Time Logs", icon: "⏱" },
];

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
  @keyframes spin   { to { transform: rotate(360deg); } }
  @keyframes blink  { 0%,100%{opacity:1} 50%{opacity:.35} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes bounce { 0%,100%{transform:scale(1)} 50%{transform:scale(1.15)} }
  @keyframes pageIn { from{opacity:0;transform:translateX(18px)} to{opacity:1;transform:translateX(0)} }
`;

const T = {
  bg: "#F5F6FA", card: "#FFFFFF", border: "#E8EAF0", borderLight: "#F0F1F6",
  text: "#1A1D2E", muted: "#8B90A7", accent: "#4F6EF7", accentSoft: "#EEF1FE",
  green: "#18B87C", greenSoft: "#E8F8F2", amber: "#F59E0B", amberSoft: "#FEF3C7",
  red: "#EF4444", redSoft: "#FEF2F2",
  shadow: "0 2px 12px rgba(26,29,46,0.07)", shadowHover: "0 6px 24px rgba(26,29,46,0.12)",
  radius: "18px", radiusSm: "12px", font: "'Outfit', sans-serif",
};

function Badge({ children, color = T.accent, bg = T.accentSoft }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, letterSpacing: .4, padding: "3px 10px", borderRadius: 99, color, background: bg }}>
      {children}
    </span>
  );
}


function StatCard({ label, value, icon, color, bg }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: T.card, border: `1.5px solid ${T.border}`, borderRadius: T.radius, padding: "20px 22px", display: "flex", alignItems: "center", gap: 16, boxShadow: hovered ? T.shadowHover : T.shadow, transform: hovered ? "translateY(-3px)" : "translateY(0)", transition: "all .22s ease", cursor: "default", animation: "fadeUp .4s ease both" }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0, boxShadow: `0 4px 12px ${bg}` }}>{icon}</div>
      <div>
        <p style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", margin: 0 }}>{label}</p>
        <p style={{ fontSize: 30, fontWeight: 800, color, margin: "2px 0 0", lineHeight: 1 }}>{value}</p>
      </div>
    </div>
  );
}

function AgentCard({ agent }) {
  const isOnline = agent.status !== "offline";
  const isBreak = agent.status === "break";
  const sessions = agent.loginHistory || [];

  
  let displayLogin = null;
  let displayLogout = null;
  let displayDuration = 0;

  if (isOnline && agent.loginTime) {
    displayLogin = agent.loginTime;
    displayLogout = null;
    const diff = Math.max(0, Date.now() - new Date(agent.loginTime));
    displayDuration = Math.floor(diff / 1000 / 60);
  } else if (sessions.length > 0) {
    const last = sessions[sessions.length - 1];
    displayLogin = last.loginTime;
    displayLogout = last.logoutTime;
    displayDuration = last.durationMinutes;
  }

  return (
    <div className={`p-5 rounded-3xl border transition-all ${isOnline ? "bg-emerald-50/40 border-emerald-100 shadow-sm" : "bg-white border-slate-100 opacity-70 grayscale-[0.2]"}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white flex items-center justify-center font-black text-sm">
            {agent.name?.[0]}
          </div>
          <div>
            <p className="text-sm font-black text-slate-800">{agent.name}</p>
            <p className={`text-[10px] font-bold uppercase tracking-widest ${isOnline ? "text-emerald-600" : "text-slate-400"}`}>
              {isOnline ? "● Live Online" : "● Offline"}
            </p>
          </div>
        </div>
        <div className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${isOnline ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
          {isOnline ? "Active" : "Inactive"}
        </div>
      </div>

      <div className="bg-white/80 p-3 rounded-2xl border border-slate-50 space-y-2">
        <div className="flex justify-between text-[11px] font-bold">
          <span className="text-slate-400 uppercase">Login</span>
          <span className="text-slate-700">{displayLogin ? new Date(displayLogin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}</span>
        </div>
        <div className="flex justify-between text-[11px] font-bold">
          <span className="text-slate-400 uppercase">Status</span>
          <span className={isOnline ? "text-indigo-600 animate-pulse" : "text-rose-500"}>
            {isOnline ? "Working Now" : `Out ${displayLogout ? new Date(displayLogout).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}`}
          </span>
        </div>
        <div className="pt-2 border-t border-slate-50 flex justify-between text-[11px] font-black uppercase">
          <span className="text-slate-400">Duration</span>
          <span className="text-slate-800">{displayDuration} Min</span>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 10, color: T.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: .8 }}>{label}</span>
      <span style={{ fontSize: 11, color: T.text }}>{value}</span>
    </div>
  );
}

function SectionHeading({ children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <div style={{ width: 4, height: 20, borderRadius: 4, background: T.accent }} />
      <h2 style={{ fontSize: 14, fontWeight: 700, color: T.text, margin: 0, letterSpacing: .2 }}>{children}</h2>
    </div>
  );
}

function ReportPageWrapper({ title, onBack, children }) {
  return (
    <div style={{ flex: 1, overflowY: "auto", animation: "pageIn .25s ease" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 32px", background: T.card, borderBottom: `1.5px solid ${T.border}`, boxShadow: T.shadow, position: "sticky", top: 0, zIndex: 10 }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 10, border: `1.5px solid ${T.border}`, background: T.card, fontSize: 13, fontWeight: 700, color: T.muted, cursor: "pointer", fontFamily: T.font }}>
          ← Back
        </button>
        <span style={{ fontSize: 15, fontWeight: 800, color: T.text }}>{title}</span>
      </div>
      <div style={{ padding: "24px 32px" }}>{children}</div>
    </div>
  );
}

export default function EnquiryCalls() {
  const dispatch = useDispatch();
  const { list: agents, loading: agentsLoading } = useSelector(s => s.agents);
  const { list: calls, loading: callsLoading } = useSelector(s => s.calls);

  const [activeTab, setActiveTab] = useState("agents");
  const [selectedCall, setSelectedCall] = useState(null);
  const [agentsTabSelectedAgent, setAgentsTabSelectedAgent] = useState(null);
  const [agentsTabLogsDate, setAgentsTabLogsDate] = useState("");
  const [openReport, setOpenReport] = useState(null);
  const [logoutTarget, setLogoutTarget] = useState(null);

  const initialLoadDone = useRef(false);
  const isInitialLoading = (agentsLoading || callsLoading) && !initialLoadDone.current;

  useEffect(() => {
    Promise.all([dispatch(fetchAgents()), dispatch(fetchCalls())]).then(() => {
      initialLoadDone.current = true;
    });
    const iv = setInterval(() => { dispatch(fetchAgents()); dispatch(fetchCalls()); }, 15000);
    return () => clearInterval(iv);
  }, [dispatch]);

  // ✅ NEW: 1hr missed call alert from backend
  useEffect(() => {
    const handleMissedAlert = (data) => {
      toast.error(`⚠️ ${data.message}`, { duration: 8000, style: { fontWeight: 700, fontSize: 13 } });
    };
    socket.on("missed-call-alert", handleMissedAlert);
    return () => socket.off("missed-call-alert", handleMissedAlert);
  }, []);

  const handleCallback = (id) => { dispatch(callbackCall(id)); setSelectedCall(null); };
  const handleForceLogoutConfirm = () => {
    if (!logoutTarget) return;
    dispatch(forceLogout(logoutTarget._id));
    setLogoutTarget(null);
  };

  const missedCalls = calls.filter(c => c.status === "missed");
  const availableAgents = agents.filter(a => a.status === "available");
  const onBreakAgents = agents.filter(a => a.status === "break");

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: T.bg, fontFamily: T.font }}>
      <style>{CSS}</style>
      <Sidebar />

      {isInitialLoading && (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 14 }}>
          <div style={{ width: 42, height: 42, border: `3px solid ${T.border}`, borderTop: `3px solid ${T.accent}`, borderRadius: "50%", animation: "spin .8s linear infinite" }} />
          <p style={{ color: T.muted, fontSize: 12, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase" }}>Syncing live data…</p>
        </div>
      )}

      {!isInitialLoading && openReport === "call" && (
        <ReportPageWrapper title="User Call Report" onBack={() => setOpenReport(null)}>
          <UserCallReport agents={agents} calls={calls} onClose={() => setOpenReport(null)} inPage={true} />
        </ReportPageWrapper>
      )}

      {!isInitialLoading && openReport === "login" && (
        <ReportPageWrapper title="User Login Report" onBack={() => setOpenReport(null)}>
          <UserLoginReport agents={agents} onClose={() => setOpenReport(null)} inPage={true} />
        </ReportPageWrapper>
      )}

      {!isInitialLoading && !openReport && selectedCall && (
        <div style={{ flex: 1, overflowY: "auto" }}>
          <MissedCallDetail call={selectedCall} onBack={() => setSelectedCall(null)} onCallback={handleCallback} />
        </div>
      )}

      {!isInitialLoading && !openReport && !selectedCall && (
        <div style={{ flex: 1, overflowY: "auto" }}>
          <div style={{ padding: "32px 36px", maxWidth: 1520, margin: "0 auto" }}>

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.green, display: "inline-block", animation: "blink 2s infinite", boxShadow: `0 0 0 3px ${T.greenSoft}` }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: T.green, letterSpacing: 2, textTransform: "uppercase" }}>Live System</span>
                </div>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: T.text, margin: 0, letterSpacing: -.5 }}>Call Center Ops</h1>
                <p style={{ color: T.muted, fontSize: 13, marginTop: 3 }}>Real-time agent performance & call traffic</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: T.card, border: `1.5px solid ${T.border}`, borderRadius: 99, padding: "8px 16px", boxShadow: T.shadow }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: T.green, display: "inline-block", animation: "blink 1.5s infinite" }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: T.text }}>{availableAgents.length} / {agents.length} agents online</span>
              </div>
            </div>

            {/* Stat Cards */}
            {activeTab !== "timelogs" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 28 }}>
                <StatCard label="Total Agents" value={agents.length} icon="👥" color="#4F6EF7" bg="#EEF1FE" />
                <StatCard label="Available" value={availableAgents.length} icon="✅" color={T.green} bg={T.greenSoft} />
                <StatCard label="On Break" value={onBreakAgents.length} icon="☕" color={T.amber} bg={T.amberSoft} />
                <StatCard label="Missed Today" value={missedCalls.length} icon="📵" color={T.red} bg={T.redSoft} />
              </div>
            )}

            {/* Agent Activity */}
            <div style={{ marginBottom: 28 }}>
              <SectionHeading>Recent Agent Activity</SectionHeading>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 13 }}>
                {agents.map(a => <AgentCard key={a._id} agent={a} />)}
              </div>
            </div>

            <QuickAccess onOpen={setOpenReport} />

            {/* Tab Bar */}
            <div style={{ display: "flex", gap: 3, background: T.card, border: `1.5px solid ${T.border}`, padding: 5, borderRadius: 14, width: "fit-content", marginBottom: 18, boxShadow: T.shadow }}>
              {TABS.map(tab => {
                const isActive = activeTab === tab.id;
                const showBadge = tab.id === "missed" && missedCalls.length > 0;
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer", transition: "all .18s ease", background: isActive ? T.accent : "transparent", color: isActive ? "#fff" : T.muted, boxShadow: isActive ? `0 3px 10px ${T.accent}50` : "none", fontFamily: T.font }}>
                    <span style={{ fontSize: 15 }}>{tab.icon}</span>
                    {tab.label}
                    {showBadge && <span style={{ fontSize: 10, fontWeight: 800, padding: "1px 7px", borderRadius: 99, background: isActive ? "rgba(255,255,255,.25)" : T.red, color: "#fff" }}>{missedCalls.length}</span>}
                  </button>
                );
              })}
            </div>

            {/* Tab Panel */}
            <div style={{ background: T.card, borderRadius: T.radius, border: `1.5px solid ${T.border}`, boxShadow: T.shadow, overflow: "hidden", marginBottom: 22 }}>
              <div style={{ padding: 4 }}>
                {activeTab === "agents" && (
                  <AgentsPanel
                    agents={agents}
                    availableCount={availableAgents.length}
                    onToggleBreak={(id) => dispatch(toggleBreak(id))}
                    onViewLogs={(agent) => { setAgentsTabSelectedAgent(agent); setAgentsTabLogsDate(""); }}
                    onForceLogout={(agent) => setLogoutTarget(agent)}
                  />
                )}
                {activeTab === "timelogs" && <TimeLogsTab agents={agents} />}
                {/* ✅ CHANGED: pass full calls array — MissedCallsPanel filters internally */}
                {activeTab === "missed" && <MissedCallsPanel calls={calls} onSelect={setSelectedCall} />}
              </div>
            </div>

            {/* Call Panel */}
            <div style={{ background: T.card, borderRadius: T.radius, border: `1.5px solid ${T.border}`, boxShadow: T.shadow, overflow: "hidden" }}>
              <CallPanel agents={agents} />
            </div>

          </div>
        </div>
      )}

      {agentsTabSelectedAgent && (
        <AgentBreakLogs
          agent={agentsTabSelectedAgent}
          selectedDate={agentsTabLogsDate}
          onDateChange={setAgentsTabLogsDate}
          onClose={() => setAgentsTabSelectedAgent(null)}
        />
      )}

      {logoutTarget && (
        <Forcelogoutconfirm
          agent={logoutTarget}
          onConfirm={handleForceLogoutConfirm}
          onCancel={() => setLogoutTarget(null)}
        />
      )}
    </div>
  );
}