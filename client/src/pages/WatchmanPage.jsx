import { useEffect, useState } from "react";
import api from "../services/api";
import { Plus, Edit, Trash2, SlidersHorizontal, Search, X, Car, Package, Users, Navigation } from "lucide-react";

// ─── Tab Config ────────────────────────────────────────────────────────────────

const TABS = [
  { key: "vehicle",     label: "Vehicle Log",      icon: Car,        color: "amber",   url: "/watchman/vehicle" },
  { key: "material",    label: "Material In/Out",   icon: Package,    color: "teal",    url: "/watchman/material" },
  { key: "staff-inout", label: "Staff In/Out",      icon: Users,      color: "blue",    url: "/watchman/staff-inout" },
  { key: "inmate-move", label: "Inmate Movement",   icon: Navigation, color: "purple",  url: "/watchman/inmate-move" },
];

const COLOR_MAP = {
  amber:  { activeBtn: "bg-amber-500 text-white border-amber-500",  dot: "bg-amber-400",  ring: "ring-amber-200",  text: "text-amber-700",  badge: "bg-amber-50 text-amber-700", accent: "#f59e0b", savebtn: "bg-amber-500 hover:bg-amber-600" },
  teal:   { activeBtn: "bg-teal-600 text-white border-teal-600",    dot: "bg-teal-400",   ring: "ring-teal-200",   text: "text-teal-700",   badge: "bg-teal-50 text-teal-700",   accent: "#0d9488", savebtn: "bg-teal-600 hover:bg-teal-700" },
  blue:   { activeBtn: "bg-blue-600 text-white border-blue-600",    dot: "bg-blue-400",   ring: "ring-blue-200",   text: "text-blue-700",   badge: "bg-blue-50 text-blue-700",   accent: "#2563eb", savebtn: "bg-blue-600 hover:bg-blue-700" },
  purple: { activeBtn: "bg-violet-600 text-white border-violet-600",dot: "bg-violet-400", ring: "ring-violet-200", text: "text-violet-700", badge: "bg-violet-50 text-violet-700",accent: "#7c3aed", savebtn: "bg-violet-600 hover:bg-violet-700" },
};

