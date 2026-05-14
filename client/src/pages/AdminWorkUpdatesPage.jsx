// import React, { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import {
//   fetchAllUpdates,
//   approveWorkUpdate,
//   rejectWorkUpdate,
//   fetchDailyAnalytics,
//   fetchMissedUpdateAlerts,
//   setSelectedUpdate,
//   clearError,
//   clearSuccess
// } from '../features/workUpdateSlice';

// const AdminWorkUpdatesPage = () => {
//   const dispatch = useDispatch();
//   const { allUpdates, stats, missedAlerts, loading, error, successMessage, selectedUpdate } = useSelector(
//     state => state.workUpdates
//   );

//   const [filters, setFilters] = useState({
//     status: 'all',
//     staffEmpId: '',
//     startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
//     endDate: new Date().toISOString().split('T')[0],
//     limit: 50,
//     skip: 0
//   });

//   const [showRejectModal, setShowRejectModal] = useState(false);
//   const [rejectReason, setRejectReason] = useState('');
//   const [rejectingId, setRejectingId] = useState(null);

//   // Fetch updates on mount and when filters change
//   useEffect(() => {
//     dispatch(fetchAllUpdates(filters));
//     dispatch(fetchMissedUpdateAlerts({ staffEmpId: filters.staffEmpId || undefined }));
//   }, [filters, dispatch]);

//   // Auto-clear messages
//   useEffect(() => {
//     if (successMessage) {
//       const timer = setTimeout(() => dispatch(clearSuccess()), 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [successMessage, dispatch]);

//   const handleFilterChange = (key, value) => {
//     setFilters(prev => ({
//       ...prev,
//       [key]: value,
//       skip: 0 // Reset pagination
//     }));
//   };

//   const handleApprove = async (updateId) => {
//     if (window.confirm('Approve this work update?')) {
//       await dispatch(approveWorkUpdate({
//         updateId,
//         reviewedBy: null,
//         remarks: 'Approved by admin'
//       }));
//       dispatch(fetchAllUpdates(filters));
//     }
//   };

//   const handleRejectClick = (updateId) => {
//     setRejectingId(updateId);
//     setShowRejectModal(true);
//   };

//   const handleSubmitReject = async () => {
//     if (!rejectReason.trim()) {
//       alert('Please enter a reason for rejection');
//       return;
//     }

//     await dispatch(rejectWorkUpdate({
//       updateId: rejectingId,
//       reviewedBy: null,
//       remarks: rejectReason
//     }));

//     setShowRejectModal(false);
//     setRejectReason('');
//     setRejectingId(null);
//     dispatch(fetchAllUpdates(filters));
//   };

//   const getStatusBadgeColor = (status) => {
//     switch (status) {
//       case 'Approved':
//         return 'bg-green-100 text-green-800 border border-green-300';
//       case 'Rejected':
//         return 'bg-red-100 text-red-800 border border-red-300';
//       default:
//         return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
//     }
//   };

//   const getWorkTypeIcon = (workType) => {
//     const icons = {
//       'Patient Visit': '👤',
//       'Call': '☎️',
//       'Documentation': '📋',
//       'Travel': '🚗',
//       'Other': '📌'
//     };
//     return icons[workType] || '📌';
//   };

//   return (
//     <div className="bg-gray-50 min-h-screen p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-4xl font-bold text-gray-900 mb-2">📊 Staff Work Updates</h1>
//           <p className="text-gray-600">Review and manage hourly work updates from staff</p>
//         </div>

//         {/* Messages */}
//         {error && (
//           <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg flex justify-between items-center">
//             <span>❌ {error}</span>
//             <button
//               onClick={() => dispatch(clearError())}
//               className="text-red-700 font-bold hover:text-red-900"
//             >
//               ✕
//             </button>
//           </div>
//         )}

