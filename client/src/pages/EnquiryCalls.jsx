// src/pages/EnquiryCalls.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAgents, toggleBreak } from "../features/agentSlice";
import { fetchCalls, callbackCall } from "../features/callSlice";
import Sidebar from "../components/dashboards/visitors/Sidebar";
import AgentsPanel from "../components/calls/AgentsPanel";
import MissedCallsPanel from "../components/calls/MissedCallsPanel";
import MissedCallDetail from "../components/calls/MissedCallDetail";
import AgentBreakLogs from "../components/calls/AgentBreakLogs";
import TimeLogsTab from "../components/calls/TimeLogsTab";
import CallPanel from "../components/calls/CallPanel";

const TABS = [
  { id: "agents", label: "Agents", icon: "🧍" },
  { id: "missed", label: "Missed Calls", icon: "📵" },
  { id: "timelogs", label: "Time Logs", icon: "⏱️" },
];

export default function EnquiryCalls() {
  const dispatch = useDispatch();
  const { list: agents, loading: agentsLoading } = useSelector(s => s.agents);
  const { list: calls, loading: callsLoading } = useSelector(s => s.calls);

  const [activeTab, setActiveTab] = useState("agents");
  const [selectedCall, setSelectedCall] = useState(null);

  // Agents tab modal state only
  // TimeLogsTab manages its own modal state internally
  const [agentsTabSelectedAgent, setAgentsTabSelectedAgent] = useState(null);
  const [agentsTabLogsDate, setAgentsTabLogsDate] = useState("");

  useEffect(() => {
    dispatch(fetchAgents());
    dispatch(fetchCalls());
  }, [dispatch]);

  const handleCallback = (id) => { dispatch(callbackCall(id)); setSelectedCall(null); };

  const missedCalls = calls.filter(c => c.status === "missed");
  const activeCalls = calls.filter(
    c => c.status === "assigned" || c.status === "in_progress"
  );
  const availableAgents = agents.filter(a => a.status === "available");
  const isLoading = agentsLoading || callsLoading;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 scroll-smooth">
      <Sidebar />

      <div className="flex-1 overflow-y-auto">

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-slate-400">Loading dashboard...</p>
            </div>
          </div>
        )}

        {/* Missed Call Detail */}
        {!isLoading && selectedCall && (
          <MissedCallDetail
            call={selectedCall}
            onBack={() => setSelectedCall(null)}
            onCallback={handleCallback}
          />
        )}

        {/* Main Dashboard */}
        {!isLoading && !selectedCall && (
          <div className="p-6">

            {/* Header */}
            <div className="mb-6">
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Operations</p>
              <h1 className="text-2xl font-bold text-slate-800">Call Center Dashboard</h1>
            </div>

            {/* Stat Cards — shown for Agents & Missed tabs only */}
            {activeTab !== "timelogs" && (
              <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Total Agents", value: agents.length, icon: "🧍", bg: "bg-blue-50" },
                  { label: "Available", value: availableAgents.length, icon: "✅", bg: "bg-emerald-50" },
                  { label: "Active Calls", value: activeCalls.length, icon: "📞", bg: "bg-violet-50" },
                  { label: "Missed Calls", value: missedCalls.length, icon: "❌", bg: "bg-red-50" },
                ].map(s => (
                  <div key={s.label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">{s.label}</p>
                      <p className="text-3xl font-bold text-slate-800">{s.value}</p>
                    </div>
                    <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center text-lg`}>{s.icon}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Agent Login Times */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm mb-6">

              <h2 className="text-sm font-semibold text-slate-700 mb-3">
                Agent Login Activity
              </h2>

              <div className="grid grid-cols-4 gap-4">
                {agents.map(agent => (
                  <div key={agent._id} className={`p-3 border rounded-lg ${agent.loginTime ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>

                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-2 h-2 rounded-full ${agent.loginTime ? "bg-green-500" : "bg-red-500"}`} />
                      <p className="text-sm font-medium text-slate-700">
                        {agent.name}
                      </p>
                    </div>

                    <p className={`text-xs font-semibold ${agent.loginTime ? "text-green-600" : "text-red-600"}`}>
                      {agent.loginTime
                        ? `Online since ${new Date(agent.loginTime).toLocaleTimeString()}`
                        : "Offline"}
                    </p>

                    <div className="mt-2 text-xs space-y-1">

                      {agent.loginHistory?.length > 0 ? (
                        agent.loginHistory.slice(-2).reverse().map((log, i) => (
                          <div key={i} className="bg-white p-2 rounded border border-slate-100">

                            <p className="text-gray-500">
                              <span className="font-semibold">Login:</span> {new Date(log.loginTime).toLocaleTimeString()}
                            </p>

                            <p>
                              {log.logoutTime
                                ? new Date(log.logoutTime).toLocaleTimeString()
                                : "Active"}
                            </p>

                            <p className="text-blue-600 font-medium">
                              ⏱ {log.durationMinutes ?? 0} min
                            </p>

                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-[11px]">No session history</p>
                      )}

                    </div>


                  </div>
                ))}
              </div>

            </div>

            {/* Tab Bar */}
            <div className="flex gap-1 bg-white border border-slate-100 rounded-xl p-1 w-fit mb-6 shadow-sm">
              {TABS.map(tab => {
                const isActive = activeTab === tab.id;
                const showBadge = tab.id === "missed" && missedCalls.length > 0;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all
                      ${isActive
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                      }`}
                  >
                    <span>{tab.icon}</span>
                    {tab.label}
                    {showBadge && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold
                        ${isActive ? "bg-white/20 text-white" : "bg-red-100 text-red-600"}`}>
                        {missedCalls.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Agents Tab */}
            {activeTab === "agents" && (
              <AgentsPanel
                agents={agents}
                availableCount={availableAgents.length}
                onToggleBreak={(id) => dispatch(toggleBreak(id))}
                onViewLogs={(agent) => {
                  setAgentsTabSelectedAgent(agent);
                  setAgentsTabLogsDate("");
                }}
              />
            )}

            {/* Time Logs Tab — self-contained, manages its own popup */}
            {activeTab === "timelogs" && (
              <TimeLogsTab agents={agents} />
            )}
            <CallPanel agents={agents} />

            {/* Missed Calls Tab */}
            {activeTab === "missed" && (
              <MissedCallsPanel
                calls={missedCalls}
                onSelect={setSelectedCall}
              />
            )}

          </div>
        )}
      </div>

      {/*
        Agents tab modal — AgentBreakLogs uses createPortal internally
        so it renders into document.body as a true full-screen popup.
        Placed outside tab blocks so it doesn't unmount on tab switch.
      */}
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