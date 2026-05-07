import { useState } from "react";
import Sidebar from "../components/dashboards/Sidebar";
import Visitors from "../components/dashboards/visitors/Visitors";
import AddUser from "../pages/Register";
import JobEnquiry from "../components/dashboards/jonenquiry/JobEnquiry";
import NormalEnquiry from "../components/dashboards/jonenquiry/NormalEnquiry";
import ElderCare from "../components/dashboards/jonenquiry/ElderCare";
import HomeCare from "../components/dashboards/jonenquiry/HomeCare";
import ModulePage from "./ModulesPage";
import { eldercare, enquiry, homecare, job, visitors_logs } from "../utils/icons";

const TABS = [
  {
    key: "visitors",
    label: "Visitor Log",
    icon: visitors_logs,
  },
  {
    key: "jobs",
    label: "Job Enquiries",
    icon: job,
  },
  {
    key: "clients",
    label: "Normal Enquiry",
    icon: enquiry,
  },
  {
    key: "eldercare",
    label: "Elder Care",
    icon: eldercare
  },
  {
    key: "homecare",
    label: "Home Care",
    icon: homecare
  }

];

const TAB_ACTIVE_STYLES = {
  visitors: "border-blue-600 text-blue-600",
  jobs: "border-green-600 text-green-600",
  clients: "border-orange-500 text-orange-500",
  eldercare: "border-yellow-500 text-yellow-500",
  homecare: "border-black-500 text-black-500"
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