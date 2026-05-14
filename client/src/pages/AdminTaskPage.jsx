// src/pages/AdminTaskPage.jsx
// Route: /admin/tasks
// Sidebar: { icon: "📋", label: "Task Management", path: "/admin/tasks" }
// Staff list is fetched directly from hrSlice (s.hr.employees)

import React, { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import {
  addTask,
  deleteTask,
  updateTask,
  removeAttachment,
  addAttachment,
  setTasks,
} from "../features/taskSlice";
import { HR_DEPT_CONFIG, fetchEmployees } from "../features/hrSlice";
import { fetchAllUpdates } from "../features/workUpdateSlice";

const API = import.meta.env.VITE_API_URL;
const API_ROOT = (API || "http://localhost:8000").replace(/\/api\/?$/, "").replace(/\/$/, "");

// ─── Helpers ─────────────────────────────────────────────────────────────────
const PRIORITY = {
  High:   { badge: "bg-red-100 text-red-700 border border-red-300",   dot: "bg-red-500"   },
  Medium: { badge: "bg-amber-100 text-amber-700 border border-amber-300", dot: "bg-amber-500" },
  Low:    { badge: "bg-green-100 text-green-700 border border-green-300", dot: "bg-green-500" },
};
const STATUS_STYLE = {
  Pending:       "bg-gray-100 text-gray-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Done:          "bg-green-100 text-green-700",
  Rejected:      "bg-red-100 text-red-700",
};
const fileToBase64 = (file) =>
  new Promise((res) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.readAsDataURL(file);
  });
