// import React, { useEffect, useState, useMemo } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import Sidebar from "../components/dashboards/Sidebar";
// import TaskManagementTable from "../components/taskManagement/TaskManagementTable";
// import { fetchEnrolledEnquiries, fetchStaffList } from "../features/taskManagementSlice";
// import { HR_DEPT_CONFIG } from "../features/hrSlice"; 

// export default function TaskManagement() {
//   const dispatch = useDispatch();
//   const [loading, setLoading] = useState(true);
  
//   // Filtering States
//   const [activeDept, setActiveDept] = useState("all");

//   useEffect(() => {
//     const loadData = async () => {
//       setLoading(true);
//       try {
//         await Promise.all([
//           dispatch(fetchEnrolledEnquiries()),
//           dispatch(fetchStaffList()),
//         ]);
//       } catch (error) {
//         console.error("Error loading task management data:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadData();
//   }, [dispatch]);

//   const { enrolledEnquiries, staffList } = useSelector((state) => state.taskManagement);

 
//   const careToDeptMap = {
//     "Home Nursing 12/7": "homecare",
//     "Home Nursing 24/7": "homecare",
//     "Patient Care Attender 12/7": "homecare",
//     "Patient Care Attender 24/7": "homecare",
//     "Cook 12/7": "homecare",
//     "Cook 24/7": "homecare",
//     "Baby Sitter 12/7": "homecare",
//     "Maid Staff 12/7": "homecare",
//     "Maid Staff 24/7": "homecare",
//     "Emergency Nurse 12/7": "healthcare",
//     "Emergency Nurse 24/7": "healthcare",
//     "Old Age Home": "healthcare",
//     "Doctor @ Home": "healthcare",
//     "Ambulance Service": "healthcare",
//     "Home Sample Collection": "healthcare",
//     "Diploma Nurse 24/7": "healthcare",
//     "Diploma Nurse 12/7": "healthcare",
//     "Elder Care Service 24/7": "healthcare"
//   };


//   const filteredEnquiries = useMemo(() => {
//     if (activeDept === "all") return enrolledEnquiries;
//     return enrolledEnquiries.filter(enq => careToDeptMap[enq.careType] === activeDept);
//   }, [activeDept, enrolledEnquiries]);

//   return (
//     <div className="flex h-screen bg-gray-100">
//       <Sidebar />
//       <div className="flex-1 flex flex-col overflow-hidden">
//         {/* Header */}
//         <div className="bg-white border-b border-gray-200 sticky top-0 z-10 px-6 py-4">
//           <div className="flex justify-between items-center">
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
//                 📋 Task Management
//               </h1>
//               <p className="text-sm text-gray-500 mt-1">
//                 Manage enrolled patients and assign staff members
//               </p>
//             </div>
            
//             {/* Department Filter Tabs */}
//             <div className="flex gap-2 bg-gray-100 p-1 rounded-lg border border-gray-200">
//               <button
//                 onClick={() => setActiveDept("all")}
//                 className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
//                   activeDept === "all" ? "bg-white shadow text-blue-600" : "text-gray-600 hover:text-gray-900"
//                 }`}
//               >
//                 All Cases
//               </button>
//               <button
//                 onClick={() => setActiveDept("homecare")}
//                 className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
//                   activeDept === "homecare" ? "bg-white shadow text-blue-600" : "text-gray-600 hover:text-gray-900"
//                 }`}
//               >
//                 Home Care
//               </button>
//               <button
//                 onClick={() => setActiveDept("healthcare")}
//                 className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
//                   activeDept === "healthcare" ? "bg-white shadow text-blue-600" : "text-gray-600 hover:text-gray-900"
//                 }`}
//               >
//                 Health Care
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Main Content */}
//         <div className="flex-1 overflow-y-auto">
//           <div className="p-6">
//             {loading ? (
//               <div className="flex items-center justify-center h-96">
//                 <div className="text-center">
//                   <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//                   <p className="mt-4 text-gray-600 font-medium">Loading task data...</p>
//                 </div>
//               </div>
//             ) : (
//               <div className="bg-white rounded-lg shadow">
//                 <TaskManagementTable 
//                   enquiries={filteredEnquiries} 
//                   staffList={staffList}
//                 />
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "../components/dashboards/Sidebar";
import TaskManagementTable from "../components/taskManagement/TaskManagementTable";
import { fetchEnrolledEnquiries, fetchStaffList } from "../features/taskManagementSlice";

