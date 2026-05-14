// src/pages/StaffLoginPage.jsx
// Shown inside StaffPortal.jsx when no session exists.
// Login: Employee ID + last 6 digits of registered mobile number

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setStaffSession } from "../features/taskSlice";
import { HR_DEPT_CONFIG, fetchEmployees } from "../features/hrSlice";

export default function StaffLoginPage() {
  const dispatch = useDispatch();
  // ✅ Load HR employee roster when staff portal opens
  const employees = useSelector((s) => s.hr.employees) || [];
  const loadingEmployees = useSelector((s) => s.hr.loading);

  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  const normalizeId = (value) =>
    String(value || "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

  const findEmployeeById = (value) => {
    const normalized = normalizeId(value);
    return employees.find((e) => {
      const idValue = normalizeId(e.id);
      return (
        idValue === normalized ||
        idValue.endsWith(normalized) ||
        normalized.endsWith(idValue)
      );
    });
  };

  const [empId, setEmpId] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState("");

  // Live name hint as ID is typed
  const handleIdChange = (val) => {
    setEmpId(val);
    setError("");
    const emp = findEmployeeById(val);
    setHint(emp ? `👤 ${emp.name} · ${emp.role}` : "");
  };

  const handleLogin = async () => {
    setError("");
    if (!empId.trim() || !password.trim()) {
      setError("Please enter both Employee ID and password.");
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 600)); // Realistic delay

    const emp = findEmployeeById(empId);

    if (!emp) {
      setError("Employee ID not found. Please check and try again.");
      setLoading(false);
      return;
    }

    // Password = last 6 digits of mobile number (digits only)
    const mobile = String(emp.mobile || "").replace(/\D/g, "");
    const correctPwd = mobile.slice(-6);

    if (!correctPwd) {
      setError("No mobile number registered. Contact HR admin.");
      setLoading(false);
      return;
    }

    if (password !== correctPwd) {
      setError("Incorrect password. Use the last 6 digits of your registered mobile.");
      setLoading(false);
      return;
    }

    dispatch(
      setStaffSession({
        empId: emp.id,
        empName: emp.name,
        empDept: emp.dept,
        empRole: emp.role,
        empMobile: emp.mobile,
        loginTime: new Date().toISOString(),
      })
    );
    setLoading(false);
  };
  const validateLogin = (empId, enteredPassword) => {
  const employee = employees.find(e => e.id === empId);
  if (employee) {
    // Strip non-digits and get last 6
    const validPass = String(employee.mobile).replace(/\D/g, "").slice(-6);
    return enteredPassword === validPass;
  }
  return false;
};

  const deptEntries = Object.entries(HR_DEPT_CONFIG).slice(0, 5);

  return (
    <div className="min-h-screen flex">
      {/* ── Left Brand Panel ─────────────────────────────────────────────────── */}
      <div className="hidden lg:flex w-2/5 bg-[#0f1e35] flex-col justify-between p-10">
        <div>
          <div className="flex items-center gap-3 mb-14">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center font-black text-white text-lg">
              H
            </div>
            <span className="text-white font-bold text-xl">HR Portal</span>
          </div>

          <h2 className="text-4xl font-black text-white leading-tight mb-4">
            Your Tasks.
            <br />
            <span className="text-blue-400">Your Day.</span>
          </h2>
          <p className="text-white/50 text-sm leading-relaxed max-w-xs">
            Sign in to view tasks assigned by admin, upload proof documents, and
            update your progress — refreshed every hour.
          </p>

          {/* Feature list */}
          <div className="mt-8 space-y-3">
            {[
              { icon: "📋", text: "View your assigned tasks" },
              { icon: "✅", text: "Update task status in real-time" },
              { icon: "📎", text: "Upload documents & images as proof" },
              { icon: "🔄", text: "Auto-refreshes every 1 hour" },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-3 text-white/70 text-sm">
                <span>{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-white/30 text-xs font-semibold uppercase tracking-widest mb-3">
            Departments
          </p>
          <div className="flex flex-wrap gap-2">
            {deptEntries.map(([key, cfg]) => (
              <span
                key={key}
                className="text-xs px-3 py-1.5 rounded-full font-semibold text-white/80"
                style={{
                  backgroundColor: cfg.color + "40",
                  border: `1px solid ${cfg.color}60`,
                }}
              >
                {cfg.icon} {cfg.label}
              </span>
            ))}
          </div>
          <p className="text-white/20 text-xs mt-8">
            © {new Date().getFullYear()} HR Management System
          </p>
        </div>
      </div>

      {/* ── Right Login Panel ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black text-white">
              H
            </div>
            <span className="text-gray-900 font-bold text-lg">HR Portal</span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h1 className="text-2xl font-black text-gray-900 mb-1">Staff Sign In</h1>
            <p className="text-sm text-gray-500 mb-7">
              Access your assigned tasks and work dashboard
            </p>

            <div className="space-y-5">
              {/* Employee ID */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Employee ID
                </label>
                <input
                  type="text"
                  value={empId}
                  onChange={(e) => handleIdChange(e.target.value)}
                  placeholder="e.g. HC001, CL012"
                  autoCapitalize="characters"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition"
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
                {hint && (
                  <p className="text-xs text-green-600 font-semibold mt-1.5">{hint}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    placeholder="Last 6 digits of your mobile"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition pr-12"
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPwd ? "🙈" : "👁"}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1.5">
                  Default password: last 6 digits of your registered mobile
                  <br />
                  <span className="text-gray-500">
                    Example: +91 9876543210 → password is{" "}
                    <code className="bg-gray-100 px-1 rounded">543210</code>
                  </span>
                </p>
              </div>

              {/* Error message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 flex items-start gap-2">
                  <span className="mt-0.5">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleLogin}
                disabled={loading || loadingEmployees}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3.5 rounded-xl transition text-sm flex items-center justify-center gap-2"
              >
                {loading || loadingEmployees ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {loadingEmployees ? "Loading staff..." : "Signing in..."}
                  </>
                ) : (
                  "Sign In →"
                )}
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            {loadingEmployees ? "Loading employee list..." : "Forgot your credentials? Contact your HR admin."}
          </p>

          {/* Dev hint: show staff count */}
          {employees.length > 0 && (
            <p className="text-center text-xs text-gray-300 mt-2">
              {employees.length} staff members registered in HR module
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
