import { useEffect, useState } from "react";
import api from "../../services/api";
import { Plus, Edit, Trash2, SlidersHorizontal, Search, X, ChevronDown, BookOpen } from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const ATTENDANCE_STATUS_OPTIONS = ["Present", "Absent", "On Leave"];
const STAFF_STATUS_OPTIONS = ["Active", "Inactive", "On Leave", "Resigned"];
const SALARY_STATUS_OPTIONS = ["Paid", "Unpaid", "Pending"];
const ENQUIRY_STATUS_OPTIONS = ["Open", "Contacted", "Closed"];
const GENDER_OPTIONS = ["Male", "Female", "Other"];
const ADMISSION_STATUS_OPTIONS = ["Admitted", "Released", "Transferred"];
const NURSING_STUDENTS_STATUS_OPTIONS = ["Active", "Completed", "On Leave", "Graduated"];
const STAFF_ROLE_OPTIONS = ["Warden", "Supervisor", "Guard", "Clerk", "Nurse", "Accountant", "Support Staff", "Other"];
const PETTI_CATEGORY_OPTIONS = ["Income", "Expense"];
const DAYBOOK_RECORD_TYPE_OPTIONS = ["Debit", "Credit", "Journal"];
const DAYBOOK_CATEGORY_OPTIONS = ["Cash", "Bank", "Expense", "Income"];
const DONOR_RECORD_TYPE_OPTIONS = ["Cash", "Cheque", "Online", "Other"];
const DONOR_ENQUIRY_TYPE_OPTIONS = ["One-time", "Monthly", "Corporate", "Other"];
const ASSET_CATEGORY_OPTIONS = ["Furniture", "Electronics", "Vehicle", "Stationery", "Other"];
const ASSET_CONDITION_OPTIONS = ["New", "Good", "Fair", "Needs Repair"];
const STOCK_ITEMS = ["Gloves", "Catheter", "Underpad / Rubber Sheet", "Syringe", "Mask", "Other"];
const STOCK_UNIT_OPTIONS = ["pcs", "kg", "litre", "box"];

const TABS = [
  { key: "important",        label: "Important Contacts",  icon: "📞", group: "General" },
  { key: "daybook",          label: "Day Book",            icon: "📒", group: "General" },
  { key: "inspection",       label: "Officer Inspection",  icon: "🔍", group: "General" },
  { key: "death-register",   label: "Death Register",      icon: "📋", group: "General" },
  { key: "donor-register",   label: "Donor Register",      icon: "🤝", group: "General" },
  { key: "assets-record",    label: "Assets Record",       icon: "🏷️", group: "General" },
  { key: "attendance",       label: "Inmate Attendance",   icon: "✅", group: "People" },
  { key: "staff-attendance", label: "Staff Attendance",    icon: "🕐", group: "People" },
  { key: "admission",        label: "Admission Register",  icon: "🏥", group: "People" },
  { key: "staff-register",   label: "Staff Register",      icon: "👤", group: "People" },
  { key: "nursing-students", label: "Nursing Students",    icon: "🎓", group: "People" },
  { key: "salary",           label: "Salary Register",     icon: "💰", group: "Finance" },
  { key: "accounts",         label: "Accounts Register",   icon: "📊", group: "Finance" },
  { key: "petti",            label: "Petti Cash",          icon: "💵", group: "Finance" },
  { key: "stock-ration-dry",   label: "Stock Ration Dry",   icon: "🌾", group: "Stocks" },
  { key: "stock-ration-fresh", label: "Stock Ration Fresh", icon: "🥦", group: "Stocks" },
  { key: "stock-cleaning",     label: "Stock Cleaning",     icon: "🧹", group: "Stocks" },
  { key: "stock-clerical",     label: "Stock Clerical",     icon: "📎", group: "Stocks" },
  { key: "stock-electrical",   label: "Stock Electrical",   icon: "⚡", group: "Stocks" },
  { key: "stock-plumbing",     label: "Stock Plumbing",     icon: "🔧", group: "Stocks" },
  { key: "oldage-enquiry",   label: "Oldage Enquiry",      icon: "👴", group: "Enquiry" },
  { key: "staff-enquiry",    label: "Staff Enquiry",       icon: "💼", group: "Enquiry" },
  { key: "donor-enquiry",    label: "Donor Enquiry",       icon: "💌", group: "Enquiry" },
];

