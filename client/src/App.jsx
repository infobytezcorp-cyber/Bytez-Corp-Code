// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import Admin from "./pages/Admin";
// import Manager from "./pages/Manager";
// import User from "./pages/User";
// import ProtectedRoute from "./components/ProtectedRoute";
// import { Toaster } from "react-hot-toast";
// import AnalyticsPage from "./pages/AnalyticsPage";
// import SettingsPage from "./pages/SettingPage";
// import VisitorRegistration from "./components/dashboards/visitors/VisitorRegistration";
// import SuccessPage from "./components/dashboards/visitors/SuccessPage";
// import JobRegistorForm from "./components/dashboards/visitors/JobRegistorForm";
// import Enquiry from "./pages/Enquiry";
// import EnquiryWithLeadForm from "./pages/EnquiryWithLeadForm";
// import CallCenter from "./pages/CallCenter";
// import StaffPage from "./pages/StaffPage";
// import ExEmployeePage from "./pages/ExEmployeePage";
// import WhatsAppLeads from "./pages/WhatsAppLeads";
// import TaskManagement from "./pages/TaskManagement";
// import Recruiter from "./pages/Recruiter";
// import Recruiters from "./pages/Recruiters";
// import RecruitersSelected from "./pages/RecruitersSelected";
// import RecruitersRejected from "./pages/RecruitersRejected";
// import RecruiterHrPage from "./pages/RecruiterHrPage";
// import RecruiterCandidates from "./pages/RecruiterCandidates";
// // import VisitorRegistration from "./components/dashboards/VisitorRegistration";
// // import Enquiry from "./pages/Enquiry";
// import ModulesPage from "./pages/ModulesPage";
// import VisitorPage from "./pages/VisitorPage";


// // import VisitorRegistration from "./components/dashboards/VisitorRegistration";
// // import Enquiry from "./pages/Enquiry";
// // import ModulesPage from "./pages/ModulesPage";
// // import VisitorPage from "./pages/VisitorPage";
// import EnquiryCalls from "./pages/EnquiryCalls";
// import TelecallerPage from "./pages/TelecallerPage";
// import socket from "./services/socket";
// import Trends from "./pages/Trends";
// import { useEffect } from "react";
// import ReportsLanding from "./pages/reports/ReportsLanding";
// import UserLoginReportPage from "./pages/reports/UserLoginReportPage";
// import UserCallReportPage from "./pages/reports/UserCallReportPage";
// import PlaceholderReport from "./pages/reports/PlaceholderReport";
// import UserTaskReportPage from "./pages/reports/UserTaskReportPage";
// import UserStageReportPage from "./pages/reports/UserStageReportPage";
// import AdminTaskPage from "./pages/AdminTaskPage";
// import StaffLoginPage from "./pages/StaffLoginPage";
// import StaffPortal from "./pages/StaffPortal";



// function App() {
//   useEffect(() => {
//     socket.connect();

//     return () => {
//       socket.disconnect();
//     };
//   }, []);
//   return (
//     <>
//       <Toaster position="top-right" reverseOrder={false} />


//       <BrowserRouter>
//         <Routes>
//           <Route path="/" element={<Login />} />
//           <Route path="/register" element={<Register />} />
//           <Route path="/visitorpage" element={<VisitorPage />} />
//           <Route path="/analytics" element={<AnalyticsPage />} />
//           <Route path="/settings" element={<SettingsPage />} />
//           <Route path="/visitor" element={<VisitorRegistration />} />
//           <Route path="/success" element={<SuccessPage />} />
//           <Route path="/jobform" element={<JobRegistorForm />} />
//           <Route path="/EnquiryCalls" element={<EnquiryCalls />} />
//           <Route path="/trends" element={<Trends />} />
//           <Route path="/staff" element={<StaffPortal />} />
//           <Route path="/admin/tasks" element={<AdminTaskPage />} />
//           <Route path="/staff/login" element={<StaffLoginPage />} />

