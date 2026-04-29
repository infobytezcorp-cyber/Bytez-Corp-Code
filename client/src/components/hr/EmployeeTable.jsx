import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  openViewModal,
  setSelectedEmployee,
  HR_DEPT_CONFIG,
} from "../../features/hrSlice";

export default function EmployeeTable({ employees }) {
  const dispatch = useDispatch();
  const { activeDept } = useSelector((state) => state.hr);

  const handleViewEmployee = (emp) => {
    dispatch(setSelectedEmployee(emp));
    dispatch(openViewModal());
  };

  const getDeptColor = (dept) => {
    return HR_DEPT_CONFIG[dept]?.color || "#1a2332";
  };

  const getStatusStyle = (status) => {
    const styles = {
      Present: "bg-green-100 text-green-700",
      Absent: "bg-red-100 text-red-700",
      "On Leave": "bg-amber-100 text-amber-700",
      WFH: "bg-blue-100 text-blue-700",
    };
    return styles[status] || "bg-gray-100 text-gray-700";
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  if (!employees.length) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-16 text-center">
        <div className="text-4xl mb-4">🔍</div>
        <p className="text-lg font-semibold text-gray-900">
          No employees found
        </p>
        <p className="text-sm text-gray-500">Try adjusting filters</p>
      </div>
    );
  }

  const deptLabel =
    activeDept === "all"
      ? "All Staff"
      : `${HR_DEPT_CONFIG[activeDept]?.icon} ${HR_DEPT_CONFIG[activeDept]?.label} Department`;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{deptLabel}</h2>
          <p className="text-sm text-gray-500">
            {employees.length} employee{employees.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
              <th className="px-6 py-3">Avatar</th>
              <th className="px-6 py-3">Emp ID</th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Mobile</th>
              <th className="px-6 py-3">Department</th>
              <th className="px-6 py-3">Service Type</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Shift</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {employees.map((emp) => {
              const deptColor = getDeptColor(emp.dept);
              const initials = getInitials(emp.name);
              const deptConfig = HR_DEPT_CONFIG[emp.dept];

              return (
                <tr
                  key={emp.id}
                  className="hover:bg-gray-50 transition text-sm"
                >
                  <td className="px-6 py-4">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: deptColor }}
                    >
                      {initials}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded text-blue-600 font-semibold">
                      {emp.id}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{emp.name}</div>
                    <div className="text-xs text-gray-500">
                      {emp.gender} · {emp.blood}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-xs font-mono">{emp.mobile}</code>
                  </td>
                  <td className="px-6 py-4">
                    <div
                      className="text-xs font-semibold"
                      style={{ color: deptColor }}
                    >
                      {deptConfig?.icon} {deptConfig?.label}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-600">
                    {emp.service}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">
                      {emp.role}
                    </div>
                    <div className="text-xs text-gray-500">{emp.emptype}</div>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-600">
                    {emp.shift.split("(")[0].trim()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getStatusStyle(
                        emp.status
                      )}`}
                    >
                      {emp.status === "Present"}
                      {emp.status === "Absent"}
                      {emp.status === "On Leave"}
                      {emp.status === "WFH"}
                      {` ${emp.status}`}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleViewEmployee(emp)}
                      className="text-blue-600 hover:text-blue-800 font-semibold text-sm hover:underline"
                    >
                       View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
