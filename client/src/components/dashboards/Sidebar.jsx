// // import { useNavigate, useLocation } from "react-router-dom";
// // import { logout } from "../../utils/auth";
// // import { useState } from "react";
// // import {
// //   analytics, collapseClose, collapseexpand, dashboard,
// //   enquiry, leaves, logoutBtn, settings, Transaction, trend, visitor
// // } from "../../utils/icons";

// // // ─── Telecaller Icon (Phone) ──────────────────────────────────
// // const TelecallerIcon = (
// //   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
// //     strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
// //     <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12 19.79 19.79 0 0 1 1.9 3.37 2 2 0 0 1 3.89 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 5.99 5.99l1.07-1.07a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
// //   </svg>
// // );
// // const icons = {
// //   // dashboard: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
// //   // clients:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>,
// //   // projects:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
// //   // tasks:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
// //   // leaves:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
// //   // enquiry:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
// //   // taskManagement: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
// //   // manager:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
// //   // logout:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
// //   // collapse:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>,
// //   // expand:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>,
// //     dashboard,
// //     clients: Transaction,
// //     projects: Transaction,
// //     tasks: Transaction,
// //     enquiry,
// //     taskManagement: Transaction,
// //     manager: trend,
// //     logout: logoutBtn,
// //     collapse: collapseClose,
// //     expand: collapseexpand,
// //     visitor,
// //     analytics,
// //     settings,
// //     leaves,
// //     trend,
// //     telecaller: TelecallerIcon,
// // };

// // const adminItems = [
// //   { label: "Dashboard",   path: "/admin",        icon: icons.dashboard  },
// //   { label: "Visitor",     path: "/visitorpage",  icon: icons.visitor    },
// //   { label: "Calls",       path: "/EnquiryCalls", icon: icons.leaves     },
// //   { label: "Analytics",   path: "/analytics",    icon: icons.analytics  },
// //   { label: "HR & Staff",  path: "/staff",        icon: icons.clients    },
// //   { label: "Task Management", path: "/tasks",    icon: icons.taskManagement},
// //   { label: "Enquiry",     path: "/enquiry",      icon: icons.enquiry    },
// //   { label: "Reports",     path: "/reports",      icon: icons.analytics  },
// //   { label: "Trends",      path: "/trends",       icon: icons.trend      },
// //   { label: "WhatsApp Leads", path: "/whatsapp-leads", icon: icons.telecaller },
// //   { label: "Settings",    path: "/settings",     icon: icons.settings   },
// // ];

// // const recruiterItems = [
// //   { label: "Lead", path: "/recruiter" },
// //   { label: "Recruiters", path: "/recruiters" },
// //   { label: "Candidates", path: "/recruiters/candidates" },
// //   { label: "HR", path: "/recruiters/hr" },
// // ];

// // function NavItem({ label, path, icon, isActive, onClick, collapsed }) {
// //   return (
// //     <li
// //       onClick={onClick}
// //       title={collapsed ? label : ""}
// //       className={`flex items-center gap-2.5 py-2 rounded-lg cursor-pointer mb-0.5 border transition-all ${
// //         collapsed ? "justify-center px-2" : "px-2.5"
// //       } ${
// //         isActive
// //           ? "bg-blue-900/30 border-blue-600/30"
// //           : "border-transparent hover:bg-white/5"
// //       }`}
// //     >
// //       <div className={`w-8 h-8 min-w-[32px] rounded-lg flex items-center justify-center ${
// //         isActive ? "bg-blue-700/40 text-blue-300" : "bg-white/5 text-white/40"
// //       }`}>
// //         {icon}
// //       </div>
// //       {!collapsed && (
// //         <>
// //           <span className={`text-sm flex-1 ${isActive ? "text-blue-200 font-medium" : "text-white/55"}`}>
// //             {label}
// //           </span>
// //           {isActive && <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />}
// //         </>
// //       )}
// //     </li>
// //   );
// // }

