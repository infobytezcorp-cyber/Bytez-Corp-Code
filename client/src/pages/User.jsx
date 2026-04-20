import { useNavigate } from "react-router-dom";
import { logout } from "../utils/auth";
import { useState } from "react";
import Visitors from "../components/dashboards/visitors/Visitors";
import Sidebar from "../components/dashboards/visitors/Sidebar";

export default function User() {
  const [activeTab, setActiveTab] = useState("visitors");
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

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
  ];
  const TAB_ACTIVE_STYLES = {
    visitors: "border-blue-600 text-blue-600 cursor-pointer",
  }
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── Top Bar ── */}
        <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-base font-semibold text-gray-900">Visitor Dashboard</h1>
            <p className="text-xs text-gray-400 mt-0.5">Manage visitors logs</p>
          </div>

          <button
            onClick={() => navigate("/visitor?source=employee")}
            className="bg-black text-white text-xs px-4 py-2 rounded-lg"
          >
            + Create User
          </button>
        </div>

        {/* ── Tab Bar ── */}
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

        {/* 🔹 Content */}
        <div className="flex-1 overflow-y-auto p-6">

          {activeTab === "visitors" && <Visitors />}

        </div>

      </div>
    </div>
  );
}