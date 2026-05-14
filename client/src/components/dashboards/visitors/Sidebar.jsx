import { useNavigate, useLocation } from "react-router-dom";
import { logout } from "../../../utils/auth";
import { useState } from "react";
import {
  LayoutDashboard, Users, Phone, BarChart2, ClipboardList,
  Settings, LogOut, PanelLeftClose, PanelLeftOpen, Headphones,
} from "lucide-react";

const adminItems = [
  { label: "Dashboard", path: "/admin",         Icon: LayoutDashboard },
  { label: "Visitor",   path: "/visitorpage",   Icon: Users           },
  { label: "Calls",     path: "/enquiry-calls", Icon: Phone           },
  { label: "Analytics", path: "/analytics",     Icon: BarChart2       },
  { label: "Enquiry",   path: "/enquiry",       Icon: ClipboardList   },
  { label: "Settings",  path: "/settings",      Icon: Settings        },
];

const managerItems = [
  { label: "Manager",  path: "/manager",  Icon: LayoutDashboard },
  { label: "Projects", path: "/projects", Icon: ClipboardList   },
  { label: "Tasks",    path: "/tasks",    Icon: ClipboardList   },
  { label: "Leaves",   path: "/leaves",   Icon: ClipboardList   },
];

// ─── NavItem ──────────────────────────────────────────────────────────────────
function NavItem({ label, Icon, badge, isActive, onClick, collapsed }) {
  return (
    <li
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={[
        "relative flex items-center cursor-pointer select-none rounded-lg",
        "transition-colors duration-100 mb-[1px]",
        collapsed ? "justify-center p-[6px]" : "gap-2 px-[6px] py-[5px]",
        isActive
          ? "bg-[#EAF3DE]"
          : "hover:bg-slate-100",
      ].join(" ")}
    >
      {/* Slide indicator */}
      {isActive && (
        <span className="absolute left-0 top-[15%] bottom-[15%] w-[3px] rounded-r-full bg-[#3B6D11]" />
      )}

      {/* Icon */}
      <span className={[
        "flex h-[26px] w-[26px] min-w-[26px] items-center justify-center rounded-md shrink-0",
        isActive ? "bg-[#C0DD97]" : "",
      ].join(" ")}>
        <Icon
          className={`h-[14px] w-[14px] ${isActive ? "text-[#3B6D11]" : "text-slate-400"}`}
          strokeWidth={1.8}
        />
      </span>

      {/* Label */}
      {!collapsed && (
        <>
          <span className={`flex-1 text-[12px] leading-none truncate ${
            isActive ? "font-medium text-[#27500A]" : "font-normal text-slate-500"
          }`}>
            {label}
          </span>
          {badge != null && badge > 0 && (
            <span className="ml-auto rounded-full bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-600 leading-none">
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
  const navigate  = useNavigate();
  const location  = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const role     = localStorage.getItem("role");
  const name     = localStorage.getItem("name")  || "Admin";
  const email    = localStorage.getItem("email") || "";
  const initials = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  const norm = (p) => p.toLowerCase().replace(/[-_]/g, "");
  const goTo = (path) => { if (norm(location.pathname) !== norm(path)) navigate(path); };
  const isAt = (path) => norm(location.pathname) === norm(path);

  const navItems =
    role === "admin"      ? adminItems   :
    role === "manager"    ? managerItems :
    role === "user"       ? [{ label: "User Home",  path: "/user",       Icon: LayoutDashboard }] :
    role === "telecaller" ? [{ label: "Telecaller",  path: "/telecaller", Icon: Phone           }] :
    [];

  return (
    <aside className={[
      "relative flex flex-col shrink-0 h-screen",
      "bg-white border-r border-slate-200/80",
      "transition-all duration-250 ease-in-out overflow-hidden",
      collapsed ? "w-[52px]" : "w-[196px]",
    ].join(" ")}>

      {/* ── Header ── */}
      <div className={[
        "flex items-center border-b border-slate-100 px-[10px] py-[10px] gap-2 min-h-[48px]",
        collapsed ? "justify-center" : "justify-between",
      ].join(" ")}>
        {!collapsed && (
          <div className="flex items-center gap-2 overflow-hidden min-w-0">
            <div className="flex h-[26px] w-[26px] min-w-[26px] items-center justify-center rounded-md bg-[#EAF3DE] shrink-0">
              <Headphones className="h-[13px] w-[13px] text-[#3B6D11]" strokeWidth={1.8} />
            </div>
            <div className="overflow-hidden min-w-0">
              <p className="text-[12px] font-medium text-slate-800 truncate leading-tight">Dashboard</p>
              <p className="text-[10px] text-slate-400 truncate leading-tight">ERP Management</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(p => !p)}
          title={collapsed ? "Expand" : "Collapse"}
          className="flex h-[24px] w-[24px] min-w-[24px] items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors shrink-0"
        >
          {collapsed
            ? <PanelLeftOpen  className="h-[13px] w-[13px]" strokeWidth={1.8} />
            : <PanelLeftClose className="h-[13px] w-[13px]" strokeWidth={1.8} />
          }
        </button>
      </div>

      {/* ── Navigation — overflow:hidden prevents scrollbar ── */}
      <nav className="flex flex-col flex-1 overflow-hidden px-[6px] py-[8px]">

        {!collapsed && (
          <p className="px-[6px] pb-[6px] text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400 leading-none">
            Main menu
          </p>
        )}

        {/* Nav items */}
        <ul className="flex-1 list-none">
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
        <div className="my-[6px] border-t border-slate-100" />

        {/* Logout */}
        <div
          onClick={logout}
          title={collapsed ? "Logout" : undefined}
          role="button"
          tabIndex={0}
          className={[
            "flex items-center cursor-pointer select-none rounded-lg",
            "text-red-500 hover:bg-red-50 transition-colors duration-100",
            collapsed ? "justify-center p-[6px]" : "gap-2 px-[6px] py-[5px]",
          ].join(" ")}
        >
          <span className="flex h-[26px] w-[26px] min-w-[26px] items-center justify-center rounded-md shrink-0">
            <LogOut className="h-[14px] w-[14px] text-red-500" strokeWidth={1.8} />
          </span>
          {!collapsed && (
            <span className="text-[12px] font-normal leading-none">Logout</span>
          )}
        </div>
      </nav>

      {/* ── Footer ── */}
      <div className={[
        "border-t border-slate-100 bg-slate-50/60 flex items-center",
        collapsed ? "justify-center px-[6px] py-[8px]" : "gap-2 px-[10px] py-[8px]",
      ].join(" ")}>
        <div className="flex h-[26px] w-[26px] min-w-[26px] items-center justify-center rounded-full bg-violet-100 text-[10px] font-semibold text-violet-700 shrink-0">
          {initials}
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-medium text-slate-700 leading-tight">{name}</p>
            <p className="truncate text-[10px] text-slate-400 leading-tight">{email}</p>
          </div>
        )}
      </div>
    </aside>
  );
}