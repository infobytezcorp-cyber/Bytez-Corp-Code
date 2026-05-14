// import React, { useEffect, useState, useCallback, useMemo } from "react";
// import axios from "axios";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   clearStaffSession,
//   updateTaskStatus,
//   updateStaffRemark,
//   addAttachment,
//   setTasks,
// } from "../features/taskSlice";
// import { fetchMissedUpdateAlerts, fetchStaffUpdates } from "../features/workUpdateSlice";
// import { HR_DEPT_CONFIG } from "../features/hrSlice";
// import StaffWorkUpdateForm from "../components/StaffWorkUpdateForm";

// // ─── FIX #1: Use API_ROOT everywhere — strips trailing /api to avoid /api/api/tasks ───
// const API_ROOT = (import.meta.env.VITE_API_URL || "http://localhost:8000")
//   .replace(/\/api\/?$/, "")
//   .replace(/\/$/, "");

// // ─── Constants ────────────────────────────────────────────────────────────────
// const PRIORITY_STYLE = {
//   High:   { badge: "bg-red-100 text-red-700 border border-red-300",     dot: "#ef4444" },
//   Medium: { badge: "bg-amber-100 text-amber-700 border border-amber-300", dot: "#f59e0b" },
//   Low:    { badge: "bg-green-100 text-green-700 border border-green-300", dot: "#22c55e" },
// };

// const STATUS_META = {
//   Pending:       { label: "Pending",     color: "bg-gray-100 text-gray-700",   next: "In Progress" },
//   "In Progress": { label: "In Progress", color: "bg-blue-100 text-blue-700",   next: "Done"        },
//   Done:          { label: "Done ✓",      color: "bg-green-100 text-green-700", next: null          },
//   Rejected:      { label: "Rejected",    color: "bg-red-100 text-red-700",     next: null          },
// };

// const fileToBase64 = (file) =>
//   new Promise((res) => {
//     const r = new FileReader();
//     r.onload = () => res(r.result);
//     r.readAsDataURL(file);
//   });

// const getInitials = (name = "") =>
//   name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

// const fmtCountdown = (s) => `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s`;
// const fmtTime = (d) =>
//   d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

// const AUTO_REFRESH_MS = 60 * 60 * 1000; // 1 hour

// // ─── FIX #2: Consistent helper — always prefers MongoDB _id ──────────────────
// const getTaskId = (task) => task?._id || task?.id;

// // ─────────────────────────────────────────────────────────────────────────────
// export default function StaffTaskDashboard() {
//   const dispatch = useDispatch();
//   const { tasks, staffSession } = useSelector((s) => s.tasks);
//   const { staffUpdates, missedAlerts } = useSelector((s) => s.workUpdates);

//   const [lastRefresh, setLastRefresh]     = useState(new Date());
//   const [secsToRefresh, setSecsToRefresh] = useState(AUTO_REFRESH_MS / 1000);
//   const [expandedTask, setExpandedTask]   = useState(null);
//   const [remarks, setRemarks]             = useState({});
//   const [uploadingId, setUploadingId]     = useState(null);
//   const [viewImg, setViewImg]             = useState(null);
//   const [showUpdateForm, setShowUpdateForm] = useState(false);

//   // ── My Tasks ──────────────────────────────────────────────────────────────
//   const myTasks = useMemo(() => {
//     const normalizeId = (val) => String(val || "").trim().toLowerCase();
//     const target = normalizeId(staffSession?.empId);

//     return tasks.filter((t) => {
//       const assigned = t.assignedTo;
//       if (assigned && typeof assigned === "object") {
//         return [assigned.empId, assigned.id, assigned._id, t.assignedToEmpId]
//           .filter(Boolean)
//           .some((v) => normalizeId(v) === target);
//       }
//       return [assigned, t.assignedToEmpId]
//         .filter(Boolean)
//         .some((v) => normalizeId(v) === target);
//     });
//   }, [tasks, staffSession]);

//   // ── Categorize ────────────────────────────────────────────────────────────
//   const categorized = useMemo(() => {
//     const now = new Date();
//     return {
//       completed: myTasks.filter((t) => t.status === "Done"),
//       uncompleted: myTasks.filter((t) => {
//         const isOverdue = t.dueDate && new Date(t.dueDate) < now;
//         return t.status !== "Done" && isOverdue;
//       }),
//       active: myTasks.filter((t) => {
//         const isOverdue = t.dueDate && new Date(t.dueDate) < now;
//         return t.status !== "Done" && !isOverdue;
//       }),
//     };
//   }, [myTasks]);

