import { useState } from "react";
import axios from "axios";
import { User, Mail, Lock, Phone, Shield, ChevronRight, X } from "lucide-react";

export default function Register({ onClose }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "user",
  });

  const [loading, setLoading] = useState(false);

  const register = async () => {
    if (!form.name || !form.email || !form.password || !form.phone) {
      alert("All fields required");
      return;
    }

    try {
      setLoading(true);
      await axios.post("http://localhost:8000/api/auth/register", form);
      alert("User created successfully ✅");
      onClose && onClose();
    } catch (err) {
      alert(err.response?.data || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-200 p-6">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Create New User</h2>
          <p className="text-sm text-slate-400 mt-0.5">Add a new user to the system</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <X size={15} className="text-slate-500" />
          </button>
        )}
      </div>

      {/* Fields */}
      <div className="space-y-4">

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1.5">Full Name</label>
          <div className="relative">
            <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter name"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1.5">Email</label>
          <div className="relative">
            <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter email"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1.5">Password</label>
          <div className="relative">
            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="password"
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter password"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1.5">Phone</label>
          <div className="relative">
            <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="+91XXXXXXXXXX"
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1.5">Role</label>
          <div className="relative">
            <Shield size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white"
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="user">User</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

      </div>

      {/* Buttons */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-all"
        >
          Cancel
        </button>
        <button
          onClick={register}
          disabled={loading}
          className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Creating...
            </>
          ) : (
            <>
              Create User
              <ChevronRight size={15} />
            </>
          )}
        </button>
      </div>

    </div>
  );
}