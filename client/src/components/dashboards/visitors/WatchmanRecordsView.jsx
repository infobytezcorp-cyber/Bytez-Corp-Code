import { useEffect, useState } from "react";
import api from "../../../services/api";
import { Plus, Edit, Trash2, Filter, Search, X } from "lucide-react";

const DEFAULT_VEHICLE_FORM = {
  visitorId: "",
  vehicleNumber: "",
  vehicleType: "",
  purpose: "",
  driverName: "",
  inTime: "",
  outTime: "",
  recordedBy: "",
};

const DEFAULT_MATERIAL_FORM = {
  visitorId: "",
  item: "",
  quantity: "",
  inOut: "in",
  purpose: "",
  loggedAt: "",
  recordedBy: "",
};

const DEFAULT_STAFF_FORM = {
  staffName: "",
  staffId: "",
  department: "",
  inTime: "",
  outTime: "",
  purpose: "",
  recordedBy: "",
};

const DEFAULT_INMATE_FORM = {
  inmateName: "",
  inmateId: "",
  fromLocation: "",
  toLocation: "",
  movedAt: "",
  escortedBy: "",
  purpose: "",
  recordedBy: "",
};

const TABS = [
  { key: "vehicle", label: "Vehicle Log" },
  { key: "material", label: "Material In/Out" },
  { key: "staff-inout", label: "Staff In/Out" },
  { key: "inmate-move", label: "Inmate Movement" },
];

const TAB_ACTIVE_STYLES = {
  vehicle: "border-amber-500 text-amber-500",
  material: "border-teal-600 text-teal-600",
  "staff-inout": "border-blue-600 text-blue-600",
  "inmate-move": "border-purple-500 text-purple-500",
};

const fieldMap = {
  vehicle: {
    form: DEFAULT_VEHICLE_FORM,
    url: "/watchman/vehicle",
    fields: [
      { name: "visitorId", label: "Visitor ID", type: "text" },
      { name: "vehicleNumber", label: "Vehicle Number", type: "text" },
      { name: "vehicleType", label: "Vehicle Type", type: "text" },
      { name: "purpose", label: "Purpose", type: "text" },
      { name: "driverName", label: "Driver Name", type: "text" },
      { name: "inTime", label: "In Time", type: "datetime-local" },
      { name: "outTime", label: "Out Time", type: "datetime-local" },
      { name: "recordedBy", label: "Recorded By", type: "text" },
    ],
  },
  material: {
    form: DEFAULT_MATERIAL_FORM,
    url: "/watchman/material",
    fields: [
      { name: "visitorId", label: "Visitor ID", type: "text" },
      { name: "item", label: "Item", type: "text" },
      { name: "quantity", label: "Quantity", type: "text" },
      { name: "inOut", label: "In/Out", type: "text" },
      { name: "purpose", label: "Purpose", type: "text" },
      { name: "loggedAt", label: "Logged At", type: "datetime-local" },
      { name: "recordedBy", label: "Recorded By", type: "text" },
    ],
  },
  "staff-inout": {
    form: DEFAULT_STAFF_FORM,
    url: "/watchman/staff-inout",
    fields: [
      { name: "staffName", label: "Staff Name", type: "text" },
      { name: "staffId", label: "Staff ID", type: "text" },
      { name: "department", label: "Department", type: "text" },
      { name: "inTime", label: "In Time", type: "datetime-local" },
      { name: "outTime", label: "Out Time", type: "datetime-local" },
      { name: "purpose", label: "Purpose", type: "text" },
      { name: "recordedBy", label: "Recorded By", type: "text" },
    ],
  },
  "inmate-move": {
    form: DEFAULT_INMATE_FORM,
    url: "/watchman/inmate-move",
    fields: [
      { name: "inmateName", label: "Inmate Name", type: "text" },
      { name: "inmateId", label: "Inmate ID", type: "text" },
      { name: "fromLocation", label: "From Location", type: "text" },
      { name: "toLocation", label: "To Location", type: "text" },
      { name: "movedAt", label: "Moved At", type: "datetime-local" },
      { name: "escortedBy", label: "Escorted By", type: "text" },
      { name: "purpose", label: "Purpose", type: "text" },
      { name: "recordedBy", label: "Recorded By", type: "text" },
    ],
  },
};

