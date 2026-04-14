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
// import VisitorRegistration from "./components/dashboards/VisitorRegistration";
import Enquiry from "./pages/Enquiry";


function App() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />


      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/visitor" element={<VisitorRegistration />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/jobform" element={<JobRegistorForm />} />
          <Route
            path="/enquiry"
            element={
              <ProtectedRoute role="admin">
                <Enquiry />
              </ProtectedRoute>
            }
          />
          <Route
            path="/enquiry"
            element={
              <ProtectedRoute role="admin">
                <Enquiry />
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
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;