import { useEffect, useState } from "react";
import api from "../../../services/api";
import { Plus, Edit, Trash2, Search, SlidersHorizontal, X, Heart, Pill, Utensils, Stethoscope } from "lucide-react";

// ─── Tab Config ────────────────────────────────────────────────────────────────

const TABS = [
  {
    key: "vitals",
    label: "Vitals",
    icon: Heart,
    color: "rose",
    url: "/nursing/vitals",
    accent: "#e11d48",
    activeBtn: "bg-rose-500 text-white border-rose-500",
    savebtn: "bg-rose-500 hover:bg-rose-600",
    badge: "bg-rose-50 text-rose-700 ring-rose-200",
    dot: "bg-rose-400",
    ring: "ring-rose-200",
    glow: "#fda4af",
  },
  {
    key: "medical",
    label: "Medical Records",
    icon: Pill,
    color: "blue",
    url: "/nursing/medical",
    accent: "#2563eb",
    activeBtn: "bg-blue-600 text-white border-blue-600",
    savebtn: "bg-blue-600 hover:bg-blue-700",
    badge: "bg-blue-50 text-blue-700 ring-blue-200",
    dot: "bg-blue-400",
    ring: "ring-blue-200",
    glow: "#93c5fd",
  },
  {
    key: "food",
    label: "Food Register",
    icon: Utensils,
    color: "emerald",
    url: "/nursing/food",
    accent: "#059669",
    activeBtn: "bg-emerald-600 text-white border-emerald-600",
    savebtn: "bg-emerald-600 hover:bg-emerald-700",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    dot: "bg-emerald-400",
    ring: "ring-emerald-200",
    glow: "#6ee7b7",
  },
  {
    key: "checkup",
    label: "Doctor Checkup",
    icon: Stethoscope,
    color: "violet",
    url: "/nursing/doctor-checkup",
    accent: "#7c3aed",
    activeBtn: "bg-violet-600 text-white border-violet-600",
    savebtn: "bg-violet-600 hover:bg-violet-700",
    badge: "bg-violet-50 text-violet-700 ring-violet-200",
    dot: "bg-violet-400",
    ring: "ring-violet-200",
    glow: "#c4b5fd",
  },
];

