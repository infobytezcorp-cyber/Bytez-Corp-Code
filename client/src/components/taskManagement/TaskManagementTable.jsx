// import React, { useState } from "react";
// import { useDispatch } from "react-redux";
// import axios from "axios";
// import { CheckCircle, Loader } from "lucide-react";
// import { updateEnquiryAssignment } from "../../features/taskManagementSlice";
// import toast from "react-hot-toast";
// import {Clock } from "lucide-react";

// const API = import.meta.env.VITE_API_URL;
// axios.defaults.headers.common["ngrok-skip-browser-warning"] = "true";

// export default function TaskManagementTable({ enquiries = [], staffList = [] }) {
//   const dispatch = useDispatch();
//   const [assigningId, setAssigningId] = useState(null);
//   const [selectedEnquiry, setSelectedEnquiry] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   const handleAssignStaff = async (enquiry, staffId) => {
//     setAssigningId(enquiry._id);
//     try {
//       const staffMember = staffList.find((s) => s._id === staffId);
//       if (!staffMember) {
//         toast.error("Staff member not found!");
//         return;
//       }

//       // Update enquiry with assigned staff
//       const response = await axios.put(
//         `${API}/api/enquiries/${enquiry._id}`,
//         {
//           assignedTo: staffId,
//         }
//       );

//       // Dispatch Redux action to update state
//       dispatch(updateEnquiryAssignment({ enquiryId: enquiry._id, staffId }));

//       toast.success(`Assigned to ${staffMember.name}! ✅`);
//       setIsModalOpen(false);
//       setSelectedEnquiry(null);
//     } catch (error) {
//       console.error("Assignment error:", error);
//       toast.error("Failed to assign staff");
//     } finally {
//       setAssigningId(null);
//     }
//   };

//   const openAssignModal = (enquiry) => {
//     setSelectedEnquiry(enquiry);
//     setIsModalOpen(true);
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//     setSelectedEnquiry(null);
//   };

//   const getAssignedStaff = (staffId) => {
//     return staffList.find((s) => s._id === staffId);
//   };

//   if (!enquiries || enquiries.length === 0) {
//     return (
//       <div className="p-8 text-center">
//         <p className="text-gray-500 text-lg">No enrolled patients found</p>
//       </div>
//     );
//   }

//   return (
//     <>
//       {/* Table */}
//       <div className="overflow-x-auto">

        
//         <table className="w-full border-collapse">
//           <thead>
//             <tr className="bg-gray-50 border-b border-gray-200">
//               <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
//                 Patient Name
//               </th>
//               <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
//                 Phone
//               </th>
//               <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
//                 Care Type
//               </th>
//               <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
//                 Lead Source
//               </th>
//               <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
//                 Assigned Staff
//               </th>
//               <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
//                 Staff Department
//               </th>
//               <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
//                 Action
//               </th>
//             </tr>
//           </thead>
//           <tbody>
//             {enquiries.map((enquiry, idx) => {
//               const assignedStaff = getAssignedStaff(enquiry.assignedTo);
//               return (
//                 <tr
//                   key={enquiry._id || idx}
//                   className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
//                 >
//                   {/* Patient Name */}
//                   <td className="px-6 py-4 text-sm font-medium text-gray-900">
//                     {enquiry.elderName}
//                   </td>

//                   {/* Phone */}
//                   <td className="px-6 py-4 text-sm text-gray-600">
//                     {enquiry.phone}
//                   </td>

//                   {/* Care Type */}
//                   <td className="px-6 py-4 text-sm text-gray-600">
//                     <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
//                       {enquiry.careType || "N/A"}
//                     </span>
//                   </td>

//                   {/* Lead Source */}
//                   <td className="px-6 py-4 text-sm text-gray-600">
//                     {enquiry.lead || "N/A"}
//                   </td>

//                   {/* Assigned Staff */}
//                   <td className="px-6 py-4 text-sm">
//                     {assignedStaff ? (
//                       <div className="flex items-center gap-2">
//                         <CheckCircle size={16} className="text-green-600" />
//                         <span className="font-medium text-gray-900">
//                           {assignedStaff.name}
//                         </span>
//                       </div>
//                     ) : (
//                       <span className="text-gray-400 italic">Not assigned</span>
//                     )}
//                   </td>

//                   {/* Staff Department */}
//                   <td className="px-6 py-4 text-sm text-gray-600">
//                     {assignedStaff ? (
//                       <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
//                         {getDeptLabel(assignedStaff.dept)}
//                       </span>
//                     ) : (
//                       <span className="text-gray-400">-</span>
//                     )}
//                   </td>

