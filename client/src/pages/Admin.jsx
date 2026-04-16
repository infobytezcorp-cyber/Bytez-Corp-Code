import { useState } from "react";
import Sidebar from "../components/dashboards/visitors/Sidebar";
import Visitors from "../components/dashboards/visitors/Visitors";
import AddUser from "../pages/Register"; // 👈 create this
import JobEnquiry from "../components/dashboards/jonenquiry/JobEnquiry";

export default function Admin() {
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("visitors");

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      {/* sidebar uuuuu*/}

      <div className="flex-1 p-6 overflow-y-auto">

        {/* 🔥 TOP BAR */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Visitor Dashboard</h1>

          <button
            onClick={() => setShowModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            + Create User
          </button>
        </div>

        <div className="flex gap-4 mb-6">

          <button
            onClick={() => setActiveTab("visitors")}
            className={`px-4 py-2 rounded-lg ${activeTab === "visitors"
              ? "bg-blue-600 text-white"
              : "bg-white shadow"
              }`}
          >
            Visitor Log
          </button>

          <button
            onClick={() => setActiveTab("jobs")}
            className={`px-4 py-2 rounded-lg ${activeTab === "jobs"
              ? "bg-green-600 text-white"
              : "bg-white shadow"
              }`}
          >
            Job Enquiries
          </button>

          <button
            onClick={() => setActiveTab("clients")}
            className={`px-4 py-2 rounded-lg ${activeTab === "clients"
              ? "bg-orange-600 text-white"
              : "bg-white shadow"
              }`}
          >
            Clients
          </button>

        </div>

        {activeTab === "visitors" && <Visitors />}
        {activeTab === "jobs" && <JobEnquiry />}
        {activeTab === "clients" && <h2>Clients Data Coming Soon</h2>}

        {/* 🔥 MODAL */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" >
            <div className="p-6 rounded-xl w-[700px] relative">

              {/* Form */}
              <AddUser onClose={() => setShowModal(false)} />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}