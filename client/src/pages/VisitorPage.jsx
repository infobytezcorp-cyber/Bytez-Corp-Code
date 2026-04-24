import { useState } from "react";
import Sidebar from "../components/dashboards/visitors/Sidebar";
import Visitors from "../components/dashboards/visitors/Visitors";
import AddUser from "../pages/Register";
import JobEnquiry from "../components/dashboards/jonenquiry/JobEnquiry";
import NormalEnquiry from "../components/dashboards/jonenquiry/NormalEnquiry";
import ElderCare from "../components/dashboards/jonenquiry/ElderCare";
import HomeCare from "../components/dashboards/jonenquiry/HomeCare";
import ModulePage from "./ModulesPage";

const TABS = [
  {
    key: "visitors",
    label: "Visitor Log",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    key: "jobs",
    label: "Job Enquiries",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
    ),
  },
  {
    key: "clients",
    label: "Normal Enquiry",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    key: "eldercare",
    label: "Elder Care",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M8 7a4 4 0 1 1 8 0c0 2.5-4 6-4 6s-4-3.5-4-6z" />
        <circle cx="12" cy="7" r="1.5" />
        <path d="M6 21h12" />
      </svg>
    ),
  },
  {
    key: "homecare",
    label: "Home Care",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M3 10l9-7 9 7" />
        <path d="M9 21V12h6v9" />
      </svg>
    ),
  }

];

const TAB_ACTIVE_STYLES = {
  visitors: "border-blue-600 text-blue-600",
  jobs: "border-green-600 text-green-600",
  clients: "border-orange-500 text-orange-500",
  eldercare: "border-yellow-500 text-yellow-500",
  homecare: "border-purple-500 text-perple-500"
};

export default function VisitorPage() {
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("visitors");



  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── Top Bar ── */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between">

          <div>
            <h1 className="text-base font-semibold text-gray-900">
              Visitor Dashboard
            </h1>
            <p className="text-xs text-gray-400">
              Manage visitors, job & enquiries
            </p>
          </div>

          <div className="flex gap-2">

            {/* Create User */}
            <button
              onClick={() => setShowModal(true)}
              className="bg-gray-900 text-white text-xs px-4 py-2 rounded-lg"
            >
              + Create User
            </button>

          </div>
        </div>

        {/* ── Tab Bar ── */}
        <div className="bg-white border-b border-gray-100 px-6 flex gap-0 shrink-0">
          {activeTab !== "modules" && (
            <div className="bg-white border-b border-gray-100 px-6 flex gap-0 shrink-0">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-colors cursor-pointer ${activeTab === tab.key
                    ? TAB_ACTIVE_STYLES[tab.key]
                    : "border-transparent text-gray-400 hover:text-gray-600"
                    }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "visitors" && <Visitors />}
          {activeTab === "jobs" && <JobEnquiry />}
          {activeTab === "clients" && <NormalEnquiry />}
          {activeTab === "eldercare" && <ElderCare />}
          {activeTab === "homecare" && <HomeCare />}
          {activeTab === "modules" && (
            <ModulePage setActiveTab={setActiveTab} />
          )}

        </div>
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-[700px] overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <AddUser onClose={() => setShowModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
}