//   const stats = {
//     total:      myTasks.length,
//     pending:    myTasks.filter((t) => t.status === "Pending").length,
//     inProgress: myTasks.filter((t) => t.status === "In Progress").length,
//     done:       categorized.completed.length,
//   };

//   const deptColor = HR_DEPT_CONFIG[staffSession?.empDept]?.color || "#1a2332";

//   // ── Countdown ticker ──────────────────────────────────────────────────────
//   useEffect(() => {
//     const t = setInterval(
//       () => setSecsToRefresh((p) => (p > 0 ? p - 1 : AUTO_REFRESH_MS / 1000)),
//       1000
//     );
//     return () => clearInterval(t);
//   }, []);

//   const doRefresh = useCallback(() => {
//     setLastRefresh(new Date());
//     setSecsToRefresh(AUTO_REFRESH_MS / 1000);
//   }, []);

//   // ── FIX #1 applied: use API_ROOT (not API) in all axios calls ─────────────
//   useEffect(() => {
//     if (!staffSession) return;

//     const fetchStaffTasks = async () => {
//       try {
//         const response = await axios.get(`${API_ROOT}/api/tasks`, {
//           params: { staffId: staffSession.empId },
//         });
//         if (Array.isArray(response.data)) {
//           dispatch(setTasks(response.data));
//         }
//         dispatch(fetchStaffUpdates({ empId: staffSession.empId, limit: 10 }));
//         dispatch(fetchMissedUpdateAlerts({ staffEmpId: staffSession.empId }));
//       } catch (err) {
//         console.warn("StaffTaskDashboard: failed to load assigned tasks", err?.message || err);
//       }
//     };

//     fetchStaffTasks();
//     const interval = setInterval(fetchStaffTasks, AUTO_REFRESH_MS);
//     return () => clearInterval(interval);
//   }, [dispatch, staffSession]);

//   // ── Handlers ──────────────────────────────────────────────────────────────
//   const handleStatusAdvance = async (task) => {
//     const next = STATUS_META[task.status]?.next;
//     if (!next) return;
//     const id = getTaskId(task); // FIX #2
//     try {
//       const response = await axios.put(`${API_ROOT}/api/tasks/${id}`, { status: next });
//       dispatch(setTasks(tasks.map((item) => (getTaskId(item) === id ? response.data : item))));
//     } catch (err) {
//       console.warn("Failed to update task status in backend:", err?.message || err);
//       dispatch(updateTaskStatus({ taskId: id, status: next }));
//     }
//   };

//   const handleRemarkSave = async (taskId) => {
//     const remark = remarks[taskId] ?? "";
//     try {
//       const response = await axios.put(`${API_ROOT}/api/tasks/${taskId}`, { staffRemark: remark });
//       dispatch(setTasks(tasks.map((item) => (getTaskId(item) === taskId ? response.data : item))));
//     } catch (err) {
//       console.warn("Failed to save remark in backend:", err?.message || err);
//       dispatch(updateStaffRemark({ taskId, remark }));
//     }
//     setExpandedTask(null);
//   };

//   const handleFileUpload = async (taskId, files) => {
//     const currentTask = tasks.find((t) => getTaskId(t) === taskId);
//     if (!currentTask) return;
//     setUploadingId(taskId);
//     const newFiles = [];
//     for (const file of Array.from(files)) {
//       const url = await fileToBase64(file);
//       newFiles.push({
//         name: file.name,
//         url,
//         type: file.type,
//         size: file.size,
//         uploadedBy: staffSession.empName,
//         uploadedAt: new Date().toISOString(),
//       });
//     }
//     try {
//       const attachments = [...(currentTask.attachments || []), ...newFiles];
//       const response = await axios.put(`${API_ROOT}/api/tasks/${taskId}`, { attachments });
//       dispatch(setTasks(tasks.map((t) => (getTaskId(t) === taskId ? response.data : t))));
//     } catch (err) {
//       console.warn("Failed to upload proof in backend:", err?.message || err);
//       newFiles.forEach((attachment) => dispatch(addAttachment({ taskId, attachment })));
//     }
//     setUploadingId(null);
//   };

