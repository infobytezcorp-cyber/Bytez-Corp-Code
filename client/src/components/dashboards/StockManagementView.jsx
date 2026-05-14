import { useEffect, useMemo, useState } from "react";
import {
  Search,
  UploadCloud,
  RefreshCcw,
  Edit,
  Trash2,
  X,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Filter,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";

const OPERATION_OPTIONS = ["received", "used"];
const STATUS_OPTIONS = ["Pending", "Verified", "Damaged", "Reviewed"];
const UNIT_OPTIONS = ["pcs", "kg", "litre", "box", "packet", "roll"];
const CATEGORY_OPTIONS = ["Vegetables", "Medications", "Medical Supplies", "Other"];

const STOCK_TEMPLATE_HEADERS = [
  "Item Name",
  "Category",
  "Operation",
  "Quantity",
  "Unit",
  "Date",
  "Expiry Date",
  "Recorded By",
  "Patient Name",
  "Patient ID",
  "Purpose",
  "Remarks",
  "Status",
];

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const getExpiryStatus = (expiryDate) => {
  if (!expiryDate) return { status: "no-date", label: "No Date", color: "slate", icon: "—" };
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffMs = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { status: "expired", label: "Expired", color: "rose", days: diffDays, icon: "⚠️" };
  if (diffDays === 0) return { status: "today", label: "Expires Today", color: "amber", days: 0, icon: "🔴" };
  if (diffDays <= 3) return { status: "critical", label: `${diffDays}d Left`, color: "red", days: diffDays, icon: "🔴" };
  if (diffDays <= 7) return { status: "warning", label: `${diffDays}d Left`, color: "amber", days: diffDays, icon: "🟠" };
  if (diffDays <= 30) return { status: "caution", label: `${diffDays}d Left`, color: "yellow", days: diffDays, icon: "🟡" };
  return { status: "fresh", label: `${diffDays}d Left`, color: "emerald", days: diffDays, icon: "✅" };
};

const StatusBadge = ({ value, type = "status" }) => {
  const statusColors = {
    Pending: "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200",
    Verified: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    Damaged: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
    Reviewed: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  };
  const expiryColors = {
    expired: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
    today: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    critical: "bg-red-50 text-red-700 ring-1 ring-red-200",
    warning: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    caution: "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200",
    fresh: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    "no-date": "bg-slate-50 text-slate-700 ring-1 ring-slate-200",
  };

  const colors = type === "expiry" ? expiryColors : statusColors;
  const cls = colors[value] || "bg-slate-50 text-slate-700 ring-1 ring-slate-200";

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      {value}
    </span>
  );
};

