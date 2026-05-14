import { useEffect, useMemo, useState, useCallback } from "react";
import {
    Search, UploadCloud, RefreshCcw, Edit, Save, X, Package,
    Boxes, TrendingDown, TrendingUp, AlertTriangle, Download,
    FileSpreadsheet, Filter, Clock, ChevronDown, LayoutGrid,
    Zap, BarChart3, Trash2, Plus,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";

// ─── Constants ────────────────────────────────────────────────────────────────
const OPERATION_OPTIONS = ["received", "used", "adjustment"];
const STATUS_OPTIONS = ["Pending", "Verified", "Damaged", "Reviewed", "In Transit"];
const UNIT_OPTIONS = ["pcs", "kg", "litre", "box", "packet", "roll"];
const CATEGORY_OPTIONS = [
    "All",
    "food",
    "non-food",
    "medicine",
    "equipment",
    "other",
]; 
const HEADERS = [
    "Item Name", "Operation", "Quantity", "Unit", "Date", "Expiry Date",
    "Recorded By", "Patient Name", "Patient ID", "Purpose", "Remarks", "Status",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (value) => {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const getFreshness = (record) => {
    if (!record) return "Unknown";
    const qty = Number(record.quantity) || 0;
    if (qty <= 0) return "Out of Stock";
    if (!record.expiryDate) return "Fresh";
    const exp = new Date(record.expiryDate);
    if (Number.isNaN(exp.getTime())) return "Fresh";
    const diff = Math.ceil((exp.getTime() - Date.now()) / 86400000);
    if (diff < 0) return "Expired";
    if (diff <= 7) return "Near Expiry";
    if (diff <= 30) return "Expiring Soon";
    return "Fresh";
};

const buildCsvRows = (rows) => {
    const esc = (v) => String(v ?? "").replace(/"/g, '""');
    return rows.map((r) => HEADERS.map((h) => `"${esc(r[h] ?? "")}"`).join(","));
};

// ─── StatusBadge ──────────────────────────────────────────────────────────────
function StatusBadge({ value }) {
    const map = {
        Pending: "bg-slate-100 text-slate-600 ring-slate-200",
        Verified: "bg-emerald-50 text-emerald-700 ring-emerald-200",
        Damaged: "bg-rose-50 text-rose-700 ring-rose-200",
        Reviewed: "bg-blue-50 text-blue-700 ring-blue-200",
        "In Transit": "bg-amber-50 text-amber-700 ring-amber-200",
        "Out of Stock": "bg-red-50 text-red-700 ring-red-200",
        Expired: "bg-rose-50 text-rose-700 ring-rose-200",
        "Near Expiry": "bg-amber-50 text-amber-700 ring-amber-200",
        "Expiring Soon": "bg-orange-50 text-orange-700 ring-orange-200",
        Fresh: "bg-emerald-50 text-emerald-700 ring-emerald-200",
        Unknown: "bg-slate-100 text-slate-500 ring-slate-200",
    };
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${map[value] ?? map.Pending}`}>
            {value}
        </span>
    );
}

// ─── CategoryBadge ────────────────────────────────────────────────────────────
function CategoryBadge({ value }) {
    const isFood = value === "food";
    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${isFood
                ? "bg-green-50 text-green-700 ring-green-200"
                : "bg-violet-50 text-violet-700 ring-violet-200"
            }`}>
            {isFood ? "🍎" : "🧴"} {value}
        </span>
    );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, tone, delta }) {
    const tones = {
        slate: { wrap: "bg-slate-100 text-slate-600", text: "text-slate-900" },
        emerald: { wrap: "bg-emerald-100 text-emerald-700", text: "text-emerald-700" },
        amber: { wrap: "bg-amber-100 text-amber-700", text: "text-amber-700" },
        rose: { wrap: "bg-rose-100 text-rose-700", text: "text-rose-700" },
        indigo: { wrap: "bg-indigo-100 text-indigo-700", text: "text-indigo-700" },
        blue: { wrap: "bg-blue-100 text-blue-700", text: "text-blue-700" },
    };
    const t = tones[tone] ?? tones.slate;
    return (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 duration-150">
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider truncate">{label}</p>
                    <p className={`text-2xl font-bold mt-2 tracking-tight ${t.text}`}>{value}</p>
                    {delta && (
                        <p className={`text-[11px] mt-1 flex items-center gap-1 font-medium ${delta.up ? "text-emerald-600" : "text-rose-500"}`}>
                            {delta.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {delta.label}
                        </p>
                    )}
                </div>
                <div className={`w-9 h-9 min-w-[36px] rounded-xl grid place-items-center shrink-0 ${t.wrap}`}>
                    <Icon className="w-4 h-4" />
                </div>
            </div>
        </div>
    );
}

// ─── Inline input style ───────────────────────────────────────────────────────
const inp = "w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition bg-white";

// ─── Main Component ───────────────────────────────────────────────────────────
export default function StockMonitorView() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({ searchTerm: "", dateFrom: "", dateTo: "", status: "" });
    const [uploadFile, setUploadFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    // ── Stock Records inline edit ──────────────────────────────────────────────
    const [editingId, setEditingId] = useState(null);
    const [editRow, setEditRow] = useState({});

    // ── All Items inline edit ──────────────────────────────────────────────────
    // itemOverrides: { [itemName]: { category, unit, status } }
    // Applied on top of API data so UI reflects changes instantly on Save.
    const [editingItemName, setEditingItemName] = useState(null);
    const [editItemRow, setEditItemRow] = useState({});
    const [itemOverrides, setItemOverrides] = useState({});

    // ── All Items filter + collapsible ────────────────────────────────────────
    const [itemCategoryFilter, setItemCategoryFilter] = useState("All");
    const [itemSearch, setItemSearch] = useState("");
    const [itemsOpen, setItemsOpen] = useState(false);

    // ── Summary stats ──────────────────────────────────────────────────────────
    const summary = useMemo(() => {
        const receivedQty = records.filter(r => r.operation === "received").reduce((s, r) => s + (Number(r.quantity) || 0), 0);
        const usedQty = records.filter(r => r.operation === "used").reduce((s, r) => s + (Number(r.quantity) || 0), 0);
        const nearExpiry = records.filter(r => ["Near Expiry", "Expiring Soon"].includes(getFreshness(r))).length;
        const expired = records.filter(r => getFreshness(r) === "Expired").length;
        const distinctItems = new Set(records.map(r => r.itemName?.trim() || "")).size;
        return { total: records.length, receivedQty, usedQty, nearExpiry, expired, distinctItems, balanceQty: receivedQty - usedQty };
    }, [records]);

    // ── Item-level summary — merges API data + local overrides ────────────────
    const itemSummary = useMemo(() => {
        const map = {};
        records.forEach((r) => {
            const key = r.itemName?.trim() || "Unknown";
            if (!map[key]) {
                map[key] = {
                    itemName: key,
                    category: r.category || "other",
                    receivedQty: 0,
                    usedQty: 0,
                    balanceQty: 0,
                    nearExpiryQty: 0,
                    expiredQty: 0,
                    unit: r.unit || "",
                    status: r.status || "Pending",
                };
            }
            const qty = Number(r.quantity) || 0;
            if (r.operation === "used") map[key].usedQty += qty;
            else map[key].receivedQty += qty;
            map[key].balanceQty = map[key].receivedQty - map[key].usedQty;
            const f = getFreshness(r);
            if (f === "Expired") map[key].expiredQty += qty;
            if (f === "Near Expiry" || f === "Expiring Soon") map[key].nearExpiryQty += qty;
            // keep latest values from records
            if (r.category) map[key].category = r.category;
            if (r.unit) map[key].unit = r.unit;
            if (r.status) map[key].status = r.status;
        });

        // Apply optimistic overrides so the UI updates immediately on Save
        Object.entries(itemOverrides).forEach(([name, overrides]) => {
            if (map[name]) Object.assign(map[name], overrides);
        });

        return Object.values(map).sort((a, b) => b.balanceQty - a.balanceQty);
    }, [records, itemOverrides]);

    // ── Filtered items for the All Items table ─────────────────────────────────
    const filteredItems = useMemo(() => {
        return itemSummary.filter((item) => {
            const catOk = itemCategoryFilter === "All" || item.category === itemCategoryFilter;
            const searchOk = !itemSearch || item.itemName.toLowerCase().includes(itemSearch.toLowerCase());
            return catOk && searchOk;
        });
    }, [itemSummary, itemCategoryFilter, itemSearch]);

    // ── Fetch ──────────────────────────────────────────────────────────────────
    const fetchRecords = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.searchTerm?.trim()) params.search = filters.searchTerm.trim();
            if (filters.dateFrom) params.dateFrom = filters.dateFrom;
            if (filters.dateTo) params.dateTo = filters.dateTo;
            if (filters.status) params.status = filters.status;
            
            const res = await api.get("/admin/stock", { params });
            setRecords(res.data.data || []);
            toast.success(`Loaded ${res.data.data?.length || 0} records`);
        } catch (err) {
            console.error(err);
            toast.error("Unable to fetch stock records");
            setRecords([]);
        }
        setLoading(false);
    }, [filters]);

    useEffect(() => { fetchRecords(); }, [fetchRecords]);

    // ── CSV export ─────────────────────────────────────────────────────────────
    const exportCsv = (e) => {
        e?.stopPropagation();
        if (!records.length) { toast.error("No stock data to export"); return; }
        const rows = records.map(r => ({
            "Item Name": r.itemName, Operation: r.operation,
            Quantity: r.quantity, Unit: r.unit,
            Date: formatDate(r.date), "Expiry Date": formatDate(r.expiryDate),
            "Recorded By": r.recordedBy, "Patient Name": r.patientName,
            "Patient ID": r.patientId, Purpose: r.purpose,
            Remarks: r.remarks, Status: r.status,
        }));
        const csv = [HEADERS.join(","), ...buildCsvRows(rows)].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `stock-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click(); URL.revokeObjectURL(url);
    };

    // ── Template download ──────────────────────────────────────────────────────
    const downloadTemplate = () => {
        const example = {
            "Item Name": "Gloves", Operation: "received", Quantity: 120, Unit: "pcs",
            Date: new Date().toISOString().slice(0, 10),
            "Expiry Date": new Date(Date.now() + 7776000000).toISOString().slice(0, 10),
            "Recorded By": "admin", "Patient Name": "", "Patient ID": "",
            Purpose: "Stock refill", Remarks: "New shipment", Status: "Pending",
        };
        const csv = [HEADERS.join(","), buildCsvRows([example])[0]].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "stock-upload-template.csv";
        a.click(); URL.revokeObjectURL(url);
    };

    // ── Upload ─────────────────────────────────────────────────────────────────
    const handleUpload = async () => {
        if (!uploadFile) { toast.error("Please choose a CSV or Excel file first"); return; }
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append("file", uploadFile);
            await api.post("/admin/stock/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
            setUploadFile(null);
            toast.success("Stock sheet uploaded successfully");
            await fetchRecords();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Upload failed. Check the file format.");
        }
        setUploading(false);
    };

    // ── Stock Records — inline edit ────────────────────────────────────────────
    const startEditing = (r) => {
        setEditingId(r._id);
        setEditRow({
            itemName: r.itemName || "",
            operation: r.operation || "received",
            quantity: r.quantity?.toString() || "",
            unit: r.unit || "pcs",
            category: r.category || "other",
            date: r.date ? new Date(r.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
            expiryDate: r.expiryDate ? new Date(r.expiryDate).toISOString().slice(0, 10) : "",
            status: r.status || "Pending",
            remarks: r.remarks || "",
            recordedBy: r.recordedBy || "",
            purpose: r.purpose || "",
            patientName: r.patientName || "",
            patientId: r.patientId || "",
        });
    };

    const saveRow = async (id) => {
        try {
            await api.put(`/admin/stock/${id}`, { ...editRow, quantity: Number(editRow.quantity) || 0 });
            toast.success("Stock row updated");
            setEditingId(null);
            await fetchRecords();
        } catch (err) {
            console.error(err);
            toast.error("Unable to save stock row");
        }
    };

    // ── All Items — inline edit ────────────────────────────────────────────────
    const startEditingItem = (item) => {
        setEditingItemName(item.itemName);
        setEditItemRow({
            category: item.category || "non-food",
            unit: item.unit || "pcs",
            status: item.status || "Pending",
        });
    };

    const cancelEditItem = () => {
        setEditingItemName(null);
        setEditItemRow({});
    };

    const saveItemRow = async (itemName) => {
        const snapshot = { ...editItemRow };

        // 1. Optimistic update — UI reflects the change immediately
        setItemOverrides(prev => ({ ...prev, [itemName]: snapshot }));
        setEditingItemName(null);
        setEditItemRow({});

        try {
            // 2. Persist to backend
            await api.put(`/admin/stock/item/${encodeURIComponent(itemName)}`, snapshot);
            toast.success(`"${itemName}" updated`);
            // 3. Refresh records and clear the local override once confirmed
            await fetchRecords();
            setItemOverrides(prev => {
                const next = { ...prev };
                delete next[itemName];
                return next;
            });
        } catch (err) {
            console.error(err);
            toast.error("Unable to update item — reverting");
            // 4. Revert override on failure
            setItemOverrides(prev => {
                const next = { ...prev };
                delete next[itemName];
                return next;
            });
        }
    };

    const clearFilters = () => setFilters({ searchTerm: "", dateFrom: "", dateTo: "", status: "" });

    // ─── Render ────────────────────────────────────────────────────────────────
    return (
        <div 
            className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-slate-50 to-blue-50 overflow-y-auto"
            style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
            }}
        >
            <style>{`
                div::-webkit-scrollbar {
                    display: none;
                }
            `}</style>

            {/* ── Sticky Header ── */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm flex-shrink-0">
                <div className="px-6 py-4 flex items-center justify-between gap-4 max-w-[1800px] mx-auto">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-200/50">
                            <Boxes className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 leading-tight">Stock Monitor Pro</h1>
                            <p className="text-xs text-slate-500 mt-0.5">Real-time inventory tracking & management</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setItemsOpen(v => !v)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all duration-200 active:scale-95"
                        >
                            <LayoutGrid className="w-4 h-4" />
                            All Items
                        </button>
                        <button
                            onClick={fetchRecords}
                            disabled={loading}
                            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl shadow-lg shadow-emerald-200/50 hover:from-emerald-600 hover:to-emerald-700 active:scale-95 transition-all duration-200 disabled:opacity-60"
                        >
                            <RefreshCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                            {loading ? "Loading…" : "Refresh"}
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
                <div className="max-w-[1800px] mx-auto space-y-6 w-full">

                {/* ── Stat Cards ── */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
                    <StatCard label="Total Records" value={summary.total} icon={Package} tone="slate" />
                    <StatCard label="Distinct Items" value={summary.distinctItems} icon={FileSpreadsheet} tone="indigo" />
                    <StatCard label="Balance Qty" value={summary.balanceQty} icon={Boxes} tone="emerald" delta={{ up: true, label: "In stock" }} />
                    <StatCard label="Received Qty" value={summary.receivedQty} icon={TrendingUp} tone="blue" delta={{ up: true, label: "All time" }} />
                    <StatCard label="Used Qty" value={summary.usedQty} icon={TrendingDown} tone="amber" delta={{ up: false, label: "Consumed" }} />
                    <StatCard label="Near Expiry" value={summary.nearExpiry} icon={Clock} tone="amber" />
                    <StatCard label="Expired" value={summary.expired} icon={AlertTriangle} tone="rose" />
                </div>

                {/* ══════════════════════════════════════════════════════════════════
            SECTION 1 — Filters & Upload  (STATIC — always visible)
        ══════════════════════════════════════════════════════════════════ */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 grid place-items-center text-emerald-700 shrink-0">
                            <Filter className="w-4 h-4" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-slate-900">Filters &amp; Upload</h2>
                            <p className="text-[11px] text-slate-500 mt-0.5">Search, date range, status filter · CSV / Excel upload</p>
                        </div>
                    </div>

                    <div className="p-5">
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                            {/* Search */}
                            <div className="relative lg:col-span-2">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Search item, notes, staff…"
                                    value={filters.searchTerm}
                                    onChange={(e) => setFilters(p => ({ ...p, searchTerm: e.target.value }))}
                                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-700 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
                                />
                            </div>
                            {/* Status */}
                            <div>
                                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Status</label>
                                <select
                                    value={filters.status}
                                    onChange={(e) => setFilters(p => ({ ...p, status: e.target.value }))}
                                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-700 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                                >
                                    <option value="">All statuses</option>
                                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            {/* Date From */}
                            <div>
                                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">From</label>
                                <input
                                    type="date"
                                    value={filters.dateFrom}
                                    onChange={(e) => setFilters(p => ({ ...p, dateFrom: e.target.value }))}
                                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-700 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                                />
                            </div>
                            {/* Date To */}
                            <div>
                                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">To</label>
                                <input
                                    type="date"
                                    value={filters.dateTo}
                                    onChange={(e) => setFilters(p => ({ ...p, dateTo: e.target.value }))}
                                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-700 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                                />
                            </div>
                        </div>

                        {/* Upload row */}
                        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col lg:flex-row gap-3 lg:items-end justify-between">
                            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Upload CSV / Excel</label>
                                <div className="flex items-center gap-3">
                                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 rounded-xl border border-slate-200 hover:bg-slate-200 transition truncate max-w-xs">
                                        <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
                                        <span className="truncate">{uploadFile ? uploadFile.name : "Choose CSV / Excel"}</span>
                                        <input type="file" accept=".csv,.xlsx" onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)} className="hidden" />
                                    </label>
                                    <button
                                        onClick={downloadTemplate}
                                        className="inline-flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shrink-0"
                                    >
                                        <Download className="w-3.5 h-3.5" /> Template
                                    </button>
                                </div>
                                <p className="text-[10px] text-slate-400">Headers: Item Name, Operation, Quantity, Unit, Date, Expiry Date, Recorded By…</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    onClick={clearFilters}
                                    className="px-4 py-2.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition"
                                >
                                    Clear filters
                                </button>
                                <button
                                    onClick={handleUpload}
                                    disabled={!uploadFile || uploading}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl shadow-sm shadow-emerald-200 hover:from-emerald-600 hover:to-emerald-700 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:from-slate-300 disabled:to-slate-300"
                                >
                                    <UploadCloud className="w-3.5 h-3.5" />
                                    {uploading ? "Uploading…" : "Upload sheet"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ══════════════════════════════════════════════════════════════════
            SECTION 2 — Stock Records  (STATIC — always visible)
        ══════════════════════════════════════════════════════════════════ */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-emerald-50 grid place-items-center text-emerald-700 shrink-0">
                                <Package className="w-4 h-4" />
                            </div>
                            <div>
                                <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                    Stock Records
                                    <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        Live
                                    </span>
                                </h2>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                    Edit inline · live freshness · <span className="font-semibold text-slate-700">{records.length}</span> records
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={exportCsv}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
                        >
                            <Download className="w-3 h-3" /> Export
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-3">
                                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                <p className="text-xs text-slate-400 font-medium">Loading stock data…</p>
                            </div>
                        ) : records.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-3">
                                <div className="w-16 h-16 rounded-3xl bg-slate-100 grid place-items-center">
                                    <Package className="w-7 h-7 text-slate-300" />
                                </div>
                                <p className="text-sm font-semibold text-slate-600">No stock records found</p>
                                <p className="text-xs text-slate-400">Upload a sheet or adjust filters to begin.</p>
                            </div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50/70 border-b border-slate-100">
                                    <tr className="text-left text-[11px] uppercase tracking-[0.13em] text-slate-400">
                                        {["Item", "Operation", "Qty", "Unit", "Category", "Date", "Expiry", "Status", "Freshness", "Notes", "Recorded By", "Actions"].map(h => (
                                            <th key={h} className="px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {records.map((r) => {
                                        const isEditing = editingId === r._id;
                                        const freshness = getFreshness(r);
                                        return (
                                            <tr key={r._id} className={`transition-colors ${isEditing ? "bg-emerald-50/40" : "hover:bg-slate-50/60"}`}>

                                                {/* Item */}
                                                <td className="px-4 py-3 w-44">
                                                    {isEditing ? (
                                                        <input value={editRow.itemName} onChange={e => setEditRow(p => ({ ...p, itemName: e.target.value }))} className={inp} />
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-7 h-7 min-w-[28px] rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 grid place-items-center text-[10px] font-bold text-slate-600">
                                                                {(r.itemName || "??").slice(0, 2).toUpperCase()}
                                                            </div>
                                                            <span className="font-medium text-slate-800 whitespace-nowrap">{r.itemName || "—"}</span>
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Operation */}
                                                <td className="px-4 py-3 w-28">
                                                    {isEditing ? (
                                                        <select value={editRow.operation} onChange={e => setEditRow(p => ({ ...p, operation: e.target.value }))} className={inp}>
                                                            {OPERATION_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                                        </select>
                                                    ) : (
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold capitalize ${r.operation === "received" ? "bg-emerald-50 text-emerald-700" :
                                                                r.operation === "used" ? "bg-amber-50 text-amber-700" :
                                                                    "bg-slate-100 text-slate-600"
                                                            }`}>{r.operation || "—"}</span>
                                                    )}
                                                </td>

                                                {/* Qty */}
                                                <td className="px-4 py-3 w-20">
                                                    {isEditing ? (
                                                        <input type="number" min="0" value={editRow.quantity} onChange={e => setEditRow(p => ({ ...p, quantity: e.target.value }))} className={`${inp} text-right`} />
                                                    ) : (
                                                        <span className="font-semibold text-slate-800 tabular-nums">{r.quantity ?? "—"}</span>
                                                    )}
                                                </td>

                                                {/* Unit */}
                                                <td className="px-4 py-3 w-20">
                                                    {isEditing ? (
                                                        <select value={editRow.unit} onChange={e => setEditRow(p => ({ ...p, unit: e.target.value }))} className={inp}>
                                                            {UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
                                                        </select>
                                                    ) : <span className="text-slate-600">{r.unit || "—"}</span>}
                                                </td>

                                                {/* Category */}
                                                <td className="px-4 py-3 w-28">
                                                    {isEditing ? (
                                                        <select value={editRow.category} onChange={e => setEditRow(p => ({ ...p, category: e.target.value }))} className={inp}>
                                                            {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                                        </select>
                                                    ) : <CategoryBadge value={r.category || "non-food"} />}
                                                </td>

                                                {/* Date */}
                                                <td className="px-4 py-3 w-28">
                                                    {isEditing ? (
                                                        <input type="date" value={editRow.date} onChange={e => setEditRow(p => ({ ...p, date: e.target.value }))} className={inp} />
                                                    ) : <span className="text-slate-600 whitespace-nowrap">{formatDate(r.date)}</span>}
                                                </td>

                                                {/* Expiry */}
                                                <td className="px-4 py-3 w-28">
                                                    {isEditing ? (
                                                        <input type="date" value={editRow.expiryDate} onChange={e => setEditRow(p => ({ ...p, expiryDate: e.target.value }))} className={inp} />
                                                    ) : <span className="text-slate-600 whitespace-nowrap">{formatDate(r.expiryDate)}</span>}
                                                </td>

                                                {/* Status */}
                                                <td className="px-4 py-3 w-32">
                                                    {isEditing ? (
                                                        <select value={editRow.status} onChange={e => setEditRow(p => ({ ...p, status: e.target.value }))} className={inp}>
                                                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                                        </select>
                                                    ) : <StatusBadge value={r.status || "Pending"} />}
                                                </td>

                                                {/* Freshness */}
                                                <td className="px-4 py-3 w-28">
                                                    <StatusBadge value={freshness} />
                                                </td>

                                                {/* Remarks */}
                                                <td className="px-4 py-3 max-w-[180px]">
                                                    {isEditing ? (
                                                        <input value={editRow.remarks} onChange={e => setEditRow(p => ({ ...p, remarks: e.target.value }))} className={inp} />
                                                    ) : <span className="text-slate-500 truncate block">{r.remarks || "—"}</span>}
                                                </td>

                                                {/* Recorded By */}
                                                <td className="px-4 py-3 w-36">
                                                    {isEditing ? (
                                                        <input value={editRow.recordedBy} onChange={e => setEditRow(p => ({ ...p, recordedBy: e.target.value }))} className={inp} />
                                                    ) : <span className="text-slate-600 whitespace-nowrap">{r.recordedBy || "—"}</span>}
                                                </td>

                                                {/* Actions */}
                                                <td className="px-4 py-3 w-28">
                                                    {isEditing ? (
                                                        <div className="flex items-center gap-1.5">
                                                            <button
                                                                onClick={() => saveRow(r._id)}
                                                                title="Save"
                                                                className="p-1.5 text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 active:scale-95 transition shadow-sm"
                                                            >
                                                                <Save className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingId(null)}
                                                                title="Cancel"
                                                                className="p-1.5 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 active:scale-95 transition"
                                                            >
                                                                <X className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => startEditing(r)}
                                                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 active:scale-95 transition"
                                                        >
                                                            <Edit className="w-3 h-3" /> Edit
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* ══════════════════════════════════════════════════════════════════
            SECTION 3 — All Items  (COLLAPSIBLE — Food / Non-Food tabs)
        ══════════════════════════════════════════════════════════════════ */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">

                    {/* Collapsible header */}
                    <button
                        type="button"
                        onClick={() => setItemsOpen(v => !v)}
                        className="w-full px-5 py-4 flex items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                        aria-expanded={itemsOpen}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-violet-50 grid place-items-center text-violet-700 shrink-0">
                                <LayoutGrid className="w-4 h-4" />
                            </div>
                            <div className="text-left">
                                <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                    All Items
                                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-violet-50 text-violet-700 ring-1 ring-violet-200">
                                        {itemSummary.length} items
                                    </span>
                                </h2>
                                <p className="text-[11px] text-slate-500 mt-0.5">Food &amp; Non-Food categories · balance &amp; expiry per item · inline edit</p>
                            </div>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${itemsOpen ? "rotate-180" : ""}`} />
                    </button>

                    {itemsOpen && (
                        <div className="border-t border-slate-100 p-5">

                            {/* Category tabs + search */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                                <div className="flex gap-2">
                                    {CATEGORY_OPTIONS.map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => setItemCategoryFilter(cat)}
                                            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${itemCategoryFilter === cat
                                                    ? cat === "food" ? "bg-green-600 text-white shadow-sm"
                                                        : cat === "non-food" ? "bg-violet-600 text-white shadow-sm"
                                                            : cat === "medicine" ? "bg-red-600 text-white shadow-sm"
                                                                : cat === "equipment" ? "bg-blue-600 text-white shadow-sm"
                                                                    : "bg-slate-900 text-white shadow-sm"
                                                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                                                }`}
                                        >
                                            {cat === "food" ? "🍎 Food" : cat === "non-food" ? "🧴 Non-Food" : cat === "medicine" ? "💊 Medicine" : cat === "equipment" ? "🔧 Equipment" : "📦 Other"}
                                        </button>
                                    ))}
                                </div>
                                <div className="relative sm:ml-auto sm:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                                    <input
                                        type="text"
                                        placeholder="Search items…"
                                        value={itemSearch}
                                        onChange={(e) => setItemSearch(e.target.value)}
                                        className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-700 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition"
                                    />
                                </div>
                            </div>

                            {/* Summary counts */}
                            <div className="flex items-center gap-3 mb-4 flex-wrap">
                                {CATEGORY_OPTIONS.map((cat) => {
                                    const count = cat === "All"
                                        ? itemSummary.length
                                        : itemSummary.filter(i => i.category === cat).length;
                                    return (
                                        <span key={cat} className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ring-1 ${cat === "food" ? "bg-green-50 text-green-700 ring-green-200" :
                                                cat === "non-food" ? "bg-violet-50 text-violet-700 ring-violet-200" :
                                                    cat === "medicine" ? "bg-red-50 text-red-700 ring-red-200" :
                                                        cat === "equipment" ? "bg-blue-50 text-blue-700 ring-blue-200" :
                                                            "bg-slate-100 text-slate-600 ring-slate-200"
                                            }`}>
                                            {cat === "food" ? "🍎" : cat === "non-food" ? "🧴" : cat === "medicine" ? "💊" : cat === "equipment" ? "🔧" : "📦"} {cat}: {count}
                                        </span>
                                    );
                                })}
                            </div>

                            {/* Items table */}
                            <div className="overflow-x-auto rounded-xl border border-slate-100">
                                {filteredItems.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-14 gap-2">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-100 grid place-items-center">
                                            <LayoutGrid className="w-5 h-5 text-slate-300" />
                                        </div>
                                        <p className="text-sm font-semibold text-slate-600">No items found</p>
                                        <p className="text-xs text-slate-400">Try a different category or search term.</p>
                                    </div>
                                ) : (
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-50/70 border-b border-slate-100">
                                            <tr className="text-left text-[11px] uppercase tracking-[0.13em] text-slate-400">
                                                {["Item Name", "Category", "Received", "Used", "Balance", "Unit", "Near Expiry", "Expired", "Status", "Actions"].map(h => (
                                                    <th key={h} className="px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filteredItems.map((item) => {
                                                const isEditing = editingItemName === item.itemName;
                                                return (
                                                    <tr
                                                        key={item.itemName}
                                                        className={`transition-colors ${isEditing ? "bg-violet-50/40" : "hover:bg-slate-50/60"}`}
                                                    >
                                                        {/* Item Name */}
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`w-7 h-7 min-w-[28px] rounded-lg grid place-items-center text-[10px] font-bold ${item.category === "food"
                                                                        ? "bg-gradient-to-br from-green-100 to-green-200 text-green-700"
                                                                        : "bg-gradient-to-br from-violet-100 to-violet-200 text-violet-700"
                                                                    }`}>
                                                                    {item.itemName.slice(0, 2).toUpperCase()}
                                                                </div>
                                                                <span className="font-medium text-slate-800 whitespace-nowrap">{item.itemName}</span>
                                                                {/* Show a subtle tag if an override is in flight */}
                                                                {itemOverrides[item.itemName] && (
                                                                    <span className="text-[10px] font-semibold text-violet-500 bg-violet-50 px-1.5 py-0.5 rounded-full ring-1 ring-violet-200">saving…</span>
                                                                )}
                                                            </div>
                                                        </td>

                                                        {/* Category — editable */}
                                                        <td className="px-4 py-3 w-32">
                                                            {isEditing ? (
                                                                <select
                                                                    value={editItemRow.category}
                                                                    onChange={e => setEditItemRow(p => ({ ...p, category: e.target.value }))}
                                                                    className={inp}
                                                                >
                                                                    {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                                                </select>
                                                            ) : (
                                                                <CategoryBadge value={item.category} />
                                                            )}
                                                        </td>

                                                        {/* Received */}
                                                        <td className="px-4 py-3 text-right tabular-nums text-slate-700">{item.receivedQty}</td>

                                                        {/* Used */}
                                                        <td className="px-4 py-3 text-right tabular-nums text-slate-700">{item.usedQty}</td>

                                                        {/* Balance */}
                                                        <td className="px-4 py-3 text-right">
                                                            <span className={`font-bold tabular-nums ${item.balanceQty > 0 ? "text-emerald-700" : "text-rose-600"}`}>
                                                                {item.balanceQty}
                                                            </span>
                                                        </td>

                                                        {/* Unit — editable */}
                                                        <td className="px-4 py-3 w-24">
                                                            {isEditing ? (
                                                                <select
                                                                    value={editItemRow.unit}
                                                                    onChange={e => setEditItemRow(p => ({ ...p, unit: e.target.value }))}
                                                                    className={inp}
                                                                >
                                                                    {UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
                                                                </select>
                                                            ) : (
                                                                <span className="text-slate-600">{item.unit || "—"}</span>
                                                            )}
                                                        </td>

                                                        {/* Near Expiry */}
                                                        <td className="px-4 py-3 text-right tabular-nums">
                                                            {item.nearExpiryQty > 0
                                                                ? <span className="font-semibold text-amber-600">{item.nearExpiryQty}</span>
                                                                : <span className="text-slate-300">—</span>
                                                            }
                                                        </td>

                                                        {/* Expired */}
                                                        <td className="px-4 py-3 text-right tabular-nums">
                                                            {item.expiredQty > 0
                                                                ? <span className="font-semibold text-rose-600">{item.expiredQty}</span>
                                                                : <span className="text-slate-300">—</span>
                                                            }
                                                        </td>

                                                        {/* Status — editable */}
                                                        <td className="px-4 py-3 w-32">
                                                            {isEditing ? (
                                                                <select
                                                                    value={editItemRow.status}
                                                                    onChange={e => setEditItemRow(p => ({ ...p, status: e.target.value }))}
                                                                    className={inp}
                                                                >
                                                                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                                                </select>
                                                            ) : (
                                                                <StatusBadge value={item.status || "Pending"} />
                                                            )}
                                                        </td>

                                                        {/* Actions */}
                                                        <td className="px-4 py-3 w-28">
                                                            {isEditing ? (
                                                                <div className="flex items-center gap-1.5">
                                                                    <button
                                                                        onClick={() => saveItemRow(item.itemName)}
                                                                        title="Save"
                                                                        className="p-1.5 text-white bg-violet-600 rounded-lg hover:bg-violet-700 active:scale-95 transition shadow-sm"
                                                                    >
                                                                        <Save className="w-3.5 h-3.5" />
                                                                    </button>
                                                                    <button
                                                                        onClick={cancelEditItem}
                                                                        title="Cancel"
                                                                        className="p-1.5 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 active:scale-95 transition"
                                                                    >
                                                                        <X className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={() => startEditingItem(item)}
                                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 active:scale-95 transition"
                                                                >
                                                                    <Edit className="w-3 h-3" /> Edit
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                </div>
            </div>
        </div>
    );
}