//   // ── TaskItem sub-component ────────────────────────────────────────────────
//   // FIX #2: use taskId = getTaskId(task) everywhere instead of task.id
//   const TaskItem = ({ task, isDanger = false }) => {
//     const taskId     = getTaskId(task); // ✅ always MongoDB _id
//     const ps         = PRIORITY_STYLE[task.priority] || PRIORITY_STYLE.Medium;
//     const sm         = STATUS_META[task.status]      || STATUS_META.Pending;
//     const isRemarkOpen = expandedTask === taskId;

//     return (
//       <div
//         className={`bg-white rounded-2xl border shadow-sm overflow-hidden mb-3 transition-shadow hover:shadow-md ${
//           isDanger ? "border-red-300" : "border-gray-200"
//         }`}
//       >
//         {/* Priority colour bar */}
//         <div className="h-1" style={{ backgroundColor: isDanger ? "#ef4444" : ps.dot }} />

//         <div className="p-4">
//           {/* Title row */}
//           <div className="flex justify-between items-start gap-2">
//             <div className="flex-1 min-w-0">
//               <div className="flex items-center gap-2 flex-wrap">
//                 <h3 className="font-bold text-gray-900 text-sm">{task.title}</h3>
//                 <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${ps.badge}`}>
//                   {task.priority}
//                 </span>
//                 {isDanger && (
//                   <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold border border-red-300">
//                     ⚠️ OVERDUE
//                   </span>
//                 )}
//               </div>
//               <p className="text-xs text-gray-400 mt-1">
//                 <code className="text-gray-300">{taskId}</code> • Due:{" "}
//                 <span className={isDanger ? "text-red-500 font-semibold" : ""}>
//                   {task.dueDate || "N/A"}
//                   {task.dueTime ? ` at ${task.dueTime}` : ""}
//                 </span>
//               </p>
//             </div>
//             <span className={`text-xs px-3 py-1.5 rounded-full font-semibold flex-shrink-0 ${sm.color}`}>
//               {sm.label}
//             </span>
//           </div>

//           {/* Description */}
//           {task.description && (
//             <p className="mt-2 text-sm text-gray-600 leading-relaxed">{task.description}</p>
//           )}

//           {/* Admin notes */}
//           {task.adminNotes && (
//             <div className="mt-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-700">
//               📌 <strong>Admin note:</strong> {task.adminNotes}
//             </div>
//           )}

//           {/* Existing remark display */}
//           {task.staffRemark && !isRemarkOpen && (
//             <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 text-sm text-blue-700 flex items-start gap-2">
//               <span>💬</span>
//               <span className="flex-1">{task.staffRemark}</span>
//               <button
//                 onClick={() => {
//                   setRemarks((p) => ({ ...p, [taskId]: task.staffRemark }));
//                   setExpandedTask(taskId);
//                 }}
//                 className="text-blue-500 hover:text-blue-700 text-xs underline flex-shrink-0"
//               >
//                 Edit
//               </button>
//             </div>
//           )}

//           {/* Remark editor */}
//           {isRemarkOpen && (
//             <div className="mt-3 space-y-2">
//               <textarea
//                 value={remarks[taskId] ?? task.staffRemark ?? ""}
//                 onChange={(e) => setRemarks((p) => ({ ...p, [taskId]: e.target.value }))}
//                 rows={2}
//                 placeholder="Add your remark or progress update..."
//                 className="w-full border border-blue-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500 resize-none"
//                 autoFocus
//               />
//               <div className="flex gap-2">
//                 <button
//                   onClick={() => handleRemarkSave(taskId)}
//                   className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-700 transition"
//                 >
//                   Save Remark
//                 </button>
//                 <button
//                   onClick={() => setExpandedTask(null)}
//                   className="text-xs border border-gray-300 px-3 py-1.5 rounded-lg font-semibold hover:bg-gray-50 transition"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Attachments */}
//           {task.attachments?.length > 0 && (
//             <div className="mt-3">
//               <p className="text-xs text-gray-500 font-semibold mb-1.5">
//                 📎 Attachments ({task.attachments.length})
//               </p>
//               <div className="flex flex-wrap gap-2">
//                 {task.attachments.map((att, i) =>
//                   att.type?.startsWith("image/") ? (
//                     <button
//                       key={i}
//                       onClick={() => setViewImg(att.url)}
//                       className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs hover:bg-gray-100 transition"
//                     >
//                       🖼 {att.name}
//                       {att.uploadedBy && (
//                         <span className="text-gray-400 ml-1">· {att.uploadedBy}</span>
//                       )}
//                     </button>
//                   ) : (
//                     <a
//                       key={i}
//                       href={att.url}
//                       download={att.name}
//                       className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs hover:bg-gray-100 transition"
//                     >
//                       📄 {att.name}
//                       {att.uploadedBy && (
//                         <span className="text-gray-400 ml-1">· {att.uploadedBy}</span>
//                       )}
//                     </a>
//                   )
//                 )}
//               </div>
//             </div>
//           )}