//                   {/* Action */}
//                   <td className="px-6 py-4 text-center">
//                     <button
//                       onClick={() => openAssignModal(enquiry)}
//                       className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
//                     >
//                       {assignedStaff ? "Change" : "Assign"}
//                     </button>
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>

//       {/* Modal */}
//     {isModalOpen && selectedEnquiry && (
//     <StaffAssignmentModal
//         enquiry={selectedEnquiry}
//         staffList={staffList}
//         enquiries={enquiries} 
//         onAssign={handleAssignStaff}
//         onClose={closeModal}
//         isLoading={assigningId === selectedEnquiry._id}
//     />
//     )}
//     </>
//   );
// }

// //Department Label Helper
// function getDeptLabel(dept) {
//   const deptMap = {
//     homecare: "Home Care",
//     healthcare: "Health Care",
//     calls: "Call Center",
//     it: "IT",
//     nonit: "Non-IT",
//     labour: "Labour",
//   };
//   return deptMap[dept] || dept;
// }

// function StaffAssignmentModal({ enquiry, staffList, onAssign, onClose, isLoading, enquiries }) {
//   const [selectedStaff, setSelectedStaff] = useState(null);
//   const [duration, setDuration] = useState("");

//   // 1. Service Match Filter: கிளைண்ட் கேட்கும் சேவையும் ஸ்டாஃப் சேவையும் சமமாக இருக்க வேண்டும்
//   // 2. Availability Check: அந்த ஸ்டாஃப் ஏற்கனவே வேறு வேலையில் (In Progress) இருக்கக்கூடாது
//   const filteredStaff = staffList.filter((s) => {
//     const isServiceMatch = s.service === enquiry.careType;
//     const isAvailable = !enquiries.some(
//       (e) => e.assignedTo === s._id && e.taskStatus === "In Progress"
//     );
//     return isServiceMatch && isAvailable;
//   });

//   return (
//     <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//       <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
//         <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
//           <div>
//             <h2 className="text-lg font-bold text-gray-900">Assign Staff</h2>
//             <p className="text-xs text-blue-600 font-bold uppercase">{enquiry.careType}</p>
//           </div>
//           <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
//         </div>

//         <div className="p-6 space-y-5">
//           {/* Duration Input */}
//           <div className="space-y-2">
//             <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1">
//               <Clock size={14} /> Task Duration *
//             </label>
//             <input
//               type="text"
//               value={duration}
//               onChange={(e) => setDuration(e.target.value)}
//               placeholder="e.g. 15 Days, 1 Month"
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition"
//             />
//           </div>

//           {/* Staff List */}
//           <div className="space-y-3">
//             <label className="text-xs font-bold text-gray-700 uppercase">
//               Available Staff for this Service
//             </label>
//             <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
//               {filteredStaff.length === 0 ? (
//                 <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
//                   <p className="text-xs text-gray-500 italic">No available staff found for this service.</p>
//                 </div>
//               ) : (
//                 filteredStaff.map((staff) => (
//                   <div
//                     key={staff._id}
//                     onClick={() => setSelectedStaff(staff._id)}
//                     className={`p-3 border-2 rounded-xl cursor-pointer transition-all flex items-center justify-between ${
//                       selectedStaff === staff._id
//                         ? "border-blue-600 bg-blue-50"
//                         : "border-gray-100 hover:border-gray-200 bg-white"
//                     }`}
//                   >
//                     <div className="flex items-center gap-3">
//                       <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
//                         {staff.name.charAt(0)}
//                       </div>
//                       <div>
//                         <p className="text-sm font-bold text-gray-900">{staff.name}</p>
//                         <p className="text-[10px] text-gray-500">{staff.role}</p>
//                       </div>
//                     </div>
//                     {selectedStaff === staff._id && <CheckCircle size={18} className="text-blue-600" />}
//                   </div>
//                 ))
//               )}
//             </div>
//           </div>
//         </div>

//         <div className="px-6 py-4 border-t bg-gray-50 flex gap-3 justify-end">
//           <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700">
//             Cancel
//           </button>
//           <button
//             onClick={() => selectedStaff && duration && onAssign(enquiry, selectedStaff, duration)}
//             disabled={!selectedStaff || !duration || isLoading}
//             className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition flex items-center gap-2"
//           >
//             {isLoading ? <Loader size={16} className="animate-spin" /> : "Confirm Assignment"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }


import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { CheckCircle, Loader, CalendarDays } from "lucide-react"; 
import { assignTask, completeTask, reopenTask } from "../../features/taskManagementSlice";
import toast from "react-hot-toast";

