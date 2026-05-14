<<<<<<< HEAD
import { useState, useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import API from "../services/api";
import Sidebar from "../components/dashboards/visitors/Sidebar";
import AdminChatPanel from "../components/chatpage/Adminchatpanel";
import NotificationChatDropdown from "../components/chatpage/NotificationChatDropdown";
import { markNotificationRead } from "../features/chatSlice";
import AddUser from "../pages/Register";
import {
  Search, X, Phone, MapPin, Clock, Users, TrendingUp,
  FileText, UserCheck, DollarSign, Package, AlertCircle,
  ChevronRight, Activity, BarChart2, PieChart, Calendar,
  ArrowUpRight, ArrowDownRight, Layers, Bell, Settings, PhoneCall, RefreshCw
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart as RechartsPie, Pie, Cell,
  RadialBarChart, RadialBar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
axios.defaults.headers.common["ngrok-skip-browser-warning"] = "true";

// ── Palette ──────────────────────────────────────────────────────────────────
const C = {
  indigo:  "#6366f1",
  violet:  "#8b5cf6",
  cyan:    "#06b6d4",
  emerald: "#10b981",
  amber:   "#f59e0b",
  rose:    "#f43f5e",
  slate:   "#64748b",
};

// ── Mock analytics data ───────────────────────────────────────────────────────
const visitorsMonthly = [
  { month: "Nov", visitors: 38 }, { month: "Dec", visitors: 52 },
  { month: "Jan", visitors: 44 }, { month: "Feb", visitors: 61 },
  { month: "Mar", visitors: 55 }, { month: "Apr", visitors: 73 },
  { month: "May", visitors: 68 },
];

const attendanceWeek = [
  { day: "Mon", present: 42, absent: 5 },
  { day: "Tue", present: 45, absent: 3 },
  { day: "Wed", present: 40, absent: 7 },
  { day: "Thu", present: 46, absent: 2 },
  { day: "Fri", present: 43, absent: 4 },
  { day: "Sat", present: 38, absent: 9 },
  { day: "Sun", present: 30, absent: 2 },
];

const financeMonthly = [
  { month: "Nov", income: 82000, expense: 54000 },
  { month: "Dec", income: 95000, expense: 61000 },
  { month: "Jan", income: 78000, expense: 49000 },
  { month: "Feb", income: 110000, expense: 72000 },
  { month: "Mar", income: 98000, expense: 58000 },
  { month: "Apr", income: 125000, expense: 80000 },
  { month: "May", income: 115000, expense: 69000 },
];

const stockPie = [
  { name: "Ration Dry",   value: 34, color: C.indigo  },
  { name: "Ration Fresh", value: 22, color: C.cyan    },
  { name: "Cleaning",     value: 18, color: C.emerald },
  { name: "Medical",      value: 14, color: C.violet  },
  { name: "Electrical",   value: 12, color: C.amber   },
];

const enquiryStatus = [
  { name: "Open",      value: 18, fill: C.amber   },
  { name: "Contacted", value: 32, fill: C.indigo  },
  { name: "Closed",    value: 50, fill: C.emerald },
];

const staffRadial = [
  { name: "Active",   value: 78, fill: C.emerald },
  { name: "OnLeave",  value: 12, fill: C.amber   },
  { name: "Inactive", value: 10, fill: C.rose    },
];

const STAT_CARDS = [
  { label: "Total Inmates",    value: "147",   delta: "+3",  up: true,  icon: Users,       color: "indigo", bg: "#eef2ff" },
  { label: "Staff Active",     value: "38",    delta: "+1",  up: true,  icon: UserCheck,   color: "emerald",bg: "#ecfdf5" },
  { label: "Monthly Income",   value: "₹1.15L",delta: "+8%", up: true,  icon: DollarSign,  color: "violet", bg: "#f5f3ff" },
  { label: "Open Enquiries",   value: "18",    delta: "-4",  up: false, icon: AlertCircle, color: "amber",  bg: "#fffbeb" },
  { label: "Stock Items Low",  value: "6",     delta: "+2",  up: false, icon: Package,     color: "rose",   bg: "#fff1f2" },
  { label: "Today Visitors",   value: "12",    delta: "+3",  up: true,  icon: Activity,    color: "cyan",   bg: "#ecfeff" },
];

const QUICK_LINKS = [
  { label: "Admission Register", icon: "🏥", tab: "People"   },
  { label: "Salary Register",    icon: "💰", tab: "Finance"  },
  { label: "Stock Ration Dry",   icon: "🌾", tab: "Stocks"   },
  { label: "Death Register",     icon: "📋", tab: "General"  },
  { label: "Oldage Enquiry",     icon: "👴", tab: "Enquiry"  },
  { label: "Accounts Register",  icon: "📊", tab: "Finance"  },
];

const COLOR_MAP = {
  indigo:  { text: "#4f46e5", ring: "#c7d2fe" },
  emerald: { text: "#059669", ring: "#a7f3d0" },
  violet:  { text: "#7c3aed", ring: "#ddd6fe" },
  amber:   { text: "#d97706", ring: "#fde68a" },
  rose:    { text: "#e11d48", ring: "#fecdd3" },
  cyan:    { text: "#0891b2", ring: "#a5f3fc" },
};

const toDateKey = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
};

const monthLabel = (date) => date.toLocaleString("en-IN", { month: "short" });
const dayLabel = (date) => date.toLocaleString("en-IN", { weekday: "short" });

const lastMonths = (count = 7) => {
  const now = new Date();
  return Array.from({ length: count }, (_, index) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (count - 1 - index), 1);
    return {
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: monthLabel(d),
    };
  });
};

const lastDays = (count = 7) => {
  const today = new Date();
  return Array.from({ length: count }, (_, index) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (count - 1 - index));
    return { key: toDateKey(d), label: dayLabel(d) };
  });
};