//         {successMessage && (
//           <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
//             ✅ {successMessage}
//           </div>
//         )}

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
//           <div className="bg-white rounded-lg shadow p-6">
//             <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Updates</h3>
//             <p className="text-3xl font-bold text-gray-900">{stats.total || 0}</p>
//           </div>
//           <div className="bg-white rounded-lg shadow p-6">
//             <h3 className="text-sm font-semibold text-gray-600 mb-2">Pending</h3>
//             <p className="text-3xl font-bold text-yellow-600">{stats.pending || 0}</p>
//           </div>
//           <div className="bg-white rounded-lg shadow p-6">
//             <h3 className="text-sm font-semibold text-gray-600 mb-2">Approved</h3>
//             <p className="text-3xl font-bold text-green-600">{stats.approved || 0}</p>
//           </div>
//           <div className="bg-white rounded-lg shadow p-6">
//             <h3 className="text-sm font-semibold text-gray-600 mb-2">Rejected</h3>
//             <p className="text-3xl font-bold text-red-600">{stats.rejected || 0}</p>
//           </div>
//           <div className="bg-white rounded-lg shadow p-6 md:col-span-4 border-l-4 border-red-500">
//             <h3 className="text-sm font-semibold text-gray-600 mb-2">Missed Hourly Updates</h3>
//             <p className="text-3xl font-bold text-red-600">{stats.missedHourlyUpdates || missedAlerts.length || 0}</p>
//           </div>
//         </div>

//         {missedAlerts.length > 0 && (
//           <div className="bg-red-50 border border-red-200 rounded-lg p-5 mb-8">
//             <h3 className="font-bold text-red-700 mb-3">Hourly update alerts</h3>
//             <div className="space-y-2">
//               {missedAlerts.map((alert) => (
//                 <div key={`${alert.taskId}-${alert.staffEmpId}`} className="bg-white border border-red-100 rounded-lg px-4 py-3 text-sm">
//                   <p className="font-semibold text-red-700">{alert.staffName || alert.staffEmpId}</p>
//                   <p className="text-gray-700">{alert.message}</p>
//                   <p className="text-xs text-gray-500 mt-1">
//                     Last update: {alert.lastWorkUpdateAt ? new Date(alert.lastWorkUpdateAt).toLocaleString() : 'No update yet'} · {alert.minutesSinceUpdate || 0} min
//                   </p>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Filters */}
//         <div className="bg-white rounded-lg shadow p-6 mb-8">
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 Filters</h3>
//           <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
//             {/* Status Filter */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
//               <select
//                 value={filters.status}
//                 onChange={(e) => handleFilterChange('status', e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
//               >
//                 <option value="all">All</option>
//                 <option value="Pending">Pending</option>
//                 <option value="Approved">Approved</option>
//                 <option value="Rejected">Rejected</option>
//               </select>
//             </div>

//             {/* Staff EmpId Filter */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Staff ID</label>
//               <input
//                 type="text"
//                 placeholder="e.g., EMP001"
//                 value={filters.staffEmpId}
//                 onChange={(e) => handleFilterChange('staffEmpId', e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
//               />
//             </div>

//             {/* Start Date */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
//               <input
//                 type="date"
//                 value={filters.startDate}
//                 onChange={(e) => handleFilterChange('startDate', e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
//               />
//             </div>

//             {/* End Date */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
//               <input
//                 type="date"
//                 value={filters.endDate}
//                 onChange={(e) => handleFilterChange('endDate', e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
//               />
//             </div>

