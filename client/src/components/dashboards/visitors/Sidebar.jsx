import { useNavigate, useLocation } from "react-router-dom";
import { logout } from "../../../utils/auth";
import { useState } from "react";
import {
  analytics,
  collapseClose,
  collapseexpand,
  dashboard,
  enquiry,
  leaves,
  logoutBtn,
  settings,
  trend,
  visitor,
} from "../../../utils/icons";

// ─── Telecaller Icon ──────────────────────────────────────────
const TelecallerIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-4 h-4"
  >
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
  { label: "Dashboard", path: "/admin", icon: icons.dashboard },
  { label: "Visitor", path: "/visitorpage", icon: icons.visitor },
  { label: "Calls", path: "/enquiry-calls", icon: icons.leaves },
  { label: "Analytics", path: "/analytics", icon: icons.analytics },
  { label: "Enquiry", path: "/enquiry", icon: icons.enquiry },
  { label: "Settings", path: "/settings", icon: icons.settings },
];

// ─── NavItem ──────────────────────────────────────────────────
function NavItem({
  label,
  path,
  icon,
  isActive,
  onClick,
  collapsed,
}) {
  return (
    <li
      onClick={onClick}
      title={collapsed ? label : ""}
      className={`
        group relative flex items-center rounded-xl cursor-pointer
        transition-all duration-200 overflow-hidden mb-1
        ${collapsed ? "justify-center px-2 py-2" : "px-3 py-2.5 gap-3"}
        ${
          isActive
            ? "bg-gradient-to-r from-indigo-500/20 to-violet-500/10 border border-indigo-500/20"
            : "border border-transparent hover:bg-white/5"
        }
      `}
    >
      {/* Active Indicator */}
      {isActive && (
        <div className="absolute left-0 top-[18%] bottom-[18%] w-[3px] rounded-r bg-gradient-to-b from-indigo-400 to-violet-400" />
      )}

      {/* Icon */}
      <div
        className={`
          w-8 h-8 min-w-8 rounded-lg flex items-center justify-center
          transition-all duration-200 shrink-0
          ${
            isActive
              ? "bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/30"
              : "bg-white/5 text-white/40 group-hover:text-white/70"
          }
        `}
      >
        {icon}
      </div>

      {!collapsed && (
        <>
          <span
            className={`
              text-[13px] flex-1 tracking-wide
              ${isActive ? "text-indigo-100 font-semibold" : "text-white/45"}
            `}
          >
            {label}
          </span>

          {isActive && (
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_#818cf8]" />
          )}
        </>
      )}
    </li>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────
export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);

  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name") || "Admin";
  const email = localStorage.getItem("email") || "";

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const isTelecallerSection =
    location.pathname === "/telecaller";

  const normalizePath = (path) => path.toLowerCase().replace(/[-_]/g, "");
  const goTo = (path) => {
    if (normalizePath(location.pathname) === normalizePath(path)) return;
    navigate(path);
  };

  return (
    <aside
      className={`
        relative flex flex-col shrink-0 h-screen
        border-r border-white/5 overflow-hidden
        bg-gradient-to-b from-[#0d1117] via-[#111827] to-[#0d1117]
        transition-all duration-300 ease-in-out
        ${collapsed ? "w-[72px]" : "w-[240px]"}
      `}
    >
      {/* Background Glow */}
      <div className="absolute -top-16 -left-16 w-44 h-44 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-10 w-36 h-36 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />

      {/* ── Header ── */}
      <div
        className={`
          relative z-10 flex items-center border-b border-white/5
          ${collapsed ? "justify-center px-2 py-4" : "justify-between px-4 py-4"}
        `}
      >
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              {icons.dashboard}
            </div>

            <div>
              <p className="text-sm font-bold text-slate-100">
                Dashboard
              </p>

              <p className="text-[10px] text-white/30 mt-0.5 tracking-wide">
                ERP Management
              </p>
            </div>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand" : "Collapse"}
          className="
            w-8 h-8 rounded-lg border border-white/10
            bg-white/[0.03] hover:bg-white/[0.08]
            text-white/40 hover:text-white/80
            flex items-center justify-center
            transition-all duration-200 shrink-0
          "
        >
          {collapsed ? icons.expand : icons.collapse}
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav className="relative z-10 flex-1 overflow-y-auto px-2 py-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {!collapsed && (
          <p className="px-2 pb-3 text-[10px] font-bold tracking-[0.15em] uppercase text-white/20">
            Main Menu
          </p>
        )}

        <ul className="space-y-1">
          {/* ADMIN */}
          {role === "admin" &&
            adminItems.map((item) => (
              <NavItem
                key={item.path}
                {...item}
                collapsed={collapsed}
                isActive={normalizePath(location.pathname) === normalizePath(item.path)}
                onClick={() => goTo(item.path)}
              />
            ))}

          {/* MANAGER */}
          {role === "manager" && (
            <NavItem
              label="Manager Panel"
              path="/manager"
              icon={icons.manager}
              collapsed={collapsed}
              isActive={location.pathname === "/manager"}
              onClick={() => goTo("/manager")}
            />
          )}

          {/* USER */}
          {role === "user" && (
            <NavItem
              label="User Home"
              path="/user"
              icon={icons.dashboard}
              collapsed={collapsed}
              isActive={location.pathname === "/user"}
              onClick={() => goTo("/user")}
            />
          )}

          {/* TELECALLER */}
          {role === "telecaller" && (
            <>
              <NavItem
                label="Telecaller"
                path="/telecaller"
                icon={icons.telecaller}
                collapsed={collapsed}
                isActive={isTelecallerSection}
                onClick={() => goTo("/telecaller")}
              />

              {isTelecallerSection && !collapsed && (
                <li className="mt-2 mb-1">
                  <div className="ml-4 pl-4 border-l border-indigo-500/20 space-y-1">
                    {[
                      { label: "Dashboard", emoji: "🏠" },
                      { label: "Break History", emoji: "☕" },
                      { label: "Call Logs", emoji: "📞" },
                      { label: "Missed Calls", emoji: "❌" },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className="
                          flex items-center gap-2
                          px-2 py-1.5 rounded-lg
                          text-xs text-white/35
                          hover:bg-white/[0.03]
                        "
                      >
                        <span className="text-[11px]">
                          {s.emoji}
                        </span>

                        <span>{s.label}</span>
                      </div>
                    ))}
                  </div>
                </li>
              )}
        </>
          )}
        </ul>

        {/* Divider */}
        <div className="my-3 border-t border-white/5" />

        {/* Logout */}
        <ul>
          <li
            onClick={logout}
            title={collapsed ? "Logout" : ""}
            className={`
              flex items-center rounded-xl cursor-pointer
              border border-red-500/15 bg-red-500/5
              hover:bg-red-500/10 hover:border-red-500/30
              transition-all duration-200
              ${collapsed ? "justify-center px-2 py-2" : "px-3 py-2.5 gap-3"}
            `}
          >
            <div className="w-8 h-8 min-w-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
              {icons.logout}
            </div>

            {!collapsed && (
              <span className="text-[13px] font-medium text-red-400">
                Logout
              </span>
            )}
          </li>
        </ul>
      </nav>

      {/* ── Footer ── */}
      <div
        className={`
          relative z-10 border-t border-white/5 bg-white/[0.02]
          flex items-center
          ${collapsed ? "justify-center px-2 py-3" : "gap-3 px-4 py-3"}
        `}
      >
        <div className="w-9 h-9 min-w-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-indigo-500/30">
          {initials}
        </div>

        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white/75 truncate">
              {name}
            </p>

            <p className="text-[10px] text-white/30 truncate mt-0.5">
              {email}
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
