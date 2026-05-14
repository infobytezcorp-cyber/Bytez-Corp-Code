import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { closeViewModal, HR_DEPT_CONFIG, updateEmployeeAsync } from "../../features/hrSlice";

export default function ViewEmployeeModal() {
  const dispatch = useDispatch();
  const { selectedEmployee } = useSelector((state) => state.hr);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedEmployee) {
      setEditForm(selectedEmployee);
    }
  }, [selectedEmployee]);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await dispatch(updateEmployeeAsync({ id: emp.id, data: editForm }));
      setIsEditing(false);
      alert("✅ Employee details updated successfully!");
    } catch (err) {
      alert("❌ Update failed: " + err.message);
    } finally {
      setLoading(false);
    }
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

  const InfoCell = ({ label, name, value, type = "text" }) => (
    <div className="px-4 py-3 border-b border-gray-200 border-r border-gray-200 last:border-r-0">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
        {label}
      </p>
      {isEditing ? (
        <input
          type={type}
          name={name}
          value={editForm[name] || ""}
          onChange={handleInputChange}
          className="w-full text-sm font-semibold border border-blue-300 rounded px-2 py-1 outline-none focus:border-blue-500"
        />
      ) : (
        <p className="text-sm font-semibold text-gray-900">{value || "—"}</p>
      )}
    </div>
  );

  const FullWidthCell = ({ label, name, value, type = "text" }) => (
    <div className="col-span-2 px-4 py-3 border-b border-gray-200">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
        {label}
      </p>
      {isEditing ? (
        <textarea
          name={name}
          value={editForm[name] || ""}
          onChange={handleInputChange}
          className="w-full text-sm font-semibold border border-blue-300 rounded px-2 py-1 outline-none focus:border-blue-500 resize-none"
          rows="3"
        />
      ) : (
        <p className="text-sm font-semibold text-gray-900">{value || "—"}</p>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
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
              onClick={() => {
                setIsEditing(false);
                dispatch(closeViewModal());
              }}
              className="absolute top-6 right-6 text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-lg"
            >
              ✕
            </button>
          </div>
          <div className="mt-6 text-2xl font-bold">
            ₹{Number(editForm.salary || emp.salary || 0).toLocaleString("en-IN")}
            <span className="text-sm opacity-75">/month</span>
          </div>
        </div>

        {/* Action Bar */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex gap-2 justify-between">
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    setEditForm(selectedEmployee);
                    setIsEditing(false);
                  }}
                  className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50"
                >
                  ✕ Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? "Saving..." : "✓ Save Changes"}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
              >
                ✏️ Edit
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-300px)] p-6">
          <InfoGrid title="Personal Information">
            <InfoCell label="Full Name" name="name" value={emp.name} />
            <InfoCell 
              label="Date of Birth" 
              name="dob" 
              type="date"
              value={editForm.dob || emp.dob || ""} 
            />
            <InfoCell label="Gender" name="gender" value={emp.gender} />
            <InfoCell label="Blood Group" name="blood" value={emp.blood} />
            <InfoCell label="Mobile" name="mobile" value={editForm.mobile || emp.mobile || ""} />
            <InfoCell label="Email" name="email" value={editForm.email || emp.email || ""} />
            <InfoCell label="Aadhaar" name="aadhaar" value={editForm.aadhaar || emp.aadhaar || ""} />
            <InfoCell label="Qualification" name="qual" value={editForm.qual || emp.qual || ""} />
            <FullWidthCell label="Address" name="address" value={editForm.address || emp.address || ""} />
          </InfoGrid>

          <InfoGrid title="Employment Details">
            <InfoCell label="Employee ID" name="id" value={emp.id} />
            <InfoCell label="Selected HR ID" name="recruiterHrId" value={editForm.recruiterHrId || emp.recruiterHrId || ""} />
            <InfoCell label="Selected HR Name" name="recruiterHrName" value={editForm.recruiterHrName || emp.recruiterHrName || ""} />
            <InfoCell label="Date of Joining" name="doj" type="date" value={editForm.doj || emp.doj || ""} />
            <InfoCell
              label="Department"
              name="dept"
              value={`${deptConfig?.icon} ${deptConfig?.label}`}
            />
            <InfoCell label="Service Type" name="service" value={editForm.service || emp.service || ""} />
            <InfoCell label="Role" name="role" value={editForm.role || emp.role || ""} />
            <InfoCell label="Employment Type" name="emptype" value={editForm.emptype || emp.emptype || ""} />
            <InfoCell label="Shift" name="shift" value={editForm.shift || emp.shift || ""} />
            <InfoCell label="Monthly Salary" name="salary" type="number" value={editForm.salary || emp.salary || 0} />
            <InfoCell label="Reporting Manager" name="manager" value={editForm.manager || emp.manager || ""} />
            <InfoCell label="Today's Status" name="status" value={editForm.status || emp.status || ""} />
          </InfoGrid>

          {emp.recruiterHrId && (
            <InfoGrid title="Selected HR Candidate Details">
              <InfoCell label="HR ID" name="recruiterHrId" value={editForm.recruiterHrId || emp.recruiterHrId || ""} />
              <InfoCell label="HR Name" name="recruiterHrName" value={editForm.recruiterHrName || emp.recruiterHrName || ""} />
            </InfoGrid>
          )}

          <InfoGrid title="Emergency Contact">
            <InfoCell label="Contact Name" name="emname" value={editForm.emname || emp.emname || ""} />
            <InfoCell label="Mobile" name="emmobile" value={editForm.emmobile || emp.emmobile || ""} />
            <InfoCell label="Relation" name="emrel" value={editForm.emrel || emp.emrel || ""} />
            <FullWidthCell label="Remarks" name="notes" value={editForm.notes || emp.notes || ""} />
          </InfoGrid>
        </div>

        {/* Close Button */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={() => {
              setIsEditing(false);
              dispatch(closeViewModal());
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// import React, { useState, useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { closeViewModal, HR_DEPT_CONFIG, updateEmployee } from "../../features/hrSlice";

// export default function ViewEmployeeModal() {
//   const dispatch = useDispatch();
//   const { selectedEmployee } = useSelector((state) => state.hr);
  
//   const [isEditing, setIsEditing] = useState(false);
//   const [editForm, setEditForm] = useState({});

//   useEffect(() => {
//     if (selectedEmployee) setEditForm(selectedEmployee);
//   }, [selectedEmployee]);

//   if (!selectedEmployee) return null;

//   const emp = selectedEmployee;
//   const deptConfig = HR_DEPT_CONFIG[emp.dept];
//   const deptColor = deptConfig?.color || "#1a2332";

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setEditForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleUpdate = async () => {
//     try {
//       await dispatch(updateEmployee({ id: emp.id, data: editForm })); // Sync to DB[cite: 8]
//       setIsEditing(false);
//       alert("✅ Employee details updated successfully!");
//     } catch (err) {
//       alert("❌ Update failed!");
//     }
//   };

//   const getInitials = (name) => {
//     return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
//   };

//   const InfoCell = ({ label, name, value, isFullWidth = false }) => (
//     <div className={`px-4 py-3 border-b border-gray-200 border-r border-gray-200 last:border-r-0 ${isFullWidth ? "col-span-2" : ""}`}>
//       <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
//       {isEditing ? (
//         <input
//           name={name}
//           value={editForm[name] || ""}
//           onChange={handleInputChange}
//           className="w-full text-sm font-semibold text-blue-700 border-b border-blue-300 outline-none"
//         />
//       ) : (
//         <p className="text-sm font-semibold text-gray-900">{value || "—"}</p>
//       )}
//     </div>
//   );

//   return (
//     <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border-t-4" style={{ borderTopColor: deptColor }}>
        
//         {/* Header Section */}
//         <div className="px-6 py-6 text-white" style={{ background: `linear-gradient(135deg, ${deptColor}, ${deptColor}aa)` }}>
//           <div className="flex justify-between items-start">
//             <div className="flex gap-4">
//               <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold border-2 border-white/30 bg-white/10">
//                 {getInitials(emp.name)}
//               </div>
//               <div>
//                 <h2 className="text-2xl font-bold">{emp.name}</h2>
//                 <p className="opacity-90 text-sm">{emp.role} • <code className="bg-white/20 px-1 rounded">{emp.id}</code></p>
//               </div>
//             </div>
//             <button onClick={() => dispatch(closeViewModal())} className="text-white text-xl">✕</button>
//           </div>
//         </div>

//         {/* Action Toggle */}
//         <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
//           <span className="text-xs font-bold uppercase text-gray-500">Employee Details</span>
//           {isEditing ? (
//             <div className="flex gap-2">
//               <button onClick={() => setIsEditing(false)} className="px-4 py-1 text-sm font-bold text-gray-600 border rounded hover:bg-gray-100">Cancel</button>
//               <button onClick={handleUpdate} className="px-4 py-1 text-sm font-bold text-white bg-green-600 rounded hover:bg-green-700">Save Changes</button>
//             </div>
//           ) : (
//             <button onClick={() => setIsEditing(true)} className="px-4 py-1 text-sm font-bold text-blue-600 border border-blue-200 rounded hover:bg-blue-50">✏️ Edit Staff</button>
//           )}
//         </div>

//         {/* Content Section */}
//         <div className="overflow-y-auto max-h-[calc(90vh-280px)] p-4">
//           <div className="grid grid-cols-2 border border-gray-200 rounded-lg overflow-hidden">
//             <InfoCell label="Full Name" name="name" value={emp.name} />
//             <InfoCell label="Contact Mobile" name="mobile" value={emp.mobile} />
//             <InfoCell label="Email Address" name="email" value={emp.email} />
//             <InfoCell label="Current Role" name="role" value={emp.role} />
//             <InfoCell label="Department" name="dept" value={deptConfig?.label} />
//             <InfoCell label="Service Type" name="service" value={emp.service} />
//             <InfoCell label="Monthly Salary (₹)" name="salary" value={emp.salary} />
//             <InfoCell label="Reporting Manager" name="manager" value={emp.manager} />
//             <InfoCell label="Residential Address" name="address" value={emp.address} isFullWidth />
//           </div>
//         </div>

//         <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
//           <button onClick={() => dispatch(closeViewModal())} className="px-6 py-2 bg-gray-900 text-white font-bold rounded-lg">Close</button>
//         </div>
//       </div>
//     </div>
//   );
// }
