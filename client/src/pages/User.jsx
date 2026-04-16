import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { logout } from "../utils/auth";

export default function User() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Layout>
      <div className="p-6 bg-gray-100 min-h-screen">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            User Dashboard
          </h1>

          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow"
          >
            Logout
          </button>
        </div>

        {/* CARD */}
        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Welcome 👋
          </h2>

          <p className="text-gray-600 mb-6">
            You are logged in successfully. This is your user panel.
          </p>

          {/* STATS / INFO */}
          <div className="grid grid-cols-2 gap-4">

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Role</p>
              <p className="text-lg font-semibold text-blue-600">
                User
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Status</p>
              <p className="text-lg font-semibold text-green-600">
                Active
              </p>
            </div>

          </div>

        </div>

      </div>
    </Layout>
  );
}