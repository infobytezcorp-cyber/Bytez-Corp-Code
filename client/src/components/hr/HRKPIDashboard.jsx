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

  const attendancePercent =
    allEmployees.length > 0
      ? Math.round((stats.present / allEmployees.length) * 100)
      : 0;

  const KPICard = ({ icon, label, value, sublabel, color }) => (
    <div className={`bg-white rounded-lg border-l-4 p-4`} style={{ borderColor: color }}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500 font-semibold">{label}</p>
          <p className="text-3xl font-bold mt-2" style={{ color }}>
            {value}
          </p>
          <p className="text-xs text-gray-400 mt-1">{sublabel}</p>
        </div>
        <span className="text-3xl ml-2 flex-shrink-0">{icon}</span>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <KPICard
        
        label="Total Staff"
        value={stats.total}
        sublabel="All departments"
        color="#2d6be4"
      />
      <KPICard
        
        label="Present Today"
        value={stats.present}
        sublabel={`${attendancePercent}% attendance`}
        color="#16a34a"
      />
      <KPICard
        
        label="Absent"
        value={stats.absent}
        sublabel="Not checked in"
        color="#dc2626"
      />
      <KPICard
        
        label="On Leave"
        value={stats.leave}
        sublabel="Approved"
        color="#d97706"
      />
      <KPICard
        
        label="WFH / Field"
        value={stats.wfh}
        sublabel="Remote"
        color="#06b6d4"
      />
      <KPICard
        
        label="New This Month"
        value="4"
        sublabel="April 2026"
        color="#7c3aed"
      />
    </div>
  );
}
