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
import HRKPIDashboard    from "../components/hr/HRKPIDashboard";
import DepartmentFilter  from "../components/hr/DepartmentFilter";
import ServiceTypeBar    from "../components/hr/ServiceTypeBar";
import EmployeeSearchBar from "../components/hr/EmployeeSearchBar";
import EmployeeTable     from "../components/hr/EmployeeTable";
import AddEmployeeModal  from "../components/hr/AddEmployeeModal";
import ViewEmployeeModal from "../components/hr/ViewEmployeeModal";
import Sidebar           from "../components/dashboards/Sidebar";

export default function StaffPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => { dispatch(fetchEmployees()); }, [dispatch]);

  const {
    employees, activeDept, activeService, searchTerm,
    statusFilter, empTypeFilter, isAddModalOpen, isViewModalOpen, selectedEmployee,
  } = useSelector((state) => state.hr);

  const filteredEmployees = employees.filter((emp) => (
    (activeDept     === "all" || emp.dept    === activeDept)     &&
    (activeService  === "all" || emp.service === activeService)  &&
    (statusFilter   === "all" || emp.status  === statusFilter)   &&
    (empTypeFilter  === "all" || emp.emptype === empTypeFilter)  &&
    (!searchTerm ||
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.id.toLowerCase().includes(searchTerm.toLowerCase())   ||
      emp.mobile.includes(searchTerm))
  ));

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar — fixed width, never shrinks */}
      <Sidebar />

      {/* Main area — takes remaining width, scrolls independently */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* ── Sticky Header ── */}
        <header className="shrink-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2 truncate">
                👥 Staff & HR Management
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Manage employees across all departments
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => navigate("/ex-employees")}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                👤 Ex-Employees
              </button>
              <button
                onClick={() => dispatch(openAddModal())}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                + Add Employee
              </button>
            </div>
          </div>
        </header>

        {/* ── Scrollable Body ── */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-5 space-y-4">
          <HRKPIDashboard employees={filteredEmployees} allEmployees={employees} />
          <DepartmentFilter />
          <ServiceTypeBar />
          <EmployeeSearchBar />
          <EmployeeTable employees={filteredEmployees} />
        </main>
      </div>

      {/* ── Modals ── */}
      {isAddModalOpen  && <AddEmployeeModal />}
      {isViewModalOpen && selectedEmployee && <ViewEmployeeModal />}
    </div>
  );
}