import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAgents, toggleBreak } from "../features/agentSlice";
import { fetchCalls, callbackCall } from "../features/callSlice";
import Sidebar from "../components/dashboards/visitors/Sidebar";
import AgentsPanel from "../components/calls/AgentsPanel";
import MissedCallsPanel from "../components/calls/MissedCallsPanel";
import MissedCallDetail from "../components/calls/MissedCallDetail";
import TimeLogsTab from "../components/calls/TimeLogsTab";
import CallPanel from "../components/calls/CallPanel";
import AgentBreakLogs from "../components/calls/AgentBreakLogs";

const TABS = [
  { id: "agents",   label: "Agents",       icon: "👤" },
  { id: "missed",   label: "Missed Calls", icon: "📵" },
  { id: "timelogs", label: "Time Logs",    icon: "⏱" },
];

/* ─── tiny keyframes injected once ─── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
  @keyframes spin   { to { transform: rotate(360deg); } }
  @keyframes blink  { 0%,100%{opacity:1} 50%{opacity:.35} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes bounce { 0%,100%{transform:scale(1)} 50%{transform:scale(1.15)} }
`;

/* ─── design tokens ─── */
const T = {
  bg:          "#F5F6FA",
  card:        "#FFFFFF",
  border:      "#E8EAF0",
  borderLight: "#F0F1F6",
  text:        "#1A1D2E",
  muted:       "#8B90A7",
  accent:      "#4F6EF7",   /* indigo-blue */
  accentSoft:  "#EEF1FE",
  green:       "#18B87C",
  greenSoft:   "#E8F8F2",
  amber:       "#F59E0B",
  amberSoft:   "#FEF3C7",
  red:         "#EF4444",
  redSoft:     "#FEF2F2",
  shadow:      "0 2px 12px rgba(26,29,46,0.07)",
  shadowHover: "0 6px 24px rgba(26,29,46,0.12)",
  radius:      "18px",
  radiusSm:    "12px",
  font:        "'Outfit', sans-serif",
};

/* ─── reusable pill badge ─── */
function Badge({ children, color = T.accent, bg = T.accentSoft }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      fontSize: 11, fontWeight: 700, letterSpacing: .4,
      padding: "3px 10px", borderRadius: 99,
      color, background: bg,
    }}>
      {children}
    </span>
  );
}

/* ─── stat card ─── */
function StatCard({ label, value, icon, color, bg }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: T.card,
        border: `1.5px solid ${T.border}`,
        borderRadius: T.radius,
        padding: "20px 22px",
        display: "flex", alignItems: "center", gap: 16,
        boxShadow: hovered ? T.shadowHover : T.shadow,
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        transition: "all .22s ease",
        cursor: "default",
        animation: "fadeUp .4s ease both",
      }}
    >
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: bg, display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: 22, flexShrink: 0,
        boxShadow: `0 4px 12px ${bg}`,
      }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", margin: 0 }}>
          {label}
        </p>
        <p style={{ fontSize: 30, fontWeight: 800, color, margin: "2px 0 0", lineHeight: 1 }}>
          {value}
        </p>
      </div>
    </div>
  );
}