// // export default function Sidebar() {
// //   const navigate = useNavigate();
// //   const location = useLocation();
// //   const [collapsed, setCollapsed] = useState(false);
// //   const [recruiterOpen, setRecruiterOpen] = useState(location.pathname.startsWith("/recruiter"));

// //   const role  = localStorage.getItem("role");
// //   const name  = localStorage.getItem("name")  || "Admin";
// //   const email = localStorage.getItem("email") || "";
// //   const initials = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

// //   return (
// //     <div
// //       className="h-screen flex flex-col transition-all duration-300"
// //       style={{ background: "#0f172a", width: collapsed ? "72px" : "256px", minWidth: collapsed ? "72px" : "256px" }}
// //     >
// //       {/* Header */}
// //       <div className={`p-4 border-b border-white/8 flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
// //         {!collapsed && (
// //           <div className="flex items-center gap-2.5">
// //             <div className="w-9 h-9 min-w-[36px] bg-blue-600 rounded-xl flex items-center justify-center">
// //               {icons.dashboard}
// //             </div>
// //             <div>
// //               <h2 className="text-sm font-medium text-white">Dashboard</h2>
// //               <p className="text-xs text-white/35">ERP Management</p>
// //             </div>
// //           </div>
// //         )}

// //         {/* Collapse toggle button */}
// //         <button
// //           onClick={() => setCollapsed(!collapsed)}
// //           title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
// //           className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white/80 transition-all border border-white/8"
// //         >
// //           {collapsed ? icons.expand : icons.collapse}
// //         </button>
// //       </div>

// //       {/* Nav */}
// //       <nav className="flex-1 overflow-y-auto py-">
// //         {!collapsed && (
// //           <p className="text-[10px] font-medium text-white/30 uppercase tracking-widest px-4 mb-2 mt-1">
// //             Main menu
// //           </p>
// //         )}
// //         <ul className="space-y-0.5">

// //           {/* ADMIN */}
// //           {role === "admin" && adminItems.map((item) => (
// //             <NavItem
// //               key={item.path}
// //               {...item}
// //               collapsed={collapsed}
// //               isActive={location.pathname === item.path}
// //               onClick={() => navigate(item.path)}
// //             />
// //           ))}

// //           {role === "admin" && (
// //             <>
// //               <NavItem
// //                 label="Recruiter"
// //                 path="/recruiter"
// //                 icon={icons.telecaller}
// //                 collapsed={collapsed}
// //                 isActive={location.pathname.startsWith("/recruiter")}
// //                 onClick={() => {
// //                   if (collapsed) {
// //                     navigate("/recruiter");
// //                     return;
// //                   }
// //                   setRecruiterOpen((value) => !value);
// //                 }}
// //               />

// //               {!collapsed && recruiterOpen && (
// //                 <div className="mb-1 ml-10 space-y-1 border-l border-white/10 pl-3">
// //                   {recruiterItems.map((item) => (
// //                     <button
// //                       key={item.path}
// //                       type="button"
// //                       onClick={() => navigate(item.path)}
// //                       className={`block w-full rounded-md px-3 py-1.5 text-left text-xs transition-all ${
// //                         location.pathname === item.path
// //                           ? "bg-blue-700/30 text-blue-200"
// //                           : "text-white/45 hover:bg-white/5 hover:text-white/75"
// //                       }`}
// //                     >
// //                       {item.label}
// //                     </button>
// //                   ))}
// //                 </div>
// //               )}
// //             </>
// //           )}

// //           {/* MANAGER */}
// //           {role === "manager" && (
// //             <>
// //               <NavItem label="Manager Panel" path="/manager"  icon={icons.manager}  collapsed={collapsed} isActive={location.pathname === "/manager"}  onClick={() => navigate("/manager")} />
// //               <NavItem label="Projects"      path="/projects" icon={icons.projects} collapsed={collapsed} isActive={location.pathname === "/projects"} onClick={() => navigate("/projects")} />
// //               <NavItem label="Tasks"         path="/tasks"    icon={icons.tasks}    collapsed={collapsed} isActive={location.pathname === "/tasks"}    onClick={() => navigate("/tasks")} />
// //               <NavItem label="Leaves"        path="/leaves"   icon={icons.leaves}   collapsed={collapsed} isActive={location.pathname === "/leaves"}   onClick={() => navigate("/leaves")} />
// //             </>
// //           )}