//           {/* Action row */}
//           <div className="mt-4 flex items-center gap-2 flex-wrap">
//             {/* Advance status */}
//             {sm.next && (
//               <button
//                 onClick={() => handleStatusAdvance(task)}
//                 className={`text-sm font-semibold px-4 py-2 rounded-xl transition ${
//                   task.status === "Pending"
//                     ? "bg-blue-600 hover:bg-blue-700 text-white"
//                     : "bg-green-600 hover:bg-green-700 text-white"
//                 }`}
//               >
//                 {task.status === "Pending" ? "▶ Start Task" : "✅ Mark Done"}
//               </button>
//             )}

//             {/* Upload proof */}
//             <div>
//               <input
//                 type="file"
//                 multiple
//                 accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
//                 className="hidden"
//                 id={`staff-upload-${taskId}`}
//                 onChange={(e) => handleFileUpload(taskId, e.target.files)}
//               />
//               <label
//                 htmlFor={`staff-upload-${taskId}`}
//                 className="text-sm font-semibold text-blue-600 hover:text-blue-700 border border-blue-200 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5"
//               >
//                 {uploadingId === taskId ? (
//                   <>
//                     <span className="inline-block w-3 h-3 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
//                     Uploading...
//                   </>
//                 ) : (
//                   <>📎 Upload Proof</>
//                 )}
//               </label>
//             </div>

//             {/* Add / Edit Remark */}
//             {!isRemarkOpen && (
//               <button
//                 onClick={() => {
//                   setRemarks((p) => ({ ...p, [taskId]: task.staffRemark ?? "" }));
//                   setExpandedTask(taskId);
//                 }}
//                 className="text-sm font-semibold text-gray-600 hover:text-gray-800 border border-gray-200 bg-white hover:bg-gray-50 px-4 py-2 rounded-xl transition"
//               >
//                 💬 {task.staffRemark ? "Edit Remark" : "Add Remark"}
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // ─── Render ───────────────────────────────────────────────────────────────
//   return (
//     <div className="min-h-screen bg-gray-50 pb-10">

//       {/* ── Sticky Header ── */}
//       <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
//         <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
//           {/* Avatar */}
//           <div
//             className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
//             style={{ backgroundColor: deptColor }}
//           >
//             {getInitials(staffSession?.empName)}
//           </div>

//           {/* Name + ID */}
//           <div className="flex-1 min-w-0">
//             <div className="font-bold text-gray-900 text-sm leading-tight truncate">
//               {staffSession?.empName}
//             </div>
//             <div className="text-xs text-gray-400 truncate">
//               {staffSession?.empRole} ·{" "}
//               <code className="text-blue-600">{staffSession?.empId}</code>
//             </div>
//           </div>

//           {/* Refresh info */}
//           <div className="hidden sm:flex flex-col items-end mr-1">
//             <span className="text-[10px] text-gray-400">🔄 {fmtTime(lastRefresh)}</span>
//             <span className="text-[10px] text-gray-300">Next: {fmtCountdown(secsToRefresh)}</span>
//           </div>

//           {/* Manual refresh */}
//           <button
//             onClick={doRefresh}
//             title="Refresh now"
//             className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition"
//           >
//             🔄
//           </button>

//           {/* Work Update button */}
//           <button
//             onClick={() => setShowUpdateForm(true)}
//             className="text-sm font-semibold text-green-600 border border-green-200 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition flex-shrink-0"
//           >
//             + Update
//           </button>

//           {/* Logout */}
//           <button
//             onClick={() => dispatch(clearStaffSession())}
//             className="text-sm font-semibold text-red-500 hover:text-red-700 border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-lg transition flex-shrink-0"
//           >
//             Logout
//           </button>
//         </div>
//       </header>

//       <div className="max-w-3xl mx-auto px-4 py-6">