//             {/* Refresh */}
//             <div className="flex items-end">
//               <button
//                 onClick={() => dispatch(fetchAllUpdates(filters))}
//                 className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
//               >
//                 🔄 Refresh
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Updates List */}
//         <div className="bg-white rounded-lg shadow overflow-hidden">
//           {loading ? (
//             <div className="p-8 text-center text-gray-600">
//               <p>⏳ Loading updates...</p>
//             </div>
//           ) : allUpdates.length === 0 ? (
//             <div className="p-8 text-center text-gray-600">
//               <p>📭 No work updates found</p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead className="bg-gray-100 border-b border-gray-200">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Staff</th>
//                     <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Work Type</th>
//                     <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
//                     <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Duration</th>
//                     <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
//                     <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Submitted</th>
//                     <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-200">
//                   {allUpdates.map((update) => (
//                     <tr key={update._id} className="hover:bg-gray-50 transition">
//                       <td className="px-6 py-4">
//                         <div>
//                           <p className="font-semibold text-gray-900">{update.staffName}</p>
//                           <p className="text-sm text-gray-500">{update.staffEmpId}</p>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <span className="text-lg">
//                           {getWorkTypeIcon(update.workType)} {update.workType}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4">
//                         <p className="text-sm text-gray-700 max-w-xs truncate">
//                           {update.workDescription}
//                         </p>
//                       </td>
//                       <td className="px-6 py-4 text-center">
//                         <span className="font-semibold text-gray-900">
//                           {update.duration} min
//                         </span>
//                       </td>
//                       <td className="px-6 py-4">
//                         <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(update.status)}`}>
//                           {update.status}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 text-sm text-gray-600">
//                         {new Date(update.submittedAt).toLocaleString()}
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="flex gap-2">
//                           {update.status === 'Pending' && (
//                             <>
//                               <button
//                                 onClick={() => handleApprove(update._id)}
//                                 className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition"
//                               >
//                                 ✓ Approve
//                               </button>
//                               <button
//                                 onClick={() => handleRejectClick(update._id)}
//                                 className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition"
//                               >
//                                 ✕ Reject
//                               </button>
//                             </>
//                           )}
//                           <button
//                             onClick={() => dispatch(setSelectedUpdate(update))}
//                             className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition"
//                           >
//                             👁️ View
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Reject Modal */}
//       {showRejectModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-6 max-w-md w-full">
//             <h3 className="text-lg font-bold text-gray-900 mb-4">Reject Work Update</h3>
//             <textarea
//               value={rejectReason}
//               onChange={(e) => setRejectReason(e.target.value)}
//               placeholder="Enter reason for rejection..."
//               rows="4"
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
//             />
//             <div className="flex gap-2">
//               <button
//                 onClick={() => setShowRejectModal(false)}
//                 className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSubmitReject}
//                 className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
//               >
//                 Reject
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Detail View Modal */}
//       {selectedUpdate && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
//             <div className="flex justify-between items-start mb-4">
//               <h3 className="text-xl font-bold text-gray-900">Update Details</h3>
//               <button
//                 onClick={() => dispatch(setSelectedUpdate(null))}
//                 className="text-gray-600 hover:text-gray-900 font-bold text-xl"
//               >
//                 ✕
//               </button>
//             </div>

//             <div className="space-y-4">
//               <div>
//                 <p className="text-sm font-semibold text-gray-600">Staff</p>
//                 <p className="text-gray-900 font-semibold">
//                   {selectedUpdate.staffName} ({selectedUpdate.staffEmpId})
//                 </p>
//               </div>

//               <div>
//                 <p className="text-sm font-semibold text-gray-600">Work Description</p>
//                 <p className="text-gray-900">{selectedUpdate.workDescription}</p>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <p className="text-sm font-semibold text-gray-600">Duration</p>
//                   <p className="text-gray-900">{selectedUpdate.duration} minutes</p>
//                 </div>
//                 <div>
//                   <p className="text-sm font-semibold text-gray-600">Work Type</p>
//                   <p className="text-gray-900">{selectedUpdate.workType}</p>
//                 </div>
//               </div>

//               <div>
//                 <p className="text-sm font-semibold text-gray-600">Status</p>
//                 <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeColor(selectedUpdate.status)}`}>
//                   {selectedUpdate.status}
//                 </span>
//               </div>