//           <Route
//             path="/enquiry"
//             element={
//               <ProtectedRoute role="admin">
//                 <Enquiry />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/reports"
//             element={
//               <ProtectedRoute role="admin">
//                 <ReportsLanding />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/reports/login"
//             element={
//               <ProtectedRoute role="admin">
//                 <UserLoginReportPage />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/reports/calls"
//             element={
//               <ProtectedRoute role="admin">
//                 <UserCallReportPage />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/reports/activity"
//             element={
//               <ProtectedRoute role="admin">
//                 <PlaceholderReport title="User Activity Report" />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/reports/followup"
//             element={
//               <ProtectedRoute role="admin">
//                 <PlaceholderReport title="Follow-Up Report" />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/reports/user"
//             element={
//               <ProtectedRoute role="admin">
//                 <UserStageReportPage />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/reports/tasks"
//             element={
//               <ProtectedRoute role="admin">
//                 <UserTaskReportPage />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/callcenter"
//             element={
//               <ProtectedRoute role="admin">
//                 <CallCenter />
//               </ProtectedRoute>
//             }
//           />
//           <Route path="/staff" 
//             element={
//             <ProtectedRoute role="admin">
//               <StaffPage />
//             </ProtectedRoute>} />
//           <Route
//             path="/staff"
//             element={
//               <ProtectedRoute role="admin">
//                 <StaffPage />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/ex-employees"
//             element={
//               <ProtectedRoute role="admin">
//                 <ExEmployeePage />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/whatsapp-leads"
//             element={
//               <ProtectedRoute role="admin">
//                 <WhatsAppLeads />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/recruiter"
//             element={
//               <ProtectedRoute role="admin">
//                 <Recruiter />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/recruiters"
//             element={
//               <ProtectedRoute role="admin">
//                 <Recruiters />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/recruiters/selected"
//             element={
//               <ProtectedRoute role="admin">
//                 <RecruitersSelected />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/recruiters/rejected"
//             element={
//               <ProtectedRoute role="admin">
//                 <RecruitersRejected />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/recruiters/candidates"
//             element={
//               <ProtectedRoute role="admin">
//                 <RecruiterCandidates />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/recruiters/hr"
//             element={
//               <ProtectedRoute role="admin">
//                 <RecruiterHrPage />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/tasks"
//             element={
//               <ProtectedRoute role="admin">
//                 <TaskManagement />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/admin"
//             element={
//               <ProtectedRoute role="admin">
//                 <Admin />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/manager"
//             element={
//               <ProtectedRoute role="manager">
//                 <Manager />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/user"
//             element={
//               <ProtectedRoute role="user">
//                 <User />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/telecaller"
//             element={
//               <ProtectedRoute role="telecaller">
//                 <TelecallerPage />
//               </ProtectedRoute>
//             }
//           />
//           <Route
//             path="/telecaller/enquiry"
//             element={
//               <ProtectedRoute role="telecaller">
//                 <EnquiryWithLeadForm />
//               </ProtectedRoute>
//             }
//           />
          
          
//         </Routes>
//       </BrowserRouter>
//     </>
//   );
// }

// export default App;

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import Manager from "./pages/Manager";
import User from "./pages/User";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "react-hot-toast";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingPage";
import VisitorRegistration from "./components/dashboards/visitors/VisitorRegistration";
import SuccessPage from "./components/dashboards/visitors/SuccessPage";
import JobRegistorForm from "./components/dashboards/visitors/JobRegistorForm";
import Enquiry from "./pages/Enquiry";
import EnquiryWithLeadForm from "./pages/EnquiryWithLeadForm";
import CallCenter from "./pages/CallCenter";
import StaffPage from "./pages/StaffPage";
import ExEmployeePage from "./pages/ExEmployeePage";
import WhatsAppLeads from "./pages/WhatsAppLeads";
import TaskManagement from "./pages/TaskManagement";
import Recruiter from "./pages/Recruiter";
import Recruiters from "./pages/Recruiters";
import RecruitersSelected from "./pages/RecruitersSelected";
import RecruitersRejected from "./pages/RecruitersRejected";
import RecruiterHrPage from "./pages/RecruiterHrPage";
import RecruiterCandidates from "./pages/RecruiterCandidates";
import ModulesPage from "./pages/ModulesPage";
import VisitorPage from "./pages/VisitorPage";
import EnquiryCalls from "./pages/EnquiryCalls";
import TelecallerPage from "./pages/TelecallerPage";
import socket from "./services/socket";
import Trends from "./pages/Trends";
import { useEffect } from "react";
import ReportsLanding from "./pages/reports/ReportsLanding";
import UserLoginReportPage from "./pages/reports/UserLoginReportPage";
import UserCallReportPage from "./pages/reports/UserCallReportPage";
import PlaceholderReport from "./pages/reports/PlaceholderReport";
import UserTaskReportPage from "./pages/reports/UserTaskReportPage";
import UserStageReportPage from "./pages/reports/UserStageReportPage";
import AdminTaskPage from "./pages/AdminTaskPage";
import StaffPortal from "./pages/StaffPortal"; // ✅ Fixed: was missing