//         {/* ── KPI Cards ── */}
//         <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
//           {[
//             { label: "Total",       value: stats.total,      color: "#2d6be4" },
//             { label: "Pending",     value: stats.pending,    color: "#f59e0b" },
//             { label: "In Progress", value: stats.inProgress, color: "#3b82f6" },
//             { label: "Done",        value: stats.done,       color: "#10b981" },
//           ].map((card) => (
//             <div
//               key={card.label}
//               className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
//             >
//               <div className="text-2xl font-black" style={{ color: card.color }}>
//                 {card.value}
//               </div>
//               <div className="text-xs text-gray-500 mt-0.5 font-semibold">{card.label}</div>
//             </div>
//           ))}
//         </div>

//         {/* Missed alerts banner */}
//         {missedAlerts?.length > 0 && (
//           <div className="mb-5 bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3 text-sm text-orange-700 flex items-center gap-2">
//             ⚠️ You have <strong>{missedAlerts.length}</strong> missed hourly update(s). Please submit a work update.
//           </div>
//         )}

//         {/* ── Sections ── */}

//         {/* Overdue */}
//         <section className="mb-8">
//           <h2 className="text-red-600 font-bold text-sm mb-3 flex items-center gap-2">
//             ⚠️ Uncompleted (Overdue)
//             {categorized.uncompleted.length > 0 && (
//               <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-bold">
//                 {categorized.uncompleted.length}
//               </span>
//             )}
//           </h2>
//           {categorized.uncompleted.length === 0 ? (
//             <p className="text-xs text-gray-400 bg-white rounded-xl p-4 border border-gray-100">
//               ✅ No overdue tasks. Great work!
//             </p>
//           ) : (
//             // FIX #3: key uses getTaskId(t) not t.id
//             categorized.uncompleted.map((t) => (
//               <TaskItem key={getTaskId(t)} task={t} isDanger={true} />
//             ))
//           )}
//         </section>

//         {/* Active */}
//         <section className="mb-8">
//           <h2 className="text-blue-600 font-bold text-sm mb-3 flex items-center gap-2">
//             📂 Current Tasks
//             {categorized.active.length > 0 && (
//               <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full font-bold">
//                 {categorized.active.length}
//               </span>
//             )}
//           </h2>
//           {categorized.active.length === 0 ? (
//             <p className="text-xs text-gray-400 bg-white rounded-xl p-4 border border-gray-100">
//               No active tasks assigned.
//             </p>
//           ) : (
//             categorized.active.map((t) => (
//               <TaskItem key={getTaskId(t)} task={t} />
//             ))
//           )}
//         </section>

//         {/* Completed */}
//         <section>
//           <h2 className="text-green-600 font-bold text-sm mb-3 flex items-center gap-2">
//             ✅ Completed
//             {categorized.completed.length > 0 && (
//               <span className="bg-green-100 text-green-600 text-xs px-2 py-0.5 rounded-full font-bold">
//                 {categorized.completed.length}
//               </span>
//             )}
//           </h2>
//           {categorized.completed.length === 0 ? (
//             <p className="text-xs text-gray-400 bg-white rounded-xl p-4 border border-gray-100">
//               No completed tasks yet.
//             </p>
//           ) : (
//             categorized.completed.map((t) => (
//               <TaskItem key={getTaskId(t)} task={t} />
//             ))
//           )}
//         </section>

//         {/* Footer */}
//         <p className="text-center text-xs text-gray-300 mt-8 pb-4">
//           🔄 Auto-refreshes every hour · Next in {fmtCountdown(secsToRefresh)}
//         </p>
//       </div>

//       {/* ── Image Preview Modal ── */}
//       {viewImg && (
//         <div
//           className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
//           onClick={() => setViewImg(null)}
//         >
//           <div className="relative max-w-full max-h-full">
//             <img
//               src={viewImg}
//               alt="Preview"
//               className="max-w-full max-h-[90vh] rounded-xl object-contain"
//             />
//             <button
//               onClick={() => setViewImg(null)}
//               className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/70 transition"
//             >
//               ✕
//             </button>
//           </div>
//         </div>
//       )}

//       {/* ── Work Update Form Modal ── */}
//       {showUpdateForm && (
//         <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
//           <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
//             <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
//               <h3 className="font-bold text-gray-900">Submit Work Update</h3>
//               <button
//                 onClick={() => setShowUpdateForm(false)}
//                 className="text-gray-400 hover:text-gray-600 text-xl leading-none"
//               >
//                 ✕
//               </button>
//             </div>
//             <div className="p-5">
//               <StaffWorkUpdateForm
//                 staffSession={staffSession}
//                 tasks={myTasks}
//                 onSuccess={() => setShowUpdateForm(false)}
//               />
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// src/pages/StaffTaskDashboard.jsx
// Rendered by StaffPortal.jsx after successful login
import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import {
  clearStaffSession,
  updateTaskStatus,
  updateStaffRemark,
  addAttachment,
  setTasks,
} from "../features/taskSlice";
import { fetchMissedUpdateAlerts, fetchStaffUpdates } from "../features/workUpdateSlice";
import { HR_DEPT_CONFIG } from "../features/hrSlice";
import StaffWorkUpdateForm from "../components/StaffWorkUpdateForm";

