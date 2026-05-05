import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setSearchTerm,
  setStatusFilter,
  setEmpTypeFilter,
  openAddModal,
} from "../../features/hrSlice";

export default function EmployeeSearchBar({ view, setView }) {
  const dispatch = useDispatch();
  const { searchTerm, statusFilter, empTypeFilter } = useSelector(
    (state) => state.hr
  );

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">HR & Staffs</h2>


      </div>
      
      <div className="flex gap-3 flex-wrap items-center mb-3">
        {/* Search */}
        <div className="flex-1 min-w-[300px] flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2">
          <span className="text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Search name, ID, mobile..."
            value={searchTerm}
            onChange={(e) => dispatch(setSearchTerm(e.target.value))}
            className="flex-1 outline-none text-sm"
          />
        </div>

        {/* Status Filter */}
        {/* <select
          value={statusFilter}
          onChange={(e) => dispatch(setStatusFilter(e.target.value))}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none hover:border-blue-400"
        >
          <option value="all">All Status</option>
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
          <option value="On Leave">On Leave</option>
          <option value="WFH">WFH</option>
        </select> */}

        {/* Employment Type Filter */}
        <select
          value={empTypeFilter}
          onChange={(e) => dispatch(setEmpTypeFilter(e.target.value))}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none hover:border-blue-400"
        >
          <option value="all">All Type</option>
          <option value="Full-Time">Full-Time</option>
          <option value="Part-Time">Part-Time</option>
          <option value="Contract">Contract</option>
          <option value="Daily Wage">Daily Wage</option>
        </select>
      </div>

      {/* Action Buttons */}
      {/* <div className="flex gap-3 justify-end">
        <button
          onClick={() => dispatch(openAddModal())}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition text-sm"
        >
          + Add Employee
        </button>
        <button className="border border-gray-300 hover:bg-gray-50 font-semibold py-2 px-4 rounded-lg transition text-sm">
          📤 Export
        </button>
      </div> */}
    </div>
  );
}
