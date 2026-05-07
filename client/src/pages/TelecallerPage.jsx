import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMyAgent,
  toggleMyBreak,
  fetchMyCall,
  endMyCall,
  clearMyAgent,
} from "../features/myAgentSlice";
import socket from "../services/socket";
import API from "../services/api";

import DashboardTab      from "../components/telecallerscallpage/DashboardTab";
import BreakHistoryTab   from "../components/telecallerscallpage/BreakHistoryTab";
import CallLogsTab       from "../components/telecallerscallpage/CallLogsTab";
import MissedCallsTab    from "../components/telecallerscallpage/MissedCallsTab";
import { formatTimeShort, POLL_INTERVAL_MS } from "../components/telecallerscallpage/Utilities";
import { ActiveCallBar, IncomingCallPopup } from "../components/telecallerscallpage/telecallertwillo/Incomingcallpopup";
import { useTwilio } from "../components/telecallerscallpage/telecallertwillo/Usetwilio";
import { selectTwilioStatus } from "../features/Twilioslice";

const PhoneIcon = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
    strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12 19.79 19.79 0 0 1 1.9 3.37 2 2 0 0 1 3.89 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 5.99 5.99l1.07-1.07a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const NAV_ITEMS = [
  {
    id: "dashboard", label: "Dashboard",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" /></svg>,
  },
  {
    id: "history", label: "Break History",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" /></svg>,
  },
  { id: "calls",  label: "Call Logs",    icon: <PhoneIcon className="w-4 h-4" /> },
  {
    id: "missed", label: "Missed Calls",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.34 1.85.57 2.81.7a2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.42 19.42 0 0 1 1 4.73" /></svg>,
  },
];