// //           {/* USER */}
// //           {role === "user" && (
// //             <NavItem label="User Home" path="/user" icon={icons.clients} collapsed={collapsed} isActive={location.pathname === "/user"} onClick={() => navigate("/user")} />
// //           )}
// //         </ul>

// //         {/* Divider */}
// //         <div className="my-3 border-t border-white/7" />

// //         {/* Logout */}
// //         <li
// //           onClick={logout}
// //           title={collapsed ? "Logout" : ""}
// //           className={`flex items-center gap-2.5 py-2 rounded-lg cursor-pointer border border-red-500/20 hover:bg-red-500/8 transition-all list-none ${
// //             collapsed ? "justify-center px-2" : "px-2.5"
// //           }`}
// //         >
// //           <div className="w-8 h-8 min-w-[32px] rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
// //             {icons.logout}
// //           </div>
// //           {!collapsed && <span className="text-sm text-red-400">Logout</span>}
// //         </li>
// //       </nav>

// //       {/* Footer */}
// //       <div className={`p-3 border-t border-white/8 flex items-center ${collapsed ? "justify-center" : "gap-2.5"}`}>
// //         <div className="w-9 h-9 min-w-[36px] rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium">
// //           {initials}
// //         </div>
// //         {!collapsed && (
// //           <div className="min-w-0">
// //             <p className="text-sm text-white/80 font-medium truncate">{name}</p>
// //             <p className="text-xs text-white/35 truncate">{email}</p>
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }

// // src/components/Sidebar/Sidebar.jsx  (or wherever your sidebar lives)
// // Changes: Task Management now has a dropdown with sub-items like Recruiter does
 
// import { useNavigate, useLocation } from "react-router-dom";
// import { logout } from "../../utils/auth";
// import { useState } from "react";
// import {
//   analytics, collapseClose, collapseexpand, dashboard,
//   enquiry, leaves, logoutBtn, settings, Transaction, trend, visitor
// } from "../../utils/icons";
 
// // ─── Telecaller Icon ──────────────────────────────────────────
// const TelecallerIcon = (
//   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
//     strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
//     <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12 19.79 19.79 0 0 1 1.9 3.37 2 2 0 0 1 3.89 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 5.99 5.99l1.07-1.07a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
//   </svg>
// );
 
// // ─── Task Management Icon ─────────────────────────────────────
// const TaskIcon = (
//   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
//     strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
//     <path d="M9 11l3 3L22 4" />
//     <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
//   </svg>
// );
 
// // ─── Staff Portal Icon ────────────────────────────────────────
// const StaffPortalIcon = (
//   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
//     strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
//     <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
//     <circle cx="12" cy="7" r="4" />
//   </svg>
// );
 
// // ─── Assign Task Icon ─────────────────────────────────────────
// const AssignIcon = (
//   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
//     strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
//     <path d="M12 5v14M5 12l7-7 7 7" />
//   </svg>
// );
 
// // ─── All Tasks Icon ───────────────────────────────────────────
// const AllTasksIcon = (
//   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
//     strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
//     <line x1="8" y1="6" x2="21" y2="6" />
//     <line x1="8" y1="12" x2="21" y2="12" />
//     <line x1="8" y1="18" x2="21" y2="18" />
//     <line x1="3" y1="6" x2="3.01" y2="6" />
//     <line x1="3" y1="12" x2="3.01" y2="12" />
//     <line x1="3" y1="18" x2="3.01" y2="18" />
//   </svg>
// );
 
