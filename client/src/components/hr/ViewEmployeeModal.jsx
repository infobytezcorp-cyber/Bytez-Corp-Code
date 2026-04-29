import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { closeViewModal, HR_DEPT_CONFIG } from "../../features/hrSlice";

export default function ViewEmployeeModal() {
  const dispatch = useDispatch();
  const { selectedEmployee } = useSelector((state) => state.hr);

  if (!selectedEmployee) return null;

  const emp = selectedEmployee;
  const deptConfig = HR_DEPT_CONFIG[emp.dept];
  const deptColor = deptConfig?.color || "#1a2332";

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const [year, month, day] = dateStr.split("-");
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${parseInt(day)}-${months[parseInt(month) - 1]}-${year}`;
  };

  const getAge = (dob) => {
    if (!dob) return "—";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const statusColors = {
    Present: "#16a34a",
    Absent: "#dc2626",
    "On Leave": "#d97706",
    WFH: "#2d6be4",
  };

  const initials = getInitials(emp.name);

  const InfoGrid = ({ title, children }) => (
    <div className="mb-6">
      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-3 pb-2 border-b border-gray-200">
        {title}
      </h3>
      <div className="grid grid-cols-2 gap-0">{children}</div>
    </div>
  );

  const InfoCell = ({ label, value }) => (
    <div className="px-4 py-3 border-b border-gray-200 border-r border-gray-200 last:border-r-0">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-sm font-semibold text-gray-900">{value || "—"}</p>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        style={{
          borderTopColor: deptColor,
          borderTopWidth: "4px",
        }}
      >
        {/* Header with Gradient */}
        <div
          className="px-6 py-8 text-white relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${deptColor}dd, ${deptColor}88)`,
          }}
        >
          <div className="flex gap-4 items-flex-start">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0 border-2 border-white/30"
              style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            >
              {initials}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{emp.name}</h2>
              <p className="text-sm opacity-90">
                {emp.role} · <code className="bg-white/20 px-2 py-1 rounded">{emp.id}</code>
              </p>
              <div className="flex gap-2 mt-3 flex-wrap">
                <span className="bg-white/20 text-xs font-bold px-2 py-1 rounded">
                  {deptConfig?.icon} {deptConfig?.label}
                </span>
                <span className="bg-white/20 text-xs font-bold px-2 py-1 rounded">
                  {emp.service}
                </span>
                <span
                  className="text-xs font-bold px-2 py-1 rounded text-white"
                  style={{ backgroundColor: statusColors[emp.status] || "#888" }}
                >
                  ● {emp.status}
                </span>
              </div>
            </div>
            <button
              onClick={() => dispatch(closeViewModal())}
              className="absolute top-6 right-6 text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-lg"
            >
              ✕
            </button>
          </div>
          <div className="mt-6 text-2xl font-bold">
            ₹{Number(emp.salary).toLocaleString("en-IN")}
            <span className="text-sm opacity-75">/month</span>
          </div>
        </div>

        {/* Action Bar */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex gap-2">
          <button className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50">
            ✏️ Edit
          </button>
          {/* <button className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50">
            📱 WhatsApp
          </button>
          <button className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50">
            📋 Payslip
          </button> */}
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-300px)] p-6">
          <InfoGrid title="Personal Information">
            <InfoCell label="Full Name" value={emp.name} />
            <InfoCell label="Date of Birth" value={`${formatDate(emp.dob)} (${getAge(emp.dob)} yrs)`} />
            <InfoCell label="Gender" value={emp.gender} />
            <InfoCell label="Blood Group" value={emp.blood} />
            <InfoCell label="Mobile" value={<code className="text-xs">{emp.mobile}</code>} />
            <InfoCell label="Email" value={emp.email} />
            <InfoCell label="Aadhaar" value={<code className="text-xs">{emp.aadhaar}</code>} />
            <InfoCell label="Qualification" value={emp.qual} />
            <div className="col-span-2 px-4 py-3 border-b border-gray-200">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                Address
              </p>
              <p className="text-sm font-semibold text-gray-900">{emp.address}</p>
            </div>
          </InfoGrid>

          <InfoGrid title="Employment Details">
            <InfoCell label="Employee ID" value={<code className="text-xs text-blue-600">{emp.id}</code>} />
            <InfoCell label="Date of Joining" value={formatDate(emp.doj)} />
            <InfoCell
              label="Department"
              value={`${deptConfig?.icon} ${deptConfig?.label}`}
            />
            <InfoCell label="Service Type" value={emp.service} />
            <InfoCell label="Role" value={emp.role} />
            <InfoCell label="Employment Type" value={emp.emptype} />
            <InfoCell label="Shift" value={emp.shift} />
            <InfoCell
              label="Monthly Salary"
              value={`₹${Number(emp.salary).toLocaleString("en-IN")}`}
            />
            <InfoCell label="Reporting Manager" value={emp.manager} />
            <InfoCell label="Today's Status" value={emp.status} />
          </InfoGrid>

          <InfoGrid title="Emergency Contact">
            <InfoCell label="Contact Name" value={emp.emname} />
            <InfoCell label="Mobile" value={<code className="text-xs">{emp.emmobile}</code>} />
            <InfoCell label="Relation" value={emp.emrel} />
            <InfoCell label="Remarks" value={emp.notes} />
          </InfoGrid>
        </div>

        {/* Close Button */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={() => dispatch(closeViewModal())}
            className="px-4 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
