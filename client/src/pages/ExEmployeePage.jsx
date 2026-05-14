import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setActiveDept,
  setActiveService,
  setSearchTerm,
  setStatusFilter,
  setEmpTypeFilter,
  openViewModal,
  setSelectedEmployee,
  HR_DEPT_CONFIG,
  fetchExEmployees,
} from "../features/hrSlice";
import { useNavigate } from "react-router-dom";
import DepartmentFilter from "../components/hr/DepartmentFilter";
import ServiceTypeBar from "../components/hr/ServiceTypeBar";
import EmployeeSearchBar from "../components/hr/EmployeeSearchBar";
import ViewEmployeeModal from "../components/hr/ViewEmployeeModal";
import Sidebar from "../components/dashboards/Sidebar";

export default function ExEmployeePage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchExEmployees());
  }, [dispatch]);

  const {
    exEmployees,
    activeDept,
    activeService,
    searchTerm,
    statusFilter,
    empTypeFilter,
    isViewModalOpen,
    selectedEmployee,
  } = useSelector((state) => state.hr);
  const navigate = useNavigate();

  const filteredExEmployees = exEmployees.filter((emp) => {
    return (
      (activeDept === "all" || emp.dept === activeDept) &&
      (activeService === "all" || emp.service === activeService) &&
      (statusFilter === "all" || emp.status === statusFilter) &&
      (empTypeFilter === "all" || emp.emptype === empTypeFilter) &&
      (!searchTerm ||
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.mobile.includes(searchTerm))
    );
  });

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

  const handleViewEmployee = (emp) => {
    dispatch(setSelectedEmployee(emp));
    dispatch(openViewModal());
  };

  const deptLabel =
    activeDept === "all"
      ? "All Ex-Employees"
      : `${HR_DEPT_CONFIG[activeDept]?.icon} ${HR_DEPT_CONFIG[activeDept]?.label} Department`;

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                👤 Ex-Employees
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                View and manage deactivated staff members
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/staff")}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition"
              >
                👥 Staff & HR Management
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Department Filter */}
          <DepartmentFilter />

          {/* Service Type Bar */}
          <ServiceTypeBar />

          {/* Search & Filters */}
          <EmployeeSearchBar />

          {/* Ex-Employee Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Table Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{deptLabel}</h2>
                <p className="text-sm text-gray-500">
                  {filteredExEmployees.length} ex-employee
                  {filteredExEmployees.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {filteredExEmployees.length === 0 ? (
              <div className="p-16 text-center">
                <div className="text-4xl mb-4">✓</div>
                <p className="text-lg font-semibold text-gray-900">
                  No ex-employees found
                </p>
                <p className="text-sm text-gray-500">
                  All your staff members are active
                </p>
              </div>
            ) : (
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
                      <th className="px-6 py-3">Deactivated Date</th>
                      <th className="px-6 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredExEmployees.map((emp) => {
                      const deptColor = getDeptColor(emp.dept);
                      const initials = getInitials(emp.name);
                      const deptConfig = HR_DEPT_CONFIG[emp.dept];
                      const deactivatedDate = emp.deactivatedAt
                        ? new Date(emp.deactivatedAt).toLocaleDateString()
                        : "—";

                      return (
                        <tr
                          key={emp.id}
                          className="hover:bg-gray-50 transition text-sm"
                        >
                          <td className="px-6 py-4">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold opacity-60"
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
                            <div className="font-semibold text-gray-900 opacity-70">
                              {emp.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {emp.gender} · {emp.blood}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <code className="text-xs font-mono">
                              {emp.mobile}
                            </code>
                          </td>
                          <td className="px-6 py-4">
                            <div
                              className="text-xs font-semibold"
                              style={{ color: deptColor }}
                            >
                              {deptConfig
                                ? `${deptConfig.icon} ${deptConfig.label}`
                                : emp.dept || emp.department || "—"}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-600">
                            {emp.service}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-900">
                              {emp.role}
                            </div>
                            <div className="text-xs text-gray-500">
                              {emp.emptype}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-600">
                            {deactivatedDate}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleViewEmployee(emp)}
                              className="text-blue-600 hover:text-blue-800 font-semibold text-sm hover:underline"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        {isViewModalOpen && selectedEmployee && <ViewEmployeeModal />}
      </div>
    </div>
  );
}
