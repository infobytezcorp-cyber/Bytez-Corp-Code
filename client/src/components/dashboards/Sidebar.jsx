/**
 * UNIFIED SIDEBAR — use this ONE file everywhere.
 *
 * Place at:  src/components/Sidebar.jsx
 *
 * Then in EVERY page that uses a sidebar, change the import to:
 *   import Sidebar from "../components/Sidebar";   // adjust depth as needed
 *
 * Delete the old duplicate:
 *   src/components/dashboards/visitors/Sidebar.jsx  ← DELETE THIS
 */

import { useNavigate, useLocation } from "react-router-dom";
import { logout } from "../../utils/auth";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Phone,
  BarChart2,
  ClipboardList,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Headphones,
  Briefcase,
  ListTodo,
  FileText,
  TrendingUp,
  MessageCircle,
  CheckSquare,
} from "lucide-react";

// ─── Nav items ────────────────────────────────────────────────────────────────

const adminItems = [
  { label: "Dashboard",       path: "/admin",          Icon: LayoutDashboard },
  { label: "Visitor",         path: "/visitorpage",    Icon: Users           },
  { label: "Calls",           path: "/enquiry-calls",  Icon: Phone           },
  { label: "Analytics",       path: "/analytics",      Icon: BarChart2       },
  { label: "HR & Staff",      path: "/staff",          Icon: Briefcase       },
  { label: "Task Management", path: "/tasks",          Icon: ListTodo        },
  { label: "Enquiry",         path: "/enquiry",        Icon: ClipboardList   },
  { label: "Reports",         path: "/reports",        Icon: FileText        },
  { label: "Trends",          path: "/trends",         Icon: TrendingUp      },
  { label: "WhatsApp Leads",  path: "/whatsapp-leads", Icon: MessageCircle   },
  { label: "Settings",        path: "/settings",       Icon: Settings        },
];

const managerItems = [
  { label: "Manager Panel", path: "/manager",  Icon: LayoutDashboard },
  { label: "Projects",      path: "/projects", Icon: Briefcase       },
  { label: "Tasks",         path: "/tasks",    Icon: CheckSquare     },
  { label: "Leaves",        path: "/leaves",   Icon: FileText        },
];

// ─── NavItem ──────────────────────────────────────────────────────────────────

