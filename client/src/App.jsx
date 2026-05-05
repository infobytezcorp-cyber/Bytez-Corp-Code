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
import CallCenter from "./pages/CallCenter";
import StaffPage from "./pages/StaffPage";
import ExEmployeePage from "./pages/ExEmployeePage";
import WhatsAppLeads from "./pages/WhatsAppLeads";
import TaskManagement from "./pages/TaskManagement";
// import VisitorRegistration from "./components/dashboards/VisitorRegistration";
// import Enquiry from "./pages/Enquiry";
import ModulesPage from "./pages/ModulesPage";
import VisitorPage from "./pages/VisitorPage";


// import VisitorRegistration from "./components/dashboards/VisitorRegistration";
// import Enquiry from "./pages/Enquiry";
// import ModulesPage from "./pages/ModulesPage";
// import VisitorPage from "./pages/VisitorPage";
import EnquiryCalls from "./pages/EnquiryCalls";
import TelecallerPage from "./pages/TelecallerPage";
import socket from "./services/socket";
import { useEffect } from "react";



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
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/visitorpage" element={<VisitorPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/visitor" element={<VisitorRegistration />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/jobform" element={<JobRegistorForm />} />
          <Route path="/EnquiryCalls" element={<EnquiryCalls />} />

          <Route
            path="/enquiry"
            element={
              <ProtectedRoute role="admin">
                <Enquiry />
              </ProtectedRoute>
            }
          />
          <Route
            path="/callcenter"
            element={
              <ProtectedRoute role="admin">
                <CallCenter />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff"
            element={
              <ProtectedRoute role="admin">
                <StaffPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ex-employees"
            element={
              <ProtectedRoute role="admin">
                <ExEmployeePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/whatsapp-leads"
            element={
              <ProtectedRoute role="admin">
                <WhatsAppLeads />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute role="admin">
                <TaskManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager"
            element={
              <ProtectedRoute role="manager">
                <Manager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user"
            element={
              <ProtectedRoute role="user">
                <User />
              </ProtectedRoute>
            }
          />
          <Route
            path="/telecaller"
            element={
              <ProtectedRoute role="telecaller">
                <TelecallerPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;