// const icons = {
//   dashboard,
//   clients:        Transaction,
//   projects:       Transaction,
//   tasks:          Transaction,
//   enquiry,
//   taskManagement: TaskIcon,       // ← replaced with proper task icon
//   manager:        trend,
//   logout:         logoutBtn,
//   collapse:       collapseClose,
//   expand:         collapseexpand,
//   visitor,
//   analytics,
//   settings,
//   leaves,
//   trend,
//   telecaller:     TelecallerIcon,
// };
 
// // ── Admin nav items — Task Management REMOVED (now a dropdown) ──
// const adminItems = [
//   { label: "Dashboard",      path: "/admin",           icon: icons.dashboard       },
//   { label: "Visitor",        path: "/visitorpage",     icon: icons.visitor         },
//   { label: "Calls",          path: "/EnquiryCalls",    icon: icons.leaves          },
//   { label: "Analytics",      path: "/analytics",       icon: icons.analytics       },
//   { label: "HR & Staff",     path: "/staff",           icon: icons.clients         },
//   // "Task Management" is now a dropdown — rendered separately below
//   { label: "Enquiry",        path: "/enquiry",         icon: icons.enquiry         },
//   { label: "Reports",        path: "/reports",         icon: icons.analytics       },
//   { label: "Trends",         path: "/trends",          icon: icons.trend           },
//   { label: "WhatsApp Leads", path: "/whatsapp-leads",  icon: icons.telecaller      },
//   { label: "Settings",       path: "/settings",        icon: icons.settings        },
// ];
 
// // ── Task Management sub-items ──────────────────────────────────
// const taskItems = [
//   { label: "Assign Task",   path: "/tasks",        icon: AssignIcon      },
//   { label: "All Tasks",     path: "/tasks/all",    icon: AllTasksIcon    },
//   { label: "Staff Portal",  path: "/staff-portal", icon: StaffPortalIcon },
// ];
 
// // ── Recruiter sub-items ────────────────────────────────────────
// const recruiterItems = [
//   { label: "Lead",       path: "/recruiter"              },
//   { label: "Recruiters", path: "/recruiters"             },
//   { label: "Candidates", path: "/recruiters/candidates"  },
//   { label: "HR",         path: "/recruiters/hr"          },
// ];
 
// // ─────────────────────────────────────────────────────────────
// function NavItem({ label, path, icon, isActive, onClick, collapsed, hasDropdown, isOpen }) {
//   return (
//     <li
//       onClick={onClick}
//       title={collapsed ? label : ""}
//       className={`flex items-center gap-2.5 py-2 rounded-lg cursor-pointer mb-0.5 border transition-all ${
//         collapsed ? "justify-center px-2" : "px-2.5"
//       } ${
//         isActive
//           ? "bg-blue-900/30 border-blue-600/30"
//           : "border-transparent hover:bg-white/5"
//       }`}
//     >
//       <div className={`w-8 h-8 min-w-[32px] rounded-lg flex items-center justify-center ${
//         isActive ? "bg-blue-700/40 text-blue-300" : "bg-white/5 text-white/40"
//       }`}>
//         {icon}
//       </div>
//       {!collapsed && (
//         <>
//           <span className={`text-sm flex-1 ${isActive ? "text-blue-200 font-medium" : "text-white/55"}`}>
//             {label}
//           </span>
//           {hasDropdown ? (
//             // Chevron for dropdown items
//             <svg
//               viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
//               className={`transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
//               style={{ width: 12, height: 12, color: "rgba(255,255,255,0.3)" }}
//             >
//               <path d="M9 18l6-6-6-6" />
//             </svg>
//           ) : isActive ? (
//             <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
//           ) : null}
//         </>
//       )}
//     </li>
//   );
// }
 