// ─── Constants & Helpers ──────────────────────────────────────────────────────
const API_ROOT = (import.meta.env.VITE_API_URL || "http://localhost:8000")
  .replace(/\/api\/?$/, "")
  .replace(/\/$/, "");

const PRIORITY_STYLE = {
  High: { badge: "bg-red-100 text-red-700 border border-red-300", dot: "#ef4444" },
  Medium: { badge: "bg-amber-100 text-amber-700 border border-amber-300", dot: "#f59e0b" },
  Low: { badge: "bg-green-100 text-green-700 border border-green-300", dot: "#22c55e" },
};

const STATUS_META = {
  Pending: { label: "Pending", color: "bg-gray-100 text-gray-700", next: "In Progress" },
  "In Progress": { label: "In Progress", color: "bg-blue-100 text-blue-700", next: "Done" },
  Done: { label: "Done ✓", color: "bg-green-100 text-green-700", next: null },
  Rejected: { label: "Rejected", color: "bg-red-100 text-red-700", next: null },
};

const getTaskId = (task) => task?._id || task?.id;

const fileToBase64 = (file) =>
  new Promise((res) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.readAsDataURL(file);
  });

const getInitials = (name = "") =>
  name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

const fmtCountdown = (s) => `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s`;
const fmtTime = (d) => d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

const AUTO_REFRESH_MS = 60 * 60 * 1000;

