// src/pages/StaffPortal.jsx
// Route: /staff
// This is the ONLY component you need to route to — handles login/dashboard switching

import React from "react";
import { useSelector } from "react-redux";
import StaffLoginPage from "./StaffLoginPage";
import StaffTaskDashboard from "./StaffTaskDashboard";

export default function StaffPortal() {
  const { staffSession } = useSelector((s) => s.tasks);
  return staffSession ? <StaffTaskDashboard /> : <StaffLoginPage />;
}

// ─── SETUP CHECKLIST ─────────────────────────────────────────────────────────
//
// 1. store.js — add taskReducer:
//    import taskReducer from "./features/taskSlice";
//    reducer: { hr: hrReducer, tasks: taskReducer }
//
// 2. App.jsx / Router — add routes:
//    import StaffPortal from "./pages/StaffPortal";
//    import AdminTaskPage from "./pages/AdminTaskPage";
//    <Route path="/staff" element={<StaffPortal />} />
//    <Route path="/admin/tasks" element={<AdminTaskPage />} />
//
// 3. Sidebar — add Task Management with dropdown:
//    See Sidebar_SNIPPET.jsx for exact code to paste
//
// 4. Login credentials:
//    Username = Employee ID (from HR module, e.g. HC001)
//    Password = Last 6 digits of registered mobile number
//    Example: mobile +91 9876543210 → password 543210