// // ─── Dropdown sub-item button ─────────────────────────────────
// function SubItem({ label, path, icon, isActive, onClick }) {
//   return (
//     <button
//       type="button"
//       onClick={onClick}
//       className={`flex items-center gap-2 w-full rounded-md px-3 py-1.5 text-left text-xs transition-all ${
//         isActive
//           ? "bg-blue-700/30 text-blue-200"
//           : "text-white/45 hover:bg-white/5 hover:text-white/75"
//       }`}
//     >
//       <span className={`flex-shrink-0 ${isActive ? "text-blue-300" : "text-white/30"}`}>
//         {icon}
//       </span>
//       {label}
//       {isActive && (
//         <div className="ml-auto w-1.5 h-1.5 bg-blue-400 rounded-full" />
//       )}
//     </button>
//   );
// }
 
// // ─────────────────────────────────────────────────────────────
// export default function Sidebar() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [collapsed, setCollapsed] = useState(false);
 
//   // Dropdown states
//   const [recruiterOpen, setRecruiterOpen] = useState(
//     location.pathname.startsWith("/recruiter")
//   );
//   const [taskMgmtOpen, setTaskMgmtOpen] = useState(
//     location.pathname.startsWith("/tasks") ||
//     location.pathname === "/staff-portal"
//   );
 
//   const role    = localStorage.getItem("role");
//   const name    = localStorage.getItem("name")  || "Admin";
//   const email   = localStorage.getItem("email") || "";
//   const initials = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
 
//   // Is any task sub-path active?
//   const isTaskActive =
//     location.pathname.startsWith("/tasks") ||
//     location.pathname === "/staff-portal";
 
//   return (
//     <div
//       className="h-screen flex flex-col transition-all duration-300"
//       style={{
//         background: "#0f172a",
//         width:    collapsed ? "72px" : "256px",
//         minWidth: collapsed ? "72px" : "256px",
//       }}
//     >
//       {/* ── Header ── */}
//       <div className={`p-4 border-b border-white/8 flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
//         {!collapsed && (
//           <div className="flex items-center gap-2.5">
//             <div className="w-9 h-9 min-w-[36px] bg-blue-600 rounded-xl flex items-center justify-center">
//               {icons.dashboard}
//             </div>
//             <div>
//               <h2 className="text-sm font-medium text-white">Dashboard</h2>
//               <p className="text-xs text-white/35">ERP Management</p>
//             </div>
//           </div>
//         )}
//         <button
//           onClick={() => setCollapsed(!collapsed)}
//           title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
//           className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white/80 transition-all border border-white/8"
//         >
//           {collapsed ? icons.expand : icons.collapse}
//         </button>
//       </div>
 
//       {/* ── Nav ── */}
//       <nav className="flex-1 overflow-y-auto py-2 px-2">
//         {!collapsed && (
//           <p className="text-[10px] font-medium text-white/30 uppercase tracking-widest px-1 mb-2 mt-1">
//             Main menu
//           </p>
//         )}
 
//         <ul className="space-y-0.5">
//           {/* ── ADMIN items ── */}
//           {role === "admin" && adminItems.map((item) => (
//             <NavItem
//               key={item.path}
//               {...item}
//               collapsed={collapsed}
//               isActive={location.pathname === item.path}
//               onClick={() => navigate(item.path)}
//             />
//           ))}
 
          // {/* ══ TASK MANAGEMENT DROPDOWN (admin) ══ */}
          // {role === "admin" && (
          //   <>
          //     <NavItem
          //       label="Task Management"
          //       path="/tasks"
          //       icon={icons.taskManagement}
          //       collapsed={collapsed}
          //       isActive={isTaskActive}
          //       hasDropdown={!collapsed}
          //       isOpen={taskMgmtOpen}
          //       onClick={() => {
          //         if (collapsed) {
          //           navigate("/tasks");
          //           return;
          //         }
          //         setTaskMgmtOpen((v) => !v);
          //       }}
          //     />
 
//               {/* Sub-items — only when not collapsed */}
//               {!collapsed && taskMgmtOpen && (
//                 <div className="mb-1 ml-10 space-y-0.5 border-l border-white/10 pl-3">
//                   {taskItems.map((item) => (
//                     <SubItem
//                       key={item.path}
//                       {...item}
//                       isActive={location.pathname === item.path}
//                       onClick={() => navigate(item.path)}
//                     />
//                   ))}
//                 </div>
//               )}
//             </>
//           )}
 
