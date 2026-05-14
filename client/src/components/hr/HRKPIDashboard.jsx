import React from "react";
import { useSelector } from "react-redux";

export default function HRKPIDashboard({ allEmployees }) {
  const { employees } = useSelector((state) => state.hr);

  const stats = {
    total: allEmployees.length,
    present: allEmployees.filter((e) => e.status === "Present").length,
    absent: allEmployees.filter((e) => e.status === "Absent").length,
    leave: allEmployees.filter((e) => e.status === "On Leave").length,
    wfh: allEmployees.filter((e) => e.status === "WFH").length,
  };

  // Derived values for departments, roles and new hires
  const uniqueDepts = Array.from(new Set(allEmployees.map(e => (e.dept || e.department || '').toString().trim()).filter(Boolean)));
  const uniqueRoles = Array.from(new Set(allEmployees.map(e => (e.role || '').toString().trim()).filter(Boolean)));
  const now = new Date();
  const newThisMonth = allEmployees.filter(e => {
    if (!e.doj) return false;
    const d = new Date(e.doj);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;

  const attendancePercent =
    allEmployees.length > 0
      ? Math.round((stats.present / allEmployees.length) * 100)
      : 0;

  const KPICard = ({ icon, label, value, sublabel, color }) => (
    <div className={`bg-white rounded-lg border-l-4 p-4 h-28 flex items-center`} style={{ borderColor: color }}>
      <div className="flex items-center justify-between w-full">
        <div className="flex-1">
          <p className="text-sm text-gray-500 font-semibold">{label}</p>
          <p className="text-2xl font-bold mt-1" style={{ color }}>
            {value}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>
        </div>
        <span className="text-2xl ml-4 flex-shrink-0">{icon}</span>
      </div>
    </div>
  );
//text-sm font-bold text-slate-700 mt-6 mb-2 uppercase tracking-wider
  return (
    <div className="mt-6 mb-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
        <KPICard
          label="Total Staff"
          value={stats.total}
          sublabel="All departments"
          color="#2d6be4"
        />

        <KPICard
          label="Departments"
          value={uniqueDepts.length}
          sublabel={uniqueDepts.length > 0 ? uniqueDepts.join(', ') : '—'}
          color="#06b6d4"
        />

        <KPICard
          label="Roles"
          value={uniqueRoles.length}
          sublabel={uniqueRoles.length > 0 ? uniqueRoles.slice(0,3).join(', ') : '—'}
          color="#d97706"
        />

        <KPICard
          label="New This Month"
          value={newThisMonth}
          sublabel={now.toLocaleString('default', { month: 'long', year: 'numeric' })}
          color="#7c3aed"
        />
      </div>
    </div>
  );
}
