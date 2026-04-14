import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { showToast } from "../../../utils/toast";
import { User, Phone, FileText, ChevronRight, Building2, CheckCircle, KeyRound } from "lucide-react";

const PURPOSES = [
  "Consultation",
  "Follow-up",
  "Lab test",
  "Pharmacy",
  "Surgery prep",
  "Emergency",
  "Other",
];

export default function VisitorRegistration() {
  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_URL;
  axios.defaults.headers.common['ngrok-skip-browser-warning'] = 'true';

  const [form, setForm] = useState({
    name: "",
    phone: "",
    purpose: "",
  });

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!/^\d{10}$/.test(form.phone))
      e.phone = "Enter a valid 10-digit number";
    if (!form.purpose) e.purpose = "Select a purpose";
    return Object.keys(e).length === 0;
  };

  const sendOtp = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await axios.post(`${API}/api/otp/send-otp`, { phone: form.phone });
      showToast("OTP sent successfully ✅");
      setStep(2);
    } catch (err) {
      showToast("Failed to send OTP ❌");
    } finally {
      setLoading(false);
    }
  };

  const verifyAndSubmit = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/otp/verify-otp`, {
        phone: form.phone,
        otp,
      });
      if (res.data.success) {
        const save = await axios.post(`${API}/api/visitor`, form);
        navigate("/success", {
          state: {
            name: form.name,
            entryTime: save.data.checkInTime,
          },
        });
      } else {
        showToast("Invalid OTP ❌");
      }
    } catch (err) {
      showToast("Verification failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex">

        {/* Side Panel */}
        <div className="hidden lg:flex flex-col justify-between w-80 bg-gradient-to-br from-blue-700 to-slate-800 p-10">
          <div>
            <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-8">
              <Building2 size={24} className="text-white" />
            </div>
            <div className="bg-white/10 rounded-2xl p-5 backdrop-blur-sm">
              <User size={28} className="text-white mb-3" />
              <h2 className="text-white font-bold text-xl mb-2">
                {step === 1 ? "Visitor Check-In" : "OTP Verification"}
              </h2>
              <p className="text-white/80 text-sm leading-relaxed">
                {step === 1
                  ? "Register your visit quickly and securely with our digital check-in system."
                  : "Enter the 6-digit OTP sent to your registered mobile number."}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { icon: CheckCircle, text: "Secure & private data" },
              { icon: CheckCircle, text: "Instant confirmation" },
              { icon: CheckCircle, text: "Fast check-in process" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-white/80 text-sm">
                <Icon size={16} className="text-white/60 shrink-0" />
                {text}
              </div>
            ))}
            <div className="pt-4 border-t border-white/20">
              <p className="text-white/50 text-xs">Powered by secure cloud infrastructure</p>
            </div>
          </div>
        </div>

        {/* Form Panel */}
        <div className="flex-1 p-8 lg:p-12 overflow-y-auto max-h-screen">
          <div className="mb-8">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-1">Welcome</p>
            <h1 className="text-3xl font-bold text-slate-800">Visitor Registration</h1>
            <p className="text-slate-500 mt-1">
              {step === 1 ? "Fill in the details below to complete your check-in" : "Enter the OTP sent to your phone"}
            </p>
          </div>

          <div className="space-y-6">

            {/* STEP 1 — FORM */}
            {step === 1 && (
              <div className="rounded-2xl p-5 space-y-4 bg-slate-50 border border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Personal Information</h3>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter your name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="tel"
                      maxLength={10}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="10-digit number"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                </div>

                {/* Purpose */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Purpose <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FileText size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <select
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
                      value={form.purpose}
                      onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                    >
                      <option value="">Select purpose</option>
                      {PURPOSES.map((p) => (
                        <option key={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2 — OTP */}
            {step === 2 && (
              <div className="rounded-2xl p-5 space-y-4 bg-slate-50 border border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">OTP Verification</h3>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Enter OTP <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={step === 1 ? sendOtp : verifyAndSubmit}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-0.5 active:translate-y-0 text-base"
            >
              {loading ? (
                <>
                  <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  {step === 1 ? "Send OTP" : "Verify & Register"}
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}