// ─── TaskItem Component (Defined Outside to prevent focus loss) ───────────────
const TaskItem = ({
  task,
  isDanger = false,
  expandedTask,
  setExpandedTask,
  remarks,
  setRemarks,
  handleRemarkSave,
  handleStatusAdvance,
  handleFileUpload,
  uploadingId,
  setViewImg,
  staffSession,
}) => {
  const taskId = getTaskId(task);
  const ps = PRIORITY_STYLE[task.priority] || PRIORITY_STYLE.Medium;
  const sm = STATUS_META[task.status] || STATUS_META.Pending;
  const isRemarkOpen = expandedTask === taskId;

  const [showUpdateForm, setShowUpdateForm] = React.useState(false);
  const [lastUpdateTime, setLastUpdateTime] = React.useState(null);

  const now = new Date();
  const canUpdate = !lastUpdateTime || (now - lastUpdateTime) > 60 * 60 * 1000; // 1 hour in ms

  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm overflow-hidden mb-3 transition-shadow hover:shadow-md ${
        isDanger ? "border-red-300" : "border-gray-200"
      }`}
    >
      <div className="h-1" style={{ backgroundColor: isDanger ? "#ef4444" : ps.dot }} />

      <div className="p-4">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-gray-900 text-sm">{task.title}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${ps.badge}`}>
                {task.priority}
              </span>
              {isDanger && (
                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold border border-red-300">
                  ⚠️ OVERDUE
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              <code className="text-gray-300">{taskId}</code> • Due:{" "}
              <span className={isDanger ? "text-red-500 font-semibold" : ""}>
                {task.dueDate || "N/A"}
                {task.dueTime ? ` at ${task.dueTime}` : ""}
              </span>
            </p>
          </div>
          <span className={`text-xs px-3 py-1.5 rounded-full font-semibold flex-shrink-0 ${sm.color}`}>
            {sm.label}
          </span>
        </div>

        {task.description && (
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">{task.description}</p>
        )}

        {task.adminNotes && (
          <div className="mt-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-700">
            📌 <strong>Admin note:</strong> {task.adminNotes}
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {sm.next && (
            <button
              onClick={() => handleStatusAdvance(task)}
              className={`text-sm font-semibold px-4 py-2 rounded-xl transition ${
                task.status === "Pending"
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {task.status === "Pending" ? "▶ Start Task" : "✅ Mark Done"}
            </button>
          )}

          {task.status === "In Progress" && (
            <div>
              {canUpdate ? (
                <button
                  className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl transition"
                  onClick={() => setShowUpdateForm((v) => !v)}
                >
                  {showUpdateForm ? "Close Update Form" : "One Hour Work Update"}
                </button>
              ) : (
                <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
                  Update available in next hour
                </div>
              )}
            </div>
          )}
        </div>

        {showUpdateForm && canUpdate && task.status === "In Progress" && (
          <div className="mt-4">
            <StaffWorkUpdateForm
              staffSession={staffSession}
              staffInfo={staffSession}
              task={task}
              onSuccess={() => {
                setShowUpdateForm(false);
                setLastUpdateTime(new Date());
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function StaffTaskDashboard() {
  const dispatch = useDispatch();
  const { tasks, staffSession } = useSelector((s) => s.tasks);
  const { missedAlerts } = useSelector((s) => s.workUpdates);

  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [secsToRefresh, setSecsToRefresh] = useState(AUTO_REFRESH_MS / 1000);
  const [expandedTask, setExpandedTask] = useState(null);
  const [remarks, setRemarks] = useState({});
  const [uploadingId, setUploadingId] = useState(null);
  const [viewImg, setViewImg] = useState(null);
  const [showUpdateForm, setShowUpdateForm] = useState(false);

  const myTasks = useMemo(() => {
    const normalizeId = (val) => String(val || "").trim().toLowerCase();
    const target = normalizeId(staffSession?.empId);
    return tasks.filter((t) => {
      const assigned = t.assignedTo;
      const ids = assigned && typeof assigned === "object" 
        ? [assigned.empId, assigned.id, assigned._id, t.assignedToEmpId] 
        : [assigned, t.assignedToEmpId];
      return ids.filter(Boolean).some((v) => normalizeId(v) === target);
    });
  }, [tasks, staffSession]);

  const categorized = useMemo(() => {
    const now = new Date();
    return {
      completed: myTasks.filter((t) => t.status === "Done"),
      uncompleted: myTasks.filter((t) => t.status !== "Done" && t.dueDate && new Date(t.dueDate) < now),
      active: myTasks.filter((t) => t.status !== "Done" && (!t.dueDate || new Date(t.dueDate) >= now)),
    };
  }, [myTasks]);

  const stats = {
    total: myTasks.length,
    pending: myTasks.filter((t) => t.status === "Pending").length,
    inProgress: myTasks.filter((t) => t.status === "In Progress").length,
    done: categorized.completed.length,
  };

  const deptColor = HR_DEPT_CONFIG[staffSession?.empDept]?.color || "#1a2332";

  useEffect(() => {
    const t = setInterval(() => setSecsToRefresh((p) => (p > 0 ? p - 1 : AUTO_REFRESH_MS / 1000)), 1000);
    return () => clearInterval(t);
  }, []);

  const fetchStaffTasks = useCallback(async () => {
    if (!staffSession) return;
    try {
      const response = await axios.get(`${API_ROOT}/api/tasks`, { params: { staffId: staffSession.empId } });
      if (Array.isArray(response.data)) dispatch(setTasks(response.data));
      dispatch(fetchStaffUpdates({ empId: staffSession.empId, limit: 10 }));
      dispatch(fetchMissedUpdateAlerts({ staffEmpId: staffSession.empId }));
      setLastRefresh(new Date());
      setSecsToRefresh(AUTO_REFRESH_MS / 1000);
    } catch (err) {
      console.warn("Failed to load tasks", err);
    }
  }, [dispatch, staffSession]);

  useEffect(() => {
    fetchStaffTasks();
    const interval = setInterval(fetchStaffTasks, AUTO_REFRESH_MS);
    return () => clearInterval(interval);
  }, [fetchStaffTasks]);

  const handleStatusAdvance = async (task) => {
    const next = STATUS_META[task.status]?.next;
    if (!next) return;
    const id = getTaskId(task);
    try {
      const response = await axios.put(`${API_ROOT}/api/tasks/${id}`, { status: next });
      dispatch(setTasks(tasks.map((item) => (getTaskId(item) === id ? response.data : item))));
    } catch (err) {
      dispatch(updateTaskStatus({ taskId: id, status: next }));
    }
  };

  const handleRemarkSave = async (taskId) => {
    const remark = remarks[taskId] ?? "";
    try {
      const response = await axios.put(`${API_ROOT}/api/tasks/${taskId}`, { staffRemark: remark });
      dispatch(setTasks(tasks.map((item) => (getTaskId(item) === taskId ? response.data : item))));
    } catch (err) {
      dispatch(updateStaffRemark({ taskId, remark }));
    }
    setExpandedTask(null);
  };

  const handleFileUpload = async (taskId, files) => {
    const currentTask = tasks.find((t) => getTaskId(t) === taskId);
    if (!currentTask) return;
    setUploadingId(taskId);
    const newFiles = [];
    for (const file of Array.from(files)) {
      const url = await fileToBase64(file);
      newFiles.push({ name: file.name, url, type: file.type, size: file.size, uploadedBy: staffSession.empName, uploadedAt: new Date().toISOString() });
    }
    try {
      const attachments = [...(currentTask.attachments || []), ...newFiles];
      const response = await axios.put(`${API_ROOT}/api/tasks/${taskId}`, { attachments });
      dispatch(setTasks(tasks.map((t) => (getTaskId(t) === taskId ? response.data : t))));
    } catch (err) {
      newFiles.forEach((attachment) => dispatch(addAttachment({ taskId, attachment })));
    }
    setUploadingId(null);
  };

  // Helper to render TaskItems with all required props
  const renderTaskSection = (taskList, isDanger = false) => {
    return taskList.map((t) => (
      <TaskItem
        key={getTaskId(t)}
        task={t}
        isDanger={isDanger}
        expandedTask={expandedTask}
        setExpandedTask={setExpandedTask}
        remarks={remarks}
        setRemarks={setRemarks}
        handleRemarkSave={handleRemarkSave}
        handleStatusAdvance={handleStatusAdvance}
        handleFileUpload={handleFileUpload}
        uploadingId={uploadingId}
        setViewImg={setViewImg}
        staffSession={staffSession}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: deptColor }}>
            {getInitials(staffSession?.empName)}
          </div>
          <div className="flex-1">
            <div className="font-bold text-gray-900 text-sm">{staffSession?.empName}</div>
            <div className="text-xs text-gray-400">{staffSession?.empRole} · <code className="text-blue-600">{staffSession?.empId}</code></div>
          </div>
          <button onClick={fetchStaffTasks} className="p-2 text-gray-500">🔄</button>
          <button onClick={() => setShowUpdateForm(true)} className="text-sm font-semibold text-green-600 border border-green-200 bg-green-50 px-3 py-1.5 rounded-lg">+ Update</button>
          <button onClick={() => dispatch(clearStaffSession())} className="text-sm font-semibold text-red-500 border border-red-200 px-3 py-1.5 rounded-lg">Logout</button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[{ label: "Total", val: stats.total, color: "#2d6be4" }, { label: "Pending", val: stats.pending, color: "#f59e0b" }, { label: "In Progress", val: stats.inProgress, color: "#3b82f6" }, { label: "Done", val: stats.done, color: "#10b981" }].map((c) => (
            <div key={c.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="text-2xl font-black" style={{ color: c.color }}>{c.val}</div>
              <div className="text-xs text-gray-500 font-semibold">{c.label}</div>
            </div>
          ))}
        </div>

        {missedAlerts?.length > 0 && (
          <div className="mb-5 bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3 text-sm text-orange-700">
            ⚠️ You have <strong>{missedAlerts.length}</strong> missed updates.
          </div>
        )}

        <section className="mb-8">
          <h2 className="text-red-600 font-bold text-sm mb-3">⚠️ Uncompleted (Overdue)</h2>
          {categorized.uncompleted.length === 0 ? <p className="text-xs text-gray-400">No overdue tasks.</p> : renderTaskSection(categorized.uncompleted, true)}
        </section>

        <section className="mb-8">
          <h2 className="text-blue-600 font-bold text-sm mb-3">📂 Current Tasks</h2>
          {renderTaskSection(categorized.active)}
        </section>

        <section>
          <h2 className="text-green-600 font-bold text-sm mb-3">✅ Completed</h2>
          {renderTaskSection(categorized.completed)}
        </section>
      </div>

      {viewImg && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setViewImg(null)}>
          <img src={viewImg} alt="Preview" className="max-w-full max-h-[90vh] rounded-xl" />
        </div>
      )}

      {showUpdateForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-5">
             <div className="flex justify-between mb-4">
                <h3 className="font-bold">Submit Work Update</h3>
                <button onClick={() => setShowUpdateForm(false)}>✕</button>
             </div>
             <StaffWorkUpdateForm staffSession={staffSession} tasks={myTasks} onSuccess={() => setShowUpdateForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
}