//           {/* ══ RECRUITER DROPDOWN (admin) ══ */}
//           {role === "admin" && (
//             <>
//               <NavItem
//                 label="Recruiter"
//                 path="/recruiter"
//                 icon={icons.telecaller}
//                 collapsed={collapsed}
//                 isActive={location.pathname.startsWith("/recruiter")}
//                 hasDropdown={!collapsed}
//                 isOpen={recruiterOpen}
//                 onClick={() => {
//                   if (collapsed) {
//                     navigate("/recruiter");
//                     return;
//                   }
//                   setRecruiterOpen((v) => !v);
//                 }}
//               />
 
//               {!collapsed && recruiterOpen && (
//                 <div className="mb-1 ml-10 space-y-0.5 border-l border-white/10 pl-3">
//                   {recruiterItems.map((item) => (
//                     <button
//                       key={item.path}
//                       type="button"
//                       onClick={() => navigate(item.path)}
//                       className={`block w-full rounded-md px-3 py-1.5 text-left text-xs transition-all ${
//                         location.pathname === item.path
//                           ? "bg-blue-700/30 text-blue-200"
//                           : "text-white/45 hover:bg-white/5 hover:text-white/75"
//                       }`}
//                     >
//                       {item.label}
//                     </button>
//                   ))}
//                 </div>
//               )}
//             </>
//           )}
 
//           {/* ── MANAGER items ── */}
//           {role === "manager" && (
//             <>
//               <NavItem label="Manager Panel" path="/manager"  icon={icons.manager}  collapsed={collapsed} isActive={location.pathname === "/manager"}  onClick={() => navigate("/manager")} />
//               <NavItem label="Projects"      path="/projects" icon={icons.projects} collapsed={collapsed} isActive={location.pathname === "/projects"} onClick={() => navigate("/projects")} />
//               <NavItem label="Tasks"         path="/tasks"    icon={icons.tasks}    collapsed={collapsed} isActive={location.pathname === "/tasks"}    onClick={() => navigate("/tasks")} />
//               <NavItem label="Leaves"        path="/leaves"   icon={icons.leaves}   collapsed={collapsed} isActive={location.pathname === "/leaves"}   onClick={() => navigate("/leaves")} />
//             </>
//           )}
 
//           {/* ── USER items ── */}
//           {role === "user" && (
//             <NavItem label="User Home" path="/user" icon={icons.clients} collapsed={collapsed} isActive={location.pathname === "/user"} onClick={() => navigate("/user")} />
//           )}
//         </ul>
 
//         {/* Divider */}
//         <div className="my-3 border-t border-white/7" />
 
//         {/* Logout */}
//         <li
//           onClick={logout}
//           title={collapsed ? "Logout" : ""}
//           className={`flex items-center gap-2.5 py-2 rounded-lg cursor-pointer border border-red-500/20 hover:bg-red-500/8 transition-all list-none ${
//             collapsed ? "justify-center px-2" : "px-2.5"
//           }`}
//         >
//           <div className="w-8 h-8 min-w-[32px] rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
//             {icons.logout}
//           </div>
//           {!collapsed && <span className="text-sm text-red-400">Logout</span>}
//         </li>
//       </nav>
 
//       {/* ── Footer (user info) ── */}
//       <div className={`p-3 border-t border-white/8 flex items-center ${collapsed ? "justify-center" : "gap-2.5"}`}>
//         <div className="w-9 h-9 min-w-[36px] rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium">
//           {initials}
//         </div>
//         {!collapsed && (
//           <div className="min-w-0">
//             <p className="text-sm text-white/80 font-medium truncate">{name}</p>
//             <p className="text-xs text-white/35 truncate">{email}</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// src/components/Sidebar/Sidebar.jsx