const getInitials = (name = "") => {
  const normalized =
    typeof name === "string"
      ? name
      : name && typeof name === "object"
      ? name.name || name.fullName || name.empName || name.label || ""
      : String(name || "");

  return normalized
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

const getProofName = (file = {}) => file.name || file.fileName || "Attachment";
const getProofType = (file = {}) => file.type || file.fileType || "";
const getProofSize = (file = {}) => Number(file.size || file.fileSize || 0);

const bytesToText = (bytes = []) => {
  try {
    return new TextDecoder().decode(new Uint8Array(bytes));
  } catch {
    return "";
  }
};

const getProofUrl = (file = {}) => {
  const type = getProofType(file) || "application/octet-stream";
  const data = file.url || file.data;

  if (!data) return "";
  if (typeof data === "string") {
    return data.startsWith("data:") ? data : `data:${type};base64,${data}`;
  }
  if (Array.isArray(data?.data)) {
    const decoded = bytesToText(data.data);
    return decoded.startsWith("data:") ? decoded : `data:${type};base64,${decoded}`;
  }

  return "";
};

const formatBytes = (size) => {
  if (!size) return "";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const formatSubmittedAt = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const emptyForm = () => ({
  title: "",
  description: "",
  priority: "Medium",
  dueDate: "",
  dueTime: "",
  adminNotes: "",
});



// ─── Toast helper ─────────────────────────────────────────────────────────────
const showToast = (msg, type = "success") => {
  const el = document.createElement("div");
  el.className = `fixed top-5 right-5 z-[9999] px-5 py-3 rounded-xl font-semibold shadow-xl text-sm text-white ${
    type === "success" ? "bg-green-600" : "bg-red-600"
  }`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
};

// ─────────────────────────────────────────────────────────────────────────────
export default function AdminTaskPage() {
  const dispatch = useDispatch();
  // ✅ HR employees fetched directly from hrSlice
  const employees = useSelector((s) => s.hr.employees) || [];
  const { tasks } = useSelector((s) => s.tasks);
  const { allUpdates } = useSelector((s) => s.workUpdates);

  const [tab, setTab] = useState("assign"); // assign | all

  // ── Staff selector state ──
  const [selectedId, setSelectedId] = useState("");
  const [empSearch, setEmpSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");

  // ── Task form state ──
  const [form, setForm] = useState(emptyForm());
  const [attachments, setAttachments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef();

  // ── All-tasks filters ──
  const [filterEmp, setFilterEmp] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  // ── Edit modal ──
  const [editTask, setEditTask] = useState(null);

  // ── Show updates modal ──
  const [showUpdatesFor, setShowUpdatesFor] = useState(null);

  // ── Derived ──
  const depts = Object.keys(HR_DEPT_CONFIG);
  const filteredEmps = employees.filter((e) => {
    const matchSearch =
      e.name?.toLowerCase().includes(empSearch.toLowerCase()) ||
      e.id?.toLowerCase().includes(empSearch.toLowerCase()) ||
      e.role?.toLowerCase().includes(empSearch.toLowerCase());
    const matchDept = deptFilter === "all" || e.dept === deptFilter;
    return matchSearch && matchDept;
  });
  const selectedEmp = employees.find((e) => e.id === selectedId);
  const getTaskId = (task) => task?._id || task?.id;
  const getAssignedEmpId = (task) => {
    if (task?.assignedToEmpId) return task.assignedToEmpId;
    if (task?.assignedTo && typeof task.assignedTo === "object") {
      return task.assignedTo.id || task.assignedTo.empId || task.assignedTo._id;
    }
    return task?.assignedTo;
  };

  const allFiltered = tasks.filter((t) => {
    const eM = filterEmp === "all" || getAssignedEmpId(t) === filterEmp;
    const sM = filterStatus === "all" || t.status === filterStatus;
    const pM = filterPriority === "all" || t.priority === filterPriority;
    return eM && sM && pM;
  });

  const workUpdatesByTask = useMemo(() => {
    const grouped = {};

    (allUpdates || []).forEach((update) => {
      const taskId = String(update?.taskId || "").trim();
      if (!taskId) return;
      if (!grouped[taskId]) grouped[taskId] = [];
      grouped[taskId].push(update);
    });

    Object.values(grouped).forEach((updates) => {
      updates.sort(
        (a, b) =>
          new Date(b.submittedAt || b.createdAt || 0).getTime() -
          new Date(a.submittedAt || a.createdAt || 0).getTime()
      );
    });

    return grouped;
  }, [allUpdates]);

  const taskSummary = {
    total:      tasks.length,
    pending:    tasks.filter((t) => t.status === "Pending").length,
    inProgress: tasks.filter((t) => t.status === "In Progress").length,
    done:       tasks.filter((t) => t.status === "Done").length,
  };

  useEffect(() => {
    dispatch(fetchEmployees());
    dispatch(fetchAllUpdates({ limit: 500 }));
  }, [dispatch]);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const response = await axios.get(`${API_ROOT}/api/tasks`);
        if (Array.isArray(response.data)) dispatch(setTasks(response.data));
      } catch (err) {
        console.warn("Failed to load tasks from backend:", err?.message || err);
      }
    };

    loadTasks();
  }, [dispatch]);

  // ── Handlers ──
  const handleFiles = async (files) => {
    const arr = [];
    for (const f of Array.from(files)) {
      const url = await fileToBase64(f);
      arr.push({ name: f.name, type: f.type, url, size: f.size });
    }
    setAttachments((p) => [...p, ...arr]);
  };

  const handleSubmit = async () => {
    if (!selectedId) return showToast("⚠️ Please select a staff member", "error");
    if (!form.title.trim()) return showToast("⚠️ Task title is required", "error");
    setSubmitting(true);

    const payload = {
      ...form,
      assignedTo: selectedId,
      assignedToName: selectedEmp?.name || "",
      assignedBy: "Admin",
      attachments,
      status: "Pending",
    };

    try {
      const response = await axios.post(`${API_ROOT}/api/tasks`, payload);
      dispatch(addTask(response.data));
      setForm(emptyForm());
      setAttachments([]);
      showToast(`✅ Task assigned to ${selectedEmp?.name}!`);
    } catch (err) {
      console.error("Failed to save task to backend:", err);
      showToast("⚠️ Failed to assign task. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!editTask) return;
    try {
      const id = getTaskId(editTask);
      const response = await axios.put(`${API_ROOT}/api/tasks/${id}`, editTask);
      dispatch(updateTask({ ...response.data, id: response.data._id }));
      setEditTask(null);
    } catch (err) {
      console.error("Failed to update task:", err);
      showToast("Failed to update task.", "error");
      return;
    }
    showToast("✅ Task updated!");
  };

  const handleEditFiles = async (e, taskId) => {
    const currentTask = tasks.find((t) => String(t._id || t.id) === String(taskId));
    if (!currentTask) return;
    const newFiles = [];

    for (const f of Array.from(e.target.files)) {
      const url = await fileToBase64(f);
      newFiles.push({
        name: f.name,
        type: f.type,
        url,
        size: f.size,
        uploadedBy: "Admin",
        uploadedAt: new Date().toISOString(),
      });
    }

    const attachments = [...(currentTask.attachments || []), ...newFiles];

    try {
      const response = await axios.put(`${API_ROOT}/api/tasks/${taskId}`, { attachments });
      dispatch(updateTask({ ...response.data, id: response.data._id }));
    } catch (err) {
      console.error("Failed to upload task attachment:", err);
      newFiles.forEach((attachment) => dispatch(addAttachment({ taskId, attachment })));
    }
  };

  const getDeptColor = (dept) => HR_DEPT_CONFIG[dept]?.color || "#1a2332";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 px-6 py-5 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              📋 Task Management
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Assign & monitor staff tasks · {employees.length} staff loaded from HR
            </p>
          </div>

          {/* Summary Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { label: "Total",       value: taskSummary.total,      color: "bg-gray-100 text-gray-700"  },
              { label: "Pending",     value: taskSummary.pending,    color: "bg-amber-100 text-amber-700" },
              { label: "In Progress", value: taskSummary.inProgress, color: "bg-blue-100 text-blue-700"  },
              { label: "Done",        value: taskSummary.done,       color: "bg-green-100 text-green-700" },
            ].map((s) => (
              <span key={s.label} className={`text-xs font-bold px-3 py-1 rounded-full ${s.color}`}>
                {s.label}: {s.value}
              </span>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1">
            {[
              { id: "assign", label: "➕ Assign Task" },
              { id: "all",    label: `📊 All Tasks (${tasks.length})` },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  tab === t.id
                    ? "bg-white shadow text-blue-700"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-6">

        {/* ═══════════════════════════════ ASSIGN TAB ════════════════════════ */}
        {tab === "assign" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* ── Staff Selector ─────────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide">
                  👤 Select Staff Member
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Staff list from HR &amp; Staff module
                </p>
              </div>

              {/* Search + dept filter */}
              <div className="px-4 pt-4 pb-2 space-y-2">
                <input
                  type="text"
                  value={empSearch}
                  onChange={(e) => setEmpSearch(e.target.value)}
                  placeholder="Search by name, ID or role..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition"
                />
                <div className="flex gap-2 overflow-x-auto pb-1">
                  <button
                    onClick={() => setDeptFilter("all")}
                    className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full font-semibold border transition ${
                      deptFilter === "all"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    All Depts
                  </button>
                  {depts.map((dk) => {
                    const dc = HR_DEPT_CONFIG[dk];
                    return (
                      <button
                        key={dk}
                        onClick={() => setDeptFilter(dk)}
                        className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full font-semibold border transition`}
                        style={
                          deptFilter === dk
                            ? { backgroundColor: dc.color, color: "#fff", borderColor: dc.color }
                            : { backgroundColor: "#fff", color: "#555", borderColor: "#e5e7eb" }
                        }
                      >
                        {dc.icon} {dc.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Employee list */}
              <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto px-2 pb-3">
                {filteredEmps.length === 0 && (
                  <p className="text-center py-8 text-gray-400 text-sm">
                    No staff found
                  </p>
                )}
                {filteredEmps.map((e) => {
                  const dc = HR_DEPT_CONFIG[e.dept];
                  const isSelected = e.id === selectedId;
                  return (
                    <button
                      key={e.id}
                      onClick={() => setSelectedId(e.id)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition ${
                        isSelected
                          ? "bg-blue-50 border border-blue-200"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                        style={{ backgroundColor: dc?.color || "#1a2332" }}
                      >
                        {getInitials(e.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 text-sm truncate">
                          {e.name}
                        </div>
                        <div className="text-xs text-gray-400 truncate">
                          <code className="text-blue-600">{e.id}</code> · {e.role}
                          {dc && (
                            <span
                              className="ml-1.5 px-1.5 py-0.5 rounded-full text-white text-[10px] font-semibold"
                              style={{ backgroundColor: dc.color }}
                            >
                              {dc.icon} {dc.label}
                            </span>
                          )}
                        </div>
                        {e.mobile && (
                          <div className="text-[10px] text-gray-300">
                            📱 {e.mobile} · Staff password: {String(e.mobile).replace(/\D/g, "").slice(-6)}
                          </div>
                        )}
                      </div>
                      {isSelected && (
                        <span className="text-blue-600 text-lg flex-shrink-0">✓</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Selected employee summary */}
              {selectedEmp && (
                <div
                  className="mx-4 mb-4 rounded-xl px-4 py-3 text-sm text-white font-semibold flex items-center gap-2"
                  style={{ backgroundColor: getDeptColor(selectedEmp.dept) }}
                >
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
                    {getInitials(selectedEmp.name)}
                  </div>
                  <div>
                    <div>{selectedEmp.name}</div>
                    <div className="text-xs font-normal opacity-80">
                      {selectedEmp.id} · {selectedEmp.role}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Task Form ──────────────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide">
                  📝 Task Details
                </h2>
                {selectedEmp ? (
                  <p className="text-xs text-blue-600 mt-0.5 font-semibold">
                    Assigning to: {selectedEmp.name}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 mt-0.5">
                    Select a staff member first
                  </p>
                )}
              </div>

              <div className="px-5 py-5 space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Prepare monthly report"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Task details, steps, expectations..."
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition resize-none"
                  />
                </div>

                {/* Priority + Due Date + Time */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Priority
                    </label>
                    <select
                      value={form.priority}
                      onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 transition"
                    >
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={form.dueDate}
                      onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Due Time
                    </label>
                    <input
                      type="time"
                      value={form.dueTime}
                      onChange={(e) => setForm((p) => ({ ...p, dueTime: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 transition"
                    />
                  </div>
                </div>

                {/* Admin Notes */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Admin Notes (internal)
                  </label>
                  <textarea
                    value={form.adminNotes}
                    onChange={(e) => setForm((p) => ({ ...p, adminNotes: e.target.value }))}
                    placeholder="Internal notes (not visible to staff)"
                    rows={2}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition resize-none"
                  />
                </div>

                {/* Attachments */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Attach Files
                  </label>
                  <input
                    ref={fileRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-200 rounded-xl py-3 text-sm text-gray-500 hover:border-blue-300 hover:text-blue-600 transition flex items-center justify-center gap-2"
                  >
                    📎 Click to attach files
                  </button>
                  {attachments.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {attachments.map((a, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-1 bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1 text-xs text-blue-700"
                        >
                          {a.type?.startsWith("image/") ? "🖼" : "📄"} {a.name}
                          <button
                            onClick={() =>
                              setAttachments((p) => p.filter((_, j) => j !== i))
                            }
                            className="ml-1 text-red-400 hover:text-red-600"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !selectedId || !form.title.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition text-sm"
                >
                  {submitting ? "Assigning..." : "📋 Assign Task"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════ ALL TASKS TAB ═════════════════════ */}
        {tab === "all" && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Filters */}
            <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-3 flex-wrap">
              <h2 className="font-bold text-gray-800 flex-1 text-sm uppercase tracking-wide">
                All Assigned Tasks ({allFiltered.length})
              </h2>
              <select
                value={filterEmp}
                onChange={(e) => setFilterEmp(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none hover:border-blue-400"
              >
                <option value="all">All Staff</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.id})
                  </option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none hover:border-blue-400"
              >
                <option value="all">All Status</option>
                <option>Pending</option>
                <option>In Progress</option>
                <option>Done</option>
                <option>Rejected</option>
              </select>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none hover:border-blue-400"
              >
                <option value="all">All Priority</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>

            {/* Task rows */}
            <div className="divide-y divide-gray-100">
              {allFiltered.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                  <div className="text-4xl mb-3">📭</div>
                  <p className="font-semibold">No tasks match your filters</p>
                </div>
              )}

              {allFiltered.map((task) => {
                const pc = PRIORITY[task.priority] || PRIORITY.Medium;
                const taskId = getTaskId(task);
                const assignedEmpId = getAssignedEmpId(task);
                const emp = employees.find((e) => e.id === assignedEmpId);
                const taskWorkUpdates = workUpdatesByTask[String(taskId)] || [];
                const latestWorkUpdate = taskWorkUpdates[0];
                const isOverdue =
                  task.dueDate &&
                  new Date(task.dueDate) < new Date() &&
                  task.status !== "Done";

                return (
                  <div key={taskId} className="px-5 py-4 hover:bg-gray-50 transition">
                    <div className="flex items-start gap-4">
                      <div className={`mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${pc.dot}`} />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-900 text-sm">
                            {task.title}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${pc.badge}`}>
                            {task.priority}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_STYLE[task.status]}`}>
                            {task.status}
                          </span>
                          {isOverdue && (
                            <span className="text-xs bg-red-100 text-red-600 border border-red-300 px-2 py-0.5 rounded-full font-semibold">
                              ⚠️ Overdue
                            </span>
                          )}
                        </div>

                        {task.description && (
                          <p className="text-xs text-gray-500 mt-1 max-w-xl line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-400 flex-wrap">
                          {emp ? (
                            <span className="flex items-center gap-1">
                              <div
                                className="w-4 h-4 rounded-full flex items-center justify-center text-white font-bold text-[8px]"
                                style={{ backgroundColor: getDeptColor(emp.dept) }}
                              >
                                {getInitials(emp.name)}
                              </div>
                              {emp.name} · <code className="text-blue-500">{emp.id}</code>
                            </span>
                          ) : (task.assignedToName || task.assignedTo) ? (
                            <span className="flex items-center gap-1 text-gray-700">
                              <div className="w-4 h-4 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-[8px]">
                                {getInitials(task.assignedToName || task.assignedTo)}
                              </div>
                              {task.assignedToName ? task.assignedToName : "Assigned"} · <code className="text-blue-500">{task.assignedTo}</code>
                            </span>
                          ) : null}
                          {task.dueDate && (
                            <span className={isOverdue ? "text-red-500 font-semibold" : ""}>
                              📅 {task.dueDate}{task.dueTime ? ` ${task.dueTime}` : ""}
                            </span>
                          )}
                          <span>🕒 {new Date(task.createdAt).toLocaleDateString("en-IN")}</span>
                          <code className="bg-gray-100 px-1.5 rounded">{taskId}</code>
                          {task.attachments?.length > 0 && (
                            <span>📎 {task.attachments.length} file(s)</span>
                          )}
                          {task.staffRemark && (
                            <span className="text-blue-600">💬 "{task.staffRemark}"</span>
                          )}
                        </div>

                        {taskWorkUpdates.length > 0 && (
                          <div className="mt-1.5 text-xs text-emerald-600 font-semibold">
                            Staff updates: {taskWorkUpdates.length}
                          </div>
                        )}

                        {latestWorkUpdate && (
                          <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                              <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                                What did you do?
                              </p>
                              <span className="text-[11px] font-semibold text-emerald-700 bg-white/70 border border-emerald-100 rounded-full px-2 py-0.5">
                                {latestWorkUpdate.staffName || task.assignedToName || "Staff"}
                                {formatSubmittedAt(latestWorkUpdate.submittedAt)
                                  ? ` - ${formatSubmittedAt(latestWorkUpdate.submittedAt)}`
                                  : ""}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-gray-800 whitespace-pre-wrap">
                              {latestWorkUpdate.workDescription}
                            </p>
                            <div className="mt-2 flex items-center gap-2 text-[11px] text-emerald-700 flex-wrap">
                              {latestWorkUpdate.workType && <span>{latestWorkUpdate.workType}</span>}
                              {latestWorkUpdate.duration ? <span>{latestWorkUpdate.duration} min</span> : null}
                              {taskWorkUpdates.length > 1 && (
                                <span>Latest of {taskWorkUpdates.length} updates</span>
                              )}
                            </div>

                            {latestWorkUpdate.proofAttachments?.length > 0 && (
                              <div className="mt-3">
                                <p className="text-xs font-semibold text-gray-600 mb-1.5">
                                  Uploaded proof/document
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {latestWorkUpdate.proofAttachments.map((file, i) => {
                                    const fileUrl = getProofUrl(file);
                                    const fileType = getProofType(file);
                                    const fileName = getProofName(file);
                                    const fileSize = formatBytes(getProofSize(file));

                                    return (
                                      <a
                                        key={`${fileName}-${i}`}
                                        href={fileUrl || undefined}
                                        download={fileName}
                                        target="_blank"
                                        rel="noreferrer"
                                        className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${
                                          fileUrl
                                            ? "bg-white text-blue-700 border-blue-100 hover:underline"
                                            : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                        }`}
                                        onClick={(e) => {
                                          if (!fileUrl) e.preventDefault();
                                        }}
                                      >
                                        {fileType?.startsWith("image/") ? "Image" : "Document"}: {fileName}
                                        {fileSize && <span className="text-gray-400 font-normal">({fileSize})</span>}
                                      </a>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Attachments list */}
                        {task.attachments?.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {task.attachments.map((att, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-1 bg-gray-100 rounded-lg px-2 py-1 text-xs"
                              >
                                <a
                                  href={att.url}
                                  download={att.name}
                                  className="text-blue-600 hover:underline"
                                >
                                  {att.type?.startsWith("image/") ? "🖼" : "📄"} {att.name}
                                </a>
                                <button
                                  onClick={() =>
                                    dispatch(removeAttachment({ taskId, attachIdx: i }))
                                  }
                                  className="text-red-400 hover:text-red-600 ml-1"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add file to existing task */}
                        <div className="mt-2">
                          <input
                            type="file"
                            multiple
                            accept="image/*,.pdf,.doc,.docx"
                            className="hidden"
                            id={`admin-upload-${taskId}`}
                            onChange={(e) => handleEditFiles(e, taskId)}
                          />
                          <label
                            htmlFor={`admin-upload-${taskId}`}
                            className="text-xs text-blue-600 hover:underline cursor-pointer"
                          >
                            + Add file
                          </label>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => setEditTask({ ...task })}
                          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-3 py-1.5 rounded-lg transition"
                        >
                          ✏️ Edit
                        </button>
                        {taskWorkUpdates.length > 0 && (
                          <button
                            onClick={() => setShowUpdatesFor(showUpdatesFor === taskId ? null : taskId)}
                            className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold px-3 py-1.5 rounded-lg transition"
                          >
                            📝 Updates ({taskWorkUpdates.length})
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete task "${task.title}"?`)) {
                              axios.delete(`${API_ROOT}/api/tasks/${getTaskId(task)}`).catch((err) => {
                                console.error("Failed to delete task from backend:", err);
                              });
                              dispatch(deleteTask(getTaskId(task)));
                            }
                          }}
                          className="text-red-400 hover:text-red-600 p-1.5 rounded transition"
                          title="Delete task"
                        >
                          🗑
                        </button>
                      </div>
                    </div>

                    {/* Show all updates if expanded */}
                    {showUpdatesFor === taskId && taskWorkUpdates.length > 0 && (
                      <div className="mt-4 border-t border-gray-200 pt-4">
                        <h4 className="text-sm font-semibold text-gray-800 mb-3">All Work Updates (Time-wise)</h4>
                        <div className="space-y-3">
                          {taskWorkUpdates.map((update, idx) => (
                            <div key={idx} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                              <div className="flex items-center justify-between gap-3 mb-2">
                                <span className="text-sm font-semibold text-gray-800">
                                  {update.staffName || "Staff"}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatSubmittedAt(update.submittedAt)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 mb-2 whitespace-pre-wrap">
                                {update.workDescription}
                              </p>
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                {update.workType && <span>Type: {update.workType}</span>}
                                {update.duration && <span>Duration: {update.duration} min</span>}
                              </div>
                              {update.proofAttachments?.length > 0 && (
                                <div className="mt-3">
                                  <p className="text-xs font-semibold text-gray-600 mb-1">Attachments:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {update.proofAttachments.map((file, i) => {
                                      const fileUrl = getProofUrl(file);
                                      const fileType = getProofType(file);
                                      const fileName = getProofName(file);
                                      return (
                                        <a
                                          key={i}
                                          href={fileUrl || undefined}
                                          download={fileName}
                                          target="_blank"
                                          rel="noreferrer"
                                          className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-xs ${
                                            fileUrl
                                              ? "bg-white text-blue-700 border-blue-200 hover:underline"
                                              : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                          }`}
                                        >
                                          {fileType?.startsWith("image/") ? "🖼" : "📄"} {fileName}
                                        </a>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Edit Modal ───────────────────────────────────────────────────────── */}
      {editTask && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setEditTask(null)}
        >
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Edit Task</h2>
              <button
                onClick={() => setEditTask(null)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>
            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Title</label>
                <input
                  type="text"
                  value={editTask.title}
                  onChange={(e) => setEditTask((p) => ({ ...p, title: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                <textarea
                  value={editTask.description}
                  onChange={(e) => setEditTask((p) => ({ ...p, description: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Priority</label>
                  <select
                    value={editTask.priority}
                    onChange={(e) => setEditTask((p) => ({ ...p, priority: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none"
                  >
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                  <select
                    value={editTask.status}
                    onChange={(e) => setEditTask((p) => ({ ...p, status: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none"
                  >
                    <option>Pending</option>
                    <option>In Progress</option>
                    <option>Done</option>
                    <option>Rejected</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={editTask.dueDate}
                    onChange={(e) => setEditTask((p) => ({ ...p, dueDate: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Due Time</label>
                  <input
                    type="time"
                    value={editTask.dueTime}
                    onChange={(e) => setEditTask((p) => ({ ...p, dueTime: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Admin Notes</label>
                <textarea
                  value={editTask.adminNotes}
                  onChange={(e) => setEditTask((p) => ({ ...p, adminNotes: e.target.value }))}
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none resize-none"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setEditTask(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSubmit}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