const FIELD_MAP = {
  vitals: {
    form: { visitorId: "", temperature: "", bloodPressure: "", pulse: "", respiration: "", notes: "", recordedBy: "" },
    fields: [
      { name: "visitorId",     label: "Visitor ID",        type: "text",   span: 1 },
      { name: "temperature",   label: "Temperature (°C)",  type: "number", span: 1 },
      { name: "bloodPressure", label: "Blood Pressure",    type: "text",   span: 1 },
      { name: "pulse",         label: "Pulse",             type: "number", span: 1 },
      { name: "respiration",   label: "Respiration",       type: "number", span: 1 },
      { name: "recordedBy",    label: "Recorded By",       type: "text",   span: 1 },
      { name: "notes",         label: "Notes",             type: "text",   span: 2 },
    ],
  },
  medical: {
    form: { visitorId: "", medication: "", dosage: "", frequency: "", administeredAt: "", notes: "", recordedBy: "" },
    fields: [
      { name: "visitorId",      label: "Visitor ID",      type: "text",   span: 1 },
      { name: "medication",     label: "Medication",      type: "text",   span: 1 },
      { name: "dosage",         label: "Dosage",          type: "text",   span: 1 },
      { name: "frequency",      label: "Frequency",       type: "text",   span: 1 },
      { name: "administeredAt", label: "Administered At", type: "date",   span: 1 },
      { name: "recordedBy",     label: "Recorded By",     type: "text",   span: 1 },
      { name: "notes",          label: "Notes",           type: "text",   span: 2 },
    ],
  },
  food: {
    form: { visitorId: "", mealType: "", items: "", quantity: "", servedAt: "", notes: "", recordedBy: "" },
    fields: [
      { name: "visitorId",  label: "Visitor ID",  type: "text", span: 1 },
      { name: "mealType",   label: "Meal Type",   type: "select", options: ["Breakfast", "Lunch", "Evening Snack", "Dinner"], span: 1 },
      { name: "items",      label: "Items",       type: "text", span: 2 },
      { name: "quantity",   label: "Quantity",    type: "text", span: 1 },
      { name: "servedAt",   label: "Served At",   type: "date", span: 1 },
      { name: "recordedBy", label: "Recorded By", type: "text", span: 1 },
      { name: "notes",      label: "Notes",       type: "text", span: 2 },
    ],
  },
  checkup: {
    form: { visitorId: "", doctorName: "", diagnosis: "", treatment: "", checkupDate: "", nextCheckup: "", notes: "", recordedBy: "" },
    fields: [
      { name: "visitorId",   label: "Visitor ID",   type: "text", span: 1 },
      { name: "doctorName",  label: "Doctor Name",  type: "text", span: 1 },
      { name: "diagnosis",   label: "Diagnosis",    type: "text", span: 2 },
      { name: "treatment",   label: "Treatment",    type: "text", span: 2 },
      { name: "checkupDate", label: "Checkup Date", type: "date", span: 1 },
      { name: "nextCheckup", label: "Next Checkup", type: "date", span: 1 },
      { name: "recordedBy",  label: "Recorded By",  type: "text", span: 1 },
      { name: "notes",       label: "Notes",        type: "text", span: 2 },
    ],
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const buildEmpty = (tab) => ({ ...FIELD_MAP[tab].form });

const fmtVal = (v, type) => {
  if (!v && v !== 0) return "—";
  if (type === "date") {
    const d = new Date(v);
    return isNaN(d) ? v : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  }
  return v;
};

// Vital reading color cues
const vitalBg = (field, val) => {
  if (!val) return "";
  const n = parseFloat(val);
  if (field === "temperature") {
    if (n < 35 || n > 38.5) return "text-rose-600 font-semibold";
    return "text-emerald-700";
  }
  if (field === "pulse") {
    if (n < 60 || n > 100) return "text-rose-600 font-semibold";
    return "text-emerald-700";
  }
  return "";
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ tab, count }) => {
  const Icon = tab.icon;
  return (
    <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4 flex items-center gap-4 shadow-sm">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${tab.accent}18` }}>
        <Icon className="w-5 h-5" style={{ color: tab.accent }} />
      </div>
      <div>
        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{tab.label}</p>
        <p className="text-2xl font-semibold text-slate-900 mt-0.5">{count}</p>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function NursingRecordsView() {
  const [activeTab,     setActiveTab]     = useState("vitals");
  const [allRecords,    setAllRecords]    = useState({ vitals: [], medical: [], food: [], checkup: [] });
  const [loading,       setLoading]       = useState(false);
  const [showModal,     setShowModal]     = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [showFilters,   setShowFilters]   = useState(false);
  const [formData,      setFormData]      = useState(buildEmpty("vitals"));
  const [filters,       setFilters]       = useState({ dateFrom: "", dateTo: "", searchTerm: "" });

  const tabMeta      = TABS.find((t) => t.key === activeTab);
  const TabIcon      = tabMeta.icon;
  const activeFields = FIELD_MAP[activeTab].fields;

  useEffect(() => { fetchData(activeTab); }, [activeTab]);

  const fetchData = async (tab) => {
    setLoading(true);
    try {
      const res = await api.get(FIELD_MAP[tab].url || TABS.find((t) => t.key === tab).url);
      setAllRecords((p) => ({ ...p, [tab]: res.data.data || [] }));
    } catch (e) {
      console.error(e);
      setAllRecords((p) => ({ ...p, [tab]: [] }));
    }
    setLoading(false);
  };

  const filteredRecords = (allRecords[activeTab] || []).filter((r) => {
    const from  = !filters.dateFrom || new Date(r.createdAt) >= new Date(filters.dateFrom);
    const to    = !filters.dateTo   || new Date(r.createdAt) <= new Date(filters.dateTo);
    const q     = filters.searchTerm.trim().toLowerCase();
    const match = !q || Object.values(r).some((v) => typeof v === "string" && v.toLowerCase().includes(q));
    return from && to && match;
  });

  const handleTabChange = (key) => {
    setActiveTab(key);
    setFormData(buildEmpty(key));
    setFilters({ dateFrom: "", dateTo: "", searchTerm: "" });
    setShowFilters(false);
  };

  const handleAddNew = () => {
    setEditingRecord(null);
    setFormData(buildEmpty(activeTab));
    setShowModal(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    const patched = activeFields.reduce((acc, f) => {
      const v = record[f.name];
      acc[f.name] = f.type === "date" && v
        ? new Date(v).toISOString().slice(0, 10)
        : (v ?? "");
      return acc;
    }, {});
    setFormData(patched);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      await api.delete(`${TABS.find((t) => t.key === activeTab).url}/${id}`);
      fetchData(activeTab);
    } catch (e) { console.error(e); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = TABS.find((t) => t.key === activeTab).url;
      if (editingRecord) await api.put(`${url}/${editingRecord._id}`, formData);
      else               await api.post(url, formData);
      setShowModal(false);
      setEditingRecord(null);
      fetchData(activeTab);
    } catch (e) { console.error(e); }
  };

  return (
    <div className="min-h-screen bg-slate-50/60">

      {/* ── Page Header ── */}
      <div className="bg-white border-b border-slate-200 px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm" style={{ background: tabMeta.accent }}>
            <TabIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-slate-900 leading-tight">Nursing Records</h1>
            <p className="text-xs text-slate-400 mt-0.5">Manage nursing entries for patients and visitors</p>
          </div>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-1.5 px-4 py-2 text-white text-sm font-medium rounded-xl shadow-sm active:scale-95 transition-all"
          style={{ background: tabMeta.accent }}
        >
          <Plus className="w-4 h-4" />
          Add Record
        </button>
      </div>

      <div className="px-6 py-5 space-y-4">

        {/* ── Tab Buttons ── */}
        <div className="flex gap-2 flex-wrap">
          {TABS.map((tab) => {
            const Icon     = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                  isActive
                    ? tab.activeBtn
                    : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {isActive && (
                  <span className="ml-1 rounded-full bg-white/25 px-2 py-0.5 text-xs font-medium">
                    {filteredRecords.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Summary Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TABS.map((tab) => (
            <StatCard key={tab.key} tab={tab} count={allRecords[tab.key]?.length || 0} />
          ))}
        </div>

        {/* ── Records Table Card ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

          {/* Toolbar */}
          <div className="px-5 py-4 border-b border-slate-100 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <TabIcon className="w-4 h-4" style={{ color: tabMeta.accent }} />
              <h2 className="text-sm font-semibold text-slate-900">{tabMeta.label}</h2>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${tabMeta.badge}`}>
                {filteredRecords.length} records
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search…"
                  value={filters.searchTerm}
                  onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                  className="pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-700 outline-none w-44 transition focus:w-52 focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                />
              </div>
              <button
                onClick={() => setShowFilters((p) => !p)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border transition ${
                  showFilters
                    ? "bg-slate-100 border-slate-300 text-slate-700"
                    : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filters
              </button>
            </div>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Date From</label>
                <input type="date" value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-700 outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-300" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Date To</label>
                <input type="date" value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-700 outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-300" />
              </div>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div
                  className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
                  style={{ borderColor: `${tabMeta.accent} transparent` }}
                />
                <p className="text-xs text-slate-400">Loading records…</p>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: `${tabMeta.accent}12` }}
                >
                  <TabIcon className="w-5 h-5" style={{ color: tabMeta.accent }} />
                </div>
                <p className="text-sm font-medium text-slate-600">No records found</p>
                <p className="text-xs text-slate-400">Click "Add Record" to create the first entry</p>
                <button
                  onClick={handleAddNew}
                  className="mt-1 flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white rounded-xl transition"
                  style={{ background: tabMeta.accent }}
                >
                  <Plus className="w-3.5 h-3.5" /> Add Record
                </button>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {activeFields.map((f) => (
                      <th key={f.name} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                        {f.label}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredRecords.map((record) => (
                    <tr key={record._id} className="group hover:bg-slate-50/80 transition-colors">
                      {activeFields.map((f) => (
                        <td key={f.name} className={`px-4 py-3 text-xs whitespace-nowrap ${vitalBg(f.name, record[f.name]) || "text-slate-700"}`}>
                          {fmtVal(record[f.name], f.type)}
                        </td>
                      ))}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(record)}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(record._id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">

            {/* Modal Header — colored top strip */}
            <div
              className="px-6 py-4 flex items-center justify-between shrink-0"
              style={{ background: `${tabMeta.accent}10`, borderBottom: `2px solid ${tabMeta.accent}25` }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: tabMeta.accent }}
                >
                  <TabIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    {editingRecord ? "Edit" : "New"} — {tabMeta.label}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {editingRecord ? "Update the record details below" : "Fill in the details to add a new entry"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
              <div className="px-6 py-5 grid grid-cols-2 gap-3">
                {activeFields.map((field) => (
                  <div key={field.name} className={field.span === 2 ? "col-span-2" : ""}>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      {field.label}
                    </label>
                    {field.type === "select" ? (
                      <select
                        name={field.name}
                        value={formData[field.name] || ""}
                        onChange={(e) => setFormData((p) => ({ ...p, [field.name]: e.target.value }))}
                        className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-700 outline-none transition"
                        style={{ focusRing: tabMeta.accent }}
                        required
                      >
                        <option value="">Select…</option>
                        {field.options.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input
                        name={field.name}
                        type={field.type}
                        value={formData[field.name] || ""}
                        onChange={(e) => setFormData((p) => ({ ...p, [field.name]: e.target.value }))}
                        placeholder={field.type === "date" ? "" : `Enter ${field.label.toLowerCase()}`}
                        className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-700 outline-none transition focus:ring-2"
                        required={["visitorId", "recordedBy"].includes(field.name)}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0 bg-slate-50/60">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-sm font-medium text-white rounded-xl active:scale-95 transition-all shadow-sm ${tabMeta.savebtn}`}
                >
                  {editingRecord ? "Update Record" : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}