import { useNavigate, useLocation } from "react-router-dom";
import { logout } from "../../utils/auth";
import { useState } from "react";
import {
  analytics, collapseClose, collapseexpand, dashboard,
  enquiry, leaves, logoutBtn, settings, Transaction, trend, visitor
} from "../../utils/icons";

// ─── Telecaller Icon ──────────────────────────────────────────
const TelecallerIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
    strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12 19.79 19.79 0 0 1 1.9 3.37 2 2 0 0 1 3.89 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 5.99 5.99l1.07-1.07a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const TaskIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
    strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);

const StaffPortalIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
    strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const AssignIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
    strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const AllTasksIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
    strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const icons = {
  dashboard,
  clients:        Transaction,
  projects:       Transaction,
  tasks:          Transaction,
  enquiry,
  taskManagement: TaskIcon,
  manager:        trend,
  logout:         logoutBtn,
  collapse:       collapseClose,
  expand:         collapseexpand,
  visitor,
  analytics,
  settings,
  leaves,
  trend,
  telecaller:     TelecallerIcon,
};

// ── Admin nav items (Task Management removed — it's a dropdown now) ──
const adminItems = [
  { label: "Dashboard",      path: "/admin",          icon: icons.dashboard  },
  { label: "Visitor",        path: "/visitorpage",    icon: icons.visitor    },
  { label: "Calls",          path: "/EnquiryCalls",   icon: icons.leaves     },
  { label: "Analytics",      path: "/analytics",      icon: icons.analytics  },
  { label: "HR & Staff",     path: "/staff",          icon: icons.clients    },
  { label: "Enquiry",        path: "/enquiry",        icon: icons.enquiry    },
  { label: "Reports",        path: "/reports",        icon: icons.analytics  },
  { label: "Trends",         path: "/trends",         icon: icons.trend      },
  { label: "WhatsApp Leads", path: "/whatsapp-leads", icon: icons.telecaller },
  { label: "Settings",       path: "/settings",       icon: icons.settings   },
];

// ✅ Fixed paths — matches App.jsx routes exactly
const taskItems = [
  { label: "Task Board",       path: "/tasks",         icon: AssignIcon      },
  { label: "Assign & Monitor", path: "/admin/tasks",   icon: AssignIcon      },
];

const recruiterItems = [
  { label: "Lead",       path: "/recruiter"             },
  { label: "Recruiters", path: "/recruiters"            },
  { label: "Candidates", path: "/recruiters/candidates" },
  { label: "HR",         path: "/recruiters/hr"         },
];

