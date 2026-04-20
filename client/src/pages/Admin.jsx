import { useState } from "react";
import Sidebar from "../components/dashboards/visitors/Sidebar";
import ModulesPage from "./ModulesPage";
import AddUser from "../pages/Register";

export default function Admin() {
  const [showModules, setShowModules] = useState(false);
  const [openForm, setOpenForm] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col">

        {/* 🔹 Top Bar */}
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

            {/* Modules Button */}
            <button
              onClick={() => setShowModules(true)}
              className="bg-blue-600 text-white text-xs px-4 py-2 rounded-lg"
            >
              Modules
            </button>

            {/* ✅ FIXED Create User */}
            <button
              onClick={() => setOpenForm(true)}
              className="bg-gray-900 text-white text-xs px-4 py-2 rounded-lg"
            >
              + Create User
            </button>

          </div>
        </div>

        {/* 🔹 Content */}
        <div className="flex-1 p-6 overflow-y-auto">

          {/* Module Page */}
          {showModules ? (
            <ModulesPage setShowModules={setShowModules} />
          ) : (
            <div className="text-gray-400 text-sm">
              Welcome to Admin Dashboard
            </div>
          )}

        </div>

        {/* 🔹 Modal Form (outside content for better overlay) */}
        {openForm && (
          <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            onClick={() => setOpenForm(false)}
          >
            <div
              className="bg-white rounded-2xl w-[700px] overflow-hidden shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <AddUser onClose={() => setOpenForm(false)} />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}