const formatValue = (value, type) => {
  if (!value) return "";
  if (type === "datetime-local") {
    return new Date(value).toLocaleString();
  }
  return value;
};

export default function WatchmanRecordsView() {
  const [activeTab, setActiveTab] = useState("vehicle");
  const [records, setRecords] = useState({ vehicle: [], material: [], "staff-inout": [], "inmate-move": [] });
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_VEHICLE_FORM);
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    searchTerm: "",
  });

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  const fetchData = async (tab) => {
    setLoading(true);
    try {
      const response = await api.get(fieldMap[tab].url);
      setRecords((prev) => ({ ...prev, [tab]: response.data.data || [] }));
    } catch (error) {
      console.error(error);
      setRecords((prev) => ({ ...prev, [tab]: [] }));
    }
    setLoading(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (editingRecord) {
        await api.put(`${fieldMap[activeTab].url}/${editingRecord._id}`, formData);
      } else {
        await api.post(fieldMap[activeTab].url, formData);
      }
      setFormData(fieldMap[activeTab].form);
      setShowModal(false);
      setEditingRecord(null);
      fetchData(activeTab);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormData(record);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await api.delete(`${fieldMap[activeTab].url}/${id}`);
        fetchData(activeTab);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleAddNew = () => {
    setEditingRecord(null);
    setFormData(fieldMap[activeTab].form);
    setShowModal(true);
  };

  const filteredRecords = records[activeTab].filter((record) => {
    const matchesDateFrom = !filters.dateFrom || new Date(record.createdAt) >= new Date(filters.dateFrom);
    const matchesDateTo = !filters.dateTo || new Date(record.createdAt) <= new Date(filters.dateTo);

    const search = filters.searchTerm.trim().toLowerCase();
    const matchesSearch =
      !search ||
      Object.keys(record).some((key) =>
        typeof record[key] === "string" && record[key].toLowerCase().includes(search)
      );

    return matchesDateFrom && matchesDateTo && matchesSearch;
  });

  const activeFields = fieldMap[activeTab].fields;

  return (
    <div className="p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Watchman Logs</h2>
          <p className="text-sm text-gray-500">Track gate activity, vehicle movement and staff in/out.</p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Add Record
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
              activeTab === tab.key
                ? `${TAB_ACTIVE_STYLES[tab.key]} border-current bg-white`
                : "border-gray-200 text-gray-600 bg-gray-50 hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-[28px] p-5 mb-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
          <div className="flex items-center gap-2 text-slate-700">
            <Filter size={18} />
            <span className="font-semibold text-slate-800">Filters</span>
          </div>
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search records..."
              value={filters.searchTerm}
              onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-2xl bg-slate-50 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">Date From</label>
            <input
              type="date"
              placeholder="dd-mm-yyyy"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-2xl bg-slate-50 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">Date To</label>
            <input
              type="date"
              placeholder="dd-mm-yyyy"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-2xl bg-slate-50 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-[28px] overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-slate-200">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold text-slate-900">{TABS.find((t) => t.key === activeTab).label}</h3>
            <span className="text-sm text-slate-500">{filteredRecords.length} records</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : filteredRecords.length > 0 ? (
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  {activeFields.map((field) => (
                    <th key={field.name} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {field.label}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr key={record._id} className="hover:bg-gray-50">
                    {activeFields.map((field) => (
                      <td key={field.name} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatValue(record[field.name], field.type)}
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(record)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(record._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12 text-gray-500">No records found.</div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 px-4 py-6">
          <div className="bg-white rounded-[28px] shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 p-6 border-b border-slate-200">
              <div>
                <h3 className="text-2xl font-semibold text-slate-900">
                  {editingRecord ? "Edit" : "Add"} {TABS.find((t) => t.key === activeTab).label}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Capture watchman log details using a clean, structured form.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 p-2 rounded-full transition"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {activeFields.map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {field.label}
                    </label>
                    <input
                      name={field.name}
                      type={field.type}
                      value={formData[field.name] || ""}
                      onChange={handleChange}
                      placeholder={field.type === "datetime-local" ? "dd-mm-yyyy" : "Enter value"}
                      className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
                      required
                    />
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-full sm:w-auto py-3 px-5 border border-slate-300 rounded-2xl text-slate-700 font-medium hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto py-3 px-5 bg-amber-500 text-white rounded-2xl font-medium hover:bg-amber-600 transition"
                >
                  {editingRecord ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