// ── Sidebar ───────────────────────────────────────────────────
function TelecallerSidebar({ activeTab, setActiveTab, agent, onLogout, collapsed, setCollapsed }) {
  return (
    <aside className={`bg-slate-900 flex flex-col shrink-0 transition-all duration-300 ease-in-out min-h-screen relative z-30 ${collapsed ? "w-16" : "w-60"}`}>
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shrink-0">
          <PhoneIcon className="w-4 h-4 text-white" />
        </div>
        {!collapsed && <span className="font-black text-white text-sm tracking-wide truncate">TeleDesk</span>}
        <button onClick={() => setCollapsed(v => !v)}
          className="ml-auto w-6 h-6 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
            {collapsed ? <path d="M9 18l6-6-6-6" /> : <path d="M15 18l-6-6 6-6" />}
          </svg>
        </button>
      </div>

      {agent && (
        <div className={`px-3 py-4 border-b border-slate-800 ${collapsed ? "flex justify-center" : ""}`}>
          <div className={`flex items-center gap-3 ${collapsed ? "flex-col" : ""}`}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-600 flex items-center justify-center text-sm font-black text-white shrink-0 shadow-lg">
              {agent.name?.charAt(0)?.toUpperCase()}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-white text-xs font-bold truncate">{agent.name}</p>
                <p className={`text-[10px] font-semibold mt-0.5 ${
                  agent.status === "available" ? "text-emerald-400"
                  : agent.status === "busy"    ? "text-blue-400"
                  : "text-amber-400"}`}>{agent.status}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <nav className="flex-1 px-2 py-4 space-y-1">
        {NAV_ITEMS.map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id)} title={collapsed ? item.label : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all text-xs font-bold
              ${activeTab === item.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/30" : "text-slate-400 hover:text-white hover:bg-slate-800"}
              ${collapsed ? "justify-center" : ""}`}>
            {item.icon}
            {!collapsed && <span className="truncate">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="px-2 py-4 border-t border-slate-800">
        <button onClick={onLogout} title={collapsed ? "Logout" : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-xs font-bold ${collapsed ? "justify-center" : ""}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="w-60 bg-slate-900" />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-[3px] border-slate-200 border-t-indigo-500 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Loading workspace…</p>
        </div>
      </div>
    </div>
  );
}

function NoAgentState() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="w-60 bg-slate-900" />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl mx-auto">🔗</div>
          <p className="font-semibold text-slate-700">No agent profile linked</p>
          <p className="text-sm text-slate-400">Ask your admin to link your account.</p>
        </div>
      </div>
    </div>
  );
}

// ── Enable Calls Button ──
// ✅ FIX: callsEnabled ஆனா button காட்டாதே — error வந்தாலும்
function EnableCallsButton({ onEnable, twilioStatus, callsEnabled }) {
  // ✅ Once enabled → button forever hide
  if (callsEnabled) return null;

  const isLoading = twilioStatus === "initializing";

  return (
    <button
      onClick={onEnable}
      disabled={isLoading}
      style={{
        position:     "fixed",
        bottom:       "24px",
        right:        "24px",
        padding:      "14px 24px",
        background:   isLoading ? "#818cf8" : "#6366f1",
        color:        "#fff",
        border:       "none",
        borderRadius: "12px",
        cursor:       isLoading ? "not-allowed" : "pointer",
        fontWeight:   700,
        fontSize:     "14px",
        zIndex:       9999,
        boxShadow:    "0 4px 16px rgba(99,102,241,0.4)",
        display:      "flex",
        alignItems:   "center",
        gap:          "8px",
        transition:   "all 0.2s",
      }}
    >
      {isLoading ? (
        <><span style={{ fontSize: "16px" }}>⏳</span> Connecting...</>
      ) : (
        <><span style={{ fontSize: "16px" }}>🎤</span> Enable Calls</>
      )}
    </button>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function TelecallerPage() {
  const { acceptCall, rejectCall, hangUp, toggleMute, initDevice } = useTwilio();
  const twilioStatus = useSelector(selectTwilioStatus);
  const dispatch     = useDispatch();
  const { agent, activeCall, loading, breakLoading, callLoading, loginTime } =
    useSelector(s => s.myAgent);

  const [activeTab,    setActiveTab]    = useState("dashboard");
  const [collapsed,    setCollapsed]    = useState(false);
  const [now,          setNow]          = useState(new Date());
  // ✅ FIX: Once clicked → remember forever (even across calls)
  const [callsEnabled, setCallsEnabled] = useState(false);
  const [incomingRequest, setIncomingRequest] = useState(null);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => { dispatch(fetchMyAgent()); }, [dispatch]);

  useEffect(() => {
    if (!agent?._id) return;
    dispatch(fetchMyCall(agent._id));
    const poll = setInterval(() => dispatch(fetchMyCall(agent._id)), POLL_INTERVAL_MS);
    return () => clearInterval(poll);
  }, [agent?._id, dispatch]);

  useEffect(() => {
    if (!agent?._id) return;
    const handler = () => {
      dispatch(fetchMyCall(agent._id));
      dispatch(fetchMyAgent());
    };
    socket.on("callUpdated", handler);
    return () => socket.off("callUpdated", handler);
  }, [dispatch, agent?._id]);

  useEffect(() => {
    if (!agent?._id) return;
    const handleIncomingCall = (payload) => {
      if (payload.agentId !== agent._id?.toString()) return;
      setIncomingRequest(payload);
    };

    socket.on("incomingCall", handleIncomingCall);
    return () => socket.off("incomingCall", handleIncomingCall);
  }, [agent?._id]);

  useEffect(() => {
    if (agent?.status !== "ringing") {
      setIncomingRequest(null);
    }
  }, [agent?.status]);

  useEffect(() => {
    if (!agent?._id) return;
    const handleForceLogout = (data) => {
      if (data.agentId === agent._id) {
        localStorage.removeItem("token");
        dispatch(clearMyAgent());
        window.location.href = "/";
      }
    };
    socket.on("force-logout", handleForceLogout);
    return () => socket.off("force-logout", handleForceLogout);
  }, [agent?._id, dispatch]);

  const handleToggleBreak = () => {
    if (!agent?._id || agent?.status === "busy") return;
    dispatch(toggleMyBreak(agent._id)).then(() => dispatch(fetchMyAgent()));
  };

  const handleEndCall = async (callId) => {
    await dispatch(endMyCall(callId));
    dispatch(fetchMyCall(agent._id));
    dispatch(fetchMyAgent());
  };

  const handleLogout = async () => {
    try { await API.post("/agents/logoutagent"); } catch (err) { console.error("Logout error:", err); }
    localStorage.removeItem("token");
    dispatch(clearMyAgent());
    window.location.href = "/";
  };

  const handleAcceptIncoming = async (callId) => {
    try {
      acceptCall();
      await API.post(`/calls/${callId}/accept`);
      setIncomingRequest(null);
      dispatch(fetchMyCall(agent._id));
      dispatch(fetchMyAgent());
    } catch (err) {
      console.error("Accept incoming call failed:", err);
    }
  };

  const handleRejectIncoming = async (callId) => {
    try {
      rejectCall();
      await API.post(`/calls/${callId}/reject`);
      setIncomingRequest(null);
      dispatch(fetchMyAgent());
    } catch (err) {
      console.error("Reject incoming call failed:", err);
    }
  };

  // ✅ FIX: Enable பண்ணினா callsEnabled = true → button மறையும், எப்பவும் திரும்பாது
  const handleEnableCalls = async () => {
    try {
      await initDevice();
      setCallsEnabled(true); // ← இதுதான் key fix!
    } catch (err) {
      console.error("Enable calls error:", err);
    }
  };

  if (loading && !agent) return <LoadingState />;
  if (!agent)             return <NoAgentState />;

  const tabContent = {
    dashboard: (
      <DashboardTab agent={agent} activeCall={activeCall} breakLoading={breakLoading}
        callLoading={callLoading} loginTime={loginTime}
        onToggleBreak={handleToggleBreak} onEndCall={handleEndCall} />
    ),
    history: <BreakHistoryTab agent={agent} />,
    calls:   <CallLogsTab agent={agent} />,
    missed:  <MissedCallsTab agent={agent} />,
  };

  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* ✅ Telecaller popup for assigned ringing calls */}
      {incomingRequest && agent?.status === "ringing" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4">
          <div className="max-w-sm w-full rounded-3xl bg-white p-8 shadow-2xl ring-1 ring-slate-200">
            <div className="text-center space-y-3">
              <div className="text-5xl">📞</div>
              <h2 className="text-xl font-bold text-slate-900">Incoming call</h2>
              <p className="text-sm text-slate-500">Caller: {incomingRequest.customerName || incomingRequest.phone}</p>
              <p className="text-xs text-slate-400">Assigned to: {incomingRequest.agentName}</p>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <button
                onClick={() => handleAcceptIncoming(incomingRequest.callId)}
                className="rounded-2xl bg-emerald-500 py-3 text-sm font-bold text-white hover:bg-emerald-600"
              >Accept</button>
              <button
                onClick={() => handleRejectIncoming(incomingRequest.callId)}
                className="rounded-2xl bg-rose-500 py-3 text-sm font-bold text-white hover:bg-rose-600"
              >Reject</button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Twilio popups — always mounted */}
      <IncomingCallPopup acceptCall={acceptCall} rejectCall={rejectCall} />
      <ActiveCallBar hangUp={hangUp} toggleMute={toggleMute} />

      {/* ✅ Enable Calls — callsEnabled ஆனா forever hide */}
      <EnableCallsButton
        onEnable={handleEnableCalls}
        twilioStatus={twilioStatus}
        callsEnabled={callsEnabled}
      />

      <TelecallerSidebar
        activeTab={activeTab} setActiveTab={setActiveTab}
        agent={agent} onLogout={handleLogout}
        collapsed={collapsed} setCollapsed={setCollapsed}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between shrink-0 gap-4">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
              Telecaller Workspace
            </p>
            <h1 className="text-lg font-bold text-slate-800 mt-0.5 leading-tight">
              Welcome back, <span className="text-indigo-600">{agent.name}</span> 👋
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Login</span>
            <span className="text-xs font-black text-slate-700 font-mono">
              {agent.loginTime ? formatTimeShort(agent.loginTime) : "—"}
            </span>
          </div>

          {/* Twilio status indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl">
            <span className={`w-2 h-2 rounded-full ${
              twilioStatus === "ready"    ? "bg-emerald-400" :
              twilioStatus === "on-call"  ? "bg-blue-400 animate-pulse" :
              twilioStatus === "incoming" ? "bg-yellow-400 animate-pulse" :
              twilioStatus === "error"    ? "bg-red-400" :
              "bg-slate-300"
            }`} />
            <span className="text-[10px] font-bold text-slate-500 uppercase">
              {twilioStatus === "ready"         ? "Ready" :
               twilioStatus === "on-call"       ? "On Call" :
               twilioStatus === "incoming"      ? "Incoming" :
               twilioStatus === "initializing"  ? "Connecting" :
               twilioStatus === "error"         ? "Error" :
               "Calls Off"}
            </span>
          </div>

          <div className="bg-slate-900 rounded-xl px-5 py-2.5 text-right shrink-0">
            <p className="text-xl font-black text-white font-mono tabular-nums tracking-widest leading-none">
              {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5 tracking-wide">
              {now.toLocaleDateString([], { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {tabContent[activeTab]}
        </div>
      </div>
    </div>
  );
}