function App() {
  useEffect(() => {
    socket.connect();
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <BrowserRouter>
        <Routes>
          {/* ── Public routes ── */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/visitorpage" element={<VisitorPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/visitor" element={<VisitorRegistration />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/jobform" element={<JobRegistorForm />} />
          <Route path="/EnquiryCalls" element={<EnquiryCalls />} />
          <Route path="/trends" element={<Trends />} />

          {/* ── Staff portal (public — staff login handled inside) ── */}
          {/* ✅ Fixed: changed from /staff to /staff-portal to avoid conflict with admin StaffPage */}
          <Route path="/staff-portal" element={<StaffPortal />} />

          {/* ── Admin task routes ── */}
          <Route path="/admin/tasks" element={<AdminTaskPage />} />

          {/* ── Protected: Admin ── */}
          <Route path="/enquiry" element={<ProtectedRoute role="admin"><Enquiry /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute role="admin"><ReportsLanding /></ProtectedRoute>} />
          <Route path="/reports/login" element={<ProtectedRoute role="admin"><UserLoginReportPage /></ProtectedRoute>} />
          <Route path="/reports/calls" element={<ProtectedRoute role="admin"><UserCallReportPage /></ProtectedRoute>} />
          <Route path="/reports/activity" element={<ProtectedRoute role="admin"><PlaceholderReport title="User Activity Report" /></ProtectedRoute>} />
          <Route path="/reports/followup" element={<ProtectedRoute role="admin"><PlaceholderReport title="Follow-Up Report" /></ProtectedRoute>} />
          <Route path="/reports/user" element={<ProtectedRoute role="admin"><UserStageReportPage /></ProtectedRoute>} />
          <Route path="/reports/tasks" element={<ProtectedRoute role="admin"><UserTaskReportPage /></ProtectedRoute>} />
          <Route path="/callcenter" element={<ProtectedRoute role="admin"><CallCenter /></ProtectedRoute>} />

          {/* ✅ Fixed: /staff is kept for admin's HR Staff page */}
          <Route path="/staff" element={<ProtectedRoute role="admin"><StaffPage /></ProtectedRoute>} />

          <Route path="/ex-employees" element={<ProtectedRoute role="admin"><ExEmployeePage /></ProtectedRoute>} />
          <Route path="/whatsapp-leads" element={<ProtectedRoute role="admin"><WhatsAppLeads /></ProtectedRoute>} />
          <Route path="/recruiter" element={<ProtectedRoute role="admin"><Recruiter /></ProtectedRoute>} />
          <Route path="/recruiters" element={<ProtectedRoute role="admin"><Recruiters /></ProtectedRoute>} />
          <Route path="/recruiters/selected" element={<ProtectedRoute role="admin"><RecruitersSelected /></ProtectedRoute>} />
          <Route path="/recruiters/rejected" element={<ProtectedRoute role="admin"><RecruitersRejected /></ProtectedRoute>} />
          <Route path="/recruiters/candidates" element={<ProtectedRoute role="admin"><RecruiterCandidates /></ProtectedRoute>} />
          <Route path="/recruiters/hr" element={<ProtectedRoute role="admin"><RecruiterHrPage /></ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute role="admin"><TaskManagement /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute role="admin"><Admin /></ProtectedRoute>} />

          {/* ── Protected: Other roles ── */}
          <Route path="/manager" element={<ProtectedRoute role="manager"><Manager /></ProtectedRoute>} />
          <Route path="/user" element={<ProtectedRoute role="user"><User /></ProtectedRoute>} />
          <Route path="/telecaller" element={<ProtectedRoute role="telecaller"><TelecallerPage /></ProtectedRoute>} />
          <Route path="/telecaller/enquiry" element={<ProtectedRoute role="telecaller"><EnquiryWithLeadForm /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;