function NavItem({ label, path, Icon, badge, isActive, onClick, collapsed }) {
  return (
    <li
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={[
        "relative flex items-center rounded-xl cursor-pointer select-none",
        "transition-all duration-150 mb-[2px]",
        collapsed ? "justify-center px-2 py-[9px]" : "px-3 py-[9px] gap-3",
        isActive
          ? "bg-green-50"
          : "hover:bg-slate-100",
      ].join(" ")}
    >
      {/* Slide indicator */}
      {isActive && (
        <span className="absolute left-0 top-[20%] bottom-[20%] w-[3px] rounded-r-full bg-green-600" />
      )}

      {/* Icon bubble */}
      <span
        className={[
          "flex h-[34px] w-[34px] min-w-[34px] items-center justify-center rounded-lg shrink-0",
          isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-400",
        ].join(" ")}
      >
        <Icon className="h-[17px] w-[17px]" strokeWidth={1.8} />
      </span>

      {/* Label + badge */}
      {!collapsed && (
        <>
          <span
            className={[
              "flex-1 text-[13px] tracking-wide truncate",
              isActive ? "font-semibold text-green-800" : "font-normal text-slate-600",
            ].join(" ")}
          >
            {label}
          </span>
          {badge != null && badge > 0 && (
            <span className="ml-auto rounded-full bg-red-50 px-[7px] py-[2px] text-[10px] font-semibold text-red-600 ring-1 ring-red-100">
              {badge}
            </span>
          )}
        </>
      )}
    </li>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const role     = localStorage.getItem("role");
  const name     = localStorage.getItem("name")  || "Admin";
  const email    = localStorage.getItem("email") || "";
  const initials = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  // normalise path for comparison (ignore case, dashes, underscores)
  const norm = (p) => p.toLowerCase().replace(/[-_]/g, "");
  const isAt = (path) => norm(location.pathname) === norm(path);
  const goTo = (path) => { if (!isAt(path)) navigate(path); };

  const navItems =
    role === "admin"      ? adminItems :
    role === "manager"    ? managerItems :
    role === "user"       ? [{ label: "User Home",  path: "/user",       Icon: LayoutDashboard }] :
    role === "telecaller" ? [{ label: "Telecaller", path: "/telecaller", Icon: Phone           }] :
    [];

  return (
    <aside
      className={[
        "relative flex flex-col shrink-0 h-screen",
        "bg-white border-r border-slate-200/80",
        "transition-all duration-300 ease-in-out overflow-hidden",
        collapsed ? "w-[68px]" : "w-[236px]",
      ].join(" ")}
    >
      {/* ── Header ── */}
      <div
        className={[
          "flex items-center border-b border-slate-100 px-3 py-[14px]",
          collapsed ? "justify-center" : "justify-between",
        ].join(" ")}
      >
        {!collapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-[34px] w-[34px] min-w-[34px] items-center justify-center rounded-xl bg-green-50 ring-1 ring-green-100">
              <Headphones className="h-[17px] w-[17px] text-green-700" strokeWidth={1.8} />
            </div>
            <div className="overflow-hidden">
              <p className="text-[13px] font-semibold text-slate-800 truncate leading-snug">Dashboard</p>
              <p className="text-[10px] text-slate-400 truncate tracking-wide">ERP Management</p>
            </div>
          </div>
        )}

        <button
          onClick={() => setCollapsed(p => !p)}
          title={collapsed ? "Expand" : "Collapse"}
          className="flex h-[28px] w-[28px] min-w-[28px] items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          {collapsed
            ? <PanelLeftOpen  className="h-[15px] w-[15px]" strokeWidth={1.8} />
            : <PanelLeftClose className="h-[15px] w-[15px]" strokeWidth={1.8} />
          }
        </button>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">

        {!collapsed && (
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 select-none">
            Main menu
          </p>
        )}

        <ul>
          {navItems.map(item => (
            <NavItem
              key={item.path}
              {...item}
              collapsed={collapsed}
              isActive={isAt(item.path)}
              onClick={() => goTo(item.path)}
            />
          ))}
        </ul>

        {/* Divider */}
        <div className="my-3 border-t border-slate-100" />

        {/* Logout */}
        <ul>
          <li
            onClick={logout}
            title={collapsed ? "Logout" : undefined}
            className={[
              "flex items-center rounded-xl cursor-pointer select-none",
              "text-red-500 hover:bg-red-50 transition-colors duration-150",
              collapsed ? "justify-center px-2 py-[9px]" : "gap-3 px-3 py-[9px]",
            ].join(" ")}
          >
            <span className="flex h-[34px] w-[34px] min-w-[34px] items-center justify-center rounded-lg bg-red-50">
              <LogOut className="h-[17px] w-[17px] text-red-500" strokeWidth={1.8} />
            </span>
            {!collapsed && (
              <span className="text-[13px] font-normal text-red-500">Logout</span>
            )}
          </li>
        </ul>
      </nav>

      {/* ── Footer ── */}
      <div
        className={[
          "border-t border-slate-100 bg-slate-50/70 flex items-center",
          collapsed ? "justify-center px-2 py-3" : "gap-2.5 px-3 py-3",
        ].join(" ")}
      >
        <div className="flex h-[34px] w-[34px] min-w-[34px] items-center justify-center rounded-full bg-violet-100 text-[12px] font-semibold text-violet-700 ring-1 ring-violet-200 shrink-0">
          {initials}
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-slate-700 leading-snug">{name}</p>
            <p className="truncate text-[10px] text-slate-400">{email}</p>
          </div>
        )}
      </div>
    </aside>
  );
}