/* ─── agent activity card ─── */
function AgentCard({ agent }) {
  const sessions   = agent.loginHistory || [];
  const lastSession = sessions.length > 0 ? sessions[sessions.length - 1] : null;
  const isOnline   = agent.status !== "offline";
  const isBreak    = agent.status === "break";

  const statusLabel = isBreak ? "On Break" : isOnline ? "Live Online" : "Offline";
  const dotColor    = isBreak ? T.amber : isOnline ? T.green : "#CBD5E1";
  const accentColor = isBreak ? T.amber : isOnline ? T.green : T.muted;

  return (
    <div style={{
      background: T.card,
      border: `1.5px solid ${isBreak ? T.amberSoft : isOnline ? "#D1FAE5" : T.border}`,
      borderRadius: T.radius,
      padding: 18,
      boxShadow: isOnline ? T.shadow : "none",
      opacity: isOnline ? 1 : .65,
      transition: "all .3s",
      animation: "fadeUp .4s ease both",
    }}>
      {/* top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* avatar */}
          <div style={{
            width: 38, height: 38, borderRadius: 12,
            background: `linear-gradient(135deg, ${T.accent}, #7B93F8)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 800, fontSize: 15, flexShrink: 0,
          }}>
            {agent.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: T.text, margin: 0 }}>{agent.name}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: dotColor, display: "inline-block",
                boxShadow: isOnline ? `0 0 0 3px ${dotColor}30` : "none",
                animation: isOnline ? "blink 2s infinite" : "none",
              }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: accentColor, letterSpacing: .8, textTransform: "uppercase" }}>
                {statusLabel}
              </span>
            </div>
          </div>
        </div>
        <Badge
          color={isBreak ? T.amber : isOnline ? T.green : T.muted}
          bg={isBreak ? T.amberSoft : isOnline ? T.greenSoft : T.borderLight}
        >
          {isBreak ? "Break" : isOnline ? "Active" : "Inactive"}
        </Badge>
      </div>

      {/* session info */}
      {lastSession ? (
        <div style={{
          background: T.bg, borderRadius: T.radiusSm,
          padding: "10px 12px",
          border: `1px solid ${T.borderLight}`,
          display: "flex", flexDirection: "column", gap: 7,
        }}>
          <InfoRow label="Login" value={
            new Date(lastSession.loginTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          } />
          <div style={{ height: 1, background: T.borderLight }} />
          <InfoRow
            label="Status"
            value={
              isOnline
                ? <span style={{ color: T.accent, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ width: 4, height: 4, borderRadius: "50%", background: T.accent, display: "inline-block", animation: "bounce 1.4s infinite" }} />
                    Working
                  </span>
                : <span style={{ color: T.red, fontWeight: 700 }}>
                    Out {lastSession.logoutTime
                      ? new Date(lastSession.logoutTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : "—"}
                  </span>
            }
          />
          <div style={{ height: 1, background: T.borderLight }} />
          <InfoRow label="Duration" value={
            <span style={{ color: T.text, fontWeight: 700 }}>
              {lastSession.durationMinutes || 0}
              <span style={{ fontSize: 9, color: T.muted, marginLeft: 3 }}>MIN</span>
            </span>
          } />
        </div>
      ) : (
        <div style={{
          padding: "18px 12px", textAlign: "center",
          border: `1.5px dashed ${T.border}`,
          borderRadius: T.radiusSm, background: T.bg,
        }}>
          <p style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", margin: 0 }}>
            No session yet
          </p>
        </div>
      )}
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

/* ─── section heading ─── */
function SectionHeading({ children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <div style={{ width: 4, height: 20, borderRadius: 4, background: T.accent }} />
      <h2 style={{ fontSize: 14, fontWeight: 700, color: T.text, margin: 0, letterSpacing: .2 }}>{children}</h2>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
export default function EnquiryCalls() {
  const dispatch = useDispatch();
  const { list: agents, loading: agentsLoading } = useSelector(s => s.agents);
  const { list: calls,  loading: callsLoading  } = useSelector(s => s.calls);

  const [activeTab, setActiveTab] = useState("agents");
  const [selectedCall, setSelectedCall] = useState(null);
  const [agentsTabSelectedAgent, setAgentsTabSelectedAgent] = useState(null);
  const [agentsTabLogsDate, setAgentsTabLogsDate] = useState("");

  const initialLoadDone = useRef(false);
  const isInitialLoading = (agentsLoading || callsLoading) && !initialLoadDone.current;

  useEffect(() => {
    Promise.all([dispatch(fetchAgents()), dispatch(fetchCalls())]).then(() => {
      initialLoadDone.current = true;
    });
    const iv = setInterval(() => { dispatch(fetchAgents()); dispatch(fetchCalls()); }, 15000);
    return () => clearInterval(iv);
  }, [dispatch]);

  const handleCallback = (id) => { dispatch(callbackCall(id)); setSelectedCall(null); };

  const missedCalls     = calls.filter(c => c.status === "missed");
  const activeCalls     = calls.filter(c => c.status === "assigned" || c.status === "in_progress");
  const availableAgents = agents.filter(a => a.status === "available");
  const onBreakAgents   = agents.filter(a => a.status === "break");

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: T.bg, fontFamily: T.font }}>
      <style>{CSS}</style>
      <Sidebar />

      <div style={{ flex: 1, overflowY: "auto" }}>

        {/* ── Loading ── */}
        {isInitialLoading && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", flexDirection: "column", gap: 14 }}>
            <div style={{ width: 42, height: 42, border: `3px solid ${T.border}`, borderTop: `3px solid ${T.accent}`, borderRadius: "50%", animation: "spin .8s linear infinite" }} />
            <p style={{ color: T.muted, fontSize: 12, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase" }}>Syncing live data…</p>
          </div>
        )}

        {/* ── Missed call detail ── */}
        {!isInitialLoading && selectedCall && (
          <MissedCallDetail call={selectedCall} onBack={() => setSelectedCall(null)} onCallback={handleCallback} />
        )}

        {/* ── Dashboard ── */}
        {!isInitialLoading && !selectedCall && (
          <div style={{ padding: "32px 36px", maxWidth: 1520, margin: "0 auto" }}>

            {/* ── Page Header ── */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.green, display: "inline-block", animation: "blink 2s infinite", boxShadow: `0 0 0 3px ${T.greenSoft}` }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: T.green, letterSpacing: 2, textTransform: "uppercase" }}>Live System</span>
                </div>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: T.text, margin: 0, letterSpacing: -.5 }}>Call Center Ops</h1>
                <p style={{ color: T.muted, fontSize: 13, marginTop: 3 }}>Real-time agent performance & call traffic</p>
              </div>

              {/* live pulse chip */}
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                background: T.card, border: `1.5px solid ${T.border}`,
                borderRadius: 99, padding: "8px 16px",
                boxShadow: T.shadow,
              }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: T.green, display: "inline-block", animation: "blink 1.5s infinite" }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: T.text }}>
                  {availableAgents.length} / {agents.length} agents online
                </span>
              </div>
            </div>

            {/* ── Stat Cards ── */}
            {activeTab !== "timelogs" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 28 }}>
                <StatCard label="Total Agents"  value={agents.length}          icon="👥" color="#4F6EF7" bg="#EEF1FE" />
                <StatCard label="Available"     value={availableAgents.length} icon="✅" color={T.green} bg={T.greenSoft} />
                <StatCard label="On Break"      value={onBreakAgents.length}   icon="☕" color={T.amber} bg={T.amberSoft} />
                <StatCard label="Missed Today"  value={missedCalls.length}     icon="📵" color={T.red}   bg={T.redSoft} />
              </div>
            )}

            {/* ── Agent Activity ── */}
            <div style={{ marginBottom: 28 }}>
              <SectionHeading>Recent Agent Activity</SectionHeading>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 13 }}>
                {agents.map(a => <AgentCard key={a._id} agent={a} />)}
              </div>
            </div>

            {/* ── Tab Bar ── */}
            <div style={{
              display: "flex", gap: 3,
              background: T.card,
              border: `1.5px solid ${T.border}`,
              padding: 5, borderRadius: 14,
              width: "fit-content", marginBottom: 18,
              boxShadow: T.shadow,
            }}>
              {TABS.map(tab => {
                const isActive  = activeTab === tab.id;
                const showBadge = tab.id === "missed" && missedCalls.length > 0;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 7,
                      padding: "9px 18px", borderRadius: 10,
                      fontSize: 13, fontWeight: 700,
                      border: "none", cursor: "pointer",
                      transition: "all .18s ease",
                      background: isActive ? T.accent : "transparent",
                      color: isActive ? "#fff" : T.muted,
                      boxShadow: isActive ? `0 3px 10px ${T.accent}50` : "none",
                      fontFamily: T.font,
                    }}
                  >
                    <span style={{ fontSize: 15 }}>{tab.icon}</span>
                    {tab.label}
                    {showBadge && (
                      <span style={{
                        fontSize: 10, fontWeight: 800,
                        padding: "1px 7px", borderRadius: 99,
                        background: isActive ? "rgba(255,255,255,.25)" : T.red,
                        color: isActive ? "#fff" : "#fff",
                      }}>
                        {missedCalls.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* ── Tab Panel ── */}
            <div style={{
              background: T.card,
              borderRadius: T.radius,
              border: `1.5px solid ${T.border}`,
              boxShadow: T.shadow,
              overflow: "hidden", marginBottom: 22,
            }}>
              <div style={{ padding: 4 }}>
                {activeTab === "agents" && (
                  <AgentsPanel
                    agents={agents}
                    availableCount={availableAgents.length}
                    onToggleBreak={(id) => dispatch(toggleBreak(id))}
                    onViewLogs={(agent) => { setAgentsTabSelectedAgent(agent); setAgentsTabLogsDate(""); }}
                  />
                )}
                {activeTab === "timelogs" && <TimeLogsTab agents={agents} />}
                {activeTab === "missed"   && <MissedCallsPanel calls={missedCalls} onSelect={setSelectedCall} />}
              </div>
            </div>

            {/* ── Call Panel ── */}
            <div style={{
              background: T.card,
              borderRadius: T.radius,
              border: `1.5px solid ${T.border}`,
              boxShadow: T.shadow,
              overflow: "hidden",
            }}>
              <CallPanel agents={agents} />
            </div>

          </div>
        )}
      </div>

      {/* ── Agent Break Logs Drawer ── */}
      {agentsTabSelectedAgent && (
        <AgentBreakLogs
          agent={agentsTabSelectedAgent}
          selectedDate={agentsTabLogsDate}
          onDateChange={setAgentsTabLogsDate}
          onClose={() => setAgentsTabSelectedAgent(null)}
        />
      )}
    </div>
  );
}