export default function TaskManagementTable({ 
  enquiries = [], 
  allEnquiries = enquiries,
  staffList = [], 
  taskView,           
  onTaskCompleted, 
  onTaskReopened 
}) {
  const dispatch = useDispatch();
  const [assigningId, setAssigningId] = useState(null);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAssignStaff = async (enquiry, staffId, durationString, durationHours) => {
    setAssigningId(enquiry._id);
    try {
      const res = await dispatch(assignTask({ 
        enquiryId:    enquiry._id, 
        staffId, 
        durationHours,
        duration:     durationString,
      }));
      if (res.error) throw new Error(res.payload || res.error.message || 'Assign failed');

      toast.success("Task Assigned Successfully! 🚀");
      setIsModalOpen(false);
      setSelectedEnquiry(null);
    } catch (error) {
      console.error('Assign error:', error);
      toast.error(error.message || "Failed to assign staff");
    } finally {
      setAssigningId(null);
    }
  };

  const handleMarkCompleted = async (enquiry) => {
    try {
      const res = await dispatch(completeTask({ enquiryId: enquiry._id }));
      if (res.error) throw new Error(res.payload || res.error.message || 'Complete failed');
      toast.success("Task completed! Staff is now free.");
      if (typeof onTaskCompleted === 'function') onTaskCompleted();
    } catch (error) {
      toast.error("Failed to complete task");
    }
  };

  const handleReopen = async (enquiry) => {
    try {
      const res = await dispatch(reopenTask({ enquiryId: enquiry._id }));
      if (res.error) throw new Error(res.payload || res.error.message || 'Reopen failed');
      toast.success('Task moved back to Active Tasks');
      if (typeof onTaskReopened === 'function') onTaskReopened();
    } catch (error) {
      toast.error('Failed to reopen task');
    }
  };

  const openAssignModal  = (enquiry) => { setSelectedEnquiry(enquiry); setIsModalOpen(true); };
  const closeModal       = () => { setIsModalOpen(false); setSelectedEnquiry(null); };
  const getAssignedStaff = (staffId) => staffList.find((s) => s._id === staffId);
  const normalizeStatus  = (status) => String(status || "").trim().toLowerCase();

  // ✅ Pending view-in don't have a 2 cells
  const isPending   = taskView === "unassigned";
  const isActiveView = taskView === "active";

  if (!enquiries || enquiries.length === 0) {
    return (
      <div className="p-12 text-center">
        <p className="text-gray-500 text-lg font-medium">No tasks found in this view.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Patient ID</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Patient Name</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Service Required</th>

              {/* ✅ Pending-in don't have a 2 cells */}
              {!isPending && (
                <>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Assigned Staff</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Duration</th>
                </>
              )}

              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody>
            {enquiries.map((enquiry) => {
              const assignedStaff = getAssignedStaff(enquiry.assignedTo);
              const status        = normalizeStatus(enquiry.taskStatus);
              const isCompleted   = status === "completed";
              const isActive      = enquiry.assignedTo && !isCompleted;
              const isUnassigned  = !enquiry.assignedTo && !isCompleted;

              return (
                <tr key={enquiry._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  
                  {/* Patient ID */}
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-700">{enquiry.clientId || "-"}</p>
                  </td>

                  {/* Patient Name + Phone */}
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-900">{enquiry.elderName}</p>
                    <p className="text-xs font-medium text-gray-500">{enquiry.phone}</p>
                  </td>

                  {/* Service */}
                  <td className="px-6 py-4">
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                      {enquiry.careType || "N/A"}
                    </span>
                  </td>

                  {/* ✅ Pending view- in don't have a 2 cells */}
                  {!isPending && (
                    <>
                      {/* Assigned Staff */}
                      <td className="px-6 py-4 text-sm">
                        {assignedStaff ? (
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2 text-green-700 font-bold">
                              <CheckCircle size={14} />
                              <span>{assignedStaff.name}</span>
                            </div>
                            {/*  Employee ID  */}
                            {isActiveView && assignedStaff.empId && (
                              <span className="text-[10px] text-gray-400 font-medium ml-5">
                                ID: {assignedStaff.empId}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic text-xs">Pending Assignment</span>
                        )}
                      </td>

                      {/* Duration */}
                      <td className="px-6 py-4 text-xs font-bold text-gray-700">
                        {enquiry.duration ? (
                          <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block w-max">
                            {enquiry.duration}
                          </span>
                        ) : "-"}
                      </td>
                    </>
                  )}

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isCompleted  ? "bg-green-100 text-green-700"  : 
                      isActive     ? "bg-yellow-100 text-yellow-700" : 
                                     "bg-gray-100 text-gray-600"
                    }`}>
                      {isCompleted ? "Completed" : isActive ? "In Progress" : "Unassigned"}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="px-6 py-4 text-center">
                    {isUnassigned && (
                      <button
                        onClick={() => openAssignModal(enquiry)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-xs font-bold transition-all shadow-sm"
                      >
                        Assign Staff
                      </button>
                    )}

                    {isActive && (
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleMarkCompleted(enquiry)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm w-full"
                        >
                          <CheckCircle size={14} /> Mark Completed
                        </button>
                        <button
                          onClick={() => openAssignModal(enquiry)}
                          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm w-full"
                        >
                          Change Staff
                        </button>
                      </div>
                    )}

                    {isCompleted && (
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleReopen(enquiry)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm w-full"
                        >
                          Reopen
                        </button>
                        <span className="text-green-600 text-xs font-bold uppercase flex items-center justify-center gap-1">
                          <CheckCircle size={14} /> Done
                        </span>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && selectedEnquiry && (
        <StaffAssignmentModal
          enquiry={selectedEnquiry}
          staffList={staffList}
          enquiries={allEnquiries} 
          onAssign={handleAssignStaff}
          onClose={closeModal}
          isLoading={assigningId === selectedEnquiry._id}
        />
      )}
    </>
  );
}

function StaffAssignmentModal({ enquiry, staffList, onAssign, onClose, isLoading, enquiries }) {
  const [selectedStaff, setSelectedStaff] = useState(enquiry.assignedTo || null); 
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate]     = useState("");

  const filteredStaff = staffList.filter((s) => {
    const isServiceMatch = String(s.service || '').trim() === String(enquiry.careType || '').trim();
    const isBusyWithOtherTask = enquiries.some((e) => {
      const assignedToId = e.assignedTo ? String(e.assignedTo) : '';
      const staffId      = String(s._id);
      const status       = String(e.taskStatus || '').trim();
      return assignedToId === staffId && status !== 'Completed' && e._id !== enquiry._id;
    });
    return isServiceMatch && !isBusyWithOtherTask;
  });

  const handleConfirm = () => {
    if (selectedStaff && startDate && endDate) {
      const formatStart    = new Date(startDate).toLocaleDateString('en-GB');
      const formatEnd      = new Date(endDate).toLocaleDateString('en-GB');
      const durationString = `${formatStart} to ${formatEnd}`;
      const sd             = new Date(startDate);
      const ed             = new Date(endDate);
      const durationDays   = Math.max(1, Math.ceil((ed - sd) / (1000 * 60 * 60 * 24)) + 1);
      onAssign(enquiry, selectedStaff, durationString, durationDays);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Assign / Change Staff</h2>
            <p className="text-xs text-blue-600 font-bold uppercase mt-1">{enquiry.careType}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1 mb-2">
                <CalendarDays size={14} /> Start Date
              </label>
              <input type="date" value={startDate} min={today}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1 mb-2">
                <CalendarDays size={14} /> End Date
              </label>
              <input type="date" value={endDate} min={startDate || today}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-700 uppercase">
              Available Specialists ({filteredStaff.length})
            </label>
            <div className="max-h-52 overflow-y-auto pr-2 space-y-2">
              {filteredStaff.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                  <p className="text-sm font-medium text-gray-600">No staff available right now.</p>
                  <p className="text-xs text-gray-400 mt-1 italic">Everyone is currently busy.</p>
                </div>
              ) : (
                filteredStaff.map((staff) => (
                  <div key={staff._id} onClick={() => setSelectedStaff(staff._id)}
                    className={`p-3 border-2 rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                      selectedStaff === staff._id ? "border-blue-600 bg-blue-50" : "border-gray-100 hover:border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm uppercase">
                        {staff.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{staff.name}</p>
                        {/* ✅ Employee ID modal-ல் காட்டு */}
                        {staff.empId && (
                          <p className="text-[10px] text-blue-500 font-bold">EMP: {staff.empId}</p>
                        )}
                        <p className="text-[10px] text-gray-400 font-medium">{staff.role}</p>
                      </div>
                    </div>
                    {selectedStaff === staff._id && <CheckCircle size={18} className="text-blue-600" />}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t bg-gray-50 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700">
            Cancel
          </button>
          <button onClick={handleConfirm}
            disabled={!selectedStaff || !startDate || !endDate || isLoading}
            className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition flex items-center gap-2"
          >
            {isLoading ? <Loader size={16} className="animate-spin" /> : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
