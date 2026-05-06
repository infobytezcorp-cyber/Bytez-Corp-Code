import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/dashboards/Sidebar";
import ModulesPage from "./ModulesPage";
import AddUser from "../pages/Register";
import API from "../services/api";
import { ENQUIRY_STAGES } from "../constants/enquiryConstants";

const STAGE_LABELS = [
  { stage: ENQUIRY_STAGES.NEW, label: "New Enquiry", color: "border-emerald-500" },
  // { stage: ENQUIRY_STAGES.CONTACT, label: "Contact", color: "border-indigo-500" },
  { stage: ENQUIRY_STAGES.PITCHING, label: "Pitching", color: "border-amber-500" },
  { stage: ENQUIRY_STAGES.ENROLLED, label: "Enrolled", color: "border-teal-500" },
  { stage: "Converted", label: "Converted", color: "border-violet-500" },
];

const COMPLETED_CLIENTS_STAGE = { stage: "Closed Clients", label: "Closed Clients", color: "border-teal-500" };

export default function Admin() {
  const [showModules, setShowModules] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [counts, setCounts] = useState({});
  const [stageData, setStageData] = useState([]);
  const [leadData, setLeadData] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [agents, setAgents] = useState([]);
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCounts = async () => {
      setLoading(true);

      try {
        const [stageResponse, leadResponse, completedClientsResponse, agentResponse, callsResponse] = await Promise.all([
          API.get("/enquiries/counts"),
          API.get("/enquiries/counts", {
            params: {
              groupBy: "lead",
            },
          }),
          API.get("/enquiries", {
            params: {
              stage: ENQUIRY_STAGES.ENROLLED,
              taskStatus: "Completed",
            },
          }),
          API.get("/agents"),
          API.get("/calls"),
        ]);

        const stageData = stageResponse.data || [];
        const leadData = leadResponse.data || [];
        const completedClientsData = completedClientsResponse.data || [];
        const agentData = agentResponse.data?.data || agentResponse.data || [];
        const callsData = callsResponse.data?.data || callsResponse.data || [];
        const countsObject = {};
        stageData.forEach((item) => {
          countsObject[item._id] = item.count;
        });

        setCounts(countsObject);
        setStageData(stageData);
        setLeadData(leadData);
        setTasks(completedClientsData);
        setAgents(agentData);
        setCalls(callsData);
      } catch (err) {
        console.error("Failed to load dashboard counts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCounts();
  }, []);

  const totalCount = stageData.reduce((sum, item) => sum + (item.count || 0), 0);
  const pendingLeadsCount = counts[ENQUIRY_STAGES.NEW] || 0;
  const openLeadsCount = (counts[ENQUIRY_STAGES.CONTACT] || 0) + (counts[ENQUIRY_STAGES.PITCHING] || 0);
  const completedClientsCount = tasks.filter((task) => task.taskStatus === "Completed" && task.assignedTo).length;
  const connectedCount = loading ? 0 : openLeadsCount + completedClientsCount;
  const connectedPercentage = totalCount > 0 ? Math.min(100, Math.max(0, (connectedCount / totalCount) * 100)) : 0;
  const connectedRatio = connectedPercentage.toFixed(2);
  const activeAgentsCount = agents.filter((agent) => agent.status === "available").length;
  const breakAgentsCount = agents.filter((agent) => agent.status === "break").length;
  const busyAgentsCount = agents.filter((agent) => agent.status === "busy").length;
  const callCount = calls.length;
  const answeredCount = calls.filter((call) => call.status === "completed").length;
  const missedCount = calls.filter((call) => call.status === "missed").length;

  const dashboardStages = [
    ...STAGE_LABELS,
    ...stageData
      .filter(
        (item) =>
          !STAGE_LABELS.some((label) => label.stage === item._id)
      )
      .map((item) => ({ stage: item._id, label: item._id, color: "border-slate-400" })),
    COMPLETED_CLIENTS_STAGE,
  ];

  const getStageCount = (stage) => {
    if (stage === "Closed Clients") {
      return completedClientsCount;
    }
    return counts[stage] || 0;
  };

  return (
    <div className="flex h-screen bg-[#F8F9FB]">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white px-8 py-4 flex items-center justify-between border-b border-gray-100">
          <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
          <div className="flex gap-3">
            <button onClick={() => setShowModules(true)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-md border hover:bg-gray-100">Modules</button>
            <button onClick={() => setOpenForm(true)} className="px-4 py-2 text-sm font-medium text-white bg-[#7B42BC] rounded-md hover:bg-[#6836A3] transition-colors">+ Create User</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {showModules ? (
            <ModulesPage setShowModules={setShowModules} />
          ) : (
            <div className="max-w-[1600px] mx-auto space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div className="lg:col-span-9 space-y-6">
                  <div className="grid grid-cols-1 xl:grid-cols-9 gap-6 items-stretch">
                    <div className="xl:col-span-5 bg-white rounded-[32px] border border-slate-200 shadow-sm p-6 h-full flex flex-col">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-slate-700 mt-6 mb-2 uppercase tracking-wider">Call Overview</h3>
                          <p className="text-sm text-slate-500 mt-1">Connected rate and total enquiries</p>
                        </div>

                        <button
                          onClick={() => navigate("/EnquiryCalls")}
                          className="h-11 rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-[#7B42BC] shadow-sm transition hover:border-[#7B42BC] hover:bg-purple-50"
                        >
                          View Report
                        </button>
                      </div>

                      <div className="flex flex-1 flex-col items-center justify-center gap-6 pt-7">
                        <div className="relative h-40 w-full max-w-[340px]">
                          <svg className="h-full w-full overflow-visible" viewBox="0 0 260 150" fill="none">
                            <path d="M 35 125 A 95 95 0 0 1 225 125" stroke="#E2E8F0" strokeWidth="20" strokeLinecap="round" pathLength="100" />
                            <path
                              d="M 35 125 A 95 95 0 0 1 225 125"
                              stroke="#7B42BC"
                              strokeWidth="20"
                              strokeLinecap="round"
                              pathLength="100"
                              strokeDasharray="100"
                              strokeDashoffset={100 - connectedPercentage}
                              className="transition-all duration-1000 ease-out"
                            />
                          </svg>
                          <div className="absolute inset-x-0 top-[72px] flex flex-col items-center text-center">
                            <span className="text-3xl font-semibold text-slate-900">{connectedRatio}%</span>
                            <span className="mt-1 text-xs uppercase tracking-[0.28em] text-slate-400">Connected</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 w-full">
                          <div className="rounded-3xl bg-slate-50 p-4 shadow-sm">
                            <p className="text-xs text-slate-500 uppercase tracking-[0.18em]">Connected</p>
                            <p className="mt-3 text-2xl font-semibold text-slate-900">{connectedCount}</p>
                          </div>
                          <div className="rounded-3xl bg-slate-50 p-4 shadow-sm">
                            <p className="text-xs text-slate-500 uppercase tracking-[0.18em]">Total</p>
                            <p className="mt-3 text-2xl font-semibold text-slate-900">{totalCount}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="xl:col-span-4 bg-white rounded-[32px] border border-slate-200 shadow-sm p-6 h-full flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-sm font-bold text-slate-700 mt-6 mb-2 uppercase tracking-wider">Agent Activity</h3>
                          <p className="text-sm text-slate-500 mt-1">Live agent availability</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div className="rounded-[32px] border border-slate-200 bg-emerald-50/20 p-5 flex items-center gap-4">
                          <div className="h-14 w-14 rounded-3xl bg-emerald-50 flex items-center justify-center shadow-sm">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M3 21c0-3.866 3.134-7 7-7h1a3 3 0 1 0 0-6h-1a7 7 0 1 1 0 14H3Z" stroke="#047857" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M10 7c.828 0 1.5-.672 1.5-1.5S10.828 4 10 4s-1.5.672-1.5 1.5S9.172 7 10 7Z" stroke="#047857" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Active Agents</p>
                            <p className="mt-3 text-3xl font-semibold text-slate-900">{activeAgentsCount}</p>
                            <p className="text-xs text-slate-400 mt-1">of {agents.length} total</p>
                          </div>
                        </div>

                        <div className="rounded-[32px] border border-slate-200 bg-amber-50/20 p-5 flex items-center gap-4">
                          <div className="h-14 w-14 rounded-3xl bg-amber-50 flex items-center justify-center shadow-sm">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M8 18h8" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" />
                              <path d="M7 18c0-2.761 1.343-5 3-5h4c1.657 0 3 2.239 3 5" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" />
                              <path d="M8 8h8v4H8z" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M10 12V8" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">On-break Agents</p>
                            <p className="mt-3 text-3xl font-semibold text-slate-900">{breakAgentsCount}</p>
                            <p className="text-xs text-slate-400 mt-1">of {agents.length} total</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-6">
                    <h3 className="text-sm font-bold text-slate-700 mt-6 mb-2 uppercase tracking-wider">Quick Access</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: "Visitor", path: "/visitorpage", icon: <i className='fas fa-user text-orange-400 text-xl'></i> },
                        { label: "Enquiries", path: "/enquiry", icon: <i className='fas fa-question-circle text-blue-500 text-xl'></i> },
                        { label: "Call Center", path: "/EnquiryCalls", icon: <i className='fas fa-phone-alt text-green-500 text-xl'></i> },
                        { label: "Analytics", path: "/analytics", icon: <i className='fas fa-chart-bar text-purple-500 text-xl'></i> },
                        { label: "HR Staff", path: "/staff", icon: <i className='fas fa-users text-pink-500 text-xl'></i> },
                        { label: "Tasks", path: "/tasks", icon: <i className='fas fa-tasks text-yellow-500 text-xl'></i> },
                        { label: "Settings", path: "/settings", icon: <i className='fas fa-cog text-gray-500 text-xl'></i> },
                      ].map((item) => (
                        <button
                          key={item.path}
                          onClick={() => navigate(item.path)}
                          className="bg-white p-4 rounded-xl border border-gray-200 hover:border-[#7B42BC] hover:shadow-md transition-all group text-center"
                        >
                          <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700 group-hover:text-white transition-colors">
                            {item.icon}
                          </div>
                          <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider">{item.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-3 bg-white rounded-[32px] border border-slate-200 shadow-sm p-4 overflow-hidden h-full flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="ttext-sm font-bold text-slate-700 mt-6 mb-2 uppercase tracking-wider">Leads by Stage</h3>
                      <p className="text-sm text-slate-500 mt-1">Stage-wise funnel distribution</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {dashboardStages.map((item) => {
                      const stageCount = getStageCount(item.stage);
                      const percentage = totalCount > 0 ? ((stageCount / totalCount) * 100).toFixed(1) : 0;

                      return (
                        <div key={item.stage} className="space-y-2">
                          {/* Add Client Report Heading only before Closed Clients */}
                          {item.stage === "Closed Clients" && (
                            <h4 className="text-sm font-bold text-slate-700 mt-6 mb-2 uppercase tracking-wider">
                              Client Report
                            </h4>
                          )}

                          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 flex flex-col gap-3 shadow-sm">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-2xl font-semibold text-slate-900">{stageCount}</p>
                                <p className="text-sm text-slate-500">{item.label}</p>
                              </div>
                              <p className="text-sm font-medium text-slate-400">{percentage}%</p>
                            </div>

                            {/* Percentage Line (Progress Bar) */}
                            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-1000 ${
                                  item.color.includes('emerald') ? 'bg-emerald-500' : 
                                  item.color.includes('amber') ? 'bg-amber-500' : 
                                  item.color.includes('teal') ? 'bg-teal-500' : 'bg-slate-400'
                                }`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {openForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setOpenForm(false)}>
            <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl mx-4" onClick={(event) => event.stopPropagation()}>
              <AddUser onClose={() => setOpenForm(false)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
