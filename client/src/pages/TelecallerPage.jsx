import { useEffect, useState } from "react";
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

import DashboardTab from "../components/telecallerscallpage/DashboardTab";
import BreakHistoryTab from "../components/telecallerscallpage/BreakHistoryTab";
import CallLogsTab from "../components/telecallerscallpage/CallLogsTab";
import MissedCallsTab from "../components/telecallerscallpage/MissedCallsTab";
import { formatTimeShort } from "../components/telecallerscallpage/Utilities";
import { POLL_INTERVAL_MS } from "../components/telecallerscallpage/Utilities";
import LeadForm from "../components/enquiry/leadForm/LeadForm";


const PhoneIcon = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
    strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12 19.79 19.79 0 0 1 1.9 3.37 2 2 0 0 1 3.89 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 5.99 5.99l1.07-1.07a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);


const NAV_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />
      </svg>
    ),
  },
  {
    id: "history",
    label: "Break History",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
      </svg>
    ),
  },
  {
    id: "calls",
    label: "Call Logs",
    icon: <PhoneIcon className="w-4 h-4" />,
  },
  {
    id: "missed",
    label: "Missed Calls",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.34 1.85.57 2.81.7a2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.42 19.42 0 0 1 1 4.73" />
      </svg>
    ),
  },
];

// Sidebar Component 
function TelecallerSidebar({ activeTab, setActiveTab, agent, onLogout, collapsed, setCollapsed }) {
  return (
    <aside className={`bg-slate-900 flex flex-col shrink-0 transition-all duration-300 ease-in-out min-h-screen relative z-30 ${collapsed ? "w-16" : "w-60"}`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shrink-0">
          <PhoneIcon className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <span className="font-black text-white text-sm tracking-wide truncate">TeleDesk</span>
        )}
        <button
          onClick={() => setCollapsed(v => !v)}
          className="ml-auto w-6 h-6 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors shrink-0"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
            {collapsed ? <path d="M9 18l6-6-6-6" /> : <path d="M15 18l-6-6 6-6" />}
          </svg>
        </button>
      </div>

      {/* Agent Info */}
      {agent && (
        <div className={`px-3 py-4 border-b border-slate-800 ${collapsed ? "flex justify-center" : ""}`}>
          <div className={`flex items-center gap-3 ${collapsed ? "flex-col" : ""}`}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-600 flex items-center justify-center text-sm font-black text-white shrink-0 shadow-lg">
              {agent.name?.charAt(0)?.toUpperCase()}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-white text-xs font-bold truncate">{agent.name}</p>
                <p className={`text-[10px] font-semibold mt-0.5 ${agent.status === "available" ? "text-emerald-400"
                    : agent.status === "busy" ? "text-blue-400"
                      : "text-amber-400"
                  }`}>{agent.status}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            title={collapsed ? item.label : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all text-xs font-bold
              ${activeTab === item.id
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
              } ${collapsed ? "justify-center" : ""}`}
          >
            {item.icon}
            {!collapsed && <span className="truncate">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-2 py-4 border-t border-slate-800">
        <button
          onClick={onLogout}
          title={collapsed ? "Logout" : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-xs font-bold ${collapsed ? "justify-center" : ""}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

//Loading & Error States 
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

// This state is shown if the user is successfully authenticated but there is no agent profile linked to their account. 
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

// Main Page Component
export default function TelecallerPage() {
  const dispatch = useDispatch();
  const { agent, activeCall, loading, breakLoading, callLoading, loginTime } =
    useSelector(s => s.myAgent);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [now, setNow] = useState(new Date());
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadFormPhone, setLeadFormPhone] = useState('');

  // Update the current time every second to keep the clock in the top bar accurate and to allow real-time updates of "time since login" and call durations.
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Initial fetch of agent profile on page load 
  useEffect(() => { dispatch(fetchMyAgent()); }, [dispatch]);

  // Polling for active call every 30 seconds to keep the dadhboard info up-to-date in case of missed socket events or changes made from another tab/device.
  useEffect(() => {
    if (!agent?._id) return;
    dispatch(fetchMyCall(agent._id));
    const poll = setInterval(() => dispatch(fetchMyCall(agent._id)), POLL_INTERVAL_MS);
    return () => clearInterval(poll);
  }, [agent?._id, dispatch]);

  // Socket listener for call updates - if any call involving this agent is updated, we refetch the active call to get the latest info and update the UI in real-time.
  useEffect(() => {
    if (!agent?._id) return;
    const handler = () => {
      dispatch(fetchMyCall(agent._id));
      dispatch(fetchMyAgent());
    };
    socket.on("callUpdated", handler);
    return () => socket.off("callUpdated", handler);
  }, [dispatch, agent?._id]);

  // Admin force logout listener
  useEffect(() => {
    if (!agent?._id) return;

    // If this event is received, it mean the admin has forced this agent to log out. So we clear local storage and redux state, then redirect to login page.
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

  // Toggle break status (only if not busy)
  const handleToggleBreak = () => {
    if (!agent?._id || agent?.status === "busy") return;
    dispatch(toggleMyBreak(agent._id)).then(() => dispatch(fetchMyAgent()));
  };

  // After call ends, refresh agent and call info to update UI
  const handleEndCall = async (callId) => {
    await dispatch(endMyCall(callId));
    dispatch(fetchMyCall(agent._id));
    dispatch(fetchMyAgent());
  };

  // ✅ FIX 3: Correct API path — was "/logoutagent", should be "/agents/logoutagent"
  const handleLogout = async () => {
    try {
      await API.post("/agents/logoutagent");
    } catch (err) {
      console.error("Logout error:", err);
    }
    localStorage.removeItem("token");
    dispatch(clearMyAgent());
    window.location.href = "/";
  };

  // Handle loading and no-agent states
  if (loading && !agent) return <LoadingState />;
  if (!agent) return <NoAgentState />;

  // Tab content mapping 
  const tabContent = {
    dashboard: (
      <DashboardTab
        agent={agent}
        activeCall={activeCall}
        breakLoading={breakLoading}
        callLoading={callLoading}
        loginTime={loginTime}
        onToggleBreak={handleToggleBreak}
        onEndCall={handleEndCall}
        onOpenLeadForm={(phone) => {
          setLeadFormPhone(phone || activeCall?.number || '');
          setShowLeadForm(true);
        }}
      />
    ),
    history: <BreakHistoryTab agent={agent} />,
    calls: <CallLogsTab agent={agent} />,
    missed: <MissedCallsTab agent={agent} />,
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <TelecallerSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        agent={agent}
        onLogout={handleLogout}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
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

          {/* Lead Form modal for telecaller */}
          {showLeadForm && (
            <div className="fixed inset-0 z-50 flex items-start justify-center p-6 bg-black/40">
              <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg overflow-auto max-h-[90vh]">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                  <h3 className="font-bold">New Lead (Agent: {agent.name})</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowLeadForm(false)}
                      className="px-3 py-1 rounded-md bg-slate-100 hover:bg-slate-200"
                    >
                      Close
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <LeadForm
                    initialAssignedToId={agent?._id}
                    initialAgentName={agent?.name}
                    initialPhone={leadFormPhone}
                    onSaved={() => setShowLeadForm(false)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}