const SummaryCard = ({ label, value, tone = "slate", subtext = "" }) => {
  const tones = {
    slate: "bg-slate-50 text-slate-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
    indigo: "bg-indigo-50 text-indigo-700",
  };
  return (
    <div className={`rounded-2xl border border-slate-200 ${tones[tone]} p-4`}>
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
      {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
    </div>
  );
};

const emptyStock = {
  itemName: "",
  category: "Other",
  operation: "received",
  quantity: "",
  unit: "pcs",
  date: new Date().toISOString().slice(0, 10),
  expiryDate: "",
  status: "Pending",
  remarks: "",
  recordedBy: "",
  purpose: "",
  patientName: "",
  patientId: "",
};

export default function StockManagementView() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    searchTerm: "",
    category: "",
    expiryStatus: "",
    dateFrom: "",
    dateTo: "",
  });
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editRow, setEditRow] = useState(emptyStock);
  const [showModal, setShowModal] = useState(false);
  const [sortBy, setSortBy] = useState("expiry-asc");

  const summary = useMemo(() => {
    const total = records.length;
    const receivedQty = records
      .filter((r) => r.operation === "received")
      .reduce((sum, r) => sum + (Number(r.quantity) || 0), 0);
    const usedQty = records
      .filter((r) => r.operation === "used")
      .reduce((sum, r) => sum + (Number(r.quantity) || 0), 0);
    const balanceQty = receivedQty - usedQty;

    const expiryStatusCounts = { expired: 0, critical: 0, warning: 0, fresh: 0 };
    records.forEach((record) => {
      const status = getExpiryStatus(record.expiryDate).status;
      if (status === "expired") expiryStatusCounts.expired++;
      else if (status === "critical" || status === "today") expiryStatusCounts.critical++;
      else if (status === "warning") expiryStatusCounts.warning++;
      else expiryStatusCounts.fresh++;
    });

    return { total, receivedQty, usedQty, balanceQty, ...expiryStatusCounts };
  }, [records]);

  const filteredAndSortedRecords = useMemo(() => {
    let filtered = records.filter((record) => {
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        if (
          !record.itemName?.toLowerCase().includes(term) &&
          !record.patientName?.toLowerCase().includes(term) &&
          !record.purpose?.toLowerCase().includes(term)
        ) {
          return false;
        }
      }

      if (filters.category && record.category !== filters.category) {
        return false;
      }

      if (filters.expiryStatus) {
        const status = getExpiryStatus(record.expiryDate).status;
        if (status !== filters.expiryStatus) return false;
      }

      if (filters.dateFrom) {
        const recordDate = new Date(record.date);
        if (recordDate < new Date(filters.dateFrom)) return false;
      }

      if (filters.dateTo) {
        const recordDate = new Date(record.date);
        if (recordDate > new Date(filters.dateTo)) return false;
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "expiry-asc") {
        const aExpiry = a.expiryDate ? new Date(a.expiryDate) : new Date("2099-12-31");
        const bExpiry = b.expiryDate ? new Date(b.expiryDate) : new Date("2099-12-31");
        return aExpiry - bExpiry;
      } else if (sortBy === "expiry-desc") {
        const aExpiry = a.expiryDate ? new Date(a.expiryDate) : new Date("1900-01-01");
        const bExpiry = b.expiryDate ? new Date(b.expiryDate) : new Date("1900-01-01");
        return bExpiry - aExpiry;
      } else if (sortBy === "qty-high") {
        return b.quantity - a.quantity;
      } else if (sortBy === "qty-low") {
        return a.quantity - b.quantity;
      } else if (sortBy === "date-new") {
        return new Date(b.date) - new Date(a.date);
      }
      return 0;
    });

    return filtered;
  }, [records, filters, sortBy]);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/stock", {
        params: {
          search: filters.searchTerm || undefined,
          dateFrom: filters.dateFrom || undefined,
          dateTo: filters.dateTo || undefined,
          status: filters.status || undefined,
        },
      });
      setRecords(res.data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Unable to fetch stock records");
      setRecords([]);
    }
    setLoading(false);
  };

  const handleUpload = async () => {
    if (!uploadFile) {
      toast.error("Please choose a CSV or Excel file");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      await api.post("/admin/stock/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadFile(null);
      toast.success("Stock sheet uploaded successfully");
      await fetchRecords();
    } catch (error) {
      console.error(error);
      const errorMessage =
        error.response?.data?.message || error.message || "Upload failed";
      toast.error(errorMessage);
    }
    setUploading(false);
  };

  const handleEdit = (record) => {
    setEditingId(record._id);
    setEditRow({
      itemName: record.itemName || "",
      category: record.category || "Other",
      operation: record.operation || "received",
      quantity: record.quantity?.toString() || "",
      unit: record.unit || "pcs",
      date: record.date ? new Date(record.date).toISOString().slice(0, 10) : "",
      expiryDate: record.expiryDate
        ? new Date(record.expiryDate).toISOString().slice(0, 10)
        : "",
      status: record.status || "Pending",
      remarks: record.remarks || "",
      recordedBy: record.recordedBy || "",
      purpose: record.purpose || "",
      patientName: record.patientName || "",
      patientId: record.patientId || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      await api.put(`/admin/stock/${editingId}`, {
        ...editRow,
        quantity: Number(editRow.quantity) || 0,
      });
      toast.success("Stock updated successfully");
      setEditingId(null);
      setShowModal(false);
      await fetchRecords();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update stock");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this stock record?")) {
      try {
        await api.delete(`/admin/stock/${id}`);
        toast.success("Stock deleted successfully");
        await fetchRecords();
      } catch (error) {
        console.error(error);
        toast.error("Failed to delete stock");
      }
    }
  };

  const handleBulkDeleteExpired = async () => {
    const expiredIds = records
      .filter((r) => getExpiryStatus(r.expiryDate).status === "expired")
      .map((r) => r._id);

    if (expiredIds.length === 0) {
      toast.info("No expired items found");
      return;
    }

    if (
      window.confirm(
        `Delete ${expiredIds.length} expired items? This action cannot be undone.`
      )
    ) {
      try {
        for (const id of expiredIds) {
          await api.delete(`/admin/stock/${id}`);
        }
        toast.success(`Deleted ${expiredIds.length} expired items`);
        await fetchRecords();
      } catch (error) {
        console.error(error);
        toast.error("Failed to delete expired items");
      }
    }
  };

  const exportToCSV = () => {
    if (filteredAndSortedRecords.length === 0) {
      toast.error("No records to export");
      return;
    }

    const rows = filteredAndSortedRecords.map((record) => ({
      "Item Name": record.itemName,
      Category: record.category,
      Operation: record.operation,
      Quantity: record.quantity,
      Unit: record.unit,
      Date: formatDate(record.date),
      "Expiry Date": formatDate(record.expiryDate),
      "Days Left": getExpiryStatus(record.expiryDate).days || "N/A",
      "Recorded By": record.recordedBy,
      "Patient Name": record.patientName,
      "Patient ID": record.patientId,
      Purpose: record.purpose,
      Remarks: record.remarks,
      Status: record.status,
    }));

    const headers = Object.keys(rows[0]);
    const csv = [headers.join(","), ...rows.map((row) => headers.map((h) => `"${row[h] || ""}"`).join(","))].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `stock-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Export successful");
  };

  return (
    <div className="min-h-screen bg-slate-50/60">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-sm">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Stock Management</h1>
            <p className="text-xs text-slate-400">Real-time warehouse inventory tracking</p>
          </div>
        </div>
        <button
          onClick={fetchRecords}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition"
        >
          <RefreshCcw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="p-6 bg-slate-50">
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
          <SummaryCard label="Total Items" value={summary.total} tone="slate" />
          <SummaryCard
            label="Balance Qty"
            value={summary.balanceQty}
            tone="emerald"
            subtext={`Received: ${summary.receivedQty}`}
          />
          <SummaryCard
            label="🔴 Expired"
            value={summary.expired}
            tone="rose"
            subtext="Remove now"
          />
          <SummaryCard
            label="🟠 Critical"
            value={summary.critical}
            tone="amber"
            subtext="Expires soon"
          />
          <SummaryCard
            label="✅ Fresh"
            value={summary.fresh}
            tone="emerald"
            subtext="Good condition"
          />
        </div>
      </div>

      {/* Upload & Filters */}
      <div className="p-6 space-y-4">
        {/* Upload Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept=".csv, .xlsx"
                onChange={(e) => setUploadFile(e.target.files?.[0])}
                className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-600 file:text-white file:font-medium"
              />
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-60 transition"
              >
                <UploadCloud className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Upload CSV/Excel with: Item Name, Category, Operation, Quantity, Unit, Date, Expiry Date, etc.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-6">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Item, patient, purpose..."
                  value={filters.searchTerm}
                  onChange={(e) => setFilters((p) => ({ ...p, searchTerm: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters((p) => ({ ...p, category: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200"
              >
                <option value="">All categories</option>
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Expiry Status</label>
              <select
                value={filters.expiryStatus}
                onChange={(e) => setFilters((p) => ({ ...p, expiryStatus: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200"
              >
                <option value="">All statuses</option>
                <option value="expired">🔴 Expired</option>
                <option value="critical">🔴 Critical (0-3d)</option>
                <option value="warning">🟠 Warning (4-7d)</option>
                <option value="caution">🟡 Caution (8-30d)</option>
                <option value="fresh">✅ Fresh (30d+)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200"
              >
                <option value="expiry-asc">Expiry: Soonest</option>
                <option value="expiry-desc">Expiry: Latest</option>
                <option value="qty-high">Quantity: High</option>
                <option value="qty-low">Quantity: Low</option>
                <option value="date-new">Date: Newest</option>
              </select>
            </div>

            <button
              onClick={() =>
                setFilters({ searchTerm: "", category: "", expiryStatus: "", dateFrom: "", dateTo: "" })
              }
              className="h-full px-3 py-2 text-sm font-medium bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition"
            >
              Clear
            </button>

            <button
              onClick={exportToCSV}
              className="h-full px-3 py-2 text-sm font-medium bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition flex items-center justify-center gap-1"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        {summary.expired > 0 && (
          <button
            onClick={handleBulkDeleteExpired}
            className="w-full px-4 py-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg hover:bg-rose-100 transition font-medium flex items-center justify-center gap-2"
          >
            <AlertTriangle className="w-5 h-5" />
            Delete {summary.expired} Expired Items
          </button>
        )}
      </div>

      {/* Stock Table */}
      <div className="p-6">
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredAndSortedRecords.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <Package className="w-12 h-12 text-slate-300" />
                <p className="text-sm font-medium text-slate-600">No stock records found</p>
              </div>
            ) : (
              <table className="w-full text-sm border-collapse">
                <thead className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Item</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Operation</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">Qty</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Expiry</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Notes</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAndSortedRecords.map((record) => {
                    const expiryInfo = getExpiryStatus(record.expiryDate);
                    const isExpired = expiryInfo.status === "expired";

                    return (
                      <tr
                        key={record._id}
                        className={`hover:bg-slate-50 transition ${
                          isExpired ? "bg-rose-50/30" : ""
                        }`}
                      >
                        <td className="px-4 py-3 font-medium text-slate-900">{record.itemName}</td>
                        <td className="px-4 py-3 text-slate-700">
                          <span className="inline-block bg-slate-100 px-2 py-1 rounded text-xs">
                            {record.category || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-700 capitalize">
                          {record.operation}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-900">
                          {record.quantity} {record.unit}
                        </td>
                        <td className="px-4 py-3 text-slate-700 text-xs">
                          {formatDate(record.date)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs text-slate-700">
                              {formatDate(record.expiryDate)}
                            </span>
                            <StatusBadge value={expiryInfo.label} type="expiry" />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <StatusBadge value={record.status} type="status" />
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600 max-w-xs truncate">
                          {record.remarks || record.purpose || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEdit(record)}
                              className="p-2 hover:bg-emerald-100 rounded-lg text-emerald-600 transition"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(record._id)}
                              className="p-2 hover:bg-rose-100 rounded-lg text-rose-600 transition"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Edit Stock Record</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Item Name</label>
                  <input
                    type="text"
                    value={editRow.itemName}
                    onChange={(e) => setEditRow((p) => ({ ...p, itemName: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={editRow.category}
                    onChange={(e) => setEditRow((p) => ({ ...p, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200"
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Operation</label>
                  <select
                    value={editRow.operation}
                    onChange={(e) => setEditRow((p) => ({ ...p, operation: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200"
                  >
                    {OPERATION_OPTIONS.map((op) => (
                      <option key={op} value={op}>
                        {op}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={editRow.quantity}
                    onChange={(e) => setEditRow((p) => ({ ...p, quantity: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Unit</label>
                  <select
                    value={editRow.unit}
                    onChange={(e) => setEditRow((p) => ({ ...p, unit: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200"
                  >
                    {UNIT_OPTIONS.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={editRow.date}
                    onChange={(e) => setEditRow((p) => ({ ...p, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={editRow.expiryDate}
                    onChange={(e) => setEditRow((p) => ({ ...p, expiryDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select
                    value={editRow.status}
                    onChange={(e) => setEditRow((p) => ({ ...p, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200"
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Recorded By</label>
                  <input
                    type="text"
                    value={editRow.recordedBy}
                    onChange={(e) => setEditRow((p) => ({ ...p, recordedBy: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Remarks</label>
                  <textarea
                    value={editRow.remarks}
                    onChange={(e) => setEditRow((p) => ({ ...p, remarks: e.target.value }))}
                    rows="2"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition"
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
