import { useState } from "react";
import Sidebar from "../components/dashboards/Sidebar";
import Visitors from "../components/dashboards/visitors/Visitors";
import NursingRecordsView from "../components/dashboards/visitors/NursingRecordsView";
import WatchmanRecordsView from "../components/dashboards/visitors/WatchmanRecordsView";
import AddUser from "../pages/Register";
import JobEnquiry from "../components/dashboards/jonenquiry/JobEnquiry";
import NormalEnquiry from "../components/dashboards/jonenquiry/NormalEnquiry";
import ElderCare from "../components/dashboards/jonenquiry/ElderCare";
import HomeCare from "../components/dashboards/jonenquiry/HomeCare";
import AdminRecordsView from "../components/dashboards/AdminRecordsView";
import StockMonitorView from "../components/dashboards/StockMonitorView";
import { eldercare, enquiry, homecare, job, visitors_logs } from "../utils/icons";
import { UserPlus, ClipboardList, HeartPulse, Shield, Package } from "lucide-react";

// ─── Tab definitions ──────────────────────────────────────────────────────────

const BASE_TABS = [
  { key: "visitors",    label: "Visitor Log",      icon: visitors_logs, colorClass: "text-blue-600   border-blue-600" },
  { key: "jobs",        label: "Job Enquiries",    icon: job,           colorClass: "text-emerald-600 border-emerald-600" },
  { key: "clients",     label: "Normal Enquiry",   icon: enquiry,       colorClass: "text-orange-500  border-orange-500" },
  { key: "eldercare",   label: "Elder Care",       icon: eldercare,     colorClass: "text-yellow-600  border-yellow-600" },
  { key: "homecare",    label: "Home Care",        icon: homecare,      colorClass: "text-teal-600    border-teal-600" },
];

const ADMIN_TABS = [
  {
    key: "nursingview", label: "Nursing Records",
    icon: <HeartPulse className="w-3.5 h-3.5" />,
    colorClass: "text-rose-500 border-rose-500",
    pill: "Nursing",
    pillColor: "bg-rose-50 text-rose-600",
  },
  {
    key: "watchmanview", label: "Watchman Logs",
    icon: <Shield className="w-3.5 h-3.5" />,
    colorClass: "text-amber-500 border-amber-500",
    pill: "Watchman",
    pillColor: "bg-amber-50 text-amber-700",
  },
  {
    key: "adminrecordsview", label: "Admin Records",
    icon: <ClipboardList className="w-3.5 h-3.5" />,
    colorClass: "text-indigo-600 border-indigo-600",
    pill: "Admin",
    pillColor: "bg-indigo-50 text-indigo-700",
  },
  {
    key: "stockmonitor", label: "Stock Monitor",
    icon: <Package className="w-3.5 h-3.5" />,
    colorClass: "text-emerald-600 border-emerald-600",
    pill: "Stock",
    pillColor: "bg-emerald-50 text-emerald-700",
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function VisitorPage() {
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("visitors");
  const userRole = localStorage.getItem("role");
  const isPrivileged = userRole === "admin" || userRole === "manager";

  const allTabs = isPrivileged ? [...BASE_TABS, ...ADMIN_TABS] : BASE_TABS;
  const activeTabMeta = allTabs.find((t) => t.key === activeTab);

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* ── Top Bar ── */}
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shrink-0 z-10">
          <div>
            <h1 className="text-sm font-semibold text-slate-900 leading-tight">Visitor Dashboard</h1>
            <p className="text-xs text-slate-400 mt-0.5">Manage visitors, enquiries &amp; institutional records</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-sm hover:bg-slate-700 active:scale-95 transition-all"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Create User
          </button>
        </header>

        {/* ── Tab Bar ── */}
        <nav className="no-scrollbar bg-white border-b border-slate-200 px-6 flex items-end gap-0 shrink-0 overflow-x-auto overflow-y-hidden">
          {allTabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex items-center gap-2 px-4 py-3.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? `${tab.colorClass} bg-transparent`
                    : "border-transparent text-slate-400 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                {typeof tab.icon === "string"
                  ? <span className="text-[13px]">{tab.icon}</span>
                  : tab.icon
                }
                {tab.label}
                {tab.pill && (
                  <span className={`hidden sm:inline rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${tab.pillColor}`}>
                    {tab.pill}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* ── Content Area ── */}
        <main className="no-scrollbar flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          {activeTab === "visitors"         && <Visitors />}
          {activeTab === "jobs"             && <JobEnquiry />}
          {activeTab === "clients"          && <NormalEnquiry />}
          {activeTab === "nursingview"      && <NursingRecordsView />}
          {activeTab === "watchmanview"     && <WatchmanRecordsView />}
          {activeTab === "adminrecordsview" && <AdminRecordsView />}
          {activeTab === "stockmonitor"     && <StockMonitorView />}
          {activeTab === "eldercare"        && <ElderCare />}
          {activeTab === "homecare"         && <HomeCare />}
        </main>
      </div>

      {/* ── Create User Modal ── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200 w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <AddUser onClose={() => setShowModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
