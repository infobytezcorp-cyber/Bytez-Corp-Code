import { useNavigate, useLocation } from "react-router-dom";
import { logout } from "../../../utils/auth";
import { useState, useEffect } from "react";

const icons = {
  dashboard: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  analytics: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>,
  projects:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  tasks:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  leaves:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  enquiry:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  Telecaller : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  settings:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  manager:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
  logout:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  collapse:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>,
  expand:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>,
  chevronDown: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>,
};

const adminItems = [
  { label: "Dashboard", path: "/admin",     icon: icons.dashboard },
  { label: "Analytics",  path: "/analytics", icon: icons.analytics  },
  { label: "Settings",     path: "/settings",    icon: icons.settings },
  { label: "Leaves",    path: "/leaves",   icon: icons.leaves },
];

function NavItem({ label, path, icon, isActive, onClick, collapsed, isDropdown, isOpen, hasSubItems }) {
  return (
    <li
      onClick={onClick}
      title={collapsed ? label : ""}
      className={`flex items-center gap-2.5 py-2 rounded-lg cursor-pointer mb-0.5 border transition-all ${
        collapsed ? "justify-center px-2" : "px-2.5"
      } ${
        isActive && !isDropdown
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
          {hasSubItems && (
            <div className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
              {icons.chevronDown}
            </div>
          )}
          {isActive && !hasSubItems && <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />}
        </>
      )}
    </li>
  );
}

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);

  const role  = localStorage.getItem("role");
  const name  = localStorage.getItem("name")  || "Admin";
  const email = localStorage.getItem("email") || "";
  const initials = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  // Collapse aagum bodhu dropdown-ah close panna
  useEffect(() => {
    if (collapsed) setIsEnquiryOpen(false);
  }, [collapsed]);

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
          {role === "admin" && (
            <>
              {/* Other Admin Items */}
              {adminItems.map((item) => (
                <NavItem
                  key={item.path}
                  {...item}
                  collapsed={collapsed}
                  isActive={location.pathname === item.path}
                  onClick={() => navigate(item.path)}
                />
              ))}

              {/* Enquiry Dropdown Section */}
              <NavItem 
                label="Enquiry" 
                icon={icons.enquiry} 
                collapsed={collapsed} 
                isActive={location.pathname.includes("/enquiry") || location.pathname.includes("/callcenter")}
                onClick={() => !collapsed && setIsEnquiryOpen(!isEnquiryOpen)}
                hasSubItems={true}
                isOpen={isEnquiryOpen}
              />

              {/* Sub Items - Telecaller */}
              {!collapsed && isEnquiryOpen && (
                <div className="ml-4 pl-4 border-l border-white/10 mt-1 space-y-1">
                  <NavItem 
                    label="Enquiry List" 
                    path="/enquiry" 
                    icon={icons.enquiry} 
                    collapsed={collapsed} 
                    isActive={location.pathname === "/enquiry"} 
                    onClick={() => navigate("/enquiry")} 
                  />
                  <NavItem 
                    label="Leads&Calls" 
                    path="/callcenter" 
                    icon={icons.telecaller} 
                    collapsed={collapsed} 
                    isActive={location.pathname === "/callcenter"} 
                    onClick={() => navigate("/callcenter")} 
                  />
                </div>
              )}
            </>
          )}

          {/* MANAGER & USER Roles - (Same as before) */}
          {role === "manager" && (
            <>
              <NavItem label="Manager Panel" path="/manager" icon={icons.manager} collapsed={collapsed} isActive={location.pathname === "/manager"} onClick={() => navigate("/manager")} />
              <NavItem label="Projects" path="/projects" icon={icons.projects} collapsed={collapsed} isActive={location.pathname === "/projects"} onClick={() => navigate("/projects")} />
              <NavItem label="Tasks" path="/tasks" icon={icons.tasks} collapsed={collapsed} isActive={location.pathname === "/tasks"} onClick={() => navigate("/tasks")} />
              <NavItem label="Leaves" path="/leaves" icon={icons.leaves} collapsed={collapsed} isActive={location.pathname === "/leaves"} onClick={() => navigate("/leaves")} />
            </>
          )}
          {role === "user" && (
            <NavItem label="User Home" path="/user" icon={icons.clients} collapsed={collapsed} isActive={location.pathname === "/user"} onClick={() => navigate("/user")} />
          )}
        </ul>

        <div className="my-3 border-t border-white/7" />

        <li onClick={logout} className={`flex items-center gap-2.5 py-2 rounded-lg cursor-pointer border border-red-500/20 hover:bg-red-500/8 transition-all list-none ${collapsed ? "justify-center px-2" : "px-2.5"}`}>
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