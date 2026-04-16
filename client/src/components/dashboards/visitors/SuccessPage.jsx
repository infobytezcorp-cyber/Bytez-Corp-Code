import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

export default function SuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { name, entryTime } = location.state || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-emerald-500" />
        </div>

        <h2 className="text-2xl font-bold text-slate-800 mb-2">You're Checked In!</h2>
        <p className="text-slate-500 mb-6 text-sm">Your registration has been submitted successfully.</p>

        <div className="bg-slate-50 rounded-2xl p-5 text-left space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Name</span>
            <span className="font-medium text-slate-800">{name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Entry Time</span>
            <span className="font-medium text-slate-800">
              {entryTime ? new Date(entryTime).toLocaleString() : ""}
            </span>
          </div>
        </div>

        <button
          onClick={() => navigate("/jobform")}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-blue-200"
        >
          New Entry
        </button>
      </div>
    </div>
  );
}