//               {selectedUpdate.proofAttachments?.length > 0 && (
//                 <div>
//                   <p className="text-sm font-semibold text-gray-600 mb-2">Attachments</p>
//                   <div className="space-y-2">
//                     {selectedUpdate.proofAttachments.map((file, idx) => (
//                       <div key={idx} className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
//                         📎 {file.fileName}
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {selectedUpdate.adminRemarks && (
//                 <div>
//                   <p className="text-sm font-semibold text-gray-600">Admin Remarks</p>
//                   <p className="text-gray-900">{selectedUpdate.adminRemarks}</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminWorkUpdatesPage;

// src/pages/AdminWorkUpdatesPage.jsx
// Admin reviews all staff hourly work updates — with task linkage

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "../components/dashboards/Sidebar";
import {
  fetchAllUpdates,
  approveWorkUpdate,
  rejectWorkUpdate,
  fetchMissedUpdateAlerts,
  setSelectedUpdate,
  clearError,
  clearSuccess,
} from "../features/workUpdateSlice";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_STYLE = {
  Approved: "bg-green-100 text-green-700 border border-green-300",
  Rejected: "bg-red-100 text-red-700 border border-red-300",
  Pending:  "bg-yellow-100 text-yellow-700 border border-yellow-300",
};

const WORK_TYPE_ICON = {
  "Patient Visit":  "👤",
  Call:             "☎️",
  Documentation:    "📋",
  Travel:           "🚗",
  Other:            "📌",
};

const fmt = (date) =>
  date ? new Date(date).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";

// ─────────────────────────────────────────────────────────────────────────────
export default function AdminWorkUpdatesPage() {
  const dispatch = useDispatch();
  const {
    allUpdates,
    stats,
    missedAlerts,
    loading,
    error,
    successMessage,
    selectedUpdate,
  } = useSelector((s) => s.workUpdates);

  const [filters, setFilters] = useState({
    status: "all",
    staffEmpId: "",
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    limit: 50,
    skip: 0,
  });

  const [rejectModal, setRejectModal]   = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingId, setRejectingId]   = useState(null);
  const [expandedRow, setExpandedRow]   = useState(null);

  // ── Fetch on mount / filter change ────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchAllUpdates(filters));
    dispatch(fetchMissedUpdateAlerts({ staffEmpId: filters.staffEmpId || undefined }));
  }, [filters, dispatch]);

  // Auto-clear success
  useEffect(() => {
    if (!successMessage) return;
    const t = setTimeout(() => dispatch(clearSuccess()), 3000);
    return () => clearTimeout(t);
  }, [successMessage, dispatch]);

  const setFilter = (key, value) =>
    setFilters((p) => ({ ...p, [key]: value, skip: 0 }));

  // ── Approve ───────────────────────────────────────────────────────────────
  const handleApprove = async (id) => {
    if (!window.confirm("Approve this work update?")) return;
    await dispatch(approveWorkUpdate({ updateId: id, remarks: "Approved by admin" }));
    dispatch(fetchAllUpdates(filters));
  };

  // ── Reject ────────────────────────────────────────────────────────────────
  const handleRejectClick = (id) => {
    setRejectingId(id);
    setRejectReason("");
    setRejectModal(true);
  };

  const handleSubmitReject = async () => {
    if (!rejectReason.trim()) {
      alert("Please enter a rejection reason.");
      return;
    }
    await dispatch(
      rejectWorkUpdate({ updateId: rejectingId, remarks: rejectReason })
    );
    setRejectModal(false);
    dispatch(fetchAllUpdates(filters));
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ── Header ── */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">📊 Staff Work Updates</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Review hourly updates submitted by field staff
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ── Toast messages ── */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex justify-between">
              ❌ {error}
              <button onClick={() => dispatch(clearError())} className="font-bold">✕</button>
            </div>
          )}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700">
              ✅ {successMessage}
            </div>
          )}

          {/* ── KPI Cards ── */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: "Total",   value: stats?.total   || 0, color: "#2d6be4" },
              { label: "Pending", value: stats?.pending  || 0, color: "#f59e0b" },
              { label: "Approved",value: stats?.approved || 0, color: "#10b981" },
              { label: "Rejected",value: stats?.rejected || 0, color: "#ef4444" },
              { label: "⚠️ Missed Hourly", value: missedAlerts?.length || 0, color: "#dc2626", wide: true },
            ].map((c) => (
              <div
                key={c.label}
                className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-4 ${c.wide ? "md:col-span-1 border-l-4" : ""}`}
                style={c.wide ? { borderLeftColor: c.color } : {}}
              >
                <p className="text-xs text-gray-500 font-semibold mb-1">{c.label}</p>
                <p className="text-3xl font-black" style={{ color: c.color }}>{c.value}</p>
              </div>
            ))}
          </div>

          {/* ── Missed Alerts Banner ── */}
          {missedAlerts?.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <h3 className="font-bold text-red-700 mb-3 text-sm">
                ⚠️ Staff who missed hourly updates ({missedAlerts.length})
              </h3>
              <div className="space-y-2">
                {missedAlerts.map((a, i) => (
                  <div
                    key={i}
                    className="bg-white border border-red-100 rounded-xl px-4 py-3 text-sm flex items-start justify-between"
                  >
                    <div>
                      <p className="font-semibold text-red-700">
                        {a.staffName || a.staffEmpId}
                        <span className="text-gray-400 font-normal ml-2 text-xs">
                          {a.staffEmpId}
                        </span>
                      </p>
                      <p className="text-gray-600 text-xs mt-0.5">{a.message}</p>
                    </div>
                    <span className="text-xs text-red-500 font-bold whitespace-nowrap ml-3 mt-0.5">
                      {a.minutesSinceUpdate || 0} min ago
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Filters ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-700 mb-3">🔍 Filters</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilter("status", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-blue-400"
                >
                  <option value="all">All</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Staff ID</label>
                <input
                  type="text"
                  placeholder="EMP-HC-M001"
                  value={filters.staffEmpId}
                  onChange={(e) => setFilter("staffEmpId", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-blue-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilter("startDate", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-blue-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilter("endDate", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-blue-400"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => dispatch(fetchAllUpdates(filters))}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2 rounded-lg transition"
                >
                  🔄 Refresh
                </button>
              </div>
            </div>
          </div>

          {/* ── Updates Table ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Loading updates...</p>
                </div>
              </div>
            ) : allUpdates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <div className="text-5xl mb-3">📭</div>
                <p className="font-semibold">No work updates found</p>
                <p className="text-xs mt-1">Try changing the filters above</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {["Staff", "Task", "Work Type", "Description", "Duration", "Status", "Submitted", "Actions"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {allUpdates.map((u) => (
                      <React.Fragment key={u._id}>
                        <tr
                          className="hover:bg-gray-50 transition cursor-pointer"
                          onClick={() => setExpandedRow(expandedRow === u._id ? null : u._id)}
                        >
                          {/* Staff */}
                          <td className="px-4 py-3">
                            <p className="font-semibold text-gray-900">{u.staffName}</p>
                            <p className="text-xs text-gray-400">{u.staffEmpId}</p>
                          </td>

                          {/* Task */}
                          <td className="px-4 py-3">
                            {u.taskTitle ? (
                              <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full font-semibold">
                                {u.taskTitle}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-300">—</span>
                            )}
                          </td>

                          {/* Work Type */}
                          <td className="px-4 py-3">
                            <span className="text-sm">
                              {WORK_TYPE_ICON[u.workType] || "📌"} {u.workType}
                            </span>
                          </td>

                          {/* Description */}
                          <td className="px-4 py-3 max-w-xs">
                            <p className="text-gray-700 truncate">{u.workDescription}</p>
                          </td>

                          {/* Duration */}
                          <td className="px-4 py-3 text-center font-bold text-gray-900">
                            {u.duration} min
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${STATUS_STYLE[u.status] || STATUS_STYLE.Pending}`}>
                              {u.status}
                            </span>
                          </td>

                          {/* Submitted */}
                          <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                            {fmt(u.submittedAt)}
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3">
                            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                              {u.status === "Pending" && (
                                <>
                                  <button
                                    onClick={() => handleApprove(u._id)}
                                    className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded-lg font-bold transition"
                                  >
                                    ✓
                                  </button>
                                  <button
                                    onClick={() => handleRejectClick(u._id)}
                                    className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded-lg font-bold transition"
                                  >
                                    ✕
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => dispatch(setSelectedUpdate(u))}
                                className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-lg font-bold transition"
                              >
                                👁️
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* ── Expanded Row — full description + attachments ── */}
                        {expandedRow === u._id && (
                          <tr className="bg-blue-50">
                            <td colSpan={8} className="px-6 py-4">
                              <div className="space-y-2">
                                <p className="text-sm font-semibold text-gray-700">Full Description:</p>
                                <p className="text-sm text-gray-600 leading-relaxed bg-white rounded-xl px-4 py-3 border border-blue-100">
                                  {u.workDescription}
                                </p>

                                {u.proofAttachments?.length > 0 && (
                                  <div>
                                    <p className="text-sm font-semibold text-gray-700 mt-2 mb-1">
                                      📎 Attachments ({u.proofAttachments.length})
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                      {u.proofAttachments.map((att, i) =>
                                        att.fileType?.startsWith("image/") ? (
                                          <a
                                            key={i}
                                            href={att.data}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="block"
                                          >
                                            <img
                                              src={att.data}
                                              alt={att.fileName}
                                              className="w-20 h-20 object-cover rounded-lg border border-blue-200 hover:opacity-80 transition"
                                            />
                                          </a>
                                        ) : (
                                          <a
                                            key={i}
                                            href={att.data}
                                            download={att.fileName}
                                            className="flex items-center gap-1 bg-white border border-blue-200 rounded-lg px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-50 transition"
                                          >
                                            📄 {att.fileName}
                                          </a>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}

                                {u.adminRemarks && (
                                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-700">
                                    📌 Admin remarks: {u.adminRemarks}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Reject Modal ── */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-bold text-gray-900 text-lg mb-4">Reject Work Update</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              rows={4}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-red-400 resize-none mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setRejectModal(false)}
                className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2 rounded-xl hover:bg-gray-50 transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReject}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-xl transition text-sm"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Detail View Modal ── */}
      {selectedUpdate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg">Update Details</h3>
              <button
                onClick={() => dispatch(setSelectedUpdate(null))}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Staff Info */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  {selectedUpdate.staffName?.[0] || "S"}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{selectedUpdate.staffName}</p>
                  <p className="text-xs text-gray-400">{selectedUpdate.staffEmpId}</p>
                </div>
                <span className={`ml-auto text-xs px-3 py-1 rounded-full font-semibold ${STATUS_STYLE[selectedUpdate.status] || STATUS_STYLE.Pending}`}>
                  {selectedUpdate.status}
                </span>
              </div>

              {/* Task */}
              {selectedUpdate.taskTitle && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                  <p className="text-xs text-blue-500 font-semibold mb-0.5">Linked Task</p>
                  <p className="text-sm font-bold text-blue-800">{selectedUpdate.taskTitle}</p>
                  {selectedUpdate.taskId && (
                    <p className="text-[10px] text-blue-400 mt-0.5">{selectedUpdate.taskId}</p>
                  )}
                </div>
              )}

              {/* Work Details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 font-semibold">Work Type</p>
                  <p className="font-bold text-gray-800 mt-0.5">
                    {WORK_TYPE_ICON[selectedUpdate.workType]} {selectedUpdate.workType}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 font-semibold">Duration</p>
                  <p className="font-bold text-gray-800 mt-0.5">{selectedUpdate.duration} minutes</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-xs text-gray-500 font-semibold mb-1">Work Description</p>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-xl px-4 py-3 leading-relaxed">
                  {selectedUpdate.workDescription}
                </p>
              </div>

              {/* Submitted */}
              <p className="text-xs text-gray-400">
                Submitted: {fmt(selectedUpdate.submittedAt)}
              </p>

              {/* Attachments */}
              {selectedUpdate.proofAttachments?.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 font-semibold mb-2">
                    📎 Attachments ({selectedUpdate.proofAttachments.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedUpdate.proofAttachments.map((att, i) =>
                      att.fileType?.startsWith("image/") ? (
                        <a key={i} href={att.data} target="_blank" rel="noreferrer">
                          <img
                            src={att.data}
                            alt={att.fileName}
                            className="w-24 h-24 object-cover rounded-xl border border-gray-200 hover:opacity-80 transition"
                          />
                        </a>
                      ) : (
                        <a
                          key={i}
                          href={att.data}
                          download={att.fileName}
                          className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-blue-600 hover:bg-gray-100 transition"
                        >
                          📄 {att.fileName}
                        </a>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Admin Remarks */}
              {selectedUpdate.adminRemarks && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <p className="text-xs text-amber-600 font-semibold mb-0.5">Admin Remarks</p>
                  <p className="text-sm text-amber-800">{selectedUpdate.adminRemarks}</p>
                </div>
              )}

              {/* Action Buttons in modal */}
              {selectedUpdate.status === "Pending" && (
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      handleApprove(selectedUpdate._id);
                      dispatch(setSelectedUpdate(null));
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl text-sm transition"
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => {
                      dispatch(setSelectedUpdate(null));
                      handleRejectClick(selectedUpdate._id);
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-sm transition"
                  >
                    ✕ Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}