const TAB_GROUPS = ["General", "People", "Finance", "Stocks", "Enquiry"];

const STOCK_COLS_AND_FIELDS = {
  columns: [
    { key: "itemName",     label: "Item" },
    { key: "unit",         label: "Unit" },
    { key: "openingStock", label: "Opening" },
    { key: "received",     label: "Received" },
    { key: "issued",       label: "Issued" },
    { key: "closingStock", label: "Closing" },
    { key: "remarks",      label: "Remarks" },
  ],
  fields: [
    { name: "itemName",     label: "Item",          type: "select", options: STOCK_ITEMS },
    { name: "unit",         label: "Unit",          type: "select", options: STOCK_UNIT_OPTIONS },
    { name: "openingStock", label: "Opening Stock", type: "number" },
    { name: "received",     label: "Received",      type: "number" },
    { name: "issued",       label: "Issued",        type: "number" },
    { name: "closingStock", label: "Closing Stock", type: "number" },
    { name: "remarks",      label: "Remarks",       type: "text" },
    { name: "date",         label: "Date",          type: "date" },
  ],
};

const TAB_CONFIG = {
  important: {
    section: "important", endpoint: "/admin/records",
    fields: [
      { name: "date",       label: "Date",        type: "date" },
      { name: "name",       label: "Name",        type: "text" },
      { name: "role",       label: "Role",        type: "text" },
      { name: "phone",      label: "Phone",       type: "text" },
      { name: "email",      label: "Email",       type: "text" },
      { name: "category",   label: "Category",    type: "text" },
      { name: "details",    label: "Notes",       type: "text" },
      { name: "recordedBy", label: "Recorded By", type: "text" },
    ],
    columns: [
      { key: "date",       label: "Date" },       { key: "name",       label: "Name" },
      { key: "role",       label: "Role" },       { key: "phone",      label: "Phone" },
      { key: "email",      label: "Email" },      { key: "category",   label: "Category" },
      { key: "details",    label: "Notes" },      { key: "recordedBy", label: "Recorded By" },
    ],
  },
  daybook: {
    section: "daybook", endpoint: "/admin/records",
    fields: [
      { name: "date",       label: "Date",        type: "date" },
      { name: "details",    label: "Description", type: "text" },
      { name: "recordType", label: "Type",        type: "select", options: DAYBOOK_RECORD_TYPE_OPTIONS },
      { name: "amount",     label: "Amount (₹)",  type: "number" },
      { name: "category",   label: "Category",    type: "select", options: DAYBOOK_CATEGORY_OPTIONS },
      { name: "recordedBy", label: "Recorded By", type: "text" },
    ],
    columns: [
      { key: "date",       label: "Date" },       { key: "details",    label: "Description" },
      { key: "recordType", label: "Type" },       { key: "amount",     label: "Amount (₹)" },
      { key: "category",   label: "Category" },   { key: "recordedBy", label: "Recorded By" },
    ],
  },
  attendance: {
    section: "attendance", endpoint: "/admin/records",
    fields: [
      { name: "date",     label: "Date",      type: "date" },
      { name: "inmateId", label: "Inmate ID", type: "text" },
      { name: "name",     label: "Name",      type: "text" },
      { name: "status",   label: "Status",    type: "select", options: ATTENDANCE_STATUS_OPTIONS },
      { name: "remarks",  label: "Remarks",   type: "text" },
    ],
    columns: [
      { key: "date",     label: "Date" },     { key: "inmateId", label: "Inmate ID" },
      { key: "name",     label: "Name" },     { key: "status",   label: "Status" },
      { key: "remarks",  label: "Remarks" },
    ],
  },
  "staff-attendance": {
    section: "staff-attendance", endpoint: "/admin/records",
    fields: [
      { name: "date",    label: "Date",     type: "date" },
      { name: "staffId", label: "Staff ID", type: "text" },
      { name: "name",    label: "Name",     type: "text" },
      { name: "role",    label: "Role",     type: "select", options: STAFF_ROLE_OPTIONS },
      { name: "inTime",  label: "In Time",  type: "text" },
      { name: "outTime", label: "Out Time", type: "text" },
      { name: "status",  label: "Status",   type: "select", options: ATTENDANCE_STATUS_OPTIONS },
      { name: "remarks", label: "Remarks",  type: "text" },
    ],
    columns: [
      { key: "date",    label: "Date" },    { key: "staffId", label: "Staff ID" },
      { key: "name",    label: "Name" },    { key: "role",    label: "Role" },
      { key: "inTime",  label: "In" },      { key: "outTime", label: "Out" },
      { key: "status",  label: "Status" },  { key: "remarks", label: "Remarks" },
    ],
  },
  admission: {
    section: "admission", endpoint: "/admin/records",
    fields: [
      { name: "date",     label: "Adm Date",  type: "date" },
      { name: "inmateId", label: "Inmate ID", type: "text" },
      { name: "name",     label: "Name",      type: "text" },
      { name: "age",      label: "Age",       type: "number" },
      { name: "gender",   label: "Gender",    type: "select", options: GENDER_OPTIONS },
      { name: "category", label: "Category",  type: "text" },
      { name: "status",   label: "Status",    type: "select", options: ADMISSION_STATUS_OPTIONS },
    ],
    columns: [
      { key: "date",     label: "Adm Date" }, { key: "inmateId", label: "Inmate ID" },
      { key: "name",     label: "Name" },     { key: "age",      label: "Age" },
      { key: "gender",   label: "Gender" },   { key: "category", label: "Category" },
      { key: "status",   label: "Status" },
    ],
  },
  "staff-register": {
    section: "staff-register", endpoint: "/admin/records",
    fields: [
      { name: "staffId",       label: "Staff ID",      type: "text" },
      { name: "name",          label: "Name",          type: "text" },
      { name: "role",          label: "Role",          type: "select", options: STAFF_ROLE_OPTIONS },
      { name: "date",          label: "Join Date",     type: "date" },
      { name: "phone",         label: "Phone",         type: "text" },
      { name: "qualification", label: "Qualification", type: "text" },
      { name: "status",        label: "Status",        type: "select", options: STAFF_STATUS_OPTIONS },
    ],
    columns: [
      { key: "staffId",       label: "Staff ID" },      { key: "name",          label: "Name" },
      { key: "role",          label: "Role" },          { key: "date",          label: "Join Date" },
      { key: "phone",         label: "Phone" },         { key: "qualification", label: "Qualification" },
      { key: "status",        label: "Status" },
    ],
  },
  salary: {
    section: "salary", endpoint: "/admin/records",
    fields: [
      { name: "date",       label: "Month",          type: "date" },
      { name: "staffId",    label: "Staff ID",       type: "text" },
      { name: "name",       label: "Name",           type: "text" },
      { name: "basic",      label: "Basic (₹)",      type: "number" },
      { name: "allowances", label: "Allowances (₹)", type: "number" },
      { name: "deductions", label: "Deductions (₹)", type: "number" },
      { name: "net",        label: "Net (₹)",        type: "number" },
      { name: "status",     label: "Status",         type: "select", options: SALARY_STATUS_OPTIONS },
    ],
    columns: [
      { key: "date",       label: "Month" },      { key: "staffId",    label: "Staff ID" },
      { key: "name",       label: "Name" },       { key: "basic",      label: "Basic (₹)" },
      { key: "allowances", label: "Allowances" }, { key: "deductions", label: "Deductions" },
      { key: "net",        label: "Net (₹)" },    { key: "status",     label: "Status" },
    ],
  },
  "nursing-students": {
    section: "nursing-students", endpoint: "/admin/records",
    fields: [
      { name: "studentId",  label: "Student ID", type: "text" },
      { name: "name",       label: "Name",       type: "text" },
      { name: "category",   label: "College",    type: "text" },
      { name: "startDate",  label: "Start Date", type: "date" },
      { name: "endDate",    label: "End Date",   type: "date" },
      { name: "recordedBy", label: "Supervisor", type: "text" },
      { name: "status",     label: "Status",     type: "select", options: NURSING_STUDENTS_STATUS_OPTIONS },
    ],
    columns: [
      { key: "studentId",  label: "Student ID" }, { key: "name",       label: "Name" },
      { key: "category",   label: "College" },    { key: "startDate",  label: "Start" },
      { key: "endDate",    label: "End" },         { key: "recordedBy", label: "Supervisor" },
      { key: "status",     label: "Status" },
    ],
  },
  inspection: {
    section: "inspection", endpoint: "/admin/records",
    fields: [
      { name: "date",           label: "Date",            type: "date" },
      { name: "name",           label: "Officer",         type: "text" },
      { name: "role",           label: "Designation",     type: "text" },
      { name: "remarks",        label: "Remarks",         type: "text" },
      { name: "nextInspection", label: "Next Inspection", type: "date" },
    ],
    columns: [
      { key: "date",           label: "Date" },           { key: "name",           label: "Officer" },
      { key: "role",           label: "Designation" },    { key: "remarks",        label: "Remarks" },
      { key: "nextInspection", label: "Next Inspection" },
    ],
  },
  accounts: {
    section: "accounts", endpoint: "/admin/records",
    fields: [
      { name: "date",      label: "Date",        type: "date" },
      { name: "details",   label: "Particular",  type: "text" },
      { name: "debit",     label: "Debit (₹)",   type: "number" },
      { name: "credit",    label: "Credit (₹)",  type: "number" },
      { name: "balance",   label: "Balance (₹)", type: "number" },
      { name: "voucherNo", label: "Voucher No.", type: "text" },
    ],
    columns: [
      { key: "date",      label: "Date" },        { key: "details",   label: "Particular" },
      { key: "debit",     label: "Debit (₹)" },   { key: "credit",    label: "Credit (₹)" },
      { key: "balance",   label: "Balance (₹)" }, { key: "voucherNo", label: "Voucher No." },
    ],
  },
  petti: {
    section: "petti", endpoint: "/admin/records",
    fields: [
      { name: "date",     label: "Date",        type: "date" },
      { name: "details",  label: "Description", type: "text" },
      { name: "amount",   label: "Amount (₹)",  type: "number" },
      { name: "paidTo",   label: "Paid To",     type: "text" },
      { name: "category", label: "Category",    type: "select", options: PETTI_CATEGORY_OPTIONS },
      { name: "balance",  label: "Balance (₹)", type: "number" },
    ],
    columns: [
      { key: "date",     label: "Date" },        { key: "details",  label: "Description" },
      { key: "amount",   label: "Amount (₹)" },  { key: "paidTo",   label: "Paid To" },
      { key: "category", label: "Category" },    { key: "balance",  label: "Balance (₹)" },
    ],
  },
  "stock-ration-dry":   { section: "stock-ration-dry",   endpoint: "/admin/records", ...STOCK_COLS_AND_FIELDS },
  "stock-ration-fresh": { section: "stock-ration-fresh", endpoint: "/admin/records", ...STOCK_COLS_AND_FIELDS },
  "stock-cleaning":     { section: "stock-cleaning",     endpoint: "/admin/records", ...STOCK_COLS_AND_FIELDS },
  "stock-clerical":     { section: "stock-clerical",     endpoint: "/admin/records", ...STOCK_COLS_AND_FIELDS },
  "stock-electrical":   { section: "stock-electrical",   endpoint: "/admin/records", ...STOCK_COLS_AND_FIELDS },
  "stock-plumbing":     { section: "stock-plumbing",     endpoint: "/admin/records", ...STOCK_COLS_AND_FIELDS },
  "death-register": {
    section: "death-register", endpoint: "/admin/records",
    fields: [
      { name: "date",       label: "Date",          type: "date" },
      { name: "inmateId",   label: "Inmate ID",     type: "text" },
      { name: "name",       label: "Name",          type: "text" },
      { name: "age",        label: "Age",           type: "number" },
      { name: "details",    label: "Cause of Death",type: "text" },
      { name: "recordedBy", label: "Certified By",  type: "text" },
      { name: "remarks",    label: "Remarks",       type: "text" },
    ],
    columns: [
      { key: "date",       label: "Date" },        { key: "inmateId",   label: "Inmate ID" },
      { key: "name",       label: "Name" },        { key: "age",        label: "Age" },
      { key: "details",    label: "Cause" },       { key: "recordedBy", label: "Certified By" },
      { key: "remarks",    label: "Remarks" },
    ],
  },
  "donor-register": {
    section: "donor-register", endpoint: "/admin/records",
    fields: [
      { name: "donorId",    label: "Donor ID",          type: "text" },
      { name: "name",       label: "Name",              type: "text" },
      { name: "recordType", label: "Type",              type: "select", options: DONOR_RECORD_TYPE_OPTIONS },
      { name: "phone",      label: "Phone",             type: "text" },
      { name: "email",      label: "Email",             type: "text" },
      { name: "amount",     label: "Total Donated (₹)", type: "number" },
      { name: "date",       label: "Last Donation",     type: "date" },
    ],
    columns: [
      { key: "donorId",    label: "Donor ID" },    { key: "name",       label: "Name" },
      { key: "recordType", label: "Type" },        { key: "phone",      label: "Phone" },
      { key: "email",      label: "Email" },       { key: "amount",     label: "Donated (₹)" },
      { key: "date",       label: "Last Donation" },
    ],
  },
  "oldage-enquiry": {
    section: "oldage-enquiry", endpoint: "/admin/records",
    fields: [
      { name: "date",       label: "Date",        type: "date" },
      { name: "name",       label: "Name",        type: "text" },
      { name: "age",        label: "Age",         type: "number" },
      { name: "contact",    label: "Contact",     type: "text" },
      { name: "recordedBy", label: "Enquired By", type: "text" },
      { name: "status",     label: "Status",      type: "select", options: ENQUIRY_STATUS_OPTIONS },
      { name: "remarks",    label: "Remarks",     type: "text" },
    ],
    columns: [
      { key: "date",       label: "Date" },       { key: "name",       label: "Name" },
      { key: "age",        label: "Age" },        { key: "contact",    label: "Contact" },
      { key: "recordedBy", label: "Enquired By" },{ key: "status",     label: "Status" },
      { key: "remarks",    label: "Remarks" },
    ],
  },
  "staff-enquiry": {
    section: "staff-enquiry", endpoint: "/admin/records",
    fields: [
      { name: "date",          label: "Date",          type: "date" },
      { name: "name",          label: "Name",          type: "text" },
      { name: "role",          label: "Role",          type: "select", options: STAFF_ROLE_OPTIONS },
      { name: "phone",         label: "Phone",         type: "text" },
      { name: "qualification", label: "Qualification", type: "text" },
      { name: "status",        label: "Status",        type: "select", options: ENQUIRY_STATUS_OPTIONS },
      { name: "remarks",       label: "Remarks",       type: "text" },
    ],
    columns: [
      { key: "date",          label: "Date" },          { key: "name",          label: "Name" },
      { key: "role",          label: "Role" },          { key: "phone",         label: "Phone" },
      { key: "qualification", label: "Qualification" }, { key: "status",        label: "Status" },
      { key: "remarks",       label: "Remarks" },
    ],
  },
  "donor-enquiry": {
    section: "donor-enquiry", endpoint: "/admin/records",
    fields: [
      { name: "date",       label: "Date",     type: "date" },
      { name: "name",       label: "Name",     type: "text" },
      { name: "recordType", label: "Type",     type: "select", options: DONOR_ENQUIRY_TYPE_OPTIONS },
      { name: "phone",      label: "Phone",    type: "text" },
      { name: "interest",   label: "Interest", type: "text" },
      { name: "status",     label: "Status",   type: "select", options: ENQUIRY_STATUS_OPTIONS },
      { name: "remarks",    label: "Remarks",  type: "text" },
    ],
    columns: [
      { key: "date",       label: "Date" },    { key: "name",       label: "Name" },
      { key: "recordType", label: "Type" },    { key: "phone",      label: "Phone" },
      { key: "interest",   label: "Interest" },{ key: "status",     label: "Status" },
      { key: "remarks",    label: "Remarks" },
    ],
  },
  "assets-record": {
    section: "assets-record", endpoint: "/admin/records",
    fields: [
      { name: "assetId",      label: "Asset ID",      type: "text" },
      { name: "name",         label: "Name",          type: "text" },
      { name: "category",     label: "Category",      type: "select", options: ASSET_CATEGORY_OPTIONS },
      { name: "qty",          label: "Qty",           type: "number" },
      { name: "purchaseDate", label: "Purchase Date", type: "date" },
      { name: "value",        label: "Value (₹)",     type: "number" },
      { name: "condition",    label: "Condition",     type: "select", options: ASSET_CONDITION_OPTIONS },
      { name: "location",     label: "Location",      type: "text" },
    ],
    columns: [
      { key: "assetId",      label: "Asset ID" },      { key: "name",         label: "Name" },
      { key: "category",     label: "Category" },      { key: "qty",          label: "Qty" },
      { key: "purchaseDate", label: "Purchase Date" }, { key: "value",        label: "Value (₹)" },
      { key: "condition",    label: "Condition" },     { key: "location",     label: "Location" },
    ],
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const buildEmptyForm = (fields) =>
  fields.reduce((acc, f) => {
    acc[f.name] = f.type === "select" ? (f.options?.[0] ?? "") : "";
    return acc;
  }, {});

const fmtDate = (v) => {
  if (!v) return "—";
  const d = new Date(v);
  return isNaN(d) ? v : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const fmtVal = (v, key) => {
  if (v === null || v === undefined || v === "") return "—";
  if (["date","startDate","endDate","purchaseDate","nextInspection","lastDonation"].includes(key)) return fmtDate(v);
  return v;
};

const STATUS_COLORS = {
  Present:  "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  Active:   "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  Paid:     "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  Admitted: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200",
  Open:     "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  Good:     "bg-teal-50 text-teal-700 ring-1 ring-teal-200",
  New:      "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
  Absent:   "bg-red-50 text-red-600 ring-1 ring-red-200",
  Resigned: "bg-gray-50 text-gray-600 ring-1 ring-gray-200",
  Unpaid:   "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
  Pending:  "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200",
};

const StatusBadge = ({ value }) => {
  const cls = STATUS_COLORS[value] || "bg-gray-50 text-gray-600 ring-1 ring-gray-200";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {value}
    </span>
  );
};

const STATUS_KEYS = ["status", "condition"];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminRecordsView() {
  const [activeTab,     setActiveTab]     = useState("important");
  const [records,       setRecords]       = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [showModal,     setShowModal]     = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [showFilters,   setShowFilters]   = useState(false);
  const [openDropdown,  setOpenDropdown]  = useState(null);
  const [filters,       setFilters]       = useState({ dateFrom: "", dateTo: "", searchTerm: "", name: "" });

  const currentTab  = TAB_CONFIG[activeTab];
  const currentMeta = TABS.find((t) => t.key === activeTab);
  const [formData, setFormData] = useState(buildEmptyForm(currentTab.fields));

  // Active group is derived — whichever group the active tab belongs to
  const activeGroup = TABS.find((t) => t.key === activeTab)?.group ?? "General";

  useEffect(() => {
    fetchRecords();
  }, [activeTab, filters.dateFrom, filters.dateTo, filters.searchTerm, filters.name]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await api.get(currentTab.endpoint, {
        params: {
          section:  currentTab.section,
          dateFrom: filters.dateFrom   || undefined,
          dateTo:   filters.dateTo     || undefined,
          search:   filters.searchTerm || undefined,
          name:     filters.name       || undefined,
        },
      });
      setRecords(res.data.data || []);
    } catch (e) {
      console.error(e);
      setRecords([]);
    }
    setLoading(false);
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    setFormData(buildEmptyForm(TAB_CONFIG[key].fields));
    setFilters({ dateFrom: "", dateTo: "", searchTerm: "", name: "" });
    setOpenDropdown(null);
  };

  const handleAddNew = () => {
    setEditingRecord(null);
    setFormData(buildEmptyForm(currentTab.fields));
    setShowModal(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    const initial = currentTab.fields.reduce((acc, f) => {
      const v = record[f.name];
      acc[f.name] = f.type === "date"
        ? (v ? new Date(v).toISOString().slice(0, 10) : "")
        : f.type === "select"
          ? (v ?? f.options?.[0] ?? "")
          : (v ?? "");
      return acc;
    }, {});
    setFormData(initial);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    try { await api.delete(`/admin/records/${id}`); fetchRecords(); } catch (e) { console.error(e); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, section: currentTab.section };
      if (editingRecord) await api.put(`/admin/records/${editingRecord._id}`, payload);
      else               await api.post(currentTab.endpoint, payload);
      setShowModal(false);
      setEditingRecord(null);
      setFormData(buildEmptyForm(currentTab.fields));
      fetchRecords();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="min-h-screen bg-slate-50/60" onClick={() => setOpenDropdown(null)}>

      {/* ── Page Header ── */}
      <div className="bg-white border-b border-slate-200 px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-slate-900 leading-tight">Admin Records</h1>
            <p className="text-xs text-slate-400 mt-0.5">Manage all administrative registers &amp; books</p>
          </div>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl shadow-sm hover:bg-indigo-700 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Record
        </button>
      </div>

      {/* ── Dropdown Nav Bar ── */}
      <div
        className="bg-white border-b border-slate-200 flex px-4 relative z-40"
        onClick={(e) => e.stopPropagation()}
      >
        {TAB_GROUPS.map((group) => {
          const groupTabs    = TABS.filter((t) => t.group === group);
          const isActiveGroup = activeGroup === group;
          const isOpen        = openDropdown === group;

          return (
            <div
              key={group}
              className="relative"
              onMouseEnter={() => setOpenDropdown(group)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              {/* Group Button */}
              <button
                onClick={() => setOpenDropdown(isOpen ? null : group)}
                className={`flex items-center gap-1.5 px-5 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  isActiveGroup
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                {group}
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Dropdown Panel */}
              {isOpen && (
                <div className="absolute top-full left-0 min-w-[210px] bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-50">
                  {groupTabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => handleTabChange(tab.key)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-xs font-medium transition-all ${
                        activeTab === tab.key
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <span className="text-sm leading-none">{tab.icon}</span>
                      <span className="flex-1">{tab.label}</span>
                      {activeTab === tab.key && (
                        <span className="text-indigo-500 font-bold text-xs">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Main Content ── */}
      <div className="h-[calc(100vh-120px)] overflow-y-auto p-5 space-y-4">

        {/* Record Table Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

          {/* Table Toolbar */}
          <div className="px-5 py-4 border-b border-slate-100 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl leading-none">{currentMeta?.icon}</span>
              <h2 className="text-sm font-semibold text-slate-900">{currentMeta?.label}</h2>
              <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 font-medium">
                {records.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search…"
                  value={filters.searchTerm}
                  onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                  className="pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 w-48 transition"
                />
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters((p) => !p)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border transition ${
                  showFilters
                    ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filters
              </button>
            </div>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Date From</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Date To</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Name Filter</label>
                <input
                  type="text"
                  placeholder="Search by name"
                  value={filters.name}
                  onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-slate-400">Loading records…</p>
              </div>
            ) : records.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl">
                  {currentMeta?.icon}
                </div>
                <p className="text-sm font-medium text-slate-600">No records found</p>
                <p className="text-xs text-slate-400">Click "Add Record" to create the first entry</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {currentTab.columns.map((col) => (
                      <th
                        key={col.key}
                        className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap"
                      >
                        {col.label}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {records.map((record) => (
                    <tr key={record._id} className="group hover:bg-indigo-50/40 transition-colors">
                      {currentTab.columns.map((col) => (
                        <td key={col.key} className="px-4 py-3 text-slate-700 whitespace-nowrap text-xs">
                          {STATUS_KEYS.includes(col.key)
                            ? <StatusBadge value={record[col.key]} />
                            : fmtVal(record[col.key], col.key)}
                        </td>
                      ))}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(record)}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-indigo-100 hover:text-indigo-700 transition"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(record._id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-red-100 hover:text-red-600 transition"
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
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl max-h-[88vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl leading-none">{currentMeta?.icon}</span>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    {editingRecord ? "Edit" : "New"} — {currentMeta?.label}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {editingRecord ? "Update the record details below" : "Fill in the details to create a new record"}
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

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
              <div className="px-6 py-5 grid grid-cols-2 gap-3">
                {currentTab.fields.map((field) => (
                  <div
                    key={field.name}
                    className={field.name === "details" || field.name === "remarks" ? "col-span-2" : ""}
                  >
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
                        placeholder={field.type === "date" ? "" : `Enter ${field.label.toLowerCase()}`}
                        className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
                        required={["name","date","staffId","inmateId","studentId","assetId","donorId"].includes(field.name)}
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
                  className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 active:scale-95 transition-all shadow-sm"
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