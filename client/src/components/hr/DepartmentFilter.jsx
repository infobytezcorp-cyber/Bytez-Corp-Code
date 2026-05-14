import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setActiveDept,
  setActiveService,
  HR_DEPT_CONFIG,
} from "../../features/hrSlice";

export default function DepartmentFilter() {
  const dispatch = useDispatch();
  const { activeDept, employees } = useSelector((state) => state.hr);

  const getDeptCount = (dept) => {
    return dept === "all"
      ? employees.length
      : employees.filter((e) => e.dept === dept).length;
  };

  const DeptPill = ({ id, config }) => {
    const isActive = activeDept === id;
    const count = getDeptCount(id);

    return (
      <button
        onClick={() => {
          dispatch(setActiveDept(id));
          dispatch(setActiveService("all"));
        }}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-full border-2 font-semibold text-sm
          transition-all whitespace-nowrap
          ${
            isActive
              ? `border-transparent text-white shadow-md`
              : "border-gray-200 text-gray-700 hover:border-blue-400"
          }
        `}
        style={isActive ? { backgroundColor: id === "all" ? "#1a2332" : config?.color || "#666" } : {}}
      >
        {id === "all" ? (
          <>👥 All</>
        ) : (
          <>
            {config?.icon} {config?.label}
          </>
        )}
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            isActive ? "bg-white/25" : "bg-gray-100"
          }`}
        >
          {count}
        </span>
      </button>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
      <div className="flex items-center gap-2 p-4 flex-nowrap min-w-min">
        <DeptPill id="all" config={null} />
        {Object.entries(HR_DEPT_CONFIG).map(([key, config]) => (
          <DeptPill key={key} id={key} config={config} />
        ))}
      </div>
    </div>
  );
}