export default function TaskManagement() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  
  // States
  const [activeDept, setActiveDept] = useState("all");
  const [taskView, setTaskView] = useState("unassigned"); // "unassigned" | "active" | "completed"

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          dispatch(fetchEnrolledEnquiries()),
          dispatch(fetchStaffList()),
        ]);
      } catch (error) {
        console.error("Error loading task data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [dispatch]);

  const { enrolledEnquiries, staffList } = useSelector((state) => state.taskManagement);

  const careToDeptMap = {
    "Home Nursing 12/7": "homecare",
    "Home Nursing 24/7": "homecare",
    "Patient Care Attender 12/7": "homecare",
    "Patient Care Attender 24/7": "homecare",
    "Cook 12/7": "homecare",
    "Cook 24/7": "homecare",
    "Baby Sitter 12/7": "homecare",
    "Maid Staff 12/7": "homecare",
    "Maid Staff 24/7": "homecare",
    "Emergency Nurse 12/7": "healthcare",
    "Emergency Nurse 24/7": "healthcare",
    "Old Age Home": "healthcare",
    "Doctor @ Home": "healthcare",
    "Ambulance Service": "healthcare",
    "Home Sample Collection": "healthcare",
    "Diploma Nurse 24/7": "healthcare",
    "Diploma Nurse 12/7": "healthcare",
    "Elder Care Service 24/7": "healthcare"
  };

  const normalizeStatus = (status) => String(status || "").trim().toLowerCase();

  // 1. Double Filter: View (Assigned/Unassigned) + Department (Home/Health)
  const filteredEnquiries = useMemo(() => {
    return enrolledEnquiries.filter(enq => {
      // Check Department Match
      const deptMatch = activeDept === "all" || careToDeptMap[enq.careType] === activeDept;
      const status = normalizeStatus(enq.taskStatus);

      // Check Task View Match
      let viewMatch = false;
      if (taskView === "unassigned") {
        viewMatch = !enq.assignedTo && status !== "completed";
      } else if (taskView === "active") {
        viewMatch = enq.assignedTo && status === "in progress";
      } else if (taskView === "completed") {
        viewMatch = status === "completed";
      }

      return deptMatch && viewMatch;
    });
  }, [activeDept, taskView, enrolledEnquiries]);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                📋 Task Management
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage enrolled patients and assign staff members
              </p>
            </div>
            
            {/* Department Filter Tabs */}
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg border border-gray-200">
              {["all", "homecare", "healthcare"].map(dept => (
                <button
                  key={dept}
                  onClick={() => setActiveDept(dept)}
                  className={`px-4 py-1.5 rounded-md text-sm font-bold capitalize transition ${
                    activeDept === dept ? "bg-white shadow text-blue-600" : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {dept === "all" ? "All Cases" : dept === "homecare" ? "Home Care" : "Health Care"}
                </button>
              ))}
            </div>
          </div>

          {/* Task View Tabs */}
          <div className="flex gap-6 mt-6 border-b border-gray-200">
            {[
              { id: "unassigned", label: "New Tasks (Pending)" },
              { id: "active", label: "Active Tasks (In Progress)" },
              { id: "completed", label: "Completed Tasks" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setTaskView(tab.id)}
                className={`pb-3 text-sm font-bold transition border-b-2 ${
                  taskView === tab.id ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-600 font-medium">Loading tasks...</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow">
                <TaskManagementTable 
                  enquiries={filteredEnquiries} 
                  allEnquiries={enrolledEnquiries}
                  staffList={staffList}
                  taskView={taskView} 
                  onTaskCompleted={() => setTaskView('completed')}
                  onTaskReopened={() => setTaskView('active')}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
