import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setActiveService, HR_DEPT_CONFIG } from "../../features/hrSlice";

export default function ServiceTypeBar() {
  const dispatch = useDispatch();
  const { activeDept, activeService } = useSelector((state) => state.hr);

  const deptConfig = HR_DEPT_CONFIG[activeDept];
  const services = deptConfig?.services || [];

  const ServiceChip = ({ label, isActive }) => (
    <button
      onClick={() => dispatch(setActiveService(label))}
      className={`
        px-3 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap
        ${
          isActive
            ? "bg-blue-100 text-blue-700 border border-blue-300"
            : "bg-gray-100 text-gray-700 border border-gray-200 hover:border-blue-300"
        }
      `}
    >
      {label}
    </button>
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
      <div className="flex items-center gap-3 p-4 flex-nowrap min-w-min">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest flex-shrink-0">
          Service Type:
        </span>
        <ServiceChip label="All Types" isActive={activeService === "all"} />
        {services.map((service) => (
          <ServiceChip
            key={service}
            label={service}
            isActive={activeService === service}
          />
        ))}
      </div>
    </div>
  );
}