const FIELD_MAP = {
  vehicle: {
    fields: [
      { name: "visitorId",     label: "Visitor ID",    type: "text" },
      { name: "vehicleNumber", label: "Vehicle No.",   type: "text" },
      { name: "vehicleType",   label: "Vehicle Type",  type: "text" },
      { name: "purpose",       label: "Purpose",       type: "text" },
      { name: "driverName",    label: "Driver Name",   type: "text" },
      { name: "inTime",        label: "In Time",       type: "datetime-local" },
      { name: "outTime",       label: "Out Time",      type: "datetime-local" },
      { name: "recordedBy",    label: "Recorded By",   type: "text" },
    ],
  },
  material: {
    fields: [
      { name: "visitorId",  label: "Visitor ID", type: "text" },
      { name: "item",       label: "Item",       type: "text" },
      { name: "quantity",   label: "Quantity",   type: "text" },
      { name: "inOut",      label: "Direction",  type: "select", options: ["in", "out"] },
      { name: "purpose",    label: "Purpose",    type: "text" },
      { name: "loggedAt",   label: "Logged At",  type: "datetime-local" },
      { name: "recordedBy", label: "Recorded By",type: "text" },
    ],
  },
  "staff-inout": {
    fields: [
      { name: "staffName",  label: "Staff Name",  type: "text" },
      { name: "staffId",    label: "Staff ID",    type: "text" },
      { name: "department", label: "Department",  type: "text" },
      { name: "inTime",     label: "In Time",     type: "datetime-local" },
      { name: "outTime",    label: "Out Time",    type: "datetime-local" },
      { name: "purpose",    label: "Purpose",     type: "text" },
      { name: "recordedBy", label: "Recorded By", type: "text" },
    ],
  },
  "inmate-move": {
    fields: [
      { name: "inmateName",    label: "Inmate Name",   type: "text" },
      { name: "inmateId",      label: "Inmate ID",     type: "text" },
      { name: "fromLocation",  label: "From Location", type: "text" },
      { name: "toLocation",    label: "To Location",   type: "text" },
      { name: "movedAt",       label: "Moved At",      type: "datetime-local" },
      { name: "escortedBy",    label: "Escorted By",   type: "text" },
      { name: "purpose",       label: "Purpose",       type: "text" },
      { name: "recordedBy",    label: "Recorded By",   type: "text" },
    ],
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const buildEmpty = (fields) =>
  fields.reduce((acc, f) => {
    acc[f.name] = f.type === "select" ? (f.options?.[0] ?? "") : "";
    return acc;
  }, {});

const fmtDateTime = (v) => {
  if (!v) return "—";
  const d = new Date(v);
  return isNaN(d) ? v : d.toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

const fmtVal = (v, type) => {
  if (v === null || v === undefined || v === "") return "—";
  if (type === "datetime-local") return fmtDateTime(v);
  return v;
};

// ─── Mini Stat Card ───────────────────────────────────────────────────────────

const StatCard = ({ label, value, color }) => {
  const c = COLOR_MAP[color];
  return (
    <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4 flex items-center gap-4 shadow-sm">
      <div className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
      <div>
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{label}</p>
        <p className={`text-2xl font-semibold mt-0.5 ${c.text}`}>{value}</p>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function WatchmanRecordsView() {
  const [activeTab,     setActiveTab]     = useState("vehicle");
  const [allRecords,    setAllRecords]    = useState({ vehicle: [], material: [], "staff-inout": [], "inmate-move": [] });
  const [loading,       setLoading]       = useState(false);
  const [showModal,     setShowModal]     = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [showFilters,   setShowFilters]   = useState(false);
  const [formData,      setFormData]      = useState(buildEmpty(FIELD_MAP.vehicle.fields));
  const [filters,       setFilters]       = useState({ dateFrom: "", dateTo: "", searchTerm: "" });

  const tabMeta    = TABS.find((t) => t.key === activeTab);
  const colors     = COLOR_MAP[tabMeta.color];
  const activeFields = FIELD_MAP[activeTab].fields;

  useEffect(() => { fetchData(activeTab); }, [activeTab]);

  const fetchData = async (tab) => {
    setLoading(true);
    try {
      const res = await api.get(TABS.find((t) => t.key === tab).url);
      setAllRecords((p) => ({ ...p, [tab]: res.data.data || [] }));
    } catch (e) {
      console.error(e);
      setAllRecords((p) => ({ ...p, [tab]: [] }));
    }
    setLoading(false);
  };

  const filteredRecords = (allRecords[activeTab] || []).filter((r) => {
    const from   = !filters.dateFrom || new Date(r.createdAt) >= new Date(filters.dateFrom);
    const to     = !filters.dateTo   || new Date(r.createdAt) <= new Date(filters.dateTo);
    const q      = filters.searchTerm.trim().toLowerCase();
    const match  = !q || Object.values(r).some((v) => typeof v === "string" && v.toLowerCase().includes(q));
    return from && to && match;
  });

  const handleTabChange = (key) => {
    setActiveTab(key);
    setFormData(buildEmpty(FIELD_MAP[key].fields));
    setFilters({ dateFrom: "", dateTo: "", searchTerm: "" });
    setShowFilters(false);
  };

  const handleAddNew = () => {
    setEditingRecord(null);
    setFormData(buildEmpty(activeFields));
    setShowModal(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormData(
      activeFields.reduce((acc, f) => {
        acc[f.name] = record[f.name] ?? (f.type === "select" ? f.options?.[0] : "");
        return acc;
      }, {})
    );
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      await api.delete(`${tabMeta.url}/${id}`);
      fetchData(activeTab);
    } catch (e) { console.error(e); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRecord) await api.put(`${tabMeta.url}/${editingRecord._id}`, formData);
      else               await api.post(tabMeta.url, formData);
      setShowModal(false);
      setEditingRecord(null);
      fetchData(activeTab);
    } catch (e) { console.error(e); }
  };

  const TabIcon = tabMeta.icon;

  return (
    <div className="min-h-screen bg-slate-50/60">

      {/* ── Page Header ── */}
      <div className="bg-white border-b border-slate-200 px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm`} style={{ background: colors.accent }}>
            <TabIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-slate-900 leading-tight">Watchman Logs</h1>
            <p className="text-xs text-slate-400 mt-0.5">Track gate activity, vehicle movement and staff in/out</p>
          </div>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-1.5 px-4 py-2 text-white text-sm font-medium rounded-xl shadow-sm active:scale-95 transition-all"
          style={{ background: colors.accent }}
        >
          <Plus className="w-4 h-4" />
          Add Record
        </button>
      </div>

      <div className="px-6 py-5 space-y-4">

        {/* ── Tab Buttons ── */}
        <div className="flex gap-2 flex-wrap">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const c    = COLOR_MAP[tab.color];
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                  isActive ? c.activeBtn : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {isActive && (
                  <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium">
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
            <StatCard
              key={tab.key}
              label={tab.label}
              value={allRecords[tab.key]?.length || 0}
              color={tab.color}
            />
          ))}
        </div>

        {/* ── Records Table Card ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

          {/* Toolbar */}
          <div className="px-5 py-4 border-b border-slate-100 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <TabIcon className="w-4 h-4" style={{ color: colors.accent }} />
              <h2 className="text-sm font-semibold text-slate-900">{tabMeta.label}</h2>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${colors.badge} ${colors.ring}`}>
                {filteredRecords.length} records
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search records…"
                  value={filters.searchTerm}
                  onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                  className="pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-700 outline-none transition w-44 focus:w-52 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <button
                onClick={() => setShowFilters((p) => !p)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border transition ${
                  showFilters ? "bg-slate-100 border-slate-300 text-slate-700" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filters
              </button>
            </div>
          </div>

          {/* Filters row */}
          {showFilters && (
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Date From</label>
                <input type="date" value={filters.dateFrom} onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Date To</label>
                <input type="date" value={filters.dateTo} onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
              </div>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${colors.accent} transparent` }} />
                <p className="text-xs text-slate-400">Loading records…</p>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                  <TabIcon className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-600">No records found</p>
                <p className="text-xs text-slate-400">Try adjusting filters or add a new record</p>
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
                    <tr key={record._id} className="group hover:bg-slate-50 transition-colors">
                      {activeFields.map((f) => (
                        <td key={f.name} className="px-4 py-3 text-xs text-slate-700 whitespace-nowrap">
                          {f.name === "inOut"
                            ? <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${record[f.name] === "in" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                                {record[f.name] === "in" ? "Incoming" : "Outgoing"}
                              </span>
                            : fmtVal(record[f.name], f.type)}
                        </td>
                      ))}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEdit(record)}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition" title="Edit">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(record._id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition" title="Delete">
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
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg max-h-[88vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: colors.accent }}>
                  <TabIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    {editingRecord ? "Edit" : "New"} — {tabMeta.label}
                  </h3>
                  <p className="text-xs text-slate-400">{editingRecord ? "Update entry details" : "Fill in the entry details"}</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
              <div className="px-6 py-5 grid grid-cols-2 gap-3">
                {activeFields.map((field) => (
                  <div key={field.name} className={field.name === "purpose" ? "col-span-2" : ""}>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">{field.label}</label>
                    {field.type === "select" ? (
                      <select
                        name={field.name}
                        value={formData[field.name] || ""}
                        onChange={(e) => setFormData((p) => ({ ...p, [field.name]: e.target.value }))}
                        className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
                        required
                      >
                        {field.options.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input
                        name={field.name}
                        type={field.type}
                        value={formData[field.name] || ""}
                        onChange={(e) => setFormData((p) => ({ ...p, [field.name]: e.target.value }))}
                        className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
                        required
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0 bg-slate-50/60">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition">
                  Cancel
                </button>
                <button type="submit"
                  className={`px-5 py-2 text-sm font-medium text-white rounded-xl active:scale-95 transition-all shadow-sm ${colors.savebtn}`}>
                  {editingRecord ? "Update" : "Save"} Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}