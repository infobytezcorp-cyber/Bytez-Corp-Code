import { useNavigate, useLocation } from "react-router-dom";
import { logout } from "../../../utils/auth";
import { useState } from "react";
import {
  analytics, collapseClose, collapseexpand, dashboard,
  enquiry, leaves, logoutBtn, settings, Transaction, trend, visitor
} from "../../../utils/icons";

// ─── Telecaller Icon (Phone) ──────────────────────────────────
const TelecallerIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
    strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12 19.79 19.79 0 0 1 1.9 3.37 2 2 0 0 1 3.89 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 5.99 5.99l1.07-1.07a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const icons = {
  dashboard,
  enquiry,
  manager: trend,
  logout: logoutBtn,
  collapse: collapseClose,
  expand: collapseexpand,
  visitor,
  analytics,
  settings,
  leaves,
  telecaller: TelecallerIcon,
};

const adminItems = [
  { label: "Dashboard",   path: "/admin",        icon: icons.dashboard  },
  { label: "Visitor",     path: "/visitorpage",  icon: icons.visitor    },
  { label: "Calls",       path: "/EnquiryCalls", icon: icons.leaves     },
  { label: "Analytics",   path: "/analytics",    icon: icons.analytics  },
  { label: "Enquiry",     path: "/enquiry",      icon: icons.enquiry    },
  { label: "Settings",    path: "/settings",     icon: icons.settings   },
];

// ─── NavItem ──────────────────────────────────────────────────
function NavItem({ label, path, icon, isActive, onClick, collapsed }) {
  return (
    <li
      onClick={onClick}
      title={collapsed ? label : ""}
      className={`flex items-center gap-2.5 py-2 rounded-lg cursor-pointer mb-0.5 border transition-all ${
        collapsed ? "justify-center px-2" : "px-2.5"
      } ${
        isActive
          ? "bg-blue-900/30 border-blue-600/30"
          : "border-transparent hover:bg-white/5"
      }`}
    >
      <div className={`w-8 h-8 min-w-[32px] rounded-lg flex items-center justify-center ${
        isActive ? "bg-blue-700/40 text-blue-300" : "bg-white/5 text-white/40"
      }`}>
        {icon}
      </div>
      {!collapsed && (
        <>
          <span className={`text-sm flex-1 ${isActive ? "text-blue-200 font-medium" : "text-white/55"}`}>
            {label}
          </span>
          {isActive && <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />}
        </>
      )}
    </li>
  );
}

// ─── Telecaller Sub-Nav Items ─────────────────────────────────
const telecallerSubItems = [
  {
    label: "Dashboard",
    path: "/telecaller",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
        <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />
      </svg>
    ),
  },
];

// ─── Sidebar ──────────────────────────────────────────────────
export default function Sidebar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const role     = localStorage.getItem("role");
  const name     = localStorage.getItem("name") || "Admin";
  const email    = localStorage.getItem("email") || "";
  const initials = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  const isTelecallerSection = location.pathname === "/telecaller";

  return (
    <div
      className="h-screen flex flex-col transition-all duration-300"
      style={{ background: "#0f172a", width: collapsed ? "72px" : "256px", minWidth: collapsed ? "72px" : "256px" }}
    >
      {/* Header */}
      <div className={`p-4 border-b border-white/8 flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 min-w-[36px] bg-blue-600 rounded-xl flex items-center justify-center">
              {icons.dashboard}
            </div>
            <div>
              <h2 className="text-sm font-medium text-white">Dashboard</h2>
              <p className="text-xs text-white/35">ERP Management</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white/80 transition-all border border-white/8"
        >
          {collapsed ? icons.expand : icons.collapse}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-2">
        {!collapsed && (
          <p className="text-[10px] font-medium text-white/30 uppercase tracking-widest px-2 mb-2 mt-1">
            Main menu
          </p>
        )}
        <ul className="space-y-0.5">

          {/* ADMIN */}
          {role === "admin" && adminItems.map(item => (
            <NavItem
              key={item.path}
              {...item}
              collapsed={collapsed}
              isActive={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            />
          ))}

          {/* MANAGER */}
          {role === "manager" && (
            <>
              <NavItem label="Manager Panel" path="/manager"  icon={icons.manager} collapsed={collapsed} isActive={location.pathname === "/manager"}  onClick={() => navigate("/manager")} />
              <NavItem label="Projects"      path="/projects" icon={icons.manager} collapsed={collapsed} isActive={location.pathname === "/projects"} onClick={() => navigate("/projects")} />
              <NavItem label="Tasks"         path="/tasks"    icon={icons.leaves}  collapsed={collapsed} isActive={location.pathname === "/tasks"}    onClick={() => navigate("/tasks")} />
              <NavItem label="Leaves"        path="/leaves"   icon={icons.leaves}  collapsed={collapsed} isActive={location.pathname === "/leaves"}   onClick={() => navigate("/leaves")} />
            </>
          )}

          {/* USER */}
          {role === "user" && (
            <NavItem label="User Home" path="/user" icon={icons.dashboard} collapsed={collapsed} isActive={location.pathname === "/user"} onClick={() => navigate("/user")} />
          )}

          {/* TELECALLER ── main entry */}
          {role === "telecaller" && (
            <>
              {/* Main telecaller link */}
              <NavItem
                label="Telecaller"
                path="/telecaller"
                icon={icons.telecaller}
                collapsed={collapsed}
                isActive={isTelecallerSection}
                onClick={() => navigate("/telecaller")}
              />

              {/* Sub-section hint when on telecaller page & sidebar expanded */}
              {isTelecallerSection && !collapsed && (
                <li className="mt-1 mb-1">
                  <div className="ml-3 pl-3 border-l border-white/10 space-y-0.5">
                    {[
                      { label: "Dashboard",     emoji: "🏠" },
                      { label: "Break History", emoji: "☕" },
                      { label: "Call Logs",     emoji: "📞" },
                      { label: "Missed Calls",  emoji: "❌" },
                    ].map(s => (
                      <div
                        key={s.label}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-white/40 text-xs"
                      >
                        <span className="text-[11px]">{s.emoji}</span>
                        <span>{s.label}</span>
                      </div>
                    ))}
                  </div>
                </li>
              )}
            </>
          )}
        </ul>

        <div className="my-3 border-t border-white/7" />

        {/* Logout */}
        <li
          onClick={logout}
          title={collapsed ? "Logout" : ""}
          className={`flex items-center gap-2.5 py-2 rounded-lg cursor-pointer border border-red-500/20 hover:bg-red-500/8 transition-all list-none ${
            collapsed ? "justify-center px-2" : "px-2.5"
          }`}
        >
          <div className="w-8 h-8 min-w-[32px] rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
            {icons.logout}
          </div>
          {!collapsed && <span className="text-sm text-red-400">Logout</span>}
        </li>
      </nav>

      {/* Footer */}
      <div className={`p-3 border-t border-white/8 flex items-center ${collapsed ? "justify-center" : "gap-2.5"}`}>
        <div className="w-9 h-9 min-w-[36px] rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium">
          {initials}
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm text-white/80 font-medium truncate">{name}</p>
            <p className="text-xs text-white/35 truncate">{email}</p>
          </div>
        )}
      </div>
    </div>
  );
}