const pct = (value, total) => total > 0 ? Math.round((value / total) * 100) : 0;

const buildVisitorAnalytics = (visitors = []) => {
  const todayKey = toDateKey(new Date());
  const checkedIn = visitors.filter(v => v.status === "Checked-In").length;
  const checkedOut = visitors.filter(v => v.status === "Checked-Out").length;
  const todayVisitors = visitors.filter(v => toDateKey(v.checkInTime || v.createdAt) === todayKey).length;

  const monthly = lastMonths().map(({ key, label }) => ({
    month: label,
    total: visitors.filter(v => (toDateKey(v.checkInTime || v.createdAt)).startsWith(key)).length,
    checkedOut: visitors.filter(v => (toDateKey(v.checkInTime || v.createdAt)).startsWith(key) && v.status === "Checked-Out").length,
  }));

  const weekly = lastDays().map(({ key, label }) => {
    const dayVisitors = visitors.filter(v => toDateKey(v.checkInTime || v.createdAt) === key);
    return {
      day: label,
      checkedIn: dayVisitors.filter(v => v.status === "Checked-In").length,
      checkedOut: dayVisitors.filter(v => v.status === "Checked-Out").length,
    };
  });

  const purposeMap = visitors.reduce((map, visitor) => {
    const name = visitor.purpose || "Not specified";
    map[name] = (map[name] || 0) + 1;
    return map;
  }, {});

  const purposePie = Object.entries(purposeMap)
    .map(([name, value], index) => ({ name, value, color: [C.indigo, C.cyan, C.emerald, C.violet, C.amber, C.rose][index % 6] }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  return {
    cards: [
      { label: "Total Visitors", value: visitors.length, delta: `${todayVisitors} today`, up: true, icon: Users, color: "indigo", bg: "#eef2ff" },
      { label: "Checked In", value: checkedIn, delta: "live", up: true, icon: UserCheck, color: "emerald", bg: "#ecfdf5" },
      { label: "Checked Out", value: checkedOut, delta: `${pct(checkedOut, visitors.length)}%`, up: true, icon: Clock, color: "violet", bg: "#f5f3ff" },
      { label: "Today Visitors", value: todayVisitors, delta: "DB", up: true, icon: Activity, color: "cyan", bg: "#ecfeff" },
    ],
    monthly,
    weekly,
    pie: purposePie.length ? purposePie : [{ name: "No data", value: 1, color: C.slate }],
    statusPie: [
      { name: "Checked-In", value: checkedIn, fill: C.emerald },
      { name: "Checked-Out", value: checkedOut, fill: C.indigo },
    ].filter(item => item.value > 0),
    radial: [
      { name: "Checked-In", value: pct(checkedIn, visitors.length), fill: C.emerald },
      { name: "Checked-Out", value: pct(checkedOut, visitors.length), fill: C.indigo },
    ].filter(item => item.value > 0),
  };
};

const buildCallAnalytics = (calls = []) => {
  const todayKey = toDateKey(new Date());
  const completed = calls.filter(c => ["completed", "answered"].includes(c.status?.toLowerCase())).length;
  const missed = calls.filter(c => c.status === "missed").length;
  const active = calls.filter(c => ["incoming", "ringing", "assigned", "in_progress"].includes(c.status)).length;
  const todayCalls = calls.filter(c => toDateKey(c.createdAt || c.startTime) === todayKey).length;

  const monthly = lastMonths().map(({ key, label }) => {
    const monthCalls = calls.filter(c => (toDateKey(c.createdAt || c.startTime)).startsWith(key));
    return {
      month: label,
      total: monthCalls.length,
      completed: monthCalls.filter(c => ["completed", "answered"].includes(c.status?.toLowerCase())).length,
      missed: monthCalls.filter(c => c.status === "missed").length,
    };
  });

  const weekly = lastDays().map(({ key, label }) => {
    const dayCalls = calls.filter(c => toDateKey(c.createdAt || c.startTime) === key);
    return {
      day: label,
      completed: dayCalls.filter(c => ["completed", "answered"].includes(c.status?.toLowerCase())).length,
      missed: dayCalls.filter(c => c.status === "missed").length,
    };
  });

  const statusMap = calls.reduce((map, call) => {
    const name = call.status || "unknown";
    map[name] = (map[name] || 0) + 1;
    return map;
  }, {});

  return {
    cards: [
      { label: "Total Calls", value: calls.length, delta: `${todayCalls} today`, up: true, icon: PhoneCall, color: "indigo", bg: "#eef2ff" },
      { label: "Completed", value: completed, delta: `${pct(completed, calls.length)}%`, up: true, icon: UserCheck, color: "emerald", bg: "#ecfdf5" },
      { label: "Missed Calls", value: missed, delta: `${pct(missed, calls.length)}%`, up: false, icon: AlertCircle, color: "rose", bg: "#fff1f2" },
      { label: "Active/Pending", value: active, delta: "live", up: true, icon: Activity, color: "cyan", bg: "#ecfeff" },
    ],
    monthly,
    weekly,
    pie: Object.entries(statusMap)
      .map(([name, value], index) => ({ name, value, color: [C.indigo, C.rose, C.emerald, C.violet, C.amber, C.cyan][index % 6] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6),
    statusPie: [
      { name: "Completed", value: completed, fill: C.emerald },
      { name: "Missed", value: missed, fill: C.rose },
      { name: "Active", value: active, fill: C.amber },
    ].filter(item => item.value > 0),
    radial: [
      { name: "Completed", value: pct(completed, calls.length), fill: C.emerald },
      { name: "Missed", value: pct(missed, calls.length), fill: C.rose },
      { name: "Active", value: pct(active, calls.length), fill: C.amber },
    ].filter(item => item.value > 0),
  };
};

// ── Custom Tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#1e1b4b", borderRadius: 10, padding: "8px 14px",
      fontSize: 12, color: "#e0e7ff", boxShadow: "0 4px 20px rgba(0,0,0,0.25)"
    }}>
      <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || "#a5b4fc" }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

// ── Search Modal ──────────────────────────────────────────────────────────────
function SearchModal({ onClose }) {
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!query.trim()) { setError("Please enter a name or phone number"); return; }
    setLoading(true); setError("");
    try {
      const res = await axios.get(`${API_URL}/api/visitor/search`, { params: { query: query.trim() } });
      const v = res.data.visitor;
      if (v) {
        const visits = (res.data.visits || []).sort((a, b) => new Date(b.checkInTime) - new Date(a.checkInTime));
        setResults({ ...v, visits, visitCount: visits.length });
      } else {
        setError("No visitor found with that name or phone number");
        setResults(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Search failed. Please try again.");
      setResults(null);
    } finally { setLoading(false); }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4"
      style={{ background: "rgba(15,15,35,0.65)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "#fff", maxHeight: "80vh", display: "flex", flexDirection: "column" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Search Bar */}
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Search style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "#94a3b8" }} />
              <input
                ref={inputRef}
                value={query}
                onChange={e => { setQuery(e.target.value); setError(""); }}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                placeholder="Search visitor by name or phone…"
                style={{
                  width: "100%", paddingLeft: 42, paddingRight: 16, paddingTop: 11, paddingBottom: 11,
                  border: "1.5px solid #e2e8f0", borderRadius: 12, fontSize: 14,
                  background: "#f8fafc", outline: "none", color: "#0f172a",
                  boxSizing: "border-box",
                }}
                onFocus={e => e.target.style.borderColor = "#6366f1"}
                onBlur={e => e.target.style.borderColor = "#e2e8f0"}
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              style={{
                padding: "11px 22px", background: "#6366f1", color: "#fff",
                border: "none", borderRadius: 12, fontSize: 14, fontWeight: 600,
                cursor: "pointer", whiteSpace: "nowrap",
              }}
            >
              {loading ? "…" : "Search"}
            </button>
            <button onClick={onClose} style={{ padding: 8, border: "none", background: "transparent", cursor: "pointer", color: "#94a3b8" }}>
              <X style={{ width: 18, height: 18 }} />
            </button>
          </div>
          {error && (
            <p style={{ marginTop: 10, fontSize: 13, color: "#e11d48", display: "flex", alignItems: "center", gap: 6 }}>
              <AlertCircle style={{ width: 14, height: 14 }} /> {error}
            </p>
          )}
        </div>

        {/* Results */}
        {results && (
          <div style={{ overflowY: "auto", flex: 1 }}>
            {/* Profile */}
            <div style={{ padding: "20px 24px", background: "linear-gradient(135deg,#eef2ff,#f5f3ff)", borderBottom: "1px solid #e0e7ff" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: "50%",
                  background: "#6366f1", color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22, fontWeight: 700, flexShrink: 0,
                }}>
                  {results.name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 18, fontWeight: 700, color: "#1e1b4b", margin: 0 }}>{results.name}</p>
                  <div style={{ display: "flex", gap: 16, marginTop: 6, fontSize: 13, color: "#64748b" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Phone style={{ width: 13, height: 13 }} /> {results.phone}
                    </span>
                    {results.address && (
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <MapPin style={{ width: 13, height: 13 }} /> {results.address}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 32, fontWeight: 800, color: "#6366f1", margin: 0 }}>{results.visitCount}</p>
                  <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>Total Visits</p>
                </div>
              </div>
            </div>

            {/* Visit Table */}
            {results.visits?.length > 0 && (
              <div style={{ padding: "0 0 16px" }}>
                <div style={{ padding: "14px 24px 10px", fontSize: 13, fontWeight: 600, color: "#475569" }}>
                  Visit History
                </div>
                <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      {["Check-in","Check-out","Duration","Status","Purpose"].map(h => (
                        <th key={h} style={{ padding: "8px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.visits.map((v, i) => {
                      const dur = v.checkOutTime
                        ? (() => { const m = Math.round((new Date(v.checkOutTime)-new Date(v.checkInTime))/60000); return m>59?`${Math.floor(m/60)}h ${m%60}m`:`${m}m`; })()
                        : "—";
                      return (
                        <tr key={i} style={{ borderTop: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "10px 16px", color: "#334155" }}>
                            {new Date(v.checkInTime).toLocaleString("en-IN",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}
                          </td>
                          <td style={{ padding: "10px 16px", color: "#334155" }}>
                            {v.checkOutTime ? new Date(v.checkOutTime).toLocaleString("en-IN",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}) : "—"}
                          </td>
                          <td style={{ padding: "10px 16px", fontWeight: 600, color: "#1e293b" }}>{dur}</td>
                          <td style={{ padding: "10px 16px" }}>
                            <span style={{
                              padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500,
                              background: v.status==="Checked-In" ? "#dcfce7" : "#f1f5f9",
                              color: v.status==="Checked-In" ? "#15803d" : "#64748b",
                            }}>{v.status}</span>
                          </td>
                          <td style={{ padding: "10px 16px", color: "#64748b" }}>{v.purpose || "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Empty hint */}
        {!results && !error && (
          <div style={{ padding: "36px 24px", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
            <Search style={{ width: 32, height: 32, marginBottom: 10, opacity: 0.4, display: "inline-block" }} />
            <p>Type a name or phone number and press Search</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Section Card wrapper ──────────────────────────────────────────────────────
function Card({ title, subtitle, icon: Icon, children, style = {} }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 16, border: "1px solid #f1f5f9",
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)", overflow: "hidden", ...style
    }}>
      {(title || subtitle) && (
        <div style={{ padding: "16px 20px 0", display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          {Icon && <Icon style={{ width: 16, height: 16, color: "#6366f1" }} />}
          <div>
            {title && <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{title}</p>}
            {subtitle && <p style={{ margin: 0, fontSize: 11, color: "#94a3b8", marginTop: 1 }}>{subtitle}</p>}
          </div>
        </div>
      )}
      <div style={{ padding: "12px 20px 18px" }}>{children}</div>
    </div>
  );
}

// ── Main Admin component ──────────────────────────────────────────────────────
export default function Admin() {
  const dispatch = useDispatch();
  const notifications = useSelector((state) => state.chat.notifications);

  const [openForm,    setOpenForm]    = useState(false);
  const [showSearch,  setShowSearch]  = useState(false);
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [activeView,  setActiveView]  = useState("dashboard"); // "dashboard" | "crm"
  const [chartMode,   setChartMode]   = useState("visitors");  // "visitors" | "calls"
  const [visitors,    setVisitors]    = useState([]);
  const [calls,       setCalls]       = useState([]);
  const [chatUsers,   setChatUsers]   = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError,   setAnalyticsError]   = useState("");
  const myId = localStorage.getItem("userId");

  const handleMarkNotifRead = (id) => dispatch(markNotificationRead(id));

  const fetchDashboardData = async () => {
    setAnalyticsLoading(true);
    setAnalyticsError("");
    try {
      const [visitorRes, callRes] = await Promise.all([
        axios.get(`${API_URL}/api/visitor`, { params: { page: 1, limit: 5000 } }),
        axios.get(`${API_URL}/api/calls`, { params: { limit: 5000 } }),
      ]);
      setVisitors(visitorRes.data.visitors || []);
      setCalls(callRes.data.data || []);
    } catch (err) {
      setAnalyticsError(err.response?.data?.message || "Failed to load dashboard analytics");
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const timer = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchChatUsers = async () => {
      try {
        const res = await API.get("/users");
        setChatUsers((res.data || []).filter(user =>
          user._id !== myId && user.role !== "admin"
        ));
      } catch (err) {
        console.error("Failed to load chat users:", err);
      }
    };
    if (myId) fetchChatUsers();
  }, [myId]);

  const visitorAnalytics = useMemo(() => buildVisitorAnalytics(visitors), [visitors]);
  const callAnalytics = useMemo(() => buildCallAnalytics(calls), [calls]);
  const analytics = chartMode === "visitors" ? visitorAnalytics : callAnalytics;
  const isVisitorMode = chartMode === "visitors";
  const recentRecords = useMemo(() => {
    if (isVisitorMode) {
      return visitors
        .slice()
        .sort((a, b) => new Date(b.checkInTime || b.createdAt) - new Date(a.checkInTime || a.createdAt))
        .slice(0, 6)
        .map(v => ({
          id: v._id,
          title: v.name || "Unknown visitor",
          meta: v.phone || v.purpose || "No phone",
          status: v.status || "Visitor",
          time: v.checkInTime || v.createdAt,
          tone: v.status === "Checked-In" ? C.emerald : C.indigo,
        }));
    }

    return calls
      .slice()
      .sort((a, b) => new Date(b.createdAt || b.startTime) - new Date(a.createdAt || a.startTime))
      .slice(0, 6)
      .map(c => ({
        id: c._id,
        title: c.contact?.name || c.number || "Unknown caller",
        meta: c.assignedTo?.name || c.agent?.name || "Unassigned",
        status: c.status || "Call",
        time: c.createdAt || c.startTime,
        tone: c.status === "missed" ? C.rose : c.status === "completed" ? C.emerald : C.amber,
      }));
  }, [calls, isVisitorMode, visitors]);

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f8fafc", overflow: "hidden" }}>
      <Sidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* ── Top Bar ── */}
        <div style={{
          background: "#fff", borderBottom: "1px solid #f1f5f9",
          padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Visitor Dashboard</h1>
            <p style={{ margin: 0, fontSize: 12, color: "#94a3b8", marginTop: 2 }}>Manage visitors, enquiries &amp; institutional records</p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <NotificationChatDropdown
              myId={myId}
              agents={chatUsers}
              notifications={notifications}
              onMarkNotifRead={handleMarkNotifRead}
              onOpenFullChat={() => setShowChatPanel(true)}
            />
            {activeView === "dashboard" && (
              <div style={{
                display: "flex", gap: 4, padding: 4, border: "1px solid #e2e8f0",
                borderRadius: 14, background: "#f8fafc",
              }}>
                {[
                  { key: "visitors", label: "Visitors", icon: Users },
                  { key: "calls", label: "Calls", icon: PhoneCall },
                ].map(({ key, label, icon: Icon }) => {
                  const active = chartMode === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setChartMode(key)}
                      title={`Switch to ${label} charts`}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "7px 11px", borderRadius: 10, border: "none",
                        background: active ? "#6366f1" : "transparent",
                        color: active ? "#fff" : "#64748b",
                        fontSize: 12, fontWeight: 700, cursor: "pointer",
                        boxShadow: active ? "0 6px 16px rgba(99,102,241,0.25)" : "none",
                      }}
                    >
                      <Icon style={{ width: 14, height: 14 }} />
                      {label}
                    </button>
                  );
                })}
              </div>
            )}
            {activeView === "dashboard" && (
              <button
                onClick={fetchDashboardData}
                title="Refresh chart data"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 38, height: 38, borderRadius: 12,
                  border: "1.5px solid #e2e8f0", background: "#f8fafc",
                  color: "#64748b", cursor: "pointer",
                }}
              >
                <RefreshCw style={{ width: 15, height: 15 }} />
              </button>
            )}
            {/* Search Button */}
            <button
              onClick={() => setShowChatPanel(true)}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "9px 16px", borderRadius: 12,
                border: "1.5px solid #e2e8f0", background: "#f8fafc",
                fontSize: 13, fontWeight: 500, color: "#475569", cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor="#6366f1"; e.currentTarget.style.color="#6366f1"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor="#e2e8f0"; e.currentTarget.style.color="#475569"; }}
            >
              <Search style={{ width: 15, height: 15 }} />
              Open Chat
            </button>

            <button
              onClick={() => setShowSearch(true)}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "9px 16px", borderRadius: 12,
                border: "1.5px solid #e2e8f0", background: "#f8fafc",
                fontSize: 13, fontWeight: 500, color: "#475569", cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor="#6366f1"; e.currentTarget.style.color="#6366f1"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor="#e2e8f0"; e.currentTarget.style.color="#475569"; }}
            >
              <Search style={{ width: 15, height: 15 }} />
              Search Visitor
              <span style={{ fontSize: 11, background: "#f1f5f9", padding: "2px 7px", borderRadius: 6, color: "#94a3b8" }}>⌘K</span>
            </button>

            {/* Create User */}
            <button
              onClick={() => setOpenForm(true)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "9px 16px", borderRadius: 12,
                background: "#6366f1", border: "none",
                fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer",
              }}
            >
              <Users style={{ width: 15, height: 15 }} />
              Create User
            </button>
          </div>
        </div>

        {/* ── Tab Navigation ── */}
        <div style={{
          background: "#fff", borderBottom: "1px solid #f1f5f9",
          padding: "0 24px", display: "flex", gap: 0, flexShrink: 0,
        }}>
          {[
            { key: "dashboard", label: "Dashboard",   icon: BarChart2  },
            { key: "crm",       label: "Visitor CRM", icon: Users      },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveView(key)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "12px 18px", border: "none", background: "transparent",
                fontSize: 13, fontWeight: 500, cursor: "pointer",
                borderBottom: activeView === key ? "2px solid #6366f1" : "2px solid transparent",
                color: activeView === key ? "#6366f1" : "#64748b",
                transition: "all 0.15s",
              }}
            >
              <Icon style={{ width: 15, height: 15 }} />
              {label}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>

          {activeView === "dashboard" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {analyticsError && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "#fff1f2", color: "#be123c", border: "1px solid #fecdd3",
                  borderRadius: 12, padding: "10px 14px", fontSize: 13, fontWeight: 600,
                }}>
                  <AlertCircle style={{ width: 15, height: 15 }} />
                  {analyticsError}
                </div>
              )}

              {/* Stat Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 14 }}>
                {analytics.cards.map(({ label, value, delta, up, icon: Icon, color, bg }) => {
                  const { text, ring } = COLOR_MAP[color];
                  return (
                    <div key={label} style={{
                      background: "#fff", borderRadius: 14, padding: "16px 18px",
                      border: `1px solid #f1f5f9`, boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Icon style={{ width: 18, height: 18, color: text }} />
                        </div>
                        <span style={{
                          fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 3,
                          color: up ? "#10b981" : "#f43f5e",
                        }}>
                          {up ? <ArrowUpRight style={{ width: 12, height: 12 }} /> : <ArrowDownRight style={{ width: 12, height: 12 }} />}
                          {delta}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0f172a" }}>
                        {analyticsLoading ? "…" : value}
                      </p>
                      <p style={{ margin: "3px 0 0", fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>{label}</p>
                    </div>
                  );
                })}
              </div>

              {/* Row 2 — Area chart + Pie */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16 }}>
                <Card
                  title={isVisitorMode ? "Visitor Monthly Overview" : "Call Monthly Overview"}
                  subtitle={isVisitorMode ? "Checked-in vs checked-out - last 7 months" : "Completed vs missed - last 7 months"}
                  icon={TrendingUp}
                >
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={analytics.monthly} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={C.indigo} stopOpacity={0.25} />
                          <stop offset="95%" stopColor={C.indigo} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={C.rose} stopOpacity={0.2} />
                          <stop offset="95%" stopColor={C.rose} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey={isVisitorMode ? "total" : "completed"} name={isVisitorMode ? "Visitors" : "Completed"} stroke={C.indigo} fill="url(#gIncome)" strokeWidth={2.5} dot={false} />
                      <Area type="monotone" dataKey={isVisitorMode ? "checkedOut" : "missed"} name={isVisitorMode ? "Checked Out" : "Missed"} stroke={C.rose} fill="url(#gExpense)" strokeWidth={2.5} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>

                <Card
                  title={isVisitorMode ? "Visitor Purpose" : "Call Status"}
                  subtitle={isVisitorMode ? "Purpose breakdown from visitor DB" : "Status breakdown from call DB"}
                  icon={isVisitorMode ? PieChart : PhoneCall}
                >
                  <ResponsiveContainer width="100%" height={220}>
                    <RechartsPie>
                      <Pie data={analytics.pie} cx="50%" cy="50%" innerRadius={52} outerRadius={82} paddingAngle={3} dataKey="value">
                        {analytics.pie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ borderRadius: 10, border: "none", background: "#1e1b4b", color: "#e0e7ff", fontSize: 12 }} />
                      <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 11, color: "#64748b" }}>{v}</span>} />
                    </RechartsPie>
                  </ResponsiveContainer>
                </Card>
              </div>

              {/* Row 3 — Attendance bar + Enquiry pie + Staff radial */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 260px 260px", gap: 16 }}>
                <Card
                  title={isVisitorMode ? "Weekly Visitor Flow" : "Weekly Call Flow"}
                  subtitle={isVisitorMode ? "Checked-in vs checked-out - last 7 days" : "Completed vs missed - last 7 days"}
                  icon={Calendar}
                >
                  <ResponsiveContainer width="100%" height={190}>
                    <BarChart data={analytics.weekly} margin={{ top: 4, right: 8, left: -16, bottom: 0 }} barSize={14} barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey={isVisitorMode ? "checkedIn" : "completed"} name={isVisitorMode ? "Checked In" : "Completed"} fill={C.emerald} radius={[4,4,0,0]} />
                      <Bar dataKey={isVisitorMode ? "checkedOut" : "missed"} name={isVisitorMode ? "Checked Out" : "Missed"} fill={C.rose} radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>

                <Card title={isVisitorMode ? "Visitor Status" : "Call Outcome"} subtitle="From live DB records" icon={FileText}>
                  <ResponsiveContainer width="100%" height={190}>
                    <RechartsPie>
                      <Pie data={analytics.statusPie.length ? analytics.statusPie : [{ name: "No data", value: 1, fill: C.slate }]} cx="50%" cy="50%" outerRadius={72} paddingAngle={3} dataKey="value">
                        {(analytics.statusPie.length ? analytics.statusPie : [{ fill: C.slate }]).map((e, i) => <Cell key={i} fill={e.fill} />)}
                      </Pie>
                      <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ borderRadius: 10, border: "none", background: "#1e1b4b", color: "#e0e7ff", fontSize: 12 }} />
                      <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ fontSize: 11, color: "#64748b" }}>{v}</span>} />
                    </RechartsPie>
                  </ResponsiveContainer>
                </Card>

                <Card title={isVisitorMode ? "Visitor Completion" : "Call Completion"} subtitle="Percentage split" icon={UserCheck}>
                  <ResponsiveContainer width="100%" height={190}>
                    <RadialBarChart cx="50%" cy="50%" innerRadius={28} outerRadius={80} data={analytics.radial.length ? analytics.radial : [{ name: "No data", value: 0, fill: C.slate }]} startAngle={90} endAngle={-270}>
                      <RadialBar minAngle={15} dataKey="value" cornerRadius={6} />
                      <Tooltip formatter={(v, n) => [`${v}%`, n]} contentStyle={{ borderRadius: 10, border: "none", background: "#1e1b4b", color: "#e0e7ff", fontSize: 12 }} />
                      <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ fontSize: 11, color: "#64748b" }}>{v}</span>} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </Card>
              </div>

              {/* Row 4 — Visitor trend + Quick links */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16 }}>
                <Card title={isVisitorMode ? "Visitor Trend" : "Call Trend"} subtitle="Monthly total count" icon={Activity}>
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={analytics.monthly} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="total" name={isVisitorMode ? "Visitors" : "Calls"} stroke={C.cyan} strokeWidth={2.5} dot={{ r: 4, fill: C.cyan, strokeWidth: 0 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>

                <Card title={isVisitorMode ? "Recent Visitors" : "Recent Calls"} subtitle="Latest DB records" icon={isVisitorMode ? Users : PhoneCall}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {recentRecords.length === 0 ? (
                      <div style={{
                        padding: "22px 12px",
                        borderRadius: 12,
                        border: "1px dashed #e2e8f0",
                        textAlign: "center",
                        fontSize: 12,
                        color: "#94a3b8",
                      }}>
                        No recent records found
                      </div>
                    ) : recentRecords.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "9px 10px",
                          borderRadius: 12,
                          border: "1px solid #f1f5f9",
                          background: "#fafafa",
                        }}
                      >
                        <span style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: item.tone,
                          boxShadow: `0 0 0 4px ${item.tone}18`,
                          flexShrink: 0,
                        }} />
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#334155", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {item.title}
                          </p>
                          <p style={{ margin: "2px 0 0", fontSize: 11, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {item.meta}
                          </p>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <p style={{ margin: 0, fontSize: 10, fontWeight: 800, color: item.tone, textTransform: "uppercase" }}>
                            {item.status}
                          </p>
                          <p style={{ margin: "2px 0 0", fontSize: 10, color: "#94a3b8" }}>
                            {item.time ? new Date(item.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

            </div>
          )}

          {/* ── Visitor CRM tab ── */}
          {activeView === "crm" && (
            <div style={{ maxWidth: 860, margin: "0 auto" }}>
              <div style={{
                background: "#fff", borderRadius: 18, border: "1px solid #f1f5f9",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)", padding: "32px",
                textAlign: "center",
              }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 16, background: "#eef2ff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 16px",
                }}>
                  <Search style={{ width: 28, height: 28, color: "#6366f1" }} />
                </div>
                <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 700, color: "#0f172a" }}>Visitor CRM Search</h2>
                <p style={{ margin: "0 0 24px", fontSize: 14, color: "#64748b" }}>
                  Search any visitor by name or phone number to view their complete visit history and profile.
                </p>
                <button
                  onClick={() => setShowSearch(true)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "12px 28px", borderRadius: 12,
                    background: "#6366f1", border: "none",
                    fontSize: 14, fontWeight: 600, color: "#fff", cursor: "pointer",
                  }}
                >
                  <Search style={{ width: 16, height: 16 }} />
                  Open Search
                </button>
