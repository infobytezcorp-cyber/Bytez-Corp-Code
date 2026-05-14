import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  setActiveDept,
  setActiveService,
  setSearchTerm,
  setStatusFilter,
  setEmpTypeFilter,
  openAddModal,
  closeViewModal,
  openViewModal,
  setSelectedEmployee,
  HR_DEPT_CONFIG,
  fetchEmployees,
} from "../features/hrSlice";
import HRKPIDashboard from "../components/hr/HRKPIDashboard";
import DepartmentFilter from "../components/hr/DepartmentFilter";
import ServiceTypeBar from "../components/hr/ServiceTypeBar";
import EmployeeSearchBar from "../components/hr/EmployeeSearchBar";
import EmployeeTable from "../components/hr/EmployeeTable";
import AddEmployeeModal from "../components/hr/AddEmployeeModal";
import ViewEmployeeModal from "../components/hr/ViewEmployeeModal";
import Sidebar from "../components/dashboards/Sidebar";

export default function StaffPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  const {
    employees,
    activeDept,
    activeService,
    searchTerm,
    statusFilter,
    empTypeFilter,
    isAddModalOpen,
    isViewModalOpen,
    selectedEmployee,
  } = useSelector((state) => state.hr);

  const filteredEmployees = employees.filter((emp) => {
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

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                👥 Staff & HR Management
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage employees across all departments
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/ex-employees")}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition"
              >
                👤 Ex-Employees
              </button>
              <button
                onClick={() => dispatch(openAddModal())}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition"
              >
                + Add Employee
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* KPI Dashboard */}
          <HRKPIDashboard employees={filteredEmployees} allEmployees={employees} />

          {/* Department Filter */}
          <DepartmentFilter />

          {/* Service Type Bar */}
          <ServiceTypeBar />

          {/* Search & Filters */}
          <EmployeeSearchBar />

          {/* Employee Table */}
          <EmployeeTable employees={filteredEmployees} />
        </div>

        {/* Modals */}
        {isAddModalOpen && <AddEmployeeModal />}
        {isViewModalOpen && selectedEmployee && <ViewEmployeeModal />}
      </div>
    </div>
  );
}