// ─────────────────────────────────────────────────────────────
function NavItem({ label, path, icon, isActive, onClick, collapsed, hasDropdown, isOpen }) {
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
          {hasDropdown ? (
            <svg
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
              className={`transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
              style={{ width: 12, height: 12, color: "rgba(255,255,255,0.3)" }}
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          ) : isActive ? (
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
          ) : null}
        </>
      )}
    </li>
  );
}

function SubItem({ label, path, icon, isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 w-full rounded-md px-3 py-1.5 text-left text-xs transition-all ${
        isActive
          ? "bg-blue-700/30 text-blue-200"
          : "text-white/45 hover:bg-white/5 hover:text-white/75"
      }`}
    >
      <span className={`flex-shrink-0 ${isActive ? "text-blue-300" : "text-white/30"}`}>
        {icon}
      </span>
      {label}
      {isActive && <div className="ml-auto w-1.5 h-1.5 bg-blue-400 rounded-full" />}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
export default function Sidebar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const [recruiterOpen, setRecruiterOpen] = useState(
    location.pathname.startsWith("/recruiter")
  );

  // ✅ Auto-open Task Management dropdown if on a task route
  const [taskMgmtOpen, setTaskMgmtOpen] = useState(
    location.pathname.startsWith("/admin/tasks") ||
    location.pathname.startsWith("/tasks") ||
    location.pathname === "/staff-portal"
  );

  const role     = localStorage.getItem("role");
  const name     = localStorage.getItem("name")  || "Admin";
  const email    = localStorage.getItem("email") || "";
  const initials = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  const isTaskActive =
    location.pathname.startsWith("/admin/tasks") ||
    location.pathname.startsWith("/tasks") ||
    location.pathname === "/staff-portal";

  return (
    <div
      className="h-screen flex flex-col transition-all duration-300"
      style={{
        background: "#0f172a",
        width:    collapsed ? "72px" : "256px",
        minWidth: collapsed ? "72px" : "256px",
      }}
    >
      {/* ── Header ── */}
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

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {!collapsed && (
          <p className="text-[10px] font-medium text-white/30 uppercase tracking-widest px-1 mb-2 mt-1">
            Main menu
          </p>
        )}

        <ul className="space-y-0.5">

          {/* ── Admin: regular items ── */}
          {role === "admin" && adminItems.map((item) => (
            <NavItem
              key={item.path}
              {...item}
              collapsed={collapsed}
              isActive={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            />
          ))}

          {/* ══ Task Management dropdown ══ */}
          {role === "admin" && (
            <>
              <NavItem
                label="Task Management"
                path="/tasks"
                icon={icons.taskManagement}
                collapsed={collapsed}
                isActive={isTaskActive}
                hasDropdown={!collapsed}
                isOpen={taskMgmtOpen}
                onClick={() => {
                  if (collapsed) {
                    navigate("/tasks");
                    return;
                  }
                  setTaskMgmtOpen((v) => !v);
                }}
              />

              {!collapsed && taskMgmtOpen && (
                <div className="mb-1 ml-10 space-y-0.5 border-l border-white/10 pl-3">
                  {taskItems.map((item) => (
                    <SubItem
                      key={item.path}
                      {...item}
                      isActive={location.pathname === item.path}
                      onClick={() => navigate(item.path)}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* ══ Recruiter dropdown ══ */}
          {role === "admin" && (
            <>
              <NavItem
                label="Recruiter"
                path="/recruiter"
                icon={icons.telecaller}
                collapsed={collapsed}
                isActive={location.pathname.startsWith("/recruiter")}
                hasDropdown={!collapsed}
                isOpen={recruiterOpen}
                onClick={() => {
                  if (collapsed) {
                    navigate("/recruiter");
                    return;
                  }
                  setRecruiterOpen((v) => !v);
                }}
              />

              {!collapsed && recruiterOpen && (
                <div className="mb-1 ml-10 space-y-0.5 border-l border-white/10 pl-3">
                  {recruiterItems.map((item) => (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => navigate(item.path)}
                      className={`block w-full rounded-md px-3 py-1.5 text-left text-xs transition-all ${
                        location.pathname === item.path
                          ? "bg-blue-700/30 text-blue-200"
                          : "text-white/45 hover:bg-white/5 hover:text-white/75"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── Manager items ── */}
          {role === "manager" && (
            <>
              <NavItem label="Manager Panel" path="/manager"  icon={icons.manager}  collapsed={collapsed} isActive={location.pathname === "/manager"}  onClick={() => navigate("/manager")} />
              <NavItem label="Projects"      path="/projects" icon={icons.projects} collapsed={collapsed} isActive={location.pathname === "/projects"} onClick={() => navigate("/projects")} />
              <NavItem label="Tasks"         path="/tasks"    icon={icons.tasks}    collapsed={collapsed} isActive={location.pathname === "/tasks"}    onClick={() => navigate("/tasks")} />
              <NavItem label="Leaves"        path="/leaves"   icon={icons.leaves}   collapsed={collapsed} isActive={location.pathname === "/leaves"}   onClick={() => navigate("/leaves")} />
            </>
          )}

          {/* ── User items ── */}
          {role === "user" && (
            <NavItem label="User Home" path="/user" icon={icons.clients} collapsed={collapsed} isActive={location.pathname === "/user"} onClick={() => navigate("/user")} />
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

      {/* ── Footer ── */}
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
 