=======
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/dashboards/Sidebar";
import ModulesPage from "./ModulesPage";
import AddUser from "../pages/Register";
import API from "../services/api";
import { ENQUIRY_STAGES } from "../constants/enquiryConstants";

const STAGE_LABELS = [
  { stage: ENQUIRY_STAGES.NEW, label: "New Enquiry", color: "border-emerald-500" },
  // { stage: ENQUIRY_STAGES.CONTACT, label: "Contact", color: "border-indigo-500" },
  { stage: ENQUIRY_STAGES.PITCHING, label: "Pitching", color: "border-amber-500" },
  { stage: ENQUIRY_STAGES.ENROLLED, label: "Enrolled", color: "border-teal-500" },
  { stage: "Converted", label: "Converted", color: "border-violet-500" },
];

const COMPLETED_CLIENTS_STAGE = { stage: "Closed Clients", label: "Closed Clients", color: "border-teal-500" };

export default function Admin() {
  const [showModules, setShowModules] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [counts, setCounts] = useState({});
  const [stageData, setStageData] = useState([]);
  const [leadData, setLeadData] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [agents, setAgents] = useState([]);
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCounts = async () => {
      setLoading(true);

      try {
        const [stageResponse, leadResponse, completedClientsResponse, agentResponse, callsResponse] = await Promise.all([
          API.get("/enquiries/counts"),
          API.get("/enquiries/counts", {
            params: {
              groupBy: "lead",
            },
          }),
          API.get("/enquiries", {
            params: {
              stage: ENQUIRY_STAGES.ENROLLED,
              taskStatus: "Completed",
            },
          }),
          API.get("/agents"),
          API.get("/calls"),
        ]);

        const stageData = stageResponse.data || [];
        const leadData = leadResponse.data || [];
        const completedClientsData = completedClientsResponse.data || [];
        const agentData = agentResponse.data?.data || agentResponse.data || [];
        const callsData = callsResponse.data?.data || callsResponse.data || [];
        const countsObject = {};
        stageData.forEach((item) => {
          countsObject[item._id] = item.count;
        });

        setCounts(countsObject);
        setStageData(stageData);
        setLeadData(leadData);
        setTasks(completedClientsData);
        setAgents(agentData);
        setCalls(callsData);
      } catch (err) {
        console.error("Failed to load dashboard counts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCounts();
  }, []);

  const totalCount = stageData.reduce((sum, item) => sum + (item.count || 0), 0);
  const pendingLeadsCount = counts[ENQUIRY_STAGES.NEW] || 0;
  const openLeadsCount = (counts[ENQUIRY_STAGES.CONTACT] || 0) + (counts[ENQUIRY_STAGES.PITCHING] || 0);
  const completedClientsCount = tasks.filter((task) => task.taskStatus === "Completed" && task.assignedTo).length;
  const connectedCount = loading ? 0 : openLeadsCount + completedClientsCount;
  const connectedPercentage = totalCount > 0 ? Math.min(100, Math.max(0, (connectedCount / totalCount) * 100)) : 0;
  const connectedRatio = connectedPercentage.toFixed(2);
  const activeAgentsCount = agents.filter((agent) => agent.status === "available").length;
  const breakAgentsCount = agents.filter((agent) => agent.status === "break").length;
  const busyAgentsCount = agents.filter((agent) => agent.status === "busy").length;
  const callCount = calls.length;
  const answeredCount = calls.filter((call) => call.status === "completed").length;
  const missedCount = calls.filter((call) => call.status === "missed").length;

  const dashboardStages = [
    ...STAGE_LABELS,
    ...stageData
      .filter(
        (item) =>
          !STAGE_LABELS.some((label) => label.stage === item._id)
      )
      .map((item) => ({ stage: item._id, label: item._id, color: "border-slate-400" })),
    COMPLETED_CLIENTS_STAGE,
  ];

  const getStageCount = (stage) => {
    if (stage === "Closed Clients") {
      return completedClientsCount;
    }
    return counts[stage] || 0;
  };

  return (
    <div className="flex h-screen bg-[#F8F9FB]">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white px-8 py-4 flex items-center justify-between border-b border-gray-100">
          <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
          <div className="flex gap-3">
            <button onClick={() => setShowModules(true)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-md border hover:bg-gray-100">Modules</button>
            <button onClick={() => setOpenForm(true)} className="px-4 py-2 text-sm font-medium text-white bg-[#7B42BC] rounded-md hover:bg-[#6836A3] transition-colors">+ Create User</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {showModules ? (
            <ModulesPage setShowModules={setShowModules} />
          ) : (
            <div className="max-w-[1600px] mx-auto space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div className="lg:col-span-9 space-y-6">
                  <div className="grid grid-cols-1 xl:grid-cols-9 gap-6 items-stretch">
                    <div className="xl:col-span-5 bg-white rounded-[32px] border border-slate-200 shadow-sm p-6 h-full flex flex-col">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-slate-700 mt-6 mb-2 uppercase tracking-wider">Call Overview</h3>
                          <p className="text-sm text-slate-500 mt-1">Connected rate and total enquiries</p>
                        </div>

                        <button
                          onClick={() => navigate("/EnquiryCalls")}
                          className="h-11 rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-[#7B42BC] shadow-sm transition hover:border-[#7B42BC] hover:bg-purple-50"
                        >
                          View Report
                        </button>
                      </div>

                      <div className="flex flex-1 flex-col items-center justify-center gap-6 pt-7">
                        <div className="relative h-40 w-full max-w-[340px]">
                          <svg className="h-full w-full overflow-visible" viewBox="0 0 260 150" fill="none">
                            <path d="M 35 125 A 95 95 0 0 1 225 125" stroke="#E2E8F0" strokeWidth="20" strokeLinecap="round" pathLength="100" />
                            <path
                              d="M 35 125 A 95 95 0 0 1 225 125"
                              stroke="#7B42BC"
                              strokeWidth="20"
                              strokeLinecap="round"
                              pathLength="100"
                              strokeDasharray="100"
                              strokeDashoffset={100 - connectedPercentage}
                              className="transition-all duration-1000 ease-out"
                            />
                          </svg>
                          <div className="absolute inset-x-0 top-[72px] flex flex-col items-center text-center">
                            <span className="text-3xl font-semibold text-slate-900">{connectedRatio}%</span>
                            <span className="mt-1 text-xs uppercase tracking-[0.28em] text-slate-400">Connected</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 w-full">
                          <div className="rounded-3xl bg-slate-50 p-4 shadow-sm">
                            <p className="text-xs text-slate-500 uppercase tracking-[0.18em]">Connected</p>
                            <p className="mt-3 text-2xl font-semibold text-slate-900">{connectedCount}</p>
                          </div>
                          <div className="rounded-3xl bg-slate-50 p-4 shadow-sm">
                            <p className="text-xs text-slate-500 uppercase tracking-[0.18em]">Total</p>
                            <p className="mt-3 text-2xl font-semibold text-slate-900">{totalCount}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="xl:col-span-4 bg-white rounded-[32px] border border-slate-200 shadow-sm p-6 h-full flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-sm font-bold text-slate-700 mt-6 mb-2 uppercase tracking-wider">Agent Activity</h3>
                          <p className="text-sm text-slate-500 mt-1">Live agent availability</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div className="rounded-[32px] border border-slate-200 bg-emerald-50/20 p-5 flex items-center gap-4">
                          <div className="h-14 w-14 rounded-3xl bg-emerald-50 flex items-center justify-center shadow-sm">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M3 21c0-3.866 3.134-7 7-7h1a3 3 0 1 0 0-6h-1a7 7 0 1 1 0 14H3Z" stroke="#047857" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M10 7c.828 0 1.5-.672 1.5-1.5S10.828 4 10 4s-1.5.672-1.5 1.5S9.172 7 10 7Z" stroke="#047857" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Active Agents</p>
                            <p className="mt-3 text-3xl font-semibold text-slate-900">{activeAgentsCount}</p>
                            <p className="text-xs text-slate-400 mt-1">of {agents.length} total</p>
                          </div>
                        </div>

                        <div className="rounded-[32px] border border-slate-200 bg-amber-50/20 p-5 flex items-center gap-4">
                          <div className="h-14 w-14 rounded-3xl bg-amber-50 flex items-center justify-center shadow-sm">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M8 18h8" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" />
                              <path d="M7 18c0-2.761 1.343-5 3-5h4c1.657 0 3 2.239 3 5" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" />
                              <path d="M8 8h8v4H8z" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M10 12V8" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">On-break Agents</p>
                            <p className="mt-3 text-3xl font-semibold text-slate-900">{breakAgentsCount}</p>
                            <p className="text-xs text-slate-400 mt-1">of {agents.length} total</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-6">
                    <h3 className="text-sm font-bold text-slate-700 mt-6 mb-2 uppercase tracking-wider">Quick Access</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: "Visitor", path: "/visitorpage", icon: <i className='fas fa-user text-orange-400 text-xl'></i> },
                        { label: "Enquiries", path: "/enquiry", icon: <i className='fas fa-question-circle text-blue-500 text-xl'></i> },
                        { label: "Call Center", path: "/EnquiryCalls", icon: <i className='fas fa-phone-alt text-green-500 text-xl'></i> },
                        { label: "Analytics", path: "/analytics", icon: <i className='fas fa-chart-bar text-purple-500 text-xl'></i> },
                        { label: "HR Staff", path: "/staff", icon: <i className='fas fa-users text-pink-500 text-xl'></i> },
                        { label: "Tasks", path: "/tasks", icon: <i className='fas fa-tasks text-yellow-500 text-xl'></i> },
                        { label: "Settings", path: "/settings", icon: <i className='fas fa-cog text-gray-500 text-xl'></i> },
                      ].map((item) => (
                        <button
                          key={item.path}
                          onClick={() => navigate(item.path)}
                          className="bg-white p-4 rounded-xl border border-gray-200 hover:border-[#7B42BC] hover:shadow-md transition-all group text-center"
                        >
                          <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700 group-hover:text-white transition-colors">
                            {item.icon}
                          </div>
                          <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider">{item.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-3 bg-white rounded-[32px] border border-slate-200 shadow-sm p-4 overflow-hidden h-full flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="ttext-sm font-bold text-slate-700 mt-6 mb-2 uppercase tracking-wider">Leads by Stage</h3>
                      <p className="text-sm text-slate-500 mt-1">Stage-wise funnel distribution</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {dashboardStages.map((item) => {
                      const stageCount = getStageCount(item.stage);
                      const percentage = totalCount > 0 ? ((stageCount / totalCount) * 100).toFixed(1) : 0;

                      return (
                        <div key={item.stage} className="space-y-2">
                          {/* Add Client Report Heading only before Closed Clients */}
                          {item.stage === "Closed Clients" && (
                            <h4 className="text-sm font-bold text-slate-700 mt-6 mb-2 uppercase tracking-wider">
                              Client Report
                            </h4>
                          )}

                          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 flex flex-col gap-3 shadow-sm">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-2xl font-semibold text-slate-900">{stageCount}</p>
                                <p className="text-sm text-slate-500">{item.label}</p>
                              </div>
                              <p className="text-sm font-medium text-slate-400">{percentage}%</p>
                            </div>

                            {/* Percentage Line (Progress Bar) */}
                            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-1000 ${
                                  item.color.includes('emerald') ? 'bg-emerald-500' : 
                                  item.color.includes('amber') ? 'bg-amber-500' : 
                                  item.color.includes('teal') ? 'bg-teal-500' : 'bg-slate-400'
                                }`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
>>>>>>> 37407dc37049a79f7632adc8b84729e75f200b4e
              </div>
            </div>
          )}
        </div>
<<<<<<< HEAD
=======

        {openForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setOpenForm(false)}>
            <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl mx-4" onClick={(event) => event.stopPropagation()}>
              <AddUser onClose={() => setOpenForm(false)} />
            </div>
          </div>
        )}
>>>>>>> 37407dc37049a79f7632adc8b84729e75f200b4e
      </div>

      {/* ── Chat Panel Overlay ── */}
      {showChatPanel && (
        <div style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(15,15,35,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ width: "100%", maxWidth: 1260, height: "calc(100vh - 40px)", background: "transparent" }}>
            <AdminChatPanel myId={myId} agents={chatUsers} onClose={() => setShowChatPanel(false)} />
          </div>
        </div>
      )}

      {/* ── Search Modal ── */}
      {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}

      {/* ── Create User Modal ── */}
      {openForm && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}
          onClick={() => setOpenForm(false)}
        >
          <div style={{ background: "#fff", borderRadius: 18, maxWidth: 640, width: "100%", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}
            onClick={e => e.stopPropagation()}>
            <AddUser onClose={() => setOpenForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
